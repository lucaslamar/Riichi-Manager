import { useEffect, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { empilharCamada } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'

const LARGURA = 14
const ALTURA = 19
const PASSO = LARGURA + 1
const TOPO = 24
const DICAS = ['dicaDeitadas', 'dicaDeCima', 'dicaOrdem', 'dicaChamadas', 'dicaLuz'] as const

/** Pedra do desenho: normal, de lado (chamada) ou virada (pontas do kan fechado). */
function Pedra({
  x,
  deLado = false,
  virada = false,
}: {
  x: number
  deLado?: boolean
  virada?: boolean
}) {
  const [largura, altura] = deLado ? [ALTURA, LARGURA] : [LARGURA, ALTURA]
  return (
    <rect
      x={x}
      y={TOPO + ALTURA - altura}
      width={largura}
      height={altura}
      rx={2.5}
      className={virada ? 'historia-mao-ajuda-verso' : 'historia-mao-ajuda-face'}
    />
  )
}

/** Chave embaixo de um grupo, com o nome. */
function Chave({
  x,
  largura,
  texto,
  destaque = false,
}: {
  x: number
  largura: number
  texto: string
  destaque?: boolean
}) {
  const y = TOPO + ALTURA + 6
  return (
    <g className={destaque ? 'historia-mao-ajuda-destaque' : undefined}>
      <path d={`M${x} ${y} v4 h${largura} v-4`} fill="none" strokeWidth={1.2} />
      <text
        x={destaque ? x + largura : x + largura / 2}
        y={y + (destaque ? 32 : 17)}
        textAnchor={destaque ? 'end' : 'middle'}
      >
        {texto}
      </text>
    </g>
  )
}

/**
 * Como fotografar a mão, aberta pelo ? da câmera: um desenho da disposição na
 * mesa (mão, chamadas e a batida na ponta) e as dicas em uma linha cada.
 */
export default function AjudaFoto({ aoFechar }: { aoFechar: () => void }) {
  const { t } = useI18n()
  const botaoRef = useRef<HTMLButtonElement>(null)

  // Camada própria: o Esc fecha só a ajuda e volta para a câmera.
  useEffect(() => {
    const camada = empilharCamada()
    botaoRef.current?.focus({ preventScroll: true })
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && camada.noTopo()) {
        evento.stopPropagation()
        aoFechar()
      }
    }
    document.addEventListener('keydown', aoTeclar, true)
    return () => {
      document.removeEventListener('keydown', aoTeclar, true)
      camada.remover()
    }
  }, [aoFechar])
  const mao = Array.from({ length: 10 }, (_, indice) => 4 + indice * PASSO)
  const xChi = 4 + 10 * PASSO + 10
  const xKan = xChi + ALTURA + 1 + 2 * PASSO + 8
  const xBatida = xKan + 4 * PASSO + 10

  return (
    <div
      className="historia-mao-ajuda"
      role="dialog"
      aria-modal="true"
      aria-labelledby="historia-mao-ajuda-titulo"
    >
      <div className="historia-mao-ajuda-folha">
        <h2 id="historia-mao-ajuda-titulo">{t('historiaMao.comoFotografar')}</h2>
        <svg
          viewBox="0 0 340 92"
          className="historia-mao-ajuda-desenho"
          role="img"
          aria-label={t('historiaMao.dicaOrdem')}
        >
          {mao.map((x) => (
            <Pedra key={x} x={x} />
          ))}
          <Pedra x={xBatida} />
          <Pedra x={xChi} deLado />
          <Pedra x={xChi + ALTURA + 1} />
          <Pedra x={xChi + ALTURA + 1 + PASSO} />
          <Pedra x={xKan} virada />
          <Pedra x={xKan + PASSO} />
          <Pedra x={xKan + 2 * PASSO} />
          <Pedra x={xKan + 3 * PASSO} virada />
          <Chave x={4} largura={10 * PASSO - 1} texto={t('historiaMao.zonaMao')} />
          <Chave x={xBatida} largura={LARGURA} texto={t('historiaMao.zonaBatida')} destaque />
          <Chave
            x={xChi}
            largura={xKan + 4 * PASSO - 1 - xChi}
            texto={t('historiaMao.zonaChamadas')}
          />
        </svg>
        <ol>
          {DICAS.map((dica) => (
            <li key={dica}>{t(`historiaMao.${dica}`)}</li>
          ))}
        </ol>
        <button ref={botaoRef} type="button" className="btn-primario" onClick={aoFechar}>
          {t('historiaMao.entendi')}
        </button>
      </div>
    </div>
  )
}
