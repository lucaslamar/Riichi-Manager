import type { ArmazenamentoChaveValor } from '@/compartilhado/persistencia/armazenamento'
import type { PlacarMcr } from '../logica/placar'

/** Tabela própria do MCR: os pontos não se misturam com as partidas do Riichi. */
export const CHAVE_PLACARES_MCR = 'riichi-manager-placares-mcr'
const VERSAO = 1

function ehPlacar(valor: unknown): valor is PlacarMcr {
  const placar = valor as PlacarMcr | null
  return (
    !!placar &&
    typeof placar.id === 'string' &&
    Array.isArray(placar.jogadorIds) &&
    placar.jogadorIds.length === 4 &&
    Array.isArray(placar.maos) &&
    typeof placar.vez === 'object'
  )
}

export function carregarPlacaresMcr(armazenamento: ArmazenamentoChaveValor): PlacarMcr[] {
  const salvo = armazenamento.ler(CHAVE_PLACARES_MCR)
  if (!salvo) return []
  try {
    const lido = JSON.parse(salvo) as { placares?: unknown }
    return Array.isArray(lido.placares) ? lido.placares.filter(ehPlacar) : []
  } catch (erro) {
    console.error('Placares MCR ilegíveis', erro)
    return []
  }
}

export function salvarPlacaresMcr(armazenamento: ArmazenamentoChaveValor, placares: PlacarMcr[]) {
  armazenamento.gravar(CHAVE_PLACARES_MCR, JSON.stringify({ versao: VERSAO, placares }))
}
