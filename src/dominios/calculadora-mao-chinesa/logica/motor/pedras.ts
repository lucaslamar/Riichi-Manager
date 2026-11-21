/**
 * Pedras, grupos e mão do motor de fan MCR. Porte em TypeScript do GB-Mahjong
 * (MIT © 2019-2020 Zheng Fan, https://github.com/zheng-fan/GB-Mahjong).
 * Os identificadores seguem o original: 1-9 caracteres (m), 10-18 bambus (s),
 * 19-27 círculos (p), 28-31 ventos (E S W N), 32-34 dragões (C F P).
 */

export const PEDRA = {
  m1: 1,
  s1: 10,
  p1: 19,
  E: 28,
  S: 29,
  W: 30,
  N: 31,
  C: 32,
  F: 33,
  P: 34,
} as const
/** Fim (exclusivo) dos identificadores válidos, como TILE_SIZE no original (inclui flores). */
export const FIM_PEDRAS = 43

export const NAIPE = {
  invalido: 0,
  caracteres: 1,
  bambus: 2,
  circulos: 3,
  flor: 4,
  vento: 5,
  dragao: 6,
} as const

export interface Pedra {
  id: number
  /** 1 = pedra do tsumo, 2 = pedra do ron, 0 = pedra comum. Só vale para a pedra da batida. */
  marca: number
}

export const bit = (id: number) => 1n << BigInt(id)
const mapa = (ids: number[]) => ids.reduce((acc, id) => acc | bit(id), 0n)
const faixa = (inicio: number, fim: number) =>
  mapa(Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i))
const numeros = (...valores: number[]) => mapa(valores.flatMap((v) => [v, v + 9, v + 18]))

export const MAPA = (() => {
  const caracteres = faixa(1, 9)
  const bambus = faixa(10, 18)
  const circulos = faixa(19, 27)
  const numericas = caracteres | bambus | circulos
  const ventos = faixa(28, 31)
  const dragoes = faixa(32, 34)
  const honras = ventos | dragoes
  const quanda = numeros(7, 8, 9)
  const quanxiao = numeros(1, 2, 3)
  return {
    caracteres,
    bambus,
    circulos,
    numericas,
    ventos,
    dragoes,
    honras,
    validas: numericas | honras,
    yaojiu: honras | numeros(1, 9),
    verdes: mapa([11, 12, 13, 15, 17, PEDRA.F]),
    quanda,
    quanzhong: numeros(4, 5, 6),
    quanxiao,
    dayuwu: quanda | numeros(6),
    xiaoyuwu: quanxiao | numeros(4),
    tuibudao: mapa([11, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 26, 27, PEDRA.P]),
  }
})()

export function naipe(id: number): number {
  if (id >= 1 && id <= 9) return NAIPE.caracteres
  if (id >= 10 && id <= 18) return NAIPE.bambus
  if (id >= 19 && id <= 27) return NAIPE.circulos
  if (id >= 28 && id <= 31) return NAIPE.vento
  if (id >= 32 && id <= 34) return NAIPE.dragao
  if (id >= 35 && id <= 42) return NAIPE.flor
  return NAIPE.invalido
}

export const numero = (id: number) => (id >= 1 && id <= 27 ? ((id - 1) % 9) + 1 : 0)
const pertence = (id: number, grupo: bigint) => (bit(id) & grupo) === bit(id)
export const ehNumerica = (id: number) => pertence(id, MAPA.numericas)
export const ehHonra = (id: number) => pertence(id, MAPA.honras)
export const ehVento = (id: number) => pertence(id, MAPA.ventos)
export const ehDragao = (id: number) => pertence(id, MAPA.dragoes)
export const ehYaojiu = (id: number) => pertence(id, MAPA.yaojiu)

export const TIPO_GRUPO = {
  invalido: 0,
  sequencia: 1,
  trinca: 2,
  kan: 3,
  par: 4,
  dragaoCombinado: 5,
} as const

