/**
 * Dados de teste para desenvolvimento: jogadores com nomes reais, partidas
 * avulsas, torneios, uma temporada e encontros do clube. Só a tela em modo dev
 * usa isto. Tudo tem o prefixo `teste-` no id, para apagar sem tocar no resto.
 *
 * Torneios e clube passam pelas mesmas funções do app (sorteio inicial, próxima
 * rodada, finalizar, sorteio das mesas), para os dados ficarem num estado que o
 * app produziria. Os pontos saem de uma semente fixa; os sorteios de mesa do
 * torneio usam o aleatório do próprio app e mudam a cada geração.
 */
import type { Jogador } from '@/dominios/jogadores/logica/jogadores'
import { rodadasIniciais, proximaRodada } from '@/dominios/torneio/logica/formatos'
import { partidaDaMesaNova } from '@/dominios/torneio/logica/mesas'
import { criarTemporada, novoEncontro } from '@/dominios/torneio/logica/temporada'
import {
  criarRascunho,
  finalizarTorneio,
  formatoPadrao,
  iniciarTorneio,
  partidaDaMesa,
} from '@/dominios/torneio/logica/torneio'
import type { ConfigFormato, Temporada, Torneio } from '@/dominios/torneio/logica/tipos'
import { alterarConfig, configDoPreset, type ConfigMesa } from './configMesa'
import type { EncontroClube, MesaDoSorteio, SorteioClube } from './encontroClube'
import type { EntradaLista } from './listaClube'
import { criarPartida, type Partida } from './partida'
import { criarPartidaManual } from './partidaManual'
import { sortearMesas } from './sorteioClube'
import { umaFixa } from './uma'

export const PREFIXO_TESTE = 'teste-'
const DIA = 86_400_000

const PESSOAS: readonly { nome: string; apelido?: string; forca: number }[] = [
  { nome: 'Ana Carolina Souza', apelido: 'Carol', forca: 1.4 },
  { nome: 'Bruno Henrique Lima', apelido: 'Brunão', forca: 1.1 },
  { nome: 'Camila Ferreira', forca: 1.0 },
  { nome: 'Diego Nakamura', apelido: 'Naka', forca: 1.5 },
  { nome: 'Eduardo Martins', apelido: 'Dudu', forca: 0.8 },
  { nome: 'Fernanda Oliveira', apelido: 'Fê', forca: 1.2 },
  { nome: 'Gabriel Tanaka', apelido: 'Gabi', forca: 0.9 },
  { nome: 'Helena Rocha', forca: 1.0 },
  { nome: 'Igor Santos', apelido: 'Igor', forca: 0.7 },
  { nome: 'Juliana Yamamoto', apelido: 'Ju', forca: 1.3 },
  { nome: 'Lucas Pereira', apelido: 'Luquinha', forca: 0.9 },
  { nome: 'Mariana Costa', apelido: 'Mari', forca: 1.1 },
]

/** Quem joga sem cadastro no Rodízio, para testar convidados. */
const CONVIDADO = { id: 'convidado-teste-1', nome: 'Rafael (visitante)' }

/** Gerador pseudoaleatório com semente (mulberry32). */
function sorteador(semente: number) {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let valor = estado
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1)
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61)
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296
  }
}
type Sortear = () => number

export function gerarJogadoresDeTeste(agora: Date): Jogador[] {
  return PESSOAS.map((pessoa, indice) => ({
    id: `${PREFIXO_TESTE}jogador-${indice + 1}`,
    nome: pessoa.nome,
    ...(pessoa.apelido ? { apelido: pessoa.apelido } : {}),
    criadoEm: agora.toISOString(),
    arquivado: false,
  }))
}

const IDS = PESSOAS.map((_, indice) => `${PREFIXO_TESTE}jogador-${indice + 1}`)
const forcaDe = (id: string) => PESSOAS[IDS.indexOf(id)]?.forca ?? 1
const nomeDe = (id: string) => {
  if (id === CONVIDADO.id) return CONVIDADO.nome
  const pessoa = PESSOAS[IDS.indexOf(id)]
  return pessoa ? (pessoa.apelido ?? pessoa.nome) : '?'
}

