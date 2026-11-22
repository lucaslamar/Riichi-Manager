/**
 * Súmula do Registrar partida finalizada no MCR: o papel e caneta da mesa.
 * Cada linha é uma mão, calculada pelo app ou escrita à mão. Um total digitado
 * direto vira o acerto (`ajuste`) entre ele e a soma das linhas.
 */
import {
  CADEIRAS,
  novoPlacar,
  registrarFalsoHu,
  totais,
  TOTAL_MAOS,
  validarMao,
  type Cadeira,
  type MaoMcr,
  type PlacarMcr,
  type Quatro,
} from './placar'

export interface RascunhoSumula {
  assentos: (string | null)[]
  maos: MaoMcr[]
  falsosHu: { cadeira: Cadeira; aposMao: number }[]
  ajuste: Quatro
  /** Quem teve o total digitado direto. */
  digitado: boolean[]
  notas: string
  /** Mesa do clube: nomes de quem joga sem cadastro, por id. */
  convidados?: Record<string, string>
}

export const SUMULA_VAZIA: RascunhoSumula = {
  assentos: [null, null, null, null],
  maos: [],
  falsosHu: [],
  ajuste: [0, 0, 0, 0],
  digitado: [false, false, false, false],
  notas: '',
}

export function temAnotacao(sumula: RascunhoSumula): boolean {
  return sumula.maos.length > 0 || sumula.falsosHu.length > 0
}

/** Total de cada um, ou null para quem ainda não tem nada anotado. */
export function pontosDaSumula(sumula: RascunhoSumula): (number | null)[] {
  const pontos = totais(sumula)
  const anotado = temAnotacao(sumula)
  return CADEIRAS.map((cadeira) => (anotado || sumula.digitado[cadeira] ? pontos[cadeira] : null))
}

export function digitarTotal(
  sumula: RascunhoSumula,
  cadeira: Cadeira,
  total: number | null,
): RascunhoSumula {
  const ajuste: Quatro = [...sumula.ajuste]
  ajuste[cadeira] = 0
  if (total !== null) ajuste[cadeira] = total - totais({ ...sumula, ajuste })[cadeira]
  const digitado = [...sumula.digitado]
  digitado[cadeira] = total !== null
  return { ...sumula, ajuste, digitado }
}

export function podeAnotarMao(sumula: RascunhoSumula): boolean {
  return sumula.maos.length < TOTAL_MAOS
}

/** Nova linha ou, com `indice`, a correção de uma que já existe. */
export function anotarMao(sumula: RascunhoSumula, mao: MaoMcr, indice?: number): RascunhoSumula {
  if (validarMao(mao)) return sumula
  if (indice !== undefined && indice < sumula.maos.length) {
    return { ...sumula, maos: sumula.maos.map((atual, i) => (i === indice ? mao : atual)) }
  }
  return podeAnotarMao(sumula) ? { ...sumula, maos: [...sumula.maos, mao] } : sumula
}

export function apagarMao(sumula: RascunhoSumula, indice: number): RascunhoSumula {
  return {
    ...sumula,
    maos: sumula.maos.filter((_, i) => i !== indice),
    falsosHu: sumula.falsosHu.map((falso) =>
      falso.aposMao > indice ? { ...falso, aposMao: falso.aposMao - 1 } : falso,
    ),
  }
}

export function anotarFalsoHu(sumula: RascunhoSumula, cadeira: Cadeira): RascunhoSumula {
  return { ...sumula, falsosHu: [...sumula.falsosHu, { cadeira, aposMao: sumula.maos.length }] }
}

export function apagarFalsoHu(sumula: RascunhoSumula, indice: number): RascunhoSumula {
  return { ...sumula, falsosHu: sumula.falsosHu.filter((_, i) => i !== indice) }
}

/**
 * Mão escrita no papel: os quatro valores somam zero. Com um só em branco, ele
 * é o que falta para fechar. Null enquanto não dá para fechar.
 */
