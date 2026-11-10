/**
 * Gráficos da tela do jogador, todos em SVG e com as mesmas cores do tema: a cor
 * de destaque para a série e o texto de apoio para eixos e rótulos. SVG puro
 * (sem biblioteca) para migrar direto para react-native-svg.
 */
import type { ReactNode } from 'react'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import { truncar } from './formatacao'

/** Card com título, ícone, botão "?" e o estado vazio. */
export function CardGrafico({
  titulo,
  icone,
  ajuda,
  vazio,
  textoVazio,
  children,
}: {
  titulo: string
  icone: string
  ajuda: string
  vazio: boolean
  textoVazio: string
  children: ReactNode
}) {
  return (
    <section className="anl-card">
      <header className="anl-card-topo">
        <i className={`fas ${icone}`} aria-hidden="true" />
        <h3>{titulo}</h3>
        <AjudaCampo rotulo={titulo}>
          <p>{ajuda}</p>
        </AjudaCampo>
      </header>
      {vazio ? <p className="anl-vazio">{textoVazio}</p> : children}
    </section>
  )
}

const LARGURA = 320
const ALTURA = 160
const MARGEM = { topo: 12, direita: 12, base: 22, esquerda: 34 }

/** Passo "redondo" (1, 2, 2,5, 5 × 10ⁿ) para umas 4 marcas no eixo. */
function passoRedondo(amplitude: number, quantos = 4) {
  const bruto = amplitude / quantos
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const fator = [1, 2, 2.5, 5, 10].find((opcao) => opcao * potencia >= bruto) ?? 10
  return fator * potencia
}

/** Domínio estendido até marcas redondas, e as marcas. */
function escalaRedonda(minimo: number, maximo: number) {
  const passo = passoRedondo(maximo - minimo)
  const inicio = Math.floor(minimo / passo) * passo
  const fim = Math.ceil(maximo / passo) * passo
  const marcas: number[] = []
  for (let valor = inicio; valor <= fim + passo / 2; valor += passo) marcas.push(Math.round(valor * 100) / 100)
  return { minimo: inicio, maximo: fim, marcas }
}

/**
 * Linha de uma série. `invertido` põe o menor valor no topo (1º lugar em cima).
 * `zero` desenha a linha de referência no 0.
 */
export function GraficoLinha({
  pontos,
  dominio,
  invertido = false,
  zero = false,
  formatar,
  rotuloX,
  marcas: marcasFixas,
  descricao,
}: {
  pontos: { x: string; y: number; dica: string }[]
  dominio?: [number, number]
  invertido?: boolean
  zero?: boolean
  formatar: (valor: number) => string
  rotuloX?: (indice: number) => string | null
  /** Marcas do eixo Y já escolhidas (ex.: 1º a 4º); sem elas, marcas redondas. */
  marcas?: number[]
  descricao: string
}) {
  const valores = pontos.map((ponto) => ponto.y)
  let [minimo, maximo] = dominio ?? [Math.min(...valores, zero ? 0 : Infinity), Math.max(...valores, zero ? 0 : -Infinity)]
  if (minimo === maximo) {
    minimo -= 1
    maximo += 1
  }
  let marcas = marcasFixas
  if (!marcas) {
    const escala = escalaRedonda(minimo, maximo)
    ;({ minimo, maximo, marcas } = escala)
  }
  const larguraUtil = LARGURA - MARGEM.esquerda - MARGEM.direita
  const alturaUtil = ALTURA - MARGEM.topo - MARGEM.base
  const x = (indice: number) =>
    MARGEM.esquerda + (pontos.length === 1 ? larguraUtil / 2 : (indice / (pontos.length - 1)) * larguraUtil)
  const proporcao = (valor: number) => (valor - minimo) / (maximo - minimo)
  const y = (valor: number) => MARGEM.topo + (invertido ? proporcao(valor) : 1 - proporcao(valor)) * alturaUtil
  const caminho = pontos.map((ponto, indice) => `${indice ? 'L' : 'M'}${x(indice)},${y(ponto.y)}`).join(' ')
  // Muitos pontos: só os marcadores das pontas e do último, para não poluir.
  const comMarcador = (indice: number) => pontos.length <= 24 || indice === pontos.length - 1

  return (
    <svg className="anl-grafico" viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={descricao}>
      {marcas.map((valor) => (
        <g key={valor}>
          <line className="anl-grade" x1={MARGEM.esquerda} x2={LARGURA - MARGEM.direita} y1={y(valor)} y2={y(valor)} />
          <text className="anl-eixo" x={MARGEM.esquerda - 6} y={y(valor)} textAnchor="end" dominantBaseline="middle">
            {formatar(valor)}
          </text>
        </g>
      ))}
      {zero && minimo < 0 && maximo > 0 && (
        <line className="anl-zero" x1={MARGEM.esquerda} x2={LARGURA - MARGEM.direita} y1={y(0)} y2={y(0)} />
      )}
      <path className="anl-linha" d={caminho} />
      {pontos.map((ponto, indice) => (
        <g key={indice}>
          {/* Alvo de toque maior que o marcador. */}
          <circle className="anl-alvo" cx={x(indice)} cy={y(ponto.y)} r={10}>
            <title>{ponto.dica}</title>
          </circle>
          {comMarcador(indice) && <circle className="anl-ponto" cx={x(indice)} cy={y(ponto.y)} r={4} />}
        </g>
      ))}
      {pontos.map((ponto, indice) => {
        const texto = rotuloX ? rotuloX(indice) : ponto.x
        return texto ? (
          <text key={`x${indice}`} className="anl-eixo" x={x(indice)} y={ALTURA - 6} textAnchor="middle">
            {texto}
          </text>
        ) : null
      })}
    </svg>
  )
}

