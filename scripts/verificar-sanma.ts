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
import { calcularPontuacaoHanFu, montarReferenciaRapida } from '../src/dominios/calculadora-han-fu/logica'
import { interpretarNotacaoCompleta } from '../src/dominios/calculadora-mao/logica/notacao'
import { calcularMao } from '../src/dominios/calculadora-mao/logica/calculo-mao'
import { calcularEsperasPossiveis } from '../src/dominios/calculadora-mao/logica/esperas'
import type { Mao } from '../src/dominios/calculadora-mao/logica/tipos'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import { analisarLista } from '../src/dominios/torneio/logica/listaTorneio'
import { gerarRodizioSanma } from '../src/dominios/torneio/logica/formatos'
import { rodadaAleatoria } from '../src/dominios/torneio/logica/formatos/rodadaAleatoria'
import {
  cadeirasDaPartida,
  calcularResultado,
  criarPartida,
  registrarRyukyoku,
  registrarTsumo,
  ventoDaCadeira,
} from '../src/dominios/centerpiece/logica/partida'

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

// ─── Han e Fu ────────────────────────────────────────────────────────────────

caso('han e fu sanma: tsumo não dealer mangan 2 honba = 6400 (4200 + 2200)', () => {
  const res = calcularPontuacaoHanFu({ han: 5, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 2, variante: 'sanma' })
  assert.equal(res.principal, 6400)
  assert.deepEqual(res.tsumo, { dealer: 4200, nonDealer: 2200, all: undefined })
  assert.equal(res.totalBase, 6000)
})
caso('han e fu sanma: dealer yakuman tsumo = 16000 × 2', () => {
  const res = calcularPontuacaoHanFu({ han: 13, fu: 30, ehDealer: true, tipoVitoria: 'tsumo', honba: 0, variante: 'sanma' })
  assert.equal(res.tsumo?.all, 16000)
  assert.equal(res.principal, 32000)
})
caso('han e fu yonma: sem variante, mesmo resultado de antes', () => {
  const res = calcularPontuacaoHanFu({ han: 5, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 2 })
  assert.equal(res.principal, 8600)
  assert.equal(res.variante, undefined)
  const tabela = montarReferenciaRapida({ han: 1, fu: 30 })
  assert.equal(tabela.limites[0].pagamentos.tsumoLeste.startsWith('4'), true)
})
caso('han e fu: tabela do Sanma com Divisão do Norte', () => {
  const regras = { ...REGRAS_SANMA_PADRAO, pagamentoTsumo: 'divisao-norte' as const }
  const mangan = montarReferenciaRapida({ han: 1, fu: 30 }, regras).limites[0].pagamentos
  assert.equal(mangan.ronNaoLeste.replace(/\D/g, ''), '8000')
  assert.equal(mangan.tsumoNaoLeste.replace(/\D/g, ''), '30005000')
  assert.equal(mangan.tsumoLeste.replace(/\D/g, ''), '6000')
})

// ─── Notação MPSZ ────────────────────────────────────────────────────────────

const sanmaMpsz = (texto: string) => interpretarNotacaoCompleta(texto, { akadora: true, variante: 'sanma' })

caso('mpsz sanma: sufixo +2k vira 2 Kita', () => {
  const res = sanmaMpsz('19m123p456s111z+2k')
  assert.equal(res.erro, null)
  assert.equal(res.kita, 2)
  assert.equal(res.pedras.length, 11)
})
caso('mpsz sanma: 2m–8m recusados com a mensagem do Sanma', () => {
  assert.equal(sanmaMpsz('123m456p').erro?.chave, 'sanma.erroManzu')
  assert.equal(sanmaMpsz('0m').erro?.chave, 'sanma.erroManzu')
  assert.equal(sanmaMpsz('19m').erro, null)
})
caso('mpsz sanma: sem Chi, Pon segue valendo', () => {
  assert.equal(sanmaMpsz('19m 123pc').erro?.chave, 'notation.errors.invalidCall')
  assert.equal(sanmaMpsz('19m 111pc').erro, null)
})
caso('mpsz sanma: Norte na mão + Kita no máximo 4', () => {
  assert.equal(sanmaMpsz('444z+1k').erro, null)
  assert.equal(sanmaMpsz('444z+2k').erro?.chave, 'sanma.erroNorteLimite')
})
caso('mpsz sanma: sufixo pela metade não dá erro', () => {
  assert.equal(sanmaMpsz('19m+').erro, null)
  assert.equal(sanmaMpsz('19m+2').kita, undefined)
})
caso('mpsz yonma: igual a antes (sem variante, 123m vale e +2k é inválido)', () => {
  assert.equal(interpretarNotacaoCompleta('123m', { akadora: true }).erro, null)
  assert.equal(interpretarNotacaoCompleta('19m+2k', { akadora: true }).erro?.chave, 'notation.errors.invalidChar')
})

