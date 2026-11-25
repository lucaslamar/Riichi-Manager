/**
 * Imagem da mão para os Stories (1080×1920): a foto da mesa e o resultado do
 * app. Recebe tudo por argumento (foto, textos, cores e endereços das pedras) e
 * só usa um canvas fora da tela, para o React Native trocar apenas o desenho.
 */
import type { QRCode } from 'qrcode'

/** Opções com o QR já calculado (a biblioteca só carrega na hora de montar). */
type OpcoesDesenho = OpcoesHistoria & { qr: QRCode['modules'] }

export const LARGURA = 1080
export const ALTURA = 1920
/** Áreas que o Instagram cobre nos Stories: topo (perfil), base (resposta) e lados. */
export const SAFE_TOP = 250
export const SAFE_BOTTOM = 340
export const SAFE_SIDE = 48
/** Linha extra da assinatura (site ou @), vazia por enquanto. */
export const SHARE_HANDLE = ''

const LIMITE_BAIXO = ALTURA - SAFE_BOTTOM
const FONTE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const MAX_NOMES = 4
const ESPACO_BATIDA = 24
const ESPACO_GRUPO = 16
const QUIETA_QR = 16

export type LayoutHistoria = 'foto' | 'resultado'

export interface DadosHistoria {
  /** Endereços das pedras da mão fechada, sem a da batida. */
  mao: string[]
  /** Pedra da batida, separada no fim. */
  batida: string | null
  /** Conjuntos abertos e flores, cada um um grupo. */
  grupos: string[][]
  /** Mangan, Haneman, Yakuman... */
  patamar?: string
  /** "4 han 30 fu" ou "12 fan". */
  resumo: string
  /** Nomes dos yaku ou fan, na ordem do resultado. */
  nomes: string[]
  pontos: string
  /** "Ron" ou "Tsumo". */
  forma: string
  vencedor?: string
}

export interface TemaHistoria {
  superficie: string
  texto: string
  textoSuave: string
  destaque: string
  /** Face e borda das pedras (as artes são transparentes, como na tela). */
  pedraFace: string
  pedraBorda: string
}

export interface TextosHistoria {
  nomeApp: string
  convite: string
  data: string
  /** "+2" quando há mais nomes que cabem. */
  mais: (quantos: number) => string
}

export interface OpcoesHistoria {
  layout: LayoutHistoria
  tema: TemaHistoria
  textos: TextosHistoria
  /** Endereço que o QR abre. */
  url: string
  logo: string
}

export async function comporHistoria(
  foto: ImageBitmap,
  dados: DadosHistoria,
  opcoes: OpcoesHistoria,
): Promise<Blob> {
  await document.fonts?.ready
  const tela = document.createElement('canvas')
  tela.width = LARGURA
  tela.height = ALTURA
  const contexto = tela.getContext('2d')
  if (!contexto) throw new Error('Canvas indisponível')

  const [pedras, logo, { create }] = await Promise.all([
    carregarPedras(dados),
    carregarImagem(opcoes.logo),
    import('qrcode'),
  ])
  const desenho = { ...opcoes, qr: create(opcoes.url, { errorCorrectionLevel: 'M' }).modules }
  if (opcoes.layout === 'foto') desenharFocoFoto(contexto, foto, dados, pedras, logo, desenho)
  else desenharFocoResultado(contexto, foto, dados, pedras, logo, desenho)

  return new Promise((resolver, rejeitar) =>
    tela.toBlob(
      (blob) => (blob ? resolver(blob) : rejeitar(new Error('Imagem vazia'))),
      'image/jpeg',
      0.9,
    ),
  )
}

export function nomeDoArquivo(agora: Date): string {
  const dois = (valor: number) => String(valor).padStart(2, '0')
  const dia = `${agora.getFullYear()}${dois(agora.getMonth() + 1)}${dois(agora.getDate())}`
  return `riichi-manager-${dia}-${dois(agora.getHours())}${dois(agora.getMinutes())}.jpg`
}

interface Pedras {
  mao: (HTMLImageElement | null)[]
  batida: HTMLImageElement | null
  grupos: (HTMLImageElement | null)[][]
}

async function carregarPedras(dados: DadosHistoria): Promise<Pedras> {
  const carregar = (lista: string[]) => Promise.all(lista.map(carregarImagem))
  const [mao, batida, grupos] = await Promise.all([
    carregar(dados.mao),
    dados.batida ? carregarImagem(dados.batida) : null,
    Promise.all(dados.grupos.map(carregar)),
  ])
  return { mao, batida, grupos }
}

