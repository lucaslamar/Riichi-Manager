/**
 * Ícone dos itens de navegação. Aceita uma classe do Font Awesome (`fa-*`) ou
 * um dos ícones próprios abaixo, desenhados em SVG com `currentColor` para
 * herdar a cor e o estado ativo exatamente como os ícones do Font Awesome.
 */
export function IconeMenu({ icone }: { icone: string }) {
  if (icone === 'um-pin') return <i className="icone-svg-menu" aria-hidden="true"><SvgUmPin /></i>
  if (icone === 'chapeu-helice') return <i className="icone-svg-menu" aria-hidden="true"><SvgChapeuHelice /></i>
  if (icone === 'palito-riichi') return <i className="icone-svg-menu" aria-hidden="true"><SvgPalitoRiichi /></i>
  return <i className={`fas ${icone}`} aria-hidden="true" />
}

/** Palito de riichi (Han e Fu): barra arredondada com o ponto no centro. */
function SvgPalitoRiichi() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none">
      <rect x="1.6" y="7" width="20.8" height="10" rx="5" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  )
}

/** Pedra 1 Pin: círculo grande com anel de pontos e miolo. */
function SvgUmPin() {
  const pontos = Array.from({ length: 8 }, (_, indice) => {
    const angulo = (indice * Math.PI) / 4
    return { x: 12 + 7.6 * Math.cos(angulo), y: 12 + 7.6 * Math.sin(angulo) }
  })
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <circle cx="12" cy="12" r="10.7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {pontos.map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" />
      ))}
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.7" />
    </svg>
  )
}

/**
 * Boné de hélice (o do gato do Sorteador): hélice de duas pás, haste, copa em
 * gomos alternando opacidade e aba.
 */
function SvgChapeuHelice() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <ellipse cx="6.8" cy="4.4" rx="5" ry="2.1" />
      <ellipse cx="17.2" cy="4.4" rx="5" ry="2.1" opacity="0.62" />
      <rect x="11.1" y="5" width="1.8" height="6" rx="0.9" />
      <circle cx="12" cy="4.4" r="1.7" fill="var(--cor-superficie, #fff)" stroke="currentColor" strokeWidth="1" />
      <path d="M3 17.5 C3 8.8 12 10.3 12 10.3 V17.5 Z" />
      <path d="M12 10.3 C12 10.3 21 8.8 21 17.5 H12 Z" opacity="0.62" />
      <path d="M1.5 17 H22.5 V18.8 Q22.5 21 20 21 H4 Q1.5 21 1.5 18.8 Z" />
    </svg>
  )
}
