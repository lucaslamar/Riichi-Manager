/**
 * Registrar partida finalizada no MCR: só o total de cada um, que a pessoa soma
 * e subtrai na calculadora de pontos. Todos começam com 0 e a mesa soma zero.
 */
import {
  CADEIRAS,
  novoPlacar,
  pontosDaMao,
  totais,
  validarMao,
  type Cadeira,
  type MaoMcr,
  type PlacarMcr,
  type Quatro,
} from './placar'

export interface RascunhoRegistro {
  assentos: (string | null)[]
  /** Total de cada cadeira. Null: ainda não lançado. */
  pontos: (number | null)[]
  /** Mesa do clube: nomes de quem joga sem cadastro, por id. */
  convidados?: Record<string, string>
}

export const REGISTRO_EM_BRANCO: RascunhoRegistro = {
  assentos: [null, null, null, null],
  pontos: [null, null, null, null],
}

export function digitarTotal(
  registro: RascunhoRegistro,
  cadeira: Cadeira,
  total: number | null,
): RascunhoRegistro {
  return {
    ...registro,
    pontos: registro.pontos.map((atual, i) => (i === cadeira ? total : atual)),
  }
}

/** Calcular mão: o pagamento entra nos quatro totais, em cima do que já tinham. */
export function somarMao(registro: RascunhoRegistro, mao: MaoMcr): RascunhoRegistro {
  if (validarMao(mao)) return registro
  const variacao = pontosDaMao(mao)
  return {
    ...registro,
    pontos: registro.pontos.map((atual, cadeira) => (atual ?? 0) + variacao[cadeira]),
  }
}

/** Dois jogadores trocam de lugar e levam os pontos. */
export function trocarLugares(
  registro: RascunhoRegistro,
  um: Cadeira,
  outro: Cadeira,
): RascunhoRegistro {
  const trocar = <Item>(itens: readonly Item[]) =>
    CADEIRAS.map((cadeira) => itens[cadeira === um ? outro : cadeira === outro ? um : cadeira])
  return { ...registro, assentos: trocar(registro.assentos), pontos: trocar(registro.pontos) }
}

/** O registro virando o placar finalizado que o Histórico e o Ranking já leem. */
export function placarDoRegistro(
  registro: RascunhoRegistro,
  id: string,
  agora: string,
): PlacarMcr {
  const jogadorIds = registro.assentos as [string, string, string, string]
  return {
    ...novoPlacar(id, jogadorIds, 0, agora),
    pontosRegistrados: registro.pontos.map((valor) => valor ?? 0) as Quatro,
    finalizadoEm: agora,
  }
}

/** Um placar já registrado de volta na calculadora, para corrigir. */
export function registroDoPlacar(placar: PlacarMcr): RascunhoRegistro {
  return { assentos: [...placar.jogadorIds], pontos: totais(placar) }
}

/** Lê o rascunho salvo sem confiar nele. */
export function normalizarRegistro(salvo: unknown): RascunhoRegistro {
  const lido = (salvo ?? {}) as Partial<RascunhoRegistro>
  const valido =
    Array.isArray(lido.assentos) &&
    lido.assentos.length === 4 &&
    lido.assentos.every((id) => id === null || typeof id === 'string') &&
    Array.isArray(lido.pontos) &&
    lido.pontos.length === 4 &&
    lido.pontos.every((valor) => valor === null || Number.isInteger(valor))
  return valido ? (lido as RascunhoRegistro) : REGISTRO_EM_BRANCO
}
