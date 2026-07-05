#!/usr/bin/env node

/**
 * scripts/fix-github-pages.js
 *
 * Diagnostica e corrige os problemas mais comuns de deploy no GitHub Pages
 * para projetos Vite que usam a branch "gh-pages" (pacote gh-pages).
 *
 * Este arquivo fica em /scripts, mas deve ser executado a partir da RAIZ
 * do projeto (onde está o package.json), assim:
 *
 *   node scripts/fix-github-pages.js
 *
 * Repositório detectado (ajuste se necessário):
 *   usuario: lucaslamar
 *   repo:    Riichi-Manager
 *
 * Nota: as linhas com "require", "process", "console" podiam aparecer com
 * sublinhado no editor porque o projeto tem tsconfig.json e faltam os
 * @types/node. Isso era só um aviso do TypeScript, não afetava a execução.
 * O "@ts-nocheck" acima já silencia esses avisos no VS Code.
 */

import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const GITHUB_USER = 'lucaslamar'
const REPO_NAME = 'Riichi-Manager'
const EXPECTED_BASE = `/${REPO_NAME}/`
const EXPECTED_HOMEPAGE = `https://${GITHUB_USER}.github.io/${REPO_NAME}/`

let issuesFound = 0
let issuesFixed = 0

function log(msg: string): void {
  console.log(msg)
}

function ok(msg: string): void {
  console.log(`✅ ${msg}`)
}

function warn(msg: string): void {
  console.log(`⚠️  ${msg}`)
  issuesFound++
}

function fixed(msg: string): void {
  console.log(`🔧 CORRIGIDO: ${msg}`)
  issuesFixed++
}

// ---------------------------------------------------------------------------
// 1. package.json: checar "homepage" e scripts de deploy
// ---------------------------------------------------------------------------
function checkPackageJson() {
  const pkgPath = path.join(ROOT, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    warn('package.json não encontrado. Rode este script na raiz do projeto.')
    return
  }

  const pkgRaw = fs.readFileSync(pkgPath, 'utf8')
  const pkg = JSON.parse(pkgRaw)
  let changed = false

  if (pkg.homepage !== EXPECTED_HOMEPAGE) {
    warn(`campo "homepage" ausente ou incorreto (era: ${pkg.homepage || 'undefined'})`)
    pkg.homepage = EXPECTED_HOMEPAGE
    changed = true
    fixed(`"homepage" definido como ${EXPECTED_HOMEPAGE}`)
  } else {
    ok('"homepage" já está correto no package.json')
  }

  pkg.scripts = pkg.scripts || {}

  if (!pkg.scripts.build) {
    warn(
      'script "build" não encontrado em package.json (necessário para o Vite gerar a pasta dist)',
    )
  } else {
    ok('script "build" presente')
  }

  if (!pkg.scripts.predeploy) {
    pkg.scripts.predeploy = 'npm run build'
    changed = true
    fixed('script "predeploy" adicionado (roda o build antes do deploy)')
  } else {
    ok('script "predeploy" presente')
  }

  if (!pkg.scripts.deploy) {
    pkg.scripts.deploy = 'gh-pages -d dist'
    changed = true
    fixed('script "deploy" adicionado (gh-pages -d dist)')
  } else {
    ok('script "deploy" presente')
  }

  const hasGhPagesDep =
    (pkg.dependencies && pkg.dependencies['gh-pages']) ||
    (pkg.devDependencies && pkg.devDependencies['gh-pages'])

  if (!hasGhPagesDep) {
    warn('pacote "gh-pages" não está no package.json. Rode: npm install --save-dev gh-pages')
  } else {
    ok('dependência "gh-pages" presente')
  }

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
}

