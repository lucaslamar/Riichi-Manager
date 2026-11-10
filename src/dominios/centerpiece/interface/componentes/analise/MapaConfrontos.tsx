/**
 * Mapa de confrontos: o jogador analisado no centro e cada adversário em volta,
 * maior quanto mais partidas juntos, com a borda pela cor do confronto direto.
 * Posições por força (d3-force), calculadas uma vez e congeladas; desenho em
 * SVG com as cores em atributos (o PNG compartilhado sai igual à tela).
 */
import { forwardRef, useMemo } from 'react'
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import type { NoRede, RedeConfrontos } from '../../../logica/analiseJogador'
import { corDoSaldo, truncar } from './formatacao'

const TAMANHO_MAPA = 340
const RAIO_CENTRO = 28
const LIMITE = TAMANHO_MAPA / 2 - 8

interface No extends SimulationNodeDatum {
  id: string
  raio: number
  no?: NoRede
}

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')

function calcularPosicoes(rede: RedeConfrontos, centroId: string) {
  const maximo = Math.max(1, ...rede.nos.map((no) => no.partidas))
  const nos: No[] = [
    { id: centroId, raio: RAIO_CENTRO, fx: 0, fy: 0 },
    ...rede.nos.map((no) => ({ id: no.adversarioId, raio: 10 + 12 * Math.sqrt(no.partidas / maximo), no })),
  ]
  const ligacoes: SimulationLinkDatum<No>[] = rede.nos.map((no) => ({ source: centroId, target: no.adversarioId }))
  const porId = new Map(nos.map((no) => [no.id, no]))
  const simulacao = forceSimulation(nos)
    .force(
      'ligacao',
      forceLink<No, SimulationLinkDatum<No>>(ligacoes)
        .id((no) => no.id)
        // Quem joga mais junto fica mais perto do centro.
        .distance((ligacao) => {
          const alvo = ligacao.target as No
          return 70 + 70 * (1 - (alvo.no?.partidas ?? 0) / maximo)
        })
        .strength(0.6),
    )
    .force('repulsao', forceManyBody().strength(-160))
    // Espaço para o nome embaixo de cada nó, sem sobrepor.
    .force('colisao', forceCollide<No>((no) => no.raio + 16))
    .force('x', forceX(0).strength(0.04))
    .force('y', forceY(0).strength(0.04))
    .stop()
  // Determinístico: posições iniciais em círculo, e um número fixo de passos.
  nos.slice(1).forEach((no, indice, lista) => {
    const angulo = (indice / lista.length) * Math.PI * 2
    no.x = Math.cos(angulo) * 100
    no.y = Math.sin(angulo) * 100
  })
  simulacao.tick(300)
  for (const no of nos) {
    no.x = Math.max(-LIMITE + no.raio, Math.min(LIMITE - no.raio, no.x ?? 0))
    no.y = Math.max(-LIMITE + no.raio, Math.min(LIMITE - no.raio - 12, no.y ?? 0))
  }
  return porId
}

const MapaConfrontos = forwardRef<
  SVGSVGElement,
  {
    rede: RedeConfrontos
    centro: { id: string; nome: string }
    nomeDe: (id: string) => string
    selecionado: string | null
    aoTocar: (id: string) => void
    descricao: string
  }
>(function MapaConfrontos({ rede, centro, nomeDe, selecionado, aoTocar, descricao }, ref) {
  const posicoes = useMemo(() => calcularPosicoes(rede, centro.id), [rede, centro.id])
  const pos = (id: string) => posicoes.get(id)!
  const ligadoAoSelecionado = (id: string) =>
    !selecionado ||
    id === selecionado ||
    id === centro.id ||
    rede.arestas.some(
      (aresta) =>
        (aresta.de === selecionado && aresta.para === id) || (aresta.para === selecionado && aresta.de === id),
    )
  const meio = TAMANHO_MAPA / 2

  return (
    <svg
      ref={ref}
      className="anl-mapa"
      viewBox={`${-meio} ${-meio} ${TAMANHO_MAPA} ${TAMANHO_MAPA}`}
      role="img"
      aria-label={descricao}
      fontSize="11"
    >
      {/* Adversários que jogaram entre si: linhas finas e translúcidas. */}
      {rede.arestas.map((aresta) => {
        const ativa = selecionado !== null && (aresta.de === selecionado || aresta.para === selecionado)
        return (
          <line
            key={`${aresta.de}-${aresta.para}`}
            x1={pos(aresta.de).x}
            y1={pos(aresta.de).y}
            x2={pos(aresta.para).x}
            y2={pos(aresta.para).y}
            stroke="var(--texto-apoio)"
            strokeWidth={ativa ? 1.5 : 1}
            strokeOpacity={selecionado ? (ativa ? 0.6 : 0.05) : 0.15}
          />
        )
      })}
      {rede.nos.map((no) => (
        <line
          key={`c-${no.adversarioId}`}
          x1={0}
          y1={0}
          x2={pos(no.adversarioId).x}
          y2={pos(no.adversarioId).y}
          stroke={corDoSaldo(no.saldo)}
          strokeWidth={no.adversarioId === selecionado ? 2.5 : 1.5}
          strokeOpacity={selecionado ? (no.adversarioId === selecionado ? 0.9 : 0.1) : 0.45}
        />
      ))}

      {rede.nos.map((no) => {
        const { x = 0, y = 0, raio } = pos(no.adversarioId)
        const nome = nomeDe(no.adversarioId)
        return (
          <g
            key={no.adversarioId}
            transform={`translate(${x},${y})`}
            opacity={ligadoAoSelecionado(no.adversarioId) ? 1 : 0.25}
            onClick={() => aoTocar(no.adversarioId)}
            role="button"
            tabIndex={0}
            aria-label={`${nome}: ${no.vitorias}–${no.derrotas}`}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') aoTocar(no.adversarioId)
            }}
            style={{ cursor: 'pointer' }}
          >
            <title>{`${nome} · ${no.vitorias}–${no.derrotas} · ${no.partidas}`}</title>
            {/* Alvo de toque maior que o nó. */}
            <circle r={Math.max(raio, 20)} fill="transparent" />
            <circle r={raio} fill="var(--superficie)" stroke={corDoSaldo(no.saldo)} strokeWidth={2.5} />
            <text textAnchor="middle" dominantBaseline="central" fill="var(--texto-principal)" fontWeight="700" fontSize={raio > 15 ? 11 : 9}>
              {iniciais(nome)}
            </text>
            <text y={raio + 11} textAnchor="middle" fill="var(--texto-apoio)" fontSize="10">
              {truncar(nome, 11)}
            </text>
          </g>
        )
      })}

      <g>
        <circle r={RAIO_CENTRO} fill="var(--superficie)" stroke="var(--primario)" strokeWidth={4} />
        <text textAnchor="middle" dominantBaseline="central" fill="var(--texto-principal)" fontWeight="800" fontSize="14">
          {iniciais(centro.nome)}
        </text>
        <text y={RAIO_CENTRO + 13} textAnchor="middle" fill="var(--texto-principal)" fontWeight="700" fontSize="11">
          {truncar(centro.nome, 14)}
        </text>
      </g>
    </svg>
  )
})

export default MapaConfrontos
