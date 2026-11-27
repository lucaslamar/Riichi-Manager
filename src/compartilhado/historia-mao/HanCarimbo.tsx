import { useEffect, useId } from 'react'
import {
  carregarFonteCarimbo,
  DESENHOS,
  FONTE_KANJI,
  tamanhoKanji,
  TINTA_ESCURA,
  type NivelCarimbo,
} from './carimbo'

/**
 * Selo hanko das mãos grandes, como um carimbo de tinta: kanji no meio, romaji
 * embaixo e a borda levemente irregular. Sem nível (abaixo de Mangan), não
 * renderiza nada. O tamanho e a inclinação vêm do CSS.
 */
export default function HanCarimbo({ nivel }: { nivel?: NivelCarimbo }) {
  const filtro = `tinta-carimbo${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    if (nivel) void carregarFonteCarimbo()
  }, [nivel])

  if (!nivel) return null
  const desenho = DESENHOS[nivel]
  const tinta = desenho.preenchido ? TINTA_ESCURA : 'currentColor'
  const fonte = tamanhoKanji(desenho)
  const linhas = desenho.kanji.length
  const topoKanji = linhas > 1 ? 36 : 46
  const fonteRomaji = desenho.romaji.length > 9 ? 6 : 7.5

  return (
    <svg
      className="historia-mao-carimbo"
      viewBox="0 0 100 100"
      role="img"
      aria-label={desenho.rotulo}
      style={desenho.tinta && !desenho.preenchido ? { color: desenho.tinta } : undefined}
    >
      <defs>
        <filter id={filtro} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="7"
            result="ruido"
          />
          <feDisplacementMap in="SourceGraphic" in2="ruido" scale="2.2" />
        </filter>
      </defs>
      <g filter={`url(#${filtro})`} opacity="0.9">
        {desenho.preenchido ? (
          <>
            <circle cx="50" cy="50" r="48" fill={desenho.tinta ?? undefined} />
            <circle cx="50" cy="50" r="44" fill="none" stroke={tinta} strokeWidth="2.5" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={tinta} strokeWidth="1.2" />
          </>
        ) : (
          <>
            <circle
              cx="50"
              cy="50"
              r={48 - desenho.anel / 2}
              fill="none"
              stroke={tinta}
              strokeWidth={desenho.anel}
            />
            {desenho.anelDuplo && (
              <circle cx="50" cy="50" r="41" fill="none" stroke={tinta} strokeWidth="1.5" />
            )}
          </>
        )}
        <text
          fill={tinta}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontFamily: FONTE_KANJI, fontWeight: desenho.pesoKanji, fontSize: fonte }}
        >
          {desenho.kanji.map((linha, indice) => (
            <tspan key={linha} x="50" y={topoKanji + indice * (fonte + 2)}>
              {linha}
            </tspan>
          ))}
        </text>
        <text
          x="50"
          y="73"
          fill={tinta}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: fonteRomaji, fontWeight: 700, letterSpacing: '0.1em' }}
        >
          {desenho.romaji}
        </text>
      </g>
    </svg>
  )
}
