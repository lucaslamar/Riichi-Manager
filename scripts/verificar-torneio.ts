/**
 * Testes do modelo do torneio, do histórico e da migração dos torneios antigos.
 *
 * Uso: npm run test:torneio
 */
import assert from 'node:assert/strict'
import type { ArmazenamentoChaveValor } from '../src/compartilhado/persistencia/armazenamento'
import { formatoValido, lerCortes } from '../src/dominios/torneio/logica/configuracao'
import { analisarLista, entradasDoTorneio, idsDaLista, limparColagem } from '../src/dominios/torneio/logica/listaTorneio'
import { rodadaAleatoria } from '../src/dominios/torneio/logica/formatos/rodadaAleatoria'
import type { Jogador } from '../src/dominios/jogadores/logica/jogadores'
import { migrarTorneiosV1, migrarTorneioV5 } from '../src/dominios/torneio/logica/migrarTorneioAntigo'
import {
  nomeNoTorneio,
  configPadraoTorneio,
  criarRascunho,
  finalizarTorneio,
  podeEncerrar,
  formatoPadrao,
  historicoDeTorneios,
  torneioAtivo,
  totalDeRodadas,
} from '../src/dominios/torneio/logica/torneio'
import type { Torneio } from '../src/dominios/torneio/logica/tipos'
import { mudancaAoRegistrar, mudancasDoRanking, rankingDoTorneio } from '../src/dominios/torneio/logica/ranking'
import type { Partida } from '../src/dominios/centerpiece/logica/partida'
import { partidasDoTorneioMcr } from '../src/dominios/placar-mcr/logica/torneio'
import { carregarTorneios, renomearPadraoAntigo, salvarTorneios } from '../src/dominios/torneio/persistencia/repositorioTorneios'

let contador = 0
const gerarId = () => `id-${++contador}`
const agora = new Date('2026-11-08T14:00:00Z')

function memoria(inicial: Record<string, string> = {}): ArmazenamentoChaveValor & { dados: Record<string, string> } {
  const dados = { ...inicial }
  return { dados, ler: (chave) => dados[chave] ?? null, gravar: (chave, valor) => void (dados[chave] = valor) }
}

// Padrão: 30.000 sem oka.
const config = configPadraoTorneio()
assert.equal(config.pontosPartida, 30000)
assert.equal(config.pontosRetorno, 30000)

// Rascunho, ativo e histórico.
const rascunho = criarRascunho({ id: 'r', agora, nome: 'Encontro do clube 08/11' })
assert.equal(rascunho.status, 'rascunho')
assert.equal(rascunho.data, '2026-11-08')
// Padrão: Brasileirão (rodadas sorteadas na hora, sem total fixo) e 1h por rodada.
assert.equal(rascunho.formato.tipo, 'corridos')
assert.equal(rascunho.timers.rodadaSegundos, 60 * 60)
assert.equal(totalDeRodadas(formatoPadrao('rodizio')), 4)
assert.equal(totalDeRodadas({ tipo: 'corridos' }), null)

const finalizado = (id: string, data: string, nome: string, jogadorIds: string[], tipo: Torneio['formato']): Torneio => ({
  ...finalizarTorneio({ ...rascunho, id, data, nome, jogadorIds, formato: tipo }, agora.toISOString()),
})
const lista: Torneio[] = [
  rascunho,
  finalizado('a', '2026-10-01', 'Outubro', ['ana', 'bia'], { tipo: 'suico', rodadas: 3 }),
  finalizado('b', '2026-11-01', 'Novembro', ['caio'], { tipo: 'rodizio', rodadas: 4 }),
]
assert.equal(torneioAtivo(lista)?.id, 'r')
const nomes: Record<string, string> = { ana: 'Ána Paula', bia: 'Bia', caio: 'Caio' }
const historico = (filtro: Partial<Parameters<typeof historicoDeTorneios>[1]>) =>
  historicoDeTorneios(lista, { busca: '', formato: 'todos', de: '', ate: '', ...filtro }, (id) => nomes[id]).map(
    (torneio) => torneio.id,
  )
