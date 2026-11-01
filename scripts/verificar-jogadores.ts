/**
 * Testes do cadastro de jogadores: regras puras e leitura/gravação pela interface
 * de armazenamento.
 *
 * Uso: npm run test:jogadores
 */
import assert from 'node:assert/strict'
import type { ArmazenamentoChaveValor } from '../src/compartilhado/persistencia/armazenamento'
import {
  adicionarJogador,
  buscarJogadores,
  definirArquivado,
  editarJogador,
  nomeExibido,
  ordenarJogadores,
  partesDoNome,
  type Jogador,
} from '../src/dominios/jogadores/logica/jogadores'
import {
  carregarJogadores,
  salvarJogadores,
} from '../src/dominios/jogadores/persistencia/repositorioJogadores'

const DATA = '2026-11-01T12:00:00.000Z'
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

function criar(nomes: string[]): Jogador[] {
  return nomes.reduce<Jogador[]>((lista, nome, indice) => {
    const resultado = adicionarJogador(lista, { nome }, String(indice), DATA)
    assert.ok(resultado.ok)
    return resultado.jogadores
  }, [])
}

teste('adicionar limpa espaços e guarda id, data e arquivado', () => {
  const resultado = adicionarJogador([], { nome: '  Ana   Maria ', apelido: ' ' }, 'x', DATA)
  assert.ok(resultado.ok)
  assert.deepEqual(resultado.jogador, {
    id: 'x',
    nome: 'Ana Maria',
    criadoEm: DATA,
    arquivado: false,
  })
})

teste('nome vazio é recusado', () => {
  assert.deepEqual(adicionarJogador([], { nome: '   ' }, 'x', DATA), {
    ok: false,
    erro: 'nomeVazio',
  })
})

teste('nome repetido é recusado, sem olhar maiúsculas, acentos ou arquivado', () => {
  const lista = definirArquivado(criar(['José Silva']), '0', true)
  assert.deepEqual(adicionarJogador(lista, { nome: 'jose  SILVA' }, 'x', DATA), {
    ok: false,
    erro: 'nomeDuplicado',
  })
})

teste('renomear mantém o id e aceita o próprio nome', () => {
  const lista = criar(['Ana', 'Bia'])
  const resultado = editarJogador(lista, '0', { nome: 'Ana Paula', apelido: 'Aninha' })
  assert.ok(resultado.ok)
  assert.equal(resultado.jogador.id, '0')
  assert.equal(nomeExibido(resultado.jogador), 'Aninha')
  assert.ok(editarJogador(lista, '0', { nome: 'ANA' }).ok)
})

teste('renomear para o nome de outro é recusado', () => {
  assert.deepEqual(editarJogador(criar(['Ana', 'Bia']), '0', { nome: 'bia' }), {
    ok: false,
    erro: 'nomeDuplicado',
  })
})

teste('apagar o apelido remove o campo', () => {
  const comApelido = adicionarJogador([], { nome: 'Ana', apelido: 'Aninha' }, '0', DATA)
  assert.ok(comApelido.ok)
  const resultado = editarJogador(comApelido.jogadores, '0', { nome: 'Ana', apelido: '' })
  assert.ok(resultado.ok)
  assert.equal('apelido' in resultado.jogador, false)
  assert.equal(nomeExibido(resultado.jogador), 'Ana')
})

teste('arquivar e restaurar não removem o jogador', () => {
  const arquivados = definirArquivado(criar(['Ana']), '0', true)
  assert.equal(arquivados.length, 1)
  assert.equal(arquivados[0].arquivado, true)
  assert.equal(definirArquivado(arquivados, '0', false)[0].arquivado, false)
})

teste('busca por nome ou apelido, sem acento', () => {
  const comApelido = adicionarJogador(criar(['José', 'Bia']), { nome: 'Caio', apelido: 'Câmbio' }, '9', DATA)
  assert.ok(comApelido.ok)
  assert.deepEqual(buscarJogadores(comApelido.jogadores, 'jos').map((j) => j.nome), ['José'])
  assert.deepEqual(buscarJogadores(comApelido.jogadores, 'cambio').map((j) => j.nome), ['Caio'])
  assert.equal(buscarJogadores(comApelido.jogadores, '  ').length, 3)
})

teste('ordena pelo alfabeto do idioma', () => {
  const nomes = ordenarJogadores(criar(['Zeca', 'Ágata', 'Bia']), 'pt-BR').map((j) => j.nome)
  assert.deepEqual(nomes, ['Ágata', 'Bia', 'Zeca'])
})

teste('nome com parênteses vira duas linhas; sem parênteses, a de baixo é o apelido', () => {
  assert.deepEqual(partesDoNome({ nome: 'Shigeru Akagi (Akagi)', apelido: 'X' }), {
    principal: 'Shigeru Akagi',
    apoio: 'Akagi',
  })
  assert.deepEqual(partesDoNome({ nome: 'Ana', apelido: 'Aninha' }), {
    principal: 'Ana',
    apoio: 'Aninha',
  })
  assert.deepEqual(partesDoNome({ nome: 'Ana' }), { principal: 'Ana', apoio: undefined })
})

function memoria(inicial?: string): ArmazenamentoChaveValor & { valor: string | null } {
  return {
    valor: inicial ?? null,
    ler() {
      return this.valor
    },
    gravar(_chave, valor) {
      this.valor = valor
    },
  }
}

teste('salva com versão e carrega de volta', () => {
  const armazenamento = memoria()
  const lista = criar(['Ana', 'Bia'])
  salvarJogadores(armazenamento, lista)
  assert.equal(JSON.parse(armazenamento.valor ?? '').versao, 1)
  assert.deepEqual(carregarJogadores(armazenamento), lista)
})

teste('primeiro uso traz os jogadores padrão, com apelido curto para a mesa', () => {
  const nomes = carregarJogadores(memoria()).map((jogador) => nomeExibido(jogador))
  assert.deepEqual(nomes, ['Akagi', 'Saki', 'Tetsuya', 'Koizumi'])
})

teste('os padrão não voltam depois que o cadastro foi salvo', () => {
  const armazenamento = memoria()
  const arquivados = carregarJogadores(armazenamento).map((jogador) => ({
    ...jogador,
    arquivado: true,
  }))
  salvarJogadores(armazenamento, arquivados)
  assert.ok(carregarJogadores(armazenamento).every((jogador) => jogador.arquivado))
  salvarJogadores(armazenamento, [])
  assert.deepEqual(carregarJogadores(armazenamento), [])
})

teste('dados corrompidos abrem com a lista vazia', () => {
  assert.deepEqual(carregarJogadores(memoria('{quebrado')), [])
  assert.deepEqual(carregarJogadores(memoria('{"jogadores":[{"id":1}]}')), [])
})

console.log(`Jogadores ok: ${testes} testes.`)
