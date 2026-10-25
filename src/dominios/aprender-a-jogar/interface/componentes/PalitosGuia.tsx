/*
 * Os palitos de pontos (tenbou), desenhados no app como os de verdade: um
 * bastão reto com as marcas no meio. 100 tem 8 pontos pretos; 1.000, um ponto
 * vermelho; 5.000, um ponto vermelho com 4 em volta; 10.000, um ponto vermelho
 * com 6 em volta e um verde de cada lado. Preto em `currentColor` e o vermelho
 * do guia, então seguem o tema.
 */

const LARGURA = 160
const ALTURA = 22
const MEIO_X = LARGURA / 2
const MEIO_Y = ALTURA / 2

/** Verde dos pontos das pontas do 10.000. */
const VERDE = 'var(--guia-verde, #2e7d4f)'

interface Marca {
  x: number
  y: number
  raio: number
  cor: string
}

const ponto = (x: number, y: number, raio: number, cor: string): Marca => ({ x, y, raio, cor })

/** Pontos em volta do ponto do meio, como uma flor. */
const flor = (quantos: number, distancia: number, raio: number, giro = 0) =>
  Array.from({ length: quantos }, (_, indice) => {
    const angulo = giro + (indice * 2 * Math.PI) / quantos
    return ponto(
      MEIO_X + Math.cos(angulo) * distancia,
      MEIO_Y + Math.sin(angulo) * distancia,
      raio,
      'var(--guia-vermelho)',
    )
  })

/** Grade de pontos pretos no meio do palito. */
const grade = (colunas: number, linhas: number, passo: number, raio: number) =>
  Array.from({ length: colunas * linhas }, (_, indice) =>
    ponto(
      MEIO_X + ((indice % colunas) - (colunas - 1) / 2) * passo,
      MEIO_Y + (Math.floor(indice / colunas) - (linhas - 1) / 2) * passo,
      raio,
      'currentColor',
    ),
  )

const centro = (raio: number) => ponto(MEIO_X, MEIO_Y, raio, 'var(--guia-vermelho)')

interface Palito {
  valor: string
  quantos: number
  marcas: Marca[]
}

/** Os quatro palitos de quem começa com 25.000 pontos. */
const PALITOS: Palito[] = [
  {
    valor: '10.000',
    quantos: 1,
    marcas: [
      centro(3.2),
      ...flor(6, 6.4, 1.7, Math.PI / 6),
      ponto(MEIO_X - 26, MEIO_Y, 2.3, VERDE),
      ponto(MEIO_X + 26, MEIO_Y, 2.3, VERDE),
    ],
  },
  { valor: '5.000', quantos: 2, marcas: [centro(3.2), ...flor(4, 6.4, 1.8, Math.PI / 4)] },
  { valor: '1.000', quantos: 4, marcas: [centro(3.4)] },
  { valor: '100', quantos: 10, marcas: grade(4, 2, 5.4, 1.7) },
]

function DesenhoPalito({ palito }: { palito: Palito }) {
  return (
    <svg
      className="guia-palitos__svg"
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x={1.5}
        y={1.5}
        width={LARGURA - 3}
        height={ALTURA - 3}
        rx={3}
        fill="var(--guia-papel)"
        stroke="currentColor"
        strokeWidth={1.4}
      />
      {palito.marcas.map((marca) => (
        <circle
          key={`${marca.x.toFixed(1)}-${marca.y.toFixed(1)}`}
          cx={marca.x}
          cy={marca.y}
          r={marca.raio}
          fill={marca.cor}
        />
      ))}
    </svg>
  )
}

/** Lista dos palitos: o desenho, o valor e quantos cada jogador recebe. */
export default function PalitosGuia() {
  return (
    <ul className="guia-palitos">
      {PALITOS.map((palito) => (
        <li key={palito.valor} className="guia-palitos__item">
          <DesenhoPalito palito={palito} />
          <span className="guia-palitos__valor">
            {palito.valor} <span className="guia-palitos__quantos">× {palito.quantos}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
