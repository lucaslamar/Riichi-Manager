/**
 * Regras de uma mesa, usadas pelo Centerpiece e pelo Torneio, em TypeScript puro.
 * A partida guarda uma cópia: mudar um preset depois não altera partida já jogada.
 */
export type IdPreset = 'padrao' | 'wrc' | 'ema' | 'mleague' | 'cerrado'

export interface ConfigMesa {
  preset: IdPreset | 'personalizado'
  /** Preset de origem: é para ele que "Reiniciar" volta depois de virar Personalizado. */
  presetBase: IdPreset
  tipoPartida: 'leste' | 'hanchan'
  pontosPartida: number
  pontosRetorno: number
  /** Do 1º ao 4º, em milhares de pontos (+15 = 15.000). */
  uma: [number, number, number, number]
  ronMultiplo: 'atamaHane' | 'duploTriploAborta' | 'duploTriploPermitidos'
  tobi: boolean
  agariYame: boolean
  prorrogacao: boolean
  palitosRestantes: 'primeiro' | 'perdidos'
  abortivos: {
    kyuushuKyuuhai: boolean
    quatroVentos: boolean
    quatroKans: boolean
    quatroRiichis: boolean
  }
  nagashiMangan: boolean
  /** `fixo`: pontos descontados da pontuação final, depois da uma. */
  chombo: { tipo: 'manganReverso' } | { tipo: 'fixo'; valor: number }
  /** Segundos por vez; 0 = desligado. */
  timerVez: 0 | 30 | 60 | 90
  registrarDescartes: boolean
}

export const IDS_PRESET: readonly IdPreset[] = ['padrao', 'wrc', 'ema', 'mleague', 'cerrado']
export const OPCOES_TIMER_VEZ: readonly ConfigMesa['timerVez'][] = [0, 30, 60, 90]

/** Multa de chombo fixo sugerida ao trocar de tipo; é a da EMA e da M.League. */
export const VALOR_CHOMBO_FIXO_PADRAO = 20000

const SEM_ABORTIVOS: ConfigMesa['abortivos'] = {
  kyuushuKyuuhai: false,
  quatroVentos: false,
  quatroKans: false,
  quatroRiichis: false,
}

/** Regras próprias de cada preset; timer e descartes são preferências da mesa. */
type RegrasPreset = Omit<ConfigMesa, 'preset' | 'presetBase' | 'timerVez' | 'registrarDescartes'>

/** Regras de clube comuns no Japão, escolha do app. */
const REGRAS_PADRAO: RegrasPreset = {
  tipoPartida: 'hanchan',
  pontosPartida: 25000,
  pontosRetorno: 30000,
  uma: [15, 5, -5, -15],
  ronMultiplo: 'atamaHane',
  tobi: true,
  agariYame: true,
  prorrogacao: false,
  palitosRestantes: 'primeiro',
  abortivos: {
    kyuushuKyuuhai: true,
    quatroVentos: true,
    quatroKans: true,
    quatroRiichis: true,
  },
  nagashiMangan: true,
  chombo: { tipo: 'manganReverso' },
}

const REGRAS_PRESET: Record<IdPreset, RegrasPreset> = {
  padrao: REGRAS_PADRAO,

  /**
   * WRC Rules 2025, conferido em 01/11/2026 no livro oficial (resumo inicial e cap. 10):
   * https://www.worldriichi.org/s/WRC-Rules-2025-42fx.pdf
   * Página de regras: https://www.worldriichi.org/wrc-rules
   * Chombo: 30P, no documento de penalidades:
   * https://www.worldriichi.org/s/WRC-Penalties-2025.pdf
   */
  wrc: {
    tipoPartida: 'hanchan',
    pontosPartida: 30000,
    pontosRetorno: 30000,
    uma: [15, 5, -5, -15],
    ronMultiplo: 'atamaHane',
    tobi: false,
    agariYame: false,
    prorrogacao: false,
    palitosRestantes: 'perdidos',
    abortivos: SEM_ABORTIVOS,
    nagashiMangan: false,
    chombo: { tipo: 'fixo', valor: 30000 },
  },

  /**
   * EMA Riichi Rulebook 2025 v1.1, conferido em 01/11/2026 (seções 3.4, 3.7 e 4.1.4):
   * https://mahjong.dk/hubfs/Mahjong%20documents/Riichi/Riichi_Rulebook_2025_v1.1.pdf
   * O site da EMA (mahjong-europe.org) estava com certificado inválido nesse dia;
   * esta cópia é da federação da Dinamarca. O livro traz só o empate por exaustão,
   * sem empates abortivos e sem Nagashi Mangan. Chombo: 20.000 é o valor de torneio;
   * fora de torneio é Mangan reverso.
   */
  ema: {
    tipoPartida: 'hanchan',
    pontosPartida: 30000,
    pontosRetorno: 30000,
    uma: [15, 5, -5, -15],
    ronMultiplo: 'duploTriploPermitidos',
    tobi: false,
    agariYame: false,
    prorrogacao: false,
    palitosRestantes: 'primeiro',
    abortivos: SEM_ABORTIVOS,
    nagashiMangan: false,
    chombo: { tipo: 'fixo', valor: VALOR_CHOMBO_FIXO_PADRAO },
  },

  /**
   * M.League: NÃO conferido na fonte oficial. https://m-league.jp/about/ estava em
   * manutenção em 01/11/2026. Conferir lá e apagar este aviso. Valores tirados de:
   * https://ml-stadium.jp/rule/ (casa que usa a regra oficial)
   * https://janten.net/guide/m-league-rules (guia que cita os artigos da regra oficial)
   */
  mleague: {
    tipoPartida: 'hanchan',
    pontosPartida: 25000,
    pontosRetorno: 30000,
    uma: [30, 10, -10, -30],
    ronMultiplo: 'atamaHane',
    tobi: false,
    agariYame: false,
    prorrogacao: false,
    palitosRestantes: 'primeiro',
    abortivos: SEM_ABORTIVOS,
    nagashiMangan: false,
    chombo: { tipo: 'fixo', valor: VALOR_CHOMBO_FIXO_PADRAO },
  },

  /** Cerrado/ABM: por enquanto igual ao padrão do app. Ajustar os valores aqui. */
  cerrado: REGRAS_PADRAO,
}

