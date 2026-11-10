/**
 * Testes do banco local (IndexedDB pelo Dexie, simulado com fake-indexeddb):
 * migração do localStorage sem perda, resumo e detalhes das partidas e o limite
 * de detalhes.
 *
 * Uso: npm run test:armazenamento
 */
import 'fake-indexeddb/auto'
import assert from 'node:assert/strict'
import type { ArmazenamentoChaveValor } from '../src/compartilhado/persistencia/armazenamento'
import type { Partida } from '../src/dominios/centerpiece/logica/partida'
import {
  gerarClubeDeTeste,
  gerarJogadoresDeTeste,
  gerarPartidasDeTeste,
  gerarTorneiosDeTeste,
} from '../src/dominios/centerpiece/logica/dadosDeTeste'
import { computeRanking, FILTROS_PADRAO } from '../src/dominios/centerpiece/logica/filtrosRanking'
import { criarBancoDexie } from '../src/services/storage/bancoDexie'
import {
  abrirArmazenamentoDados,
  CHAVE_LIMITE_DETALHES,
  CHAVE_PARTIDAS,
} from '../src/services/storage/armazenamentoDados'
import { dividirPartida, idsParaPodar, montarPartida } from '../src/services/storage/partidaArmazenada'

let testes = 0
async function teste(nome: string, corpo: () => Promise<void> | void) {
  try {
    await corpo()
    testes += 1
  } catch (erro) {
    console.error(`Falhou: ${nome}`)
    throw erro
  }
}

function memoria(inicial: Record<string, string> = {}): ArmazenamentoChaveValor & { dados: Record<string, string> } {
  const dados = { ...inicial }
  return {
    dados,
    ler: (chave) => dados[chave] ?? null,
    gravar: (chave, valor) => {
      dados[chave] = valor
    },
    remover: (chave) => {
      delete dados[chave]
    },
  }
}

const AGORA = new Date(2026, 10, 10, 20)
let contador = 0
const bancoNovo = () => `teste-${(contador += 1)}`

/** Um localStorage como o de quem já usa o app: massa de teste inteira. */
function localStorageCheio() {
  const torneios = gerarTorneiosDeTeste(AGORA)
  const clube = gerarClubeDeTeste(AGORA)
  const partidas: Partida[] = [...gerarPartidasDeTeste(AGORA, 140), ...torneios.partidas, ...clube.partidas]
  return {
    partidas,
    origem: memoria({
      'riichi-manager-jogadores': JSON.stringify({ versao: 1, jogadores: gerarJogadoresDeTeste(AGORA) }),
      [CHAVE_PARTIDAS]: JSON.stringify({ versao: 3, partidas }),
      'riichi-manager-torneios': JSON.stringify({ versao: 2, torneios: torneios.torneios, temporadas: torneios.temporadas, listas: [] }),
      'riichi-manager-clube-lista': clube.lista,
      // Preferência: fica no localStorage.
      'riichi-manager-tema': 'escuro',
    }),
  }
}

const partidasDe = (armazenamento: ArmazenamentoChaveValor) =>
  (JSON.parse(armazenamento.ler(CHAVE_PARTIDAS) ?? '{"partidas":[]}') as { versao: number; partidas: Partida[] })

await teste('resumo e detalhes: dividir e montar de volta', () => {
  const [partida] = gerarPartidasDeTeste(AGORA, 1)
  const { resumo, detalhes } = dividirPartida(partida)
  assert.ok(!('eventos' in resumo) && !('placar' in resumo), 'o resumo não leva o mão a mão')
  assert.deepEqual(montarPartida(resumo, detalhes), partida)
  const semDetalhes = montarPartida(resumo)
  assert.deepEqual(semDetalhes.resultado, partida.resultado, 'o resultado fica')
  assert.deepEqual(semDetalhes.eventos, [])
  for (const linha of partida.resultado ?? []) {
    assert.equal(semDetalhes.placar.pontos[linha.cadeira], linha.pontosBrutos, 'pontos finais no placar')
  }
})

await teste('poda: só as finalizadas além das N mais recentes', () => {
  const partidas = [
    { id: 'a', status: 'finalizada' as const, finalizadaEm: '2026-01-01' },
    { id: 'b', status: 'finalizada' as const, finalizadaEm: '2026-03-01' },
    { id: 'c', status: 'em_andamento' as const },
    { id: 'd', status: 'finalizada' as const, finalizadaEm: '2026-02-01' },
  ]
  assert.deepEqual(idsParaPodar(partidas, 2), ['a'])
  assert.deepEqual(idsParaPodar(partidas, 0), ['b', 'd', 'a'])
})

