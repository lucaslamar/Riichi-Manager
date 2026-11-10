/**
 * Testes do módulo compartilhado de variante (yonma/sanma): pagamentos, honba,
 * noten, uma, dora e pedras. Inclui a paridade do yonma com a pontuação existente.
 *
 * Uso: npm run test:sanma
 */
import assert from 'node:assert/strict'
import {
  aplicarHonba,
  calcularHanFu,
  configuracaoPadrao,
  montarPontosRapidos,
} from '../src/compartilhado/mahjong/pontuacao'
import {
  calcularNoten,
  calcularPagamentos,
  calcularResultadoFinal,
  dorasDoKita,
  normalizarRegrasSanma,
  proximaDora,
  REGRAS_SANMA_PADRAO,
  tileExisteNaVariante,
  tilesDaVariante,
  ventosDaVariante,
} from '../src/compartilhado/mahjong/variante'

const casos: [string, () => void][] = []
const caso = (nome: string, teste: () => void) => casos.push([nome, teste])

const sanma = (han: number, fu: number, dealer: boolean, tipo: 'ron' | 'tsumo', honba = 0, divisao = false) =>
  calcularPagamentos({
    han,
    fu,
    dealer,
    tipo,
    honba,
    variante: 'sanma',
    regras: { ...REGRAS_SANMA_PADRAO, pagamentoTsumo: divisao ? 'divisao-norte' : 'tsumo-son' },
  })

// ─── 4.4 Tsumo-son ───────────────────────────────────────────────────────────

caso('tsumo-son: não dealer 1 han 30 fu tsumo = 500 + 300 = 800', () => {
  const pag = sanma(1, 30, false, 'tsumo')
  assert.deepEqual(pag.tsumo, { dealer: 500, naoDealer: 300 })
  assert.equal(pag.total, 800)
})
caso('tsumo-son: não dealer mangan tsumo = 6000', () => {
  const pag = sanma(5, 30, false, 'tsumo')
  assert.deepEqual(pag.tsumo, { dealer: 4000, naoDealer: 2000 })
  assert.equal(pag.total, 6000)
})
caso('tsumo-son: dealer mangan tsumo = 4000 × 2 = 8000', () => {
  const pag = sanma(5, 30, true, 'tsumo')
  assert.equal(pag.tsumo?.todos, 4000)
  assert.equal(pag.total, 8000)
})
caso('ron não dealer mangan = 8000', () => assert.equal(sanma(5, 30, false, 'ron').total, 8000))
caso('ron dealer mangan = 12000', () => assert.equal(sanma(5, 30, true, 'ron').total, 12000))

// ─── 4.4 Divisão do Norte ────────────────────────────────────────────────────

caso('divisão do Norte: não dealer mangan tsumo = 5000 + 3000', () => {
  const pag = sanma(5, 30, false, 'tsumo', 0, true)
  assert.deepEqual(pag.tsumo, { dealer: 5000, naoDealer: 3000 })
  assert.equal(pag.total, 8000)
})
caso('divisão do Norte: dealer mangan tsumo = 6000 × 2', () => {
  const pag = sanma(5, 30, true, 'tsumo', 0, true)
  assert.equal(pag.tsumo?.todos, 6000)
  assert.equal(pag.total, 12000)
})

// ─── 4.4 Honba ───────────────────────────────────────────────────────────────

caso('honba: não dealer mangan tsumo com 2 honba = 6400', () => {
  const pag = sanma(5, 30, false, 'tsumo', 2)
  assert.equal(pag.total, 6400)
  assert.equal(pag.honbaTotal, 400)
})
caso('honba: ron com 2 honba = 8600', () => assert.equal(sanma(5, 30, false, 'ron', 2).total, 8600))

// ─── Paridade do yonma ───────────────────────────────────────────────────────

caso('yonma: mesmos números da pontuação existente (han 1–13, ron/tsumo, honba 0–3)', () => {
  for (let han = 1; han <= 13; han++) {
    for (const fu of [20, 25, 30, 40, 70, 110]) {
      for (const dealer of [true, false]) {
        for (const tipo of ['ron', 'tsumo'] as const) {
          for (let honba = 0; honba <= 3; honba++) {
            const antigo = aplicarHonba(
              montarPontosRapidos(dealer, tipo, calcularHanFu(han, fu, configuracaoPadrao)),
              honba,
              300,
            )
            const novo = calcularPagamentos({ han, fu, dealer, tipo, honba, variante: 'yonma' })
            assert.ok(antigo.agari !== null)
            assert.equal(novo.total, antigo.pontos.total, `${han}/${fu} ${dealer} ${tipo} ${honba}`)
          }
        }
      }
    }
  }
})
caso('yonma: não dealer mangan tsumo = 2000/4000', () => {
  const pag = calcularPagamentos({ han: 5, fu: 30, dealer: false, tipo: 'tsumo', honba: 0, variante: 'yonma' })
  assert.deepEqual(pag.tsumo, { dealer: 4000, naoDealer: 2000 })
  assert.equal(pag.total, 8000)
})

