/** Folga, em px, entre a linha e a barra fixa (ou o cabeçalho). */
const FOLGA = 8

/**
 * Lista estilo bloco de notas: rola a página para a linha em edição ficar visível,
 * entre o cabeçalho e a barra fixa de baixo (que sobe com o teclado). Chamar depois
 * de o cursor mudar de linha.
 */
export function manterLinhaVisivel(campo: HTMLTextAreaElement, linha: number, alturaLinha: number) {
  requestAnimationFrame(() => {
    const caixa = campo.getBoundingClientRect()
    const respiro = parseFloat(getComputedStyle(campo).paddingTop) || 0
    const topoLinha = caixa.top + respiro + linha * alturaLinha
    const fundoLinha = topoLinha + alturaLinha
    const visual = window.visualViewport
    const barra = document.querySelector('.clb-rodape')?.getBoundingClientRect().top
    const limiteBaixo = (barra ?? (visual ? visual.offsetTop + visual.height : window.innerHeight)) - FOLGA
    const limiteCima = (document.querySelector('.cabecalho-principal')?.getBoundingClientRect().bottom ?? 0) + FOLGA
    if (fundoLinha > limiteBaixo) window.scrollBy({ top: fundoLinha - limiteBaixo })
    else if (topoLinha < limiteCima) window.scrollBy({ top: topoLinha - limiteCima })
  })
}
