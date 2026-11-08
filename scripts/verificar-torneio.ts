/**
 * Testes do modelo do torneio, do histórico e da migração dos torneios antigos.
 *
 * Uso: npm run test:torneio
 */
import assert from 'node:assert/strict'
import type { ArmazenamentoChaveValor } from '../src/compartilhado/persistencia/armazenamento'
import { migrarTorneiosV1, migrarTorneioV5 } from '../src/dominios/torneio/logica/migrarTorneioAntigo'
import {
  configPadraoTorneio,
  criarRascunho,
  finalizarTorneio,
  historicoDeTorneios,
  torneioAtivo,
  totalDeRodadas,
} from '../src/dominios/torneio/logica/torneio'
import type { Torneio } from '../src/dominios/torneio/logica/tipos'
import { carregarTorneios, salvarTorneios } from '../src/dominios/torneio/persistencia/repositorioTorneios'

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
assert.equal(totalDeRodadas(rascunho.formato), 4)
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

console.log('Torneio: modelo, histórico e migração ok.')
