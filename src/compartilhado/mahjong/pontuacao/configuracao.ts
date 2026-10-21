// ─── Configuração ─────────────────────────────────────────────────────────────

export interface ConfiguracaoCalculo {
  tanyaoAberto: boolean
  multiYakuman: boolean
  yakumanDuplo: boolean
  kiriageMangan: boolean
  kazoeYakuman: boolean
  fuVentosDuplo: boolean
  fuRinshan: boolean
  akadora: boolean
  /** Regra local: indicador 5 vermelho faz cada dora dele valer 2 han. Depende de `akadora`. */
  doraFlamejante: boolean
  /** Regra local (場千五): cada honba vale 1500 em vez de 300. */
  basengo: boolean
}

export const configuracaoPadrao: ConfiguracaoCalculo = {
  tanyaoAberto: true,
  multiYakuman: true,
  yakumanDuplo: true,
  kiriageMangan: false,
  kazoeYakuman: true,
  fuVentosDuplo: false,
  fuRinshan: true,
  akadora: true,
  doraFlamejante: false,
  basengo: false,
}

/** Sem Aka dora não existe 5 vermelho: a escolha guardada fica, mas não vale. */
export function doraFlamejanteAtiva(config: ConfiguracaoCalculo): boolean {
  return config.akadora && config.doraFlamejante
}

/** Pontos de cada honba no Ron; no Tsumo cada pagador paga um terço disso. */
export function valorPorHonba(config: ConfiguracaoCalculo): number {
  return config.basengo ? 1500 : 300
}