// ─── Calculadora de mão ──────────────────────────────────────────────────────

const pedrasDe = (texto: string) => interpretarNotacaoCompleta(texto, { akadora: true }).pedras
const maoSanma = (texto: string, extra: Partial<Mao> = {}, kita = 0): Mao => {
  const pedras = pedrasDe(texto)
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
    sanma: { regras: REGRAS_SANMA_PADRAO, kita },
    ...extra,
  }
}
// Tan'yao fechado: 234p 567p 345s 678s 22s, ron em 2s.
const TANYAO = '234567p345678s22s'

caso('mão sanma: Kita conta como Nukidora e não quebra Tan\'yao', () => {
  const res = calcularMao(maoSanma(TANYAO, {}, 2), configuracaoPadrao)
  const nomes = res.yaku.map(([nome]) => nome)
  assert.ok(nomes.includes('Tanyao'), nomes.join())
  assert.ok(nomes.includes('Nukidora'), nomes.join())
  assert.equal(res.han, 1 + 2)
})
caso('mão sanma: indicador Oeste + 2 Kita = 4 dora do Kita', () => {
  const res = calcularMao(maoSanma(TANYAO, { dora: ['3z'] }, 2), configuracaoPadrao)
  assert.equal(res.han, 1 + 4)
})
caso('mão sanma: dora com indicador 9m é o 1m', () => {
  const semDora = calcularMao(maoSanma('111m234p567p345s22s'), configuracaoPadrao)
  const comDora = calcularMao(maoSanma('111m234p567p345s22s', { dora: ['9m'], riichi: { duplo: false, ippatsu: false } }), configuracaoPadrao)
  assert.equal(semDora.semYaku, true)
  assert.equal(comDora.han, 1 + 3)
})
caso('mão sanma: tsumo não dealer paga 2 jogadores (tsumo-son)', () => {
  // Tan'yao + Menzen tsumo + 3 Kita = 5 han: Mangan, 2000/4000 = 6000.
  const res = calcularMao(maoSanma(TANYAO, { agari: 'tsumo' }, 3), configuracaoPadrao)
  assert.equal(res.nome, 'Mangan')
  assert.ok(res.agari === 'tsumo')
  assert.equal(res.pontos.total, 6000)
  assert.deepEqual(res.pontos.ko, { oya: 4000, ko: 2000 })
})
caso('mão sanma: Tenhou some com Kita', () => {
  const tenhou = maoSanma(TANYAO, { agari: 'tsumo', bencao: true, ventoAssento: '1' })
  assert.ok(calcularMao(tenhou, configuracaoPadrao).yakuman > 0)
  assert.equal(calcularMao({ ...tenhou, sanma: { regras: REGRAS_SANMA_PADRAO, kita: 1 } }, configuracaoPadrao).yakuman, 0)
})
caso('esperas sanma: nunca sugere 2m–8m', () => {
  // 13 pedras esperando: 1m1m + ... com espera em 9m e 1m apenas.
  const mao = maoSanma('11m99m234567p345s')
  const esperas = calcularEsperasPossiveis({ ...mao, indiceAgari: -1 }, configuracaoPadrao, 13)
  assert.ok(esperas.length > 0)
  assert.ok(esperas.every((espera) => tileExisteNaVariante(espera.pedra, 'sanma')), esperas.map((espera) => espera.pedra).join())
})
caso('mão yonma: sem `sanma`, mesmo resultado de antes', () => {
  const yonma: Mao = { ...maoSanma(TANYAO, { agari: 'tsumo' }), sanma: undefined }
  const res = calcularMao(yonma, configuracaoPadrao)
  assert.ok(res.agari === 'tsumo')
  assert.equal(res.pontos.total, 2000)
  const sanma = calcularMao(maoSanma(TANYAO, { agari: 'tsumo' }), configuracaoPadrao)
  assert.ok(sanma.agari === 'tsumo')
  assert.equal(sanma.pontos.total, 1500)
})

// ─── Partida (Centerpiece) ───────────────────────────────────────────────────

const configSanma = { ...configDoPreset('padrao'), pontosPartida: 35000, pontosRetorno: 40000 }
const novaSanma = (tipoPartida: 'leste' | 'hanchan' = 'hanchan') =>
  criarPartida('p', { ...configSanma, tipoPartida }, ['a', 'b', 'c', ''], 'agora', undefined, {
    regras: REGRAS_SANMA_PADRAO,
  })
