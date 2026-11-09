import { colunasDaDireita, type Relatorio } from './relatorio'

const LARGURA = 1080
const MARGEM = 56
const RESPIRO_CARTAO = 32
const ALTURA_LINHA = 56
const ALTURA_TITULO_BLOCO = 64
const ESPACO_BLOCOS = 28

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

/**
 * Desenha o relatório numa imagem PNG (1080 px de largura), nas cores do tema:
 * título no roxo do app, um cartão por bloco e os valores em verde ou vermelho.
 * No React Native, trocar por react-native-view-shot.
 */
export async function imagemDoRelatorio(relatorio: Relatorio, rodape: string): Promise<Blob> {
  await document.fonts?.ready
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
  const altura = MARGEM + alturaTopo + alturaBlocos + 56 + MARGEM

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
      contexto.fillStyle =
        linha.tom === 'positivo' ? cores.positivo : linha.tom === 'negativo' ? cores.negativo : cores.texto
      const direita = colunasDaDireita(linha).join('   ')
      const larguraDireita = direita ? contexto.measureText(direita).width + 24 : 0
      if (direita) contexto.fillText(direita, xDireita, meio)
      contexto.textAlign = 'left'
      contexto.fillStyle = cores.texto
      contexto.font = `${linha.destaque ? 800 : 600} 32px ${fonte}`
      contexto.fillText(caber(contexto, linha.esquerda, xDireita - xTexto - larguraDireita), xTexto, meio)
      yLinha += ALTURA_LINHA
    })
    y += alturaCartao + ESPACO_BLOCOS
  }

  contexto.textAlign = 'right'
  contexto.fillStyle = cores.apoio
  contexto.font = `700 26px ${fonte}`
  contexto.fillText(rodape, LARGURA - MARGEM, y + 24)

  return new Promise((resolver, rejeitar) =>
    tela.toBlob((blob) => (blob ? resolver(blob) : rejeitar(new Error('Imagem vazia'))), 'image/png'),
  )
}
