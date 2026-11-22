/**
 * "Partida em andamento": a partida jogada fora do app, salva para continuar. Modelo
 * próprio e só de dados serializáveis, para o React Native. Não é a `Partida` do
 * placar, que tem mãos, vez e descartes.
 */
import { normalizarConfig, type ConfigMesa } from './configMesa'
import { ORDEM_VENTOS, type Cadeira, type Vento } from './partida'
import { CONJUNTOS_REGISTRO, type ConjuntoRegistro } from './regrasPontuacao'

const VERSAO = 1

/** O que não está nos cards e a pessoa informa ao salvar. */
export interface Andamento {
  rodada: { vento: Vento; numero: 1 | 2 | 3 | 4 }
  honba: number
  cadeiraDealer: Cadeira
  /** Sticks de riichi na mesa. */
  palitos: number
}

export interface AssentoPausado {
  cadeira: Cadeira
  /** O vento com que começou, que é o lugar na lista. */
  vento: Vento
  jogadorId: string | null
  /** Guardado para convidado e para quem sair do cadastro. */
  nome: string
  pontos: number | null
  saiu: boolean
}

export interface PartidaPausada extends Andamento {
  versao: typeof VERSAO
  id: string
  salvaEm: string
  assentos: AssentoPausado[]
  /** false: os lugares não dizem quem começou de Leste. */
  ordemDosVentos: boolean
  conjunto: ConjuntoRegistro
  /** Cópia inteira das regras: mudar um preset depois não altera a partida salva. */
  config: ConfigMesa
  /** Mesa sorteada do clube. */
  encontro?: { id: string; mesa: number }
}

export const ANDAMENTO_INICIAL: Andamento = {
  rodada: { vento: 'leste', numero: 1 },
  honba: 0,
  cadeiraDealer: 0,
  palitos: 0,
}

/** Na ordem dos ventos, o dealer da mão N é quem sentou no lugar N. */
export function dealerDaRodada(numero: Andamento['rodada']['numero']): Cadeira {
  return (numero - 1) as Cadeira
}

export function criarPartidaPausada(
  dados: Omit<PartidaPausada, 'versao' | 'assentos'> & {
    assentos: readonly Omit<AssentoPausado, 'cadeira' | 'vento'>[]
  },
): PartidaPausada {
  return {
    ...dados,
    versao: VERSAO,
    assentos: dados.assentos.map((assento, indice) => ({
      ...assento,
      cadeira: indice as Cadeira,
      vento: ORDEM_VENTOS[indice],
    })),
  }
}

const inteiro = (valor: unknown, minimo: number, maximo = Infinity) =>
  Number.isInteger(valor) && (valor as number) >= minimo && (valor as number) <= maximo

function assentoValido(valor: unknown): boolean {
  const assento = valor as Partial<AssentoPausado> | null
  if (!assento || typeof assento.nome !== 'string' || typeof assento.saiu !== 'boolean') return false
  if (assento.jogadorId !== null && typeof assento.jogadorId !== 'string') return false
  return assento.pontos === null || Number.isFinite(assento.pontos)
}

/** Lê uma salva sem confiar nela. null: não dá para retomar. */
export function lerPartidaPausada(valor: unknown): PartidaPausada | null {
  const lida = valor as Partial<PartidaPausada> | null
  if (lida?.versao !== VERSAO || typeof lida.id !== 'string') return null
  if (typeof lida.salvaEm !== 'string' || Number.isNaN(Date.parse(lida.salvaEm))) return null
  const { rodada, assentos } = lida
  if (!rodada || !ORDEM_VENTOS.includes(rodada.vento) || !inteiro(rodada.numero, 1, 4)) return null
  if (!inteiro(lida.honba, 0) || !inteiro(lida.palitos, 0)) return null
  if (!inteiro(lida.cadeiraDealer, 0, 3)) return null
  if (!Array.isArray(assentos) || assentos.length !== 4 || !assentos.every(assentoValido)) return null
  if (!CONJUNTOS_REGISTRO.includes(lida.conjunto as ConjuntoRegistro) || !lida.config) return null
  return { ...(lida as PartidaPausada), config: normalizarConfig(lida.config) }
}