let idEvento = 0
const ctx = () => ({ id: `e${idEvento++}`, agora: 'agora' })

caso('partida sanma: 3 cadeiras, 4ª vazia com 0 pontos', () => {
  const partida = novaSanma()
  assert.equal(partida.variante, 'sanma')
  assert.deepEqual(cadeirasDaPartida(partida), [0, 1, 2])
  assert.equal(partida.assentos[3].jogadorId, '')
  assert.deepEqual(partida.placar.pontos, { 0: 35000, 1: 35000, 2: 35000, 3: 0 })
})
caso('partida sanma: tsumo pago por 2, dealer passa E→S→W→E', () => {
  let partida = novaSanma()
  // Não dealer (cadeira 1) mangan tsumo: dealer 4000 + não dealer 2000.
  partida = registrarTsumo(partida, { vencedor: 1, pagamentoDealer: 4000, pagamentoNaoDealer: 2000 }, ctx())
  assert.deepEqual(partida.placar.pontos, { 0: 31000, 1: 41000, 2: 33000, 3: 0 })
  assert.equal(partida.placar.cadeiraDealer, 1)
  assert.equal(partida.placar.rodadaNumero, 2)
  assert.equal(ventoDaCadeira(0, 1, 3), 'oeste')
  partida = registrarRyukyoku(partida, { tenpai: [] }, ctx())
  partida = registrarRyukyoku(partida, { tenpai: [] }, ctx())
  // Depois do 3º dealer, volta para a cadeira 0 no Sul (sem passar pela cadeira 3).
  assert.equal(partida.placar.cadeiraDealer, 0)
  assert.equal(partida.placar.rodadaVento, 'sul')
  assert.equal(partida.placar.rodadaNumero, 1)
})
caso('partida sanma: Leste apenas acaba depois do 3º dealer', () => {
  let partida = novaSanma('leste')
  for (let mao = 0; mao < 3; mao++) partida = registrarRyukyoku(partida, { tenpai: [] }, ctx())
  assert.equal(partida.fim, 'ultimaMao')
})
caso('partida sanma: noten 1 tenpai recebe 2000', () => {
  const partida = registrarRyukyoku(novaSanma(), { tenpai: [2] }, ctx())
  assert.deepEqual(partida.placar.pontos, { 0: 34000, 1: 34000, 2: 37000, 3: 0 })
})
caso('partida sanma: resultado final soma zero, só 3 linhas', () => {
  let partida = registrarTsumo(novaSanma(), { vencedor: 1, pagamentoDealer: 4000, pagamentoNaoDealer: 2000 }, ctx())
  partida = { ...partida, placar: { ...partida.placar } }
  const resultado = calcularResultado(partida)
  assert.equal(resultado.length, 3)
  assert.equal(resultado[0].cadeira, 1)
  assert.ok(Math.abs(resultado.reduce((soma, linha) => soma + linha.final, 0)) < 1e-9)
})

// ─── Torneio ─────────────────────────────────────────────────────────────────

const doze = Array.from({ length: 12 }, (_vazio, indice) => `j${indice}`)

caso('torneio sanma: lista pede múltiplo de 3', () => {
  const texto = (total: number) => doze.slice(0, total).join('\n')
  assert.equal(analisarLista(texto(9), [], 3).status.tipo, 'pronta')
  assert.equal(analisarLista(texto(9), [], 3).mesas, 3)
  assert.deepEqual(analisarLista(texto(10), [], 3).status, { tipo: 'proximaMesa', faltam: 2 })
  assert.equal(analisarLista(texto(8), []).status.tipo, 'pronta')
})
caso('torneio sanma: Rodízio de 3 rodadas, mesas de 3 e cada um Leste uma vez', () => {
  const rodadas = gerarRodizioSanma(doze, 3, 'agora')
  assert.equal(rodadas.length, 3)
  const leste = new Map<string, number>()
  for (const rodada of rodadas) {
    assert.equal(rodada.mesas.length, 4)
    for (const mesa of rodada.mesas) {
      assert.equal(mesa.assentos[3], '')
      assert.equal(new Set(mesa.assentos.slice(0, 3)).size, 3)
      leste.set(mesa.assentos[0], (leste.get(mesa.assentos[0]) ?? 0) + 1)
    }
  }
  assert.deepEqual([...new Set(leste.values())], [1])
  assert.equal(leste.size, 12)
})
caso('torneio sanma: rodada sorteada em mesas de 3', () => {
  const rodada = rodadaAleatoria(doze.slice(0, 9), 1, 'agora', undefined, 3)
  assert.equal(rodada.mesas.length, 3)
  assert.ok(rodada.mesas.every((mesa) => mesa.assentos[3] === ''))
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