/** As seis formas do Knitted Straight (组合龙). */
export const MAPAS_DRAGAO_COMBINADO: readonly bigint[] = [
  0n,
  mapa([1, 4, 7, 11, 14, 17, 21, 24, 27]),
  mapa([1, 4, 7, 12, 15, 18, 20, 23, 26]),
  mapa([2, 5, 8, 10, 13, 16, 21, 24, 27]),
  mapa([2, 5, 8, 12, 15, 18, 19, 22, 25]),
  mapa([3, 6, 9, 10, 13, 16, 20, 23, 26]),
  mapa([3, 6, 9, 11, 14, 17, 19, 22, 25]),
]

export interface Grupo {
  tipo: number
  /** Pedra que representa o grupo: a do meio na sequência. */
  meio: number
  dragaoCombinado: number
  /**
   * Origem, como `_offer` no original: 0 fechado, 1-3 chamado (5-7 kan somado),
   * negativo quando o grupo contém a pedra da batida (-1 tsumo, -2 ron).
   */
  oferta: number
}

export const grupo = (tipo: number, meio: number, oferta = 0, dragaoCombinado = 0): Grupo => ({
  tipo,
  meio,
  dragaoCombinado,
  oferta,
})

export const ehFechado = (g: Grupo) => g.oferta === 0 || g.oferta === -1
export const temPedraDaBatida = (g: Grupo) => g.oferta < 0
export const ehTrincaOuKan = (g: Grupo) => g.tipo === TIPO_GRUPO.trinca || g.tipo === TIPO_GRUPO.kan
export const mesmoGrupo = (a: Grupo, b: Grupo) => a.tipo === b.tipo && a.meio === b.meio

export function pedrasDoGrupo(g: Grupo): number[] {
  switch (g.tipo) {
    case TIPO_GRUPO.sequencia:
      return [g.meio - 1, g.meio, g.meio + 1]
    case TIPO_GRUPO.kan:
      return [g.meio, g.meio, g.meio, g.meio]
    case TIPO_GRUPO.trinca:
      return [g.meio, g.meio, g.meio]
    case TIPO_GRUPO.par:
      return [g.meio, g.meio]
    case TIPO_GRUPO.dragaoCombinado:
      return Array.from({ length: 27 }, (_, i) => i + 1).filter(
        (id) => (MAPAS_DRAGAO_COMBINADO[g.dragaoCombinado] & bit(id)) !== 0n,
      )
    default:
      return []
  }
}

export interface MaoGb {
  /** Grupos declarados, incluindo kan fechado. */
  chamados: Grupo[]
  /** Pedras da mão; a última é a da batida. */
  pedras: Pedra[]
  ventoRodada: number
  ventoAssento: number
  tsumo: boolean
  ultimaDoTipo: boolean
  ultimaDaParede: boolean
  kan: boolean
}

export function mapaChamados(mao: MaoGb): bigint {
  let acc = 0n
  for (const g of mao.chamados) {
    if (g.tipo === TIPO_GRUPO.sequencia) acc |= bit(g.meio - 1) | bit(g.meio) | bit(g.meio + 1)
    else if (g.tipo !== TIPO_GRUPO.dragaoCombinado) acc |= bit(g.meio)
  }
  return acc
}

export const mapaPedras = (mao: MaoGb) => mao.pedras.reduce((acc, p) => acc | bit(p.id), 0n)
export const contarNasPedras = (mao: MaoGb, id: number) =>
  mao.pedras.filter((p) => p.id === id).length
export const contarNosChamados = (mao: MaoGb, id: number) =>
  mao.chamados.flatMap(pedrasDoGrupo).filter((p) => p === id).length
export const contarNaMao = (mao: MaoGb, id: number) =>
  contarNasPedras(mao, id) + contarNosChamados(mao, id)
export const pedraDaBatida = (mao: MaoGb) => mao.pedras[mao.pedras.length - 1]
export const ehMaoFechada = (mao: MaoGb) => mao.chamados.every(ehFechado)
export const semChamados = (mao: MaoGb) => mao.chamados.length === 0
export const todaChamada = (mao: MaoGb) =>
  mao.chamados.length === 4 && mao.chamados.every((g) => !ehFechado(g))

export function contarBits(n: bigint): number {
  let c = 0
  while (n) {
    n &= n - 1n
    c++
  }
  return c
}
