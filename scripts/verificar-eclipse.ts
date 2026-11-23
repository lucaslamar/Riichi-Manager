/**
 * Testes do modo Eclipse: dora e ura dora +2, Sombra −1 por pedra igual ao
 * indicador, mínimo de 1 han e Dora/Sombra sem valer como yaku.
 *
 * Uso: npm run test:eclipse
 */
import assert from 'node:assert/strict'
import { calcularMao, configuracaoPadrao, type Mao } from '../src/dominios/calculadora-mao/logica/mao'

const eclipse = { ...configuracaoPadrao, eclipse: true }

/** "123m456p" → ['1m','2m','3m','4p','5p','6p']; a última pedra é a da batida. */
function pedras(notacao: string): string[] {
  const saida: string[] = []
  let numeros = ''
  for (const caractere of notacao) {
    if (/\d/.test(caractere)) numeros += caractere
    else {
      for (const numero of numeros) saida.push(`${numero}${caractere}`)
      numeros = ''
    }
  }
  return saida
}

function mao(notacao: string, extra: Partial<Mao> = {}): Mao {
  const lista = pedras(notacao)
  return {
    pedras: lista,
    melds: [],
    indiceAgari: lista.length - 1,
    agariMeld: null,
    agari: 'tsumo',
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

const riichi = { duplo: false, ippatsu: false }
// Riichi + Tsumo + Pinfu, espera 6-9s... batida no 8s (67s).
const pinfu = '99p234m567m345p678s'

// Exemplo do pedido: ura 1m aponta 2m (+2), indicador 7m está na mão (Sombra −1).
const exemplo = calcularMao(mao(pinfu, { riichi, dora: ['7m'], uradora: ['1m'] }), eclipse)
assert.equal(exemplo.han, 4)
assert.equal(exemplo.fu, 20)
assert.equal(exemplo.agari === 'tsumo' && exemplo.pontos.total, 5200)
assert.deepEqual(
  exemplo.yaku.filter(([nome]) => nome === 'Uradora' || nome === 'Sombra'),
  [
    ['Uradora', 2, false],
    ['Sombra', -1, false],
  ],
)

// Sem o Eclipse, a mesma mão segue a regra normal (Ura-dora +1, sem Sombra).
const normal = calcularMao(mao(pinfu, { riichi, dora: ['7m'], uradora: ['1m'] }), configuracaoPadrao)
assert.equal(normal.han, 4)
assert.ok(!normal.yaku.some(([nome]) => nome === 'Sombra'))

// Sem riichi, o ura não conta (nem a Sombra do ura).
const semRiichi = calcularMao(mao(pinfu, { dora: ['1m'], uradora: ['9p'] }), eclipse)
assert.equal(semRiichi.han, 2 + 2)

// Sombra nunca deixa a mão abaixo de 1 han: Tsumo + Pinfu − 4 Sombras.
const minimo = calcularMao(mao(pinfu, { dora: ['9p', '7m', '4p'] }), eclipse)
assert.equal(minimo.han, 1)

// Aka dora segue +1.
const aka = calcularMao(mao('99p234m067m345p678s'), eclipse)
assert.equal(aka.han, 2 + 1)

// Dora não é yaku: mão aberta sem yaku continua inválida.
const semYaku = calcularMao(
  mao('99p234m345p678s', {
    melds: [{ tipo: 'chii', pedras: ['5m', '6m', '7m'] }],
    dora: ['4m'],
  }),
  eclipse,
)
assert.ok(semYaku.semYaku)

console.log('Eclipse: 7 casos ok.')
