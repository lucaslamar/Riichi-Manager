/**
 * Testes dos yakus locais: detectores pela forma da mão, condições marcadas e
 * a soma no cálculo da calculadora.
 *
 * Uso: npm run test:yakus-locais
 */
import assert from 'node:assert/strict'
import { calcularMao, configuracaoPadrao, type Mao } from '../src/dominios/calculadora-mao/logica/mao'
import { encontrarYakusLocais, YAKUS_LOCAIS, type OpcoesLocais } from '../src/dominios/calculadora-mao/logica/yakusLocais'

let testes = 0
function teste(nome: string, corpo: () => void) {
  try {
    corpo()
    testes += 1
  } catch (erro) {
    console.error(`Falhou: ${nome}`)
    throw erro
  }
}

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

const tudo = (condicoes: string[] = []): OpcoesLocais => ({
  ativos: new Set(YAKUS_LOCAIS.map((yaku) => yaku.id)),
  condicoes: new Set(condicoes),
  renhou: 'mangan',
})
const ids = (m: Mao, opcoes = tudo()) => encontrarYakusLocais(m, opcoes).map(({ yaku }) => yaku.id)

teste('nada ligado, nada encontrado', () => {
  assert.deepEqual(encontrarYakusLocais(mao('22334455667788p'), { ...tudo(), ativos: new Set() }), [])
})

teste('Daisharin e Shousharin', () => {
  assert.ok(ids(mao('22334455667788p')).includes('daisharin'))
  assert.ok(ids(mao('11223344556677s')).includes('shousharin'))
})

teste('Sanrenkou e Suurenkou', () => {
  assert.ok(ids(mao('444555666m789p11z')).includes('sanrenkou'))
  assert.ok(ids(mao('33344455566677m')).includes('suurenkou'))
})

teste('Sanshoku tsuukan e Golden Gate Bridge', () => {
  assert.ok(ids(mao('123m456p789s11122z')).includes('sanshokuTsuukan'))
  assert.ok(ids(mao('12334556778955p')).includes('goldenGateBridge'))
})

teste('Akadora sanshoku pelos três cincos vermelhos', () => {
  assert.ok(ids(mao('406m406p406s11122z')).includes('akadoraSanshoku'))
})

teste('Aka sanshoku doujun pede o Sanshoku com os três 5 vermelhos', () => {
  assert.ok(ids(mao('406m406p406s11122z')).includes('akaSanshokuDoujun'))
  assert.ok(!ids(mao('555m406p406s11122z')).includes('akaSanshokuDoujun'))
})

teste('condição de partida só vale marcada', () => {
  const m = mao('123m456p789s11122z')
  assert.ok(!ids(m).includes('tsubameGaeshi'))
  assert.ok(ids(m, tudo(['tsubameGaeshi'])).includes('tsubameGaeshi'))
})

teste('Daisharin desligado: a calculadora segue com Chinitsu e cia.', () => {
  const m = mao('22334455667788p')
  const padrao = calcularMao(m, configuracaoPadrao)
  assert.equal(padrao.yakuman, 0)
  const comLocal = calcularMao(m, configuracaoPadrao, { ...tudo(), ativos: new Set(['daisharin']) })
  assert.equal(comLocal.yakuman, 1)
  assert.ok(comLocal.yaku.some(([nome]) => nome.startsWith('Daisharin')))
})

teste('Tsubame gaeshi soma 1 han ao cálculo padrão', () => {
  const m = mao('123m456p789s11122z', { agari: 'ron' })
  const padrao = calcularMao(m, configuracaoPadrao)
  const comLocal = calcularMao(m, configuracaoPadrao, { ...tudo(['tsubameGaeshi']), ativos: new Set(['tsubameGaeshi']) })
  assert.equal(comLocal.han, padrao.han + 1)
})

teste('Paarenchan sozinho não salva mão sem yaku', () => {
  const m = mao('123m456p789s11122z', { agari: 'ron' })
  const padrao = calcularMao(m, configuracaoPadrao)
  if (!padrao.semYaku) return
  const comLocal = calcularMao(m, configuracaoPadrao, { ...tudo(['paarenchan']), ativos: new Set(['paarenchan']) })
  assert.equal(comLocal.semYaku, true)
})

console.log(`Yakus locais ok: ${testes} testes.`)
