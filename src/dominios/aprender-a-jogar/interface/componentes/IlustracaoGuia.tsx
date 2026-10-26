import { useId, type ReactNode } from 'react'
import type { IlustracaoGuia as IdIlustracao } from '../../conteudo/tipos'

/*
 * Ilustrações do guia em preto e branco, no traço de mangá: contorno de nanquim,
 * retícula de pontos nas costas das pedras, hachura no muro morto e um quadro
 * em volta. Desenhadas em SVG com `currentColor` (tinta) e o papel do guia,
 * então seguem o tema.
 *
 * Duas vistas:
 * - de lado, em perspectiva oblíqua (cada coluna com duas pedras deitadas);
 * - de cima, a mesa inteira: os quatro muros em quadrado, cada um na frente de
 *   um vento, com a abertura, o muro morto, o sentido da compra ou os descartes.
 *
 * Regra do muro (Wikipedia japonesa, 王牌 e ドラ): o muro morto são as 7 colunas
 * à direita da abertura (vista de quem montou o muro); o indicador é a pedra de
 * cima da 3ª coluna contando da abertura; as colunas 1 e 2 são as reposições
 * do kan; a compra começa à esquerda da abertura.
 */

// ── Vista de lado

/** Largura da borda de uma pedra deitada, altura de cada uma e o deslocamento da perspectiva. */
const LARGURA = 16
const ESPESSURA = 8
const FUNDO_X = 5
const FUNDO_Y = 8

interface Padroes {
  reticula: string
  hachura: string
  seta: string
}

interface PropsColuna {
  x: number
  /** Linha do chão (embaixo das bordas). */
  y: number
  padroes: Padroes
  /** Quantas pedras empilhadas (1 ou 2). */
  altura?: 1 | 2
  /** A pedra de cima virada para cima (indicador de dora). */
  virada?: boolean
  /** Coluna do muro morto: costas com hachura em vez de retícula. */
  morta?: boolean
}

const pontos = (lista: number[][]) => lista.map((ponto) => ponto.join(',')).join(' ')

/** Uma coluna do muro: lado direito, bordas da frente e o verso da pedra de cima. */
function Coluna({ x, y, padroes, altura = 2, virada = false, morta = false }: PropsColuna) {
  const costas = morta ? padroes.hachura : padroes.reticula
  const topo = y - ESPESSURA * altura
  const face = [
    [x, topo],
    [x + LARGURA, topo],
    [x + LARGURA + FUNDO_X, topo - FUNDO_Y],
    [x + FUNDO_X, topo - FUNDO_Y],
  ]
  const lado = [
    [x + LARGURA, y],
    [x + LARGURA, topo],
    [x + LARGURA + FUNDO_X, topo - FUNDO_Y],
    [x + LARGURA + FUNDO_X, y - FUNDO_Y],
  ]
  const centroX = x + (LARGURA + FUNDO_X) / 2
  const centroY = topo - FUNDO_Y / 2

  return (
    <g>
      {/* Papel por baixo dos padrões: o que ficou atrás não aparece entre os traços. */}
      <polygon points={pontos(lado)} fill="var(--guia-papel)" stroke="none" />
      <polygon points={pontos(lado)} fill={costas} />
      {Array.from({ length: altura }, (_, indice) => {
        const yBorda = y - ESPESSURA * (indice + 1)
        return (
          <g key={indice}>
            <rect x={x} y={yBorda} width={LARGURA} height={ESPESSURA} fill="var(--guia-papel)" />
            {/* Metade de baixo da borda é o verso, a de cima a face branca. */}
            <rect
              x={x}
              y={yBorda + ESPESSURA / 2}
              width={LARGURA}
              height={ESPESSURA / 2}
              fill={costas}
              stroke="none"
            />
            <rect x={x} y={yBorda} width={LARGURA} height={ESPESSURA} fill="none" />
          </g>
        )
      })}
      <polygon points={pontos(face)} fill="var(--guia-papel)" stroke="none" />
      {!virada && <polygon points={pontos(face)} fill={costas} stroke="none" />}
      <polygon points={pontos(face)} fill="none" />
      {virada && (
        // Três círculos, como um 3 de Pin desenhado a nanquim.
        <g fill={VERMELHO} stroke="none">
          <circle cx={centroX - 4} cy={centroY + 2} r={1.3} />
          <circle cx={centroX} cy={centroY} r={1.3} />
          <circle cx={centroX + 4} cy={centroY - 2} r={1.3} />
        </g>
      )}
    </g>
  )
}

/** Quadro de página de mangá, com a retícula, a hachura e a ponta de seta. */
function Quadro({
  largura,
  altura,
  id,
  alt,
  children,
}: {
  largura: number
  altura: number
  id: string
  alt: string
  children: ReactNode
}) {
  return (
    <svg
      className="guia-ilustracao__svg"
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label={alt}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <pattern id={`${id}-reticula`} width={3.2} height={3.2} patternUnits="userSpaceOnUse">
          <circle cx={1.6} cy={1.6} r={0.75} fill="currentColor" stroke="none" />
        </pattern>
        <pattern
          id={`${id}-hachura`}
          width={3.4}
          height={3.4}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={3.4} stroke="currentColor" strokeWidth={1.5} />
        </pattern>
        <marker
          id={`${id}-seta`}
          viewBox="0 0 10 10"
          refX={7}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={VERMELHO} stroke="none" />
        </marker>
      </defs>
      <rect
        x={2}
        y={2}
        width={largura - 4}
        height={altura - 4}
        rx={4}
        fill="var(--guia-papel)"
        strokeWidth={2.6}
      />
      {children}
    </svg>
  )
}

