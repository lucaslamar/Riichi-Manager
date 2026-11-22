import { gerarQr } from '@/compartilhado/adaptadores/qr'
import { URL_DO_APP } from '@/compartilhado/marca/url-app'
import { colunasDaDireita, type Relatorio } from './relatorio'

const LARGURA = 1080
const MARGEM = 56
const RESPIRO_CARTAO = 32
const ALTURA_LINHA = 56
const ALTURA_TITULO_BLOCO = 64
const ESPACO_BLOCOS = 28
/** Cada coluna da direita, quando alinhadas. */
const LARGURA_COLUNA = 190
/** Múltiplo dos módulos do QR do endereço: sai nítido e lê da tela de outro celular. */
const LADO_QR = 222
const RESPIRO_QR = 16
const ALTURA_RODAPE_SIMPLES = 56
// Caixa do QR sempre clara, nos dois temas: QR claro sobre escuro falha em muitos leitores.
const CAIXA_QR = { fundo: '#ffffff', texto: '#1b1724', apoio: '#4b4459' }

/** Cor de uma variável do tema aberto, com reserva (a imagem segue o tema). */
function corDoTema(variavel: string, reserva: string): string {
  const valor = getComputedStyle(document.body).getPropertyValue(variavel).trim()
  return valor || reserva
}

/** Corta o texto com "…" para caber na largura. */
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

/** Quebra em linhas que cabem na largura. */
function quebrar(contexto: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const linhas: string[] = []
  // Japonês, chinês e coreano podem não ter espaço: aí quebra por caractere.
  const separador = texto.includes(' ') ? ' ' : ''
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
  return atual ? [...linhas, atual] : linhas
}

function carregarImagem(endereco: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image()
    imagem.onload = () => resolver(imagem)
    imagem.onerror = () => rejeitar(new Error('QR não carregou'))
    imagem.src = endereco
  })
}

/**
 * Desenha o relatório numa imagem PNG (1080 px de largura), nas cores do tema:
 * título no roxo do app, um cartão por bloco e os valores em verde ou vermelho.
 * No React Native, trocar por react-native-view-shot.
 */
