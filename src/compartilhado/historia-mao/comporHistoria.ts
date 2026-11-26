/**
 * Imagem da mão para os Stories (1080×1920) ou deitada (1920×1080): a foto que a
 * pessoa tirou é a protagonista, com o resultado do app e a assinatura com o QR,
 * igual à das imagens do Torneio. Recebe tudo por argumento (foto, textos e
 * cores) e só usa um canvas fora da tela, para o React Native trocar apenas o
 * desenho.
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

const LIMITE_BAIXO = ALTURA - SAFE_BOTTOM
const FONTE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
/**
 * Onde a foto começa na Cabine. Ela sobe acima de SAFE_TOP: no Story, só a
 * borda de cima fica sob a barra do perfil, e os textos ficam na área segura.
 */
const TOPO_FOTO = 170
const ESPACO = 28
/** Assinatura como a das imagens do Torneio: QR de 148px, escuro no lilás claro. */
const LADO_QR = 148
const CORES_QR = { escuro: '#2a2438', claro: '#e6dff2' }
const MAX_YAKU = 8

export type LayoutHistoria = 'foto' | 'cabine'

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
}

export interface TemaHistoria {
  superficie: string
  texto: string
  textoSuave: string
  /** Cor dos pontos e dos valores, e o fundo das pílulas, como no Resultado do app. */
  primario: string
  cartao: string
}

export interface TextosHistoria {
  nomeApp: string
  convite: string
}

export interface OpcoesHistoria {
  layout: LayoutHistoria
  tema: TemaHistoria
  textos: TextosHistoria
  /** Endereço que o QR abre e que aparece escrito na assinatura. */
  url: string
  /** Deitada: 1920×1080, para o feed e o WhatsApp na horizontal. */
  deitada?: boolean
}

