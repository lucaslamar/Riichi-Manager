/**
 * Testes das estatísticas por escopo e da projeção pela média, com dados fictícios.
 *
 * Uso: npm run test:estatisticas
 */
import 'fake-indexeddb/auto'
import assert from 'node:assert/strict'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import { FILTROS_PADRAO } from '../src/dominios/centerpiece/logica/filtrosRanking'
import {
  criarPartida,
  declararRiichi,
  finalizarPartida,
  registrarRon,
  registrarRyukyoku,
  registrarTsumo,
  type Partida,
} from '../src/dominios/centerpiece/logica/partida'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import { forcaDaMao, resumoDasMaos } from '../src/dominios/centerpiece/logica/resumoPartida'
import {
  jogosAteOFim,
  visaoDaTemporada,
  visaoDoTorneio,
  visaoGeral,
} from '../src/dominios/estatisticas/logica/escopo'
import {
  estatisticasDoJogador,
  maiorMaoDoEscopo,
} from '../src/dominios/estatisticas/logica/estatisticas'
import { projetarUltrapassagem, proximoAcima } from '../src/dominios/estatisticas/logica/projecao'
import { criarTemporada, novoEncontro } from '../src/dominios/torneio/logica/temporada'
import { criarRascunho } from '../src/dominios/torneio/logica/torneio'
import { abrirArmazenamentoDados, CHAVE_LIMITE_DETALHES, CHAVE_PARTIDAS } from '../src/services/storage/armazenamentoDados'
import { criarBancoDexie } from '../src/services/storage/bancoDexie'

let testes = 0
async function teste(nome: string, corpo: () => void | Promise<void>) {
  try {
    await corpo()
    testes += 1
  } catch (erro) {
    console.error(`Falhou: ${nome}`)
    throw erro
  }
}

const IDS = ['a', 'b', 'c', 'd'] as const
const CONFIG = configDoPreset('wrc')
const contexto = (id: string) => ({ id, agora: '2026-11-10T20:00:00.000Z' })

/** 4 mãos: ron de a (Haneman), tsumo de b, ryukyoku e ron duplo em c. */
function comMaos(id = 'p1'): Partida {
  let partida = criarPartida(id, CONFIG, IDS, '2026-11-10T19:00:00.000Z', IDS)
  partida = declararRiichi(partida, 0, contexto('1'))
  partida = registrarRon(
    partida,
    { pagador: 2, vencedores: [{ cadeira: 0, pontos: 18000, han: 6, fu: 30 }] },
    contexto('2'),
  )
  partida = registrarTsumo(
    partida,
    { vencedor: 1, pagamentoDealer: 2000, pagamentoNaoDealer: 1000, han: 3, fu: 40 },
    contexto('3'),
  )
  partida = registrarRyukyoku(partida, { tenpai: [0] }, contexto('4'))
  partida = registrarRon(
    partida,
    { pagador: 2, vencedores: [{ cadeira: 0, pontos: 1000 }, { cadeira: 3, pontos: 2000 }] },
    contexto('5'),
  )
  return finalizarPartida(partida, '2026-11-10T20:30:00.000Z')
}

const manual = (id: string, quando: string, pontos = [20000, 40000, 35000, 25000]) =>
  criarPartidaManual(
    id,
    CONFIG,
    {
      jogadorIds: IDS,
      nomes: IDS,
      pontos: pontos as [number, number, number, number],
      pontosPartida: 30000,
      pontosRetorno: 30000,
      uma: CONFIG.uma,
    },
    quando,
  )

