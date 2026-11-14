/**
 * Testes da busca e dos filtros de Em andamento: busca sem acento, período e ordem.
 *
 * Uso: npm run test:filtros-lista
 */
import assert from 'node:assert/strict'
import {
  casaBusca,
  filtrarLista,
  filtrosListaAtivos,
  FILTROS_LISTA_PADRAO,
  noPeriodo,
} from '../src/dominios/centerpiece/logica/filtrosAndamento'

const agora = new Date('2026-11-14T15:00:00')

assert.ok(casaBusca('joao', ['Torneio', 'João Silva']))
assert.ok(casaBusca('liga quinta', ['Liga de Quinta']))
assert.ok(!casaBusca('liga sexta', ['Liga de Quinta']))
assert.ok(casaBusca('', ['qualquer']))

assert.ok(noPeriodo('2026-11-14T08:00:00', 'hoje', agora))
assert.ok(!noPeriodo('2026-11-13T08:00:00', 'hoje', agora))
assert.ok(noPeriodo('2026-11-09T08:00:00', 'semana', agora))
assert.ok(!noPeriodo('2026-11-01T08:00:00', 'semana', agora))
assert.ok(noPeriodo('2026-11-01T08:00:00', 'mes', agora))
assert.ok(!noPeriodo('2026-10-31T08:00:00', 'mes', agora))
assert.ok(noPeriodo('2020-01-01T08:00:00', 'tudo', agora))

const itens = [
  { data: '2026-11-10T10:00:00', nome: 'Torneio 10/11', textos: ['Torneio 10/11', 'Carol'] },
  { data: '2026-11-12T10:00:00', nome: 'Torneio 12/11', textos: ['Torneio 12/11', 'Gabi'] },
  { data: '2026-11-14T10:00:00', nome: 'Encontro do clube', textos: ['Encontro do clube', 'Carol'] },
]
const nomes = (lista: { nome: string }[]) => lista.map((item) => item.nome)
assert.deepEqual(nomes(filtrarLista(itens, '', FILTROS_LISTA_PADRAO, agora, 'pt-BR')), [
  'Encontro do clube',
  'Torneio 12/11',
  'Torneio 10/11',
])
assert.deepEqual(nomes(filtrarLista(itens, 'carol', { periodo: 'tudo', ordem: 'antigos' }, agora, 'pt-BR')), [
  'Torneio 10/11',
  'Encontro do clube',
])
assert.deepEqual(nomes(filtrarLista(itens, '', { periodo: 'hoje', ordem: 'nome' }, agora, 'pt-BR')), [
  'Encontro do clube',
])
assert.equal(filtrosListaAtivos(FILTROS_LISTA_PADRAO), 0)
assert.equal(filtrosListaAtivos({ periodo: 'mes', ordem: 'nome' }), 2)

console.log('Filtros de lista ok.')