await teste('migração: copia, confere e só então apaga o localStorage', async () => {
  const { origem, partidas } = localStorageCheio()
  const antes = { ...origem.dados }
  const banco = criarBancoDexie(bancoNovo())
  const dados = await abrirArmazenamentoDados(banco, origem, { agora: AGORA })

  assert.equal(origem.ler(CHAVE_PARTIDAS), null, 'chave antiga apagada')
  assert.equal(origem.ler('riichi-manager-jogadores'), null)
  assert.equal(origem.ler('riichi-manager-tema'), 'escuro', 'preferências ficam no localStorage')
  assert.equal(dados.ler('riichi-manager-jogadores'), antes['riichi-manager-jogadores'])
  assert.equal(dados.ler('riichi-manager-torneios'), antes['riichi-manager-torneios'])
  assert.equal(dados.ler('riichi-manager-clube-lista'), antes['riichi-manager-clube-lista'])

  const lidas = partidasDe(dados)
  assert.equal(lidas.versao, 3, 'versão do formato preservada')
  assert.equal(lidas.partidas.length, partidas.length)
  // Ranking idêntico, mesmo com as mais antigas sem detalhes (limite padrão 100).
  assert.deepEqual(computeRanking(lidas.partidas, FILTROS_PADRAO, AGORA), computeRanking(partidas, FILTROS_PADRAO, AGORA))
  const conteudo = await banco.lerTudo()
  assert.equal(conteudo.resumos.length, partidas.length)
  const abertas = partidas.filter((partida) => partida.status !== 'finalizada').length
  assert.equal(conteudo.detalhes.length, 100 + abertas, 'detalhes das 100 mais recentes e das mesas abertas')
  // As 100 mais recentes e as abertas voltam idênticas.
  const podadas = new Set(idsParaPodar(partidas, 100))
  for (const partida of partidas.filter((item) => !podadas.has(item.id))) {
    assert.deepEqual(lidas.partidas.find((item) => item.id === partida.id), partida)
  }
})

await teste('segunda abertura lê do banco, sem migrar de novo', async () => {
  const { origem } = localStorageCheio()
  const nome = bancoNovo()
  const primeira = await abrirArmazenamentoDados(criarBancoDexie(nome), origem, { agora: AGORA })
  const jogadores = primeira.ler('riichi-manager-jogadores')
  // Algo novo aparece no localStorage: não deve ser lido de novo.
  origem.gravar('riichi-manager-jogadores', '{"versao":1,"jogadores":[]}')
  const segunda = await abrirArmazenamentoDados(criarBancoDexie(nome), origem)
  assert.equal(segunda.ler('riichi-manager-jogadores'), jogadores)
})

await teste('gravações chegam ao banco: incluir, alterar e apagar partida', async () => {
  const { origem } = localStorageCheio()
  const nome = bancoNovo()
  const dados = await abrirArmazenamentoDados(criarBancoDexie(nome), origem, { agora: AGORA })
  const { versao, partidas } = partidasDe(dados)
  const nova = { ...gerarPartidasDeTeste(new Date(2026, 10, 11), 1, 99)[0], id: 'nova' }
  const alterada = { ...partidas[0], registradaManual: !partidas[0].registradaManual }
  const proximas = [alterada, ...partidas.slice(2), nova]
  dados.gravar(CHAVE_PARTIDAS, JSON.stringify({ versao, partidas: proximas }))
  dados.gravar('riichi-manager-ranking-filtros', '{"periodo":"mes"}')
  await dados.aguardar()

  const reaberto = await abrirArmazenamentoDados(criarBancoDexie(nome), memoria())
  const lidas = partidasDe(reaberto).partidas
  assert.equal(lidas.length, proximas.length)
  assert.ok(!lidas.some((partida) => partida.id === partidas[1].id), 'apagada some')
  assert.deepEqual(lidas.find((partida) => partida.id === 'nova'), nova)
  assert.equal(lidas.find((partida) => partida.id === alterada.id)?.registradaManual, alterada.registradaManual)
  assert.equal(reaberto.ler('riichi-manager-ranking-filtros'), '{"periodo":"mes"}')
})

await teste('mudar o limite poda os detalhes sem tocar no resultado', async () => {
  const { origem, partidas } = localStorageCheio()
  const nome = bancoNovo()
  const banco = criarBancoDexie(nome)
  const dados = await abrirArmazenamentoDados(banco, origem, { agora: AGORA })
  dados.gravar(CHAVE_LIMITE_DETALHES, '10')
  await dados.aguardar()
  const abertas = partidas.filter((partida) => partida.status !== 'finalizada').length
  assert.equal((await banco.lerTudo()).detalhes.length, 10 + abertas)
  const reaberto = await abrirArmazenamentoDados(criarBancoDexie(nome), memoria())
  assert.deepEqual(
    computeRanking(partidasDe(reaberto).partidas, FILTROS_PADRAO, AGORA),
    computeRanking(partidas, FILTROS_PADRAO, AGORA),
  )
})

await teste('app abriu antes do banco: nada apagado e a migração fica para depois', async () => {
  const { origem } = localStorageCheio()
  const antes = { ...origem.dados }
  const nome = bancoNovo()
  await assert.rejects(abrirArmazenamentoDados(criarBancoDexie(nome), origem, { podeApagarOrigem: () => false }))
  assert.deepEqual(origem.dados, antes, 'localStorage intacto')
  // Na próxima abertura, migra de novo a partir do localStorage (que pode ter mudado).
  origem.gravar('riichi-manager-clube-lista', 'Mudou depois')
  const dados = await abrirArmazenamentoDados(criarBancoDexie(nome), origem)
  assert.equal(dados.ler('riichi-manager-clube-lista'), 'Mudou depois')
})

await teste('aparelho novo, sem nada salvo: sem chave de partidas', async () => {
  const dados = await abrirArmazenamentoDados(criarBancoDexie(bancoNovo()), memoria())
  assert.equal(dados.ler(CHAVE_PARTIDAS), null, 'o repositório faz a migração da mesa antiga, como antes')
  assert.equal(dados.ler('riichi-manager-jogadores'), null)
})

console.log(`Armazenamento ok: ${testes} testes.`)
