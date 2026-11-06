/**
 * Testes das regras de pontuação de "Registrar partida finalizada": valores de
 * cada conjunto, troca para Personalizado e o resultado final (pontos + oka + uma).
 *
 * Uso: npm run test:regras-registro
 */
import assert from 'node:assert/strict'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import {
  configBaseDoConjunto,
  conjuntoDasRegras,
  regrasDoPreset,
  umaResumida,
  type ConjuntoRegistro,
  type RegrasPontuacao,
} from '../src/dominios/centerpiece/logica/regrasPontuacao'
import { TABELA_FLUTUANTE_EXEMPLO, umaFixa } from '../src/dominios/centerpiece/logica/uma'
import { carregarRegrasRegistro, salvarRegrasRegistro } from '../src/dominios/centerpiece/persistencia/repositorioRegrasRegistro'

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

/** Pontuação final de cada colocação, do 1º ao 4º, para os pontos dados. */
function finais(
  conjunto: ConjuntoRegistro,
  regras: RegrasPontuacao,
  pontos: [number, number, number, number],
) {
  const partida = criarPartidaManual(
    'p',
    configBaseDoConjunto(conjunto),
    {
      jogadorIds: ['a', 'b', 'c', 'd'],
      nomes: ['A', 'B', 'C', 'D'],
      pontos,
      pontosPartida: regras.pontosPartida,
      pontosRetorno: regras.pontosRetorno,
      uma: regras.uma,
    },
    '2026-11-05T22:00:00.000Z',
  )
  const resultado = partida.resultado ?? []
  assert.equal(
    Math.round(resultado.reduce((soma, linha) => soma + linha.final, 0) * 100) / 100,
    0,
    'a soma final fecha em zero',
  )
  return resultado.map((linha) => linha.final)
}

teste('Clube: 25.000, sem oka e uma flutuante', () => {
  const clube = regrasDoPreset('padrao')
  assert.equal(clube.pontosPartida, 25000)
  assert.equal(clube.pontosRetorno, 25000)
  assert.deepEqual(clube.uma, { tipo: 'flutuante', tabela: TABELA_FLUTUANTE_EXEMPLO })
  // Dois terminaram em 25.000 ou mais: vale a linha "dois" (+8/+4/−4/−8).
  assert.deepEqual(finais('padrao', clube, [40000, 30000, 20000, 10000]), [23, 9, -9, -23])
  // Só um acima: linha "um" (+12/−1/−3/−8).
  assert.deepEqual(finais('padrao', clube, [46000, 24000, 20000, 10000]), [33, -2, -8, -23])
})

teste('EMA: 30.000, sem oka e uma 15/5 (livro EMA 2025)', () => {
  const ema = regrasDoPreset('ema')
  assert.equal(ema.pontosPartida, 30000)
  assert.equal(ema.pontosRetorno, 30000)
  assert.deepEqual(ema.uma, umaFixa([15, 5, -5, -15]))
  assert.deepEqual(finais('ema', ema, [45000, 35000, 25000, 15000]), [30, 10, -10, -30])
})

teste('WRC: 30.000, sem oka e uma 15/5 (WRC Rules 2025)', () => {
  const wrc = regrasDoPreset('wrc')
  assert.equal(wrc.pontosPartida, 30000)
  assert.equal(wrc.pontosRetorno, 30000)
  assert.deepEqual(wrc.uma, umaFixa([15, 5, -5, -15]))
  assert.deepEqual(finais('wrc', wrc, [52000, 31000, 22000, 15000]), [37, 6, -13, -30])
})

teste('Personalizado: os valores escolhidos valem no resultado', () => {
  const proprias: RegrasPontuacao = {
    pontosPartida: 25000,
    pontosRetorno: 25000,
    uma: umaFixa([10, 5, -5, -10]),
  }
  assert.deepEqual(finais('personalizado', proprias, [40000, 30000, 20000, 10000]), [25, 10, -10, -25])
})

teste('Empate divide a uma e a oka entre os empatados', () => {
  // Clube, empate no 1º: dividem a uma do 1º e do 2º (8 + 4).
  assert.deepEqual(finais('padrao', regrasDoPreset('padrao'), [35000, 35000, 20000, 10000]), [16, 16, -9, -23])
  // Com oka (Personalizado 25.000/30.000, uma 15/5): dividem 15 + 5 e os 20 de oka.
  const comOka: RegrasPontuacao = { pontosPartida: 25000, pontosRetorno: 30000, uma: umaFixa([15, 5, -5, -15]) }
  assert.deepEqual(finais('personalizado', comOka, [35000, 35000, 20000, 10000]), [25, 25, -15, -35])
})

teste('mudar qualquer valor de Clube, EMA ou WRC vira Personalizado', () => {
  for (const id of ['padrao', 'ema', 'wrc'] as const) {
    const regras = regrasDoPreset(id)
    assert.equal(conjuntoDasRegras(regras, id), id)
    assert.equal(conjuntoDasRegras({ ...regras, pontosPartida: 26000 }, id), 'personalizado')
    assert.equal(conjuntoDasRegras({ ...regras, uma: umaFixa([20, 10, -10, -20]) }, id), 'personalizado')
  }
  // Valores de um preset voltam a ser ele, mesmo vindo de Personalizado.
  assert.equal(conjuntoDasRegras(regrasDoPreset('padrao'), 'personalizado'), 'padrao')
  // EMA e WRC têm os mesmos números: vale o que foi tocado.
  assert.equal(conjuntoDasRegras(regrasDoPreset('wrc'), 'wrc'), 'wrc')
  assert.equal(conjuntoDasRegras(regrasDoPreset('wrc')), 'ema')
})

teste('resumo da uma: 15/5 na simétrica, os quatro na assimétrica', () => {
  assert.equal(umaResumida(umaFixa([15, 5, -5, -15])), '15/5')
  assert.equal(umaResumida(umaFixa([20, 0, -5, -15])), '20/0/-5/-15')
})

teste('Personalizado lembra os últimos valores', () => {
  const memoria = new Map<string, string>()
  const armazenamento = {
    ler: (chave: string) => memoria.get(chave) ?? null,
    gravar: (chave: string, valor: string) => void memoria.set(chave, valor),
  }
  assert.deepEqual(carregarRegrasRegistro(armazenamento), { conjunto: 'padrao', personalizado: null })
  const proprias: RegrasPontuacao = { pontosPartida: 30000, pontosRetorno: 35000, uma: umaFixa([20, 10, -10, -20]) }
  salvarRegrasRegistro(armazenamento, { conjunto: 'personalizado', personalizado: proprias })
  assert.deepEqual(carregarRegrasRegistro(armazenamento), { conjunto: 'personalizado', personalizado: proprias })
  // Dado estragado não derruba a tela.
  memoria.set('riichi-manager-regras-registro', '{nada')
  assert.deepEqual(carregarRegrasRegistro(armazenamento), { conjunto: 'padrao', personalizado: null })
})

console.log(`Regras de registro: ${testes} testes passaram.`)
