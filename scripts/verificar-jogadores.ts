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
  clubesUsados,
  definirArquivado,
  definirFavorito,
  editarJogador,
  jogadoresRecentes,
  linhaDeApoio,
  nomeExibido,
  ordenarJogadores,
  partesDoNome,
  removerJogador,
  sugerirClubes,
  tirarPreCadastrados,
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

teste('primeiro uso traz o Clube do Tarot, marcado como pré-cadastrado', () => {
  const padrao = carregarJogadores(memoria())
  assert.equal(padrao.length, 10)
  assert.equal(nomeExibido(padrao[0]), 'The Fool')
  assert.equal(padrao[0].nome, 'Klein Moretti')
  assert.ok(padrao.every((jogador) => jogador.isSeed))
})

teste('o primeiro jogador real tira os pré-cadastrados, menos quem já jogou', () => {
  const padrao = carregarJogadores(memoria())
  const resultado = adicionarJogador(padrao, { nome: 'Ana' }, 'ana', 'agora')
  assert.ok(resultado.ok)
  if (!resultado.ok) return
  const depois = tirarPreCadastrados(resultado.jogadores, new Set(['seed-klein']))
  assert.deepEqual(depois.map((jogador) => jogador.id), ['seed-klein', 'ana'])
  assert.equal(depois[0].isSeed, undefined)
  // Sem pré-cadastrados, nada muda.
  assert.equal(tirarPreCadastrados(depois, new Set()), depois)
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

teste('clube: grafia existente, sugestões, busca e limpar', () => {
  const um = adicionarJogador([], { nome: 'Ana', clube: 'Cerrado' }, 'a', 'x')
  assert.ok(um.ok)
  const dois = adicionarJogador(um.ok ? um.jogadores : [], { nome: 'Bia', clube: 'cérrado' }, 'b', 'x')
  assert.ok(dois.ok)
  if (!dois.ok) return
  assert.equal(dois.jogador.clube, 'Cerrado')
  assert.deepEqual(clubesUsados(dois.jogadores), ['Cerrado'])
  assert.deepEqual(sugerirClubes(dois.jogadores, 'cerr'), ['Cerrado'])
  assert.deepEqual(sugerirClubes(dois.jogadores, 'Cerrado'), [])
  assert.equal(buscarJogadores(dois.jogadores, 'cerrado').length, 2)
  assert.equal(linhaDeApoio({ nome: 'Ana', apelido: 'A', clube: 'Cerrado' }), 'A · Cerrado')
  const limpo = editarJogador(dois.jogadores, 'a', { nome: 'Ana', clube: '' })
  assert.ok(limpo.ok && limpo.jogador.clube === undefined)
})

teste('excluir tira só o jogador', () => {
  const lista = adicionarJogador([], { nome: 'Ana' }, 'a', 'x')
  assert.ok(lista.ok)
  if (lista.ok) assert.deepEqual(removerJogador(lista.jogadores, 'a'), [])
})

teste('favorito: liga, desliga e sobrevive a renomear', () => {
  const lista = criar(['Ana', 'Bia'])
  const comEstrela = definirFavorito(lista, lista[0].id, true)
  assert.equal(comEstrela[0].favorito, true)
  assert.equal(comEstrela[1].favorito, undefined)
  const renomeado = editarJogador(comEstrela, lista[0].id, { nome: 'Ana Maria' })
  assert.ok(renomeado.ok && renomeado.jogador.favorito, 'editar não tira a estrela')
  assert.ok(!('favorito' in definirFavorito(comEstrela, lista[0].id, false)[0]), 'desligar remove o campo')
})

teste('últimos jogados: das partidas mais recentes, sem repetir', () => {
  const mesa = (ids: string[], criadaEm: string, finalizadaEm?: string) => ({
    assentos: { 0: { jogadorId: ids[0] }, 1: { jogadorId: ids[1] }, 2: { jogadorId: ids[2] }, 3: { jogadorId: ids[3] } },
    criadaEm,
    ...(finalizadaEm ? { finalizadaEm } : {}),
  })
  const partidas = [
    mesa(['a', 'b', 'c', 'd'], '2026-11-01'),
    mesa(['e', 'a', 'f', 'convidado-1'], '2026-11-02', '2026-11-03'),
    mesa(['g', 'h', 'i', 'j'], '2026-10-01'),
  ]
  const existe = (id: string) => !id.startsWith('convidado-')
  assert.deepEqual(jogadoresRecentes(partidas, existe), ['e', 'a', 'f', 'b', 'c'])
  assert.deepEqual(jogadoresRecentes(partidas, existe, 2), ['e', 'a'])
  assert.deepEqual(jogadoresRecentes([], existe), [])
})

console.log(`Jogadores ok: ${testes} testes.`)
