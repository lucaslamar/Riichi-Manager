import type { CategoriaPontuacaoHanFu } from './tipos'

export const HAN_MINIMO = 1
export const HAN_MAXIMO = 18
export const HAN_MAXIMO_NORMAL = 13
export const YAKUMAN_MULTIPLO_MAXIMO = 6
export const HONBA_MAXIMO = 99

export const FU_REFERENCIA = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110] as const
export const HAN_REFERENCIA = [1, 2, 3, 4, 5] as const

export const CATEGORIAS_PONTUACAO: Record<
  CategoriaPontuacaoHanFu,
  { nome: string | null; base: number | null }
> = {
  normal: { nome: null, base: null },
  mangan: { nome: 'Mangan', base: 2000 },
  haneman: { nome: 'Haneman', base: 3000 },
  baiman: { nome: 'Baiman', base: 4000 },
  sanbaiman: { nome: 'Sanbaiman', base: 6000 },
  yakuman: { nome: 'Yakuman', base: 8000 },
}

export function obterYakumanMultiplo(han: number): number {
  if (han >= 14) return Math.min(YAKUMAN_MULTIPLO_MAXIMO, han - 12)
  if (han >= 13) return 1
  return 0
}

export function rotularYakumanMultiplo(yakumanMultiplo: number): string {
  if (yakumanMultiplo <= 1) return 'Yakuman'
  if (yakumanMultiplo === 2) return 'Yakuman duplo'
  if (yakumanMultiplo === 3) return 'Yakuman triplo'
  if (yakumanMultiplo === 4) return 'Yakuman quádruplo'
  if (yakumanMultiplo === 5) return 'Yakuman quíntuplo'
  return 'Yakuman sêxtuplo'
}

export function arredondarCentena(valor: number): number {
  return Math.ceil(valor / 100) * 100
}

export function normalizarHan(han: number): number {
  if (!Number.isFinite(han)) return HAN_MINIMO
  return Math.min(HAN_MAXIMO, Math.max(HAN_MINIMO, Math.round(han)))
}

export function normalizarHonba(honba: number): number {
  if (!Number.isFinite(honba)) return 0
  return Math.min(HONBA_MAXIMO, Math.max(0, Math.round(honba)))
}

export function resolverCategoria(han: number, fu: number): {
  categoria: CategoriaPontuacaoHanFu
  base: number
} {
  const yakumanMultiplo = obterYakumanMultiplo(han)
  if (yakumanMultiplo > 0) return { categoria: 'yakuman', base: 8000 * yakumanMultiplo }
  if (han >= 11) return { categoria: 'sanbaiman', base: 6000 }
  if (han >= 8) return { categoria: 'baiman', base: 4000 }
  if (han >= 6) return { categoria: 'haneman', base: 3000 }
  if (han >= 5) return { categoria: 'mangan', base: 2000 }

  const baseCalculada = fu * 2 ** (han + 2)
  if (baseCalculada > 2000) return { categoria: 'mangan', base: 2000 }

  return { categoria: 'normal', base: baseCalculada }
}

export function obterFuValidos(han: number): number[] {
  const hanNormalizado = normalizarHan(han)
  if (hanNormalizado >= 5) return [30]
  if (hanNormalizado === 1) return [30, 40, 50, 60, 70, 80, 90, 100, 110]
  return [...FU_REFERENCIA]
}

export function normalizarFu(han: number, fu: number): number {
  const validos = obterFuValidos(han)
  if (!Number.isFinite(fu)) return validos[0]
  const fuInteiro = Math.round(fu)
  if (validos.includes(fuInteiro)) return fuInteiro
  return validos.reduce((maisProximo, atual) =>
    Math.abs(atual - fuInteiro) < Math.abs(maisProximo - fuInteiro) ? atual : maisProximo,
  )
}
