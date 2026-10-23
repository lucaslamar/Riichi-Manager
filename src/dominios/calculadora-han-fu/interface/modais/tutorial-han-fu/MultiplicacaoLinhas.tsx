import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/*
 * Desenho em coordenadas "retas": as do 11 ficam deitadas (y fixo) e as do 64
 * em pé (x fixo); o grupo todo gira -45° para virar o losango do método. Assim
 * dezena × dezena cai à esquerda, unidade × unidade à direita e os dois
 * cruzamentos mistos no meio, um em cima do outro.
 */
const COMPRIMENTO = 200
/** 11: uma reta da dezena e uma da unidade. */
const RETAS_ONZE = [55, 145]
/** 64: seis retas da dezena e quatro da unidade. */
const RETAS_DEZENA_64 = [22, 34, 46, 58, 70, 82]
const RETAS_UNIDADE_64 = [128, 140, 152, 164]
const RETAS_64 = [...RETAS_DEZENA_64, ...RETAS_UNIDADE_64]

/** Contornos dos quatro grupos de cruzamentos (antes de girar). */
const GRUPOS = [
  { x: 12, y: 45 },
  { x: 118, y: 45 },
  { x: 12, y: 135 },
  { x: 118, y: 135 },
]

/** Colunas das contagens embaixo do desenho (já na tela, depois de girar). */
const COLUNA_ESQUERDA = 90
const COLUNA_MEIO = 158
const COLUNA_DIREITA = 226

/**
 * Multiplicação com retas (multiplicação japonesa) de 11 × 64. As retas são
 * desenhadas uma a uma e os cruzamentos aparecem no fim; com movimento
 * reduzido, tudo já aparece pronto (tutorial-han-fu.css).
 */
export default function MultiplicacaoLinhas() {
  const { t } = useI18n()
  const CHAVE = 'hanFuTutorial.points'
  const figuraRef = useRef<HTMLElement>(null)
  // O desenho fica no meio de uma página longa: só começa quando aparece.
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const figura = figuraRef.current
    if (!figura || typeof IntersectionObserver === 'undefined') {
      setVisivel(true)
      return
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return
        setVisivel(true)
        observador.disconnect()
      },
      { threshold: 0.4 },
    )
    observador.observe(figura)
    return () => observador.disconnect()
  }, [])

  return (
    <figure
      ref={figuraRef}
      className={`multiplicacao-linhas${visivel ? ' multiplicacao-linhas--desenhar' : ''}`}
    >
      <figcaption className="multiplicacao-linhas__legenda">
        <span className="multiplicacao-linhas__onze">{t(`${CHAVE}.linesFirst`)}</span>
        <span className="multiplicacao-linhas__sessenta">{t(`${CHAVE}.linesSecond`)}</span>
      </figcaption>
      <svg viewBox="0 0 312 334" role="img" aria-label={t(`${CHAVE}.linesLabel`)}>
        <g transform="translate(14 150) rotate(-45)">
          {GRUPOS.map(({ x, y }) => (
            <rect
              key={`${x}-${y}`}
              className="multiplicacao-linhas__grupo"
              x={x}
              y={y}
              width={78}
              height={20}
              rx={10}
            />
          ))}
          {RETAS_ONZE.map((y, indice) => (
            <line
              key={`onze-${y}`}
              className="multiplicacao-linhas__reta multiplicacao-linhas__reta--onze"
              x1={0}
              y1={y}
              x2={COMPRIMENTO}
              y2={y}
              pathLength={1}
              style={{ animationDelay: `${indice * 120}ms` }}
            />
          ))}
          {RETAS_64.map((x, indice) => (
            <line
              key={`64-${x}`}
              className="multiplicacao-linhas__reta multiplicacao-linhas__reta--sessenta"
              x1={x}
              y1={0}
              x2={x}
              y2={COMPRIMENTO}
              pathLength={1}
              style={{ animationDelay: `${(RETAS_ONZE.length + indice) * 120}ms` }}
            />
          ))}
          {RETAS_ONZE.flatMap((y) =>
            RETAS_64.map((x) => (
              <circle
                key={`${x}-${y}`}
                className="multiplicacao-linhas__cruzamento"
                cx={x}
                cy={y}
                r={3.2}
              />
            )),
          )}
        </g>
        <g className="multiplicacao-linhas__contagens">
          <text x={COLUNA_ESQUERDA} y={322}>
            {t(`${CHAVE}.linesLeft`)}
          </text>
          <text x={COLUNA_MEIO} y={322}>
            {t(`${CHAVE}.linesMiddle`)}
          </text>
          <text x={COLUNA_DIREITA} y={322}>
            {t(`${CHAVE}.linesRight`)}
          </text>
        </g>
      </svg>
    </figure>
  )
}
