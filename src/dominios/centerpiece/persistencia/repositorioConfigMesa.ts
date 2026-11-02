import type { ArmazenamentoChaveValor } from '../../../compartilhado/persistencia/armazenamento'
import { configDoPreset, normalizarConfig, type ConfigMesa } from '../logica/configMesa'

const CHAVE = 'riichi-manager-config-mesa'
const VERSAO = 1

/** Última config usada: vira o padrão da próxima partida. */
export function carregarUltimaConfig(armazenamento: ArmazenamentoChaveValor): ConfigMesa {
  const salva = armazenamento.ler(CHAVE)
  if (!salva) return configDoPreset('padrao')
  try {
    return normalizarConfig((JSON.parse(salva) as { config?: unknown }).config)
  } catch {
    return configDoPreset('padrao')
  }
}

export function salvarUltimaConfig(armazenamento: ArmazenamentoChaveValor, config: ConfigMesa) {
  armazenamento.gravar(CHAVE, JSON.stringify({ versao: VERSAO, config }))
}
