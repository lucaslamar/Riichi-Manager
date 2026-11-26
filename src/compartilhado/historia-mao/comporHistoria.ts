/**
 * Imagem da mão para os Stories (1080×1920): a foto que a pessoa tirou é a
 * protagonista, com o resultado do app e a assinatura com o QR. As pedras do app
 * não se repetem, porque a foto já mostra a mão. Recebe tudo por argumento
 * (foto, textos e cores) e só usa um canvas fora da tela, para o React Native
 * trocar apenas o desenho.
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
const QUIETA_QR = 16

export type LayoutHistoria = 'foto' | 'resultado' | 'cabine'

export interface DadosHistoria {
  /** Mangan, Haneman, Yakuman... */
  patamar?: string
  /** "4 han 30 fu" ou "12 fan". */
  resumo: string
  /** Yaku ou fan na ordem do resultado, com o valor já escrito ("6 han", "8 fan"). */
  yaku: YakuHistoria[]
  pontos: string
  /** "Ron" ou "Tsumo". */
  forma: string
  vencedor?: string
}

export interface YakuHistoria {
  nome: string
  valor: string
}

export interface TemaHistoria {
  superficie: string
  texto: string
  textoSuave: string
  destaque: string
  /** Cor dos pontos e dos valores, e o fundo dos cartões, como no Resultado do app. */
  primario: string
  cartao: string
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