/**
 * Cor de destaque, como a tinta vermelha num mangá em preto e branco: o corte
 * da abertura, a contagem, o muro morto, o indicador e a seta da compra.
 */
const VERMELHO = 'var(--guia-vermelho)'

const estiloTexto = {
  fill: 'currentColor',
  stroke: 'none',
  fontSize: 11,
  fontWeight: 700,
  fontFamily: 'inherit',
} as const

function Texto({
  x,
  y,
  children,
  ancora = 'middle',
  tamanho = 11,
  peso = 700,
  destaque = false,
}: {
  x: number
  y: number
  children: ReactNode
  ancora?: 'start' | 'middle' | 'end'
  tamanho?: number
  peso?: number
  /** Em vermelho: as partes que a pessoa precisa achar no desenho. */
  destaque?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={ancora}
      style={{
        ...estiloTexto,
        fontSize: tamanho,
        fontWeight: peso,
        fill: destaque ? VERMELHO : estiloTexto.fill,
      }}
    >
      {children}
    </text>
  )
}

/** Chave horizontal (├────┤) para medir um trecho. */
function Medida({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <path d={`M${x1} ${y - 4} V${y} H${x2} V${y - 4}`} strokeWidth={1.2} />
}

/** 17 colunas de 2 pedras: um muro, o que cada jogador monta à sua frente. */
function MuroFileira({ padroes, id, alt }: PropsDesenho) {
  const inicio = 14
  const chao = 118
  const fim = inicio + LARGURA * 17
  const escala = 2.4
  return (
    <Quadro largura={322} altura={160} id={id} alt={alt}>
      {/* Detalhe ampliado de uma coluna, como um quadro de close no mangá. */}
      <g transform={`translate(22 10) scale(${escala})`} strokeWidth={(1.4 / escala) * 1.6}>
        <Coluna x={0} y={ESPESSURA * 2 + FUNDO_Y + 2} padroes={padroes} />
      </g>
      <Texto x={90} y={40} ancora="start">
        1 coluna = 2 pedras
      </Texto>
      <Texto x={90} y={56} ancora="start" peso={500}>
        uma deitada em cima da outra
      </Texto>
      <path
        d={`M42 76 L${inicio + LARGURA / 2} ${chao - ESPESSURA * 2 - FUNDO_Y - 2}`}
        strokeDasharray="2 3"
        strokeWidth={1}
      />
      {Array.from({ length: 17 }, (_, indice) => (
        <Coluna key={indice} x={inicio + indice * LARGURA} y={chao} padroes={padroes} />
      ))}
      <Medida x1={inicio} x2={fim} y={132} />
      <Texto x={(inicio + fim) / 2} y={148}>
        17 pedras de comprimento
      </Texto>
    </Quadro>
  )
}

/**
 * Linha guia de um rótulo até o ponto do desenho: sai logo abaixo do texto e
 * termina numa bolinha em cima do alvo. Os rótulos ficam todos fora do muro,
 * em faixas próprias, para nenhum texto passar por cima de outro nem do desenho.
 */
function LinhaGuia({
  x1,
  y1,
  x2,
  y2,
  destaque = false,
  tracejada = false,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  destaque?: boolean
  tracejada?: boolean
}) {
  const cor = destaque ? VERMELHO : 'currentColor'
  return (
    <g>
      <path
        d={`M${x1} ${y1} L${x2} ${y2}`}
        stroke={cor}
        strokeWidth={1.3}
        strokeDasharray={tracejada ? '3 2' : undefined}
      />
      <circle cx={x2} cy={y2} r={1.9} fill={cor} stroke="none" />
    </g>
  )
}

/** Tamanho dos rótulos do muro morto: um pouco maior, para ler bem a 360px. */
const ROTULO = 12

/**
 * Close do muro aberto, de frente para quem montou: à esquerda o muro de onde
 * se compra, a abertura e as 7 colunas do muro morto. A coluna 3 (contando da
 * abertura) tem o indicador de dora virado.
 *
 * Com `kan`, o desenho de depois de um kan: as colunas numeradas, a pedra de
 * cima da coluna 1 (a reposição) sozinha na mesa, ao lado, e a coluna 4 com o
 * indicador do kan dora virado.
 *
 * Os rótulos ficam em três faixas fora do muro: duas em cima (y 24 e 46) e uma
 * embaixo. Cada um tem a sua faixa de x, e as linhas guia descem na vertical
 * sem cruzar outro texto. Legível a partir de 360px de largura (o quadro
 * encolhe para ~300px e o texto fica com ~11px).
 */
function MuroMorto({ padroes, id, alt, kan = false }: PropsDesenho & { kan?: boolean }) {
  const chao = 100
  const inicioVivo = 14
  const colunasVivas = 5
  const fimVivo = inicioVivo + colunasVivas * LARGURA
  // Com kan o vão é maior: a reposição fica nele, longe do corte da abertura.
  const vao = kan ? 44 : 28
  const inicioMorto = fimVivo + vao
  const xCorte = inicioMorto - (kan ? 7 : vao / 2)
  const colunaX = (numero: number) => inicioMorto + (numero - 1) * LARGURA
  const fimMorto = colunaX(8)
  const centroColuna = (numero: number) => colunaX(numero) + (LARGURA + FUNDO_X) / 2
  const topoColuna = (altura: 1 | 2) => chao - ESPESSURA * altura - FUNDO_Y
  const xSolta = fimVivo + 6
  const largura = kan ? 340 : 322

  return (
    <Quadro largura={largura} altura={160} id={id} alt={alt}>
      {Array.from({ length: colunasVivas }, (_, indice) => (
        <Coluna
          key={`vivo-${indice}`}
          x={inicioVivo + indice * LARGURA}
          y={chao}
          padroes={padroes}
        />
      ))}
      {Array.from({ length: 7 }, (_, indice) => {
        const numero = indice + 1
        return (
          <g key={`morto-${numero}`}>
            <Coluna
              x={colunaX(numero)}
              y={chao}
              padroes={padroes}
              morta
              // Depois do kan a pedra de cima da coluna 1 desceu para a mesa.
              altura={kan && numero === 1 ? 1 : 2}
              virada={numero === 3 || (kan && numero === 4)}
            />
            {kan && (
              <Texto x={colunaX(numero) + LARGURA / 2} y={chao + 11} tamanho={8} peso={600}>
                {numero}
              </Texto>
            )}
          </g>
        )
      })}
      {kan && <Coluna x={xSolta} y={chao} padroes={padroes} altura={1} morta />}

      {/* Corte da abertura: tracejado vermelho no vão, do rótulo até o chão. */}
      <path
        d={`M${xCorte} 28 V${chao + 4}`}
        stroke={VERMELHO}
        strokeDasharray="3 2"
        strokeWidth={1.8}
      />

      {/* Faixa de cima (y 24): abertura à esquerda do corte, indicador à direita. */}
      <Texto tamanho={ROTULO} x={xCorte - 4} y={24} ancora="end" destaque>
        abertura
      </Texto>
      <Texto tamanho={ROTULO} x={centroColuna(3) - 4} y={24} ancora="start" destaque>
        indicador de dora
      </Texto>
      <LinhaGuia
        x1={centroColuna(3)}
        y1={29}
        x2={centroColuna(3)}
        y2={topoColuna(2) + FUNDO_Y / 2}
        destaque
      />

      {kan && (
        <>
          {/* Faixa do meio (y 46): reposição à esquerda, kan dora à direita. */}
          <Texto tamanho={ROTULO} x={10} y={46} ancora="start">
            reposição do kan
          </Texto>
          <LinhaGuia
            x1={xSolta + (LARGURA + FUNDO_X) / 2}
            y1={51}
            x2={xSolta + (LARGURA + FUNDO_X) / 2}
            y2={topoColuna(1) + FUNDO_Y / 2}
          />
          <Texto tamanho={ROTULO} x={centroColuna(4) + 6} y={46} ancora="start" destaque>
            kan dora
          </Texto>
          <LinhaGuia
            x1={centroColuna(4)}
            y1={42}
            x2={centroColuna(4)}
            y2={topoColuna(2) + FUNDO_Y / 2}
            destaque
          />
        </>
      )}

      {/* Faixa de baixo: compras sob o muro vivo, a chave e o nome sob o muro morto. */}
      <Texto tamanho={ROTULO} x={inicioVivo + (colunasVivas * LARGURA) / 2} y={124}>
        ← compras
      </Texto>
      <Medida x1={inicioMorto} x2={fimMorto} y={128} />
      <Texto tamanho={ROTULO} x={(inicioMorto + fimMorto) / 2} y={145} destaque>
        muro morto (14 pedras)
      </Texto>
    </Quadro>
  )
}

// ── Vista de cima

type Vento = 'leste' | 'sul' | 'oeste' | 'norte'

/**
 * Ordem dos muros no sentido da compra (horário, visto de cima): depois do
 * muro do Leste vem o do Norte (o jogador à esquerda dele), e assim por diante.
 */
const SENTIDO_COMPRA: Vento[] = ['leste', 'norte', 'oeste', 'sul']

/** Os jogadores a partir do oya, em sentido anti-horário: é assim que se contam os dados. */
const CONTAGEM_DADOS: Vento[] = ['leste', 'sul', 'oeste', 'norte']

/** Somas dos dados que abrem o muro de um vento (Leste: 1 · 5 · 9; Norte: 4 · 8 · 12). */
const numerosDoVento = (vento: Vento) =>
  [0, 4, 8]
    .map((volta) => CONTAGEM_DADOS.indexOf(vento) + 1 + volta)
    .filter((numero) => numero <= 12)
    .join(' · ')

const NOME_VENTO: Record<Vento, string> = {
  leste: 'Leste',
  sul: 'Sul',
  oeste: 'Oeste',
  norte: 'Norte',
}

/**
 * Geometria da mesa vista de cima. Cada muro fica centrado na frente do seu
 * jogador, a `raio` do centro, com um vão em cada canto: na mesa de verdade
 * os muros não se encostam nem formam um quadrado perfeito.
 */
const MESA = { cx: 190, cy: 172, comprimento: 187, grossura: 14, raio: 187 / 2 + 22 }
const PASSO = MESA.comprimento / 17
const CENTRO = { x: MESA.cx, y: MESA.cy }

/** Coluna `numero` (1 a 17) de um muro, contada a partir da ponta direita de quem o montou. */
function retanguloColuna(vento: Vento, numero: number) {
  const { cx, cy, comprimento, grossura, raio } = MESA
  const meio = comprimento / 2
  switch (vento) {
    // Leste embaixo, olhando para cima: a direita dele é a direita do desenho.
    case 'leste':
      return {
        x: cx + meio - numero * PASSO,
        y: cy + raio - grossura / 2,
        largura: PASSO,
        altura: grossura,
      }
    // Sul à direita, olhando para a esquerda: a direita dele é o alto do desenho.
    case 'sul':
      return {
        x: cx + raio - grossura / 2,
        y: cy - meio + (numero - 1) * PASSO,
        largura: grossura,
        altura: PASSO,
      }
    // Oeste em cima, olhando para baixo: a direita dele é a esquerda do desenho.
    case 'oeste':
      return {
        x: cx - meio + (numero - 1) * PASSO,
        y: cy - raio - grossura / 2,
        largura: PASSO,
        altura: grossura,
      }
    // Norte à esquerda, olhando para a direita: a direita dele é o pé do desenho.
    case 'norte':
      return {
        x: cx - raio - grossura / 2,
        y: cy + meio - numero * PASSO,
        largura: grossura,
        altura: PASSO,
      }
  }
}

/** Para dentro da mesa, a partir do meio de uma coluna (onde vão as setas e os números). */
function paraDentro(vento: Vento, x: number, y: number, distancia: number) {
  if (vento === 'leste') return { x, y: y - distancia }
  if (vento === 'sul') return { x: x - distancia, y }
  if (vento === 'oeste') return { x, y: y + distancia }
  return { x: x + distancia, y }
}

interface ColunaMesa {
  vento: Vento
  k: number
}

/** Volta inteira do muro no sentido da compra: 68 colunas. */
const VOLTA: ColunaMesa[] = SENTIDO_COMPRA.flatMap((vento) =>
  Array.from({ length: 17 }, (_, indice) => ({ vento, k: indice + 1 })),
)

const indiceNaVolta = (coluna: ColunaMesa) =>
  VOLTA.findIndex((item) => item.vento === coluna.vento && item.k === coluna.k)

const naVolta = (indice: number) => VOLTA[(indice + VOLTA.length * 2) % VOLTA.length]

/**
 * Onde a mesa abre com a soma dos dados: o muro de quem a contagem alcança
 * (o oya é o 1, anti-horário) e, nele, depois de tantas colunas a partir da
 * ponta direita. Devolve o muro morto (colunas 1 a 7, a partir da abertura,
 * dobrando para o muro vizinho se precisar) e o começo da compra.
 */
function abrirMesa(dados: number) {
  const vento = CONTAGEM_DADOS[(dados - 1) % 4]
  const ultimaMorta = indiceNaVolta({ vento, k: dados })
  const morto = Array.from({ length: 7 }, (_, indice) => naVolta(ultimaMorta - indice))
  return { vento, morto, inicioCompra: ultimaMorta + 1 }
}

const chave = (coluna: ColunaMesa) => `${coluna.vento}-${coluna.k}`

/** Um dado com a face de cima à mostra. */
function Dado({ cx, cy, giro, valor }: { cx: number; cy: number; giro: number; valor: number }) {
  const pips: Record<number, number[][]> = {
    1: [[0, 0]],
    2: [
      [-4, -4],
      [4, 4],
    ],
    3: [
      [-4, -4],
      [0, 0],
      [4, 4],
    ],
    4: [
      [-4, -4],
      [4, -4],
      [-4, 4],
      [4, 4],
    ],
    5: [
      [-4, -4],
      [4, -4],
      [0, 0],
      [-4, 4],
      [4, 4],
    ],
    6: [
      [-4, -4],
      [4, -4],
      [-4, 0],
      [4, 0],
      [-4, 4],
      [4, 4],
    ],
  }
  return (
    <g transform={`rotate(${giro} ${cx} ${cy})`}>
      <rect
        x={cx - 9}
        y={cy - 9}
        width={18}
        height={18}
        rx={3.5}
        fill="var(--guia-papel)"
        strokeWidth={1.6}
      />
      {pips[valor].map(([px, py]) => (
        <circle
          key={`${px}-${py}`}
          cx={cx + px}
          cy={cy + py}
          r={1.8}
          fill="currentColor"
          stroke="none"
        />
      ))}
    </g>
  )
}

/** Um descarte visto de cima: face branca com um rabisco de nanquim. */
function Descarte({ x, y, deLado = false }: { x: number; y: number; deLado?: boolean }) {
  const largura = deLado ? 15 : 11
  const altura = deLado ? 11 : 15
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={largura}
        height={altura}
        rx={1.5}
        fill="var(--guia-papel)"
        strokeWidth={1}
      />
      <path
        d={`M${x + 2.5} ${y + altura / 2 - 1.5} h${largura - 5} M${x + 2.5} ${y + altura / 2 + 1.5} h${largura - 6}`}
        strokeWidth={0.8}
      />
    </g>
  )
}

