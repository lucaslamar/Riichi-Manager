/**
 * Notação de mão do MCR (a mesma do GB-Mahjong), usada nos exemplos do Guia de bolso:
 *
 * - `[123m,1]` chi ou pon exposto, `[1111m,1]` kan exposto, `[1111m]` kan oculto
 * - `m` caracteres, `s` bambus, `p` círculos; `E S W N` ventos; `C` 中, `F` 發, `P` 白
 * - a última pedra antes do primeiro `|` é a da batida
 * - `|XYzjhg`: vento da rodada, vento do assento, tsumo, última pedra do tipo,
 *   última pedra da parede e kan (reposição ou roubo), cada um 0 ou 1
 * - `|ab` (terceira parte): as flores (letras) ou quantas são (um dígito)
 *
 * Os ids das pedras são os do motor: 1-9 caracteres, 10-18 bambus, 19-27 círculos,
 * 28-31 ventos (E S W N) e 32-34 dragões (C F P).
 */

export type TipoChamadaNotacao = 'chi' | 'pon' | 'kanAberto' | 'kanFechado'

export interface MaoNotacaoMcr {
  chamadas: { tipo: TipoChamadaNotacao; pedras: number[] }[]
  /** Pedras ocultas; a última é a da batida. */
  pedras: number[]
  ventoRodada: number
  ventoAssento: number
  tsumo: boolean
  ultimaDoTipo: boolean
  ultimaDaParede: boolean
  kan: boolean
  flores: number
}

const BASE: Record<string, number> = { m: 1, s: 10, p: 19 }
const HONRAS: Record<string, number> = { E: 28, S: 29, W: 30, N: 31, C: 32, F: 33, P: 34 }

function lerPedras(texto: string): number[] {
  const pedras: number[] = []
  let numeros = ''
  for (const caractere of texto) {
    if (/\d/.test(caractere)) numeros += caractere
    else if (caractere in BASE) {
      for (const numero of numeros) pedras.push(BASE[caractere] - 1 + Number(numero))
      numeros = ''
    } else if (caractere in HONRAS) pedras.push(HONRAS[caractere])
    else throw new Error(`Notação MCR: caractere inválido "${caractere}" em "${texto}"`)
  }
  if (numeros) throw new Error(`Notação MCR: números sem naipe em "${texto}"`)
  return pedras
}

export function lerNotacaoMcr(notacao: string): MaoNotacaoMcr {
  const [parteMao, estado = 'EE0000', flores = ''] = notacao.replace(/\s/g, '').split('|')
  const chamadas: MaoNotacaoMcr['chamadas'] = []
  const soltas: string[] = []
  for (const bloco of parteMao.match(/\[[^\]]+\]|[^[]+/g) ?? []) {
    if (!bloco.startsWith('[')) {
      soltas.push(bloco)
      continue
    }
    const [corpo, oferta] = bloco.slice(1, -1).split(',')
    const pedras = lerPedras(corpo)
    const kan = pedras.length === 4
    const tipo: TipoChamadaNotacao = kan
      ? oferta
        ? 'kanAberto'
        : 'kanFechado'
      : pedras[0] === pedras[1]
        ? 'pon'
        : 'chi'
    chamadas.push({ tipo, pedras })
  }
  return {
    chamadas,
    pedras: lerPedras(soltas.join('')),
    ventoRodada: HONRAS[estado[0]],
    ventoAssento: HONRAS[estado[1]],
    tsumo: estado[2] === '1',
    ultimaDoTipo: estado[3] === '1',
    ultimaDaParede: estado[4] === '1',
    kan: estado[5] === '1',
    flores: /^\d$/.test(flores) ? Number(flores) : flores.length,
  }
}
