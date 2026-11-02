/**
 * Pagamentos do chombo: um tsumo ao contrário, pago por quem cometeu. O valor fixo
 * não paga na hora (sai da pontuação final), então aqui não entra.
 */
import type { ConfigMesa } from './configMesa'
import type { Cadeira, PorCadeira } from './partida'

const CADEIRAS: readonly Cadeira[] = [0, 1, 2, 3]

/** Quanto cada um recebe de quem não é dealer; o dealer recebe o dobro. */
const BASE_POR_TIPO = { manganReverso: 2000, yakumanReverso: 8000 } as const

export function pagamentosChombo(
  tipo: Exclude<ConfigMesa['chombo']['tipo'], 'fixo'>,
  culpado: Cadeira,
  dealer: Cadeira,
): PorCadeira<number> {
  const base = BASE_POR_TIPO[tipo]
  const variacao: PorCadeira<number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
  for (const cadeira of CADEIRAS) {
    if (cadeira === culpado) continue
    const valor = culpado === dealer || cadeira === dealer ? base * 2 : base
    variacao[cadeira] += valor
    variacao[culpado] -= valor
  }
  return variacao
}
