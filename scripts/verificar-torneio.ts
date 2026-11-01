/**
 * Testes do torneio: bloco de notas, sorteio, mesas ligadas às partidas, ranking e
 * migração do torneio antigo.
 *
 * Uso: npm run test:torneio
 */
import assert from 'node:assert/strict'
import { calcularOka } from '../src/dominios/centerpiece/logica/configMesa'
import { registrarRon, finalizarPartida, type Partida } from '../src/dominios/centerpiece/logica/partida'
import { partidasDoHistorico } from '../src/dominios/centerpiece/logica/ranking'
import { garantirPorNomes, JOGADORES_PADRAO } from '../src/dominios/jogadores/logica/jogadores'
import {
  acrescentarTempoMesa,
  alternarTimer,
  segundosRestantesBase,
  segundosRestantesMesa,
} from '../src/dominios/torneio-fast/logica/acoes'
import {
  colarNaLinha,
  linhasRepetidas,
  quebrarColagem,
  situacaoDaLista,
} from '../src/dominios/torneio-fast/logica/blocoNotas'
import { migrarTorneioAntigo } from '../src/dominios/torneio-fast/logica/migrarTorneioAntigo'
import {
  coberturaIndireta,
  distribuicaoDeVentos,
  notaDaGrade,
} from '../src/dominios/torneio-fast/logica/qualidade'
import { gerarGrade } from '../src/dominios/torneio-fast/logica/sorteio'
import type { RascunhoTorneio, Rodada } from '../src/dominios/torneio-fast/logica/tipos'
import {
  avancarSeRodadaCompleta,
  configPadraoTorneio,
  criarPartidaDaMesa,
  criarPartidaManual,
  criarTorneio,
  guardarPartida,
  partidaDaMesa,
  progressoDaRodada,
  rankingDoTorneio,
  rascunhoInicial,
  reabrirPartida,
  statusDaMesa,
} from '../src/dominios/torneio-fast/logica/torneio'

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

const CTX = { id: 'x', agora: '2026-11-01T12:00:00.000Z' }
const nomes = (total: number) => Array.from({ length: total }, (_, indice) => `J${indice + 1}`)

function conferirGrade(rodadas: Rodada[], jogadores: string[]) {
  for (const rodada of rodadas) {
    const vistos = rodada.mesas.flatMap((mesa) => mesa.assentos.map((assento) => assento.jogador))
    assert.equal(new Set(vistos).size, vistos.length, 'ninguém em duas mesas na mesma rodada')
    assert.deepEqual([...vistos].sort(), [...jogadores].sort(), 'todos jogam todas as rodadas')
    for (const mesa of rodada.mesas) {
      assert.deepEqual(mesa.assentos.map((assento) => assento.vento).sort(), ['Leste', 'Norte', 'Oeste', 'Sul'])
    }
  }
}

function torneioDe(total = 8) {
  const lista = nomes(total)
  const rascunho: RascunhoTorneio = {
    ...rascunhoInicial(),
    linhas: lista,
    sorteio: gerarGrade(lista, 2),
  }
  const torneio = criarTorneio(rascunho, lista, lista.map((nome) => `id-${nome}`), CTX)
  assert.ok(torneio)
  return torneio
}

teste('colar lista do WhatsApp: tira numeração e marcadores e ignora vazias', () => {
  assert.deepEqual(
    quebrarColagem('1. Ana\n2) Bia\n\n- Caio\n• Dani\n3\n* Edu\nFabi Lima\n'),
    ['Ana', 'Bia', 'Caio', 'Dani', 'Edu', 'Fabi Lima'],
  )
})

teste('colar na linha: mantém o que já estava escrito', () => {
  assert.deepEqual(colarNaLinha(['Ana', ''], 1, 'Bia\nCaio'), ['Ana', 'Bia', 'Caio'])
  assert.deepEqual(colarNaLinha(['Ana'], 0, 'Bia'), ['Ana', 'Bia'])
  assert.deepEqual(colarNaLinha(['Ana'], 0, '\n\n'), ['Ana'])
})

teste('nome repetido é marcado sem olhar maiúsculas nem acentos', () => {
  assert.deepEqual([...linhasRepetidas(['José', 'Ana', 'jose', ''])], [0, 2])
})

teste('situação: mínimo 8 e múltiplo de 4', () => {
  assert.deepEqual(situacaoDaLista(nomes(3)), { total: 3, mesas: 0, faltam: 5, repetidos: false, valida: false })
  assert.equal(situacaoDaLista(nomes(8)).valida, true)
  assert.equal(situacaoDaLista(nomes(11)).faltam, 1)
  assert.equal(situacaoDaLista(nomes(16)).valida, true)
  assert.equal(situacaoDaLista(nomes(16)).mesas, 4)
  assert.equal(situacaoDaLista([...nomes(7), 'J1']).valida, false)
})

for (const [total, rodadas] of [[8, 4], [12, 4], [16, 3], [16, 6], [20, 8]] as const) {
  teste(`sorteio: ${total} jogadores, ${rodadas} rodadas, sem conflito`, () => {
    const grade = gerarGrade(nomes(total), rodadas)
    assert.equal(grade.rodadas.length, rodadas)
    conferirGrade(grade.rodadas, nomes(total))
  })
}

