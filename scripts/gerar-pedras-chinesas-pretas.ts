/**
 * Gera as pedras chinesas pretas a partir de public/tiles/chines (a face vem do
 * CSS, --pedra-face): o traço preto vira claro e o verde escuro, um verde mais claro. Na versão do tema escuro
 * (chines-black-rosa), o vermelho e o dourado viram o rosa das pedras pretas do
 * Riichi (scripts/gerar-pedras-rosa.ts).
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

const variantes: { pasta: string; trocas: [RegExp, string][] }[] = [
  {
    pasta: 'public/tiles/chines-black',
    trocas: [
      [/(fill|stroke)="#000"/g, `$1="${CLARO}"`],
      [/(fill|stroke)="#2D4A2A"/gi, `$1="${VERDE}"`],
    ],
  },
  {
    pasta: 'public/tiles/chines-black-rosa',
    trocas: [
      [/(fill|stroke)="#000"/g, `$1="${CLARO}"`],
      [/(fill|stroke)="#2D4A2A"/gi, `$1="${VERDE}"`],
      [/(fill|stroke)="#AE2120"/gi, `$1="${ROSA}"`],
      [/fill="#C58A28"/gi, `fill="${ROSA}"`],
    ],
  },
]

for (const { pasta, trocas } of variantes) {
  fs.mkdirSync(pasta, { recursive: true })
  for (const arquivo of fs.readdirSync(ORIGEM)) {
    const origem = path.join(ORIGEM, arquivo)
    let conteudo = fs.readFileSync(origem, 'utf8')
    if (arquivo.endsWith('.svg'))
      for (const [de, para] of trocas) conteudo = conteudo.replace(de, para)
    fs.writeFileSync(path.join(pasta, arquivo), conteudo)
  }
}
console.log('Pedras chinesas pretas geradas.')
