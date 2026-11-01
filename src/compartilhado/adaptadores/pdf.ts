/**
 * Exportação de PDF atrás de um adaptador: os componentes não conhecem o jsPDF,
 * e no React Native basta trocar este arquivo.
 *
 * As bibliotecas só são baixadas na primeira exportação, para não pesar a abertura
 * de quem nunca usa o PDF.
 */
const SCRIPTS_JSPDF = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js',
]

export interface DocumentoTabelaPdf {
  titulo: string
  cabecalho: string[]
  linhas: string[][]
  nomeArquivo: string
}

function carregarScript(url: string) {
  return new Promise<void>((resolver, rejeitar) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolver()
      return
    }
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolver()
    script.onerror = () => rejeitar(new Error(`Falha ao carregar ${url}`))
    document.head.appendChild(script)
  })
}

/** Gera e baixa o PDF. Devolve falso se as bibliotecas não carregarem (sem conexão). */
export async function exportarPdf(documento: DocumentoTabelaPdf): Promise<boolean> {
  try {
    for (const url of SCRIPTS_JSPDF) await carregarScript(url)
  } catch {
    return false
  }

  const jsPDF = (window as any).jspdf?.jsPDF
  if (!jsPDF) return false

  const pdf = new jsPDF()
  pdf.setFontSize(18)
  pdf.text(documento.titulo, 14, 20)
  pdf.setFontSize(11)
  pdf.autoTable({ head: [documento.cabecalho], body: documento.linhas, startY: 30 })
  pdf.save(documento.nomeArquivo)
  return true
}
