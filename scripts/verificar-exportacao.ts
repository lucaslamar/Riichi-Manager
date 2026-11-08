/**
 * Testes de exportar e importar torneio: ida e volta, código/QR, arquivo corrompido,
 * versão nova, casamento de jogadores e conflito de torneio.
 *
 * Uso: npm run test:exportacao
 */
import assert from 'node:assert/strict'
import { criarPartida, type Partida } from '../src/dominios/centerpiece/logica/partida'
import type { Jogador } from '../src/dominios/jogadores/logica/jogadores'
import {
  codigoParaPacote,
  exportarTorneio,
  importarTorneio,
  juntarPedaco,
  leituraCompleta,
  pacoteParaCodigo,
  pedacosDoCodigo,
  planejarImportacao,
  validarPacote,
  type LeituraQr,
} from '../src/dominios/torneio/logica/exportacao'
import { rodadasIniciais } from '../src/dominios/torneio/logica/formatos'
import { criarRascunho, iniciarTorneio } from '../src/dominios/torneio/logica/torneio'

const agora = '2026-11-08T14:00:00.000Z'
let contador = 0
const gerarId = () => `novo-${++contador}`

const nomes = ['Ana', 'Bia', 'Caio', 'Duda', 'Edu', 'Fê', 'Gabi', 'Hugo']
const jogadores: Jogador[] = nomes.map((nome, indice) => ({
  id: `j${indice}`,
  nome,
  criadoEm: agora,
  arquivado: false,
}))
const ids = jogadores.map((jogador) => jogador.id)
const rascunho = criarRascunho({ id: 't1', agora: new Date(agora), nome: 'Encontro' })
const torneio = {
  ...iniciarTorneio(rascunho, ids, rodadasIniciais(rascunho, ids, agora), agora),
  transferidoEm: agora,
}
const mesa = torneio.rodadas[0].mesas[0]
const partida: Partida = {
  ...criarPartida('p1', torneio.config, mesa.assentos, agora),
  vinculoTorneio: { torneioId: 't1', rodada: 0, mesa: 0, guardada: true },
  status: 'finalizada',
  resultado: mesa.assentos.map((jogadorId, cadeira) => ({
    cadeira: cadeira as 0,
    jogadorId,
    colocacao: cadeira + 1,
    pontosBrutos: 25000,
    uma: 0,
    oka: 0,
    multa: 0,
    final: 0,
  })),
}
const outra = criarPartida('p-solta', torneio.config, mesa.assentos, agora)
const dados = { partidas: [partida, outra], jogadores, temporadas: [] }

// Exportar: só as partidas do torneio, sem a marca de transferido.
const pacote = exportarTorneio(torneio, dados, { modo: 'transferencia', agora })
assert.equal(pacote.partidas.length, 1)
assert.equal(pacote.jogadores.length, 8)
assert.equal(pacote.torneio.transferidoEm, undefined)

// Ida e volta pelo arquivo e pelo código.
const doArquivo = validarPacote(JSON.stringify(pacote))
assert.ok(doArquivo.ok)
assert.deepEqual(doArquivo.pacote, pacote)
const codigo = pacoteParaCodigo(pacote)
const doCodigo = codigoParaPacote(codigo)
assert.ok(doCodigo.ok)
assert.deepEqual(doCodigo.pacote, pacote)

// QR em sequência, lido fora de ordem e com repetição.
const pedacos = pedacosDoCodigo(codigo, 200)
assert.ok(pedacos.length > 1)
let leitura: LeituraQr | null = null
for (const indice of [...pedacos.keys()].reverse().concat([0]))
  leitura = juntarPedaco(leitura, pedacos[indice])
assert.ok(leitura)
assert.equal(leituraCompleta(leitura), codigo)
assert.equal(leituraCompleta(juntarPedaco(null, pedacos[0])!), pedacos.length === 1 ? codigo : null)
assert.equal(juntarPedaco(null, 'https://exemplo.com'), null)

