import { REGRAS_SANMA_PADRAO } from './regras-padrao'
import type { RegrasSanma, Variante } from './tipos'

/** Total do noten na variante: 3.000 no yonma, `notenTotal` no Sanma. */
export function totalNoten(variante: Variante, regras: RegrasSanma = REGRAS_SANMA_PADRAO): number {
  return variante === 'sanma' ? regras.notenTotal : 3000
}

/**
 * Pagamento de noten: o total sai, em partes iguais, de quem estava noten e vai,
 * em partes iguais, para quem estava tenpai. Devolve a variação de cada jogador.
 */
export function calcularNoten<T>(
  tenpai: readonly T[],
  jogadores: readonly T[],
  variante: Variante,
  regras: RegrasSanma = REGRAS_SANMA_PADRAO,
): Map<T, number> {
  const resultado = new Map<T, number>(jogadores.map((jogador) => [jogador, 0]))
  const prontos = jogadores.filter((jogador) => tenpai.includes(jogador))
  if (prontos.length === 0 || prontos.length === jogadores.length) return resultado
  const total = totalNoten(variante, regras)
  const ganho = total / prontos.length
  const perda = total / (jogadores.length - prontos.length)
  for (const jogador of jogadores) resultado.set(jogador, prontos.includes(jogador) ? ganho : -perda)
  return resultado
}
