/**
 * Regra local Chiitoitsu com quatro iguais: desligada, a mão não vale;
 * ligada, a quadra conta como dois pares (25 fu, Yaku de sete pares).
 *
 * Uso: npm run test:chiitoitsu-quatro
 */
import assert from 'node:assert/strict'
import { calcularMao, configuracaoPadrao, type Mao } from '../src/dominios/calculadora-mao/logica/mao'
import { calcularEsperasPossiveis } from '../src/dominios/calculadora-mao/logica/esperas'

const ligada = { ...configuracaoPadrao, chiitoitsuQuatroIguais: true }

function mao(pedras: string[], extra: Partial<Mao> = {}): Mao {
  return {
    pedras,
    melds: [],
    indiceAgari: pedras.length - 1,
    agariMeld: null,
    agari: 'ron',
    dora: [],
    uradora: [],
    descartes: [],
    doraManual: 0,
    uradoraManual: 0,
    honba: 0,
    riichi: null,
    bencao: false,
    ultimaPedra: false,
    kan: false,
    ventoRodada: '1',
    ventoAssento: '2',
    ...extra,
  }
}

const simples = ['2m', '2m', '3m', '3m', '4p', '4p', '4p', '4p', '6s', '6s', '7s', '7s', '8s', '8s']
const comTerminais = ['1m', '1m', '2m', '2m', '3p', '3p', '3p', '3p', '5s', '5s', '7s', '7s', '9s', '9s']

// Desligada: segue a biblioteca, que não aceita a quadra.
assert.equal(calcularMao(mao(comTerminais), configuracaoPadrao).agari, null)

// Ligada, ron: só Chiitoitsu, 2 han 25 fu = 1.600.
const ron = calcularMao(mao(comTerminais), ligada)
assert.equal(ron.han, 2)
assert.equal(ron.fu, 25)
assert.equal(ron.agari === 'ron' && ron.pontos.total, 1600)

// Tsumo + Tan'yao + Chiitoitsu = 4 han 25 fu = 6.400.
const tsumo = calcularMao(mao(simples, { agari: 'tsumo' }), ligada)
assert.equal(tsumo.han, 4)
assert.equal(tsumo.agari === 'tsumo' && tsumo.pontos.total, 6400)

// Dora conta normalmente: indicador 2p aponta 3p (quatro na mão).
const comDora = calcularMao(mao(comTerminais, { dora: ['2p'] }), ligada)
assert.equal(comDora.han, 2 + 4)

// A espera aparece na tenpai: falta o segundo 9s.
const esperas = calcularEsperasPossiveis(mao(comTerminais.slice(0, 13)), ligada, 13)
assert.ok(esperas.some((espera) => espera.pedra === '9s'))

console.log('Chiitoitsu com quatro iguais: 5 casos ok.')
