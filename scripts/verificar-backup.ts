/**
 * Testes do backup (exportar e importar entre aparelhos).
 *
 * Uso: npm run test:backup
 */
import assert from 'node:assert/strict'
import type { ArmazenamentoChaveValor } from '../src/compartilhado/persistencia/armazenamento'
import {
  gerarClubeDeTeste,
  gerarJogadoresDeTeste,
  gerarPartidasDeTeste,
  gerarTorneiosDeTeste,
} from '../src/dominios/centerpiece/logica/dadosDeTeste'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import { carregarJogadores } from '../src/dominios/jogadores/persistencia/repositorioJogadores'
import { carregarClube } from '../src/dominios/centerpiece/persistencia/repositorioClube'
import {
  mesclarBackup,
  montarBackup,
  nomeDoBackup,
  resumoBackup,
  sugerirMesmasPessoas,
  unificarJogadores,
  validarBackup,
  type DadosBackup,
} from '../src/services/backup/backup'
import { gravarDados } from '../src/services/backup/lojaBackup'

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

function memoria(): ArmazenamentoChaveValor & { dados: Record<string, string> } {
  const dados: Record<string, string> = {}
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

/** Um aparelho cheio: a massa de teste inteira. */
function aparelhoCheio(): DadosBackup {
  const torneios = gerarTorneiosDeTeste(AGORA)
  const clube = gerarClubeDeTeste(AGORA)
  return {
    jogadores: gerarJogadoresDeTeste(AGORA),
    partidas: [...gerarPartidasDeTeste(AGORA, 20), ...torneios.partidas, ...clube.partidas],
    torneios: torneios.torneios,
    temporadas: torneios.temporadas,
    listasTorneio: [],
    clube: { lista: clube.lista, sorteio: clube.sorteio, encontros: clube.encontros },
    configMesa: configDoPreset('wrc'),
    regrasRegistro: { conjunto: 'padrao', personalizado: null },
  }
}

const VAZIO: DadosBackup = {
  jogadores: [],
  partidas: [],
  torneios: [],
  temporadas: [],
  listasTorneio: [],
  clube: { lista: '', sorteio: null, encontros: [] },
  configMesa: null,
  regrasRegistro: null,
}

teste('nome do arquivo com a data local', () => {
  assert.equal(nomeDoBackup(new Date(2026, 0, 5, 23, 59)), 'mojoca-backup-2026-01-05.json')
})

teste('exportar e ler de volta: ida e volta sem perda', () => {
  const cheio = aparelhoCheio()
  const arquivo = montarBackup(cheio, '5.9.0', AGORA)
  assert.equal(arquivo.appVersion, '5.9.0')
  assert.equal(arquivo.schemaVersion, 1)
  const lido = validarBackup(JSON.stringify(arquivo))
  assert.ok(lido.ok)
  assert.deepEqual(lido.backup.dados, cheio)
  assert.deepEqual(resumoBackup(lido.backup.dados), {
    jogadores: 12,
    partidas: cheio.partidas.filter((partida) => partida.status === 'finalizada').length,
    torneios: 7,
  })
})

teste('arquivos inválidos dão o erro certo', () => {
  assert.deepEqual(validarBackup('{nada'), { ok: false, erro: 'naoEhJson' })
  assert.deepEqual(validarBackup('{"app":"outro"}'), { ok: false, erro: 'naoEhBackup' })
  const futuro = { ...montarBackup(VAZIO, '9.0.0', AGORA), schemaVersion: 99 }
  assert.deepEqual(validarBackup(futuro), { ok: false, erro: 'versaoNova' })
  const quebrado = { ...montarBackup(VAZIO, '5.9.0', AGORA), dados: { ...VAZIO, jogadores: [{ nome: 'sem id' }] } }
  assert.deepEqual(validarBackup(quebrado), { ok: false, erro: 'corrompido' })
})

teste('mesclar não duplica e mantém o que já existe', () => {
  const cheio = aparelhoCheio()
  const duasVezes = mesclarBackup(cheio, cheio)
  assert.deepEqual(duasVezes, cheio, 'mesclar consigo mesmo não muda nada')

  // Outro aparelho: metade dos jogadores, um com nome trocado, e uma partida nova.
  const local: DadosBackup = {
    ...VAZIO,
    jogadores: [{ ...cheio.jogadores[0], nome: 'Nome local' }],
    configMesa: configDoPreset('padrao'),
  }
  const mesclado = mesclarBackup(local, cheio)
  assert.equal(mesclado.jogadores.length, 12)
  assert.equal(mesclado.jogadores[0].nome, 'Nome local', 'o local vence no mesmo id')
  assert.equal(mesclado.partidas.length, cheio.partidas.length)
  assert.equal(mesclado.clube.encontros.length, 4)
  assert.ok(mesclado.clube.sorteio, 'sem sorteio aqui, vem o do backup')
  assert.deepEqual(mesclado.configMesa, configDoPreset('padrao'), 'configurações locais ficam')
})

teste('substituir grava tudo e os repositórios leem de volta', () => {
  const cheio = aparelhoCheio()
  const armazenamento = memoria()
  const lido = validarBackup(JSON.stringify(montarBackup(cheio, '5.9.0', AGORA)))
  assert.ok(lido.ok)
  gravarDados(armazenamento, lido.backup.dados)
  assert.deepEqual(carregarJogadores(armazenamento), cheio.jogadores)
  const partidas = JSON.parse(armazenamento.dados['riichi-manager-partidas']).partidas
  assert.equal(partidas.length, cheio.partidas.length)
  const torneios = JSON.parse(armazenamento.dados['riichi-manager-torneios'])
  assert.equal(torneios.torneios.length, 7)
  assert.equal(carregarClube(armazenamento).encontros.length, 4)
  assert.equal(carregarClube(armazenamento).lista, cheio.clube.lista)
})

teste('a mesma pessoa cadastrada nos dois aparelhos vira uma só', () => {
  const cheio = aparelhoCheio()
  // Outro aparelho: a Carol com outro id (e sem acento/maiúscula iguais).
  const carol = cheio.jogadores.find((jogador) => jogador.apelido === 'Carol')!
  const local = { ...carol, id: 'local-carol', nome: 'ana carolina souza', apelido: undefined }
  const sugestoes = sugerirMesmasPessoas([local], cheio.jogadores)
  assert.deepEqual(sugestoes.map((item) => [item.vindo.id, item.local.id]), [[carol.id, 'local-carol']])
  const unificado = unificarJogadores(cheio, { [carol.id]: 'local-carol' })
  assert.ok(!unificado.jogadores.some((jogador) => jogador.id === carol.id), 'a Carol do backup não entra de novo')
  const texto = JSON.stringify([unificado.partidas, unificado.torneios, unificado.clube])
  assert.ok(!texto.includes(JSON.stringify(carol.id)), 'nenhuma partida, torneio ou mesa aponta para o id antigo')
  assert.ok(texto.includes('local-carol'))
  const partidasDela = unificado.partidas.filter((partida) => partida.resultado?.some((linha) => linha.jogadorId === 'local-carol'))
  assert.equal(partidasDela.length, cheio.partidas.filter((partida) => partida.resultado?.some((linha) => linha.jogadorId === carol.id)).length)
  assert.deepEqual(unificarJogadores(cheio, {}), cheio, 'sem pares, nada muda')
})

console.log(`Backup ok: ${testes} testes.`)