/** Pedra que não carrega vira um espaço vazio: a imagem sai mesmo assim. */
async function carregarImagem(endereco: string): Promise<HTMLImageElement | null> {
  const imagem = new Image()
  imagem.src = endereco
  try {
    await imagem.decode()
    return imagem
  } catch {
    return null
  }
}

function desenharFocoFoto(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  pedras: Pedras,
  logo: HTMLImageElement | null,
  opcoes: OpcoesDesenho,
) {
  desenharCobrindo(contexto, foto, 0, 0, LARGURA, ALTURA)
  const gradiente = contexto.createLinearGradient(0, ALTURA * 0.6, 0, ALTURA)
  gradiente.addColorStop(0, 'rgba(0,0,0,0)')
  gradiente.addColorStop(1, 'rgba(0,0,0,0.45)')
  contexto.fillStyle = gradiente
  contexto.fillRect(0, ALTURA * 0.6, LARGURA, ALTURA * 0.4)

  const { tema } = opcoes
  const x = SAFE_SIDE
  const largura = LARGURA - SAFE_SIDE * 2
  const respiro = 40
  const interna = largura - respiro * 2
  const alturaPedra = alturaDasPedras(pedras, interna, 96)
  const ladoQr = 200
  const alturaAssinatura = ladoQr + QUIETA_QR * 2
  const linhasTexto = alturaDosTextos(dados)
  const altura = respiro + alturaPedra + 32 + linhasTexto + 32 + alturaAssinatura + respiro
  const y = LIMITE_BAIXO - altura

  contexto.save()
  contexto.globalAlpha = 0.92
  contexto.fillStyle = tema.superficie
  retanguloArredondado(contexto, x, y, largura, altura, 40)
  contexto.fill()
  contexto.restore()

  let cursor = y + respiro
  desenharPedras(contexto, tema, pedras, x + respiro, cursor, interna, alturaPedra, 'inicio')
  cursor += alturaPedra + 32
  cursor = desenharTextos(contexto, dados, opcoes, x + respiro, cursor, interna, 'inicio')
  cursor += 32
  desenharSeparador(contexto, tema, x + respiro, cursor - 16, interna)
  desenharAssinatura(contexto, opcoes, logo, x + respiro, cursor, interna, ladoQr)
}

function desenharFocoResultado(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  pedras: Pedras,
  logo: HTMLImageElement | null,
  opcoes: OpcoesDesenho,
) {
  const { tema } = opcoes
  contexto.fillStyle = tema.superficie
  contexto.fillRect(0, 0, LARGURA, ALTURA)

  // Foto pequena no canto, com borda branca.
  const [larguraFoto, alturaFoto] = [360, 480]
  contexto.save()
  contexto.fillStyle = '#ffffff'
  retanguloArredondado(contexto, SAFE_SIDE - 4, SAFE_TOP - 4, larguraFoto + 8, alturaFoto + 8, 36)
  contexto.fill()
  retanguloArredondado(contexto, SAFE_SIDE, SAFE_TOP, larguraFoto, alturaFoto, 32)
  contexto.clip()
  desenharCobrindo(contexto, foto, SAFE_SIDE, SAFE_TOP, larguraFoto, alturaFoto)
  contexto.restore()

  const interna = LARGURA - SAFE_SIDE * 2
  const alturaPedra = alturaDasPedras(pedras, interna, 120)
  const ladoQr = 220
  const yAssinatura = LIMITE_BAIXO - ladoQr - QUIETA_QR * 2

  // Pedras e textos no meio do espaço entre a foto e a assinatura.
  const bloco = alturaPedra + 48 + alturaDosTextos(dados)
  const livre = yAssinatura - 24 - (SAFE_TOP + alturaFoto)
  let cursor = SAFE_TOP + alturaFoto + Math.max(32, (livre - bloco) / 2)
  desenharPedras(contexto, opcoes.tema, pedras, SAFE_SIDE, cursor, interna, alturaPedra, 'meio')
  cursor += alturaPedra + 48
  desenharTextos(contexto, dados, opcoes, SAFE_SIDE, cursor, interna, 'meio')

  desenharSeparador(contexto, tema, SAFE_SIDE, yAssinatura - 24, interna)
  desenharAssinatura(contexto, opcoes, logo, SAFE_SIDE, yAssinatura, interna, ladoQr)
}

/** Recorte do meio, sem esticar. */
function desenharCobrindo(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  const escala = Math.max(largura / foto.width, altura / foto.height)
  const recorteL = largura / escala
  const recorteA = altura / escala
  contexto.drawImage(
    foto,
    (foto.width - recorteL) / 2,
    (foto.height - recorteA) / 2,
    recorteL,
    recorteA,
    x,
    y,
    largura,
    altura,
  )
}

