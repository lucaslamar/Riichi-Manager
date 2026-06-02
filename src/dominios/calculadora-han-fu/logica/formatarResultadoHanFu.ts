import type { ResultadoPontuacaoHanFu } from './tipos'

export function formatarPontos(valor: number): string {
  return valor.toLocaleString('pt-BR')
}

export function formatarResultadoHanFu(resultado: Omit<ResultadoPontuacaoHanFu, 'totalFormatado'>) {
  return {
    ...resultado,
    totalFormatado: formatarPontos(resultado.principal),
  }
}
