/**
 * Placar de partida MCR: só anota as mãos e soma os pontos. Os jogadores vêm do
 * cadastro único do app; os placares ficam numa tabela própria, separada das
 * partidas do Riichi.
 */
import type { Lance, RegistroMao } from '@/dominios/centerpiece/logica/descartes'
import type { EstadoVez } from '@/dominios/centerpiece/logica/vez'
import { vezInicial } from '@/dominios/centerpiece/logica/vez'
import { calcularPagamentoMcr } from '@/dominios/calculadora-mao-chinesa/logica/pontuacao-mcr'
import { FAN_MINIMO_MCR } from '@/dominios/calculadora-mao-chinesa/logica/fan-mcr'
import type { FormaBatida } from '@/dominios/calculadora-mao-chinesa/logica/tipos'

export type Cadeira = 0 | 1 | 2 | 3
export const CADEIRAS: readonly Cadeira[] = [0, 1, 2, 3]

/** Uma partida completa tem 4 rodadas (Quan) de 4 mãos. */
export const MAOS_POR_RODADA = 4
export const TOTAL_MAOS = 16

export const OPCOES_TIMER_SEGUNDOS = [0, 15, 20, 30, 45, 60] as const
export const TIMER_PADRAO_SEGUNDOS = 30

export type MaoMcr = (
  | { tipo: 'vitoria'; vencedor: Cadeira; forma: FormaBatida; descartador?: Cadeira; fan: number }
  | { tipo: 'empate' }
) & {
  /** Descartes da mão, quando foram registrados na mesa (para o histórico). */
  lances?: Lance[]
}

export interface PlacarMcr {
  id: string
  criadoEm: string
  /** Jogadores nas cadeiras Leste, Sul, Oeste e Norte da primeira mão. */
  jogadorIds: [string, string, string, string]
  maos: MaoMcr[]
  timerSegundos: number
  vez: EstadoVez
  finalizadoEm: string | null
  /** Mesa de um torneio: o id dele e a rodada e a mesa do sorteio, começando em 0. */
  torneio?: { id: string; rodada?: number; mesa?: number }
  /** Falsos Hu: quem errou paga 10 a cada um dos outros três, e a mão continua. */
  falsosHu?: { cadeira: Cadeira; aposMao: number }[]
  /** Descartes e chamadas da mão em jogo (o mesmo registro da mesa do Riichi). Zera a cada mão. */
  registro?: RegistroMao
  /** Nomes dos convidados do torneio (jogam sem cadastro), por id. */
  convidados?: Record<string, string>
}

export function novoPlacar(
  id: string,
  jogadorIds: [string, string, string, string],
  timerSegundos: number,
  agora: string,
): PlacarMcr {
  return {
    id,
    criadoEm: agora,
    jogadorIds,
    maos: [],
    timerSegundos,
    vez: vezInicial(0, timerSegundos),
    finalizadoEm: null,
  }
}

/** O dealer passa a cada mão, vencendo ou não; o vento da rodada muda a cada 4 mãos. */
export function dealerDaMao(indiceMao: number): Cadeira {
  return (indiceMao % MAOS_POR_RODADA) as Cadeira
}

export function ventoDaRodada(indiceMao: number): Cadeira {
  return Math.min(3, Math.floor(indiceMao / MAOS_POR_RODADA)) as Cadeira
}

export type ErroMaoMcr = 'fanMinimo' | 'semDescartador' | 'descartadorVencedor'

export function validarMao(mao: MaoMcr): ErroMaoMcr | null {
  if (mao.tipo === 'empate') return null
  if (!Number.isInteger(mao.fan) || mao.fan < FAN_MINIMO_MCR) return 'fanMinimo'
  if (mao.forma === 'ron' && mao.descartador === undefined) return 'semDescartador'
  if (mao.forma === 'ron' && mao.descartador === mao.vencedor) return 'descartadorVencedor'
  return null
}