assert.deepEqual(historico({}), ['b', 'a'])
assert.deepEqual(historico({ busca: 'ana' }), ['a'], 'busca por jogador sem acento')
assert.deepEqual(historico({ formato: 'rodizio' }), ['b'])
assert.deepEqual(historico({ de: '2026-10-15' }), ['b'])
assert.deepEqual(historico({ ate: '2026-10-15' }), ['a'])

// Migração do Torneio original (riichi-manager-v5).
const nomesV5 = ['Ana', 'Bia', 'Caio', 'Duda']
const v5 = JSON.stringify({
  jogadores: nomesV5,
  grade: [
    {
      id: 1,
      mesas: [
        {
          id: 1,
          assentos: [
            { vento: 'Sul', jogador: 'Bia' },
            { vento: 'Leste', jogador: 'Ana' },
            { vento: 'Norte', jogador: 'Duda' },
            { vento: 'Oeste', jogador: 'Caio' },
          ],
        },
      ],
    },
    { id: 2, mesas: [{ id: 1, assentos: [] }] },
  ],
  mesasConcluidas: { '0_0': true },
  pontuacoesPorMesa: { '0_0': ['20.000', '45.000', '15000', '40000'] },
})
const idDoNome = (lista: string[]) => lista.map((nome) => `j-${nome}`)
const migrado = migrarTorneioV5(v5, { idDoNome, gerarId, agora })
assert.ok(migrado)
assert.equal(migrado.torneio.status, 'em_andamento', 'uma mesa ainda sem resultado')
assert.equal(migrado.torneio.formato.tipo, 'rodizio')
assert.deepEqual(migrado.torneio.rodadas[0].mesas[0].assentos, ['j-Ana', 'j-Bia', 'j-Caio', 'j-Duda'])
assert.equal(migrado.partidas.length, 1)
const partida = migrado.partidas[0]
assert.equal(partida.vinculoTorneio?.torneioId, migrado.torneio.id)
// Ordem salva: Bia 20k, Ana 45k, Duda 15k, Caio 40k → cadeiras 東南西北.
assert.deepEqual(partida.placar.pontos, { 0: 45000, 1: 20000, 2: 40000, 3: 15000 })
assert.equal(migrarTorneioV5(null, { idDoNome, gerarId, agora }), null)
assert.equal(migrarTorneioV5('{quebrado', { idDoNome, gerarId, agora }), null)

// Torneio da 5.x (riichi-manager-torneios versão 1).
const v1 = migrarTorneiosV1(
  [
    {
      id: 't1',
      criadoEm: '2026-10-20T10:00:00Z',
      status: 'encerrado',
      config,
      jogadorIds: ['a', 'b', 'c', 'd'],
      grade: [
        {
          id: 1,
          mesas: [
            {
              id: 1,
              assentos: [
                { vento: 'Norte', jogador: 'd' },
                { vento: 'Leste', jogador: 'a' },
                { vento: 'Sul', jogador: 'b' },
                { vento: 'Oeste', jogador: 'c' },
              ],
            },
          ],
        },
      ],
    },
  ],
  { gerarId, agora },
)
assert.equal(v1.length, 1)
assert.equal(v1[0].id, 't1', 'mantém o id: as partidas já apontam para ele')
assert.equal(v1[0].status, 'finalizado')
assert.equal(v1[0].data, '2026-10-20')
assert.deepEqual(v1[0].rodadas[0].mesas[0].assentos, ['a', 'b', 'c', 'd'])

// Repositório: migra uma vez, depois lê a versão nova.
const armazenamento = memoria({ 'riichi-manager-v5': v5 })
const primeira = carregarTorneios(armazenamento, { idDoNome, gerarId, agora })
assert.equal(primeira.torneios.length, 1)
assert.equal(primeira.partidasNovas.length, 1)
assert.ok(armazenamento.dados['riichi-manager-v5'], 'chave antiga fica de cópia')
const segunda = carregarTorneios(armazenamento, { idDoNome, gerarId, agora })
assert.equal(segunda.torneios[0].id, primeira.torneios[0].id)
assert.equal(segunda.partidasNovas.length, 0, 'não migra duas vezes')

