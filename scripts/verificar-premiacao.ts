/**
 * Testes da inscrição e da premiação do torneio.
 *
 * Uso: npm run test:premiacao
 */
import assert from 'node:assert/strict'
import {
  calcularPremiacao,
  divisaoAutomatica,
  lerDivisao,
  pagamentosDe,
  premiacaoDe,
  premiacaoPadrao,
  premiacaoValida,
  premioDaPosicao,
  premioDaTemporada,
} from '../src/dominios/torneio/logica/premiacao'
import type { LinhaRankingTorneio } from '../src/dominios/torneio/logica/ranking'
import { exportarTorneio, validarPacote } from '../src/dominios/torneio/logica/exportacao'
import { criarRascunho } from '../src/dominios/torneio/logica/torneio'
import type { ConfigPremiacao, LinhaTemporada } from '../src/dominios/torneio/logica/tipos'

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

const PADRAO: ConfigPremiacao = { ...premiacaoPadrao('pt-BR'), ativa: true }
const calcular = (jogadores: number, mudar: Partial<ConfigPremiacao> = {}) => {
  const config = { ...PADRAO, ...mudar }
  return calcularPremiacao(config, pagamentosDe(config, jogadores))
}
const valores = (jogadores: number, mudar?: Partial<ConfigPremiacao>) =>
  calcular(jogadores, mudar).posicoes.map((posicao) => posicao.valor)

teste('16 × 100', () => {
  const resultado = calcular(16)
  assert.deepEqual([resultado.total, resultado.clube, resultado.premio, resultado.parcela], [1600, 400, 1200, 20])
  assert.deepEqual(valores(16), [600, 360, 240])
})

teste('16 × 50', () => {
  assert.equal(calcular(16, { inscricao: 50 }).clube, 200)
  assert.deepEqual(valores(16, { inscricao: 50 }), [300, 180, 120])
})

teste('divisão automática', () => {
  for (const jogadores of [6, 8, 12, 15, 16, 19]) assert.deepEqual(divisaoAutomatica(jogadores), [50, 30, 20])
  for (const jogadores of [20, 22, 27]) assert.deepEqual(divisaoAutomatica(jogadores), [45, 27, 18, 10])
  for (const jogadores of [28, 30]) assert.deepEqual(divisaoAutomatica(jogadores), [40, 25, 17, 11, 7])
  assert.deepEqual(valores(16, { divisao: 'so-primeiro' }), [1200])
})

teste('abaixo do mínimo avisa e continua calculando', () => {
  const resultado = calcular(12)
  assert.equal(resultado.faltamJogadores, 4)
  assert.equal(resultado.posicoes.length, 3)
})

teste('sobra do arredondamento vai para o clube', () => {
  const resultado = calcular(22)
  assert.deepEqual(valores(22), [740, 445, 295, 165])
  assert.equal(resultado.arredondamento, 5)
  assert.equal(resultado.clube + resultado.arredondamento + valores(22).reduce((a, b) => a + b, 0), resultado.total)
})

teste('antecipada pela quantidade', () => {
  const antecipada = { valor: 80, ate: '2027-01-10', quantidade: 5 }
  assert.equal(calcular(16, { antecipada }).total, 1500)
  assert.equal(calcular(4, { antecipada }).total, 320, 'não conta mais gente do que tem')
})

teste('validação', () => {
  assert.ok(premiacaoValida(PADRAO))
  assert.ok(premiacaoValida({ ...PADRAO, ativa: false, inscricao: 0 }))
  assert.ok(!premiacaoValida({ ...PADRAO, divisao: { personalizada: [60, 30] } }))
  assert.ok(premiacaoValida({ ...PADRAO, divisao: { personalizada: lerDivisao('60, 30,10') } }))
  assert.ok(!premiacaoValida({ ...PADRAO, divisao: { personalizada: lerDivisao('60, x, 40') } }))
  assert.ok(!premiacaoValida({ ...PADRAO, antecipada: { valor: 120, ate: '2027-01-10', quantidade: 1 } }))
  assert.equal(premiacaoDe(undefined, 16), null, 'arquivo antigo, sem premiação')
})

teste('empate em 2º divide 2º e 3º', () => {
  const linhas = [1, 2, 2, 4].map((posicao, indice) => ({ jogadorId: 'p' + indice, posicao, partidas: 1 })) as LinhaRankingTorneio[]
  assert.deepEqual([...premioDaPosicao(calcular(16), linhas).values()], [600, 300, 300])
})

teste('quem não jogou não recebe', () => {
  const linhas = [0, 1, 1, 1].map((partidas, indice) => ({ jogadorId: 'p' + indice, posicao: indice + 1, partidas })) as LinhaRankingTorneio[]
  assert.deepEqual([...premioDaPosicao(calcular(16), linhas).keys()], ['p1', 'p2', 'p3'])
})

teste('temporada', () => {
  const linha = (jogadorId: string, valor: number, abaixoDoMinimo = false): LinhaTemporada => ({
    jogadorId, valor, partidas: 4, encontros: 2, soma: valor, abaixoDoMinimo,
  })
  const premios = premioDaTemporada(calcular(16), [linha('a', 30), linha('b', 30), linha('c', 10), linha('d', 99, true)])
  assert.deepEqual([...premios], [['a', 480], ['b', 480], ['c', 240]])
})

teste('exportação leva a premiação e aceita arquivo sem ela', () => {
  const sem = criarRascunho({ id: 't', agora: new Date(2026, 10, 22), nome: 'T' })
  for (const torneio of [sem, { ...sem, premiacao: PADRAO }]) {
    const pacote = exportarTorneio(torneio, { partidas: [], jogadores: [], temporadas: [] }, { modo: 'copia', agora: '' })
    const lido = validarPacote(JSON.stringify(pacote))
    assert.ok(lido.ok)
    assert.deepEqual(lido.pacote.torneio.premiacao, torneio.premiacao)
  }
})

console.log(`Premiação: ${testes} testes passaram.`)