/**
 * Pontos finais dos quatro: trocas entre eles, pesadas pela força de cada um,
 * para surgirem rivais e fregueses. A soma continua 4 × pontos iniciais.
 */
function pontosDaMesa(sortear: Sortear, ids: readonly string[], inicial: number, leste: boolean) {
  const inteiro = (maximo: number) => Math.floor(sortear() * maximo)
  const pontos = ids.map(() => inicial)
  const forcas = ids.map(forcaDe)
  const trocas = (leste ? 5 : 10) + inteiro(5)
  for (let troca = 0; troca < trocas; troca += 1) {
    let alvo = sortear() * forcas.reduce((soma, forca) => soma + forca, 0)
    const vencedor = forcas.findIndex((forca) => (alvo -= forca) < 0)
    const perdedor = (vencedor + 1 + inteiro(3)) % 4
    const valor = (10 + inteiro(110)) * 100
    pontos[vencedor] += valor
    pontos[perdedor] -= valor
  }
  return pontos as [number, number, number, number]
}

/** Partida registrada com o resultado, como o Registrar partida finalizada faz. */
function partidaRegistrada(
  sortear: Sortear,
  id: string,
  config: ConfigMesa,
  ids: readonly [string, string, string, string],
  quando: Date,
): Partida {
  return criarPartidaManual(
    id,
    config,
    {
      jogadorIds: ids,
      nomes: ids.map(nomeDe),
      pontos: pontosDaMesa(sortear, ids, config.pontosPartida, config.tipoPartida === 'leste'),
      pontosPartida: config.pontosPartida,
      pontosRetorno: config.pontosRetorno,
      uma: config.uma,
    },
    quando.toISOString(),
  )
}

const CONFIG_AVULSA = alterarConfig(configDoPreset('padrao'), {
  pontosPartida: 25000,
  pontosRetorno: 30000,
  uma: umaFixa([15, 5, -5, -15]),
})

/** Partidas avulsas finalizadas nos últimos ~10 meses, parte "jogada no app". */
export function gerarPartidasDeTeste(agora: Date, quantidade = 80, semente = 2026): Partida[] {
  const sortear = sorteador(semente)
  const inteiro = (maximo: number) => Math.floor(sortear() * maximo)
  return Array.from({ length: quantidade }, (_, indice) => {
    const mesa: string[] = []
    while (mesa.length < 4) {
      const escolhido = IDS[inteiro(IDS.length)]
      if (!mesa.includes(escolhido)) mesa.push(escolhido)
    }
    const leste = sortear() < 0.4
    const quando = new Date(agora.getTime() - inteiro(300) * DIA - inteiro(12) * 3_600_000)
    const partida = partidaRegistrada(
      sortear,
      `${PREFIXO_TESTE}partida-${indice + 1}`,
      alterarConfig(CONFIG_AVULSA, { tipoPartida: leste ? 'leste' : 'hanchan' }),
      mesa as [string, string, string, string],
      quando,
    )
    return sortear() < 0.35 ? { ...partida, registradaManual: false } : partida
  })
}

/**
 * Joga um torneio do sorteio ao fim com as funções do app: registra cada mesa,
 * pede a próxima rodada e, se `finalizar`, encerra. `limiteRodadas` corta os
 * formatos sem fim (pontos corridos e temporada). `parar` deixa a última rodada
 * pela metade: uma mesa registrada, uma aberta no placar e o resto sem começar.
 */