/** Proporção das artes das pedras (largura / altura). */
const PROPORCAO_PEDRA = 3 / 4

function totalDePedras(pedras: Pedras) {
  return (
    pedras.mao.length +
    (pedras.batida ? 1 : 0) +
    pedras.grupos.reduce((soma, grupo) => soma + grupo.length, 0)
  )
}

function espacos(pedras: Pedras) {
  return (pedras.batida ? ESPACO_BATIDA : 0) + pedras.grupos.length * ESPACO_GRUPO
}

/** Altura que faz a mão inteira caber numa linha, até o máximo. */
function alturaDasPedras(pedras: Pedras, largura: number, maxima: number) {
  const total = Math.max(1, totalDePedras(pedras))
  const larguraPedra = (largura - espacos(pedras)) / total
  return Math.min(maxima, Math.floor(larguraPedra / PROPORCAO_PEDRA))
}

function desenharPedras(
  contexto: CanvasRenderingContext2D,
  tema: TemaHistoria,
  pedras: Pedras,
  x: number,
  y: number,
  largura: number,
  altura: number,
  alinhar: 'inicio' | 'meio',
) {
  const larguraPedra = altura * PROPORCAO_PEDRA
  const ocupada = totalDePedras(pedras) * larguraPedra + espacos(pedras)
  let cursor = alinhar === 'meio' ? x + (largura - ocupada) / 2 : x
  const desenhar = (imagem: HTMLImageElement | null) => {
    // Face com borda e um fio de espaço entre as pedras, como o chip da tela.
    const folga = larguraPedra * 0.04
    const borda = larguraPedra * 0.045
    retanguloArredondado(
      contexto,
      cursor + folga,
      y,
      larguraPedra - folga * 2,
      altura,
      larguraPedra * 0.16,
    )
    contexto.fillStyle = tema.pedraFace
    contexto.fill()
    contexto.lineWidth = borda
    contexto.strokeStyle = tema.pedraBorda
    contexto.stroke()
    const margem = folga + borda
    if (imagem) {
      contexto.drawImage(
        imagem,
        cursor + margem,
        y + borda,
        larguraPedra - margem * 2,
        altura - borda * 2,
      )
    }
    cursor += larguraPedra
  }
  pedras.mao.forEach(desenhar)
  if (pedras.batida) {
    cursor += ESPACO_BATIDA
    desenhar(pedras.batida)
  }
  for (const grupo of pedras.grupos) {
    cursor += ESPACO_GRUPO
    grupo.forEach(desenhar)
  }
}

/** Mesma soma das linhas de `desenharTextos`. */
function alturaDosTextos(dados: DadosHistoria) {
  return (dados.patamar ? 64 : 0) + 52 + 48 + (dados.vencedor ? 52 : 0) + 104
}

/** Devolve onde o texto terminou. */
function desenharTextos(
  contexto: CanvasRenderingContext2D,
  dados: DadosHistoria,
  { tema, textos }: OpcoesDesenho,
  x: number,
  y: number,
  largura: number,
  alinhar: 'inicio' | 'meio',
) {
  const meio = alinhar === 'meio'
  const xTexto = meio ? x + largura / 2 : x
  contexto.textAlign = meio ? 'center' : 'left'
  contexto.textBaseline = 'top'
  let cursor = y

  const escrever = (texto: string, tamanho: number, peso: number, cor: string, altura: number) => {
    contexto.font = `${peso} ${tamanho}px ${FONTE}`
    contexto.fillStyle = cor
    contexto.fillText(caber(contexto, texto, largura), xTexto, cursor)
    cursor += altura
  }

  if (dados.patamar) escrever(dados.patamar.toUpperCase(), 48, 800, tema.destaque, 64)
  const nomes = dados.nomes.slice(0, MAX_NOMES).join(' · ')
  const resto = dados.nomes.length - MAX_NOMES
  escrever(resto > 0 ? `${nomes} ${textos.mais(resto)}` : nomes, 36, 600, tema.texto, 52)
  escrever(dados.resumo, 34, 500, tema.textoSuave, 48)
  if (dados.vencedor) escrever(dados.vencedor, 38, 800, tema.texto, 52)

  // Pontos grandes e a forma da batida ao lado (ou embaixo, no meio).
  contexto.font = `800 88px ${FONTE}`
  contexto.fillStyle = tema.texto
  if (meio) {
    const forma = ` ${dados.forma.toUpperCase()}`
    contexto.font = `800 88px ${FONTE}`
    const larguraPontos = contexto.measureText(dados.pontos).width
    contexto.font = `700 40px ${FONTE}`
    const larguraForma = contexto.measureText(forma).width
    const inicio = xTexto - (larguraPontos + larguraForma) / 2
    contexto.textAlign = 'left'
    contexto.font = `800 88px ${FONTE}`
    contexto.fillText(dados.pontos, inicio, cursor)
    contexto.font = `700 40px ${FONTE}`
    contexto.fillStyle = tema.destaque
    contexto.fillText(forma, inicio + larguraPontos, cursor + 40)
  } else {
    contexto.fillText(dados.pontos, x, cursor)
    contexto.font = `700 40px ${FONTE}`
    contexto.fillStyle = tema.destaque
    contexto.textAlign = 'right'
    contexto.fillText(dados.forma.toUpperCase(), x + largura, cursor + 40)
  }
  contexto.textAlign = 'left'
  return cursor + 104
}