// ---------------------------------------------------------------------------
// 2. vite.config.js / .ts: checar "base"
// ---------------------------------------------------------------------------
function checkViteConfig() {
  const candidates = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs']
  const configPath = candidates.map((f) => path.join(ROOT, f)).find((p) => fs.existsSync(p))

  if (!configPath) {
    warn(
      'Nenhum vite.config.(js|ts|mjs) encontrado. Se você usa Vite, crie um com "base" definido.',
    )
    return
  }

  let content = fs.readFileSync(configPath, 'utf8')

  if (content.includes(`base:`)) {
    const match = content.match(/base:\s*['"`]([^'"`]+)['"`]/)
    if (match && match[1] === EXPECTED_BASE) {
      ok(`"base" já está correto em ${path.basename(configPath)} (${EXPECTED_BASE})`)
    } else {
      warn(
        `"base" encontrado mas com valor diferente do esperado (${match ? match[1] : '??'}). Deveria ser "${EXPECTED_BASE}"`,
      )
      if (match) {
        content = content.replace(match[0], `base: '${EXPECTED_BASE}'`)
        fs.writeFileSync(configPath, content)
        fixed(`"base" atualizado para '${EXPECTED_BASE}' em ${path.basename(configPath)}`)
      }
    }
  } else {
    warn(
      `"base" não definido em ${path.basename(configPath)}. Isso quebra assets em projetos que não usam usuario.github.io`,
    )
    // Insere base dentro do defineConfig({...})
    if (content.includes('defineConfig({')) {
      content = content.replace('defineConfig({', `defineConfig({\n  base: '${EXPECTED_BASE}',`)
      fs.writeFileSync(configPath, content)
      fixed(`"base: '${EXPECTED_BASE}'" adicionado em ${path.basename(configPath)}`)
    } else {
      warn(
        "Não consegui inserir automaticamente. Adicione manualmente: base: '" + EXPECTED_BASE + "'",
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 3. .nojekyll: necessário para pastas que começam com "_" (ex: _assets) não
//    serem ignoradas pelo Jekyll do GitHub Pages
// ---------------------------------------------------------------------------
function checkNojekyll() {
  const publicDir = path.join(ROOT, 'public')
  const nojekyllPublic = path.join(publicDir, '.nojekyll')

  if (fs.existsSync(publicDir)) {
    if (!fs.existsSync(nojekyllPublic)) {
      fs.writeFileSync(nojekyllPublic, '')
      fixed('.nojekyll criado em /public (será copiado para dist no build)')
    } else {
      ok('.nojekyll já existe em /public')
    }
  } else {
    warn(
      'Pasta "public/" não encontrada. Crie-a e adicione um arquivo .nojekyll vazio dentro dela.',
    )
  }
}

// ---------------------------------------------------------------------------
// 4. Checar se dist está no .gitignore (correto) mas gh-pages branch existe
// ---------------------------------------------------------------------------
function checkGitignore() {
  const gitignorePath = path.join(ROOT, '.gitignore')
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8')
    if (!content.includes('dist')) {
      log(
        'ℹ️  Sugestão: adicione "dist" ao .gitignore (a pasta de build não deve ir para a branch main).',
      )
    } else {
      ok('"dist" já está no .gitignore')
    }
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
log('🔍 Diagnosticando configuração de deploy do GitHub Pages...\n')
checkPackageJson()
log('')
checkViteConfig()
log('')
checkNojekyll()
log('')
checkGitignore()

log('\n---------------------------------------------')
log(`Problemas encontrados: ${issuesFound}`)
log(`Problemas corrigidos automaticamente: ${issuesFixed}`)
log('---------------------------------------------\n')

log('Próximos passos:')
log('  1. Confira as mudanças com: git diff')
log('  2. Instale dependências se necessário: npm install')
log('  3. Rode o deploy: npm run deploy')
log('  4. Aguarde 1-2 min e recarregue https://' + GITHUB_USER + '.github.io/' + REPO_NAME + '/')
log('\nSe o próximo deploy ainda falhar, rode "npm run deploy" no terminal e me mande')
log('a mensagem de erro completa que aparecer no console (não só o print do GitHub).')

log('\nLembrete: este script deve ser rodado a partir da RAIZ do projeto,')
log('mesmo estando salvo dentro de /scripts. Exemplo:')
log('  node scripts/fix-github-pages.js')