interface OpcoesMesa {
  /** Soma dos dados: mostra os dados no meio e abre o muro desse jeito. */
  dados?: [number, number]
  /** Números da contagem dos dados ao lado de cada vento (1 · 5 · 9…). */
  contagem?: boolean
  /** Numera as colunas contadas a partir da ponta direita do muro sorteado. */
  contarColunas?: boolean
  /** Marca a abertura. */
  abertura?: boolean
  /** Hachura no muro morto e o indicador virado. */
  muroMorto?: boolean
  /** Seta no sentido da compra, a partir da abertura. */
  compra?: boolean
  /** Fileiras de descartes na frente de cada jogador e o centro da mesa. */
  descartes?: boolean
  /**
   * Um pon do Leste aberto à direita dele, do lado de fora do muro: a pedra
   * pegada do Norte (à esquerda dele) fica de lado, na ponta esquerda.
   */
  chamada?: boolean
  /** Centerpiece no meio, com os números dos dados de cada muro virados para cada jogador. */
  centerpiece?: boolean
  /** Textos extras dentro da mesa. */
  rotulos?: {
    x: number
    y: number
    texto: string
    ancora?: 'start' | 'middle' | 'end'
    /** Em vermelho (o que a pessoa precisa achar). */
    destaque?: boolean
  }[]
}