export async function comporHistoria(
  foto: ImageBitmap,
  dados: DadosHistoria,
  opcoes: OpcoesHistoria,
): Promise<Blob> {
  await document.fonts?.ready
  const tela = document.createElement('canvas')
  tela.width = opcoes.deitada ? ALTURA : LARGURA
  tela.height = opcoes.deitada ? LARGURA : ALTURA
  const contexto = tela.getContext('2d')
  if (!contexto) throw new Error('Canvas indisponível')

  const { create } = await import('qrcode')
  const desenho = { ...opcoes, qr: create(opcoes.url, { errorCorrectionLevel: 'M' }).modules }
  if (opcoes.deitada) desenharDeitada(contexto, foto, dados, desenho)
  else if (opcoes.layout === 'cabine') desenharCabine(contexto, foto, dados, desenho)
  else desenharFotoCheia(contexto, foto, dados, desenho)

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

/** Foto em toda a tela e o cartão do resultado com a assinatura por cima, embaixo. */
function desenharFotoCheia(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  opcoes: OpcoesDesenho,
) {
  const largura = LARGURA - SAFE_SIDE * 2
  const respiro = 40
  const interna = largura - respiro * 2
  const altura =
    respiro + alturaDoResultado(contexto, dados, interna, 1) + ESPACO + LADO_QR + respiro
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

  desenharCartao(contexto, opcoes.tema, SAFE_SIDE, y, largura, altura)
  const x = SAFE_SIDE + respiro
  const fim = desenharResultado(contexto, dados, opcoes, x, y + respiro, interna, 1)
  desenharAssinatura(contexto, opcoes, x, fim + ESPACO, interna)
}

/**
 * Estilo Cabine: fundo do tema e a foto a maior possível, com borda branca.
 * Deitada (a mão em fila), vai na largura toda com o resultado embaixo. Em pé,
 * ocupa a esquerda, com o resultado na coluna ao lado. A assinatura fica na
 * largura toda, embaixo.
 */
function desenharCabine(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  opcoes: OpcoesDesenho,
) {
  contexto.fillStyle = opcoes.tema.superficie
  contexto.fillRect(0, 0, LARGURA, ALTURA)
  const interna = LARGURA - SAFE_SIDE * 2
  const yAssinatura = LIMITE_BAIXO - LADO_QR
  const fimResultado = yAssinatura - ESPACO

  if (foto.width > foto.height) {
    // A foto vai até 4:3 e cede altura para o resultado caber no tamanho normal.
    const espaco = fimResultado - ESPACO * 2 - TOPO_FOTO
    const alturaFoto = Math.min(
      Math.round(interna * 0.75),
      espaco - alturaDoResultado(contexto, dados, interna, 1),
    )
    desenharFotoComBorda(contexto, foto, SAFE_SIDE, TOPO_FOTO, interna, alturaFoto)
    const topo = TOPO_FOTO + alturaFoto + ESPACO
    desenharResultadoCabendo(contexto, dados, opcoes, SAFE_SIDE, topo, interna, fimResultado)
  } else {
    const larguraFoto = 600
    const alturaFoto = fimResultado - TOPO_FOTO
    desenharFotoComBorda(contexto, foto, SAFE_SIDE, TOPO_FOTO, larguraFoto, alturaFoto)
    const xLado = SAFE_SIDE + larguraFoto + ESPACO
    const larguraLado = LARGURA - SAFE_SIDE - xLado
    desenharResultadoCabendo(contexto, dados, opcoes, xLado, SAFE_TOP, larguraLado, fimResultado)
  }
  desenharAssinatura(contexto, opcoes, SAFE_SIDE, yAssinatura, interna)
}

/**
 * Imagem deitada (1920×1080), nos dois estilos: a foto inteira com borda branca
 * à esquerda e o resultado com a assinatura na coluna à direita. Na Foto cheia,
 * o fundo é a própria foto desfocada e a coluna vai num cartão.
 */
function desenharDeitada(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  dados: DadosHistoria,
  opcoes: OpcoesDesenho,
) {
  const larguraTela = ALTURA
  const alturaTela = LARGURA
  const margem = 64
  if (opcoes.layout === 'foto') desenharFundoDesfocado(contexto, foto)
  else {
    contexto.fillStyle = opcoes.tema.superficie
    contexto.fillRect(0, 0, larguraTela, alturaTela)
  }
  const larguraColuna = 680
  const xColuna = larguraTela - margem - larguraColuna
  const larguraFoto = xColuna - 56 - margem
  const alturaArea = alturaTela - margem * 2
  // A foto entra inteira, sem cortar a mão, e a borda acompanha o tamanho dela.
  const ajuste = Math.min(larguraFoto / foto.width, alturaArea / foto.height)
  const [largura, altura] = [foto.width * ajuste, foto.height * ajuste]
  desenharFotoComBorda(
    contexto,
    foto,
    margem + (larguraFoto - largura) / 2,
    margem + (alturaArea - altura) / 2,
    largura,
    altura,
  )
  if (opcoes.layout === 'foto') {
    desenharCartao(contexto, opcoes.tema, xColuna - 28, margem, larguraColuna + 56, alturaArea)
  }
  const yAssinatura = margem + alturaArea - 24 - LADO_QR
  const topo = margem + 24
  const fim = yAssinatura - ESPACO
  desenharResultadoCabendo(contexto, dados, opcoes, xColuna, topo, larguraColuna, fim, 1.6)
  desenharAssinatura(contexto, opcoes, xColuna, yAssinatura, larguraColuna)
}

/** Cartão do tema, 92% opaco, por cima da foto. */
function desenharCartao(
  contexto: CanvasRenderingContext2D,
  tema: TemaHistoria,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  contexto.save()
  contexto.globalAlpha = 0.92
  contexto.fillStyle = tema.superficie
  retanguloArredondado(contexto, x, y, largura, altura, 40)
  contexto.fill()
  contexto.restore()
}

/** Foto recortada no espaço, com cantos arredondados e borda branca. */
function desenharFotoComBorda(
  contexto: CanvasRenderingContext2D,
  foto: ImageBitmap,
  x: number,
  y: number,
  largura: number,
  altura: number,
) {
  contexto.save()
  contexto.fillStyle = '#ffffff'
  retanguloArredondado(contexto, x - 4, y - 4, largura + 8, altura + 8, 36)
  contexto.fill()
  retanguloArredondado(contexto, x, y, largura, altura, 32)
  contexto.clip()
  desenharCobrindo(contexto, foto, x, y, largura, altura)
  contexto.restore()
}

/** A foto ampliada, desfocada e escurecida, para preencher o fundo sem barras. */
function desenharFundoDesfocado(contexto: CanvasRenderingContext2D, foto: ImageBitmap) {
  const { width: largura, height: altura } = contexto.canvas
  contexto.save()
  contexto.filter = 'blur(40px)'
  desenharCobrindo(contexto, foto, -80, -80, largura + 160, altura + 160)
  contexto.restore()
  contexto.fillStyle = 'rgba(0,0,0,0.35)'
  contexto.fillRect(0, 0, largura, altura)
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

/**
 * Assinatura como a das imagens do Torneio: o QR à esquerda, escuro no lilás
 * claro só nele, e ao lado o nome do app, o convite e o endereço em texto leve.
 */
function desenharAssinatura(
  contexto: CanvasRenderingContext2D,
  { tema, textos, qr, url }: OpcoesDesenho,
  x: number,
  y: number,
  largura: number,
) {
  desenharQr(contexto, qr, x, y, LADO_QR)
  const xTexto = x + LADO_QR + 24
  const larguraTexto = largura - LADO_QR - 24
  const endereco = url.replace(/^https:\/\//, '').replace(/\/$/, '')
  const meio = y + LADO_QR / 2
  contexto.textAlign = 'left'
  contexto.textBaseline = 'middle'
  contexto.fillStyle = tema.textoSuave
  contexto.font = `600 30px ${FONTE}`
  contexto.fillText(caber(contexto, textos.nomeApp, larguraTexto), xTexto, meio - 40)
  contexto.font = `500 26px ${FONTE}`
  contexto.fillText(caber(contexto, textos.convite, larguraTexto), xTexto, meio)
  contexto.font = `400 22px ${FONTE}`
  contexto.fillText(caber(contexto, endereco, larguraTexto), xTexto, meio + 36)
  contexto.textBaseline = 'top'
}

/** Módulos desenhados direto no canvas, nível M, com a zona quieta de 4 módulos. */
function desenharQr(
  contexto: CanvasRenderingContext2D,
  modules: QRCode['modules'],
  x: number,
  y: number,
  lado: number,
) {
  const modulo = lado / (modules.size + 8)
  contexto.save()
  retanguloArredondado(contexto, x, y, lado, lado, 16)
  contexto.clip()
  contexto.fillStyle = CORES_QR.claro
  contexto.fillRect(x, y, lado, lado)
  contexto.fillStyle = CORES_QR.escuro
  for (let linha = 0; linha < modules.size; linha++) {
    for (let coluna = 0; coluna < modules.size; coluna++) {
      if (!modules.get(linha, coluna)) continue
      // Arredonda as bordas de cada módulo para não sobrar fresta entre eles.
      const x0 = Math.floor(x + (coluna + 4) * modulo)
      const y0 = Math.floor(y + (linha + 4) * modulo)
      const x1 = Math.ceil(x + (coluna + 5) * modulo)
      const y1 = Math.ceil(y + (linha + 5) * modulo)
      contexto.fillRect(x0, y0, x1 - x0, y1 - y0)
    }
  }
  contexto.restore()
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
