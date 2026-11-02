/**
 * Converte a mesa salva em `riichi-manager-centerpiece` (formato até a 5.8) na
 * primeira partida em andamento. Puro: quem chama passa como achar o id de cada nome.
 */
import { alterarConfig, configDoPreset, type ConfigMesa } from './configMesa'
import {
  CADEIRAS,
  ORDEM_VENTOS,
  porCadeira,
  type Cadeira,
  type EventoPartida,
  type Partida,
  type Placar,
  type Vento,
} from './partida'
import { vezInicial } from './vez'

interface JogadorAntigo {
  nome: string
  pontos: number
  vento: Vento
  riichi?: boolean
}

interface FotoAntiga {
  jogadores: JogadorAntigo[]
  rodadaVento: Vento
  rodadaNumero: 1 | 2 | 3 | 4
  honba: number
  riichiSticks: number
}

interface MesaAntiga extends FotoAntiga {
  iniciada?: boolean
  pontosIniciais?: number
  historico?: (FotoAntiga & { descricao?: string })[]
}

function jogadoresValidos(jogadores: unknown): jogadores is JogadorAntigo[] {
  if (!Array.isArray(jogadores) || jogadores.length !== 4) return false
  const ventos = new Set(jogadores.map((jogador) => (jogador as JogadorAntigo).vento))
  return (
    ORDEM_VENTOS.every((vento) => ventos.has(vento)) &&
    jogadores.every(
      (jogador) =>
        typeof (jogador as JogadorAntigo).nome === 'string' &&
        Number.isFinite((jogador as JogadorAntigo).pontos),
    )
  )
}

function placarDaFoto(foto: FotoAntiga, cadeiraDoNome: Map<string, Cadeira>): Placar {
  const pontos = porCadeira(() => 0)
  const riichi: Cadeira[] = []
  let cadeiraDealer: Cadeira = 0
  for (const jogador of foto.jogadores) {
    const cadeira = cadeiraDoNome.get(jogador.nome) ?? 0
    pontos[cadeira] = jogador.pontos
    if (jogador.riichi) riichi.push(cadeira)
    if (jogador.vento === 'leste') cadeiraDealer = cadeira
  }
  return {
    pontos,
    cadeiraDealer,
    rodadaVento: foto.rodadaVento,
    rodadaNumero: foto.rodadaNumero,
    honba: foto.honba,
    palitos: foto.riichiSticks,
    riichi,
  }
}

/** A mesa antiga jogava sem fim marcado: segue em Hanchan, para não acabar no Leste 4. */
function configDaMesa(pontosIniciais: number | undefined): ConfigMesa {
  const padrao = configDoPreset('padrao')
  return alterarConfig(padrao, {
    tipoPartida: 'hanchan',
    timerVez: 30,
    pontosPartida: pontosIniciais || padrao.pontosPartida,
  })
}

export function migrarMesaAntiga(
  textoSalvo: string | null,
  idDoNome: (nomes: string[]) => string[],
  contexto: { gerarId: () => string; agora: string },
): Partida | null {
  if (!textoSalvo) return null
  let mesa: MesaAntiga
  try {
    mesa = JSON.parse(textoSalvo) as MesaAntiga
  } catch {
    return null
  }
  if (!mesa.iniciada || !jogadoresValidos(mesa.jogadores)) return null

  // A cadeira segue o vento na hora da migração: o dealer fica embaixo.
  const ordem = [...mesa.jogadores].sort(
    (um, outro) => ORDEM_VENTOS.indexOf(um.vento) - ORDEM_VENTOS.indexOf(outro.vento),
  )
  const ids = idDoNome(ordem.map((jogador) => jogador.nome))
  const cadeiraDoNome = new Map<string, Cadeira>(
    ordem.map((jogador, indice) => [jogador.nome, indice as Cadeira]),
  )

  const config = configDaMesa(mesa.pontosIniciais)
  const placar = placarDaFoto(mesa, cadeiraDoNome)

  // O histórico antigo guarda fotos, da mais nova para a mais antiga.
  const fotos = (mesa.historico ?? []).filter((foto) => jogadoresValidos(foto.jogadores)).reverse()
  const placares = [...fotos.map((foto) => placarDaFoto(foto, cadeiraDoNome)), placar]
  const eventos: EventoPartida[] = fotos.map((foto, indice) => ({
    id: contexto.gerarId(),
    em: contexto.agora,
    tipo: 'legado',
    rodada: { vento: foto.rodadaVento, numero: foto.rodadaNumero, honba: foto.honba },
    variacao: porCadeira((cadeira) => placares[indice + 1].pontos[cadeira] - placares[indice].pontos[cadeira]),
    placarAntes: placares[indice],
  }))

  return {
    id: contexto.gerarId(),
    config,
    assentos: porCadeira((cadeira) => ({
      jogadorId: ids[cadeira],
      ventoInicial: ordem[cadeira].vento,
    })),
    placar,
    eventos,
    vez: vezInicial(placar.cadeiraDealer, config.timerVez),
    status: 'em_andamento',
    criadaEm: contexto.agora,
  }
}

/** Soma dos pontos, para conferir que a migração não perdeu nada. */
export function somaPontos(placar: Placar) {
  return CADEIRAS.reduce<number>((soma, cadeira) => soma + placar.pontos[cadeira], 0)
}
