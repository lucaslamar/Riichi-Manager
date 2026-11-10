import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import path from 'path'

const DIST = path.resolve(__dirname, 'dist')

function listarArquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = path.join(pasta, nome)
    return statSync(caminho).isDirectory() ? listarArquivos(caminho) : [caminho]
  })
}

/**
 * Impressão digital dos textos (public/locales): muda sempre que um JSON muda,
 * mesmo sem trocar a versão do package.json. Vai no endereço dos textos.
 */
function versaoDosTextos(): string {
  const pasta = path.resolve(__dirname, 'public/locales')
  const hash = createHash('sha256')
  for (const arquivo of listarArquivos(pasta).sort()) hash.update(readFileSync(arquivo))
  return hash.digest('hex').slice(0, 12)
}

/** Grava dist/sw.js com a lista dos arquivos do build, para o app abrir offline. */
function serviceWorker(): Plugin {
  return {
    name: 'mojoca-service-worker',
    apply: 'build',
    closeBundle() {
      const arquivos = listarArquivos(DIST)
        .filter((caminho) => !caminho.endsWith('.map'))
        .map((caminho) => `./${path.relative(DIST, caminho).split(path.sep).join('/')}`)
      // Nome e conteúdo: um JSON de textos alterado também gera um cache novo.
      const hash = createHash('sha256')
      for (const arquivo of arquivos) hash.update(arquivo).update(readFileSync(path.join(DIST, arquivo)))
      const versao = hash.digest('hex').slice(0, 12)
      const modelo = readFileSync(path.resolve(__dirname, 'scripts/sw-modelo.js'), 'utf8')
      writeFileSync(
        path.join(DIST, 'sw.js'),
        modelo.replace('__VERSAO__', versao).replace('__ARQUIVOS__', JSON.stringify(arquivos.map(encodeURI))),
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), serviceWorker()],

  define: {
    __VERSAO_TEXTOS__: JSON.stringify(versaoDosTextos()),
    // Vai no arquivo de backup, para saber de que versão do app ele saiu.
    __VERSAO_APP__: JSON.stringify(JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')).version),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  base: '/Riichi-Manager/',
})