  const [logo, { create }] = await Promise.all([carregarImagem(opcoes.logo), import('qrcode')])
  const desenho = { ...opcoes, qr: create(opcoes.url, { errorCorrectionLevel: 'M' }).modules }
  if (opcoes.layout === 'foto') desenharFotoCheia(contexto, foto, dados, logo, desenho)
  else if (opcoes.layout === 'cabine') desenharCabine(contexto, foto, dados, logo, desenho)
  else desenharFotoNaFaixa(contexto, foto, dados, logo, desenho)

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

/** Logo que não carrega fica de fora: a imagem sai mesmo assim. */
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

/** Foto em toda a tela e o cartão do resultado com a assinatura por cima, embaixo. */
function desenharFotoCheia(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  logo: HTMLImageElement | null,
  opcoes: OpcoesDesenho,
) {
  const { tema } = opcoes
  const x = SAFE_SIDE
  const largura = LARGURA - SAFE_SIDE * 2
  const respiro = 40
  const interna = largura - respiro * 2
  const ladoQr = 200
  const alturaAssinatura = ladoQr + QUIETA_QR * 2
  const altura = respiro + alturaDoResultado(dados, 1) + 32 + alturaAssinatura + respiro
  const y = LIMITE_BAIXO - altura

  if (foto.width > foto.height) {
    // Foto deitada (a mão em fila): inteira acima do cartão, sem cortar os lados.
    desenharFundoDesfocado(contexto, foto)
    desenharContido(contexto, foto, 0, 0, LARGURA, y - 24)
  } else {
    desenharCobrindo(contexto, foto, 0, 0, LARGURA, ALTURA)
    const gradiente = contexto.createLinearGradient(0, ALTURA * 0.6, 0, ALTURA)
    gradiente.addColorStop(0, 'rgba(0,0,0,0)')
    gradiente.addColorStop(1, 'rgba(0,0,0,0.45)')
    contexto.fillStyle = gradiente
    contexto.fillRect(0, ALTURA * 0.6, LARGURA, ALTURA * 0.4)
  }

  contexto.save()
  contexto.globalAlpha = 0.92
  contexto.fillStyle = tema.superficie
  retanguloArredondado(contexto, x, y, largura, altura, 40)
  contexto.fill()
  contexto.restore()

  let cursor = desenharResultado(contexto, dados, opcoes, x + respiro, y + respiro, interna, 1)
  cursor += 32
  desenharSeparador(contexto, tema, x + respiro, cursor - 16, interna)
  desenharAssinatura(contexto, opcoes, logo, x + respiro, cursor, interna, ladoQr)
}

/** Fundo do tema, a foto em 4:3 na largura toda e o resultado grande embaixo. */
function desenharFotoNaFaixa(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  logo: HTMLImageElement | null,
  opcoes: OpcoesDesenho,
) {
  const { tema } = opcoes
  contexto.fillStyle = tema.superficie
  contexto.fillRect(0, 0, LARGURA, ALTURA)

  const interna = LARGURA - SAFE_SIDE * 2
  const alturaFoto = 420
  contexto.save()
  contexto.fillStyle = '#ffffff'
  retanguloArredondado(contexto, SAFE_SIDE - 4, SAFE_TOP - 4, interna + 8, alturaFoto + 8, 36)
  contexto.fill()
  retanguloArredondado(contexto, SAFE_SIDE, SAFE_TOP, interna, alturaFoto, 32)
  contexto.clip()
  desenharCobrindo(contexto, foto, SAFE_SIDE, SAFE_TOP, interna, alturaFoto)
  contexto.restore()

  const ladoQr = 220
  const yAssinatura = LIMITE_BAIXO - ladoQr - QUIETA_QR * 2
  const topo = SAFE_TOP + alturaFoto
  const livre = yAssinatura - 24 - topo
  // O maior tamanho (até 20% acima do normal) que cabe entre a foto e a assinatura, com 24px de folga.
  const fixa = alturaDoResultado(dados, 0)
  const escala = Math.min(1.2, (livre - 48 - fixa) / (alturaDoResultado(dados, 1) - fixa))
  const cursor = topo + (livre - alturaDoResultado(dados, escala)) / 2
  desenharResultado(contexto, dados, opcoes, SAFE_SIDE, cursor, interna, escala)

  desenharSeparador(contexto, tema, SAFE_SIDE, yAssinatura - 24, interna)
  desenharAssinatura(contexto, opcoes, logo, SAFE_SIDE, yAssinatura, interna, ladoQr)
}

const FONTE_SERIFADA = 'Georgia, "Times New Roman", serif'

/**
 * Estilo Cabine, com cara de cabine de fotos. A foto tirada é a protagonista e
 * as pedras do app não se repetem: ela já mostra a mão. Foto deitada (a mão em
 * fila) vai inteira na largura, com o resultado embaixo em duas colunas. Foto em
 * pé vai grande à esquerda, com o resultado na coluna ao lado. Os yaku vão
 * nos mesmos cartões do Resultado.
 */
function desenharCabine(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  logo: HTMLImageElement | null,
  opcoes: OpcoesDesenho,
) {
  const { tema } = opcoes
  contexto.fillStyle = tema.superficie
  contexto.fillRect(0, 0, LARGURA, ALTURA)

  const interna = LARGURA - SAFE_SIDE * 2
  const ladoQr = 200
  const yAssinatura = LIMITE_BAIXO - ladoQr - QUIETA_QR * 2
  const fimConteudo = yAssinatura - 36

  if (foto.width > foto.height) {
    const alturaFoto = Math.round(interna * 0.75)
    desenharFotoCabine(contexto, foto, SAFE_SIDE, SAFE_TOP, interna, alturaFoto)
    const topo = SAFE_TOP + alturaFoto + 36
    const meia = (interna - 36) / 2
    desenharPlacarCabine(contexto, dados, opcoes, SAFE_SIDE, topo, meia)
    desenharNomesCabine(contexto, dados, opcoes, SAFE_SIDE + meia + 36, topo + 10, meia)
  } else {
    const larguraFoto = 620
    desenharFotoCabine(contexto, foto, SAFE_SIDE, SAFE_TOP, larguraFoto, fimConteudo - SAFE_TOP)
    const xLado = SAFE_SIDE + larguraFoto + 36
    const larguraLado = LARGURA - SAFE_SIDE - xLado
    const fim = desenharPlacarCabine(contexto, dados, opcoes, xLado, SAFE_TOP, larguraLado)
    desenharNomesCabine(contexto, dados, opcoes, xLado, fim + 24, larguraLado)
  }

  desenharSeparador(contexto, tema, SAFE_SIDE, yAssinatura - 18, interna)
  desenharAssinatura(contexto, opcoes, logo, SAFE_SIDE, yAssinatura, interna, ladoQr)
}

function desenharFotoCabine(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  contexto.save()
  retanguloArredondado(contexto, x, y, largura, altura, 8)
  contexto.clip()
  desenharCobrindo(contexto, foto, x, y, largura, altura)
  contexto.restore()
}

/**
 * Escreve linha a linha, quebrando no espaço; devolve onde terminou. Palavra
 * maior que a largura ("Sanbaiman" na coluna estreita) diminui a letra em vez
 * de ser cortada.
 */
function escreverQuebrando(
  contexto: CanvasRenderingContext2D,
  texto: string,
  fonte: string,
  cor: string,
  x: number,
  y: number,
  largura: number,
  alturaLinha: number,
) {
  contexto.font = fonte
  const maiorPalavra = Math.max(
    ...(temCjk(texto)
      ? [0]
      : texto.split(' ').map((palavra) => contexto.measureText(palavra).width)),
  )
  const reducao = maiorPalavra > largura ? largura / maiorPalavra : 1
  if (reducao < 1) {
    contexto.font = fonte.replace(
      /(\d+)px/,
      (_, px: string) => `${Math.floor(Number(px) * reducao)}px`,
    )
  }
  contexto.fillStyle = cor
  contexto.textAlign = 'left'
  contexto.textBaseline = 'top'
  let cursor = y
  for (const linha of quebrarLinhas(contexto, texto, largura)) {
    contexto.fillText(linha, x, cursor)
    cursor += alturaLinha * reducao
  }
  return cursor
}

/** Patamar, quem bateu, pontos, ron/tsumo e han/fu, em letra serifada. */
function desenharPlacarCabine(
  contexto: CanvasRenderingContext2D,
  dados: DadosHistoria,
  { tema }: OpcoesDesenho,
  x: number,
  y: number,
  largura: number,
) {
  let cursor = y
  if (dados.patamar) {
    cursor = escreverQuebrando(
      contexto,
      dados.patamar,
      `700 60px ${FONTE_SERIFADA}`,
      tema.destaque,
      x,
      cursor,
      largura,
      70,
    )
    cursor += 8
  }
  if (dados.vencedor) {
    cursor = escreverQuebrando(
      contexto,
      dados.vencedor,
      `700 36px ${FONTE}`,
      tema.texto,
      x,
      cursor,
      largura,
      46,
    )
  }
  cursor = escreverQuebrando(
    contexto,
    dados.pontos,
    `700 80px ${FONTE_SERIFADA}`,
    tema.texto,
    x,
    cursor,
    largura,
    92,
  )
  cursor = escreverQuebrando(
    contexto,
    dados.forma.toUpperCase(),
    `700 36px ${FONTE}`,
    tema.destaque,
    x,
    cursor,
    largura,
    52,
  )
  if (resumoVisivel(dados)) {
    cursor = escreverQuebrando(
      contexto,
      dados.resumo,
      `500 30px ${FONTE}`,
      tema.textoSuave,
      x,
      cursor,
      largura,
      42,
    )
  }
  return cursor
}

/** Os yaku nos mesmos cartões do Resultado, com o valor à direita. */
function desenharNomesCabine(
  contexto: CanvasRenderingContext2D,
  dados: DadosHistoria,
  { tema, textos }: OpcoesDesenho,
  x: number,
  y: number,
  largura: number,
) {
  desenharCartoesYaku(contexto, cartoesDeYaku(dados, textos), tema, x, y, largura)
}

/** Japonês, chinês ou coreano: dá para quebrar entre caracteres. */
function temCjk(texto: string) {
  return /[぀-ヿ㐀-鿿가-힯]/.test(texto)
}

/** Quebra o texto em linhas que cabem na largura (por espaço, ou por letra em CJK). */
function quebrarLinhas(
  contexto: CanvasRenderingContext2D,
  texto: string,
  largura: number,
): string[] {
  // Só japonês, chinês e coreano quebram por caractere; palavra sem espaço fica inteira.
  const separador = temCjk(texto) && !texto.includes(' ') ? '' : ' '
  const linhas: string[] = []
  let atual = ''
  for (const parte of texto.split(separador)) {
    const junto = atual ? atual + separador + parte : parte
    if (atual && contexto.measureText(junto).width > largura) {
      linhas.push(atual)
      atual = parte
    } else {
      atual = junto
    }
  }
  return (atual ? [...linhas, atual] : linhas).map((linha) => caber(contexto, linha, largura))
}

/** A foto ampliada, desfocada e escurecida, para preencher o fundo sem barras. */
function desenharFundoDesfocado(contexto: CanvasRenderingContext2D, foto: ImageBitmap) {
  contexto.save()
  contexto.filter = 'blur(40px)'
  desenharCobrindo(contexto, foto, -80, -80, LARGURA + 160, ALTURA + 160)
  contexto.restore()
  contexto.fillStyle = 'rgba(0,0,0,0.35)'
  contexto.fillRect(0, 0, LARGURA, ALTURA)
}

/** A foto inteira, centralizada no espaço, sem cortar. */
function desenharContido(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  const escala = Math.min(largura / foto.width, altura / foto.height)
  const larguraFinal = foto.width * escala
  const alturaFinal = foto.height * escala
  contexto.drawImage(
    foto,
    x + (largura - larguraFinal) / 2,
    y + (altura - alturaFinal) / 2,
    larguraFinal,
    alturaFinal,
  )
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

/** Han/fu some quando só repete o patamar (ex.: "Yakuman" duas vezes). */
function resumoVisivel(dados: DadosHistoria) {
  return dados.resumo.toLowerCase() !== (dados.patamar ?? '').toLowerCase()
}

const ALTURA_CARTAO_YAKU = 56
const ESPACO_CARTOES = 8

/** Os cartões que cabem: até 4 yaku; com mais, 3 e um "+N". */
function cartoesDeYaku(dados: DadosHistoria, textos: TextosHistoria): YakuHistoria[] {
  if (dados.yaku.length <= MAX_NOMES) return dados.yaku
  const resto = dados.yaku.length - (MAX_NOMES - 1)
  return [...dados.yaku.slice(0, MAX_NOMES - 1), { nome: textos.mais(resto), valor: '' }]
}

/** Mesma soma das linhas de `desenharResultado`. */
function alturaDoResultado(dados: DadosHistoria, escala: number) {
  const linhasDeCartoes = Math.min(dados.yaku.length, MAX_NOMES)
  return (
    (dados.patamar ? 64 * escala : 0) +
    64 +
    (dados.vencedor ? 50 : 0) +
    (resumoVisivel(dados) ? 46 : 0) +
    132 * escala +
    (linhasDeCartoes > 0 ? 16 + linhasDeCartoes * (ALTURA_CARTAO_YAKU + ESPACO_CARTOES) : 0)
  )
}

/**
 * Bloco do resultado com o visual do Resultado do app, sem os pagamentos:
 * patamar, a pílula do Ron/Tsumo, quem bateu, han/fu, os pontos grandes na cor
 * primária e os yaku em cartões, um embaixo do outro, com o valor à direita.
 * Devolve onde terminou.
 */
function desenharResultado(
  contexto: CanvasRenderingContext2D,
  dados: DadosHistoria,
  { tema, textos }: OpcoesDesenho,
  x: number,
  y: number,
  largura: number,
  escala: number,
) {
  const meio = x + largura / 2
  contexto.textAlign = 'center'
  contexto.textBaseline = 'top'
  let cursor = y
  const escrever = (texto: string, fonte: string, cor: string, altura: number) => {
    contexto.font = `${fonte} ${FONTE}`
    contexto.fillStyle = cor
    contexto.fillText(caber(contexto, texto, largura), meio, cursor)
    cursor += altura
  }

  if (dados.patamar)
    escrever(dados.patamar, `500 ${Math.round(52 * escala)}px`, tema.texto, 64 * escala)

  // Pílula do Ron/Tsumo, como as dos ventos no Resultado.
  contexto.font = `700 28px ${FONTE}`
  const forma = dados.forma.toUpperCase()
  const larguraPilula = contexto.measureText(forma).width + 48
  retanguloArredondado(contexto, meio - larguraPilula / 2, cursor, larguraPilula, 48, 24)
  contexto.fillStyle = tema.cartao
  contexto.fill()
  contexto.fillStyle = tema.primario
  contexto.textBaseline = 'middle'
  contexto.fillText(forma, meio, cursor + 25)
  contexto.textBaseline = 'top'
  cursor += 64

  if (dados.vencedor) escrever(dados.vencedor, '800 36px', tema.texto, 50)
  if (resumoVisivel(dados)) escrever(dados.resumo, '500 32px', tema.texto, 46)
  escrever(dados.pontos, `900 ${Math.round(120 * escala)}px`, tema.primario, 132 * escala)

  const cartoes = cartoesDeYaku(dados, textos)
  if (cartoes.length === 0) {
    contexto.textAlign = 'left'
    return cursor
  }
  cursor += 16
  cursor = desenharCartoesYaku(contexto, cartoes, tema, x, cursor, largura)
  contexto.textAlign = 'left'
  return cursor
}

/** Cartões de yaku um embaixo do outro, como a lista do Resultado. Devolve onde terminou. */
function desenharCartoesYaku(
  contexto: CanvasRenderingContext2D,
  cartoes: YakuHistoria[],
  tema: TemaHistoria,
  x: number,
  y: number,
  largura: number,
) {
  // Coluna estreita (Cabine com foto em pé): letra menor para nome e valor caberem.
  const estreita = largura < 500
  cartoes.forEach((yaku, indice) => {
    const yCartao = y + indice * (ALTURA_CARTAO_YAKU + ESPACO_CARTOES)
    retanguloArredondado(contexto, x, yCartao, largura, ALTURA_CARTAO_YAKU, 14)
    contexto.fillStyle = tema.cartao
    contexto.fill()
    contexto.textBaseline = 'middle'
    const meioCartao = yCartao + ALTURA_CARTAO_YAKU / 2 + 1
    contexto.font = `700 ${estreita ? 22 : 26}px ${FONTE}`
    const larguraValor = yaku.valor ? contexto.measureText(yaku.valor).width : 0
    contexto.textAlign = 'right'
    contexto.fillStyle = tema.primario
    if (yaku.valor) contexto.fillText(yaku.valor, x + largura - 18, meioCartao)
    contexto.textAlign = 'left'
    contexto.font = `700 ${estreita ? 24 : 28}px ${FONTE}`
    contexto.fillStyle = tema.texto
    const larguraNome = largura - 36 - (larguraValor ? larguraValor + 12 : 0)
    contexto.fillText(caber(contexto, yaku.nome, larguraNome), x + 18, meioCartao)
    contexto.textBaseline = 'top'
  })
  return y + cartoes.length * (ALTURA_CARTAO_YAKU + ESPACO_CARTOES)
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
