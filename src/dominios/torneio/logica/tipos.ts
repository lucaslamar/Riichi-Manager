/**
 * Tipos do torneio. Os resultados não ficam aqui: cada mesa jogada é uma Partida
 * do Centerpiece com `vinculoTorneio`, que é a fonte única para os dois rankings.
 */
import type { ConfigMesa } from '@/dominios/centerpiece/logica/configMesa'
import type { RegrasSanma, Variante } from '@/compartilhado/mahjong/variante'

export type FormatoTorneio = 'rodizio' | 'suico' | 'eliminatorio' | 'corridos' | 'temporada'

export type ConfigFormato =
  | { tipo: 'rodizio'; rodadas: number }
  | { tipo: 'suico'; rodadas: number }
  | {
      tipo: 'eliminatorio'
      classificatoria: 'rodizio' | 'suico'
      rodadasClassificatoria: number
      /** Quantos seguem em cada corte, do primeiro ao último (16 → 8 → 4). */
      cortes: number[]
      rodadasPorFase: number
      pontosCarregados: boolean
    }
  | { tipo: 'corridos' }
  /** Um encontro de uma temporada de pontos corridos. */
  | { tipo: 'temporada'; temporadaId: string }

/** Guarda o instante em vez de descontar a cada segundo: sobrevive a fechar o app. */
export interface Relogio {
  totalSegundos: number
  acrescimoSegundos: number
  /** Tempo já corrido antes do último início. */
  corridoSegundos: number
  /** `Date.now()` do último início; `null` = parado. */
  iniciadoEm: number | null
}

/** Assentos na ordem 東 南 西 北, com o id do cadastro. No Sanma, o 北 fica `''`. */
export type AssentosMesa = [string, string, string, string]

export interface MesaTorneio {
  /** Começa em 1. */
  numero: number
  assentos: AssentosMesa
  relogio?: Relogio
}

export interface RodadaTorneio {
  /** Começa em 1. */
  numero: number
  /** Eliminatório: 0 é a classificatória, 1 o primeiro corte e assim por diante. */
  fase?: number
  mesas: MesaTorneio[]
  geradaEm: string
  relogio?: Relogio
}

export interface TimersTorneio {
  /** Timer geral da rodada, em segundos. */
  rodadaSegundos: number
  porMesa: boolean
}

export type StatusTorneio = 'rascunho' | 'em_andamento' | 'finalizado'

export interface Torneio {
  id: string
  nome: string
  /** Dia do encontro, `AAAA-MM-DD`. */
  data: string
  formato: ConfigFormato
  config: ConfigMesa
  timers: TimersTorneio
  jogadorIds: string[]
  /** Quem joga sem cadastro: id de convidado e o nome escrito na lista. */
  convidados?: Record<string, string>
  /** O app já diz o vento de cada um. Ausente: o padrão do formato (`sorteiaVentos`). */
  sortearVentos?: boolean
  rodadas: RodadaTorneio[]
  status: StatusTorneio
  /** Este aparelho passou o torneio adiante: fica só leitura. */
  transferidoEm?: string
  criadoEm: string
  atualizadoEm: string
  finalizadoEm?: string
  /** Sanma (mesas de 3). Escolhido na criação e travado depois. Ausente = yonma. */
  variante?: Variante
  /** Regras de Sanma copiadas ao criar, para as mesas abertas no Centerpiece. */
  regrasSanma?: RegrasSanma
}

export type CriterioTemporada =
  | { tipo: 'soma' }
  | { tipo: 'media'; minimoPartidas: number }
  | { tipo: 'melhores'; quantidade: number }

export interface Temporada {
  id: string
  nome: string
  inicio: string
  fim: string
  criterio: CriterioTemporada
  config: ConfigMesa
  criadaEm: string
}

/** Lista guardada pelo cartão de memória. */
export interface ListaSalva {
  id: string
  nome: string
  texto: string
  salvaEm: string
}
