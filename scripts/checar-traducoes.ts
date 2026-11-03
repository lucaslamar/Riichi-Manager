/**
 * Relatório de traduções: compara cada idioma com o pt-BR e lista, por seção,
 * as chaves faltando e as sobrando em `public/locales`, os textos iguais ao
 * inglês (provavelmente sem tradução) e os idiomas sem guia Aprender a jogar
 * próprio. Só avisa: nunca falha, para rodar junto com o lint sem quebrar o build.
 * O `test:i18n` continua sendo o teste que falha.
 *
 * Uso: npm run i18n:check
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { IDIOMAS_SUPORTADOS, IDIOMA_PADRAO, type IdiomaSuportado } from '../src/compartilhado/i18n/idiomas'
import { listarChaves, type Dicionario } from '../src/compartilhado/i18n/traduzir'
import { temGuiaProprio } from '../src/dominios/aprender-a-jogar/conteudo'

const pasta = resolve(import.meta.dirname, '../public/locales')
const ler = (idioma: IdiomaSuportado) =>
  JSON.parse(readFileSync(resolve(pasta, `${idioma}.json`), 'utf8')) as Dicionario

function valor(dicionario: Dicionario, chave: string) {
  return chave.split('.').reduce<unknown>((atual, parte) => (atual as Dicionario)?.[parte], dicionario)
}

/** Agrupa chaves pela seção (primeiro nível do JSON): "match: 3 (match.win.x, …)". */
function porSecao(chaves: string[]): string[] {
  const secoes = new Map<string, string[]>()
  for (const chave of chaves) {
    const secao = chave.split('.')[0]
    secoes.set(secao, [...(secoes.get(secao) ?? []), chave])
  }
  return [...secoes].map(([secao, lista]) => `    ${secao}: ${lista.length} (${lista.join(', ')})`)
}

const referencia = ler(IDIOMA_PADRAO)
const chavesReferencia = new Set(listarChaves(referencia))
const ingles = ler('en')
let avisos = 0

console.log(`Referência: ${IDIOMA_PADRAO}.json, ${chavesReferencia.size} chaves.\n`)

for (const idioma of IDIOMAS_SUPORTADOS) {
  if (idioma === IDIOMA_PADRAO) continue
  const dicionario = ler(idioma)
  const chaves = new Set(listarChaves(dicionario))
  const faltando = [...chavesReferencia].filter((chave) => !chaves.has(chave))
  const sobrando = [...chaves].filter((chave) => !chavesReferencia.has(chave))
  const iguaisAoIngles =
    idioma === 'en'
      ? []
      : [...chaves].filter((chave) => {
          const texto = valor(dicionario, chave)
          return typeof texto === 'string' && /[a-z]{3}/i.test(texto) && texto === valor(ingles, chave)
        })
  const guia = temGuiaProprio(idioma)

  console.log(`${idioma}.json`)
  console.log(`  faltando: ${faltando.length}`)
  if (faltando.length) console.log(porSecao(faltando).join('\n'))
  console.log(`  sobrando: ${sobrando.length}`)
  if (sobrando.length) console.log(porSecao(sobrando).join('\n'))
  if (idioma !== 'en') {
    const secoes = new Map<string, number>()
    for (const chave of iguaisAoIngles) secoes.set(chave.split('.')[0], (secoes.get(chave.split('.')[0]) ?? 0) + 1)
    const resumo = [...secoes].map(([secao, total]) => `${secao} ${total}`).join(', ')
    console.log(`  iguais ao inglês (provável sem tradução): ${iguaisAoIngles.length}${resumo ? ` (${resumo})` : ''}`)
  }
  console.log(`  guia Aprender a jogar: ${guia ? 'próprio' : 'FALTANDO (mostra o inglês)'}\n`)
  avisos += faltando.length + sobrando.length + (guia ? 0 : 1)
}

console.log(avisos ? `Atenção: ${avisos} aviso(s) de tradução.` : 'Traduções completas.')
