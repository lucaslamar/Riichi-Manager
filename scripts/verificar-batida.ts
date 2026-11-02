/**
 * Testes de "Mudar batida": cada espera vale o mesmo que na primeira tela,
 * calculada das mesmas 13 pedras, qualquer que seja a batida atual.
 *
 * Uso: npm run test:batida
 */
import assert from 'node:assert/strict'
import { configuracaoPadrao } from '../src/compartilhado/mahjong/pontuacao/configuracao'
import { candidatasDaBatida } from '../src/dominios/calculadora-mao/logica/batida'
import { calcularMao } from '../src/dominios/calculadora-mao/logica/calculo-mao'
import { calcularEsperasPossiveis } from '../src/dominios/calculadora-mao/logica/esperas'
import type { CodigoPedra, Mao } from '../src/dominios/calculadora-mao/logica/tipos'

const casos: [string, () => void][] = []
const caso = (nome: string, teste: () => void) => casos.push([nome, teste])

const maoBase = (pedras: CodigoPedra[], extra: Partial<Mao> = {}): Mao => ({
  pedras,
  melds: [],
  indiceAgari: -1,
  agariMeld: null,
  agari: 'ron',
  dora: [],
  uradora: [],
  descartes: [],
  doraManual: 0,
  uradoraManual: 0,
  honba: 0,
  riichi: { duplo: false, ippatsu: false },
  bencao: false,
  ultimaPedra: false,
  kan: false,
  ventoRodada: '1',
  ventoAssento: '2',
  ...extra,
})

const TREZE = '1111222233334'.split('').map((numero) => `${numero}m`)
const comBatida = (pedra: CodigoPedra) => maoBase([...TREZE, pedra], { indiceAgari: 13 })
const valores = (mao: Mao) =>
  Object.fromEntries(
    [...candidatasDaBatida(mao, configuracaoPadrao).values()].map(({ pedra, han }) => [pedra, han]),
  )

const ESPERADO = { '4m': 11, '5m': 7, '0m': 8 }

caso('a primeira tela já mostra 4m 11, 5m 7 e 5m vermelho 8', () => {
  const esperas = calcularEsperasPossiveis(maoBase(TREZE), configuracaoPadrao, 13)
  assert.deepEqual(Object.fromEntries(esperas.map(({ pedra, han }) => [pedra, han])), ESPERADO)
})

caso('Mudar batida com 5m mantém o valor de cada espera', () => {
  assert.deepEqual(valores(comBatida('5m')), ESPERADO)
})

caso('ida e volta 5m → 4m → 5m mantém os valores', () => {
  assert.deepEqual(valores(comBatida('5m')), ESPERADO)
  assert.deepEqual(valores(comBatida('4m')), ESPERADO)
  assert.deepEqual(valores(comBatida('5m')), ESPERADO)
})

caso('escolher 4m continua dando 11 han', () => {
  assert.equal(calcularMao(comBatida('4m'), configuracaoPadrao).han, 11)
})

caso('mão com uma espera só continua com ela', () => {
  const pedras = ['1m', '1m', '1m', '2m', '2m', '2m', '3m', '3m', '3m', '7p', '8p', '9p', '1z']
  const mao = maoBase([...pedras, '1z'], { indiceAgari: 13 })
  assert.deepEqual([...candidatasDaBatida(mao, configuracaoPadrao).keys()], ['1z'])
})

let falhas = 0
for (const [nome, teste] of casos) {
  try {
    teste()
  } catch (erro) {
    falhas++
    console.error(`✗ ${nome}\n  ${(erro as Error).message}`)
  }
}

if (falhas) {
  console.error(`Batida: ${falhas} de ${casos.length} testes falharam.`)
  process.exit(1)
}
console.log(`Batida ok: ${casos.length} testes.`)
