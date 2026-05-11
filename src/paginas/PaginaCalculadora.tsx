/**
 * @fileoverview Página da calculadora de pontos de mão.
 *
 * Conceitos React demonstrados:
 * - `useImmer`: versão do useState que permite "mutar" o estado via rascunho (draft),
 *   sem precisar escrever `{ ...estado, campo: novoValor }` manualmente.
 *   Internamente usa a biblioteca Immer para garantir imutabilidade real.
 * - Componentes menores (sub-componentes) declarados no mesmo arquivo quando
 *   são usados apenas aqui — evita criar arquivos desnecessários.
 */

import { useState } from 'react'
import { useImmer } from 'use-immer'
import {
  calcularMao,
  calcularHanFu,
  montarPontosRapidos,
  fuValidos,
  ordenarPedras,
  ordenarMelds,
  criarAcao,
  configuracaoPadrao,
  type Mao,
  type CodigoPedra,
  type Meld,
  type Acao,
  type VentoMao,
} from '../logica/calculo/mao'

// ─── Constantes da UI ─────────────────────────────────────────────────────────

const NAIPES = [
  { naipe: 'm' as const, rotulo: 'Man (万)' },
  { naipe: 'p' as const, rotulo: 'Pin (筒)' },
  { naipe: 's' as const, rotulo: 'Sou (索)' },
]

const HONRAS: CodigoPedra[] = ['1z', '2z', '3z', '4z', '5z', '6z', '7z']
const NOMES_HONRAS = ['Ton', 'Nan', 'Sha', 'Pei', 'Haku', 'Hatsu', 'Chun']
const VENTOS: VentoMao[] = ['1', '2', '3', '4']
const NOMES_VENTOS: Record<VentoMao, string> = { '1': 'Leste', '2': 'Sul', '3': 'Oeste', '4': 'Norte' }

