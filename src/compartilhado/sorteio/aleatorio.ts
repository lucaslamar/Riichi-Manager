/** Inteiro em [0, limite). */
export type InteiroAleatorio = (limite: number) => number

const LIMITE_32_BITS = 0x1_0000_0000

/**
 * `crypto.getRandomValues` sem viés: descarta os valores do fim da faixa que não
 * fecham um múltiplo do limite (rejeição), em vez de usar o resto puro.
 */
export const inteiroAleatorioSeguro: InteiroAleatorio = (limite) => {
  if (limite <= 1) return 0
  const teto = LIMITE_32_BITS - (LIMITE_32_BITS % limite)
  const valor = new Uint32Array(1)
  do {
    crypto.getRandomValues(valor)
  } while (valor[0] >= teto)
  return valor[0] % limite
}

/** Fisher-Yates: cada ordem tem a mesma chance. Não mexe na lista recebida. */
export function embaralhar<T>(itens: readonly T[], aleatorio: InteiroAleatorio = inteiroAleatorioSeguro): T[] {
  const lista = [...itens]
  for (let atual = lista.length - 1; atual > 0; atual -= 1) {
    const sorteado = aleatorio(atual + 1)
    ;[lista[atual], lista[sorteado]] = [lista[sorteado], lista[atual]]
  }
  return lista
}

