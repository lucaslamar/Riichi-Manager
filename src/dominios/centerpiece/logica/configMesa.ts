/**
 * Regras de uma mesa, usadas pelo Centerpiece e pelo Torneio, em TypeScript puro.
 * A partida guarda uma cópia: mudar um preset depois não altera partida já jogada.
 */
import {
  configuracaoPadrao,
  type ConfiguracaoCalculo,
} from '@/compartilhado/mahjong/pontuacao/configuracao'
import { normalizarUma, somaUma, umaFixa, type UmaMesa } from './uma'

export { somaUma }

export type IdPreset = 'padrao' | 'wrc' | 'ema' | 'mleague'

export interface ConfigMesa {
  preset: IdPreset | 'personalizado'
  /** Preset de origem: é para ele que "Reiniciar" volta depois de virar Personalizado. */
  presetBase: IdPreset
  tipoPartida: 'leste' | 'hanchan'
  pontosPartida: number
  pontosRetorno: number
  /** Do 1º ao 4º, em milhares de pontos (+15 = 15.000). */
  uma: UmaMesa
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
  chombo: { tipo: 'manganReverso' } | { tipo: 'yakumanReverso' } | { tipo: 'fixo'; valor: number }
  /** Decididas ao criar a mesa; valem para todas as mãos da partida. */
  regrasCalculo: ConfiguracaoCalculo
  /** Segundos por vez; 0 = desligado. */
  timerVez: 0 | 30 | 60 | 90
  registrarDescartes: boolean
  /** Só vale com o registro de descartes ligado. */
  checarFuriten: boolean
}

export const IDS_PRESET: readonly IdPreset[] = ['padrao', 'wrc', 'ema', 'mleague']
export const OPCOES_TIMER_VEZ: readonly ConfigMesa['timerVez'][] = [0, 30, 60, 90]

/** Multa de chombo fixo sugerida ao trocar de tipo; é a da EMA e da M.League. */
export const VALOR_CHOMBO_FIXO_PADRAO = 20000

const SEM_ABORTIVOS: ConfigMesa['abortivos'] = {
  kyuushuKyuuhai: false,
  quatroVentos: false,
  quatroKans: false,
  quatroRiichis: false,
}

/**
 * Regras de cálculo dos presets oficiais: as variações saem, e o que a tabela do
 * projeto não fixa (yakuman acumulado e duplo, kazoe, fu em Rinshan) segue o padrão
 * do app. Conferir essas quatro nas fontes de cada preset.
 */
const regrasOficiais = (akadora: boolean): ConfiguracaoCalculo => ({
  ...configuracaoPadrao,
  akadora,
  tanyaoAberto: true,
  doraFlamejante: false,
  basengo: false,
  kiriageMangan: false,
  fuVentosDuplo: false,
})

/** Regras próprias de cada preset; timer e descartes são preferências da mesa. */
type RegrasPreset = Omit<
  ConfigMesa,
  'preset' | 'presetBase' | 'timerVez' | 'registrarDescartes' | 'checarFuriten'
>

/** Padrão de clube, para iniciantes: regras simples e partida que acaba no horário. */
const REGRAS_PADRAO: RegrasPreset = {
  tipoPartida: 'leste',
  pontosPartida: 25000,
  pontosRetorno: 30000,
  uma: umaFixa([15, 5, -5, -15]),
  ronMultiplo: 'atamaHane',
  tobi: true,
  agariYame: true,
  prorrogacao: false,
  palitosRestantes: 'primeiro',
  abortivos: SEM_ABORTIVOS,
  nagashiMangan: true,
  chombo: { tipo: 'manganReverso' },
  regrasCalculo: configuracaoPadrao,
}

