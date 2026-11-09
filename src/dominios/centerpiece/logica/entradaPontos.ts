/**
 * Campo de pontos de mesa: inteiro que pode ser negativo (tobi). Funções puras,
 * sem tela, para reaproveitar no React Native (keyboardType
 * "numbers-and-punctuation" no iOS e "numeric" no Android, com o mesmo ±).
 */

/** Só um "-" opcional no começo e dígitos. Pontos, vírgulas e espaços saem. */
export function limparPontos(texto: string): string {
  const negativo = texto.trim().startsWith('-')
  return `${negativo ? '-' : ''}${texto.replace(/\D/g, '')}`
}

/**
 * Inverte o sinal. Com o campo vazio, deixa o "-" pendente: o número digitado em
 * seguida já entra negativo.
 */
export function inverterSinal(texto: string): string {
  const limpo = limparPontos(texto)
  return limpo.startsWith('-') ? limpo.slice(1) : `-${limpo}`
}

/** Valor do campo, ou null enquanto está vazio ou só com o "-". */
export function lerPontos(texto: string): number | null {
  const limpo = limparPontos(texto)
  return /^-?\d+$/.test(limpo) ? Number(limpo) : null
}

/** Ao sair do campo: "-" sozinho volta a vazio, e o resto fica como número limpo. */
export function fecharPontos(texto: string): string {
  const valor = lerPontos(texto)
  return valor === null ? '' : String(valor)
}

/** -12300 → "-12.300" (pt-BR), para mostrar com o campo fora de foco. */
export function formatarPontos(texto: string, idioma: string): string {
  const valor = lerPontos(texto)
  return valor === null ? texto : new Intl.NumberFormat(idioma, { maximumFractionDigits: 0 }).format(valor)
}
