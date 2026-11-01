/**
 * Falha se uma tradução do guia Aprender a jogar divergir do pt-BR em algo que
 * não é texto: ids, ordem das páginas, pedras, respostas certas, ilustrações.
 *
 * Uso: npm run test:guia
 */
import { conteudoEn } from '../src/dominios/aprender-a-jogar/conteudo/en'
import { conteudoEs } from '../src/dominios/aprender-a-jogar/conteudo/es'
import { conteudoJa } from '../src/dominios/aprender-a-jogar/conteudo/ja'
import { conteudoLt } from '../src/dominios/aprender-a-jogar/conteudo/lt'
import { conteudoPtBR } from '../src/dominios/aprender-a-jogar/conteudo/pt-BR'
import { conteudoZhHans } from '../src/dominios/aprender-a-jogar/conteudo/zh-Hans'

/** Campos de texto corrido viram `*`; estes são dados e precisam ser iguais. */
const DADOS = new Set([
  'id',
  'type',
  'number',
  'mpsz',
  'hand',
  'after',
  'image',
  'tool',
  'links',
  'termos',
])

function esqueleto(valor: unknown, chave = ''): unknown {
  if (typeof valor === 'string') return DADOS.has(chave) ? valor : '*'
  if (Array.isArray(valor)) return valor.map((item) => esqueleto(item, chave))
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor).map(([campo, item]) => [campo, esqueleto(item, campo)]),
    )
  }
  return valor
}

function diferencas(a: unknown, b: unknown, caminho: string, erros: string[]) {
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const campos = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const campo of campos) {
      diferencas(
        (a as Record<string, unknown>)[campo],
        (b as Record<string, unknown>)[campo],
        `${caminho}.${campo}`,
        erros,
      )
    }
  } else if (a !== b) erros.push(`${caminho}: pt-BR ${String(a)} × tradução ${String(b)}`)
}

const erros: string[] = []
for (const [idioma, conteudo] of Object.entries({
  en: conteudoEn,
  es: conteudoEs,
  ja: conteudoJa,
  lt: conteudoLt,
  'zh-Hans': conteudoZhHans,
})) {
  diferencas(
    esqueleto(conteudoPtBR.tutorialParts),
    esqueleto(conteudo.tutorialParts),
    `${idioma}.tutorialParts`,
    erros,
  )
  if (conteudoPtBR.glossary.length !== conteudo.glossary.length) {
    erros.push(`${idioma}.glossary: quantidade de verbetes diferente do pt-BR`)
  }
  if (JSON.stringify(conteudo.tutorialParts).includes('{{onde:')) {
    erros.push(`${idioma}: referência {{onde:…}} sem trocar`)
  }
}

if (erros.length) {
  console.error(`Guia com problema (${erros.length}):\n${erros.join('\n')}`)
  process.exit(1)
}
console.log('Guia ok: en, es, ja, lt e zh-Hans têm a mesma estrutura do pt-BR.')