teste('ventos equilibrados com a opção ligada', () => {
  const { rodadas } = gerarGrade(nomes(16), 4)
  for (const linha of distribuicaoDeVentos(rodadas).values()) assert.deepEqual(linha, [1, 1, 1, 1])
  const grande = gerarGrade(nomes(16), 8)
  for (const linha of distribuicaoDeVentos(grande.rodadas).values()) assert.deepEqual(linha, [2, 2, 2, 2])
})

teste('com a opção desligada, a grade continua válida', () => {
  const { rodadas } = gerarGrade(nomes(16), 4, false)
  conferirGrade(rodadas, nomes(16))
})

teste('diagnóstico: nota e encontros indiretos', () => {
  const grade = gerarGrade(nomes(16), 2)
  assert.ok(['perfeita', 'boa', 'regular', 'ruim'].includes(notaDaGrade(grade.qualidade)))
  const { semEncontro, comIndireto } = coberturaIndireta(grade.rodadas)
  assert.ok(semEncontro > 0)
  assert.ok(comIndireto <= semEncontro)
})

teste('padrão do torneio: 30.000 e 30.000, sem oka', () => {
  const config = configPadraoTorneio()
  assert.equal(config.pontosPartida, 30000)
  assert.equal(calcularOka(config), 0)
})

teste('criar torneio: troca nomes por ids', () => {
  const torneio = torneioDe()
  assert.equal(torneio.jogadorIds[0], 'id-J1')
  assert.ok(torneio.grade[0].mesas[0].assentos.every((assento) => assento.jogador.startsWith('id-')))
})

teste('mesa aberta vira partida com vento do sorteio e regras do torneio', () => {
  const torneio = torneioDe()
  // Assentos fora da ordem dos ventos, como o sorteio pode deixar.
  const assentos = [...torneio.grade[1].mesas[0].assentos].reverse()
  torneio.grade[1].mesas[0].assentos = assentos
  const partida = criarPartidaDaMesa(torneio, 1, 0, CTX)
  for (const assento of assentos) {
    const cadeira = (['Leste', 'Sul', 'Oeste', 'Norte'] as const).indexOf(assento.vento) as 0 | 1 | 2 | 3
    assert.equal(partida.assentos[cadeira].jogadorId, assento.jogador, assento.vento)
  }
  assert.equal(partida.placar.cadeiraDealer, 0)
  assert.equal(partida.placar.pontos[0], 30000)
  assert.deepEqual(partida.vinculoTorneio, { torneioId: torneio.id, rodada: 1, mesa: 0 })
})

teste('status da mesa: não iniciada, em andamento, finalizada e guardada', () => {
  const torneio = torneioDe()
  assert.equal(statusDaMesa(partidaDaMesa([], torneio.id, 0, 0)), 'nao_iniciada')
  const aberta = criarPartidaDaMesa(torneio, 0, 0, CTX)
  assert.equal(statusDaMesa(aberta), 'em_andamento')
  const fim = finalizarPartida(
    registrarRon(aberta, { pagador: 1, vencedores: [{ cadeira: 0, pontos: 8000 }] }, CTX),
    CTX.agora,
  )
  assert.equal(statusDaMesa(fim), 'finalizada')
  assert.equal(partidasDoHistorico([fim]).length, 0)
  assert.equal(statusDaMesa(guardarPartida(fim)), 'guardada')
  assert.equal(partidasDoHistorico([guardarPartida(fim)]).length, 1)
  assert.equal(statusDaMesa(reabrirPartida(guardarPartida(fim))), 'finalizada')
})

function guardadas(torneio: ReturnType<typeof torneioDe>): Partida[] {
  return torneio.grade[0].mesas.map((_, mesa) =>
    guardarPartida(criarPartidaManual(torneio, 0, mesa, [40000, 35000, 25000, 20000], { ...CTX, id: `m${mesa}` })),
  )
}

teste('lançamento manual calcula o resultado com a config do torneio', () => {
  const torneio = torneioDe()
  const [partida] = guardadas(torneio)
  assert.equal(partida.status, 'finalizada')
  assert.equal(partida.resultado?.[0].final, 25)
  assert.equal(partida.resultado?.[3].final, -25)
})

teste('ranking do torneio soma só as guardadas e mostra quem não jogou', () => {
  const torneio = torneioDe()
  const partidas = guardadas(torneio)
  const semUma = rankingDoTorneio([reabrirPartida(partidas[0])], torneio)
  assert.ok(semUma.every((linha) => linha.partidas === 0))
  assert.equal(semUma.length, 8)
  const linhas = rankingDoTorneio(partidas, torneio)
  assert.equal(linhas.reduce((soma, linha) => soma + linha.pontuacaoTotal, 0), 0)
  assert.equal(linhas[0].pontuacaoTotal, 25)
  const outro = rankingDoTorneio(partidas, { ...torneio, id: 'outro' })
  assert.ok(outro.every((linha) => linha.partidas === 0))
})

