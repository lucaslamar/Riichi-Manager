import type { RegrasSanma } from './tipos'

export const REGRAS_SANMA_PADRAO: RegrasSanma = {
  kitaNukidora: true,
  norteYakuhai: false,
  pagamentoTsumo: 'tsumo-son',
  pontosIniciais: 35000,
  pontosRetorno: 40000,
  uma: [15, 0, -15],
  notenTotal: 2000,
}

const numero = (valor: unknown, reserva: number) =>
  typeof valor === 'number' && Number.isFinite(valor) ? valor : reserva

const ehUma = (valor: unknown): valor is [number, number, number] =>
  Array.isArray(valor) &&
  valor.length === 3 &&
  valor.every((item) => typeof item === 'number' && Number.isFinite(item))

/** Lê regras salvas sem confiar nelas: o que faltar ou for inválido vem do padrão. */
export function normalizarRegrasSanma(salvas: unknown): RegrasSanma {
  const lidas = (salvas ?? {}) as Partial<Record<keyof RegrasSanma, unknown>>
  const padrao = REGRAS_SANMA_PADRAO
  return {
    kitaNukidora: typeof lidas.kitaNukidora === 'boolean' ? lidas.kitaNukidora : padrao.kitaNukidora,
    norteYakuhai: typeof lidas.norteYakuhai === 'boolean' ? lidas.norteYakuhai : padrao.norteYakuhai,
    pagamentoTsumo: lidas.pagamentoTsumo === 'divisao-norte' ? 'divisao-norte' : 'tsumo-son',
    pontosIniciais: numero(lidas.pontosIniciais, padrao.pontosIniciais),
    pontosRetorno: numero(lidas.pontosRetorno, padrao.pontosRetorno),
    uma: ehUma(lidas.uma) ? [...lidas.uma] : [...padrao.uma],
    notenTotal: numero(lidas.notenTotal, padrao.notenTotal),
  }
}
