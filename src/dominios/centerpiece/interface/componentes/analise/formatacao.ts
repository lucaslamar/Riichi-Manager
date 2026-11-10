/** Ajudantes de desenho compartilhados pelo mapa e pelos gráficos. */

/** Rival em vermelho, freguês em verde, equilíbrio em cinza. */
export function corDoSaldo(saldo: number) {
  if (saldo < 0) return 'var(--texto-erro)'
  if (saldo > 0) return 'var(--texto-positivo)'
  return 'var(--texto-apoio)'
}

/** Corta nomes longos com reticências. */
export function truncar(texto: string, maximo: number) {
  return texto.length > maximo ? `${texto.slice(0, maximo - 1).trimEnd()}…` : texto
}
