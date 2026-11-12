/**
 * Testes do sorteio de mesas do clube, da lista de presença e dos cards de placar.
 *
 * Uso: npm run test:clube
 */
import assert from 'node:assert/strict'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import { agruparAbertas, marcarMesaRegistrada } from '../src/dominios/centerpiece/logica/encontroClube'
import {
  acrescentarNomes,
  ehConvidado,
  entradasDaLista,
  jogadorDaLinha,
  limparLista,
  sugestoesParaLinha,
  textoDasMesas,
} from '../src/dominios/centerpiece/logica/listaClube'
import {
  criarPartida,
  declararRiichi,
  finalizarPartida,
  KANJI_VENTO,
  ORDEM_VENTOS,
  registrarRon,
  registrarTsumo,
  type Partida,
} from '../src/dominios/centerpiece/logica/partida'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import {
  contadoresDaPartida,
  linhasDoHistorico,
  linhasEmAndamento,
  maiorMao,
  patamarDaMao,
} from '../src/dominios/centerpiece/logica/resumoPartida'
import {
  contagemDeMesas,
  embaralhar,
  inteiroAleatorioSeguro,
  sortearMesas,
} from '../src/dominios/centerpiece/logica/sorteioClube'
import type { Jogador } from '../src/dominios/jogadores/logica/jogadores'

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

const nomes = (quantidade: number) => Array.from({ length: quantidade }, (_, indice) => `J${indice + 1}`)

// ─── Sorteio ────────────────────────────────────────────────────────────────
teste('sorteio: só com total múltiplo de 4 e pelo menos 4', () => {
  assert.deepEqual(sortearMesas(nomes(0)), { ok: false, erro: 'poucos' })
  assert.deepEqual(sortearMesas(nomes(3)), { ok: false, erro: 'poucos' })
  assert.deepEqual(sortearMesas(nomes(5)), { ok: false, erro: 'naoMultiplo' })
  assert.deepEqual(sortearMesas(nomes(14)), { ok: false, erro: 'naoMultiplo' })
  for (const total of [4, 8, 12, 40]) {
    const resultado = sortearMesas(nomes(total))
    assert.ok(resultado.ok)
    assert.equal(resultado.mesas.length, total / 4)
  }
})

teste('sorteio: ninguém repetido e ninguém perdido', () => {
  for (let rodada = 0; rodada < 200; rodada += 1) {
    const lista = nomes(4 * (1 + (rodada % 10)))
    const resultado = sortearMesas(lista)
    assert.ok(resultado.ok)
    const sorteados = resultado.mesas.flatMap((mesa) => mesa.assentos.map((assento) => assento.jogador))
    assert.equal(sorteados.length, lista.length)
    assert.equal(new Set(sorteados).size, lista.length)
    assert.deepEqual([...sorteados].sort(), [...lista].sort())
  }
})

teste('sorteio: cada mesa tem os 4 ventos, na ordem Leste, Sul, Oeste, Norte', () => {
  const resultado = sortearMesas(nomes(16))
  assert.ok(resultado.ok)
  resultado.mesas.forEach((mesa, indice) => {
    assert.equal(mesa.numero, indice + 1)
    assert.equal(mesa.assentos.length, 4)
    assert.deepEqual(
      mesa.assentos.map((assento) => assento.vento),
      ORDEM_VENTOS,
    )
  })
})

teste('sorteio: grupos de 4 na ordem embaralhada', () => {
  // Aleatório que sempre devolve 0: Fisher-Yates gira a lista de um jeito previsível.
  const fixo = () => 0
  const ordem = embaralhar(nomes(8), fixo)
  const resultado = sortearMesas(nomes(8), fixo)
  assert.ok(resultado.ok)
  assert.deepEqual(
    resultado.mesas.flatMap((mesa) => mesa.assentos.map((assento) => assento.jogador)),
    ordem,
  )
})

teste('embaralhar: não mexe na lista original', () => {
  const lista = nomes(12)
  const copia = [...lista]
  embaralhar(lista)
  assert.deepEqual(lista, copia)
})

teste('aleatório seguro: sempre dentro do limite', () => {
  for (const limite of [1, 2, 3, 7, 52, 1000]) {
    for (let vez = 0; vez < 500; vez += 1) {
      const valor = inteiroAleatorioSeguro(limite)
      assert.ok(Number.isInteger(valor) && valor >= 0 && valor < limite, `${valor} em ${limite}`)
    }
  }
})

teste('embaralhar: distribuição sem viés grosseiro', () => {
  const contagem = new Map<string, number>()
  const vezes = 24000
  for (let vez = 0; vez < vezes; vez += 1) {
    const chave = embaralhar(['a', 'b', 'c', 'd']).join('')
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
  }
  assert.equal(contagem.size, 24)
  for (const quantidade of contagem.values()) assert.ok(quantidade > 700 && quantidade < 1300)
})

