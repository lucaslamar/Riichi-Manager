/**
 * Uma da mesa, em TypeScript puro: fixa ou flutuante (muda conforme quantos
 * jogadores terminaram com pontos iguais ou maiores que o retorno).
 */
export type ValoresUma = [number, number, number, number]

export interface TabelaUmaFlutuante {
  nenhum: ValoresUma
  um: ValoresUma
  dois: ValoresUma
  tres: ValoresUma
}

export type LinhaUmaFlutuante = keyof TabelaUmaFlutuante

export type UmaMesa =
  | { tipo: 'fixa'; valores: ValoresUma }
  | { tipo: 'flutuante'; tabela: TabelaUmaFlutuante }

export const LINHAS_FLUTUANTE: readonly LinhaUmaFlutuante[] = ['nenhum', 'um', 'dois', 'tres']

/** Exemplo real de clube, com retorno de 30.000. */
export const TABELA_FLUTUANTE_EXEMPLO: TabelaUmaFlutuante = {
  nenhum: [8, 4, -4, -8],
  um: [12, -1, -3, -8],
  dois: [8, 4, -4, -8],
  tres: [8, 3, 1, -12],
}

export function umaFixa(valores: ValoresUma): UmaMesa {
  return { tipo: 'fixa', valores }
}

export function somaUma(valores: readonly number[]) {
  return valores.reduce((soma, valor) => soma + valor, 0)
}

/** "uma 5-15": o primeiro número vale para o 2º e o 3º; o segundo, para o 1º e o 4º. */
export function umaSimetrica(segundoTerceiro: number, primeiroQuarto: number): ValoresUma {
  return [primeiroQuarto, segundoTerceiro, -segundoTerceiro, -primeiroQuarto]
}

export function ehSimetrica([primeiro, segundo, terceiro, quarto]: ValoresUma) {
  return primeiro === -quarto && segundo === -terceiro && primeiro >= 0 && segundo >= 0
}

/** Soma zero e nunca sobe do 1º para o 4º. */
export function linhaUmaValida(valores: ValoresUma) {
  return somaUma(valores) === 0 && valores.every((valor, indice) => indice === 0 || valores[indice - 1] >= valor)
}

export function umaValida(uma: UmaMesa) {
  return uma.tipo === 'fixa'
    ? linhaUmaValida(uma.valores)
    : LINHAS_FLUTUANTE.every((linha) => linhaUmaValida(uma.tabela[linha]))
}

/** Exatamente o retorno conta como acima; com os 4 acima, vale a linha "nenhum". */
export function linhaDaContagem(pontosFinais: readonly number[], retorno: number): LinhaUmaFlutuante {
  const acima = pontosFinais.filter((pontos) => pontos >= retorno).length
  return acima === 1 ? 'um' : acima === 2 ? 'dois' : acima === 3 ? 'tres' : 'nenhum'
}

/** Uma de cada colocação, do 1º ao 4º, para estes pontos finais. */
export function valoresDaUma(uma: UmaMesa, pontosFinais: readonly number[], retorno: number): ValoresUma {
  return uma.tipo === 'fixa' ? uma.valores : uma.tabela[linhaDaContagem(pontosFinais, retorno)]
}

/**
 * Uma de cada jogador, na ordem de `pontosFinais`. Empate de pontos soma a uma das
 * colocações empatadas e divide entre os empatados.
 */
export function calcularUma(
  config: { uma: UmaMesa; pontosRetorno: number },
  pontosFinais: readonly number[],
): number[] {
  const valores = valoresDaUma(config.uma, pontosFinais, config.pontosRetorno)
  const ordenados = [...pontosFinais].sort((um, outro) => outro - um)
  return pontosFinais.map((pontos) => {
    const inicio = ordenados.indexOf(pontos)
    const empatados = ordenados.filter((outro) => outro === pontos).length
    const lugares = valores.slice(inicio, inicio + empatados)
    return somaUma(lugares) / empatados
  })
}

const ehValores = (valor: unknown): valor is ValoresUma =>
  Array.isArray(valor) && valor.length === 4 && valor.every((item) => typeof item === 'number' && Number.isFinite(item))

/** Config antiga guardava só os 4 valores: vira fixa, com os mesmos números. */
export function normalizarUma(salva: unknown, reserva: UmaMesa): UmaMesa {
  if (ehValores(salva)) return umaFixa(salva)
  const lida = (salva ?? {}) as { tipo?: unknown; valores?: unknown; tabela?: Partial<Record<LinhaUmaFlutuante, unknown>> }
  if (lida.tipo === 'fixa' && ehValores(lida.valores)) return umaFixa(lida.valores)
  const tabela = lida.tabela
  if (lida.tipo === 'flutuante' && tabela && LINHAS_FLUTUANTE.every((linha) => ehValores(tabela[linha]))) {
    return { tipo: 'flutuante', tabela: tabela as TabelaUmaFlutuante }
  }
  return reserva
}
