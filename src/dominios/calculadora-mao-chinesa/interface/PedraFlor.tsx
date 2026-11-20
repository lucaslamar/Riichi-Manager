import type { Flor } from '../logica/montagem'

/** Ameixa, orquídea, crisântemo e bambu; primavera, verão, outono e inverno. */
export const HANZI_FLORES: Record<Flor, string> = {
  1: '梅',
  2: '兰',
  3: '菊',
  4: '竹',
  5: '春',
  6: '夏',
  7: '秋',
  8: '冬',
}

export const ehEstacao = (flor: Flor) => flor > 4

/**
 * Arte das flores e estações (o conjunto de pedras do app não tem flores).
 * Mesmo formato das pedras: face clara, o 汉字 no centro e o número no canto.
 */
export function PedraFlor({ flor }: { flor: Flor }) {
  const numero = ehEstacao(flor) ? flor - 4 : flor
  return (
    <svg
      className={`tile-img pedra-flor pedra-flor--${ehEstacao(flor) ? 'estacao' : 'flor'}`}
      viewBox="0 0 30 40"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="pedra-flor__face" x="1" y="1" width="28" height="38" rx="3.5" />
      <text className="pedra-flor__numero" x="5" y="10">
        {numero}
      </text>
      <text className="pedra-flor__hanzi" x="15" y="29" textAnchor="middle" lang="zh-Hans">
        {HANZI_FLORES[flor]}
      </text>
    </svg>
  )
}
