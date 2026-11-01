import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import { normalizarConfig } from '../../centerpiece/logica/configMesa'
import { pausarTorneio } from '../logica/pausarTorneio'
import type { RascunhoTorneio, Torneio } from '../logica/tipos'

const CHAVE = 'riichi-manager-torneios'
export const CHAVE_TORNEIO_ANTIGO = 'riichi-manager-v5'
const VERSAO = 1

export interface DadosTorneios {
  torneios: Torneio[]
  rascunho: RascunhoTorneio | null
}

/** `null` = nada salvo ainda: é a hora de migrar o torneio antigo. */
export function carregarTorneios(
  armazenamento: ArmazenamentoChaveValor,
  agora: number,
): DadosTorneios | null {
  const salvo = armazenamento.ler(CHAVE)
  if (!salvo) return null
  try {
    const lido = JSON.parse(salvo) as Partial<DadosTorneios>
    const torneios = Array.isArray(lido.torneios) ? lido.torneios : []
    return {
      // O cronômetro é da hora: uma rodada não pode ter passado com o app fechado sem aviso.
      torneios: torneios.map((torneio) => ({
        ...pausarTorneio(torneio, agora),
        config: normalizarConfig(torneio.config),
      })),
      rascunho: lido.rascunho
        ? { ...lido.rascunho, config: normalizarConfig(lido.rascunho.config) }
        : null,
    }
  } catch {
    return { torneios: [], rascunho: null }
  }
}

export function salvarTorneios(armazenamento: ArmazenamentoChaveValor, dados: DadosTorneios) {
  armazenamento.gravar(CHAVE, JSON.stringify({ versao: VERSAO, ...dados }))
}
