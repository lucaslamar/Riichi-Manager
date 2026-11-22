/**
 * Falha se o livro do MCR perder módulo, texto, resposta certa ou algum dos 81
 * fan, se usar termo do Riichi fora da Parte 6, se um fan do quiz não bater com
 * o motor ou se o rank e a migração do progresso quebrarem.
 *
 * Uso: npm run test:tutorial-mcr
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { interpolar, textoDaChave, type Dicionario } from '../src/compartilhado/i18n/traduzir'
import { FANS_MCR } from '../src/compartilhado/mahjong/mcr/fans-mcr'
import { calcularNotacaoMcr } from '../src/dominios/calculadora-mao-chinesa/logica/notacao-mcr'
import { parseMpsz } from '../src/dominios/calculadora-mao/logica/yakus'
import { mpszDoExemplo } from '../src/dominios/aprender-a-jogar/conteudo/mcr/fans'
import { criarConteudoMcr } from '../src/dominios/aprender-a-jogar/conteudo/mcr/livro'
import { MODULOS_MCR } from '../src/dominios/aprender-a-jogar/conteudo/mcr/modulos'
import { montarLivro } from '../src/dominios/aprender-a-jogar/logica/livro'
import { ehDan, nomeRank, rankPorConcluidos } from '../src/dominios/aprender-a-jogar/logica/rank'
import {
  lerProgressoGuia,
  migrarConcluidos,
  migrarPaginaMcr,
  salvarProgressoGuia,
} from '../src/dominios/aprender-a-jogar/persistencia/progressoGuia'

const dicionario = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../public/locales/pt-BR.json'), 'utf8'),
) as Dicionario

const livro = criarConteudoMcr((chave, parametros) => {
  const achado =
    textoDaChave(dicionario, `modo.mcr.${chave}`, 'pt-BR', parametros) ??
    textoDaChave(dicionario, chave, 'pt-BR', parametros)
  assert.ok(achado !== undefined, `falta o texto ${chave}`)
  return interpolar(achado, 'pt-BR', parametros)
})

const partes = livro.tutorialParts
const modulos = partes.flatMap((parte) => parte.modules)
assert.deepEqual(
  modulos.map(({ id }) => id),
  MODULOS_MCR,
)
modulos.forEach((modulo, indice) => assert.equal(modulo.number, indice + 1, modulo.id))
assert.deepEqual(
  partes.map((parte) => parte.modules.length),
  [3, 4, 5, 3, 7, 2],
)

const ids = montarLivro(livro).map(({ id }) => id)
assert.equal(new Set(ids).size, ids.length, 'id de página repetido')

for (const modulo of modulos) {
  const perguntas = modulo.quiz ?? []
  assert.ok(perguntas.length >= 3 && perguntas.length <= 5, `${modulo.id}: 3 a 5 perguntas`)
  for (const { question, options = [], hand } of perguntas) {
    assert.equal(options.filter((opcao) => opcao.correct).length, 1, question)
    assert.equal(new Set(options.map((opcao) => opcao.label)).size, options.length, question)
    if (!hand) continue
    const existe = FANS_MCR.some(({ exemplo }) => mpszDoExemplo(exemplo) === hand)
    assert.ok(existe, `mão do quiz fora dos exemplos: ${hand}`)
  }
}

for (const { exemplo } of FANS_MCR) {
  const { chamadas, pedras } = calcularNotacaoMcr(exemplo).mao
  const total =
    pedras.length + chamadas.reduce((soma, { tipo }) => soma + (tipo.startsWith('kan') ? 4 : 3), 0)
  assert.equal(parseMpsz(mpszDoExemplo(exemplo)).length, total, exemplo)
}

const parteFan = partes[4]
const cartoes = new Set(
  parteFan.modules
    .slice(1)
    .flatMap((modulo) => modulo.pages)
    .flatMap((pagina) => pagina.blocks)
    .flatMap((bloco) => (bloco.type === 'fans' ? bloco.ids : [])),
)
assert.equal(cartoes.size, 81, 'os módulos 17 a 22 cobrem os 81 fan')

for (const modulo of parteFan.modules) {
  for (const { hand, options = [] } of modulo.quiz ?? []) {
    if (!hand) continue
    // Exemplos diferentes podem ter as mesmas pedras: a resposta diz qual é.
    const exemplos = FANS_MCR.filter((fan) => mpszDoExemplo(fan.exemplo) === hand)
    const confere = exemplos.some(({ exemplo }) => {
      const { fans, fanTotal } = calcularNotacaoMcr(exemplo)
      const naMao = new Set(fans.map(({ id }) => id))
      return options.every(({ label, correct }) => {
        const fan = FANS_MCR.find(({ pt }) => pt === label)
        return !!correct === (fan ? naMao.has(fan.id) : label === String(fanTotal))
      })
    })
    assert.ok(confere, `${modulo.id}: resposta diferente do motor para ${hand}`)
  }
}

const TERMOS_RIICHI =
  /\b(Pon|Kans?|Kakan|Ron|Tsumo|Yakus?|Yakuman|Riichi|Dora|Honba|Furiten|Chombo|Kuikae|Renchan|japon[eê]s)\b/i
const semParte6 = JSON.stringify([
  partes.filter((parte) => !parte.optional),
  livro.glossary,
  livro.dicaRank,
  livro.textoConclusao,
])
assert.equal(semParte6.match(TERMOS_RIICHI)?.[0], undefined, 'termo do Riichi fora da Parte 6')

const obrigatorios = partes.filter((parte) => !parte.optional).flatMap((parte) => parte.modules)
const completo = rankPorConcluidos(
  obrigatorios.map(({ id }) => id),
  partes,
)
assert.equal(nomeRank(completo, livro.ranks), 'Mestre do MCR')
assert.ok(ehDan(completo, livro.ranks))
const faltando = rankPorConcluidos(
  obrigatorios.slice(0, -1).map(({ id }) => id),
  partes,
)
assert.ok(!ehDan(faltando, livro.ranks))

assert.deepEqual(
  migrarConcluidos(['basico', 'mcr-o-que-e', 'mcr-termos', 'mcr-como-jogar', 'mcr-sumiu']),
  ['basico', 'mcr-o-que-e', 'mcr-chamadas', 'mcr-turno'],
)
assert.equal(migrarPaginaMcr('mcr-como-jogar-2'), 'capa-mcr-turno')

const guardado = new Map<string, string>()
Object.assign(globalThis, {
  window: {
    localStorage: {
      getItem: (chave: string) => guardado.get(chave) ?? null,
      setItem: (chave: string, valor: string) => guardado.set(chave, valor),
    },
  },
})
salvarProgressoGuia('riichi', { pagina: 'riichi-pagina', concluidos: ['basico'] })
salvarProgressoGuia('mcr', { pagina: 'mcr-muro-1', concluidos: ['basico', 'mcr-muro'] })
assert.equal(lerProgressoGuia('riichi').pagina, 'riichi-pagina', 'o lugar do Riichi não muda')
assert.equal(lerProgressoGuia('mcr').pagina, 'mcr-muro-1')
guardado.forEach((_, chave) =>
  guardado.set(chave, JSON.stringify({ pagina: 'mcr-termos-2', concluidos: [], versao: 2 })),
)
assert.equal(lerProgressoGuia('mcr').pagina, 'capa-mcr-chamadas', 'lugar salvo no formato antigo')

console.log(`Tutorial MCR ok: ${modulos.length} módulos, 81 fan, rank e migração.`)
