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
}
