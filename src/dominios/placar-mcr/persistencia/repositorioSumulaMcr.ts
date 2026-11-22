import type { ArmazenamentoChaveValor } from '@/compartilhado/persistencia/armazenamento'
import { normalizarSumula, SUMULA_VAZIA, type RascunhoSumula } from '../logica/sumula'

/** A súmula em uso não se perde se o app fechar no meio da partida. */
const CHAVE_SUMULA_MCR = 'riichi-manager-sumula-mcr'
const VERSAO = 1

export function carregarSumulaMcr(armazenamento: ArmazenamentoChaveValor): RascunhoSumula {
  const salvo = armazenamento.ler(CHAVE_SUMULA_MCR)
  if (!salvo) return SUMULA_VAZIA
  try {
    return normalizarSumula((JSON.parse(salvo) as { sumula?: unknown }).sumula)
  } catch (erro) {
    console.error('Súmula MCR ilegível', erro)
    return SUMULA_VAZIA
  }
}

export function salvarSumulaMcr(armazenamento: ArmazenamentoChaveValor, sumula: RascunhoSumula) {
  armazenamento.gravar(CHAVE_SUMULA_MCR, JSON.stringify({ versao: VERSAO, sumula }))
}