teste('contagem: mesas, falta e sobra', () => {
  assert.deepEqual(contagemDeMesas(0), { mesas: 0, faltam: 4, sobram: 0, podeSortear: false })
  assert.deepEqual(contagemDeMesas(3), { mesas: 0, faltam: 1, sobram: 3, podeSortear: false })
  assert.deepEqual(contagemDeMesas(12), { mesas: 3, faltam: 0, sobram: 0, podeSortear: true })
  assert.deepEqual(contagemDeMesas(13), { mesas: 3, faltam: 3, sobram: 1, podeSortear: false })
})

// ─── Lista ──────────────────────────────────────────────────────────────────
const cadastro: Jogador[] = [
  { id: 'ana', nome: 'Ana Souza', apelido: 'Ana', criadoEm: '', arquivado: false },
  { id: 'jose', nome: 'José Lima', criadoEm: '', arquivado: false },
  { id: 'velho', nome: 'Antônio', criadoEm: '', arquivado: true },
]

teste('lista: ignora vazias e remove repetidos sem acento e sem maiúsculas', () => {
  const limpa = limparLista('Bruno\n\n  bruno \nJOSE LIMA\njosé lima\nCarla\n', cadastro)
  assert.deepEqual(limpa.nomes, ['Bruno', 'JOSE LIMA', 'Carla'])
  assert.equal(limpa.repetidos, 2)
})

teste('lista: nome e apelido do mesmo cadastro contam como repetido', () => {
  const limpa = limparLista('Ana\nAna Souza', cadastro)
  assert.deepEqual(limpa.nomes, ['Ana'])
  assert.equal(limpa.repetidos, 1)
})

teste('lista: vincula ao cadastro e deixa os outros como convidados', () => {
  assert.deepEqual(entradasDaLista('ana souza\nDiego\njose lima', cadastro), [
    { nome: 'Ana', jogadorId: 'ana' },
    { nome: 'Diego' },
    { nome: 'José Lima', jogadorId: 'jose' },
  ])
  // Arquivado não vincula.
  assert.equal(jogadorDaLinha(cadastro, 'Antonio'), undefined)
})

teste('lista: sugestões começam pelo texto e pulam quem já está na lista', () => {
  assert.deepEqual(
    sugestoesParaLinha(cadastro, 'a', new Set()).map((jogador) => jogador.id),
    ['ana', 'jose'],
  )
  assert.deepEqual(sugestoesParaLinha(cadastro, 'li', new Set(['jose'])), [])
  assert.deepEqual(sugestoesParaLinha(cadastro, 'Ana', new Set()), [])
  assert.deepEqual(sugestoesParaLinha(cadastro, '', new Set()), [])
})

teste('lista: acrescentar no fim sem repetir', () => {
  const resultado = acrescentarNomes('Bruno\nAna', ['Ana', 'José Lima'], cadastro)
  assert.equal(resultado.texto, 'Bruno\nAna\nJosé Lima')
  assert.equal(resultado.repetidos, 1)
})

teste('lista: inserir na linha do cursor', () => {
  const resultado = acrescentarNomes('Bruno\n\nCarla', ['José Lima'], cadastro, 1)
  assert.equal(resultado.texto, 'Bruno\nJosé Lima\nCarla')
  assert.equal(acrescentarNomes('Bruno', ['Ana'], cadastro, 0).texto, 'Ana\nBruno')
})

teste('compartilhar: texto simples com kanji, vento e nome', () => {
  const texto = textoDasMesas(
    [
      {
        numero: 1,
        assentos: ORDEM_VENTOS.map((vento, indice) => ({ vento, jogador: { nome: ['Ana', 'Bruno', 'Carla', 'Diego'][indice] } })),
      },
    ],
    {
      titulo: 'Riichi Manager · Mesas do clube · 05/11/2026',
      mesa: (numero) => `Mesa ${numero}`,
      vento: (vento) => ({ leste: 'Leste', sul: 'Sul', oeste: 'Oeste', norte: 'Norte' })[vento],
    },
  )
  assert.equal(
    texto,
    'Riichi Manager · Mesas do clube · 05/11/2026\n\nMesa 1\n東 Leste: Ana\n南 Sul: Bruno\n西 Oeste: Carla\n北 Norte: Diego',
  )
  assert.equal(KANJI_VENTO.leste, '東')
})

teste('convidado: reconhecido pelo prefixo do id', () => {
  assert.ok(ehConvidado('convidado-123'))
  assert.ok(!ehConvidado('ana'))
})

// ─── Encontro ───────────────────────────────────────────────────────────────
const CTX = { id: 'e', agora: '2026-11-05T22:30:00.000Z' }
const nova = (id: string, encontro?: Partida['encontro']): Partida => ({
  ...criarPartida(id, configDoPreset('padrao'), ['a', 'b', 'c', 'd'], CTX.agora),
  ...(encontro ? { encontro } : {}),
})