/** Barras verticais com o valor em cima; base no zero, pontas arredondadas. */
export function GraficoBarras({
  barras,
  maximo,
  descricao,
}: {
  barras: { rotulo: string; valor: number | null; texto: string; dica: string }[]
  maximo?: number
  descricao: string
}) {
  const topo = maximo ?? Math.max(1, ...barras.map((barra) => barra.valor ?? 0))
  const larguraUtil = LARGURA - 16
  const alturaUtil = ALTURA - 44
  const faixa = larguraUtil / barras.length
  const largura = Math.min(44, faixa - 12)
  return (
    <svg className="anl-grafico" viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={descricao}>
      <line className="anl-grade" x1={8} x2={LARGURA - 8} y1={ALTURA - 22} y2={ALTURA - 22} />
      {barras.map((barra, indice) => {
        const altura = barra.valor ? Math.max(4, (barra.valor / topo) * alturaUtil) : 0
        const centro = 8 + faixa * indice + faixa / 2
        const base = ALTURA - 22
        return (
          <g key={barra.rotulo}>
            <title>{barra.dica}</title>
            {altura > 0 && (
              <path
                className="anl-barra"
                d={`M${centro - largura / 2},${base} V${base - altura + 4} q0,-4 4,-4 H${centro + largura / 2 - 4} q4,0 4,4 V${base} Z`}
              />
            )}
            <text className="anl-valor" x={centro} y={base - altura - 6} textAnchor="middle">
              {barra.texto}
            </text>
            <text className="anl-eixo" x={centro} y={ALTURA - 6} textAnchor="middle">
              {barra.rotulo}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Barras horizontais (ranking curto), com o nome à esquerda e o valor no fim. */
export function GraficoBarrasHorizontais({
  barras,
  descricao,
}: {
  barras: { rotulo: string; valor: number; texto: string; dica: string }[]
  descricao: string
}) {
  const altura = barras.length * 30 + 4
  const maximo = Math.max(1, ...barras.map((barra) => barra.valor))
  const inicio = 96
  const larguraUtil = LARGURA - inicio - 56
  return (
    <svg className="anl-grafico" viewBox={`0 0 ${LARGURA} ${altura}`} role="img" aria-label={descricao}>
      {barras.map((barra, indice) => {
        const y = 4 + indice * 30
        const largura = Math.max(4, (barra.valor / maximo) * larguraUtil)
        return (
          <g key={`${barra.rotulo}-${indice}`}>
            <title>{barra.dica}</title>
            <text className="anl-rotulo" x={inicio - 8} y={y + 11} textAnchor="end" dominantBaseline="middle">
              {truncar(barra.rotulo, 12)}
            </text>
            <path
              className="anl-barra"
              d={`M${inicio},${y} H${inicio + largura - 4} q4,0 4,4 V${y + 18} q0,4 -4,4 H${inicio} Z`}
            />
            <text className="anl-valor" x={inicio + largura + 6} y={y + 11} dominantBaseline="middle">
              {barra.texto}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