/** Estado inicial de uma mão vazia. */
const MAO_VAZIA: Mao = {
  pedras: [],
  melds: [],
  indiceAgari: -1,
  agari: 'tsumo',
  dora: [],
  uradora: [],
  nukidora: 0,
  hanYakuExtra: 0,
  hanDoraExtra: 0,
  yakumanExtra: 0,
  riichi: null,
  bencao: false,
  ultimaPedra: false,
  kan: false,
  ventoRodada: '1',
  ventoAssento: '1',
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface PropsPaginaCalculadora {
  aoVoltar: () => void
}

/**
 * Página completa da calculadora de mão.
 * Oferece dois modos: Completo (montar pedras) e Rápido (escolher han/fu).
 *
 * @param props - aoVoltar: callback para voltar ao menu.
 */
export default function PaginaCalculadora({ aoVoltar }: PropsPaginaCalculadora) {
  // useImmer permite escrever `mao.pedras.push(pedra)` no draft
  // e o Immer cuida de criar um novo objeto imutável por baixo dos panos.
  const [mao, atualizarMao] = useImmer<Mao>(MAO_VAZIA)
  const [acaoPendente, setAcaoPendente] = useState<Acao | null>(null)
  const [modo, setModo] = useState<'completo' | 'rapido'>('completo')

  // Calculadora rápida
  const [han, setHan] = useState(1)
  const [fu, setFu] = useState(30)

  // Quantidade de pedras na mão (excluindo melds que já contam como grupos)
  const totalPedras = mao.pedras.length + mao.melds.reduce((s, m) => s + m.pedras.length, 0)

  // Todas as pedras visíveis (para contar se um código atingiu o limite de 4)
  const todasPedras = [
    ...mao.pedras,
    ...mao.melds.flatMap((m) => m.pedras),
    ...(acaoPendente?.tipo === 'chii' ? acaoPendente.pedras : []),
  ]

  const contarPedra = (codigo: CodigoPedra) => todasPedras.filter((p) => p === codigo).length

  // Resultado calculado (só quando há 14 pedras)
  const resultado = totalPedras === 14
    ? (() => { try { return calcularMao(mao, configuracaoPadrao) } catch { return null } })()
    : null

  // Resultado rápido (han/fu manual)
  const tabelaRapida = calcularHanFu(han, fu, configuracaoPadrao)
  const resultadoRapido = montarPontosRapidos(mao.ventoAssento === '1', mao.agari, tabelaRapida)
  const fuDisponiveis = fuValidos(mao.agari)

  // ─── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Adiciona uma pedra à mão ou a uma ação pendente (pon, chii, dora, etc.)
   */
  const adicionarPedra = (pedra: CodigoPedra) => {
    if (!acaoPendente) {
      // Modo normal: adiciona à mão e marca como agari (última pedra adicionada).
      atualizarMao((rascunho) => {
        rascunho.pedras.push(pedra)
        ordenarPedras(rascunho.pedras)
        rascunho.indiceAgari = rascunho.pedras.lastIndexOf(pedra)
      })
      return
    }

    // Ações que consomem a próxima pedra clicada:
    if (acaoPendente.tipo === 'dora') {
      atualizarMao((r) => { r.dora.push(pedra) })
      setAcaoPendente(null)
      return
    }
    if (acaoPendente.tipo === 'uradora') {
      atualizarMao((r) => { r.uradora.push(pedra) })
      setAcaoPendente(null)
      return
    }
    if (acaoPendente.tipo === 'pon') {
      atualizarMao((r) => {
        r.melds.push({ tipo: 'chiipon', pedras: [pedra, pedra, pedra] })
        ordenarMelds(r.melds)
        r.riichi = null
      })
      setAcaoPendente(null)
      return
    }
    if (acaoPendente.tipo === 'kan') {
      atualizarMao((r) => {
        r.melds.push({ tipo: 'kan', fechado: false, pedras: [pedra, pedra, pedra, pedra] })
        ordenarMelds(r.melds)
        r.riichi = null
      })
      setAcaoPendente(null)
      return
    }
    if (acaoPendente.tipo === 'kanFechado') {
      atualizarMao((r) => {
        r.melds.push({ tipo: 'kan', fechado: true, pedras: [pedra, pedra, pedra, pedra] })
        ordenarMelds(r.melds)
      })
      setAcaoPendente(null)
      return
    }
    if (acaoPendente.tipo === 'chii') {
      const pedrasChii = [...acaoPendente.pedras, pedra]
      if (pedrasChii.length < 3) {
        setAcaoPendente({ tipo: 'chii', pedras: pedrasChii as CodigoPedra[] })
      } else {
        atualizarMao((r) => {
          r.melds.push({ tipo: 'chiipon', pedras: ordenarPedras(pedrasChii as CodigoPedra[]) })
          ordenarMelds(r.melds)
          r.riichi = null
        })
        setAcaoPendente(null)
      }
    }
  }

  const removerPedra = (i: number) => {
    atualizarMao((r) => {
      r.pedras.splice(i, 1)
      if (r.indiceAgari >= i) r.indiceAgari--
    })
    setAcaoPendente(null)
  }

  const removerMeld = (i: number) => {
    atualizarMao((r) => { r.melds.splice(i, 1) })
    setAcaoPendente(null)
  }

  const limparMao = () => {
    atualizarMao(MAO_VAZIA)
    setAcaoPendente(null)
  }

  const alternarAcao = (tipo: Acao['tipo']) =>
    setAcaoPendente(acaoPendente?.tipo === tipo ? null : criarAcao(tipo))

  const podeMeld = mao.riichi === null && !mao.bencao

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Barra superior com navegação e toggle de modo */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn-contorno" type="button" onClick={aoVoltar} style={{ minHeight: 40, padding: '8px 16px' }}>
          <i className="fas fa-arrow-left" /> Voltar
        </button>
        <h2 style={{ margin: 0, flex: 1 }}>Calculadora de Mão</h2>
        <button
          className={modo === 'rapido' ? 'btn-primario' : 'btn-contorno'}
          type="button"
          onClick={() => setModo(modo === 'completo' ? 'rapido' : 'completo')}
          style={{ minHeight: 40, padding: '8px 16px' }}
        >
          <i className={`fas ${modo === 'rapido' ? 'fa-chess-board' : 'fa-bolt'}`} />
          {modo === 'rapido' ? ' Modo Completo' : ' Modo Rápido'}
        </button>
      </div>

      {modo === 'rapido' ? (
        // ── Modo rápido: só escolhe han e fu ─────────────────────────────────
        <div className="card">
          <SeletorVentos mao={mao} atualizarMao={atualizarMao} />
          <ToggleAgari mao={mao} atualizarMao={atualizarMao} />

          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', margin: '24px 0', flexWrap: 'wrap' }}>
            {/* Seletor de Han */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#607080', textTransform: 'uppercase', marginBottom: 8 }}>Han</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 300 }}>
                {[...fuDisponiveis.keys()].map((h) => (
                  <button
                    key={h}
                    className={han === h ? 'btn-primario' : 'btn-contorno'}
                    style={{ minHeight: 40, padding: '6px 14px' }}
                    onClick={() => {
                      setHan(h)
                      const fus = fuDisponiveis.get(h)!
                      if (!fus.includes(fu)) setFu(fus[0])
                    }}
                  >
                    {h} Han
                  </button>
                ))}
                {/* Limites especiais */}
                {[5, 6, 8, 11, 13].map((h) => (
                  <button
                    key={`lim-${h}`}
                    className={han === h ? 'btn-primario' : 'btn-contorno'}
                    style={{ minHeight: 40, padding: '6px 14px' }}
                    onClick={() => setHan(h)}
                  >
                    {rotularHan(h)}
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de Fu */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#607080', textTransform: 'uppercase', marginBottom: 8 }}>Fu</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 300 }}>
                {(fuDisponiveis.get(han) ?? []).map((f) => (
                  <button
                    key={f}
                    className={fu === f ? 'btn-primario' : 'btn-contorno'}
                    style={{ minHeight: 40, padding: '6px 14px', opacity: han >= 5 ? 0.4 : 1 }}
                    disabled={han >= 5}
                    onClick={() => setFu(f)}
                  >
                    {f} Fu
                  </button>
                ))}
                {han >= 5 && (
                  <span style={{ color: '#aaa', fontSize: '0.9rem', alignSelf: 'center' }}>
                    — {rotularHan(han)} não usa fu —
                  </span>
                )}
              </div>
            </div>
          </div>

          <ExibicaoPontosRapidos
            resultado={resultadoRapido}
            isOya={mao.ventoAssento === '1'}
            agari={mao.agari}
            han={han}
            fu={fu}
          />
        </div>
      ) : (
        // ── Modo completo: monta a mão com pedras ────────────────────────────
        <>
          {/* Card: construtor de mão */}
          <div className="card">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, flex: 1, fontSize: '0.88rem', fontWeight: 900, textTransform: 'uppercase', color: '#607080' }}>
                <i className="fas fa-layer-group" style={{ marginRight: 6 }} />
                Mão ({totalPedras}/14)
              </h3>
              {totalPedras > 0 && (
                <button
                  className="btn-contorno"
                  type="button"
                  onClick={limparMao}
                  style={{ minHeight: 34, padding: '4px 12px', fontSize: '0.82rem', color: '#ef5350', borderColor: '#ef5350' }}
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Pedras selecionadas */}
            <div className="pedras-selecionadas">
              {mao.pedras.map((pedra, i) => (
                <button
                  key={i}
                  className={`chip-pedra ${i === mao.indiceAgari ? 'agari' : ''}`}
                  type="button"
                  title={i === mao.indiceAgari ? 'Pedra de agari (clique para remover)' : 'Clique para remover'}
                  onClick={() => removerPedra(i)}
                >
                  {pedra}
                </button>
              ))}
              {mao.melds.map((meld, i) => (
                <button
                  key={`meld-${i}`}
                  className="chip-meld"
                  type="button"
                  title="Clique para remover meld"
                  onClick={() => removerMeld(i)}
                >
                  [{meld.pedras.map((p, j) => <span key={j}>{p}</span>)}]
                </button>
              ))}
              {totalPedras === 0 && (
                <span style={{ color: '#bbb', fontSize: '0.85rem', alignSelf: 'center' }}>
                  Clique nas pedras abaixo para montar a mão
                </span>
              )}
            </div>

            {/* Dora e Uradora */}
            {(mao.dora.length > 0 || mao.uradora.length > 0) && (
              <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
                {mao.dora.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#e65100', textTransform: 'uppercase' }}>Dora:</span>
                    {mao.dora.map((p, i) => (
                      <button key={i} className="chip-pedra dora" type="button"
                        onClick={() => atualizarMao((r) => { r.dora.splice(i, 1) })}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                {mao.uradora.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#7b1fa2', textTransform: 'uppercase' }}>Uradora:</span>
                    {mao.uradora.map((p, i) => (
                      <button key={i} className="chip-pedra dora" type="button"
                        style={{ borderColor: '#7b1fa2', background: '#f3e5f5' }}
                        onClick={() => atualizarMao((r) => { r.uradora.splice(i, 1) })}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botões de ação (meld, dora, etc.) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {([
                { tipo: 'chii' as const, rotulo: 'Chii', desabilitado: !podeMeld },
                { tipo: 'pon' as const, rotulo: 'Pon', desabilitado: !podeMeld },
                { tipo: 'kan' as const, rotulo: 'Kan (aberto)', desabilitado: !podeMeld },
                { tipo: 'kanFechado' as const, rotulo: 'Kan (fechado)', desabilitado: false },
              ]).map(({ tipo, rotulo, desabilitado }) => (
                <button
                  key={tipo}
                  className={acaoPendente?.tipo === tipo ? 'btn-primario' : 'btn-contorno'}
                  type="button"
                  disabled={desabilitado}
                  style={{ minHeight: 36, padding: '4px 12px', fontSize: '0.85rem', opacity: desabilitado ? 0.4 : 1 }}
                  onClick={() => alternarAcao(tipo)}
                >
                  {rotulo}
                </button>
              ))}
              <button
                className={acaoPendente?.tipo === 'dora' ? 'btn-primario' : 'btn-contorno'}
                type="button"
                disabled={mao.dora.length >= 5}
                style={{ minHeight: 36, padding: '4px 12px', fontSize: '0.85rem' }}
                onClick={() => alternarAcao('dora')}
              >
                + Dora
              </button>
              <button
                className={acaoPendente?.tipo === 'uradora' ? 'btn-primario' : 'btn-contorno'}
                type="button"
                disabled={mao.riichi === null || mao.uradora.length >= 5}
                style={{ minHeight: 36, padding: '4px 12px', fontSize: '0.85rem', opacity: mao.riichi === null ? 0.4 : 1 }}
                onClick={() => alternarAcao('uradora')}
              >
                + Uradora
              </button>
            </div>

            {/* Teclado de pedras */}
            <div className="teclado-pedras">
              {NAIPES.map(({ naipe, rotulo }) => (
                <div key={naipe}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase', marginBottom: 4 }}>
                    {rotulo}
                  </div>
                  <div className="linha-naipe">
                    {['1','2','3','4','5','6','7','8','9'].map((n) => {
                      const codigo = `${n}${naipe}` as CodigoPedra
                      const esgotada = contarPedra(codigo) >= 4
                      const cheia = totalPedras >= 14 && !acaoPendente
                      return (
                        <button
                          key={codigo}
                          className="btn-pedra"
                          type="button"
                          disabled={esgotada || cheia}
                          onClick={() => adicionarPedra(codigo)}
                        >
                          {n}{naipe.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase', marginBottom: 4 }}>
                  Honras (Jihai / Kazehai)
                </div>
                <div className="linha-naipe">
                  {HONRAS.map((codigo, i) => (
                    <button
                      key={codigo}
                      className="btn-pedra"
                      type="button"
                      disabled={contarPedra(codigo) >= 4 || (totalPedras >= 14 && !acaoPendente)}
                      onClick={() => adicionarPedra(codigo)}
                    >
                      {NOMES_HONRAS[i]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card: opções da mão */}
          <div className="card">
            <SeletorVentos mao={mao} atualizarMao={atualizarMao} />
            <ToggleAgari mao={mao} atualizarMao={atualizarMao} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              <BotaoToggle
                rotulo="Riichi"
                ativo={mao.riichi !== null}
                desabilitado={mao.melds.some((m) => m.tipo !== 'kan' || !m.fechado)}
                aoClicar={() => atualizarMao((r) => {
                  r.riichi = r.riichi ? null : { duplo: false, ippatsu: false }
                  if (r.riichi) r.bencao = false
                  else r.uradora = []
                })}
              />
              <BotaoToggle
                rotulo="Ippatsu"
                ativo={mao.riichi?.ippatsu ?? false}
                desabilitado={mao.riichi === null}
                aoClicar={() => atualizarMao((r) => { if (r.riichi) r.riichi.ippatsu = !r.riichi.ippatsu })}
              />
              <BotaoToggle
                rotulo="Double Riichi"
                ativo={mao.riichi?.duplo ?? false}
                desabilitado={mao.riichi === null}
                aoClicar={() => atualizarMao((r) => { if (r.riichi) r.riichi.duplo = !r.riichi.duplo })}
              />
              <BotaoToggle
                rotulo="Tenhou / Chihou"
                ativo={mao.bencao}
                desabilitado={mao.melds.length > 0}
                aoClicar={() => atualizarMao((r) => {
                  r.bencao = !r.bencao
                  if (r.bencao) { r.riichi = null; r.ultimaPedra = false; r.kan = false }
                })}
              />
              <BotaoToggle
                rotulo={mao.agari === 'ron' ? 'Chankan' : 'Rinshan'}
                ativo={mao.kan}
                desabilitado={false}
                aoClicar={() => atualizarMao((r) => {
                  r.kan = !r.kan
                  if (r.kan) { r.bencao = false; r.ultimaPedra = false }
                })}
              />
              <BotaoToggle
                rotulo={mao.agari === 'ron' ? 'Houtei' : 'Haitei'}
                ativo={mao.ultimaPedra}
                desabilitado={false}
                aoClicar={() => atualizarMao((r) => {
                  r.ultimaPedra = !r.ultimaPedra
                  if (r.ultimaPedra) { r.bencao = false; r.kan = false }
                })}
              />
            </div>
          </div>

          {/* Card: resultado */}
          <div className="resultado-calculadora">
            {totalPedras < 14 ? (
              <div style={{ opacity: 0.5 }}>
                <i className="fas fa-calculator" style={{ fontSize: '2rem', marginBottom: 8, display: 'block' }} />
                Monte 14 pedras para calcular
              </div>
            ) : resultado?.agari != null ? (
              <ExibicaoResultadoCompleto resultado={resultado} />
            ) : (
              <div>
                <i className="fas fa-times-circle" style={{ fontSize: '2rem', color: '#ef5350', marginBottom: 8, display: 'block' }} />
                <strong>Sem Yaku</strong>
                <p style={{ opacity: 0.7, margin: '4px 0 0', fontSize: '0.9rem' }}>
                  {resultado?.semYaku ? 'A mão não tem yaku válido.' : 'A combinação de pedras não forma uma mão válida.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Seletor de vento da rodada e do assento. */
function SeletorVentos({ mao, atualizarMao }: { mao: Mao; atualizarMao: any }) {
  return (
    <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
      {([
        { campo: 'ventoRodada' as const, rotulo: 'Vento da Rodada' },
        { campo: 'ventoAssento' as const, rotulo: 'Assento' },
      ]).map(({ campo, rotulo }) => (
        <label key={campo} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#607080', textTransform: 'uppercase' }}>
            {rotulo}
          </span>
          <select
            value={mao[campo]}
            style={{ minHeight: 42, border: '2px solid #dde1e7', borderRadius: 8, padding: '0 12px', fontWeight: 800, background: 'white' }}
            onChange={(e) => atualizarMao((r: Mao) => { r[campo] = e.target.value as VentoMao })}
          >
            {VENTOS.map((v) => (
              <option key={v} value={v}>{NOMES_VENTOS[v]}</option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}

/** Toggle entre Tsumo e Ron. */
function ToggleAgari({ mao, atualizarMao }: { mao: Mao; atualizarMao: any }) {
  return (
    <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: 8, overflow: 'hidden', width: 'fit-content', marginBottom: 4 }}>
      {(['tsumo', 'ron'] as const).map((tipo) => (
        <button
          key={tipo}
          type="button"
          style={{
            padding: '8px 24px',
            fontWeight: 900,
            border: 'none',
            background: mao.agari === tipo ? 'var(--primario)' : 'transparent',
            color: mao.agari === tipo ? 'white' : 'var(--escuro)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            fontSize: '0.9rem',
          }}
          onClick={() => atualizarMao((r: Mao) => { r.agari = tipo })}
        >
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </button>
      ))}
    </div>
  )
}

/** Botão toggle genérico para modificadores de mão. */
function BotaoToggle({
  rotulo, ativo, desabilitado, aoClicar,
}: {
  rotulo: string
  ativo: boolean
  desabilitado: boolean
  aoClicar: () => void
}) {
  return (
    <button
      type="button"
      className={ativo ? 'btn-primario' : 'btn-contorno'}
      disabled={desabilitado}
      style={{ minHeight: 36, padding: '4px 14px', fontSize: '0.85rem', opacity: desabilitado ? 0.35 : 1 }}
      onClick={aoClicar}
    >
      {rotulo}
    </button>
  )
}

/** Exibe o resultado da calculadora rápida (han/fu manual). */
function ExibicaoPontosRapidos({
  resultado, isOya, agari, han, fu,
}: {
  resultado: any
  isOya: boolean
  agari: 'ron' | 'tsumo'
  han: number
  fu: number
}) {
  const pts = resultado?.pontos
  if (!pts) return null

  return (
    <div className="resultado-calculadora" style={{ marginTop: 16 }}>
      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 800 }}>
        {han >= 5 ? rotularHan(han) : `${han} Han ${fu} Fu`}
      </div>
      <div className="pontos-totais">{pts.total.toLocaleString('pt-BR')}</div>
      <div className="detalhe-pontos">
        {agari === 'tsumo'
          ? isOya ? `All ${pts.oya?.ko ?? 0}` : `Oya ${pts.ko?.oya ?? 0} / Ko ${pts.ko?.ko ?? 0}`
          : isOya ? `Ron ${pts.oya?.ron ?? 0}` : `Ron ${pts.ko?.ron ?? 0}`}
      </div>
    </div>
  )
}

/** Exibe o resultado completo (yaku + pontos) do modo completo. */
function ExibicaoResultadoCompleto({ resultado }: { resultado: any }) {
  const pts = resultado.pontos

  return (
    <>
      {resultado.nome && (
        <div className="nome-mao">{resultado.nome}</div>
      )}
      {resultado.yakuman > 0 && (
        <div style={{ fontSize: '1.1rem', color: '#ffd54f', fontWeight: 800, marginBottom: 4 }}>
          {resultado.yakuman}× Yakuman
        </div>
      )}
      {resultado.han > 0 && resultado.yakuman === 0 && (
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
          {resultado.han} Han {resultado.fu} Fu
        </div>
      )}
      <div className="pontos-totais">{pts.total.toLocaleString('pt-BR')}</div>
      <div className="detalhe-pontos">
        {resultado.agari === 'tsumo'
          ? resultado.isOya
            ? `All ${pts.oya?.ko ?? 0}`
            : `Oya ${pts.ko?.oya ?? 0} / Ko ${pts.ko?.ko ?? 0}`
          : resultado.isOya
            ? `Ron ${pts.oya?.ron ?? 0}`
            : `Ron ${pts.ko?.ron ?? 0}`}
      </div>

      {resultado.yaku?.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', margin: '14px 0 10px' }} />
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            Yaku
          </div>
          <div className="lista-yaku">
            {resultado.yaku.map(([nome, valor, ehYakuman]: [string, number, boolean], i: number) => (
              <span key={i} className="chip-yaku">
                {nome} <strong>{ehYakuman ? `${valor}× YM` : `${valor}han`}</strong>
              </span>
            ))}
          </div>
        </>
      )}
    </>
  )
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

/** Retorna rótulo legível para valores especiais de han. */
function rotularHan(h: number): string {
  if (h >= 13) return 'Yakuman (13+)'
  if (h >= 11) return 'Sanbaiman (11-12)'
  if (h >= 8) return 'Baiman (8-10)'
  if (h >= 6) return 'Haneman (6-7)'
  return 'Mangan (5)'
}
