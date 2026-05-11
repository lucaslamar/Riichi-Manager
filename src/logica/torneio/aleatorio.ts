/**
 * @fileoverview Utilitário de embaralhamento.
 *
 * Implementa o algoritmo Fisher-Yates, que gera uma permutação aleatória
 * uniforme — cada ordem possível tem a mesma probabilidade de ocorrer.
 */

/**
 * Retorna uma cópia embaralhada do array (não modifica o original).
 *
 * @typeParam T - Tipo dos elementos do array.
 * @param itens - Array a embaralhar.
 * @returns Novo array com os mesmos elementos em ordem aleatória.
 *
 * @example
 * embaralhar([1, 2, 3, 4]) // poderia retornar [3, 1, 4, 2]
 */
export function embaralhar<T>(itens: T[]): T[] {
  // Copiamos o array para não mutar o original — princípio de imutabilidade.
  const copia = [...itens]

  for (let i = copia.length - 1; i > 0; i--) {
    // Escolhe um índice aleatório entre 0 e i (inclusive).
    const j = Math.floor(Math.random() * (i + 1))
    // Troca os elementos usando desestruturação.
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }

  return copia
}
