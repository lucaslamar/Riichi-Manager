/**
 * Gera as pedras pretas do tema escuro (public/tiles/black-rosa e
 * black-rosa-png-240) a partir das pretas: o amarelo, o vermelho do 5 vermelho e
 * o branco dos ventos e do dragão verde viram o rosa do botão Kan no tema escuro (--cor-destaque).
 * O Leste vermelho (Ton-Vermelho) continua vermelho, para se destacar dos outros.
 *
 * Rodar da raiz do projeto: npx tsx scripts/gerar-pedras-rosa.ts
 */
import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'

const ROSA = '#e06ab0'
const ORIGEM = 'public/tiles/black'
const DESTINO = 'public/tiles/black-rosa'
const ORIGEM_PNG = 'public/tiles/black-png-240'
const DESTINO_PNG = 'public/tiles/black-rosa-png-240'

/** Pedras em que o traço branco também vira rosa: os ventos e o dragão verde. */
const VENTOS = new Set(['Ton', 'Nan', 'Shaa', 'Pei', 'Hatsu'])
const SEM_MUDANCA = new Set(['Ton-Vermelho'])

type Hsl = [number, number, number]

function rgbParaHsl(r: number, g: number, b: number): Hsl {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return [h, s, l]
}

function hslParaRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

const hex = (cor: string): [number, number, number] => [
  parseInt(cor.slice(1, 3), 16),
  parseInt(cor.slice(3, 5), 16),
  parseInt(cor.slice(5, 7), 16),
]

const [HR, SR, LR] = rgbParaHsl(...hex(ROSA))
const [, SA, LA] = rgbParaHsl(...hex('#f0a023'))
const [, SV, LV] = rgbParaHsl(...hex('#d71e1e'))

/** Amarelo ou vermelho (com as bordas suavizadas) viram rosa, mantendo a proporção de cor e luz. */
function recolorir(r: number, g: number, b: number, vento: boolean): [number, number, number] | null {
  const [h, s, l] = rgbParaHsl(r, g, b)
  if (s > 0.3 && h >= 18 && h <= 58) {
    return hslParaRgb(HR, Math.min(1, (s * SR) / SA), Math.min(0.92, (l * LR) / LA))
  }
  if (s > 0.35 && (h >= 345 || h <= 12)) {
    return hslParaRgb(HR, Math.min(1, (s * SR) / SV), Math.min(0.92, (l * LR) / LV))
  }
  // Ventos: o traço branco vira rosa; o cinza das bordas suavizadas, um rosa mais escuro.
  if (vento && s < 0.2 && l > 0.3) {
    const forca = Math.min(1, (l - 0.15) / 0.85)
    return hslParaRgb(HR, SR, Math.min(0.92, LR * forca + 0.13 * (1 - forca)))
  }
  return null
}

function gerarSvg(arquivo: string) {
  const nome = path.basename(arquivo, '.svg')
  let svg = fs.readFileSync(path.join(ORIGEM, arquivo), 'utf8')
  if (!SEM_MUDANCA.has(nome)) {
    svg = svg.replace(/#f0a023/gi, ROSA).replace(/#d71e1e/gi, ROSA)
    if (VENTOS.has(nome)) svg = svg.replace(/fill:#ffffff/gi, `fill:${ROSA}`)
  }
  fs.writeFileSync(path.join(DESTINO, arquivo), svg)
}

function gerarPng(arquivo: string) {
  const nome = path.basename(arquivo, '.png')
  const png = PNG.sync.read(fs.readFileSync(path.join(ORIGEM_PNG, arquivo)))
  if (!SEM_MUDANCA.has(nome)) {
    // Só dentro da borda da pedra: o contorno não é traço do vento.
    const margem = Math.round(png.width * 0.03)
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const i = (png.width * y + x) * 4
        if (png.data[i + 3] === 0) continue
        const dentro = x > margem && x < png.width - margem && y > margem && y < png.height - margem
        const novo = recolorir(png.data[i], png.data[i + 1], png.data[i + 2], VENTOS.has(nome) && dentro)
        if (novo) [png.data[i], png.data[i + 1], png.data[i + 2]] = novo
      }
    }
  }
  fs.writeFileSync(path.join(DESTINO_PNG, arquivo), PNG.sync.write(png))
}

fs.mkdirSync(DESTINO, { recursive: true })
fs.mkdirSync(DESTINO_PNG, { recursive: true })
for (const arquivo of fs.readdirSync(ORIGEM).filter((nome) => nome.endsWith('.svg'))) gerarSvg(arquivo)
for (const arquivo of fs.readdirSync(ORIGEM_PNG).filter((nome) => nome.endsWith('.png'))) gerarPng(arquivo)
console.log('Pedras rosa geradas em', DESTINO, 'e', DESTINO_PNG)
