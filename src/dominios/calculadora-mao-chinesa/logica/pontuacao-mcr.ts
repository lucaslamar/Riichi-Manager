import type { FormaBatida, ResultadoPagamentoMcr } from './tipos'

/** Valor base que todos pagam ao vencedor no MCR. */
const BASE_MCR = 8

/**
 * Pagamento MCR, com `fan` já somando as flores. No ron, quem descartou paga
 * fan + 8 e os outros dois pagam 8. No tsumo, os três pagam fan + 8.
 */
export function calcularPagamentoMcr(fan: number, forma: FormaBatida): ResultadoPagamentoMcr {
  const pagamentos =
    forma === 'tsumo'
      ? [0, 1, 2].map(() => ({ quem: 'outro' as const, valor: fan + BASE_MCR }))
      : [
          { quem: 'descartador' as const, valor: fan + BASE_MCR },
          { quem: 'outro' as const, valor: BASE_MCR },
          { quem: 'outro' as const, valor: BASE_MCR },
        ]
  return { ganhadorRecebe: pagamentos.reduce((soma, p) => soma + p.valor, 0), pagamentos }
}
