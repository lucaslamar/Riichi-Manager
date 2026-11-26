import { useEffect, useRef, useState } from 'react'
import { MASCOTE_AREA_QR, MASCOTE_QR_SRC } from './mascote'

/** Abaixo disso o QR deixa de ser lido com folga: some o mascote e fica o QR simples. */
const QR_MINIMO_PX = 96

/** Caminho SVG dos módulos do QR, nível M, sem margem (a placa já tem a branca). */
function useCaminhoQr(url: string) {
  const [qr, setQr] = useState<{ lado: number; caminho: string } | null>(null)
  useEffect(() => {
    let ativo = true
    void import('qrcode').then(({ create }) => {
      const { modules } = create(url, { errorCorrectionLevel: 'M' })
      let caminho = ''
      for (let linha = 0; linha < modules.size; linha++) {
        for (let coluna = 0; coluna < modules.size; coluna++) {
          if (modules.get(linha, coluna)) caminho += `M${coluna} ${linha}h1v1h-1z`
        }
      }
      if (ativo) setQr({ lado: modules.size, caminho })
    })
    return () => {
      ativo = false
    }
  }, [url])
  return qr
}

function Qr({ url, rotulo }: { url: string; rotulo: string }) {
  const qr = useCaminhoQr(url)
  if (!qr) return null
  return (
    <svg
      viewBox={`0 0 ${qr.lado} ${qr.lado}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={rotulo}
      className="historia-mao-mascote-qr-codigo"
    >
      <rect width={qr.lado} height={qr.lado} fill="#ffffff" />
      <path d={qr.caminho} fill="#000000" />
    </svg>
  )
}

/**
 * O mascote segurando a placa, com o QR por cima dela, nas medidas da prancheta
 * (`mascote.ts`). A largura vem do pai. Nunca rotacionar, inclinar nem filtrar.
 */
export default function MascoteQr({ url, rotulo }: { url: string; rotulo: string }) {
  const caixaRef = useRef<HTMLDivElement>(null)
  const [larguraQr, setLarguraQr] = useState(QR_MINIMO_PX)

  useEffect(() => {
    const caixa = caixaRef.current
    if (!caixa) return
    const observador = new ResizeObserver(([entrada]) => {
      setLarguraQr(entrada.contentRect.width * MASCOTE_AREA_QR.largura)
    })
    observador.observe(caixa)
    return () => observador.disconnect()
  }, [])

  // A mesma caixa nos dois casos, para o medidor continuar valendo.
  const simples = larguraQr < QR_MINIMO_PX
  return (
    <div
      ref={caixaRef}
      className={`historia-mao-mascote${simples ? ' historia-mao-mascote--simples' : ''}`}
    >
      {simples ? (
        <div className="historia-mao-mascote-so-qr">
          <Qr url={url} rotulo={rotulo} />
        </div>
      ) : (
        <>
          <img src={MASCOTE_QR_SRC} alt="" draggable={false} />
          <div
            className="historia-mao-mascote-qr"
            style={{
              left: `${MASCOTE_AREA_QR.esquerda * 100}%`,
              top: `${MASCOTE_AREA_QR.topo * 100}%`,
              width: `${MASCOTE_AREA_QR.largura * 100}%`,
              height: `${MASCOTE_AREA_QR.altura * 100}%`,
            }}
          >
            <Qr url={url} rotulo={rotulo} />
          </div>
        </>
      )}
    </div>
  )
}
