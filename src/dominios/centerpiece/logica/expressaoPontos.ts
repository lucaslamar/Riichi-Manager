/**
 * Expressão da calculadora de pontos da mesa: números inteiros ligados por + e −.
 * Funções puras, sem tela. A expressão é guardada como texto com "+" e "-"
 * (ex.: "30000-8000"), e a tela troca o "-" pelo sinal de menos.
 */

export type Operador = '+' | '-'

const ehOperador = (caractere: string | undefined): caractere is Operador =>
  caractere === '+' || caractere === '-'

/** Último número ainda sendo digitado (sem o sinal). */
function numeroFinal(expressao: string): string {
  const casamento = /\d*$/.exec(expressao)
  return casamento ? casamento[0] : ''
}

/** Dígito ou "000". Zeros à esquerda não se acumulam e "000" não abre número. */
export function digitar(expressao: string, digitos: string): string {
  const atual = numeroFinal(expressao)
  if (digitos === '000' && (atual === '' || atual === '0')) return expressao
  if (atual === '0') return expressao.slice(0, -1) + digitos
  return expressao + digitos
}

/** + ou −. Troca o operador pendente. Com a expressão vazia, só o − (número negativo). */
export function operar(expressao: string, operador: Operador): string {
  if (expressao === '') return operador === '-' ? '-' : ''
  const ultimo = expressao.slice(-1)
  if (ehOperador(ultimo))
    return expressao.length === 1
      ? operador === '-'
        ? '-'
        : ''
      : expressao.slice(0, -1) + operador
  return expressao + operador
}

/** Valor pronto (atalho de mão ou Calculadora de mão): entra somando se não houver operador pendente. */
export function inserirValor(expressao: string, valor: number): string {
  const ultimo = expressao.slice(-1)
  const negativo = valor < 0
  const absoluto = String(Math.abs(Math.trunc(valor)))
  if (expressao === '' || ehOperador(ultimo)) {
    if (!negativo) return expressao + absoluto
    if (expressao === '') return `-${absoluto}`
    return expressao.slice(0, -1) + (ultimo === '-' ? '+' : '-') + absoluto
  }
  return `${expressao}${negativo ? '-' : '+'}${absoluto}`
}

export function apagar(expressao: string): string {
  return expressao.slice(0, -1)
}

/** Partes da expressão: números e operadores, na ordem. Operador pendente no fim fica de fora. */
export function partesDaExpressao(expressao: string): (number | Operador)[] {
  const partes: (number | Operador)[] = []
  const casamentos = expressao.match(/^-?\d+|[+-]|\d+/g) ?? []
  for (const pedaco of casamentos) {
    if (ehOperador(pedaco)) partes.push(pedaco)
    else partes.push(Number(pedaco))
  }
  return partes
}

/** Resultado da conta, ou null sem nenhum número. */
export function avaliar(expressao: string): number | null {
  let total: number | null = null
  let operador: Operador = '+'
  for (const parte of partesDaExpressao(expressao)) {
    if (typeof parte === 'number') {
      total = (total ?? 0) + (operador === '+' ? parte : -parte)
    } else {
      operador = parte
    }
  }
  return total
}

/** Tem conta de verdade (mais de um número): o visor mostra "= resultado". */
export function temOperacao(expressao: string): boolean {
  return partesDaExpressao(expressao).filter((parte) => typeof parte === 'number').length > 1
}

/** "=": a expressão vira o próprio resultado. */
export function resolver(expressao: string): string {
  const total = avaliar(expressao)
  return total === null ? '' : String(total)
}

/** Atalhos de limite: valores de ron (não-dealer e dealer). */
export const LIMITES = [
  { chave: 'mangan', naoDealer: 8000, dealer: 12000 },
  { chave: 'haneman', naoDealer: 12000, dealer: 18000 },
  { chave: 'baiman', naoDealer: 16000, dealer: 24000 },
  { chave: 'sanbaiman', naoDealer: 24000, dealer: 36000 },
  { chave: 'yakuman', naoDealer: 32000, dealer: 48000 },
] as const

export const VALOR_RIICHI = 1000

/**
 * A soma da mesa fecha? Com "perdidos", os depósitos de riichi que sobraram
 * ficam fora: a soma pode faltar múltiplos de 1.000. Com "primeiro", vão para
 * quem terminou em 1º e a soma tem que bater.
 */
export function somaFecha(
  soma: number,
  total: number,
  palitosRestantes: 'primeiro' | 'perdidos',
): { fecha: boolean; depositosNaMesa: number } {
  const diferenca = total - soma
  if (diferenca === 0) return { fecha: true, depositosNaMesa: 0 }
  if (palitosRestantes === 'perdidos' && diferenca > 0 && diferenca % VALOR_RIICHI === 0) {
    return { fecha: true, depositosNaMesa: diferenca / VALOR_RIICHI }
  }
  return { fecha: false, depositosNaMesa: 0 }
}
