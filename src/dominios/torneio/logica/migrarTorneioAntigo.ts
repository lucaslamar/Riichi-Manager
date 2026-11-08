/**
 * Torneios salvos antes deste domínio:
 * - `riichi-manager-v5` (o Torneio original): só nomes e pontos digitados por mesa
 * - `riichi-manager-torneios` versão 1 (o Torneio integrado de 5.x): grade com ids
 * Os dois viram Rodízio. Os nomes viram jogadores do cadastro sem duplicar.
 */
import { alterarConfig, normalizarConfig } from '@/dominios/centerpiece/logica/configMesa'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { criarPartidaManual } from '@/dominios/centerpiece/logica/partidaManual'
import { umaFixa } from '@/dominios/centerpiece/logica/uma'
import { configPadraoTorneio, dataDoDia, SEGUNDOS_RODADA_PADRAO } from './torneio'
import type { AssentosMesa, RodadaTorneio, Torneio } from './tipos'

const VENTOS_ANTIGOS = ['Leste', 'Sul', 'Oeste', 'Norte'] as const

interface AssentoAntigo {
  vento?: string
  jogador?: string
}
interface RodadaAntiga {
  mesas?: { assentos?: AssentoAntigo[] }[]
}

interface ContextoMigracao {
  idDoNome: (nomes: string[]) => string[]
  gerarId: () => string
  agora: Date
}

/** Assentos antigos em qualquer ordem → 東 南 西 北. */
function assentosNaOrdem(assentos: AssentoAntigo[] | undefined, trocar: (jogador: string) => string) {
  const lista = assentos ?? []
  return VENTOS_ANTIGOS.map((vento) => trocar(lista.find((item) => item.vento === vento)?.jogador ?? '')) as AssentosMesa
}

function rodadasDaGrade(grade: RodadaAntiga[], trocar: (jogador: string) => string, agora: string): RodadaTorneio[] {
  return grade.map((rodada, indiceRodada) => ({
    numero: indiceRodada + 1,
    geradaEm: agora,
    mesas: (rodada.mesas ?? []).map((mesa, indiceMesa) => ({
      numero: indiceMesa + 1,
      assentos: assentosNaOrdem(mesa.assentos, trocar),
    })),
  }))
}

const lerPontos = (texto: string) => Number.parseInt(String(texto).replace(/[.,\s]/g, ''), 10) || 0

function base(contexto: ContextoMigracao, criadoEm: string): Omit<Torneio, 'jogadorIds' | 'rodadas' | 'status' | 'config'> {
  const agora = contexto.agora.toISOString()
  return {
    id: contexto.gerarId(),
    nome: 'Torneio',
    data: dataDoDia(new Date(criadoEm)),
    formato: { tipo: 'rodizio', rodadas: 4 },
    timers: { rodadaSegundos: SEGUNDOS_RODADA_PADRAO, porMesa: false },
    criadoEm,
    atualizadoEm: agora,
  }
}