const REGRAS_PRESET: Record<IdPreset, RegrasPreset> = {
  padrao: REGRAS_PADRAO,

  /**
   * WRC Rules 2025, conferido em 01/11/2026 no livro oficial (resumo inicial e cap. 10):
   * https://static1.squarespace.com/static/634a7884c297a25f06589b79/t/6834d67360e19c1da6c0d12c/1748293243651/WRC+Rules+2025.pdf
   * Página de regras: https://www.worldriichi.org/wrc-rules
   * Chombo: 30P, no documento de penalidades:
   * https://www.worldriichi.org/s/WRC-Penalties-2025.pdf
   */
  wrc: {
    tipoPartida: 'hanchan',
    pontosPartida: 30000,
    pontosRetorno: 30000,
    uma: umaFixa([15, 5, -5, -15]),
    ronMultiplo: 'atamaHane',
    tobi: false,
    agariYame: false,
    prorrogacao: false,
    palitosRestantes: 'perdidos',
    abortivos: SEM_ABORTIVOS,
    nagashiMangan: false,
    chombo: { tipo: 'fixo', valor: 30000 },
    regrasCalculo: regrasOficiais(false),
  },

  /**
   * EMA, conferido no livro de 2016 e no de 2025 (seções 3.4, 3.7 e 4.1.4):
   * https://mahjong-mil.org/wp-content/uploads/2024/08/riichirules2016.pdf
   * Chombo: -20.000 no resultado final, o valor de competição.
   */
  ema: {
    tipoPartida: 'hanchan',
    pontosPartida: 30000,
    pontosRetorno: 30000,
    uma: umaFixa([15, 5, -5, -15]),
    ronMultiplo: 'duploTriploPermitidos',
    tobi: false,
    agariYame: false,
    prorrogacao: false,
    palitosRestantes: 'primeiro',
    abortivos: SEM_ABORTIVOS,
    nagashiMangan: false,
    chombo: { tipo: 'fixo', valor: VALOR_CHOMBO_FIXO_PADRAO },
    regrasCalculo: regrasOficiais(false),
  },

  /**
   * M.League: https://m-league.jp/ (resumo em https://dic.nicovideo.jp/a/m%E3%83%AA%E3%83%BC%E3%82%B0).
   * Palitos que sobram: não encontrado na fonte oficial, conferir.
   * Chombo: -20 pt no resultado final.
   */
  mleague: {
    tipoPartida: 'hanchan',
    pontosPartida: 25000,
    pontosRetorno: 30000,
    uma: umaFixa([30, 10, -10, -30]),
    ronMultiplo: 'atamaHane',
    tobi: false,
    agariYame: false,
    prorrogacao: false,
    palitosRestantes: 'primeiro',
    abortivos: SEM_ABORTIVOS,
    nagashiMangan: false,
    chombo: { tipo: 'fixo', valor: VALOR_CHOMBO_FIXO_PADRAO },
    regrasCalculo: regrasOficiais(true),
  },
}

export function configDoPreset(preset: IdPreset): ConfigMesa {
  const regras = REGRAS_PRESET[preset]
  return {
    ...regras,
    uma: structuredClone(regras.uma),
    abortivos: { ...regras.abortivos },
    chombo: { ...regras.chombo },
    regrasCalculo: { ...regras.regrasCalculo },
    preset,
    presetBase: preset,
    timerVez: preset === 'padrao' ? 60 : 30,
    registrarDescartes: false,
    checarFuriten: false,
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

function normalizarRegras(salvas: unknown): ConfiguracaoCalculo {
  const lidas = (salvas ?? {}) as Partial<ConfiguracaoCalculo>
  const regras = { ...configuracaoPadrao }
  for (const chave of Object.keys(regras) as (keyof ConfiguracaoCalculo)[]) {
    const valor = lidas[chave]
    if (typeof valor === 'boolean') regras[chave] = valor
  }
  return regras
}

const numeroValido = (valor: unknown): valor is number =>
  typeof valor === 'number' && Number.isFinite(valor)

/**
 * Lê uma config salva sem confiar nela: o que faltar ou estiver inválido vem do
 * preset de origem, para uma versão futura com campo novo abrir sem quebrar.
 */
export function normalizarConfig(salva: unknown): ConfigMesa {
  const lida = (salva ?? {}) as Partial<ConfigMesa>
  // O preset Cerrado/ABM saiu: quem o usava fica em Personalizado, com os mesmos valores.
  const presetSalvo = lida.preset as string | undefined
  const presetBase =
    lida.presetBase && IDS_PRESET.includes(lida.presetBase) ? lida.presetBase : 'padrao'
  const base = configDoPreset(presetBase)
  const chombo = lida.chombo
  const chomboValido =
    chombo?.tipo === 'manganReverso' ||
    chombo?.tipo === 'yakumanReverso' ||
    (chombo?.tipo === 'fixo' && numeroValido(chombo.valor))
  const booleano = (valor: unknown, reserva: boolean) =>
    typeof valor === 'boolean' ? valor : reserva

  return {
    preset:
      presetSalvo === 'cerrado'
        ? 'personalizado'
        : lida.preset === 'personalizado' || (lida.preset && IDS_PRESET.includes(lida.preset))
          ? lida.preset
          : base.preset,
    presetBase,
    tipoPartida: lida.tipoPartida === 'leste' || lida.tipoPartida === 'hanchan' ? lida.tipoPartida : base.tipoPartida,
    pontosPartida: numeroValido(lida.pontosPartida) ? lida.pontosPartida : base.pontosPartida,
    pontosRetorno: numeroValido(lida.pontosRetorno) ? lida.pontosRetorno : base.pontosRetorno,
    uma: normalizarUma(lida.uma, base.uma),
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
    // Partida criada antes desta opção usa o padrão atual da calculadora.
    regrasCalculo: normalizarRegras(lida.regrasCalculo),
    timerVez:
      lida.timerVez !== undefined && OPCOES_TIMER_VEZ.includes(lida.timerVez)
        ? lida.timerVez
        : base.timerVez,
    registrarDescartes: booleano(lida.registrarDescartes, base.registrarDescartes),
    checarFuriten: booleano(lida.checarFuriten, base.checarFuriten),
  }
}