teste('corrigir uma mesa recalcula o ranking', () => {
  const torneio = torneioDe()
  const partidas = guardadas(torneio)
  const corrigida = guardarPartida(
    criarPartidaManual(torneio, 0, 0, [20000, 25000, 35000, 40000], { ...CTX, id: 'nova' }),
  )
  const primeiro = torneio.grade[0].mesas[0].assentos.find((assento) => assento.vento === 'Leste')?.jogador
  const linhas = rankingDoTorneio([corrigida, partidas[1]], torneio)
  assert.equal(linhas.find((linha) => linha.jogadorId === primeiro)?.pontuacaoTotal, -25)
})

teste('rodada completa avança o timer; incompleta não', () => {
  const torneio = torneioDe()
  const partidas = guardadas(torneio)
  assert.equal(avancarSeRodadaCompleta(torneio, partidas.slice(0, 1)).timer.indiceRodada, 0)
  assert.deepEqual(progressoDaRodada(partidas.slice(0, 1), torneio, 0), { guardadas: 1, total: 2 })
  assert.equal(avancarSeRodadaCompleta(torneio, partidas).timer.indiceRodada, 1)
})

teste('tempo da mesa soma o acréscimo só dela', () => {
  let torneio = alternarTimer(torneioDe(), 0)
  assert.equal(segundosRestantesBase(torneio.timer, 10000), 5390)
  torneio = acrescentarTempoMesa(torneio, 0, 1)
  assert.equal(segundosRestantesMesa(torneio.timer, 0, 1, 10000), 5690)
  assert.equal(segundosRestantesMesa(torneio.timer, 0, 0, 10000), 5390)
})

const antigo = () => {
  const lista = nomes(8)
  const { rodadas } = gerarGrade(lista, 2)
  const grade = rodadas.map((rodada) => ({
    ...rodada,
    mesas: rodada.mesas.map((mesa) => ({
      ...mesa,
      assentos: mesa.assentos.map((assento) => ({ ...assento, pontuacao: 30000 })),
    })),
  }))
  return {
    jogadores: lista,
    grade,
    qualidade: null,
    classificacao: {},
    mesasConcluidas: { '0_0': true },
    pontuacoesPorMesa: { '0_0': ['40.000', '35.000', '25.000', '20.000'] },
    timer: { totalSegundos: 3600, segundosRestantes: 1200, indiceRodada: 0, rodando: true, iniciadoEm: 5, acrescimosPorMesa: { '0_1': 2 } },
  }
}

teste('migração: nomes viram ids, mesa concluída vira partida guardada, sem perder pontos', () => {
  let n = 0
  const r = migrarTorneioAntigo(JSON.stringify(antigo()), (lista) => lista.map((nome) => `id-${nome}`), {
    gerarId: () => `g${(n += 1)}`,
    agora: CTX.agora,
  })
  assert.ok(r)
  assert.equal(r.torneio.jogadorIds[0], 'id-J1')
  assert.deepEqual(r.torneio.config.uma, [8, 4, -4, -8])
  assert.equal(r.torneio.config.pontosRetorno, 30000)
  assert.equal(r.torneio.timer.segundosRestantes, 1200)
  assert.equal(r.torneio.timer.rodando, false)
  assert.equal(r.torneio.timer.acrescimosPorMesa['0_1'], 2)
  assert.equal(r.partidas.length, 1)
  assert.equal(statusDaMesa(r.partidas[0]), 'guardada')
  assert.equal(r.partidas[0].resultado?.[0].final, 18)
  assert.equal(r.partidas[0].resultado?.[3].final, -18)
  // Os pontos ficam com quem os fez, mesmo com os assentos fora da ordem dos ventos.
  const dados = antigo()
  const mesaAntiga = dados.grade[0].mesas[0]
  const ganhador = mesaAntiga.assentos[0]
  const migrado = migrarTorneioAntigo(JSON.stringify(dados), (lista) => lista.map((nome) => `id-${nome}`), {
    gerarId: () => `g${(n += 1)}`,
    agora: CTX.agora,
  })
  assert.equal(migrado?.partidas[0].resultado?.[0].jogadorId, `id-${ganhador.jogador}`)
})

teste('migração: sem dados, vazio ou ilegível não cria torneio', () => {
  const contexto = { gerarId: () => 'g', agora: CTX.agora }
  assert.equal(migrarTorneioAntigo(null, () => [], contexto), null)
  assert.equal(migrarTorneioAntigo('{quebrado', () => [], contexto), null)
  assert.equal(migrarTorneioAntigo(JSON.stringify({ jogadores: [], grade: [] }), () => [], contexto), null)
})

teste('migração não duplica quem já está no cadastro, nem por apelido', () => {
  const { jogadores, ids } = garantirPorNomes([...JOGADORES_PADRAO], ['saki', 'Nova'], () => 'novo', CTX.agora)
  assert.equal(ids[0], 'padrao-saki')
  assert.equal(ids[1], 'novo')
  assert.equal(jogadores.length, JOGADORES_PADRAO.length + 1)
})

console.log(`Torneio ok: ${testes} testes.`)
