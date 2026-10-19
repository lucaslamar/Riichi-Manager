/**
 * Ícone dos itens de navegação. Aceita uma classe do Font Awesome (`fa-*`) ou
 * um dos ícones próprios abaixo, desenhados em SVG com `currentColor` para
 * herdar a cor e o estado ativo exatamente como os ícones do Font Awesome.
 */
export function IconeMenu({ icone }: { icone: string }) {
  if (icone === 'um-pin') return <i className="icone-svg-menu" aria-hidden="true"><SvgUmPin /></i>
  if (icone === 'catavento') return <i className="icone-svg-menu" aria-hidden="true"><SvgCatavento /></i>
  return <i className={`fas ${icone}`} aria-hidden="true" />
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

/** Catavento: quatro pás alternando opacidade (efeito de dobra) e haste. */
function SvgCatavento() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <line x1="12" y1="9.5" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {[0, 90, 180, 270].map((rotacao, indice) => (
        <path
          key={rotacao}
          d="M12 9.5 L12 2 L19.5 2 Z"
          opacity={indice % 2 === 0 ? 1 : 0.62}
          transform={`rotate(${rotacao} 12 9.5)`}
        />
      ))}
      <circle cx="12" cy="9.5" r="1.3" fill="#fff" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  )
}
