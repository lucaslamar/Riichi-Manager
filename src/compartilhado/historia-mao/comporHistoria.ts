/**
 * Imagem da mão para os Stories, sempre 1080×1920, num layout só: a foto que a
 * pessoa tirou é a estrela e nunca é cortada nem coberta. Ela vai inteira no
 * topo, com a própria foto desfocada atrás para não sobrar faixa vazia. Embaixo
 * vem o resultado e, no canto, o mascote inclinado segurando a placa com o QR.
 * Recebe tudo por argumento e só usa um canvas fora da tela, separado da prévia.
 */
import type { QRCode } from 'qrcode'
import { MASCOTE_AREA_QR } from './mascote'
import {
  carregarFonteCarimbo,
  enderecoDoSvg,
  svgDoCarimbo,
  tintaDoCarimbo,
  type DadosCarimbo,
} from './carimbo'

/** Opções com o QR e a arte do mascote já carregados. */
type OpcoesDesenho = OpcoesHistoria & {
  qr: QRCode['modules']
  mascote: HTMLImageElement | null
  /** O carimbo já em imagem (o mesmo SVG da prévia). */
  carimbo: HTMLImageElement | null
}

export const LARGURA = 1080
export const ALTURA = 1920
/** Áreas que o Instagram cobre nos Stories: topo (perfil), base (resposta) e lados. */
export const SAFE_TOP = 250
export const SAFE_BOTTOM = 340
export const SAFE_SIDE = 48

const LIMITE_BAIXO = ALTURA - SAFE_BOTTOM
const FONTE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const ESPACO = 28
const MAX_YAKU = 8
/** Mascote: 400×500 (prancheta 4:5), com o QR de 160px na placa. */
const LARGURA_MASCOTE = 400
const ALTURA_MASCOTE = 500
/** Inclinação do mascote, como numa pose de vitória. Só no plano: o QR continua legível. */
const GIRO_MASCOTE = (-5 * Math.PI) / 180
/** Quanto do mascote passa da borda direita, "entrando" na imagem. */
const SAIDA_MASCOTE = 0.1
/** Carimbo à esquerda do mascote, com o centro um pouco acima da base dele. */
const DIAMETRO_CARIMBO = 300
/** Quanto do carimbo fica abaixo do resultado; o resto pode invadir a base dele (os yaku). */
const RESERVA_CARIMBO = 0.7

export interface YakuHistoria {
  nome: string
  /** Já escrito: "6 han", "8 fan". */
  valor: string
}

export interface DadosHistoria {
  /** Mangan, Haneman, Yakuman... */
  patamar?: string
  /** "4 han 30 fu" ou "12 fan". */
  resumo: string
  /** Na ordem do resultado. */
  yaku: YakuHistoria[]
  pontos: string
  /** "Ron" ou "Tsumo". */
  forma: string
  vencedor?: string
  /** Carimbo de borracha, só do Mangan para cima (no MCR não há). */
  carimbo?: DadosCarimbo
}

export interface TemaHistoria {
  superficie: string
  texto: string
  textoSuave: string
  /** Cor dos pontos e dos valores, e o fundo das pílulas, como no Resultado do app. */
  primario: string
  cartao: string
}

export interface OpcoesHistoria {
  tema: TemaHistoria
  /** Endereço que o QR abre. */
  url: string
  /** Arte do mascote com a placa (`MASCOTE_QR_SRC`). */
  mascoteSrc: string
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

