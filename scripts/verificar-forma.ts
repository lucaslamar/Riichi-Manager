/**
 * Testes de como cada um costuma terminar e da chance de virar, com dados fictícios.
 *
 * Uso: npm run test:forma
 */
import assert from 'node:assert/strict'
import { regrasDoModo } from '../src/compartilhado/modo-jogo/regrasDoModo'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import type { Cadeira } from '../src/dominios/centerpiece/logica/partida'
import { visaoDoTorneio } from '../src/dominios/estatisticas/logica/escopo'
import {
  formaDoJogador,
  projetarPelaForma,
  type FormaDoJogador,
} from '../src/dominios/estatisticas/logica/forma'
import { necessidade } from '../src/dominios/estatisticas/logica/viradas'
import { criarRascunho } from '../src/dominios/torneio/logica/torneio'

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

const WRC = configDoPreset('wrc')
type Pontos = [number, number, number, number]
function mesa(id: string, pontos: Pontos, config = WRC, saidas: Cadeira[] = [], dia = 10) {
  return criarPartidaManual(
    id,
    config,
    {
      jogadorIds: ['a', 'b', 'c', 'd'],
      nomes: ['A', 'B', 'C', 'D'],
      pontos,
      pontosPartida: config.pontosPartida,
      pontosRetorno: config.pontosRetorno,
      uma: config.uma,
      saidas,
    },
    `2026-11-${dia}T20:00:00.000Z`,
  )
}
const BASE = { pontosPartida: 30000, bonus: [15, 5, -5, -15] as Pontos }

teste('costuma terminar com a média das mesas', () => {
  const partidas = [mesa('1', [40000, 30000, 25000, 25000]), mesa('2', [36000, 34000, 25000, 25000])]
  const forma = formaDoJogador({ ...BASE, partidas }, 'a')!
  assert.equal(forma.pontosNaMesa, 38000)
  assert.equal(forma.porJogo, 23)
  assert.equal(forma.variancia, 8)
})

teste('junta 25.000 e 30.000 pelo saldo, com a uma de agora', () => {
  const clube = mesa('c', [35000, 25000, 22000, 18000], configDoPreset('padrao'))
  const forma = formaDoJogador({ ...BASE, partidas: [clube] }, 'a')!
  assert.deepEqual([forma.pontosNaMesa, forma.porJogo], [40000, 25])
})

teste('empate divide a uma', () => {
  const partidas = [mesa('1', [35000, 35000, 25000, 25000])]
  assert.equal(formaDoJogador({ ...BASE, partidas }, 'b')?.porJogo, 15)
})

teste('a própria saída por W.O. não é costume', () => {
  const partidas = [mesa('1', [40000, 30000, 25000, 25000], WRC, [0])]
  assert.equal(formaDoJogador({ ...BASE, partidas }, 'a'), null)
  assert.equal(formaDoJogador({ ...BASE, partidas }, 'b')?.jogos, 1)
})

const forma = (porJogo: number, variancia = 100, jogos = 8): FormaDoJogador => ({
  porJogo,
  variancia,
  jogos,
  pontosNaMesa: 30000,
})

teste('terminando assim faltam 6 Mangans', () => {
  // 58 atrás, com 2 jogos: ganha 5 por jogo a mais que o líder.
  const lado = (porJogo: number) => ({ forma: forma(porJogo), restantes: 2 })
  const projecao = projetarPelaForma(58, lado(8), lado(3))!
  assert.deepEqual([projecao.ate, projecao.falta], ['fim', 48])
  const regras = regrasDoModo('riichi')
  const precisa = necessidade(projecao.falta, regras.unidadesDistancia[0], regras)
  assert.deepEqual(precisa, { situacao: 'precisa', terceiros: 6, direto: 3 })
})

teste('chance: meio a meio, a 1 e a 2 desvios', () => {
  const chance = (diferenca: number) =>
    projetarPelaForma(
      diferenca,
      { forma: forma(10, 50), restantes: 1 },
      { forma: forma(0, 50), restantes: 1 },
    )!.chance!
  assert.ok(Math.abs(chance(10) - 0.5) < 1e-6)
  assert.ok(Math.abs(chance(20) - 0.158655) < 1e-4)
  assert.ok(Math.abs(chance(0) - 0.841345) < 1e-4)
  assert.ok(Math.abs(chance(30) - 0.02275) < 1e-4)
})

teste('sem fim, só o próximo jogo', () => {
  const lado = (porJogo: number) => ({ forma: forma(porJogo), restantes: null })
  const projecao = projetarPelaForma(10, lado(4), lado(1))!
  assert.deepEqual([projecao.ate, projecao.falta], ['proximo', 7])
})

teste('só o líder joga: não usa o histórico de quem parou', () => {
  const lider = { forma: forma(-20), restantes: 1 }
  const projecao = projetarPelaForma(15, { forma: null, restantes: 0 }, lider)!
  assert.equal(projecao.falta, -5)
  assert.ok(projecao.chance! > 0.5)
  assert.equal(projetarPelaForma(15, { forma: null, restantes: 0 }, { ...lider, restantes: 0 }), null)
})

teste('poucos jogos projetam sem porcentagem', () => {
  const lado = (jogos: number) => ({ forma: forma(5, 100, jogos), restantes: 1 })
  assert.equal(projetarPelaForma(5, lado(2), lado(9))?.chance, null)
  assert.notEqual(projetarPelaForma(5, lado(3), lado(3))?.chance, null)
})

teste('sem variação não divide por zero', () => {
  const lado = (porJogo: number) => ({ forma: forma(porJogo, 0), restantes: 1 })
  assert.equal(projetarPelaForma(5, lado(10), lado(0))?.chance, 1)
  assert.equal(projetarPelaForma(10, lado(10), lado(0))?.chance, 0, 'empatar não é virar')
})

teste('torneio: rodadas mais as outras mesas, sem repetir', () => {
  const torneio = { ...criarRascunho({ id: 't', agora: new Date(2026, 10, 10), nome: 'T' }), config: WRC }
  const pontos: Pontos = [40000, 30000, 25000, 25000]
  const rodada = (numero: number) => ({
    ...mesa(`r${numero}`, pontos, WRC, [], 10 + numero),
    vinculoTorneio: { torneioId: 't', rodada: numero - 1, mesa: 0, guardada: true },
  })
  const antes = mesa('antes', pontos, WRC, [], 10)
  const depois = mesa('depois', pontos, WRC, [], 20)
  const faltou = { ...mesa('wo', pontos), wo: { ausentes: [3 as const] } }
  const todas = [rodada(1), rodada(2), antes, depois, faltou]
  const ids = (ateRodada: number | null) =>
    visaoDoTorneio(torneio, todas, ateRodada).forma!.partidas.map((partida) => partida.id).sort()
  assert.deepEqual(ids(null), ['antes', 'depois', 'r1', 'r2'])
  assert.deepEqual(ids(1), ['antes', 'r1'], 'até a rodada não vê o futuro')
})

console.log(`Forma: ${testes} testes passaram.`)
