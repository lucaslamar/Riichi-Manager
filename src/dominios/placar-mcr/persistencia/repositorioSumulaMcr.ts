import type { ArmazenamentoChaveValor } from '@/compartilhado/persistencia/armazenamento'
import { normalizarSumula, SUMULA_VAZIA, type RascunhoSumula } from '../logica/sumula'

/**
 * A súmula em uso não se perde se o app fechar no meio da partida. Há uma avulsa
 * e uma por mesa sorteada de torneio ou de clube.
 */
const CHAVE_SUMULA_MCR = 'riichi-manager-sumula-mcr'
const VERSAO = 1

interface Salvo {
  sumula?: unknown
  mesas?: Record<string, unknown>
}

function lerSalvo(armazenamento: ArmazenamentoChaveValor): Salvo {
  const salvo = armazenamento.ler(CHAVE_SUMULA_MCR)
  if (!salvo) return {}
  try {
    return (JSON.parse(salvo) as Salvo | null) ?? {}
  } catch (erro) {
    console.error('Súmula MCR ilegível', erro)
    return {}
  }
}

/** Com `mesa`, o rascunho daquela mesa sorteada, ou null se ela ainda não tem um. */
export function carregarSumulaMesa(
  armazenamento: ArmazenamentoChaveValor,
  mesa: string,
): RascunhoSumula | null {
  const salva = lerSalvo(armazenamento).mesas?.[mesa]
  return salva ? normalizarSumula(salva) : null
}

export function carregarSumulaMcr(armazenamento: ArmazenamentoChaveValor): RascunhoSumula {
  const { sumula } = lerSalvo(armazenamento)
  return sumula ? normalizarSumula(sumula) : SUMULA_VAZIA
}

/** `null` apaga o rascunho (a mesa foi registrada). */
export function salvarSumulaMcr(
  armazenamento: ArmazenamentoChaveValor,
  sumula: RascunhoSumula | null,
  mesa?: string,
) {
  const salvo = lerSalvo(armazenamento)
  const mesas = { ...salvo.mesas }
  if (mesa) {
    if (sumula) mesas[mesa] = sumula
    else delete mesas[mesa]
  }
  const avulsa = mesa ? salvo.sumula : (sumula ?? SUMULA_VAZIA)
  armazenamento.gravar(CHAVE_SUMULA_MCR, JSON.stringify({ versao: VERSAO, sumula: avulsa, mesas }))
}
