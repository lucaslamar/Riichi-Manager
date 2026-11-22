/**
 * Gera as pedras chinesas pretas a partir de public/tiles/chines (a face vem do
 * CSS, --pedra-face): o traço preto vira claro e o verde escuro, um verde mais claro. Na versão do tema escuro
 * (chines-black-rosa), o vermelho e o dourado viram o rosa das pedras pretas do
 * Riichi (scripts/gerar-pedras-rosa.ts). O Dragão Branco é de uma cor só em cada
 * conjunto, e por isso o da origem também é pintado aqui.
 *
 * Rodar da raiz do projeto: npx tsx scripts/gerar-pedras-chinesas-pretas.ts
 */
import fs from 'fs'
import path from 'path'

const ORIGEM = 'public/tiles/chines'
const CLARO = '#f3eee6'
const ROSA = '#e06ab0'
/** O verde escuro do bambu some na face preta: um verde mais claro. */
const VERDE = '#5fb36a'
/** Dragão Branco: amarelo, e rosa onde as pedras têm rosa. O das pretas é o das pedras do Riichi. */
const AMARELO_NAS_BRANCAS = '#c58a28'
const AMARELO_NAS_PRETAS = '#f0a023'

const variantes: { pasta: string; corHaku: string; trocas: [RegExp, string][] }[] = [
  {
    pasta: 'public/tiles/chines-black',
    corHaku: AMARELO_NAS_PRETAS,
    trocas: [
      [/(fill|stroke)="#000"/g, `$1="${CLARO}"`],
      [/(fill|stroke)="#2D4A2A"/gi, `$1="${VERDE}"`],
    ],
  },
  {
    pasta: 'public/tiles/chines-black-rosa',
    corHaku: ROSA,
    trocas: [
      [/(fill|stroke)="#000"/g, `$1="${CLARO}"`],
      [/(fill|stroke)="#2D4A2A"/gi, `$1="${VERDE}"`],
      [/(fill|stroke)="#AE2120"/gi, `$1="${ROSA}"`],
      [/fill="#C58A28"/gi, `fill="${ROSA}"`],
    ],
  },
]

const umaCor = (svg: string, cor: string) =>
  svg.replace(/(fill|stroke)="#[0-9a-f]{3,6}"/gi, `$1="${cor}"`)

const HAKU = path.join(ORIGEM, 'Haku.svg')
fs.writeFileSync(HAKU, umaCor(fs.readFileSync(HAKU, 'utf8'), AMARELO_NAS_BRANCAS))

for (const { pasta, corHaku, trocas } of variantes) {
  fs.mkdirSync(pasta, { recursive: true })
  for (const arquivo of fs.readdirSync(ORIGEM)) {
    const origem = path.join(ORIGEM, arquivo)
    let conteudo = fs.readFileSync(origem, 'utf8')
    if (arquivo.endsWith('.svg'))
      for (const [de, para] of trocas) conteudo = conteudo.replace(de, para)
    if (arquivo === 'Haku.svg') conteudo = umaCor(conteudo, corHaku)
    fs.writeFileSync(path.join(pasta, arquivo), conteudo)
  }
}
console.log('Pedras chinesas pretas geradas.')
