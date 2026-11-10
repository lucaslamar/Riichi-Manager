/**
 * SVG da tela → PNG, para compartilhar gráficos. As cores do tema vêm de
 * variáveis CSS, que não existem fora da página: antes de desenhar, cada
 * `var(--x)` vira a cor que ela tem agora. No React Native, trocar por
 * react-native-view-shot.
 */
export async function svgParaPng(svg: SVGSVGElement, opcoes: { escala?: number; fundo?: string } = {}): Promise<Blob> {
  const estilo = getComputedStyle(svg)
  const largura = svg.viewBox.baseVal.width || svg.clientWidth
  const altura = svg.viewBox.baseVal.height || svg.clientHeight
  const escala = opcoes.escala ?? 3

  const copia = svg.cloneNode(true) as SVGSVGElement
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copia.setAttribute('width', String(largura))
  copia.setAttribute('height', String(altura))
  copia.setAttribute('font-family', estilo.fontFamily)
  const texto = new XMLSerializer()
    .serializeToString(copia)
    .replace(/var\((--[\w-]+)\)/g, (_, nome: string) => estilo.getPropertyValue(nome).trim() || 'currentColor')

  const imagem = new Image()
  imagem.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(texto)}`
  await imagem.decode()

  const tela = document.createElement('canvas')
  tela.width = Math.round(largura * escala)
  tela.height = Math.round(altura * escala)
  const contexto = tela.getContext('2d')
  if (!contexto) throw new Error('Canvas indisponível')
  contexto.fillStyle = opcoes.fundo ?? (getComputedStyle(document.body).backgroundColor || '#000')
  contexto.fillRect(0, 0, tela.width, tela.height)
  contexto.drawImage(imagem, 0, 0, tela.width, tela.height)
  return new Promise((resolver, rejeitar) =>
    tela.toBlob((blob) => (blob ? resolver(blob) : rejeitar(new Error('PNG vazio'))), 'image/png'),
  )
}