async function principal() {
  await teste('taxas sobre as mãos jogadas', () => {
    const partidas = [comMaos(), manual('p2', '2026-11-11T20:00:00.000Z')]
    const numeros = estatisticasDoJogador(partidas, 'a')
    assert.deepEqual(numeros.taxas, { vitoria: 2 / 4, dealIn: 0, riichi: 1 / 4 })
    assert.equal(numeros.partidas, 2)
    assert.equal(numeros.partidasComMaos, 1)
    assert.equal(estatisticasDoJogador(partidas, 'c').taxas?.dealIn, 2 / 4, 'ron duplo é um deal-in')
  })

  await teste('sem mão a mão não há taxa', () => {
    const numeros = estatisticasDoJogador([manual('p', '2026-11-11T20:00:00.000Z')], 'a')
    assert.equal(numeros.taxas, null)
    assert.equal(numeros.maior, null)
    assert.deepEqual(numeros.colocacoes, [0, 0, 0, 1])
    assert.equal(numeros.mediaPontos, -25)
    assert.equal(estatisticasDoJogador([], 'a').mediaPontos, null)
  })

  await teste('maior mão', () => {
    assert.equal(maiorMaoDoEscopo([comMaos()])?.jogadorId, 'a')
    assert.equal(maiorMaoDoEscopo([comMaos()], 'b')?.han, 3)
    const base = { cadeira: 0 } as const
    const forca = (han: number, fu = 30, yakuman = 0) => forcaDaMao({ ...base, han, fu, yakuman })
    assert.ok(forca(5) > forca(4))
    assert.ok(forca(3, 60) > forca(4, 25))
    assert.equal(forca(4, 40), forca(5), 'os dois são Mangan')
    assert.ok(forca(0, 0, 2) > forca(13), 'Yakuman duplo passa o contado')
  })

  await teste('as mãos sobrevivem à poda', async () => {
    const partida = comMaos()
    const banco = criarBancoDexie()
    const origem = { ler: () => null, gravar: () => undefined }
    const dados = await abrirArmazenamentoDados(banco, origem)
    dados.gravar(CHAVE_LIMITE_DETALHES, '0')
    dados.gravar(CHAVE_PARTIDAS, JSON.stringify({ versao: 1, partidas: [partida] }))
    await dados.aguardar()
    const reaberto = await abrirArmazenamentoDados(banco, origem)
    const [podada] = JSON.parse(reaberto.ler(CHAVE_PARTIDAS) ?? '{}').partidas as Partida[]
    assert.equal(podada.eventos.length, 0)
    // O banco guarda JSON: os campos vazios somem.
    assert.deepEqual(resumoDasMaos(podada), JSON.parse(JSON.stringify(resumoDasMaos(partida))))
  })

  await teste('escopo do torneio', () => {
    const torneio = {
      ...criarRascunho({ id: 't', agora: new Date(2026, 10, 10), nome: 'T' }),
      jogadorIds: [...IDS],
      status: 'em_andamento' as const,
    }
    const vinculada = { ...comMaos(), vinculoTorneio: { torneioId: 't', rodada: 0, mesa: 0 } }
    const faltou = { ...vinculada, id: 'wo', wo: { ausentes: [3 as const] } }
    const visao = visaoDoTorneio(torneio, [vinculada, faltou, comMaos('fora')])
    assert.deepEqual(visao.partidas.map((partida) => partida.id), ['p1'])
    assert.equal(visao.linhas[0].partidas, 2, 'o WO continua no ranking')
    assert.ok(visao.viradas.tipo === 'cenarios' && visao.viradas.bonus)
  })

  await teste('temporada: cenários só na soma', () => {
    const agora = new Date(2026, 10, 22)
    const temporada = criarTemporada({ id: 's', nome: 'S', inicio: '2026-10-01', fim: '2026-12-31', agora: '' })
    const encontro = novoEncontro(temporada, { id: 'e', agora, nome: 'E' })
    const partida = { ...comMaos(), vinculoTorneio: { torneioId: 'e', rodada: 0, mesa: 0 } }
    const soma = visaoDaTemporada(temporada, [encontro], [partida], agora).viradas
    assert.ok(soma.tipo === 'cenarios' && soma.bonus && soma.ate === '2026-12-31')
    const porMedia = { ...temporada, criterio: { tipo: 'media', minimoPartidas: 1 } as const }
    const media = visaoDaTemporada(porMedia, [encontro], [partida], agora).viradas
    assert.ok(media.tipo === 'cenarios' && media.bonus === null)
  })

  await teste('geral: sem fim projeta, com fim tem cenários', () => {
    const opcoes = { modo: 'riichi', agora: new Date(2026, 10, 22), existe: () => true } as const
    const partidas = [comMaos()]
    assert.equal(visaoGeral(partidas, FILTROS_PADRAO, opcoes).viradas.tipo, 'projecao')
    const comFim = { ...FILTROS_PADRAO, periodo: 'personalizado', fim: '2026-12-31' } as const
    assert.equal(visaoGeral(partidas, comFim, opcoes).viradas.tipo, 'cenarios')
    const mcr = { ...opcoes, modo: 'mcr' } as const
    assert.equal(visaoGeral(partidas, comFim, mcr).viradas.tipo, 'projecao')
  })

  await teste('jogos até a data', () => {
    const periodo = { inicio: '2026-11-01', fim: '2026-11-20' }
    const dia10 = new Date(2026, 10, 10, 12)
    assert.equal(jogosAteOFim(periodo, 10, dia10), 11)
    assert.equal(jogosAteOFim(periodo, 2, dia10), null)
    assert.equal(jogosAteOFim(periodo, 10, new Date(2026, 10, 3)), null)
    assert.equal(jogosAteOFim(periodo, 10, new Date(2026, 10, 21)), 0)
  })

  await teste('projeção pela média', () => {
    const linha = (jogadorId: string, pontos: number, partidas: number) => ({ jogadorId, pontos, partidas })
    // +3,2 e +1,1 por jogo, 14,4 atrás: passa em 7.
    const exemplo = projetarUltrapassagem(linha('eu', 32, 10), linha('mari', 46.4, 42.18181818181818))
    assert.equal(exemplo.diferenca, 14.4)
    assert.equal(exemplo.resultado === 'passa' && exemplo.jogos, 7)
    const exata = projetarUltrapassagem(linha('eu', 30, 10), linha('ele', 40, 20))
    assert.equal(exata.resultado === 'passa' && exata.jogos, 11, 'no 10º só empata')
    const resultado = (eu: [number, number], ele: [number, number]) =>
      projetarUltrapassagem(linha('eu', ...eu), linha('ele', ...ele)).resultado
    assert.equal(resultado([10, 2], [20, 9]), 'poucosJogos')
    assert.equal(resultado([10, 9], [20, 2]), 'poucosJogos')
    assert.equal(resultado([10, 10], [20, 10]), 'mediaMenor')
    assert.equal(resultado([10, 10], [20, 20]), 'mediaMenor', 'média igual')
    assert.equal(resultado([10, 10], [110, 111]), 'longeDemais')
  })

  await teste('o próximo é o mais perto acima', () => {
    const linhas = [30, 20, 10, 10].map((pontos, indice) => ({ jogadorId: `p${indice}`, pontos, partidas: 3 }))
    assert.equal(proximoAcima(linhas, 'p3')?.jogadorId, 'p1')
    assert.equal(proximoAcima(linhas, 'p0'), null)
  })

  console.log(`Estatísticas: ${testes} testes passaram.`)
}

principal().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