// ─── Noten ───────────────────────────────────────────────────────────────────

caso('noten sanma: 1 tenpai recebe 2000', () => {
  const res = calcularNoten(['a'], ['a', 'b', 'c'], 'sanma')
  assert.deepEqual([...res.values()], [2000, -1000, -1000])
})
caso('noten sanma: 2 tenpai recebem 1000 cada', () => {
  const res = calcularNoten(['a', 'b'], ['a', 'b', 'c'], 'sanma')
  assert.deepEqual([...res.values()], [1000, 1000, -2000])
})
caso('noten sanma: todos ou nenhum tenpai = 0', () => {
  assert.deepEqual([...calcularNoten([], [1, 2, 3], 'sanma').values()], [0, 0, 0])
  assert.deepEqual([...calcularNoten([1, 2, 3], [1, 2, 3], 'sanma').values()], [0, 0, 0])
})
caso('noten yonma: 3000 como antes', () => {
  assert.deepEqual([...calcularNoten([0], [0, 1, 2, 3], 'yonma').values()], [3000, -1000, -1000, -1000])
  assert.deepEqual([...calcularNoten([0, 1], [0, 1, 2, 3], 'yonma').values()], [1500, 1500, -1500, -1500])
})

// ─── Resultado final ─────────────────────────────────────────────────────────

caso('resultado final 35000/40000, uma 15/0/−15 soma zero', () => {
  for (const pontos of [
    [50000, 35000, 20000],
    [35000, 35000, 35000],
    [60000, 30000, 15000],
    [41000, 41000, 23000],
  ]) {
    const resultado = calcularResultadoFinal(pontos)
    const soma = resultado.reduce((total, item) => total + item.final, 0)
    assert.ok(Math.abs(soma) < 1e-9, `soma ${soma} para ${pontos}`)
  }
  const [primeiro] = calcularResultadoFinal([50000, 35000, 20000])
  assert.equal(primeiro.final, 10 + 15 + 15)
})

// ─── Pedras, dora e Kita ─────────────────────────────────────────────────────

caso('sanma tem 27 tipos de pedra (108 pedras), sem 2m–8m', () => {
  const tiles = tilesDaVariante('sanma')
  assert.equal(tiles.length * 4, 108)
  for (let num = 2; num <= 8; num++) assert.ok(!tiles.includes(`${num}m`))
  assert.ok(!tileExisteNaVariante('0m', 'sanma'))
  assert.ok(tileExisteNaVariante('0m', 'yonma'))
  assert.equal(tilesDaVariante('yonma').length, 34)
})
caso('dora: 1m → 9m e 9m → 1m no Sanma, ventos sem mudança', () => {
  assert.equal(proximaDora('1m', 'sanma'), '9m')
  assert.equal(proximaDora('9m', 'sanma'), '1m')
  assert.equal(proximaDora('1m', 'yonma'), '2m')
  assert.equal(proximaDora('3z', 'sanma'), '4z')
  assert.equal(proximaDora('4z', 'sanma'), '1z')
  assert.equal(proximaDora('0p', 'sanma'), '6p')
})
caso('indicador Oeste + 2 Kita = 4 dora do Kita', () => {
  assert.equal(dorasDoKita(2, ['3z']), 4)
  assert.equal(dorasDoKita(2, []), 2)
  assert.equal(dorasDoKita(0, ['3z']), 0)
})
caso('ventos da variante', () => {
  assert.deepEqual(ventosDaVariante('sanma'), ['E', 'S', 'W'])
  assert.deepEqual(ventosDaVariante('yonma'), ['E', 'S', 'W', 'N'])
})
caso('normalizarRegrasSanma completa o que faltar', () => {
  assert.deepEqual(normalizarRegrasSanma(undefined), REGRAS_SANMA_PADRAO)
  assert.equal(normalizarRegrasSanma({ notenTotal: 3000, uma: [1] }).notenTotal, 3000)
  assert.deepEqual(normalizarRegrasSanma({ uma: [1] }).uma, [15, 0, -15])
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
  console.error(`Sanma: ${falhas} de ${casos.length} testes falharam.`)
  process.exit(1)
}
console.log(`Sanma ok: ${casos.length} testes.`)