export function fecharMaoEscrita(valores: readonly (number | null)[]): Quatro | null {
  const vazios = valores.filter((valor) => valor === null).length
  const soma = valores.reduce<number>((total, valor) => total + (valor ?? 0), 0)
  if (vazios > 1 || (vazios === 0 && soma !== 0)) return null
  return valores.map((valor) => valor ?? (soma === 0 ? 0 : -soma)) as Quatro
}

/** A súmula virando o placar finalizado que o Histórico e o Ranking já leem. */
export function placarDaSumula(sumula: RascunhoSumula, id: string, agora: string): PlacarMcr {
  const jogadorIds = sumula.assentos as [string, string, string, string]
  let placar: PlacarMcr = { ...novoPlacar(id, jogadorIds, 0, agora), registradoManual: true }
  sumula.maos.forEach((mao, indice) => {
    for (const falso of sumula.falsosHu.filter(({ aposMao }) => aposMao === indice))
      placar = registrarFalsoHu(placar, falso.cadeira)
    placar = { ...placar, maos: [...placar.maos, mao] }
  })
  for (const falso of sumula.falsosHu.filter(({ aposMao }) => aposMao >= sumula.maos.length))
    placar = registrarFalsoHu(placar, falso.cadeira)
  return {
    ...placar,
    ...(sumula.ajuste.some((valor) => valor !== 0) && { ajuste: sumula.ajuste }),
    ...(sumula.notas.trim() && { notas: sumula.notas.trim() }),
    finalizadoEm: agora,
  }
}

const quatro = (valor: unknown, confere: (item: unknown) => boolean) =>
  Array.isArray(valor) && valor.length === 4 && valor.every(confere)

/** Lê o rascunho salvo sem confiar nele. */
export function normalizarSumula(salvo: unknown): RascunhoSumula {
  const lido = (salvo ?? {}) as Partial<RascunhoSumula>
  const valida =
    quatro(lido.assentos, (id) => id === null || typeof id === 'string') &&
    quatro(lido.ajuste, Number.isInteger) &&
    quatro(lido.digitado, (item) => typeof item === 'boolean') &&
    Array.isArray(lido.maos) &&
    Array.isArray(lido.falsosHu) &&
    typeof lido.notas === 'string'
  return valida ? (lido as RascunhoSumula) : SUMULA_VAZIA
}

/** Um placar já registrado de volta na súmula, para corrigir. */
export function sumulaDoPlacar(placar: PlacarMcr): RascunhoSumula {
  const ajuste: Quatro = placar.ajuste ? [...placar.ajuste] : [0, 0, 0, 0]
  return {
    assentos: [...placar.jogadorIds],
    maos: placar.maos,
    falsosHu: placar.falsosHu ?? [],
    ajuste,
    // Registrado, os quatro têm total, mesmo que seja zero.
    digitado: CADEIRAS.map(() => true),
    notas: placar.notas ?? '',
  }
}

/** Dois jogadores trocam de lugar e levam o que foi anotado para cada um. */
export function trocarLugares(sumula: RascunhoSumula, um: Cadeira, outro: Cadeira): RascunhoSumula {
  const novaCadeira = (cadeira: Cadeira) =>
    cadeira === um ? outro : cadeira === outro ? um : cadeira
  const trocar = <Item>(itens: readonly Item[]) =>
    CADEIRAS.map((cadeira) => itens[novaCadeira(cadeira)])
  return {
    ...sumula,
    assentos: trocar(sumula.assentos),
    ajuste: trocar(sumula.ajuste) as Quatro,
    digitado: trocar(sumula.digitado),
    falsosHu: sumula.falsosHu.map((falso) => ({ ...falso, cadeira: novaCadeira(falso.cadeira) })),
    maos: sumula.maos.map((mao): MaoMcr => {
      if (mao.tipo === 'anotada') return { ...mao, pontos: trocar(mao.pontos) as Quatro }
      if (mao.tipo === 'empate') return mao
      return {
        ...mao,
        vencedor: novaCadeira(mao.vencedor),
        ...(mao.descartador !== undefined && { descartador: novaCadeira(mao.descartador) }),
      }
    }),
  }
}
