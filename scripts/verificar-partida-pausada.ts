/**
 * Testes da partida salva para continuar.
 *
 * Uso: npm run test:partida-pausada
 */
import 'fake-indexeddb/auto'
import assert from 'node:assert/strict'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import { criarPartidaManual } from '../src/dominios/centerpiece/logica/partidaManual'
import {
  criarPartidaPausada,
  dealerDaRodada,
  lerPartidaPausada,
} from '../src/dominios/centerpiece/logica/partidaPausada'
import { fechamentoDoRegistro } from '../src/dominios/centerpiece/logica/saidaDaPartida'
import {
  carregarPartidasPausadas,
  salvarPartidasPausadas,
} from '../src/dominios/centerpiece/persistencia/repositorioPartidasPausadas'
import {
  mesclarBackup,
  montarBackup,
  unificarJogadores,
  validarBackup,
  type DadosBackup,
} from '../src/services/backup/backup'
import { abrirArmazenamentoDados } from '../src/services/storage/armazenamentoDados'
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

const CONFIG = { ...configDoPreset('wrc'), saida: { ficaEmUltimo: false, penalidade: 5 } }
const SALVA = criarPartidaPausada({
  id: 'salva',
  salvaEm: '2026-11-22T18:40:00.000Z',
  rodada: { vento: 'sul', numero: 3 },
  honba: 2,
  cadeiraDealer: 2,
  palitos: 2,
  ordemDosVentos: true,
  conjunto: 'wrc',
  config: CONFIG,
  encontro: { id: 'encontro', mesa: 4 },
  assentos: [
    { jogadorId: 'a', nome: 'A', pontos: 41000, saiu: false },
    { jogadorId: 'b', nome: 'B', pontos: -1000, saiu: true },
    { jogadorId: 'convidado', nome: 'Visitante', pontos: null, saiu: false },
    { jogadorId: null, nome: '', pontos: 30000, saiu: false },
  ],
})

async function principal() {
  await teste('serializável, volta exatamente igual', () => {
    assert.deepEqual(lerPartidaPausada(JSON.parse(JSON.stringify(SALVA))), SALVA)
    assert.deepEqual(SALVA.assentos.map((item) => item.vento), ['leste', 'sul', 'oeste', 'norte'])
  })

  await teste('o dealer sai da rodada', () => {
    assert.deepEqual(([1, 2, 3, 4] as const).map(dealerDaRodada), [0, 1, 2, 3])
  })

  await teste('salva inválida não derruba a lista', () => {
    for (const ruim of [null, {}, { ...SALVA, honba: -1 }, { ...SALVA, assentos: [] }]) {
      assert.equal(lerPartidaPausada(ruim), null)
    }
    const armazenamento = {
      ler: () => JSON.stringify({ partidas: [{ id: 'x' }, SALVA] }),
      gravar: () => undefined,
    }
    assert.deepEqual(carregarPartidasPausadas(armazenamento), [SALVA])
  })

  await teste('sobrevive a fechar o app', async () => {
    const banco = criarBancoDexie()
    const origem = { ler: () => null, gravar: () => undefined }
    const aberto = await abrirArmazenamentoDados(banco, origem)
    salvarPartidasPausadas(aberto, [SALVA])
    await aberto.aguardar()
    assert.deepEqual(carregarPartidasPausadas(await abrirArmazenamentoDados(banco, origem)), [SALVA])
  })

  await teste('os sticks salvos fecham a soma e vão para o 1º', () => {
    const mesa = { palitosRestantes: 'primeiro', comSaida: false, palitosNaMesa: 2 } as const
    assert.equal(fechamentoDoRegistro(98000, 100000, mesa).depositosNaMesa, 2)
    assert.equal(fechamentoDoRegistro(100000, 100000, mesa).depositosNaMesa, 0, 'já recolhidos')
    assert.equal(fechamentoDoRegistro(97000, 100000, mesa).fecha, false)
    const config = configDoPreset('padrao')
    const partida = criarPartidaManual(
      'p',
      config,
      {
        jogadorIds: ['a', 'b', 'c', 'd'],
        nomes: [],
        pontos: [40000, 25000, 18000, 15000],
        pontosPartida: 25000,
        pontosRetorno: 25000,
        uma: config.uma,
        palitos: 2,
      },
      SALVA.salvaEm,
    )
    assert.equal(partida.resultado?.[0].pontosBrutos, 42000)
  })

  await teste('entra no backup', () => {
    const dados: DadosBackup = {
      jogadores: [],
      partidas: [],
      torneios: [],
      temporadas: [],
      listasTorneio: [],
      clube: { lista: '', sorteio: null, encontros: [] },
      configMesa: null,
      regrasRegistro: null,
      placaresMcr: [],
    }
    const com = { ...dados, partidasPausadas: [SALVA] }
    const lido = validarBackup(JSON.stringify(montarBackup(com, '7', new Date())))
    assert.ok(lido.ok)
    assert.deepEqual(lido.backup.dados.partidasPausadas, [SALVA])
    assert.ok(validarBackup(montarBackup(dados, '7', new Date())).ok, 'backup antigo')
    assert.equal(mesclarBackup(com, com).partidasPausadas?.length, 1)
    const unificado = unificarJogadores(com, { a: 'local' }).partidasPausadas!
    assert.equal(unificado[0].assentos[0].jogadorId, 'local')
  })

  console.log(`Partida pausada: ${testes} testes passaram.`)
}

principal().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