/** O Torneio original: pontos digitados por mesa viram partidas registradas no fim. */
export function migrarTorneioV5(
  textoSalvo: string | null,
  contexto: ContextoMigracao,
): { torneio: Torneio; partidas: Partida[] } | null {
  if (!textoSalvo) return null
  let antigo: {
    jogadores?: string[]
    grade?: RodadaAntiga[]
    mesasConcluidas?: Record<string, boolean>
    pontuacoesPorMesa?: Record<string, string[]>
    timer?: { totalSegundos?: number }
  }
  try {
    antigo = JSON.parse(textoSalvo)
  } catch {
    return null
  }
  const nomes = antigo.jogadores
  if (!Array.isArray(nomes) || nomes.length === 0 || !Array.isArray(antigo.grade) || antigo.grade.length === 0) {
    return null
  }

  const agora = contexto.agora.toISOString()
  const ids = contexto.idDoNome(nomes)
  const idDoNome = new Map(nomes.map((nome, indice) => [nome, ids[indice]]))
  const nomeDoId = new Map(ids.map((id, indice) => [id, nomes[indice]]))
  const rodadas = rodadasDaGrade(antigo.grade, (nome) => idDoNome.get(nome) ?? nome, agora)
  // O Torneio original contava com 30.000 e uma 8/4 fixas.
  const config = alterarConfig(configPadraoTorneio(), { uma: umaFixa([8, 4, -4, -8]) })

  const partidas: Partida[] = []
  let concluidas = 0
  let total = 0
  antigo.grade.forEach((rodadaAntiga, indiceRodada) => {
    ;(rodadaAntiga.mesas ?? []).forEach((mesaAntiga, indiceMesa) => {
      total += 1
      const chave = `${indiceRodada}_${indiceMesa}`
      const salvos = antigo.pontuacoesPorMesa?.[chave]
      if (!antigo.mesasConcluidas?.[chave] || salvos?.length !== 4) return
      concluidas += 1
      // Os pontos antigos seguem a ordem salva dos assentos; a partida usa a dos ventos.
      const pontos = VENTOS_ANTIGOS.map((vento) => {
        const indice = (mesaAntiga.assentos ?? []).findIndex((item) => item.vento === vento)
        return lerPontos(salvos[indice] ?? '0')
      }) as [number, number, number, number]
      const assentos = rodadas[indiceRodada].mesas[indiceMesa].assentos
      partidas.push({
        ...criarPartidaManual(
          contexto.gerarId(),
          config,
          {
            jogadorIds: assentos,
            nomes: assentos.map((id) => nomeDoId.get(id) ?? ''),
            pontos,
            pontosPartida: config.pontosPartida,
            pontosRetorno: config.pontosRetorno,
            uma: config.uma,
          },
          agora,
        ),
        vinculoTorneio: { torneioId: '', rodada: indiceRodada, mesa: indiceMesa, guardada: true },
      })
    })
  })

  const torneio: Torneio = {
    ...base(contexto, agora),
    timers: { rodadaSegundos: antigo.timer?.totalSegundos || SEGUNDOS_RODADA_PADRAO, porMesa: false },
    formato: { tipo: 'rodizio', rodadas: rodadas.length },
    config,
    jogadorIds: ids,
    rodadas,
    status: concluidas === total ? 'finalizado' : 'em_andamento',
    ...(concluidas === total ? { finalizadoEm: agora } : {}),
  }
  return {
    torneio,
    partidas: partidas.map((partida) => ({
      ...partida,
      vinculoTorneio: { ...partida.vinculoTorneio!, torneioId: torneio.id },
    })),
  }
}

interface TorneioV1 {
  id?: string
  criadoEm?: string
  status?: string
  config?: unknown
  jogadorIds?: string[]
  grade?: RodadaAntiga[]
  timer?: { totalSegundos?: number }
}

/**
 * Torneios da 5.x: as partidas deles já estão no Centerpiece com o mesmo id e
 * índices, então só a grade muda de forma.
 */
export function migrarTorneiosV1(lista: unknown, contexto: Omit<ContextoMigracao, 'idDoNome'>): Torneio[] {
  if (!Array.isArray(lista)) return []
  return (lista as TorneioV1[])
    .filter((antigo) => antigo.id && Array.isArray(antigo.grade) && Array.isArray(antigo.jogadorIds))
    .map((antigo) => {
      const criadoEm = antigo.criadoEm ?? contexto.agora.toISOString()
      const finalizado = antigo.status === 'encerrado'
      const rodadas = rodadasDaGrade(antigo.grade!, (id) => id, criadoEm)
      return {
        ...base({ ...contexto, idDoNome: () => [] }, criadoEm),
        id: antigo.id!,
        formato: { tipo: 'rodizio' as const, rodadas: rodadas.length },
        timers: { rodadaSegundos: antigo.timer?.totalSegundos || SEGUNDOS_RODADA_PADRAO, porMesa: false },
        config: normalizarConfig(antigo.config),
        jogadorIds: antigo.jogadorIds!,
        rodadas,
        status: finalizado ? ('finalizado' as const) : ('em_andamento' as const),
        ...(finalizado ? { finalizadoEm: criadoEm } : {}),
      }
    })
}

