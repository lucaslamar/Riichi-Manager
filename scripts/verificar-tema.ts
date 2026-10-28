/**
 * Confere o tema Velvet Darkness:
 * - `tema-escuro.css` usa exatamente os valores de `temas.ts`;
 * - os pares principais passam no WCAG AA (4,5:1 para texto, 3:1 para bordas
 *   de controles e acentos não textuais), com e sem Alto contraste.
 *
 * Uso: npm run test:tema
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  VELVET_DARKNESS,
  VELVET_DARKNESS_ALTO_CONTRASTE,
  type PaletaTema,
} from '../src/compartilhado/tema/temas'

const css = readFileSync(
  resolve(import.meta.dirname, '../src/compartilhado/tema/tema-escuro.css'),
  'utf8',
)
const erros: string[] = []

/** Token da paleta → variável CSS. */
const VARIAVEIS: Record<keyof PaletaTema, string> = {
  background: '--cor-fundo',
  surface: '--cor-superficie',
  surfaceAlt: '--cor-superficie-alt',
  border: '--cor-borda',
  borderControl: '--cor-borda-controle',
  text: '--cor-texto',
  textMuted: '--cor-texto-suave',
  primary: '--cor-primario',
  onPrimary: '--cor-sobre-primario',
  primarySoft: '--cor-primario-suave',
  primaryBorder: '--cor-primario-borda',
  secondary: '--cor-secundario',
  secondaryText: '--cor-secundario-texto',
  accent: '--cor-destaque',
  accentSoft: '--cor-destaque-suave',
  accentBorder: '--cor-destaque-borda',
  focus: '--cor-foco',
  danger: '--cor-perigo',
  dangerSoft: '--cor-perigo-suave',
  dangerBorder: '--cor-perigo-borda',
  success: '--cor-sucesso',
  successSoft: '--cor-sucesso-suave',
  successBorder: '--cor-sucesso-borda',
  warning: '--cor-aviso',
  warningSoft: '--cor-aviso-suave',
  warningBorder: '--cor-aviso-borda',
  navBackground: '--cor-nav',
}

function bloco(seletor: string) {
  const inicio = css.indexOf(`${seletor} {`)
  return inicio < 0 ? '' : css.slice(inicio, css.indexOf('}', inicio))
}

function conferir(seletor: string, paleta: Partial<PaletaTema>) {
  const texto = bloco(seletor)
  for (const [token, cor] of Object.entries(paleta)) {
    const variavel = VARIAVEIS[token as keyof PaletaTema]
    const achado = texto.match(new RegExp(`${variavel}:\\s*(#[0-9a-fA-F]{6})`))
    if (!achado) erros.push(`${seletor}: falta ${variavel}`)
    else if (achado[1].toLowerCase() !== cor.toLowerCase()) {
      erros.push(`${seletor}: ${variavel} é ${achado[1]}, temas.ts diz ${cor}`)
    }
  }
}

conferir(":root[data-tema='escuro']", VELVET_DARKNESS)
conferir(":root[data-tema='escuro'] body.alto-contraste", VELVET_DARKNESS_ALTO_CONTRASTE)

function luminancia(hex: string) {
  const canais = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [vermelho, verde, azul] = canais.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * vermelho + 0.7152 * verde + 0.0722 * azul
}

function contraste(a: string, b: string) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claro + 0.05) / (escuro + 0.05)
}

const TEXTO = 4.5
const NAO_TEXTO = 3

function pares(paleta: PaletaTema, nome: string) {
  const verificar: [keyof PaletaTema, keyof PaletaTema, number][] = [
    ['text', 'background', TEXTO],
    ['text', 'surface', TEXTO],
    ['text', 'surfaceAlt', TEXTO],
    ['text', 'navBackground', TEXTO],
    ['textMuted', 'background', TEXTO],
    ['textMuted', 'surface', TEXTO],
    ['textMuted', 'surfaceAlt', TEXTO],
    ['primary', 'background', TEXTO],
    ['primary', 'surface', TEXTO],
    ['primary', 'navBackground', TEXTO],
    ['onPrimary', 'primary', TEXTO],
    ['secondaryText', 'surface', TEXTO],
    ['accent', 'surface', TEXTO],
    ['accent', 'accentSoft', TEXTO],
    ['danger', 'surface', TEXTO],
    ['danger', 'dangerSoft', TEXTO],
    ['success', 'surface', TEXTO],
    ['success', 'successSoft', TEXTO],
    ['warning', 'surface', TEXTO],
    ['warning', 'warningSoft', TEXTO],
    ['primary', 'primarySoft', TEXTO],
    ['borderControl', 'surface', NAO_TEXTO],
    ['borderControl', 'surfaceAlt', NAO_TEXTO],
    ['focus', 'background', NAO_TEXTO],
    ['focus', 'surface', NAO_TEXTO],
    ['secondary', 'surface', NAO_TEXTO],
  ]
  for (const [frente, fundo, minimo] of verificar) {
    const razao = contraste(paleta[frente], paleta[fundo])
    if (razao < minimo) {
      erros.push(`${nome}: ${frente} sobre ${fundo} = ${razao.toFixed(2)}:1 (mínimo ${minimo}:1)`)
    }
  }
}

pares(VELVET_DARKNESS, 'Velvet Darkness')
const comAltoContraste = { ...VELVET_DARKNESS, ...VELVET_DARKNESS_ALTO_CONTRASTE }
pares(comAltoContraste, 'Velvet Darkness + Alto contraste')
if (contraste(comAltoContraste.border, comAltoContraste.surface) < NAO_TEXTO) {
  erros.push('Velvet Darkness + Alto contraste: border sobre surface abaixo de 3:1')
}

if (erros.length) {
  console.error(`Tema com problema (${erros.length}):\n${erros.join('\n')}`)
  process.exit(1)
}
console.log('Tema ok: Velvet Darkness bate com temas.ts e passa no WCAG AA.')
