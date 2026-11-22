/**
 * Testes dos cenários de virada e dos jogos que faltam.
 *
 * Uso: npm run test:viradas
 */
import assert from 'node:assert/strict'
import { regrasDoModo } from '../src/compartilhado/modo-jogo/regrasDoModo'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import type { Partida } from '../src/dominios/centerpiece/logica/partida'
import { umaFixa } from '../src/dominios/centerpiece/logica/uma'
import {
  bonusDasPosicoes,
  cenariosComUma,
  cenariosDoLider,
  necessidade,
  pontosDeMesa,
  situacaoDaVirada,
  tirarPorJogo,
} from '../src/dominios/estatisticas/logica/viradas'
import { jogosRestantes } from '../src/dominios/torneio/logica/jogosRestantes'
import { criarRascunho } from '../src/dominios/torneio/logica/torneio'
import type { Torneio } from '../src/dominios/torneio/logica/tipos'

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

const RIICHI = regrasDoModo('riichi')
const [mangan, haneman, , yakuman] = RIICHI.unidadesDistancia
const precisa = (alvo: number, unidade = mangan) => necessidade(alvo, unidade, RIICHI)
const maos = (terceiros: number, direto: number) => ({ situacao: 'precisa', terceiros, direto })

teste('14,4 por terceiros e direto', () => {
  assert.deepEqual(precisa(14.4), maos(2, 1))
  assert.deepEqual(precisa(14.4, haneman), maos(2, 1))
  assert.deepEqual(precisa(14.4, yakuman), maos(1, 1))
})

teste('bordas do arredondamento', () => {
  assert.deepEqual(precisa(16), maos(2, 1))
  assert.deepEqual(precisa(16.1), maos(3, 2))
  assert.deepEqual(precisa(67.9 - 51.9), maos(2, 1))
  assert.deepEqual(precisa(0.1), maos(1, 1))
  assert.deepEqual(precisa(0), { situacao: 'jaEmpata' })
  assert.deepEqual(precisa(0.00001), { situacao: 'jaEmpata' })
  assert.deepEqual(precisa(-0.1), { situacao: 'jaPassa' })
})

teste('líder em 4º, no zero e em 1º', () => {
  const cenarios = cenariosDoLider(14.4, [15, 5, -5, -20])
  assert.deepEqual(cenarios.map((item) => item.alvo), [-5.6, 14.4, 29.4])
  assert.deepEqual(
    cenarios.map((item) => precisa(item.alvo)),
    [{ situacao: 'jaPassa' }, maos(2, 1), maos(4, 2)],
  )
})

teste('só é final quando nenhum dos dois joga mais', () => {
  assert.equal(situacaoDaVirada(0, 0), 'final')
  assert.equal(situacaoDaVirada(0, 1), 'soLiderJoga')
  assert.equal(situacaoDaVirada(0, null), 'soLiderJoga')
  assert.equal(situacaoDaVirada(1, 0), 'aberta')
  assert.equal(situacaoDaVirada(null, null), 'aberta')
})

teste('em pontos de mesa', () => {
  assert.equal(pontosDeMesa(7.2, RIICHI), 7200)
  assert.equal(pontosDeMesa(67.9 - 51.9, RIICHI), 16000)
  assert.equal(pontosDeMesa(0.1, RIICHI), 100)
})

teste('por jogo arredonda para cima', () => {
  assert.equal(tirarPorJogo(14.4, 2), 7.2)
  assert.equal(tirarPorJogo(14.5, 2), 7.3)
  assert.equal(tirarPorJogo(67.9 - 51.9, 4), 4)
})

teste('com uma', () => {
  const cenarios = cenariosComUma(14.4, [15, 5, -5, -15])
  assert.deepEqual(cenarios.map((item) => item.alvo), [-0.6, 9.4, 19.4])
  assert.deepEqual(
    cenarios.map((item) => precisa(item.alvo)),
    [{ situacao: 'jaPassa' }, maos(2, 1), maos(3, 2)],
  )
})

teste('a uma vem das regras', () => {
  const base = { pontosPartida: 30000, pontosRetorno: 30000 }
  const fixa = bonusDasPosicoes({ ...base, uma: umaFixa([20, 10, -10, -20]) })
  assert.deepEqual(fixa, [20, 10, -10, -20])
  assert.deepEqual(bonusDasPosicoes(configDoPreset('wrc')), [15, 5, -5, -15])
  assert.deepEqual(bonusDasPosicoes(configDoPreset('mleague')), [45, 5, -15, -35], 'oka e retorno')
  const tabela = {
    nenhum: [1, 0, 0, -1],
    um: [2, 0, 0, -2],
    dois: [9, 3, -3, -9],
    tres: [4, 0, 0, -4],
  } satisfies Record<string, [number, number, number, number]>
  const flutuante = bonusDasPosicoes({ ...base, uma: { tipo: 'flutuante', tabela } })
  assert.deepEqual(flutuante, [9, 3, -3, -9])
})

const torneio = (formato: Torneio['formato'], fases: number[] = [0]): Torneio => ({
  ...criarRascunho({ id: 't', agora: new Date(2026, 10, 22), nome: 'T' }),
  formato,
  status: 'em_andamento',
  rodadas: fases.map((fase, indice) => ({
    numero: indice + 1,
    fase,
    geradaEm: '',
    mesas: [{ numero: 1, assentos: fase ? ['a', 'b', 'c', 'd'] : ['a', 'b', 'c', 'x'] }],
  })),
})
const jogou = (...rodadas: number[]) =>
  rodadas.map((rodada) => ({
    status: 'finalizada',
    vinculoTorneio: { torneioId: 't', rodada: rodada - 1, mesa: 0 },
    resultado: [{ jogadorId: 'a' }, { jogadorId: 'x' }],
  })) as unknown as Partida[]

teste('jogos que faltam', () => {
  const suico = torneio({ tipo: 'suico', rodadas: 4 }, [0, 0])
  assert.equal(jogosRestantes(suico, jogou(1), 'a'), 3)
  assert.equal(jogosRestantes({ ...suico, status: 'finalizado' }, jogou(1), 'a'), 0)
  assert.equal(jogosRestantes(torneio({ tipo: 'corridos' }), [], 'a'), null)
})

teste('eliminatório: cortado e pontos zerados', () => {
  const eliminatorio = (pontosCarregados: boolean, fases: number[]) =>
    torneio(
      {
        tipo: 'eliminatorio',
        classificatoria: 'suico',
        rodadasClassificatoria: 2,
        cortes: [4],
        rodadasPorFase: 3,
        pontosCarregados,
      },
      fases,
    )
  const carregados = eliminatorio(true, [0, 0, 1])
  assert.equal(jogosRestantes(carregados, jogou(1, 2), 'x'), 0)
  assert.equal(jogosRestantes(carregados, jogou(1, 2, 3), 'a'), 2)
  assert.equal(jogosRestantes(eliminatorio(false, [0, 0, 1]), jogou(1, 2, 3), 'a'), 2)
  assert.equal(jogosRestantes(eliminatorio(false, [0]), jogou(1), 'a'), 1)
})

console.log(`Viradas: ${testes} testes passaram.`)