function jogarTorneio(
  sortear: Sortear,
  base: Torneio,
  jogadorIds: string[],
  opcoes: { limiteRodadas: number; parar?: boolean },
) {
  const inicio = new Date(base.criadoEm)
  const iso = inicio.toISOString()
  let torneio = iniciarTorneio(base, jogadorIds, rodadasIniciais(base, jogadorIds, iso), iso)
  const partidas: Partida[] = []
  let minutos = 0

  for (;;) {
    const ultima = torneio.rodadas.length === opcoes.limiteRodadas || (opcoes.parar && torneio.rodadas.length === 2)
    for (const rodada of torneio.rodadas) {
      for (const mesa of rodada.mesas) {
        if (partidaDaMesa(partidas, torneio.id, rodada.numero, mesa.numero)) continue
        const id = `${PREFIXO_TESTE}${torneio.id.slice(PREFIXO_TESTE.length)}-r${rodada.numero}m${mesa.numero}`
        const ehUltimaRodada = rodada.numero === torneio.rodadas.length
        if (opcoes.parar && ehUltimaRodada && ultima && mesa.numero > 1) {
          // Mesa 2 aberta no placar; as demais ainda sem começar.
          if (mesa.numero === 2) {
            partidas.push(
              partidaDaMesaNova(torneio, rodada, mesa, { id, agora: new Date().toISOString(), nomes: mesa.assentos.map(nomeDe) }),
            )
          }
          continue
        }
        minutos += 20
        const quando = new Date(inicio.getTime() + minutos * 60_000)
        partidas.push({
          ...partidaRegistrada(sortear, id, torneio.config, mesa.assentos, quando),
          vinculoTorneio: { torneioId: torneio.id, rodada: rodada.numero - 1, mesa: mesa.numero - 1, guardada: true },
        })
      }
    }
    if (ultima) break
    const proxima = proximaRodada(torneio, partidas, new Date(inicio.getTime() + minutos * 60_000).toISOString())
    if (!proxima) break
    torneio = { ...torneio, rodadas: [...torneio.rodadas, proxima] }
  }

  if (!opcoes.parar) torneio = finalizarTorneio(torneio, new Date(inicio.getTime() + (minutos + 10) * 60_000).toISOString())
  return { torneio, partidas }
}

function rascunho(id: string, nome: string, quando: Date, formato: ConfigFormato): Torneio {
  return { ...criarRascunho({ id: `${PREFIXO_TESTE}${id}`, agora: quando, nome }), formato }
}

/** Torneios encerrados (Rodízio, Suíço e Eliminatório), um Suíço em andamento e uma temporada. */
export function gerarTorneiosDeTeste(agora: Date, semente = 7) {
  const sortear = sorteador(semente)
  const dias = (quantos: number) => {
    const data = new Date(agora.getTime() - quantos * DIA)
    data.setHours(14, 0, 0, 0)
    return data
  }
  const torneios: Torneio[] = []
  const partidas: Partida[] = []
  const guardar = (resultado: { torneio: Torneio; partidas: Partida[] }) => {
    torneios.push(resultado.torneio)
    partidas.push(...resultado.partidas)
  }

  const comConvidado = [...IDS.slice(0, 11), CONVIDADO.id]
  guardar(
    jogarTorneio(
      sortear,
      {
        ...rascunho('torneio-rodizio', 'Copa de Outono', dias(200), formatoPadrao('rodizio')),
        convidados: { [CONVIDADO.id]: CONVIDADO.nome },
      },
      comConvidado,
      { limiteRodadas: 4 },
    ),
  )
  guardar(jogarTorneio(sortear, rascunho('torneio-suico', 'Aberto do Clube', dias(120), formatoPadrao('suico')), IDS, { limiteRodadas: 4 }))
  guardar(
    jogarTorneio(
      sortear,
      rascunho('torneio-eliminatorio', 'Desafio Mata-mata', dias(60), formatoPadrao('eliminatorio')),
      IDS.slice(0, 8),
      { limiteRodadas: 6 },
    ),
  )

  const temporada: Temporada = criarTemporada({
    id: `${PREFIXO_TESTE}temporada`,
    nome: 'Brasileirão 2026',
    inicio: `${agora.getFullYear()}-01-01`,
    fim: `${agora.getFullYear()}-12-31`,
    agora: dias(100).toISOString(),
  })
  ;[90, 55, 20].forEach((antes, indice) => {
    const quando = dias(antes)
    const encontro = novoEncontro(temporada, {
      id: `${PREFIXO_TESTE}temporada-encontro-${indice + 1}`,
      agora: quando,
      nome: `Brasileirão · Etapa ${indice + 1}`,
    })
    // Cada etapa com 8 dos 12, mudando quem falta.
    const presentes = [...IDS.slice(indice * 2), ...IDS.slice(0, indice * 2)].slice(0, 8)
    guardar(jogarTorneio(sortear, encontro, presentes, { limiteRodadas: 2 }))
  })

  // Em andamento: rodada 1 inteira registrada, rodada 2 pela metade.
  guardar(
    jogarTorneio(sortear, rascunho('torneio-andamento', 'Liga de Quinta', dias(0), formatoPadrao('suico')), IDS, {
      limiteRodadas: 4,
      parar: true,
    }),
  )

  return { torneios, temporadas: [temporada], partidas }
}