export async function imagemDoRelatorio(
  relatorio: Relatorio,
  rodape: { nomeDoApp: string; comQr: boolean },
): Promise<Blob> {
  await document.fonts?.ready
  const qr = rodape.comQr ? await carregarImagem(await gerarQr(URL_DO_APP, LADO_QR)) : null
  const fonte = getComputedStyle(document.body).fontFamily || 'sans-serif'
  const cores = {
    fundo: corDoTema('--fundo', '#14111c'),
    cartao: corDoTema('--branco', '#1e1a29'),
    borda: corDoTema('--linha-divisoria', '#2e2840'),
    primario: corDoTema('--primario', '#b9a3e3'),
    texto: corDoTema('--texto-principal', '#f3eefc'),
    apoio: corDoTema('--texto-apoio', '#a59cb8'),
    positivo: corDoTema('--texto-positivo', '#6fd39b'),
    negativo: corDoTema('--texto-erro', '#f07a8a'),
  }

  const alturaTopo = 72 + (relatorio.subtitulo ? 44 : 0) + 24
  const alturaBloco = (bloco: Relatorio['blocos'][number]) =>
    RESPIRO_CARTAO * 2 + (bloco.titulo ? ALTURA_TITULO_BLOCO : 0) + bloco.linhas.length * ALTURA_LINHA
  // Blocos só do texto (ex.: o pódio) não entram na imagem.
  const blocosDaImagem = relatorio.blocos.filter((bloco) => bloco.so !== 'texto')
  const alturaBlocos = blocosDaImagem.reduce((soma, bloco) => soma + alturaBloco(bloco) + ESPACO_BLOCOS, 0)
  const alturaRodape = qr ? LADO_QR + RESPIRO_QR * 2 : ALTURA_RODAPE_SIMPLES
  const altura = MARGEM + alturaTopo + alturaBlocos + alturaRodape + MARGEM

  const tela = document.createElement('canvas')
  tela.width = LARGURA
  tela.height = altura
  const contexto = tela.getContext('2d')
  if (!contexto) throw new Error('Sem canvas')
  contexto.textBaseline = 'middle'

  contexto.fillStyle = cores.fundo
  contexto.fillRect(0, 0, LARGURA, altura)

  let y = MARGEM
  const larguraUtil = LARGURA - MARGEM * 2
  contexto.fillStyle = cores.primario
  contexto.font = `800 48px ${fonte}`
  contexto.fillText(caber(contexto, relatorio.titulo, larguraUtil), MARGEM, y + 32)
  y += 72
  if (relatorio.subtitulo) {
    contexto.fillStyle = cores.apoio
    contexto.font = `600 30px ${fonte}`
    contexto.fillText(caber(contexto, relatorio.subtitulo, larguraUtil), MARGEM, y + 20)
    y += 44
  }
  y += 24

  for (const bloco of blocosDaImagem) {
    const alturaCartao = alturaBloco(bloco)
    retanguloArredondado(contexto, MARGEM, y, larguraUtil, alturaCartao, 24)
    contexto.fillStyle = cores.cartao
    contexto.fill()
    contexto.strokeStyle = cores.borda
    contexto.lineWidth = 2
    contexto.stroke()

    const xTexto = MARGEM + RESPIRO_CARTAO
    const xDireita = MARGEM + larguraUtil - RESPIRO_CARTAO
    let yLinha = y + RESPIRO_CARTAO
    if (bloco.titulo) {
      contexto.textAlign = 'left'
      contexto.fillStyle = cores.primario
      contexto.font = `800 36px ${fonte}`
      contexto.fillText(bloco.titulo, xTexto, yLinha + 24)
      if (bloco.detalhe) {
        contexto.textAlign = 'right'
        contexto.fillStyle = cores.apoio
        contexto.font = `700 26px ${fonte}`
        contexto.fillText(bloco.detalhe, xDireita, yLinha + 24)
      }
      yLinha += ALTURA_TITULO_BLOCO
    }
    bloco.linhas.forEach((linha, indice) => {
      if (indice > 0) {
        contexto.fillStyle = cores.borda
        contexto.fillRect(xTexto, yLinha, xDireita - xTexto, 2)
      }
      const meio = yLinha + ALTURA_LINHA / 2
      contexto.textAlign = 'right'
      contexto.font = `800 32px ${fonte}`
      const corDoTom =
        linha.tom === 'positivo' ? cores.positivo : linha.tom === 'negativo' ? cores.negativo : cores.texto
      const colunas = colunasDaDireita(linha)
      let larguraDireita = 0
      if (bloco.corSoNaUltima) {
        for (let coluna = colunas.length - 1; coluna >= 0; coluna--) {
          contexto.fillStyle = coluna === colunas.length - 1 ? corDoTom : cores.apoio
          contexto.fillText(colunas[coluna], xDireita - larguraDireita, meio)
          larguraDireita += LARGURA_COLUNA
        }
      } else if (colunas.length) {
        const direita = colunas.join('   ')
        contexto.fillStyle = corDoTom
        contexto.fillText(direita, xDireita, meio)
        larguraDireita = contexto.measureText(direita).width + 24
      }
      contexto.textAlign = 'left'
      contexto.fillStyle = cores.texto
      contexto.font = `${linha.destaque ? 800 : 600} 32px ${fonte}`
      contexto.fillText(caber(contexto, linha.esquerda, xDireita - xTexto - larguraDireita), xTexto, meio)
      yLinha += ALTURA_LINHA
    })
    y += alturaCartao + ESPACO_BLOCOS
  }

  if (qr) {
    retanguloArredondado(contexto, MARGEM, y, larguraUtil, alturaRodape, 24)
    contexto.fillStyle = CAIXA_QR.fundo
    contexto.fill()
    contexto.drawImage(qr, MARGEM + RESPIRO_QR, y + RESPIRO_QR, LADO_QR, LADO_QR)

    const xChamada = MARGEM + RESPIRO_QR + LADO_QR + 20
    const larguraChamada = MARGEM + larguraUtil - RESPIRO_CARTAO - xChamada
    contexto.textAlign = 'left'
    contexto.font = `800 36px ${fonte}`
    const linhas = quebrar(contexto, relatorio.chamada ?? rodape.nomeDoApp, larguraChamada).slice(0, 3)
    let yChamada = y + alturaRodape / 2 - (linhas.length * 46) / 2
    contexto.fillStyle = CAIXA_QR.texto
    for (const linha of linhas) {
      contexto.fillText(caber(contexto, linha, larguraChamada), xChamada, yChamada)
      yChamada += 46
    }
    contexto.fillStyle = CAIXA_QR.apoio
    contexto.font = `700 26px ${fonte}`
    const endereco = URL_DO_APP.replace(/^https:\/\//, '').replace(/\/$/, '')
    contexto.fillText(caber(contexto, endereco, larguraChamada), xChamada, yChamada + 8)
  } else {
    contexto.textAlign = 'right'
    contexto.fillStyle = cores.apoio
    contexto.font = `700 26px ${fonte}`
    contexto.fillText(rodape.nomeDoApp, LARGURA - MARGEM, y + 24)
  }

  return new Promise((resolver, rejeitar) =>
    tela.toBlob((blob) => (blob ? resolver(blob) : rejeitar(new Error('Imagem vazia'))), 'image/png'),
  )
}