/** Quanto cada cadeira ganha ou perde numa mão, pela fórmula de pagamento do MCR. Mão inválida não pontua. */
export function pontosDaMao(mao: MaoMcr): [number, number, number, number] {
  const pontos: [number, number, number, number] = [0, 0, 0, 0]
  if (mao.tipo === 'empate' || validarMao(mao)) return pontos
  const { ganhadorRecebe, pagamentos } = calcularPagamentoMcr(mao.fan, mao.forma)
  const perdedores = CADEIRAS.filter((cadeira) => cadeira !== mao.vencedor)
  if (mao.forma === 'tsumo') {
    perdedores.forEach((cadeira, i) => (pontos[cadeira] = -pagamentos[i].valor))
  } else {
    const outros = perdedores.filter((cadeira) => cadeira !== mao.descartador)
    pontos[mao.descartador!] = -pagamentos[0].valor
    outros.forEach((cadeira, i) => (pontos[cadeira] = -pagamentos[i + 1].valor))
  }
  pontos[mao.vencedor] = ganhadorRecebe
  return pontos
}

/** Regra da EMA para o Falso Hu: 10 pontos para cada um dos outros três. */
export const PONTOS_FALSO_HU = 10

export function pontosDoFalsoHu(cadeira: Cadeira): [number, number, number, number] {
  return CADEIRAS.map((outra) => (outra === cadeira ? -3 * PONTOS_FALSO_HU : PONTOS_FALSO_HU)) as [
    number,
    number,
    number,
    number,
  ]
}

export function totais(
  placar: Pick<PlacarMcr, 'maos'> & Pick<Partial<PlacarMcr>, 'falsosHu'>,
): [number, number, number, number] {
  const lances = [
    ...placar.maos.map(pontosDaMao),
    ...(placar.falsosHu ?? []).map(({ cadeira }) => pontosDoFalsoHu(cadeira)),
  ]
  return lances.reduce<[number, number, number, number]>(
    (soma, pontos) => {
      return [soma[0] + pontos[0], soma[1] + pontos[1], soma[2] + pontos[2], soma[3] + pontos[3]]
    },
    [0, 0, 0, 0],
  )
}

/** Colocação de cada cadeira pelo total (1 = primeiro). Empates dividem a colocação. */
export function colocacoes(pontos: readonly number[]): number[] {
  return pontos.map((valor) => 1 + pontos.filter((outro) => outro > valor).length)
}

export function registrarMao(placar: PlacarMcr, mao: MaoMcr): PlacarMcr {
  if (validarMao(mao) || placar.finalizadoEm) return placar
  const lances = placar.registro?.lances ?? []
  const maos = [...placar.maos, lances.length ? { ...mao, lances } : mao]
  // A próxima mão começa com a vez do novo dealer, parada até o primeiro toque, e sem descartes.
  // Sem a chave do registro (undefined não volta igual do backup).
  const { registro: _registroDaMao, ...semRegistro } = placar
  return {
    ...semRegistro,
    maos,
    vez: vezInicial(dealerDaMao(maos.length), placar.timerSegundos),
  }
}

export function registrarFalsoHu(placar: PlacarMcr, cadeira: Cadeira): PlacarMcr {
  if (placar.finalizadoEm) return placar
  return {
    ...placar,
    falsosHu: [...(placar.falsosHu ?? []), { cadeira, aposMao: placar.maos.length }],
  }
}

export function desfazerUltimaMao(placar: PlacarMcr): PlacarMcr {
  if (placar.finalizadoEm) return placar
  // Primeiro o Falso Hu desta mão, depois a última mão registrada.
  const falsos = placar.falsosHu ?? []
  if (falsos[falsos.length - 1]?.aposMao === placar.maos.length) {
    return { ...placar, falsosHu: falsos.slice(0, -1) }
  }
  if (!placar.maos.length) return placar
  const maos = placar.maos.slice(0, -1)
  return { ...placar, maos, vez: vezInicial(dealerDaMao(maos.length), placar.timerSegundos) }
}

export function finalizar(placar: PlacarMcr, agora: string): PlacarMcr {
  return placar.finalizadoEm ? placar : { ...placar, finalizadoEm: agora }
}
