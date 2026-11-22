/**
 * W.O. no meio da partida: quem precisou sair. Não é o WO do torneio (`partida.wo`),
 * que é a mesa de quem nem apareceu. Puro, para o React Native.
 */
import { somaFecha } from './expressaoPontos'

export interface RegraSaida {
  ficaEmUltimo: boolean
  /** Descontada da pontuação final, em pontos do ranking (30 = −30,0). */
  penalidade: number
}

/** Fica em 4º com os pontos que tinha na hora da saída. */
export const REGRA_SAIDA_PADRAO: RegraSaida = { ficaEmUltimo: true, penalidade: 0 }

export function regraSaidaValida({ penalidade }: RegraSaida): boolean {
  return Number.isFinite(penalidade) && penalidade >= 0
}

/** Lê uma regra salva sem confiar nela. undefined: vale o padrão. */
export function lerRegraSaida(salva: unknown): RegraSaida | undefined {
  const lida = (salva ?? {}) as Partial<RegraSaida>
  if (typeof lida.ficaEmUltimo !== 'boolean' || typeof lida.penalidade !== 'number') return undefined
  const regra = { ficaEmUltimo: lida.ficaEmUltimo, penalidade: lida.penalidade }
  return regraSaidaValida(regra) ? regra : undefined
}

/** Maior que qualquer placar: põe quem saiu abaixo de todos, sem mudar a ordem entre eles. */
const ABAIXO_DE_TODOS = 1_000_000_000

/**
 * O valor que decide a colocação. Os pontos continuam os da saída, e mais de um W.O.
 * se ordena pelos pontos entre si.
 */
export function pontosParaColocacao(pontos: number, saiu: boolean, regra: RegraSaida): number {
  return saiu && regra.ficaEmUltimo ? pontos - ABAIXO_DE_TODOS : pontos
}

export interface Fechamento {
  fecha: boolean
  depositosNaMesa: number
  /** A soma não precisou fechar por causa de um W.O. */
  porSaida: boolean
}

/** A soma da mesa na hora de registrar. Com W.O. ela não trava o registro. */
export function fechamentoDoRegistro(
  soma: number,
  total: number,
  mesa: { palitosRestantes: 'primeiro' | 'perdidos'; comSaida: boolean },
): Fechamento {
  const fechamento = somaFecha(soma, total, mesa.palitosRestantes)
  if (fechamento.fecha || !mesa.comSaida) return { ...fechamento, porSaida: false }
  return { fecha: true, depositosNaMesa: 0, porSaida: true }
}
