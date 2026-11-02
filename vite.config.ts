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

/** Grava dist/sw.js com a lista dos arquivos do build, para o app abrir offline. */
function serviceWorker(): Plugin {
  return {
    name: 'mojoca-service-worker',
    apply: 'build',
    closeBundle() {
      const arquivos = listarArquivos(DIST)
        .filter((caminho) => !caminho.endsWith('.map'))
        .map((caminho) => `./${path.relative(DIST, caminho).split(path.sep).join('/')}`)
      const versao = createHash('sha256').update(arquivos.join()).digest('hex').slice(0, 12)
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