  const [{ create }, mascote, carimbo] = await Promise.all([
    import('qrcode'),
    carregarImagem(opcoes.mascoteSrc),
    imagemDoCarimbo(dados.carimbo, opcoes.tema),
  ])
  const qr = create(opcoes.url, { errorCorrectionLevel: 'M' }).modules
  desenharHistoria(contexto, foto, dados, { ...opcoes, qr, mascote, carimbo })

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

/**
 * Foto inteira no topo, com o tamanho natural dela na largura toda; se faltar
 * altura, ela encolhe (sem cortar) e o fundo desfocado preenche os lados.
 * Embaixo, o resultado à esquerda e o mascote no canto direito, sem cobrir nada.
 */
function desenharHistoria(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  opcoes: OpcoesDesenho,
) {
  contexto.fillStyle = opcoes.tema.superficie
  contexto.fillRect(0, 0, LARGURA, ALTURA)

  const larguraMascoteVisivel = LARGURA_MASCOTE * (1 - SAIDA_MASCOTE)
  const larguraResultado = LARGURA - SAFE_SIDE - ESPACO - larguraMascoteVisivel
  const alturaResultado = alturaDoResultado(contexto, dados, larguraResultado, 1)
  // A maior parte do carimbo fica embaixo do resultado; a ponta de cima pode invadir os yaku.
  const reservaCarimbo = opcoes.carimbo ? DIAMETRO_CARIMBO * RESERVA_CARIMBO : 0
  // A faixa de baixo tem a altura do que for maior: o resultado (com o carimbo) ou o mascote.
  const alturaFaixa = Math.max(alturaResultado + reservaCarimbo, ALTURA_MASCOTE * 0.92)
  const topoFaixa = LIMITE_BAIXO - alturaFaixa

  const alturaNatural = (LARGURA * foto.height) / foto.width
  const alturaFoto = Math.min(alturaNatural, topoFaixa - ESPACO)
  desenharFotoInteira(contexto, foto, 0, 0, LARGURA, alturaFoto)

  desenharResultadoCabendo(
    contexto,
    dados,
    opcoes,
    SAFE_SIDE,
    alturaFoto + ESPACO,
    larguraResultado,
    LIMITE_BAIXO - reservaCarimbo,
  )
  if (opcoes.carimbo) {
    const raio = DIAMETRO_CARIMBO / 2
    contexto.save()
    contexto.translate(LARGURA - larguraMascoteVisivel - raio, LIMITE_BAIXO - raio - 4)
    // Como na prévia: tinta a 85% em tela, para os yaku continuarem legíveis por baixo.
    contexto.globalAlpha = 0.85
    contexto.globalCompositeOperation = 'screen'
    contexto.drawImage(opcoes.carimbo, -raio, -raio, DIAMETRO_CARIMBO, DIAMETRO_CARIMBO)
    contexto.restore()
  }
  // O QR (56% a 88% da altura da arte) termina dentro da área segura.
  const yMascote = LIMITE_BAIXO - ALTURA_MASCOTE * 0.92
  desenharMascote(contexto, opcoes, LARGURA - larguraMascoteVisivel, yMascote)
}

/** O carimbo em imagem, no dobro do tamanho em que é desenhado. */
async function imagemDoCarimbo(
  dados: DadosCarimbo | undefined,
  tema: TemaHistoria,
): Promise<HTMLImageElement | null> {
  if (!dados) return null
  const fonteDados = await carregarFonteCarimbo()
  const svg = svgDoCarimbo(dados, {
    tinta: tintaDoCarimbo(dados.nivel, tema.primario),
    fundo: tema.superficie,
    fonteDados,
    lado: DIAMETRO_CARIMBO * 2,
  })
  return carregarImagem(enderecoDoSvg(svg))
}

/** A foto inteira (sem cortar) no espaço, com ela mesma desfocada e escurecida atrás. */
function desenharFotoInteira(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  contexto.save()
  contexto.beginPath()
  contexto.rect(x, y, largura, altura)
  contexto.clip()
  contexto.filter = 'blur(24px) brightness(0.45)'
  const margem = Math.max(largura, altura) * 0.05
  desenharCobrindo(
    contexto,
    foto,
    x - margem,
    y - margem,
    largura + margem * 2,
    altura + margem * 2,
  )
  contexto.filter = 'none'
  const escala = Math.min(largura / foto.width, altura / foto.height)
  const [larguraFinal, alturaFinal] = [foto.width * escala, foto.height * escala]
  contexto.drawImage(
    foto,
    x + (largura - larguraFinal) / 2,
    y + (altura - alturaFinal) / 2,
    larguraFinal,
    alturaFinal,
  )
  contexto.restore()
}

/** Recorte do meio, sem esticar (só para o fundo desfocado). */
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

/**
 * O mascote inclinado, entrando pela borda direita, com o QR desenhado na placa
 * em resolução cheia (preto no branco, nas medidas de `mascote.ts`). Sem a arte
 * (não carregou), fica só o QR com uma margem branca, inclinado igual.
 */
function desenharMascote(
  contexto: CanvasRenderingContext2D,
  { qr, mascote }: OpcoesDesenho,
  x: number,
  y: number,
) {
  contexto.save()
  contexto.translate(x + LARGURA_MASCOTE / 2, y + ALTURA_MASCOTE / 2)
  contexto.rotate(GIRO_MASCOTE)
  const origemX = -LARGURA_MASCOTE / 2
  const origemY = -ALTURA_MASCOTE / 2
  const ladoQr = LARGURA_MASCOTE * MASCOTE_AREA_QR.largura
  const xQr = origemX + LARGURA_MASCOTE * MASCOTE_AREA_QR.esquerda
  const yQr = origemY + ALTURA_MASCOTE * MASCOTE_AREA_QR.topo
  if (mascote) {
    contexto.drawImage(mascote, origemX, origemY, LARGURA_MASCOTE, ALTURA_MASCOTE)
  } else {
    contexto.fillStyle = '#ffffff'
    retanguloArredondado(contexto, xQr - 24, yQr - 24, ladoQr + 48, ladoQr + 48, 16)
    contexto.fill()
  }
  desenharQr(contexto, qr, xQr, yQr, ladoQr)
  contexto.restore()
}

/** Han/fu some quando só repete o patamar (ex.: "Yakuman" duas vezes). */
function resumoVisivel(dados: DadosHistoria) {
  return dados.resumo.toLowerCase() !== (dados.patamar ?? '').toLowerCase()
}

/**
 * O bloco do resultado no maior tamanho que cabe entre `topo` e `fim` (até
 * `escalaMaxima`), centralizado na altura.
 */
function desenharResultadoCabendo(
  contexto: CanvasRenderingContext2D,
  dados: DadosHistoria,
  opcoes: OpcoesDesenho,
  x: number,
  topo: number,
  largura: number,
  fim: number,
  escalaMaxima = 1.2,
) {
  const livre = fim - topo
  const fixa = alturaDoResultado(contexto, dados, largura, 0)
  const porEscala = alturaDoResultado(contexto, dados, largura, 1) - fixa
  const escala = Math.max(0.6, Math.min(escalaMaxima, (livre - fixa) / porEscala))
  const sobra = livre - alturaDoResultado(contexto, dados, largura, escala)
  desenharResultado(contexto, dados, opcoes, x, topo + Math.max(0, sobra / 2), largura, escala)
}

/** Mesma soma das linhas de `desenharResultado`. */
function alturaDoResultado(
  contexto: CanvasRenderingContext2D,
  dados: DadosHistoria,
  largura: number,
  escala: number,
) {
  const linhasDePilulas = linhasDeYaku(contexto, pilulasDeYaku(dados), largura).length
  return (
    (dados.patamar ? 64 * escala : 0) +
    64 * escala +
    (dados.vencedor ? 50 : 0) +
    (resumoVisivel(dados) ? 46 * escala : 0) +
    132 * escala +
    (linhasDePilulas > 0 ? 20 + linhasDePilulas * (ALTURA_PILULA + ESPACO_PILULAS) : 0)
  )
}

/**
 * Bloco do resultado com o visual do Resultado do app, sem os pagamentos:
 * patamar, a pílula do Ron/Tsumo, quem bateu, han/fu, os pontos grandes na cor
 * primária e os yaku em pílulas. Devolve onde terminou.
 */
function desenharResultado(
  contexto: CanvasRenderingContext2D,
  dados: DadosHistoria,
  { tema }: OpcoesDesenho,
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

  if (dados.patamar) {
    escrever(dados.patamar, `500 ${Math.round(52 * escala)}px`, tema.texto, 64 * escala)
  }

  // Pílula do Ron/Tsumo, como as dos ventos no Resultado. Cresce com os pontos.
  contexto.font = `700 ${Math.round(28 * escala)}px ${FONTE}`
  const forma = dados.forma.toUpperCase()
  const alturaPilula = 48 * escala
  const larguraPilula = contexto.measureText(forma).width + 48 * escala
  const xPilula = meio - larguraPilula / 2
  retanguloArredondado(contexto, xPilula, cursor, larguraPilula, alturaPilula, alturaPilula / 2)
  contexto.fillStyle = tema.cartao
  contexto.fill()
  contexto.fillStyle = tema.primario
  contexto.textBaseline = 'middle'
  contexto.fillText(forma, meio, cursor + alturaPilula / 2 + 1)
  contexto.textBaseline = 'top'
  cursor += 64 * escala

  if (dados.vencedor) escrever(dados.vencedor, '800 36px', tema.texto, 50)
  if (resumoVisivel(dados)) {
    escrever(dados.resumo, `500 ${Math.round(32 * escala)}px`, tema.texto, 46 * escala)
  }
  escrever(dados.pontos, `900 ${Math.round(120 * escala)}px`, tema.primario, 132 * escala)

  const pilulas = pilulasDeYaku(dados)
  if (pilulas.length > 0) {
    cursor = desenharPilulasYaku(contexto, pilulas, tema, x, cursor + 20, largura)
  }
  contexto.textAlign = 'left'
  return cursor
}

const ALTURA_PILULA = 54
const ESPACO_PILULAS = 12
const RESPIRO_PILULA = 22
const FONTE_PILULA = `700 26px ${FONTE}`

/** Até 8 yaku; com mais, 7 e um "+N". */
function pilulasDeYaku(dados: DadosHistoria): YakuHistoria[] {
  if (dados.yaku.length <= MAX_YAKU) return dados.yaku
  const resto = dados.yaku.length - (MAX_YAKU - 1)
  return [...dados.yaku.slice(0, MAX_YAKU - 1), { nome: `+${resto}`, valor: '' }]
}

function larguraDaPilula(contexto: CanvasRenderingContext2D, yaku: YakuHistoria, maxima: number) {
  contexto.font = FONTE_PILULA
  const texto = yaku.valor ? `${yaku.nome}  ${yaku.valor}` : yaku.nome
  return Math.min(maxima, contexto.measureText(texto).width + RESPIRO_PILULA * 2)
}

/** Distribui as pílulas em linhas que cabem na largura. */
function linhasDeYaku(
  contexto: CanvasRenderingContext2D,
  pilulas: YakuHistoria[],
  largura: number,
) {
  const linhas: YakuHistoria[][] = []
  let atual: YakuHistoria[] = []
  let ocupada = 0
  for (const pilula of pilulas) {
    const comEspaco = larguraDaPilula(contexto, pilula, largura) + ESPACO_PILULAS
    if (atual.length > 0 && ocupada + comEspaco - ESPACO_PILULAS > largura) {
      linhas.push(atual)
      atual = []
      ocupada = 0
    }
    atual.push(pilula)
    ocupada += comEspaco
  }
  if (atual.length > 0) linhas.push(atual)
  return linhas
}

/**
 * Os yaku em pílulas compactas e centralizadas, com o valor na cor primária:
 * ocupam pouca altura e a foto não encolhe. Devolve onde terminou.
 */
function desenharPilulasYaku(
  contexto: CanvasRenderingContext2D,
  pilulas: YakuHistoria[],
  tema: TemaHistoria,
  x: number,
  y: number,
  largura: number,
) {
  let cursor = y
  for (const linha of linhasDeYaku(contexto, pilulas, largura)) {
    const larguras = linha.map((pilula) => larguraDaPilula(contexto, pilula, largura))
    const total =
      larguras.reduce((soma, valor) => soma + valor, 0) + ESPACO_PILULAS * (linha.length - 1)
    let xPilula = x + (largura - total) / 2
    linha.forEach((pilula, indice) => {
      const larguraPilula = larguras[indice]
      const raio = ALTURA_PILULA / 2
      retanguloArredondado(contexto, xPilula, cursor, larguraPilula, ALTURA_PILULA, raio)
      contexto.fillStyle = tema.cartao
      contexto.fill()
      contexto.font = FONTE_PILULA
      contexto.textAlign = 'left'
      contexto.textBaseline = 'middle'
      const meioY = cursor + ALTURA_PILULA / 2 + 1
      const larguraValor = pilula.valor ? contexto.measureText(`  ${pilula.valor}`).width : 0
      const larguraNome = larguraPilula - RESPIRO_PILULA * 2 - larguraValor
      const nome = caber(contexto, pilula.nome, larguraNome)
      contexto.fillStyle = tema.texto
      contexto.fillText(nome, xPilula + RESPIRO_PILULA, meioY)
      if (pilula.valor) {
        const xValor = xPilula + RESPIRO_PILULA + contexto.measureText(nome).width
        contexto.fillStyle = tema.primario
        contexto.fillText(`  ${pilula.valor}`, xValor, meioY)
      }
      xPilula += larguraPilula + ESPACO_PILULAS
    })
    cursor += ALTURA_PILULA + ESPACO_PILULAS
  }
  contexto.textBaseline = 'top'
  return cursor - ESPACO_PILULAS
}

/** Módulos pretos no branco, nível M, ocupando o lado todo (a margem é da placa). */
function desenharQr(
  contexto: CanvasRenderingContext2D,
  modules: QRCode['modules'],
  x: number,
  y: number,
  lado: number,
) {
  const modulo = lado / modules.size
  contexto.fillStyle = '#ffffff'
  contexto.fillRect(x, y, lado, lado)
  contexto.fillStyle = '#000000'
  for (let linha = 0; linha < modules.size; linha++) {
    for (let coluna = 0; coluna < modules.size; coluna++) {
      if (!modules.get(linha, coluna)) continue
      // Arredonda as bordas de cada módulo para não sobrar fresta entre eles.
      const x0 = Math.floor(x + coluna * modulo)
      const y0 = Math.floor(y + linha * modulo)
      const x1 = Math.ceil(x + (coluna + 1) * modulo)
      const y1 = Math.ceil(y + (linha + 1) * modulo)
      contexto.fillRect(x0, y0, x1 - x0, y1 - y0)
    }
  }
}

/** Arte que não carrega fica de fora: a imagem sai mesmo assim. */
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
