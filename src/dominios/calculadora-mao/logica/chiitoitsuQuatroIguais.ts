import type { Mao } from './tipos'

/**
 * Regra local: Chiitoitsu com quatro pedras iguais, que contam como dois pares.
 * A biblioteca `riichi` não aceita essa forma, então os Yaku de uma mão de sete
 * pares (fechada, 25 fu) são contados aqui. Dora, honba e pontos ficam com quem chama.
 */

const base = (pedra: string) => (pedra[0] === '0' ? `5${pedra[1]}` : pedra)
const ehHonra = (pedra: string) => pedra[1] === 'z'
const ehTerminal = (pedra: string) => !ehHonra(pedra) && (pedra[0] === '1' || pedra[0] === '9')

/** Mão fechada de 14 pedras, só pares, com ao menos uma quadra (o caso que a biblioteca recusa). */
export function ehChiitoitsuComQuatroIguais(mao: Mao): boolean {
  if (mao.melds.length > 0 || mao.pedras.length !== 14) return false
  const contagem = new Map<string, number>()
  for (const pedra of mao.pedras) contagem.set(base(pedra), (contagem.get(base(pedra)) ?? 0) + 1)
  const quantidades = [...contagem.values()]
  return quantidades.every((n) => n === 2 || n === 4) && quantidades.includes(4)
}

/** Yaku da mão como [nome, han, ehYakuman], com os mesmos nomes do cálculo padrão. */
export function yakusChiitoitsuQuatroIguais(mao: Mao): [string, number, boolean][] {
  const pedras = mao.pedras.map(base)
  if (pedras.every(ehHonra)) return [['Tsuuiisou', 1, true]]

  const yaku: [string, number, boolean][] = []
  if (mao.riichi) yaku.push(mao.riichi.duplo ? ['Double Riichi', 2, false] : ['Riichi', 1, false])
  if (mao.riichi?.ippatsu) yaku.push(['Ippatsu', 1, false])
  if (mao.agari === 'tsumo') yaku.push(['Menzen Tsumo', 1, false])
  if (mao.ultimaPedra) yaku.push(mao.agari === 'tsumo' ? ['Haitei Raoyue', 1, false] : ['Houtei Raoyui', 1, false])
  if (pedras.every((pedra) => !ehHonra(pedra) && !ehTerminal(pedra))) yaku.push(['Tanyao', 1, false])
  if (pedras.every((pedra) => ehHonra(pedra) || ehTerminal(pedra))) yaku.push(['Honroutou', 2, false])
  const naipes = new Set(pedras.filter((pedra) => !ehHonra(pedra)).map((pedra) => pedra[1]))
  if (naipes.size === 1) yaku.push(pedras.some(ehHonra) ? ['Honitsu', 3, false] : ['Chinitsu', 6, false])
  yaku.push(['Chiitoitsu', 2, false])
  return yaku
}
