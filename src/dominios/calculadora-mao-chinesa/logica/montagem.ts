/**
 * Montagem da mão chinesa: pedras da mão, chamadas e condições da batida, e a
 * conversão para o formato do motor de fan. A última pedra da mão é a da batida.
 */
import { ehNumerica, grupo, numero, PEDRA, TIPO_GRUPO, type MaoGb } from './motor/pedras'
import type { FormaBatida } from './tipos'

export type TipoChamada = 'chi' | 'pon' | 'kanAberto' | 'kanFechado'
export type ModoEntrada = 'mao' | TipoChamada

export interface Chamada {
  tipo: TipoChamada
  /** Pedra do meio na sequência; a própria pedra nas trincas e kans. */
  meio: number
}

export interface MaoChinesa {
  pedras: number[]
  chamadas: Chamada[]
}

export type Vento = typeof PEDRA.E | typeof PEDRA.S | typeof PEDRA.W | typeof PEDRA.N

export interface CondicoesMcr {
  forma: FormaBatida
  ventoRodada: Vento
  ventoAssento: Vento
  /** Tsumo: Last Tile Draw. Ron: Last Tile Claim. */
  ultimaPedra: boolean
  /** Tsumo: Out with Replacement Tile. Ron: Robbing the Kong. */
  kan: boolean
  /** Last Tile: a quarta pedra do tipo, as outras três já à vista. */
  ultimaDoTipo: boolean
  flores: number
}

export const MAO_CHINESA_VAZIA: MaoChinesa = { pedras: [], chamadas: [] }

export const CONDICOES_PADRAO: CondicoesMcr = {
  forma: 'ron',
  ventoRodada: PEDRA.E,
  ventoAssento: PEDRA.E,
  ultimaPedra: false,
  kan: false,
  ultimaDoTipo: false,
  flores: 0,
}

export const PEDRAS_MCR: readonly number[] = Array.from({ length: 34 }, (_, i) => i + 1)
const TAMANHO_MAO = 14

export function pedrasDaChamada({ tipo, meio }: Chamada): number[] {
  if (tipo === 'chi') return [meio - 1, meio, meio + 1]
  if (tipo === 'pon') return [meio, meio, meio]
  return [meio, meio, meio, meio]
}

/** Pedras contadas para o tamanho da mão: kan conta como três. */
export const pedrasContadas = (mao: MaoChinesa) => mao.pedras.length + mao.chamadas.length * 3
export const maoCompleta = (mao: MaoChinesa) => pedrasContadas(mao) === TAMANHO_MAO
export const maoVazia = (mao: MaoChinesa) => mao.pedras.length === 0 && mao.chamadas.length === 0

function quantas(mao: MaoChinesa, id: number) {
  return [...mao.pedras, ...mao.chamadas.flatMap(pedrasDaChamada)].filter((p) => p === id).length
}

/** A sequência do chi começa na pedra tocada (1 a 7 de cada naipe). */
function chamadaDoToque(tipo: TipoChamada, id: number): Chamada | null {
  if (tipo !== 'chi') return { tipo, meio: id }
  if (!ehNumerica(id) || numero(id) > 7) return null
  return { tipo, meio: id + 1 }
}

export function podeAdicionar(mao: MaoChinesa, modo: ModoEntrada, id: number): boolean {
  if (modo === 'mao') return pedrasContadas(mao) < TAMANHO_MAO && quantas(mao, id) < 4
  const chamada = chamadaDoToque(modo, id)
  if (!chamada || mao.chamadas.length >= 4 || pedrasContadas(mao) + 3 > TAMANHO_MAO) return false
  const teste = { ...mao, chamadas: [...mao.chamadas, chamada] }
  return pedrasDaChamada(chamada).every((p) => quantas(teste, p) <= 4)
}

export function adicionar(mao: MaoChinesa, modo: ModoEntrada, id: number): MaoChinesa {
  if (!podeAdicionar(mao, modo, id)) return mao
  if (modo === 'mao') return { ...mao, pedras: [...mao.pedras, id] }
  return { ...mao, chamadas: [...mao.chamadas, chamadaDoToque(modo, id)!] }
}

export function removerPedra(mao: MaoChinesa, indice: number): MaoChinesa {
  return { ...mao, pedras: mao.pedras.filter((_, i) => i !== indice) }
}

export function removerChamada(mao: MaoChinesa, indice: number): MaoChinesa {
  return { ...mao, chamadas: mao.chamadas.filter((_, i) => i !== indice) }
}

export type ErroMaoMcr = 'incompleta' | 'semKan' | 'rouboDoKan' | 'ultimaDoTipo'

/** Combinações que o GB-Mahjong recusa ao ler a mão. */
export function validarMao(mao: MaoChinesa, condicoes: CondicoesMcr): ErroMaoMcr | null {
  if (!maoCompleta(mao)) return 'incompleta'
  const batida = mao.pedras[mao.pedras.length - 1]
  if (condicoes.kan && condicoes.forma === 'tsumo' && !mao.chamadas.some((c) => c.tipo.startsWith('kan'))) return 'semKan'
  if (condicoes.kan && condicoes.forma === 'ron' && (condicoes.ultimaPedra || quantas(mao, batida) > 1)) return 'rouboDoKan'
  if (condicoes.ultimaDoTipo && mao.pedras.filter((p) => p === batida).length > 1) return 'ultimaDoTipo'
  return null
}

export function paraMotor(mao: MaoChinesa, condicoes: CondicoesMcr): MaoGb {
  const tsumo = condicoes.forma === 'tsumo'
  const ultima = mao.pedras.length - 1
  return {
    chamados: mao.chamadas.map(({ tipo, meio }) => {
      if (tipo === 'chi') return grupo(TIPO_GRUPO.sequencia, meio, 1)
      if (tipo === 'pon') return grupo(TIPO_GRUPO.trinca, meio, 1)
      return grupo(TIPO_GRUPO.kan, meio, tipo === 'kanFechado' ? 0 : 1)
    }),
    pedras: mao.pedras.map((id, i) => ({ id, marca: i === ultima ? (tsumo ? 1 : 2) : 0 })),
    ventoRodada: condicoes.ventoRodada,
    ventoAssento: condicoes.ventoAssento,
    tsumo,
    ultimaDoTipo: condicoes.ultimaDoTipo,
    ultimaDaParede: condicoes.ultimaPedra,
    kan: condicoes.kan,
  }
}