/** A mesa vista de cima, com os quatro muros e o que cada ilustração destaca. */
function Mesa({ padroes, id, alt, opcoes }: PropsDesenho & { opcoes: OpcoesMesa }) {
  const { comprimento, grossura } = MESA
  const soma = opcoes.dados ? opcoes.dados[0] + opcoes.dados[1] : 0
  const abertura = soma ? abrirMesa(soma) : null
  const mortas = new Set(opcoes.muroMorto && abertura ? abertura.morto.map(chave) : [])
  const indicador = opcoes.muroMorto && abertura ? chave(abertura.morto[2]) : null

  const muro = (vento: Vento) => {
    const primeira = retanguloColuna(vento, 1)
    const ultima = retanguloColuna(vento, 17)
    const x = Math.min(primeira.x, ultima.x)
    const y = Math.min(primeira.y, ultima.y)
    const horizontal = vento === 'leste' || vento === 'oeste'
    const largura = horizontal ? comprimento : grossura
    const altura = horizontal ? grossura : comprimento
    return (
      <g key={vento}>
        {/* Sombra: a pedra de baixo, aparecendo embaixo da de cima. */}
        <rect x={x + 2.5} y={y + 2.5} width={largura} height={altura} fill="currentColor" />
        {Array.from({ length: 17 }, (_, indice) => {
          const numero = indice + 1
          const retangulo = retanguloColuna(vento, numero)
          const id_ = `${vento}-${numero}`
          const fundo =
            id_ === indicador
              ? 'var(--guia-papel)'
              : mortas.has(id_)
                ? padroes.hachura
                : padroes.reticula
          return (
            <g key={numero}>
              <rect
                x={retangulo.x}
                y={retangulo.y}
                width={retangulo.largura}
                height={retangulo.altura}
                fill="var(--guia-papel)"
                stroke="none"
              />
              <rect
                x={retangulo.x}
                y={retangulo.y}
                width={retangulo.largura}
                height={retangulo.altura}
                fill={fundo}
                // Muro morto com contorno grosso, para se destacar do resto do muro.
                strokeWidth={mortas.has(id_) ? 1.8 : 0.9}
              />
              {id_ === indicador && (
                <circle
                  cx={retangulo.x + retangulo.largura / 2}
                  cy={retangulo.y + retangulo.altura / 2}
                  r={2.4}
                  fill={VERMELHO}
                  stroke="none"
                />
              )}
            </g>
          )
        })}
        <rect x={x} y={y} width={largura} height={altura} />
      </g>
    )
  }

  const centroColuna = (coluna: ColunaMesa) => {
    const retangulo = retanguloColuna(coluna.vento, coluna.k)
    return { x: retangulo.x + retangulo.largura / 2, y: retangulo.y + retangulo.altura / 2 }
  }

  /** Corte da abertura: um vão no muro e uma tesourada tracejada para fora. */
  const corte = () => {
    if (!abertura) return null
    const ultimaMorta = abertura.morto[0]
    const retangulo = retanguloColuna(ultimaMorta.vento, ultimaMorta.k)
    const { vento } = ultimaMorta
    // Borda da coluna do lado da compra (k + 1).
    const pontosCorte = {
      leste: { x: retangulo.x, y1: retangulo.y - 4, y2: retangulo.y + grossura + 14 },
      sul: {
        y: retangulo.y + retangulo.altura,
        x1: retangulo.x - 4,
        x2: retangulo.x + grossura + 14,
      },
      oeste: {
        x: retangulo.x + retangulo.largura,
        y1: retangulo.y + grossura + 4,
        y2: retangulo.y - 14,
      },
      norte: { y: retangulo.y, x1: retangulo.x + grossura + 4, x2: retangulo.x - 14 },
    }[vento]
    const vertical = 'x' in pontosCorte
    return (
      <g>
        {vertical ? (
          <>
            <line
              x1={pontosCorte.x}
              y1={retangulo.y - 1}
              x2={pontosCorte.x}
              y2={retangulo.y + grossura + 3}
              stroke="var(--guia-papel)"
              strokeWidth={3.4}
            />
            <line
              x1={pontosCorte.x}
              y1={pontosCorte.y1}
              x2={pontosCorte.x}
              y2={pontosCorte.y2}
              stroke={VERMELHO}
              strokeDasharray="3 2"
              strokeWidth={2.2}
            />
          </>
        ) : (
          <>
            <line
              x1={retangulo.x - 1}
              y1={pontosCorte.y}
              x2={retangulo.x + grossura + 3}
              y2={pontosCorte.y}
              stroke="var(--guia-papel)"
              strokeWidth={3.4}
            />
            <line
              x1={pontosCorte.x1}
              y1={pontosCorte.y}
              x2={pontosCorte.x2}
              y2={pontosCorte.y}
              stroke={VERMELHO}
              strokeDasharray="3 2"
              strokeWidth={2.2}
            />
          </>
        )}
      </g>
    )
  }

  const setaCompra = () => {
    if (!abertura) return null
    const trajeto = Array.from({ length: 26 }, (_, indice) => {
      const coluna = naVolta(abertura.inicioCompra + indice)
      const centro = centroColuna(coluna)
      return paraDentro(coluna.vento, centro.x, centro.y, grossura / 2 + 12)
    })
    return (
      <polyline
        points={trajeto.map((ponto) => `${ponto.x},${ponto.y}`).join(' ')}
        stroke={VERMELHO}
        strokeWidth={2.4}
        markerEnd={padroes.seta}
      />
    )
  }

  const numerosColunas = () => {
    if (!abertura) return null
    // O número vai dentro da própria coluna (em branco, com contorno vermelho):
    // fora dela, na esquina, ele cairia em cima do muro vizinho.
    return Array.from({ length: soma }, (_, indice) => {
      const numero = indice + 1
      const retangulo = retanguloColuna(abertura.vento, numero)
      const centro = centroColuna({ vento: abertura.vento, k: numero })
      return (
        <g key={numero}>
          <rect
            x={retangulo.x}
            y={retangulo.y}
            width={retangulo.largura}
            height={retangulo.altura}
            fill="var(--guia-papel)"
            stroke={VERMELHO}
            strokeWidth={1.6}
          />
          <Texto x={centro.x} y={centro.y + 3.3} tamanho={9} peso={800} destaque>
            {numero}
          </Texto>
        </g>
      )
    })
  }

  const descartes = () => {
    // Fileiras de 6 na frente do Leste; os outros são o mesmo desenho girado.
    const fileiras = (deLado?: number) => (
      <g>
        {Array.from({ length: 6 }, (_, indice) => (
          <Descarte key={`a${indice}`} x={CENTRO.x - 36 + indice * 12} y={DENTRO.base - 60} />
        ))}
        {Array.from({ length: 3 }, (_, indice) => (
          <Descarte
            key={`b${indice}`}
            x={CENTRO.x - 36 + indice * 12 + (deLado !== undefined && indice > deLado ? 4 : 0)}
            y={DENTRO.base - 43}
            deLado={indice === deLado}
          />
        ))}
      </g>
    )
    return (
      <g>
        {fileiras()}
        <g transform={`rotate(-90 ${CENTRO.x} ${CENTRO.y})`}>{fileiras(1)}</g>
        <g transform={`rotate(180 ${CENTRO.x} ${CENTRO.y})`}>{fileiras()}</g>
        <g transform={`rotate(90 ${CENTRO.x} ${CENTRO.y})`}>{fileiras()}</g>
        {/* Centro da mesa: a peça do meio, com o vento da rodada. */}
        <rect
          x={CENTRO.x - 22}
          y={CENTRO.y - 22}
          width={44}
          height={44}
          rx={5}
          fill="var(--guia-papel)"
          strokeWidth={2}
        />
        <rect
          x={CENTRO.x - 18}
          y={CENTRO.y - 18}
          width={36}
          height={36}
          rx={3}
          fill={padroes.reticula}
          strokeWidth={0.8}
        />
        <circle cx={CENTRO.x} cy={CENTRO.y} r={11} fill="var(--guia-papel)" strokeWidth={1.4} />
        <text
          x={CENTRO.x}
          y={CENTRO.y + 4.5}
          textAnchor="middle"
          style={{ ...estiloTexto, fontSize: 13, fontWeight: 800 }}
          lang="ja"
        >
          東
        </text>
      </g>
    )
  }

  /**
   * Centerpiece no meio da mesa: o vento da rodada no centro e, em cada lado,
   * virados para o jogador, os números dos dados que abrem o muro dele.
   */
  const centerpiece = () => {
    const meio = 56
    const giros: Record<Vento, number> = { leste: 0, sul: -90, oeste: 180, norte: 90 }
    return (
      <g>
        <rect
          x={CENTRO.x - meio}
          y={CENTRO.y - meio}
          width={meio * 2}
          height={meio * 2}
          rx={8}
          fill="var(--guia-papel)"
          strokeWidth={2.2}
        />
        <rect
          x={CENTRO.x - meio + 5}
          y={CENTRO.y - meio + 5}
          width={(meio - 5) * 2}
          height={(meio - 5) * 2}
          rx={5}
          fill={padroes.reticula}
          strokeWidth={0.8}
        />
        <circle cx={CENTRO.x} cy={CENTRO.y} r={17} fill="var(--guia-papel)" strokeWidth={1.4} />
        <text
          x={CENTRO.x}
          y={CENTRO.y + 6.2}
          textAnchor="middle"
          style={{ ...estiloTexto, fontSize: 18, fontWeight: 800 }}
          lang="ja"
        >
          東
        </text>
        {(Object.keys(giros) as Vento[]).map((vento) => (
          <g key={vento} transform={`rotate(${giros[vento]} ${CENTRO.x} ${CENTRO.y})`}>
            {/* Faixa de papel embaixo do número, para ele ler bem sobre a retícula. */}
            <rect
              x={CENTRO.x - 31}
              y={CENTRO.y + meio - 22}
              width={62}
              height={16}
              rx={3}
              fill="var(--guia-papel)"
              stroke="none"
            />
            <Texto x={CENTRO.x} y={CENTRO.y + meio - 10} tamanho={12.5} peso={800} destaque>
              {numerosDoVento(vento)}
            </Texto>
          </g>
        ))}
      </g>
    )
  }

  const rotuloVento = (vento: Vento) => {
    const textoNumeros = numerosDoVento(vento)
    const destaque = abertura?.vento === vento && opcoes.contagem
    const posicoes: Record<Vento, { x: number; y: number; ancora: 'start' | 'middle' | 'end' }> = {
      leste: { x: CENTRO.x, y: FORA.base + 22, ancora: 'middle' },
      oeste: { x: CENTRO.x, y: FORA.topo - 26, ancora: 'middle' },
      sul: { x: FORA.direita + 10, y: CENTRO.y - 4, ancora: 'start' },
      norte: { x: FORA.esquerda - 10, y: CENTRO.y - 4, ancora: 'end' },
    }
    const { x, y, ancora } = posicoes[vento]
    return (
      <g key={vento}>
        <Texto x={x} y={y} ancora={ancora} tamanho={12} peso={800}>
          {NOME_VENTO[vento]}
          {vento === 'leste' ? ' (oya)' : ''}
        </Texto>
        {opcoes.contagem && (
          <Texto x={x} y={y + 14} ancora={ancora} tamanho={10} peso={destaque ? 800 : 500}>
            {textoNumeros}
          </Texto>
        )}
        {destaque && (
          <path
            d={`M${ancora === 'end' ? x - 52 : ancora === 'start' ? x : x - 26} ${y + 18} h52`}
            strokeWidth={1.6}
          />
        )}
      </g>
    )
  }

  return (
    <Quadro largura={380} altura={346} id={id} alt={alt}>
      {SENTIDO_COMPRA.map(muro)}
      {/* Contorno vermelho do muro morto, por cima dos contornos pretos dos muros. */}
      {abertura &&
        opcoes.muroMorto &&
        abertura.morto.map((coluna) => {
          const retangulo = retanguloColuna(coluna.vento, coluna.k)
          return (
            <rect
              key={chave(coluna)}
              x={retangulo.x}
              y={retangulo.y}
              width={retangulo.largura}
              height={retangulo.altura}
              stroke={VERMELHO}
              strokeWidth={1.8}
            />
          )
        })}
      {opcoes.abertura && corte()}
      {opcoes.contarColunas && numerosColunas()}
      {opcoes.compra && setaCompra()}
      {opcoes.descartes && descartes()}
      {opcoes.chamada && (
        <g>
          {/* Um pouco maior que os descartes, para a chamada aparecer: a de lado
              (15 de largura) e mais duas em pé (11), com 1 de folga. */}
          <g transform={`translate(${CENTRO.x + 60} ${FORA.base + 3}) scale(1.3)`}>
            <Descarte x={0} y={4} deLado />
            <Descarte x={16} y={0} />
            <Descarte x={28} y={0} />
          </g>
          <Texto x={CENTRO.x + 85} y={FORA.base + 36} tamanho={10} destaque>
            pon (chamada)
          </Texto>
        </g>
      )}
      {opcoes.centerpiece && centerpiece()}
      {opcoes.dados && !opcoes.descartes && !opcoes.centerpiece && (
        <>
          <Dado cx={CENTRO.x - 14} cy={CENTRO.y + 2} giro={-12} valor={opcoes.dados[0]} />
          <Dado cx={CENTRO.x + 14} cy={CENTRO.y - 6} giro={16} valor={opcoes.dados[1]} />
        </>
      )}
      {(['leste', 'sul', 'oeste', 'norte'] as Vento[]).map(rotuloVento)}
      {opcoes.rotulos?.map((rotulo) => (
        <Texto
          key={rotulo.texto}
          x={rotulo.x}
          y={rotulo.y}
          ancora={rotulo.ancora}
          destaque={rotulo.destaque}
          tamanho={11.5}
          peso={700}
        >
          {rotulo.texto}
        </Texto>
      ))}
    </Quadro>
  )
}

