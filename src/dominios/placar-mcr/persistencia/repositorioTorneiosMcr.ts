import type { ArmazenamentoChaveValor } from '@/compartilhado/persistencia/armazenamento'
import type { TorneioMcr } from '../logica/torneio'

/** Torneios MCR: as mesas são placares com o id do torneio. */
export const CHAVE_TORNEIOS_MCR = 'riichi-manager-torneios-mcr'
const VERSAO = 1

function ehTorneio(valor: unknown): valor is TorneioMcr {
  const torneio = valor as TorneioMcr | null
  return !!torneio && typeof torneio.id === 'string' && typeof torneio.nome === 'string'
}

export function carregarTorneiosMcr(armazenamento: ArmazenamentoChaveValor): TorneioMcr[] {
  const salvo = armazenamento.ler(CHAVE_TORNEIOS_MCR)
  if (!salvo) return []
  try {
    const lido = JSON.parse(salvo) as { torneios?: unknown }
    return Array.isArray(lido.torneios) ? lido.torneios.filter(ehTorneio) : []
  } catch (erro) {
    console.error('Torneios MCR ilegíveis', erro)
    return []
  }
}

export function salvarTorneiosMcr(armazenamento: ArmazenamentoChaveValor, torneios: TorneioMcr[]) {
  armazenamento.gravar(CHAVE_TORNEIOS_MCR, JSON.stringify({ versao: VERSAO, torneios }))
}
