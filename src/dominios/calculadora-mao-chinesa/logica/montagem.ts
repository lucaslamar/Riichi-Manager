/**
 * Montagem da mão chinesa: pedras da mão, chamadas, flores e condições da batida,
 * e a conversão para o formato do motor de fan. A última pedra da mão é a da batida.
 */
import { ehNumerica, grupo, naipe, PEDRA, TIPO_GRUPO, type MaoGb } from './motor/pedras'
import type { FormaBatida } from './tipos'

export type TipoChamada = 'chi' | 'pon' | 'kanAberto' | 'kanFechado'

export interface Chamada {
  tipo: TipoChamada
  /** Pedra do meio na sequência; a própria pedra nas trincas e kans. */
  meio: number
}

/**
 * Flores (1 a 4: ameixa, orquídea, crisântemo e bambu) e estações (5 a 8:
 * primavera, verão, outono e inverno). No MCR todas valem 1 fan e nenhuma tem
 * função própria: só o desenho muda.
 */
export type Flor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type TipoFlor = 'flor' | 'estacao'

export interface MaoChinesa {
  pedras: number[]
  chamadas: Chamada[]
  flores: Flor[]
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
}

export const MAO_CHINESA_VAZIA: MaoChinesa = { pedras: [], chamadas: [], flores: [] }

export const CONDICOES_PADRAO: CondicoesMcr = {
  forma: 'ron',
  ventoRodada: PEDRA.E,
  ventoAssento: PEDRA.E,
  ultimaPedra: false,
  kan: false,
  ultimaDoTipo: false,
}

const TAMANHO_MAO = 14

export function pedrasDaChamada({ tipo, meio }: Chamada): number[] {
  if (tipo === 'chi') return [meio - 1, meio, meio + 1]
  if (tipo === 'pon') return [meio, meio, meio]
  return [meio, meio, meio, meio]
}

/** Pedras contadas para o tamanho da mão: kan conta como três. Flores não contam. */
export const pedrasContadas = (mao: MaoChinesa) => mao.pedras.length + mao.chamadas.length * 3
export const maoCompleta = (mao: MaoChinesa) => pedrasContadas(mao) === TAMANHO_MAO
export const maoVazia = (mao: MaoChinesa) =>
  mao.pedras.length === 0 && mao.chamadas.length === 0 && mao.flores.length === 0

function quantas(mao: MaoChinesa, id: number) {
  return [...mao.pedras, ...mao.chamadas.flatMap(pedrasDaChamada)].filter((p) => p === id).length
}

const cabeChamada = (mao: MaoChinesa, chamada: Chamada) => {
  if (mao.chamadas.length >= 4 || pedrasContadas(mao) + 3 > TAMANHO_MAO) return false
  const teste = { ...mao, chamadas: [...mao.chamadas, chamada] }
  return pedrasDaChamada(chamada).every((p) => quantas(teste, p) <= 4)
}

/** Sequências do Chi que usam a pedra tocada (o meio de cada uma), como na calculadora japonesa. */
export function sequenciasDoChi(mao: MaoChinesa, id: number): number[] {
  if (!ehNumerica(id)) return []
  return [id - 1, id, id + 1].filter(
    (meio) =>
      ehNumerica(meio - 1) &&
      ehNumerica(meio + 1) &&
      naipe(meio - 1) === naipe(id) &&
      naipe(meio + 1) === naipe(id) &&
      cabeChamada(mao, { tipo: 'chi', meio }),
  )
}

export function podeAdicionarPedra(mao: MaoChinesa, id: number): boolean {
  return pedrasContadas(mao) < TAMANHO_MAO && quantas(mao, id) < 4
}

export function podeChamar(mao: MaoChinesa, tipo: TipoChamada, id: number): boolean {
  if (tipo === 'chi') return sequenciasDoChi(mao, id).length > 0
  return cabeChamada(mao, { tipo, meio: id })
}

export function adicionarPedra(mao: MaoChinesa, id: number): MaoChinesa {
  return podeAdicionarPedra(mao, id) ? { ...mao, pedras: [...mao.pedras, id] } : mao
}

export function adicionarChamada(mao: MaoChinesa, chamada: Chamada): MaoChinesa {
  return cabeChamada(mao, chamada) ? { ...mao, chamadas: [...mao.chamadas, chamada] } : mao
}

export function removerPedra(mao: MaoChinesa, indice: number): MaoChinesa {
  return { ...mao, pedras: mao.pedras.filter((_, i) => i !== indice) }
}

export function removerChamada(mao: MaoChinesa, indice: number): MaoChinesa {
  return { ...mao, chamadas: mao.chamadas.filter((_, i) => i !== indice) }
}

/** A pedra tocada vira a da batida: vai para o fim da mão. */
export function escolherBatida(mao: MaoChinesa, indice: number): MaoChinesa {
  if (indice < 0 || indice >= mao.pedras.length) return mao
  const pedras = mao.pedras.filter((_, i) => i !== indice)
  return { ...mao, pedras: [...pedras, mao.pedras[indice]] }
}

const PRIMEIRA: Record<TipoFlor, Flor> = { flor: 1, estacao: 5 }

/** A próxima flor (ou estação) que ainda não está na mão, ou nenhuma se as quatro já estão. */
export function proximaFlor(mao: MaoChinesa, tipo: TipoFlor): Flor | null {
  for (let i = 0; i < 4; i++) {
    const flor = (PRIMEIRA[tipo] + i) as Flor
    if (!mao.flores.includes(flor)) return flor
  }
  return null
}

export function adicionarFlor(mao: MaoChinesa, tipo: TipoFlor): MaoChinesa {
  const flor = proximaFlor(mao, tipo)
  return flor ? { ...mao, flores: [...mao.flores, flor].sort((a, b) => a - b) } : mao
}

export function removerFlor(mao: MaoChinesa, flor: Flor): MaoChinesa {
  return { ...mao, flores: mao.flores.filter((atual) => atual !== flor) }
}

export type ErroMaoMcr = 'incompleta' | 'semKan' | 'rouboDoKan' | 'ultimaDoTipo'

/** Combinações que o GB-Mahjong recusa ao ler a mão. */
export function validarMao(mao: MaoChinesa, condicoes: CondicoesMcr): ErroMaoMcr | null {
  if (!maoCompleta(mao)) return 'incompleta'
  const batida = mao.pedras[mao.pedras.length - 1]
  if (
    condicoes.kan &&
    condicoes.forma === 'tsumo' &&
    !mao.chamadas.some((c) => c.tipo.startsWith('kan'))
  )
    return 'semKan'
  if (
    condicoes.kan &&
    condicoes.forma === 'ron' &&
    (condicoes.ultimaPedra || quantas(mao, batida) > 1)
  )
    return 'rouboDoKan'
  if (condicoes.ultimaDoTipo && mao.pedras.filter((p) => p === batida).length > 1)
    return 'ultimaDoTipo'
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
