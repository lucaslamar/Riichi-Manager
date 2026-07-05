/**
 * scripts/check-pages-conflict.ts
 *
 * Verifica se o projeto tem DOIS métodos de deploy do GitHub Pages
 * configurados ao mesmo tempo (o que causa falhas intermitentes):
 *
 *   Método A: npm script "deploy" usando o pacote "gh-pages"
 *             (empurra dist/ pra branch gh-pages)
 *   Método B: workflow do GitHub Actions usando "actions/deploy-pages"
 *             ou "peaceiris/actions-gh-pages"
 *
 * Se os dois existirem ao mesmo tempo, eles brigam pelo mesmo deployment
 * slot do GitHub Pages e um deles falha aleatoriamente.
 *
 * Também tenta checar (se a CLI "gh" estiver instalada e autenticada)
 * qual é a "source" configurada em Settings > Pages do repositório.
 *
 * Como rodar:
 *   npx tsx scripts/check-pages-conflict.ts
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = process.cwd()

interface PackageJson {
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

function log(msg: string): void {
  console.log(msg)
}

function ok(msg: string): void {
  console.log(`✅ ${msg}`)
}

function warn(msg: string): void {
  console.log(`⚠️  ${msg}`)
}

function error(msg: string): void {
  console.log(`❌ ${msg}`)
}

function section(title: string): void {
  log('\n' + '─'.repeat(60))
  log(title)
  log('─'.repeat(60))
}

// ---------------------------------------------------------------------------
// 1. Método A: npm script "deploy" via pacote gh-pages
// ---------------------------------------------------------------------------
function checkNpmDeployMethod(): boolean {
  const pkgPath = path.join(ROOT, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    warn('package.json não encontrado.')
    return false
  }

  const pkg: PackageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const deployScript = pkg.scripts?.deploy || ''
  const hasGhPagesDep =
    !!(pkg.dependencies && pkg.dependencies['gh-pages']) ||
    !!(pkg.devDependencies && pkg.devDependencies['gh-pages'])

  const usesGhPages = deployScript.includes('gh-pages') || hasGhPagesDep

  if (usesGhPages) {
    ok(`Encontrado: script "deploy" usa o pacote gh-pages -> "${deployScript}"`)
  } else {
    log('ℹ️  Nenhum script de deploy via "gh-pages" encontrado no package.json.')
  }

  return usesGhPages
}

// ---------------------------------------------------------------------------
// 2. Método B: workflow do GitHub Actions fazendo deploy de Pages
// ---------------------------------------------------------------------------
function checkActionsWorkflows(): { found: boolean; files: string[] } {
  const workflowsDir = path.join(ROOT, '.github', 'workflows')
  const result = { found: false, files: [] as string[] }

  if (!fs.existsSync(workflowsDir)) {
    log('ℹ️  Pasta .github/workflows não encontrada — nenhum workflow de Actions no repo.')
    return result
  }

  const files = fs
    .readdirSync(workflowsDir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))

  const pagesActionSignatures = [
    'actions/deploy-pages',
    'actions/upload-pages-artifact',
    'peaceiris/actions-gh-pages',
  ]

  for (const file of files) {
    const filePath = path.join(workflowsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const matched = pagesActionSignatures.filter((sig) => content.includes(sig))

    if (matched.length > 0) {
      result.found = true
      result.files.push(file)
      warn(`Workflow "${file}" faz deploy de GitHub Pages (usa: ${matched.join(', ')})`)
    }
  }

  if (!result.found) {
    log('ℹ️  Nenhum workflow em .github/workflows faz deploy de Pages diretamente.')
  }

  return result
}

// ---------------------------------------------------------------------------
// 3. (Opcional) Checar a "source" configurada em Settings > Pages via gh CLI
// ---------------------------------------------------------------------------
function checkPagesSourceViaGhCli(): void {
  try {
    execSync('gh --version', { stdio: 'ignore' })
  } catch {
    log('ℹ️  GitHub CLI ("gh") não encontrada — pulando checagem remota de Settings > Pages.')
    log(
      '   (Instale com "winget install GitHub.cli" ou veja https://cli.github.com para checar automaticamente da próxima vez.)',
    )
    return
  }

  try {
    const raw = execSync('gh api repos/:owner/:repo/pages', {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString()
    const data = JSON.parse(raw)
    const buildType = data?.build_type // "workflow" ou "legacy"
    const sourceBranch = data?.source?.branch

    if (buildType === 'workflow') {
      ok('Settings > Pages está configurado como "GitHub Actions" (build_type: workflow)')
    } else {
      ok(
        `Settings > Pages está configurado como "Deploy from a branch" (branch: ${sourceBranch || 'desconhecida'})`,
      )
    }

    log(`   URL do site: ${data?.html_url || 'desconhecida'}`)
  } catch {
    warn(
      'Não consegui consultar Settings > Pages via "gh api" (talvez não esteja autenticado ou não seja um repo remoto do GitHub).',
    )
    log(
      '   Rode "gh auth login" e tente de novo, ou confira manualmente em Settings > Pages no navegador.',
    )
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
log('🔍 Verificando métodos de deploy do GitHub Pages configurados neste projeto...')

section('Método A — npm run deploy (pacote gh-pages)')
const usesNpmDeploy = checkNpmDeployMethod()

section('Método B — workflow do GitHub Actions')
const actionsResult = checkActionsWorkflows()

section('Settings > Pages (via GitHub CLI, se disponível)')
checkPagesSourceViaGhCli()

section('Resultado')

if (usesNpmDeploy && actionsResult.found) {
  error('CONFLITO ENCONTRADO: os dois métodos de deploy estão configurados ao mesmo tempo.')
  log('')
  log('Isso faz um dos dois falhar aleatoriamente (o log "Deployment failed, try again later"')
  log(
    'geralmente vem do workflow do Actions perdendo a corrida contra o gh-pages branch, ou vice-versa).',
  )
  log('')
  log('Escolha UM dos métodos:')
  log('')
  log('  OPÇÃO A — manter "npm run deploy" (mais simples, o que já está funcionando):')
  for (const file of actionsResult.files) {
    log(`    - Apague: .github/workflows/${file}`)
  }
  log('')
  log('  OPÇÃO B — manter só o GitHub Actions:')
  log('    - Vá em Settings > Pages > Source e mude para "GitHub Actions"')
  log('    - Remova os scripts "deploy"/"predeploy" do package.json')
  log('    - Remova a dependência "gh-pages" (npm uninstall gh-pages)')
} else if (usesNpmDeploy && !actionsResult.found) {
  ok('Nenhum conflito. Só o método "npm run deploy" (gh-pages) está ativo.')
} else if (!usesNpmDeploy && actionsResult.found) {
  ok('Nenhum conflito. Só o workflow do GitHub Actions está ativo.')
} else {
  warn('Nenhum método de deploy detectado. Configure um dos dois (veja o script debug-deploy.ts).')
}

log('')