interface PropsDesenho {
  padroes: Padroes
  id: string
  alt: string
}

/** Pontos de referência para os rótulos dentro da mesa. */
const DENTRO = {
  topo: MESA.cy - MESA.raio + MESA.grossura / 2,
  base: MESA.cy + MESA.raio - MESA.grossura / 2,
  esquerda: MESA.cx - MESA.raio + MESA.grossura / 2,
  direita: MESA.cx + MESA.raio - MESA.grossura / 2,
}

/** Bordas de fora dos muros (onde vão os nomes dos ventos). */
const FORA = {
  topo: MESA.cy - MESA.raio - MESA.grossura / 2,
  base: MESA.cy + MESA.raio + MESA.grossura / 2,
  esquerda: MESA.cx - MESA.raio - MESA.grossura / 2,
  direita: MESA.cx + MESA.raio + MESA.grossura / 2,
}

/**
 * Os quatro lugares em volta da mesa, vistos de cima, com o vento de cada um
 * (Leste embaixo, Sul à direita, Oeste em cima, Norte à esquerda) e setas
 * vermelhas no sentido em que a vez passa: para a direita de quem jogou, que
 * visto de cima é o sentido anti-horário.
 */
function MesaVentos({ padroes, id, alt }: PropsDesenho) {
  const largura = 320
  const altura = 330
  const cx = largura / 2
  const cy = altura / 2
  const meioMesa = 70
  const raioLugar = 112
  const raioSeta = 50
  const lugares: { vento: Vento; kanji: string; angulo: number }[] = [
    { vento: 'leste', kanji: '東', angulo: 90 },
    { vento: 'sul', kanji: '南', angulo: 0 },
    { vento: 'oeste', kanji: '西', angulo: -90 },
    { vento: 'norte', kanji: '北', angulo: 180 },
  ]
  const ponto = (graus: number, raio: number) => {
    const radianos = (graus * Math.PI) / 180
    return { x: cx + Math.cos(radianos) * raio, y: cy + Math.sin(radianos) * raio }
  }
  // Cada seta vai de um lugar ao seguinte (ângulo diminuindo = anti-horário na tela).
  const setas = lugares.map(({ angulo }) => {
    const inicio = ponto(angulo - 22, raioSeta)
    const fim = ponto(angulo - 68, raioSeta)
    return `M${inicio.x} ${inicio.y} A${raioSeta} ${raioSeta} 0 0 0 ${fim.x} ${fim.y}`
  })
  const rotulos: Record<Vento, { x: number; y: number }> = {
    leste: { x: cx, y: cy + raioLugar + 36 },
    oeste: { x: cx, y: cy - raioLugar - 28 },
    sul: { x: cx + raioLugar, y: cy + 40 },
    norte: { x: cx - raioLugar, y: cy + 40 },
  }

  return (
    <Quadro largura={largura} altura={altura} id={id} alt={alt}>
      <rect
        x={cx - meioMesa}
        y={cy - meioMesa}
        width={meioMesa * 2}
        height={meioMesa * 2}
        rx={10}
        fill={padroes.reticula}
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy} r={raioSeta + 12} fill="var(--guia-papel)" stroke="none" />
      {setas.map((trajeto) => (
        <path
          key={trajeto}
          d={trajeto}
          stroke={VERMELHO}
          strokeWidth={2.4}
          markerEnd={padroes.seta}
        />
      ))}
      <Texto x={cx} y={cy - 2} tamanho={11}>
        ordem
      </Texto>
      <Texto x={cx} y={cy + 12} tamanho={11}>
        da vez
      </Texto>
      {lugares.map(({ vento, kanji, angulo }) => {
        const lugar = ponto(angulo, raioLugar)
        return (
          <g key={vento}>
            <circle
              cx={lugar.x}
              cy={lugar.y}
              r={20}
              fill="var(--guia-papel)"
              strokeWidth={vento === 'leste' ? 2.6 : 1.8}
            />
            <text
              x={lugar.x}
              y={lugar.y + 6.5}
              textAnchor="middle"
              style={{ ...estiloTexto, fontSize: 18, fontWeight: 800 }}
              lang="ja"
            >
              {kanji}
            </text>
            <Texto
              x={rotulos[vento].x}
              y={rotulos[vento].y}
              tamanho={12}
              peso={800}
              destaque={vento === 'leste'}
            >
              {NOME_VENTO[vento]}
              {vento === 'leste' ? ' (oya)' : ''}
            </Texto>
          </g>
        )
      })}
    </Quadro>
  )
}

