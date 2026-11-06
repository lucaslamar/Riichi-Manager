/**
 * Só a parte das regras que muda a pontuação final (pontos de partida, retorno/oka
 * e uma), usada em "Registrar partida finalizada". Os valores vêm dos mesmos
 * presets da criação de mesa (`configMesa.ts`), que é onde estão as fontes oficiais
 * de cada um. Nada de número repetido aqui.
 */
import { configDoPreset, type ConfigMesa, type IdPreset } from './configMesa'
import type { UmaMesa } from './uma'

/** Presets do seletor, na ordem. `padrao` é o "Clube". */
export const PRESETS_REGISTRO = ['padrao', 'ema', 'wrc'] as const
/** Personalizado não tem botão: é qualquer coisa fora dos três presets. */
export const CONJUNTOS_REGISTRO = [...PRESETS_REGISTRO, 'personalizado'] as const
export type ConjuntoRegistro = (typeof CONJUNTOS_REGISTRO)[number]

export interface RegrasPontuacao {
  pontosPartida: number
  pontosRetorno: number
  uma: UmaMesa
}

export function regrasDoPreset(preset: IdPreset): RegrasPontuacao {
  const { pontosPartida, pontosRetorno, uma } = configDoPreset(preset)
  return { pontosPartida, pontosRetorno, uma }
}

export function mesmasRegras(uma: RegrasPontuacao, outra: RegrasPontuacao) {
  return (
    uma.pontosPartida === outra.pontosPartida &&
    uma.pontosRetorno === outra.pontosRetorno &&
    JSON.stringify(uma.uma) === JSON.stringify(outra.uma)
  )
}

/**
 * Conjunto dos valores: Clube, EMA ou WRC quando batem com um deles; qualquer
 * outra coisa é Personalizado. Valores iguais em EMA e WRC ficam com o primeiro.
 */
export function conjuntoDasRegras(regras: RegrasPontuacao, preferido?: ConjuntoRegistro): ConjuntoRegistro {
  if (preferido && preferido !== 'personalizado' && mesmasRegras(regras, regrasDoPreset(preferido))) {
    return preferido
  }
  return PRESETS_REGISTRO.find((id) => mesmasRegras(regras, regrasDoPreset(id))) ?? 'personalizado'
}

/** Config base da partida registrada: o preset escolhido (Personalizado parte do Clube). */
export function configBaseDoConjunto(conjunto: ConjuntoRegistro): ConfigMesa {
  return configDoPreset(conjunto === 'personalizado' ? 'padrao' : conjunto)
}

/** Texto curto da uma para o resumo: "15/5" (fixa simétrica) ou "15/5/-5/-15". */
export function umaResumida(uma: UmaMesa): string | null {
  if (uma.tipo !== 'fixa') return null
  const [primeiro, segundo, terceiro, quarto] = uma.valores
  return primeiro === -quarto && segundo === -terceiro
    ? `${primeiro}/${segundo}`
    : uma.valores.join('/')
}