// Rejeita lixo, arquivo mexido e versão nova.
assert.deepEqual(validarPacote('não é json'), { ok: false, erro: 'invalido' })
assert.deepEqual(validarPacote({ app: 'outro' }), { ok: false, erro: 'invalido' })
const mexido = JSON.parse(JSON.stringify(pacote))
mexido.torneio.nome = 'Outro nome'
assert.deepEqual(validarPacote(mexido), { ok: false, erro: 'corrompido' })
assert.deepEqual(validarPacote({ ...pacote, versao: 99 }), { ok: false, erro: 'versaoNova' })
assert.deepEqual(codigoParaPacote('xyz'), { ok: false, erro: 'invalido' })

// Aparelho vazio: cria todos os jogadores com os mesmos ids, torneio igual.
const vazio = planejarImportacao(pacote, { torneios: [], jogadores: [] })
assert.equal(vazio.conflito, false)
assert.deepEqual(vazio.resumo, {
  nome: 'Encontro',
  formato: 'rodizio',
  rodadas: torneio.rodadas.length,
  jogadores: 8,
  partidas: 1,
})
const limpo = importarTorneio(pacote, vazio, { sufixoImportado: '(importado)' }, { gerarId, agora })
assert.equal(limpo.jogadoresNovos.length, 8)
assert.deepEqual(limpo.torneio.jogadorIds, ids)
assert.deepEqual(limpo.torneio.rodadas, pacote.torneio.rodadas)
assert.deepEqual(limpo.partidas, pacote.partidas)
assert.equal(limpo.substituirId, undefined)

// Casamento: por id, por nome (confirmado ou recusado) e novo.
const locais: Jogador[] = [
  { id: 'j0', nome: 'Ana', criadoEm: agora, arquivado: false },
  { id: 'x1', nome: 'bia ', criadoEm: agora, arquivado: false },
  { id: 'x2', nome: 'Caio', criadoEm: agora, arquivado: false },
]
const plano = planejarImportacao(pacote, { torneios: [torneio], jogadores: locais })
assert.deepEqual(plano.jogadores.j0, { tipo: 'id', localId: 'j0' })
assert.deepEqual(plano.jogadores.j1, { tipo: 'nome', localId: 'x1' })
assert.deepEqual(plano.jogadores.j3, { tipo: 'novo' })
assert.equal(plano.conflito, true)
const casado = importarTorneio(
  pacote,
  plano,
  { mesmoNome: { j2: false }, conflito: 'substituir', sufixoImportado: '(importado)' },
  { gerarId, agora },
)
assert.equal(casado.substituirId, 't1')
assert.equal(casado.torneio.id, 't1')
assert.ok(casado.torneio.jogadorIds.includes('x1'))
assert.ok(!casado.torneio.jogadorIds.includes('j1'))
const caioNovo = casado.jogadoresNovos.find((jogador) => jogador.nome === 'Caio')
assert.ok(caioNovo && caioNovo.id !== 'x2' && caioNovo.id !== 'j2')
assert.equal(casado.jogadoresNovos.length, 6)
const idsNasPartidas = casado.partidas.flatMap((item) =>
  ([0, 1, 2, 3] as const).map((cadeira) => item.assentos[cadeira].jogadorId),
)
assert.ok(idsNasPartidas.every((id) => casado.torneio.jogadorIds.includes(id)))
assert.ok(
  casado.partidas[0].resultado!.every((linha) =>
    casado.torneio.jogadorIds.includes(linha.jogadorId),
  ),
)

// Manter os dois: id novo, "(importado)" no nome, partidas apontando para o novo.
const ambos = importarTorneio(
  pacote,
  plano,
  { conflito: 'manterAmbos', sufixoImportado: '(importado)' },
  { gerarId, agora },
)
assert.notEqual(ambos.torneio.id, 't1')
assert.equal(ambos.torneio.nome, 'Encontro (importado)')
assert.equal(ambos.substituirId, undefined)
assert.ok(
  ambos.partidas.every(
    (item) => item.vinculoTorneio?.torneioId === ambos.torneio.id && item.id !== 'p1',
  ),
)

// Relógios seguem do instante salvo.
assert.deepEqual(limpo.torneio.rodadas[0].relogio, pacote.torneio.rodadas[0].relogio)

console.log('Exportação ok.')
