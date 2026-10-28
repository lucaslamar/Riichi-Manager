import { formatarNumeroGlobal } from '@/compartilhado/i18n/tradutorGlobal'
import type { ResultadoPontuacaoHanFu } from './tipos'

/** Pontos no formato do idioma ativo (8.000, 8,000, 8 000…). */
export function formatarPontos(valor: number): string {
  return formatarNumeroGlobal(valor)
}

export function formatarResultadoHanFu(resultado: Omit<ResultadoPontuacaoHanFu, 'totalFormatado'>) {
  return {
    ...resultado,
    totalFormatado: formatarPontos(resultado.principal),
  }
}