function desenharSeparador(
  contexto: CanvasRenderingContext2D,
  tema: TemaHistoria,
  x: number,
  y: number,
  largura: number,
) {
  contexto.save()
  contexto.globalAlpha = 0.3
  contexto.fillStyle = tema.textoSuave
  contexto.fillRect(x, y, largura, 2)
  contexto.restore()
}

/** Logo, nome, convite e data à esquerda; QR escuro no branco à direita. */
function desenharAssinatura(
  contexto: CanvasRenderingContext2D,
  { tema, textos, qr }: OpcoesDesenho,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  largura: number,
  ladoQr: number,
) {
  const caixa = ladoQr + QUIETA_QR * 2
  const xQr = x + largura - caixa
  desenharQr(contexto, qr, xQr, y, ladoQr)

  const larguraTexto = largura - caixa - 24
  contexto.textAlign = 'left'
  contexto.textBaseline = 'middle'
  const meio = y + caixa / 2
  if (logo) contexto.drawImage(logo, x, meio - 70, 48, 48)
  contexto.font = `600 32px ${FONTE}`
  contexto.fillStyle = tema.texto
  contexto.fillText(caber(contexto, textos.nomeApp, larguraTexto - 64), x + 64, meio - 46)
  contexto.font = `400 28px ${FONTE}`
  contexto.fillStyle = tema.textoSuave
  contexto.fillText(caber(contexto, textos.convite, larguraTexto), x, meio + 6)
  contexto.fillText(caber(contexto, textos.data, larguraTexto), x, meio + 46)
  if (SHARE_HANDLE) contexto.fillText(caber(contexto, SHARE_HANDLE, larguraTexto), x, meio + 86)
  contexto.textBaseline = 'top'
}

/** Módulos desenhados direto no canvas, nível M, sempre escuro no branco. */
function desenharQr(
  contexto: CanvasRenderingContext2D,
  modules: QRCode['modules'],
  x: number,
  y: number,
  lado: number,
) {
  const caixa = lado + QUIETA_QR * 2
  contexto.fillStyle = '#ffffff'
  retanguloArredondado(contexto, x, y, caixa, caixa, 16)
  contexto.fill()
  const modulo = lado / modules.size
  contexto.fillStyle = '#000000'
  for (let linha = 0; linha < modules.size; linha++) {
    for (let coluna = 0; coluna < modules.size; coluna++) {
      if (!modules.get(linha, coluna)) continue
      // Arredonda as bordas de cada módulo para não sobrar fresta entre eles.
      const x0 = Math.floor(x + QUIETA_QR + coluna * modulo)
      const y0 = Math.floor(y + QUIETA_QR + linha * modulo)
      const x1 = Math.ceil(x + QUIETA_QR + (coluna + 1) * modulo)
      const y1 = Math.ceil(y + QUIETA_QR + (linha + 1) * modulo)
      contexto.fillRect(x0, y0, x1 - x0, y1 - y0)
    }
  }
}

function caber(contexto: CanvasRenderingContext2D, texto: string, largura: number): string {
  if (contexto.measureText(texto).width <= largura) return texto
  let fim = texto.length
  while (fim > 1 && contexto.measureText(`${texto.slice(0, fim)}…`).width > largura) fim--
  return `${texto.slice(0, fim)}…`
}

function retanguloArredondado(
  contexto: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  raio: number,
) {
  contexto.beginPath()
  contexto.moveTo(x + raio, y)
  contexto.arcTo(x + largura, y, x + largura, y + altura, raio)
  contexto.arcTo(x + largura, y + altura, x, y + altura, raio)
  contexto.arcTo(x, y + altura, x, y, raio)
  contexto.arcTo(x, y, x + largura, y, raio)
  contexto.closePath()
}