/**
 * Três encontros do clube já jogados (todas as mesas registradas) e o de hoje
 * como sorteio atual: mesa 1 registrada, mesa 2 aberta no placar, mesa 3 sem
 * começar. Mais uma mesa avulsa aberta.
 */
export function gerarClubeDeTeste(agora: Date, semente = 11) {
  const sortear = sorteador(semente)
  const inteiroComSemente = (limite: number) => Math.floor(sortear() * limite)
  const lista: EntradaLista[] = IDS.map((id) => ({ nome: nomeDe(id), jogadorId: id }))
  const config = configDoPreset('padrao')
  const encontros: EncontroClube[] = []
  const partidas: Partida[] = []
  let sorteio: SorteioClube | null = null

  ;[21, 14, 7, 0].forEach((antes, indice) => {
    const quando = new Date(agora.getTime() - antes * DIA)
    quando.setHours(19, 30, 0, 0)
    const encontro: EncontroClube = {
      id: `${PREFIXO_TESTE}encontro-${indice + 1}`,
      criadoEm: quando.toISOString(),
      jogadores: lista,
    }
    encontros.push(encontro)
    const resultado = sortearMesas(lista, inteiroComSemente)
    if (!resultado.ok) return
    const hoje = antes === 0
    const mesas: MesaDoSorteio[] = resultado.mesas.map((mesa) => {
      const ids = mesa.assentos.map((assento) => assento.jogador.jogadorId ?? '') as [string, string, string, string]
      const id = `${PREFIXO_TESTE}clube-${indice + 1}-mesa-${mesa.numero}`
      const vinculo = { encontro: { id: encontro.id, mesa: mesa.numero } }
      if (hoje && mesa.numero === 2) {
        partidas.push({ ...criarPartida(id, config, ids, agora.toISOString(), ids.map(nomeDe)), ...vinculo })
        return mesa
      }
      if (hoje && mesa.numero > 2) return mesa
      const fim = new Date(quando.getTime() + (60 + mesa.numero * 5) * 60_000)
      partidas.push({ ...partidaRegistrada(sortear, id, config, ids, fim), ...vinculo })
      return { ...mesa, partidaId: id }
    })
    if (hoje) sorteio = { encontro, mesas }
  })

  // Mesa avulsa aberta, fora de encontro.
  const avulsa = [IDS[0], IDS[3], IDS[6], IDS[9]] as [string, string, string, string]
  partidas.push(criarPartida(`${PREFIXO_TESTE}mesa-avulsa`, config, avulsa, agora.toISOString(), avulsa.map(nomeDe)))

  // A lista de presença continua preenchida depois do sorteio, como no app.
  return { encontros, sorteio, partidas, lista: lista.map((entrada) => entrada.nome).join('\n') }
}
