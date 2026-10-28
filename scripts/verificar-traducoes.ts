/**
 * Falha se alguma chave existir num idioma e faltar em outro, se um plural não
 * tiver as formas que o idioma pede (ex.: lituano: one, few, many, other) ou se
 * um texto perder um parâmetro {{…}} que o pt-BR usa.
 *
 * Uso: npm run test:i18n
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { IDIOMAS_SUPORTADOS, IDIOMA_PADRAO } from '../src/compartilhado/i18n/idiomas'
import { listarChaves, type Dicionario } from '../src/compartilhado/i18n/traduzir'

const pasta = resolve(import.meta.dirname, '../public/locales')
const ler = (idioma: string) =>
  JSON.parse(readFileSync(resolve(pasta, `${idioma}.json`), 'utf8')) as Dicionario

const dicionarios = Object.fromEntries(IDIOMAS_SUPORTADOS.map((idioma) => [idioma, ler(idioma)]))
const chaves = Object.fromEntries(
  IDIOMAS_SUPORTADOS.map((idioma) => [idioma, new Set(listarChaves(dicionarios[idioma]))]),
)
const todas = new Set(Object.values(chaves).flatMap((conjunto) => [...conjunto]))
const erros: string[] = []

function valor(dicionario: Dicionario, chave: string) {
  return chave
    .split('.')
    .reduce<unknown>((atual, parte) => (atual as Dicionario)?.[parte], dicionario)
}

function parametros(texto: unknown): string[] {
  const textos = typeof texto === 'string' ? [texto] : Object.values(texto as Dicionario)
  const nomes = textos.flatMap((parte) =>
    [...String(parte).matchAll(/\{\{(\w+)\}\}/g)].map((achado) => achado[1]),
  )
  return [...new Set(nomes)].sort()
}

for (const idioma of IDIOMAS_SUPORTADOS) {
  // Formas que o app pode pedir: contagens inteiras e frações (lituano usa many para frações).
  const regra = new Intl.PluralRules(idioma)
  const formasPlural = [
    ...new Set([
      ...Array.from({ length: 10001 }, (_, numero) => regra.select(numero)),
      regra.select(1.5),
    ]),
  ]
  for (const chave of todas) {
    if (!chaves[idioma].has(chave)) {
      erros.push(`${idioma}: falta a chave ${chave}`)
      continue
    }
    const texto = valor(dicionarios[idioma], chave)
    if (typeof texto === 'object') {
      const faltando = formasPlural.filter((forma) => !(forma in (texto as Dicionario)))
      if (faltando.length)
        erros.push(`${idioma}: ${chave} sem as formas de plural ${faltando.join(', ')}`)
    }
    const referencia = valor(dicionarios[IDIOMA_PADRAO], chave)
    if (referencia !== undefined) {
      const esperados = parametros(referencia).filter((nome) => nome !== 'count')
      const usados = parametros(texto)
      const perdidos = esperados.filter((nome) => !usados.includes(nome))
      if (perdidos.length) erros.push(`${idioma}: ${chave} perdeu {{${perdidos.join('}}, {{')}}}`)
    }
  }
}

if (erros.length) {
  console.error(`Traduções com problema (${erros.length}):\n${erros.join('\n')}`)
  process.exit(1)
}
console.log(`Traduções ok: ${todas.size} chaves em ${IDIOMAS_SUPORTADOS.length} idiomas.`)