salvarTorneios(armazenamento, { ...segunda, torneios: [...segunda.torneios, rascunho] })
assert.equal(carregarTorneios(armazenamento, { idDoNome, gerarId, agora }).torneios.length, 2)

// Lista: colar do WhatsApp.
assert.equal(
  limparColagem('Lista quinta\n1. Ana\n2) Bia\n- Caio\n• Duda\n10 - Edu, Fê\n3\n*  Gabi  Lima '),
  'Lista quinta\nAna\nBia\nCaio\nDuda\nEdu\nFê\nGabi Lima',
)

const cadastro = [
  { id: 'ana', nome: 'Ana Paula', apelido: 'Ana', criadoEm: '' },
  { id: 'bia', nome: 'Beatriz', criadoEm: '' },
] as Jogador[]
const status = (texto: string) => analisarLista(texto, cadastro).status
assert.deepEqual(status(''), { tipo: 'primeiraMesa', faltam: 4 })
assert.deepEqual(status('a\nb\nc'), { tipo: 'primeiraMesa', faltam: 1 })
assert.deepEqual(status('a\nb\nc\nd'), { tipo: 'proximaMesa', faltam: 4 }, 'mínimo de duas mesas')
assert.deepEqual(status('a\nb\nc\nd\ne\nf'), { tipo: 'proximaMesa', faltam: 2 })
const oito = analisarLista('a\nb\nc\nd\ne\nf\ng\nh', cadastro)
assert.equal(oito.podeSortear, true)
assert.equal(oito.mesas, 2)
const repetida = analisarLista('Ana\nb\nana paula\nc\n\nB', cadastro)
assert.deepEqual([...repetida.repetidas], [2, 5], 'mesmo cadastro e mesmo nome sem maiúscula')
assert.equal(repetida.podeSortear, false)
assert.deepEqual(repetida.status, { tipo: 'repetidos', quantidade: 2 })

const criados: string[][] = []
const ids = idsDaLista(['Novo 1', 'Ana', 'Novo 2', 'Beatriz'], cadastro, (nomes) => {
  criados.push(nomes)
  return nomes.map((nome) => `novo-${nome}`)
})
assert.deepEqual(ids, ['novo-Novo 1', 'ana', 'novo-Novo 2', 'bia'])
assert.deepEqual(criados, [['Novo 1', 'Novo 2']], 'só os nomes novos vão para o cadastro')

// Primeira rodada sorteada: todo mundo uma vez, mesas de 4.
const doze = Array.from({ length: 12 }, (_, indice) => `j${indice}`)
const sorteada = rodadaAleatoria(doze, 1, agora.toISOString())
assert.equal(sorteada.mesas.length, 3)
assert.deepEqual(sorteada.mesas.flatMap((mesa) => mesa.assentos).sort(), [...doze].sort())

// Configurações: cortes do Eliminatório.
assert.deepEqual(lerCortes('16, 8, 4'), [16, 8, 4])
assert.deepEqual(lerCortes('8 → 4'), [8, 4])
assert.equal(lerCortes('8, 6'), null, 'múltiplo de 4')
assert.equal(lerCortes('4, 8'), null, 'do maior para o menor')
assert.equal(lerCortes(''), null)
assert.equal(lerCortes('16, 4', 16), null, 'menor que a lista')
assert.deepEqual(lerCortes('8, 4', 16), [8, 4])
assert.equal(formatoValido({ tipo: 'eliminatorio', classificatoria: 'suico', rodadasClassificatoria: 3, cortes: [8, 4], rodadasPorFase: 1, pontosCarregados: true }, 12), true)
assert.equal(formatoValido({ tipo: 'eliminatorio', classificatoria: 'suico', rodadasClassificatoria: 3, cortes: [], rodadasPorFase: 1, pontosCarregados: true }), false)