export function configDoPreset(preset: IdPreset): ConfigMesa {
  const regras = REGRAS_PRESET[preset]
  return {
    ...regras,
    uma: [...regras.uma],
    abortivos: { ...regras.abortivos },
    chombo: { ...regras.chombo },
    preset,
    presetBase: preset,
    timerVez: 30,
    registrarDescartes: false,
  }
}

export type MudancaConfig = Partial<Omit<ConfigMesa, 'preset' | 'presetBase'>>

/** Mudar qualquer campo troca o preset para Personalizado. */
export function alterarConfig(config: ConfigMesa, mudanca: MudancaConfig): ConfigMesa {
  return { ...config, ...mudanca, preset: 'personalizado' }
}

/** Escolher "Personalizado" mantém os valores; escolher um preset aplica os dele. */
export function escolherPreset(config: ConfigMesa, preset: ConfigMesa['preset']): ConfigMesa {
  return preset === 'personalizado'
    ? { ...config, preset: 'personalizado' }
    : configDoPreset(preset)
}

export function reiniciarConfig(config: ConfigMesa): ConfigMesa {
  return configDoPreset(config.presetBase)
}

/** Oka total, que vai para o 1º: (retorno − partida) × 4. */
export function calcularOka(config: Pick<ConfigMesa, 'pontosPartida' | 'pontosRetorno'>) {
  return (config.pontosRetorno - config.pontosPartida) * 4
}

export function somaUma(uma: ConfigMesa['uma']) {
  return uma.reduce((soma, valor) => soma + valor, 0)
}

const numeroValido = (valor: unknown): valor is number =>
  typeof valor === 'number' && Number.isFinite(valor)

/**
 * Lê uma config salva sem confiar nela: o que faltar ou estiver inválido vem do
 * preset de origem, para uma versão futura com campo novo abrir sem quebrar.
 */
export function normalizarConfig(salva: unknown): ConfigMesa {
  const lida = (salva ?? {}) as Partial<ConfigMesa>
  const presetBase =
    lida.presetBase && IDS_PRESET.includes(lida.presetBase) ? lida.presetBase : 'padrao'
  const base = configDoPreset(presetBase)
  const umaValida =
    Array.isArray(lida.uma) && lida.uma.length === 4 && lida.uma.every(numeroValido)
  const chombo = lida.chombo
  const chomboValido =
    chombo?.tipo === 'manganReverso' || (chombo?.tipo === 'fixo' && numeroValido(chombo.valor))
  const booleano = (valor: unknown, reserva: boolean) =>
    typeof valor === 'boolean' ? valor : reserva

  return {
    preset:
      lida.preset === 'personalizado' || (lida.preset && IDS_PRESET.includes(lida.preset))
        ? lida.preset
        : base.preset,
    presetBase,
    tipoPartida: lida.tipoPartida === 'leste' || lida.tipoPartida === 'hanchan' ? lida.tipoPartida : base.tipoPartida,
    pontosPartida: numeroValido(lida.pontosPartida) ? lida.pontosPartida : base.pontosPartida,
    pontosRetorno: numeroValido(lida.pontosRetorno) ? lida.pontosRetorno : base.pontosRetorno,
    uma: umaValida ? (lida.uma as ConfigMesa['uma']) : base.uma,
    ronMultiplo:
      lida.ronMultiplo === 'atamaHane' ||
      lida.ronMultiplo === 'duploTriploAborta' ||
      lida.ronMultiplo === 'duploTriploPermitidos'
        ? lida.ronMultiplo
        : base.ronMultiplo,
    tobi: booleano(lida.tobi, base.tobi),
    agariYame: booleano(lida.agariYame, base.agariYame),
    prorrogacao: booleano(lida.prorrogacao, base.prorrogacao),
    palitosRestantes:
      lida.palitosRestantes === 'primeiro' || lida.palitosRestantes === 'perdidos'
        ? lida.palitosRestantes
        : base.palitosRestantes,
    abortivos: {
      kyuushuKyuuhai: booleano(lida.abortivos?.kyuushuKyuuhai, base.abortivos.kyuushuKyuuhai),
      quatroVentos: booleano(lida.abortivos?.quatroVentos, base.abortivos.quatroVentos),
      quatroKans: booleano(lida.abortivos?.quatroKans, base.abortivos.quatroKans),
      quatroRiichis: booleano(lida.abortivos?.quatroRiichis, base.abortivos.quatroRiichis),
    },
    nagashiMangan: booleano(lida.nagashiMangan, base.nagashiMangan),
    chombo: chomboValido ? (chombo as ConfigMesa['chombo']) : base.chombo,
    timerVez:
      lida.timerVez !== undefined && OPCOES_TIMER_VEZ.includes(lida.timerVez)
        ? lida.timerVez
        : base.timerVez,
    registrarDescartes: booleano(lida.registrarDescartes, base.registrarDescartes),
  }
}
