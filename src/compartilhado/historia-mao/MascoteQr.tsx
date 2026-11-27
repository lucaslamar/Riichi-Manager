import { useEffect, useState } from 'react'
import { MASCOTE_AREA_QR, MASCOTE_QR_SRC } from './mascote'

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

/**
 * O mascote segurando a placa, com o QR por cima dela, nas medidas da prancheta
 * (`mascote.ts`). A largura e a inclinação vêm de fora (CSS); nunca aplicar
 * perspectiva, skew nem filtro.
 */
export default function MascoteQr({ url, rotulo }: { url: string; rotulo: string }) {
  const qr = useCaminhoQr(url)
  return (
    <div className="historia-mao-mascote">
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
        {qr && (
          <svg
            viewBox={`0 0 ${qr.lado} ${qr.lado}`}
            shapeRendering="crispEdges"
            role="img"
            aria-label={rotulo}
          >
            <rect width={qr.lado} height={qr.lado} fill="#ffffff" />
            <path d={qr.caminho} fill="#000000" />
          </svg>
        )}
      </div>
    </div>
  )
}