teste('encontro: mesas agrupadas e avulsas soltas, na ordem de criação', () => {
  const grupos = agruparAbertas([
    nova('solta1'),
    nova('m2', { id: 'enc', mesa: 2 }),
    nova('solta2'),
    nova('m1', { id: 'enc', mesa: 1 }),
  ])
  assert.deepEqual(
    grupos.map((grupo) =>
      grupo.tipo === 'avulsa' ? grupo.partida.id : grupo.partidas.map((partida) => partida.id),
    ),
    ['solta1', ['m1', 'm2'], 'solta2'],
  )
})

teste('encontro: marcar mesa registrada', () => {
  const sorteio = {
    encontro: { id: 'enc', criadoEm: CTX.agora, jogadores: [] },
    mesas: [
      { numero: 1, assentos: [] },
      { numero: 2, assentos: [] },
    ],
  }
  const marcado = marcarMesaRegistrada(sorteio, 2, 'p2')
  assert.equal(marcado.mesas[0].partidaId, undefined)
  assert.equal(marcado.mesas[1].partidaId, 'p2')
})

// ─── Cards de placar ────────────────────────────────────────────────────────
teste('patamar: Mangan a Yakuman pelo han e fu', () => {
  assert.equal(patamarDaMao(3, 30), null)
  assert.equal(patamarDaMao(4, 40), 'mangan')
  assert.equal(patamarDaMao(3, 70), 'mangan')
  assert.equal(patamarDaMao(5), 'mangan')
  assert.equal(patamarDaMao(6), 'haneman')
  assert.equal(patamarDaMao(8), 'baiman')
  assert.equal(patamarDaMao(11), 'sanbaiman')
  assert.equal(patamarDaMao(13), 'yakuman')
  assert.equal(patamarDaMao(undefined, undefined, 1), 'yakuman')
})

teste('card: em andamento na ordem dos ventos, dealer em destaque', () => {
  let partida = nova('p')
  // Cadeira 1 vence um ron de Haneman: o dealer passa para a cadeira 1.
  partida = registrarRon(partida, { pagador: 0, vencedores: [{ cadeira: 1, pontos: 12000, han: 6, fu: 30 }] }, CTX)
  const linhas = linhasEmAndamento(partida)
  assert.deepEqual(
    linhas.map((linha) => [linha.cadeira, linha.vento, linha.destaque]),
    [
      [1, 'leste', true],
      [2, 'sul', false],
      [3, 'oeste', false],
      [0, 'norte', false],
    ],
  )
  assert.equal(linhas[0].destaque, true)
  assert.deepEqual(maiorMao(partida), { cadeira: 1, patamar: 'haneman' })
})

teste('card: contadores de Riichi, ron, tsumo e deal-in', () => {
  let partida = nova('p')
  partida = declararRiichi(partida, 2, CTX)
  partida = registrarRon(partida, { pagador: 3, vencedores: [{ cadeira: 2, pontos: 3900, han: 3, fu: 30 }] }, CTX)
  partida = registrarTsumo(partida, { vencedor: 0, pagamentoDealer: 1000, pagamentoNaoDealer: 500, han: 2, fu: 30 }, CTX)
  const contadores = contadoresDaPartida(partida)
  assert.ok(contadores)
  assert.deepEqual(contadores[2], { riichi: 1, ron: 1, tsumo: 0, dealIn: 0 })
  assert.deepEqual(contadores[3], { riichi: 0, ron: 0, tsumo: 0, dealIn: 1 })
  assert.deepEqual(contadores[0], { riichi: 0, ron: 0, tsumo: 1, dealIn: 0 })
  assert.equal(maiorMao(partida), null)
})

teste('card: histórico pela colocação, com o 1º em destaque', () => {
  const jogada = registrarRon(nova('p'), { pagador: 0, vencedores: [{ cadeira: 3, pontos: 8000 }] }, CTX)
  const linhas = linhasDoHistorico(finalizarPartida(jogada, CTX.agora))
  // As cadeiras 1 e 2 empatam com 25.000 e dividem o 2º lugar.
  assert.deepEqual(
    linhas.map((linha) => linha.colocacao),
    [1, 2, 2, 4],
  )
  assert.equal(linhas[0].cadeira, 3)
  assert.equal(linhas[0].destaque, true)
  assert.equal(linhas.filter((linha) => linha.destaque).length, 1)
  assert.equal(linhas[3].cadeira, 0)
  assert.ok((linhas[3].delta ?? 0) < 0)
})

teste('card: partida registrada à mão não tem contadores', () => {
  const config = configDoPreset('padrao')
  const manual = criarPartidaManual(
    'm',
    config,
    {
      jogadorIds: ['a', 'b', 'c', 'd'],
      nomes: ['A', 'B', 'C', 'D'],
      pontos: [40000, 30000, 20000, 10000],
      pontosPartida: config.pontosPartida,
      pontosRetorno: config.pontosRetorno,
      uma: config.uma,
    },
    CTX.agora,
  )
  assert.equal(contadoresDaPartida(manual), null)
})

console.log(`Clube: ${testes} testes passaram.`)
