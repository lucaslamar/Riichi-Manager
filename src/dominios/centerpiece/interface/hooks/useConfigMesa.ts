import { useState } from 'react'
import {
  alterarConfig,
  escolherPreset,
  reiniciarConfig,
  type ConfigMesa,
  type MudancaConfig,
} from '../../logica/configMesa'

/** Rascunho da folha: só vale para a partida quando a pessoa toca em Feito. */
export function useConfigMesa(inicial: ConfigMesa) {
  const [config, setConfig] = useState(inicial)
  return {
    config,
    alterar: (mudanca: MudancaConfig) => setConfig((atual) => alterarConfig(atual, mudanca)),
    escolherPreset: (preset: ConfigMesa['preset']) =>
      setConfig((atual) => escolherPreset(atual, preset)),
    reiniciar: () => setConfig(reiniciarConfig),
  }
}
