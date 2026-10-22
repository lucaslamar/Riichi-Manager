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
  /** Multa do chombo: valor de mangan (padrão) ou, desligado, de yakuman. */
  chomboMangan: boolean
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
  chomboMangan: true,
}

/** Sem Aka dora não existe 5 vermelho: a escolha guardada fica, mas não vale. */
export function doraFlamejanteAtiva(config: ConfiguracaoCalculo): boolean {
  return config.akadora && config.doraFlamejante
}

/**
 * Multa do chombo, paga como um tsumo invertido: quem errou paga a cada
 * jogador. Sendo Leste, o mesmo valor a todos; senão, o Leste recebe o dobro.
 */
export function pagamentoChombo(
  config: ConfiguracaoCalculo,
  ehLeste: boolean,
): { total: number; leste: number; demais: number } {
  const base = config.chomboMangan ? 2000 : 8000
  return ehLeste
    ? { total: base * 2 * 3, leste: base * 2, demais: base * 2 }
    : { total: base * 4, leste: base * 2, demais: base }
}

/** Pontos de cada honba no Ron; no Tsumo cada pagador paga um terço disso. */
export function valorPorHonba(config: ConfiguracaoCalculo): number {
  return config.basengo ? 1500 : 300
}
