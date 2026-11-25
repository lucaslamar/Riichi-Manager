import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  abrirCameraFoto,
  capturarQuadro,
  fotoDoArquivo,
  pararCamera,
  quantasCameras,
  temCamera,
  type LadoCamera,
} from '@/compartilhado/adaptadores/camera'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

export default function TelaCamera({
  aoCapturar,
  aoFechar,
}: {
  aoCapturar: (foto: ImageBitmap) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const videoRef = useRef<HTMLVideoElement>(null)
  const fluxoRef = useRef<MediaStream | null>(null)
  const capturaRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)
  const [lado, setLado] = useState<LadoCamera>('environment')
  const [semCamera, setSemCamera] = useState(!temCamera())
  const [podeVirar, setPodeVirar] = useState(false)
  const [visivel, setVisivel] = useState(document.visibilityState === 'visible')

  // App em segundo plano desliga a câmera e, de volta, liga de novo.
  useEffect(() => {
    const aoMudar = () => setVisivel(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', aoMudar)
    return () => document.removeEventListener('visibilitychange', aoMudar)
  }, [])

  useEffect(() => {
    if (semCamera || !visivel) return
    let ativo = true
    abrirCameraFoto(lado)
      .then(async (fluxo) => {
        if (!ativo) return pararCamera(fluxo)
        fluxoRef.current = fluxo
        if (videoRef.current) {
          videoRef.current.srcObject = fluxo
          await videoRef.current.play().catch(() => undefined)
        }
        setPodeVirar((await quantasCameras()) > 1)
      })
      .catch(() => ativo && setSemCamera(true))
    return () => {
      ativo = false
      pararCamera(fluxoRef.current)
      fluxoRef.current = null
    }
  }, [lado, semCamera, visivel])

  const fotografar = async () => {
    const video = videoRef.current
    if (semCamera || !video || video.videoWidth === 0) {
      capturaRef.current?.click()
      return
    }
    const foto = await capturarQuadro(video)
    pararCamera(fluxoRef.current)
    aoCapturar(foto)
  }

  const aoEscolher = async (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    pararCamera(fluxoRef.current)
    aoCapturar(await fotoDoArquivo(arquivo))
  }

  return (
    <div
      className="historia-mao-tela historia-mao-camera"
      role="dialog"
      aria-modal="true"
      aria-label={t('historiaMao.titulo')}
    >
      <div className="historia-mao-topo">
        <button
          type="button"
          className="historia-mao-icone"
          aria-label={t('actions.close')}
          onClick={aoFechar}
        >
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
        {podeVirar && !semCamera && (
          <button
            type="button"
            className="historia-mao-icone"
            aria-label={t('historiaMao.virarCamera')}
            onClick={() => setLado(lado === 'environment' ? 'user' : 'environment')}
          >
            <i className="fas fa-camera-rotate" aria-hidden="true" />
          </button>
        )}
      </div>

      {semCamera ? (
        <p className="historia-mao-aviso">{t('historiaMao.semCamera')}</p>
      ) : (
        <>
          <video ref={videoRef} className="historia-mao-video" autoPlay playsInline muted />
          <div className="historia-mao-guia" aria-hidden="true">
            <span>{t('historiaMao.enquadre')}</span>
          </div>
        </>
      )}

      <div className="historia-mao-base">
        <button
          type="button"
          className="historia-mao-galeria"
          aria-label={t('historiaMao.galeria')}
          onClick={() => galeriaRef.current?.click()}
        >
          <i className="fas fa-image" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="historia-mao-obturador"
          aria-label={t('historiaMao.fotografar')}
          onClick={fotografar}
        />
        <span
          className="historia-mao-galeria"
          aria-hidden="true"
          style={{ visibility: 'hidden' }}
        />
      </div>

      <input
        ref={capturaRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={aoEscolher}
      />
      <input ref={galeriaRef} type="file" accept="image/*" hidden onChange={aoEscolher} />
    </div>
  )
}