/*
 * Exemplo de todas as vistas de cima: dados 2 + 3 = 5. A contagem dá a volta e
 * para no próprio oya (Leste), e o muro morto não cabe no muro dele: 5 colunas
 * no Leste e 2 no Sul.
 */
const DADOS_EXEMPLO: [number, number] = [2, 3]

const ILUSTRACOES: Record<IdIlustracao, (props: PropsDesenho) => ReactNode> = {
  muroFileira: MuroFileira,
  mesaVentos: MesaVentos,
  muroQuadrado: (props) => <Mesa {...props} opcoes={{ centerpiece: true }} />,
  mesaDados: (props) => (
    <Mesa
      {...props}
      opcoes={{
        dados: DADOS_EXEMPLO,
        contagem: true,
        rotulos: [
          { x: CENTRO.x, y: CENTRO.y + 34, texto: '2 + 3 = 5 → Leste (o oya)', destaque: true },
        ],
      }}
    />
  ),
  mesaAbertura: (props) => (
    <Mesa
      {...props}
      opcoes={{
        dados: DADOS_EXEMPLO,
        contarColunas: true,
        abertura: true,
        rotulos: [
          {
            x: DENTRO.direita - 6,
            y: DENTRO.base - 46,
            texto: '1 = a ponta direita',
            ancora: 'end',
          },
          {
            x: DENTRO.direita - 6,
            y: DENTRO.base - 32,
            texto: 'de quem senta no Leste',
            ancora: 'end',
          },
          {
            x: retanguloColuna('leste', 5).x - 3,
            y: DENTRO.base - 16,
            texto: 'abre depois da 5ª ↘',
            ancora: 'end',
            destaque: true,
          },
        ],
      }}
    />
  ),
  muroMorto: MuroMorto,
  muroMortoKan: (props) => <MuroMorto {...props} kan />,
  muroMortoCurto: (props) => (
    <Mesa
      {...props}
      opcoes={{
        dados: DADOS_EXEMPLO,
        abertura: true,
        muroMorto: true,
        rotulos: [
          {
            x: DENTRO.direita - 6,
            y: DENTRO.base - 40,
            texto: '5 colunas no Leste',
            ancora: 'end',
            destaque: true,
          },
          {
            x: DENTRO.direita - 6,
            y: DENTRO.base - 26,
            texto: '+ 2 no Sul ↘',
            ancora: 'end',
            destaque: true,
          },
          { x: CENTRO.x, y: CENTRO.y + 34, texto: '2 + 3 = 5 → Leste' },
        ],
      }}
    />
  ),
  mesaCompra: (props) => (
    <Mesa
      {...props}
      opcoes={{
        dados: DADOS_EXEMPLO,
        abertura: true,
        muroMorto: true,
        compra: true,
        rotulos: [
          { x: DENTRO.direita - 6, y: DENTRO.base - 30, texto: 'muro morto', ancora: 'end' },
          {
            x: CENTRO.x + 10,
            y: DENTRO.base - 30,
            texto: '← compras',
            ancora: 'end',
            destaque: true,
          },
        ],
      }}
    />
  ),
  mesaDescartes: (props) => (
    <Mesa
      {...props}
      opcoes={{
        descartes: true,
        chamada: true,
        rotulos: [{ x: CENTRO.x, y: DENTRO.base - 4, texto: 'seus descartes: fileiras de 6' }],
      }}
    />
  ),
}

/** Uma ilustração do guia, com legenda opcional. */
export default function IlustracaoGuia({
  ilustracao,
  alt,
  legenda,
}: {
  ilustracao: IdIlustracao
  alt: string
  legenda?: string
}) {
  // Ids próprios por ilustração: várias na mesma página não misturam os padrões.
  const id = `guia-${useId().replace(/:/g, '')}`
  const padroes = {
    reticula: `url(#${id}-reticula)`,
    hachura: `url(#${id}-hachura)`,
    seta: `url(#${id}-seta)`,
  }
  const Desenho = ILUSTRACOES[ilustracao]
  return (
    <figure className="guia-ilustracao">
      <Desenho padroes={padroes} id={id} alt={alt} />
      {legenda && <figcaption className="guia-mao__legenda">{legenda}</figcaption>}
    </figure>
  )
}