// Sem cadastro automático: quem não está no cadastro entra como convidado, com o nome guardado.
{
  let n = 0
  const { ids: idsLista, convidados } = entradasDoTorneio(['Novo 1', 'Ana'], cadastro, () => `c${++n}`)
  assert.equal(idsLista[1], 'ana')
  assert.ok(idsLista[0].startsWith('convidado-'))
  assert.deepEqual(convidados, { [idsLista[0]]: 'Novo 1' })
  assert.equal(nomeNoTorneio({ convidados }, cadastro, idsLista[0]), 'Novo 1')
  assert.equal(nomeNoTorneio({}, cadastro, 'sumiu'), '?')
}

assert.equal(renomearPadraoAntigo('Encontro do clube 08/11'), 'Torneio 08/11')
assert.equal(renomearPadraoAntigo('Encontro do clube especial'), 'Encontro do clube especial')
assert.equal(renomearPadraoAntigo('Club meetup 11/8'), 'Tournament 11/8')

// Mudança de posição no ranking do torneio.
{
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  type Rodadas = Torneio['rodadas']
  const rodada = (numero: number, mesas: string[][], fase?: number): Rodadas[number] => ({
    numero,
    fase,
    geradaEm: '',
    mesas: mesas.map((assentos, indice) => ({ numero: indice + 1, assentos: assentos as [string, string, string, string] })),
  })
  const mesa = (numero: number, numeroMesa: number, pontos: Record<string, number>) =>
    ({
      id: `${numero}-${numeroMesa}`,
      status: 'finalizada',
      vinculoTorneio: { torneioId: 't-setas', rodada: numero - 1, mesa: numeroMesa - 1 },
      resultado: Object.entries(pontos).map(([jogadorId, final], indice) => ({ jogadorId, final, colocacao: indice + 1 })),
    }) as unknown as Partida
  const torneio = (rodadas: Rodadas, formato: Torneio['formato'] = { tipo: 'corridos' }): Torneio => ({
    ...criarRascunho({ id: 't-setas', agora, nome: 'Setas' }),
    formato,
    jogadorIds: ids,
    status: 'em_andamento',
    rodadas,
  })
  const de = (resposta: ReturnType<typeof mudancasDoRanking>, id: string) =>
    resposta?.jogadores.find((item) => item.jogadorId === id)

  const duas = torneio([rodada(1, [ids.slice(0, 4), ids.slice(4)]), rodada(2, [ids.slice(0, 4), ids.slice(4)])])
  const primeira = [mesa(1, 1, { a: 30, b: 20, c: 10, d: -60 }), mesa(1, 2, { e: 5, f: 0, g: 0, h: -5 })]
  const segunda = [mesa(2, 1, { c: 50, a: 0, b: 0, d: -50 }), mesa(2, 2, { e: 0, f: 0, g: 0, h: 0 })]
  const setas = mudancasDoRanking(duas, [...primeira, ...segunda])
  assert.equal(setas?.desde, 1)
  assert.deepEqual(de(setas, 'c'), { jogadorId: 'c', antes: 3, agora: 1, variacao: 2 })
  assert.equal(de(setas, 'a')?.variacao, -1)
  assert.equal(de(setas, 'e')?.variacao, 0)
  assert.equal(mudancasDoRanking(duas, primeira), null, 'rodada 1 não mostra')
  assert.equal(mudancasDoRanking(duas, [...primeira, segunda[0]]), null, 'rodada pela metade não mostra')

  // Entrou na rodada 2.
  const chegada = torneio([rodada(1, [ids.slice(0, 4)]), rodada(2, [ids.slice(4)])])
  assert.equal(de(mudancasDoRanking(chegada, [primeira[0], mesa(2, 1, { e: 40, f: 0, g: 0, h: -40 })]), 'e')?.antes, null)

  const empatado = torneio([rodada(1, [ids.slice(0, 4)])])
  const posicoes = rankingDoTorneio({ ...empatado, jogadorIds: ids.slice(0, 4) }, [mesa(1, 1, { a: 10, b: 0, c: 0, d: -10 })])
  assert.deepEqual(posicoes.map((linha) => linha.posicao), [1, 2, 2, 4])

  // Eliminatório: dentro da fase, sem seta para cortado nem depois de zerar os pontos.
  const corte = (pontosCarregados: boolean) =>
    torneio([rodada(1, [ids.slice(0, 4), ids.slice(4)], 0), rodada(2, [['a', 'b', 'c', 'e']], 1)], {
      tipo: 'eliminatorio',
      classificatoria: 'suico',
      rodadasClassificatoria: 1,
      cortes: [4],
      rodadasPorFase: 1,
      pontosCarregados,
    })
  const jogosDoCorte = [...primeira, mesa(2, 1, { c: 50, a: 0, b: 0, e: -50 })]
  const naFase = mudancasDoRanking(corte(true), jogosDoCorte)
  assert.deepEqual(naFase?.jogadores.map((item) => item.jogadorId).sort(), ['a', 'b', 'c', 'e'])
  assert.equal(de(naFase, 'c')?.variacao, 2)
  assert.equal(mudancasDoRanking(corte(false), jogosDoCorte), null, 'pontos zerados')
  assert.equal(mudancasDoRanking(corte(true), primeira), null, 'só rodada 1')

  // Confirmação: registrar e corrigir.
  const ids2 = (lista: ReturnType<typeof mudancaAoRegistrar>) => lista.find((item) => item.jogadorId === 'c')
  assert.deepEqual(ids2(mudancaAoRegistrar(duas, primeira, segunda[0])), {
    jogadorId: 'c',
    antes: { total: 10, posicao: 3 },
    depois: { total: 60, posicao: 1 },
  })
  assert.equal(ids2(mudancaAoRegistrar(duas, [], primeira[0]))?.antes, null, 'estreia')
  const correcao = { ...mesa(2, 1, { c: 0, a: 0, b: 0, d: 0 }), id: 'nova' }
  assert.equal(ids2(mudancaAoRegistrar(duas, [...primeira, ...segunda], correcao, '2-1'))?.depois.total, 10)

  // Os mesmos cálculos com placares MCR convertidos.
  const placar = (numero: number, jogadorIds: string[], vencedor: number) => ({
    id: `mcr-${numero}-${vencedor}`,
    criadoEm: agora.toISOString(),
    finalizadoEm: agora.toISOString(),
    jogadorIds,
    nomes: jogadorIds,
    maos: [{ tipo: 'vitoria', vencedor, forma: 'tsumo', fan: 8 }],
    falsosHu: [],
    torneio: { id: 't-setas', rodada: numero - 1, mesa: 0 },
  })
  const quatro = ids.slice(0, 4)
  const chines = { ...torneio([rodada(1, [quatro]), rodada(2, [quatro])]), jogadorIds: quatro, jogo: 'mcr' as const }
  const placares = [placar(1, quatro, 0), placar(2, quatro, 1)]
  const doMcr = partidasDoTorneioMcr(placares as unknown as Parameters<typeof partidasDoTorneioMcr>[0])
  const setasMcr = mudancasDoRanking(chines, doMcr)
  assert.ok((de(setasMcr, 'b')?.variacao ?? 0) > 0, 'MCR: vencedor da rodada 2 subiu')
}

assert.ok(podeEncerrar({ status: 'em_andamento' }))
assert.ok(!podeEncerrar({ status: 'rascunho' }))
assert.ok(!podeEncerrar({ status: 'finalizado' }))
assert.ok(!podeEncerrar({ status: 'em_andamento', transferidoEm: '2026-11-21' }))

console.log('Torneio: modelo, histórico, migração, lista e configurações ok.')
