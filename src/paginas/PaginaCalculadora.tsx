/**
 * @fileoverview Página da calculadora de pontos de mão.
 *
 * Conceitos React:
 * - useImmer: permite "mutar" o estado de forma segura (Immer garante imutabilidade).
 * - useState: estado local que dispara re-render.
 * - Componentes aninhados no mesmo arquivo quando usados apenas aqui.
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
  contarPedrasTotais,
  contarSlotsLogicos,
  configuracaoPadrao,
  type Mao,
  type CodigoPedra,
  type Meld,
  type Acao,
  type VentoMao,
} from '../logica/calculo/mao'

// ─── Constantes de UI ─────────────────────────────────────────────────────────

const NAIPES = [
  { naipe: 'm' as const, rotulo: 'Man (万)' },
  { naipe: 'p' as const, rotulo: 'Pin (筒)' },
  { naipe: 's' as const, rotulo: 'Sou (索)' },
]

const HONRAS: CodigoPedra[] = ['1z', '2z', '3z', '4z', '5z', '6z', '7z']
const NOMES_HONRAS = ['Ton', 'Nan', 'Sha', 'Pei', 'Haku', 'Hatsu', 'Chun']

/** Vento da RODADA: só Leste e Sul (regras padrão de riichi). */
const VENTOS_RODADA: { valor: VentoMao; nome: string }[] = [
  { valor: '1', nome: 'Leste' },
  { valor: '2', nome: 'Sul' },
]

/** Vento do ASSENTO: todos os quatro. */
const VENTOS_ASSENTO: { valor: VentoMao; nome: string }[] = [
  { valor: '1', nome: 'Leste' },
  { valor: '2', nome: 'Sul' },
  { valor: '3', nome: 'Oeste' },
  { valor: '4', nome: 'Norte' },
]

/** Estado inicial de uma mão completamente vazia. */
const MAO_VAZIA: Mao = {
  pedras: [], melds: [], indiceAgari: -1, agari: 'tsumo',
  dora: [], uradora: [], riichi: null,
  bencao: false, ultimaPedra: false, kan: false,
  ventoRodada: '1', ventoAssento: '1',
}

// ─── Cores dos melds ──────────────────────────────────────────────────────────

/**
 * Cada tipo de meld tem cor e rótulo diferente para identificação rápida.
 */
const ESTILO_MELD: Record<Meld['tipo'], { fundo: string; borda: string; rotulo: string }> = {
  chii:       { fundo: '#e8f5e9', borda: '#4caf50', rotulo: 'Chi' },
  pon:        { fundo: '#e3f2fd', borda: '#2196f3', rotulo: 'Pon' },
  kanAberto:  { fundo: '#fff3e0', borda: '#ff9800', rotulo: 'Kan ↗' },
  kanFechado: { fundo: '#f3e5f5', borda: '#9c27b0', rotulo: 'Kan ■' },
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface PropsPagina {
  aoVoltar: () => void
}

export default function PaginaCalculadora({ aoVoltar }: PropsPagina) {
  const [mao, atualizarMao] = useImmer<Mao>(MAO_VAZIA)
  const [acaoPendente, setAcaoPendente] = useState<Acao | null>(null)
  const [modo, setModo] = useState<'completo' | 'rapido'>('completo')

  // Estado para a calculadora rápida
  const [han, setHan] = useState(1)
  const [fu, setFu] = useState(30)

  const totalPedras = contarPedrasTotais(mao)
  // Slots lógicos: kans contam como 3 (não 4). Meta = 14 para mão completa.
  const slotsUsados = contarSlotsLogicos(mao)
  const maoCompleta = slotsUsados >= 14

  // Todas as pedras visíveis (para limitar a 4 por código)
  const todasPedras = [
    ...mao.pedras,
    ...mao.melds.flatMap((m) => m.pedras),
    ...(acaoPendente?.tipo === 'chii' ? acaoPendente.pedras : []),
  ]
  const contarCodigo = (c: CodigoPedra) => todasPedras.filter((p) => p === c).length

  // Calculadora rápida
  const tabelaRapida = calcularHanFu(han, fu, configuracaoPadrao)
  const resultadoRapido = montarPontosRapidos(mao.ventoAssento === '1', mao.agari, tabelaRapida)
  const fuDisponiveis = fuValidos(mao.agari)

  // Resultado completo (calculado ao vivo quando a mão está completa)
  const resultado = maoCompleta
    ? (() => { try { return calcularMao(mao, configuracaoPadrao) } catch { return null } })()
    : null

  // ── Handlers ────────────────────────────────────────────────────────────────

  const adicionarPedra = (pedra: CodigoPedra) => {
    if (!acaoPendente) {
      // Bloqueia se a mão já está completa (14 slots)
      if (maoCompleta) return
      atualizarMao((r) => {
        r.pedras.push(pedra)
        ordenarPedras(r.pedras)
        r.indiceAgari = r.pedras.lastIndexOf(pedra)
      })
      return
    }

    switch (acaoPendente.tipo) {
      case 'dora':
        atualizarMao((r) => { r.dora.push(pedra) })
        setAcaoPendente(null)
        return
      case 'uradora':
        atualizarMao((r) => { r.uradora.push(pedra) })
        setAcaoPendente(null)
        return
      case 'pon':
        atualizarMao((r) => {
          r.melds.push({ tipo: 'pon', pedras: [pedra, pedra, pedra] })
          ordenarMelds(r.melds)
          r.riichi = null
        })
        setAcaoPendente(null)
        return
      case 'kanAberto':
        atualizarMao((r) => {
          r.melds.push({ tipo: 'kanAberto', pedras: [pedra, pedra, pedra, pedra] })
          ordenarMelds(r.melds)
          r.riichi = null
        })
        setAcaoPendente(null)
        return
      case 'kanFechado':
        atualizarMao((r) => {
          r.melds.push({ tipo: 'kanFechado', pedras: [pedra, pedra, pedra, pedra] })
          ordenarMelds(r.melds)
        })
        setAcaoPendente(null)
        return
      case 'chii': {
        const novasPedras = [...acaoPendente.pedras, pedra]
        if (novasPedras.length < 3) {
          setAcaoPendente({ tipo: 'chii', pedras: novasPedras })
        } else {
          atualizarMao((r) => {
            r.melds.push({ tipo: 'chii', pedras: ordenarPedras(novasPedras) })
            ordenarMelds(r.melds)
            r.riichi = null
          })
          setAcaoPendente(null)
        }
        return
      }
    }
  }

  const removerPedra = (i: number) => {
    atualizarMao((r) => { r.pedras.splice(i, 1); if (r.indiceAgari >= i) r.indiceAgari-- })
    setAcaoPendente(null)
  }

  const removerMeld = (i: number) => {
    atualizarMao((r) => { r.melds.splice(i, 1) })
    setAcaoPendente(null)
  }

  const limpar = () => { atualizarMao(MAO_VAZIA); setAcaoPendente(null) }

  const alternarAcao = (tipo: Acao['tipo']) =>
    setAcaoPendente(acaoPendente?.tipo === tipo ? null : criarAcao(tipo))

  const slotsLivres = 14 - slotsUsados
  // Para adicionar um meld, precisamos de slots suficientes:
  // chii/pon = 3 slots, kan = 3 slots (kans contam como 3 na estrutura lógica)
  const podeMeld = mao.riichi === null && !mao.bencao && slotsLivres >= 3
  const maoAberta = mao.melds.some((m) => m.tipo !== 'kanFechado')

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Barra superior */}
      <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        <button className="btn-contorno" type="button" onClick={aoVoltar} style={{ minHeight:40, padding:'8px 16px' }}>
          <i className="fas fa-arrow-left" /> Voltar
        </button>
        <h2 style={{ margin:0, flex:1 }}>Calculadora de Mão</h2>
        <button
          className={modo === 'rapido' ? 'btn-primario' : 'btn-contorno'}
          type="button"
          onClick={() => setModo(modo === 'completo' ? 'rapido' : 'completo')}
          style={{ minHeight:40, padding:'8px 16px' }}
        >
          <i className={`fas ${modo === 'rapido' ? 'fa-chess-board' : 'fa-bolt'}`} />
          {modo === 'rapido' ? ' Modo Completo' : ' Modo Rápido'}
        </button>
      </div>

      {modo === 'rapido' ? (
        /* ── MODO RÁPIDO ── */
        <div className="card">
          <SeletorVentos mao={mao} atualizarMao={atualizarMao} />
          <ToggleAgari mao={mao} atualizarMao={atualizarMao} />

          <div style={{ display:'flex', gap:32, justifyContent:'center', margin:'24px 0', flexWrap:'wrap' }}>
            <SeletorHan han={han} fu={fu} fuDisponiveis={fuDisponiveis} aoMudarHan={setHan} aoMudarFu={setFu} />
            <SeletorFu han={han} fu={fu} fuDisponiveis={fuDisponiveis} aoMudarFu={setFu} />
          </div>

          <ExibicaoRapida resultado={resultadoRapido} isOya={mao.ventoAssento === '1'} agari={mao.agari} han={han} fu={fu} />
        </div>
      ) : (
        /* ── MODO COMPLETO ── */
        <>
          {/* Card 1: construtor de mão */}
          <div className="card">
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
              <h3 style={{ margin:0, flex:1, fontSize:'0.88rem', fontWeight:900, textTransform:'uppercase', color:'#607080' }}>
                <i className="fas fa-layer-group" style={{ marginRight:6 }} />
                Mão ({totalPedras} pedras · {slotsUsados}/14 slots)
              </h3>
              {totalPedras > 0 && (
                <button className="btn-contorno" type="button" onClick={limpar}
                  style={{ minHeight:34, padding:'4px 12px', fontSize:'0.82rem', color:'#ef5350', borderColor:'#ef5350' }}>
                  Limpar
                </button>
              )}
            </div>

            {/* Área de pedras e melds */}
            <div className="pedras-selecionadas">
              {mao.pedras.map((pedra, i) => (
                <button key={i}
                  className={`chip-pedra ${i === mao.indiceAgari ? 'agari' : ''}`}
                  type="button"
                  title={i === mao.indiceAgari ? 'Pedra de agari — clique para remover' : 'Clique para remover'}
                  onClick={() => removerPedra(i)}
                >
                  {pedra}
                </button>
              ))}

              {/* Melds com cores distintas e rótulo de tipo */}
              {mao.melds.map((meld, i) => {
                const estilo = ESTILO_MELD[meld.tipo]
                return (
                  <button key={`meld-${i}`} type="button"
                    title={`${estilo.rotulo} — clique para remover`}
                    onClick={() => removerMeld(i)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 6,
                      border: `2px solid ${estilo.borda}`,
                      background: estilo.fundo,
                      fontWeight: 900, fontFamily: 'monospace', fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: estilo.borda, marginRight: 2, letterSpacing: 0 }}>
                      {estilo.rotulo}
                    </span>
                    {meld.pedras.map((p, j) => <span key={j}>{p}</span>)}
                  </button>
                )
              })}

              {totalPedras === 0 && (
                <span style={{ color:'#bbb', fontSize:'0.85rem', alignSelf:'center' }}>
                  Clique nas pedras abaixo para montar a mão
                </span>
              )}
            </div>

            {/* Dora e Uradora exibidos */}
            {(mao.dora.length > 0 || mao.uradora.length > 0) && (
              <div style={{ display:'flex', gap:16, marginBottom:10, flexWrap:'wrap' }}>
                {mao.dora.length > 0 && (
                  <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:900, color:'#e65100' }}>DORA:</span>
                    {mao.dora.map((p, i) => (
                      <button key={i} className="chip-pedra dora" type="button"
                        onClick={() => atualizarMao((r) => { r.dora.splice(i, 1) })}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                {mao.uradora.length > 0 && (
                  <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:900, color:'#7b1fa2' }}>URADORA:</span>
                    {mao.uradora.map((p, i) => (
                      <button key={i} className="chip-pedra dora" type="button"
                        style={{ borderColor:'#9c27b0', background:'#f3e5f5' }}
                        onClick={() => atualizarMao((r) => { r.uradora.splice(i, 1) })}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botões de ação com cores distintas */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
              <BotaoAcao tipo="chii"       rotulo="Chii"        cor="#4caf50" ativo={acaoPendente?.tipo === 'chii'}       desabilitado={!podeMeld} aoClicar={() => alternarAcao('chii')} />
              <BotaoAcao tipo="pon"        rotulo="Pon"         cor="#2196f3" ativo={acaoPendente?.tipo === 'pon'}        desabilitado={!podeMeld} aoClicar={() => alternarAcao('pon')} />
              <BotaoAcao tipo="kanAberto"  rotulo="Kan (aberto)"  cor="#ff9800" ativo={acaoPendente?.tipo === 'kanAberto'}  desabilitado={!podeMeld} aoClicar={() => alternarAcao('kanAberto')} />
              <BotaoAcao tipo="kanFechado" rotulo="Kan (fechado)" cor="#9c27b0" ativo={acaoPendente?.tipo === 'kanFechado'} desabilitado={false}      aoClicar={() => alternarAcao('kanFechado')} />
              <BotaoAcao tipo="dora"       rotulo="+ Dora"      cor="#e65100" ativo={acaoPendente?.tipo === 'dora'}       desabilitado={mao.dora.length >= 5} aoClicar={() => alternarAcao('dora')} />
            </div>

            {/* Teclado de pedras */}
            <div className="teclado-pedras">
              {NAIPES.map(({ naipe, rotulo }) => (
                <div key={naipe}>
                  <div style={{ fontSize:'0.72rem', fontWeight:900, color:'#aaa', textTransform:'uppercase', marginBottom:4 }}>
                    {rotulo}
                  </div>
                  <div className="linha-naipe">
                    {['1','2','3','4','5','6','7','8','9'].map((n) => {
                      const codigo = `${n}${naipe}`
                      const esgotada = contarCodigo(codigo) >= 4
                      const cheiaESemAcao = maoCompleta && !acaoPendente
                      return (
                        <button key={codigo} className="btn-pedra" type="button"
                          disabled={esgotada || cheiaESemAcao}
                          onClick={() => adicionarPedra(codigo)}>
                          {n}{naipe.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontSize:'0.72rem', fontWeight:900, color:'#aaa', textTransform:'uppercase', marginBottom:4 }}>
                  Honras (Jihai / Kazehai)
                </div>
                <div className="linha-naipe">
                  {HONRAS.map((codigo, i) => (
                    <button key={codigo} className="btn-pedra" type="button"
                      disabled={contarCodigo(codigo) >= 4 || (maoCompleta && !acaoPendente)}
                      onClick={() => adicionarPedra(codigo)}>
                      {NOMES_HONRAS[i]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: opções da mão */}
          <div className="card">
            <SeletorVentos mao={mao} atualizarMao={atualizarMao} />
            <ToggleAgari mao={mao} atualizarMao={atualizarMao} />

            {/* Linha de opções: Riichi + Uradora juntos */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:14, alignItems:'center' }}>
              <BotaoToggle
                rotulo="Riichi"
                ativo={mao.riichi !== null}
                desabilitado={maoAberta}
                aoClicar={() => atualizarMao((r) => {
                  r.riichi = r.riichi ? null : { duplo: false, ippatsu: false }
                  if (r.riichi) r.bencao = false
                  else r.uradora = []
                })}
              />
              {/* Uradora ao lado do Riichi (só liberado com riichi) */}
              <BotaoAcao
                tipo="uradora"
                rotulo="+ Uradora"
                cor="#9c27b0"
                ativo={acaoPendente?.tipo === 'uradora'}
                desabilitado={mao.riichi === null || mao.uradora.length >= 5}
                aoClicar={() => alternarAcao('uradora')}
              />
              {/* Separador visual */}
              <div style={{ width:1, height:32, background:'#e0e0e0', margin:'0 4px' }} />
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
              <div style={{ width:1, height:32, background:'#e0e0e0', margin:'0 4px' }} />
              <BotaoToggle
                rotulo="Tenhou / Chiihou"
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

          {/* Card 3: resultado */}
          <div className="resultado-calculadora">
            {!maoCompleta ? (
              <div style={{ opacity:0.5 }}>
                <i className="fas fa-calculator" style={{ fontSize:'2rem', marginBottom:8, display:'block' }} />
                Monte 14 slots (kans contam como 3) para calcular
              </div>
            ) : resultado?.agari != null ? (
              <ExibicaoCompleta resultado={resultado} />
            ) : (
              <div>
                <i className="fas fa-times-circle" style={{ fontSize:'2rem', color:'#ef5350', marginBottom:8, display:'block' }} />
                <strong>Sem Yaku</strong>
                <p style={{ opacity:0.7, margin:'4px 0 0', fontSize:'0.9rem' }}>
                  {resultado?.semYaku
                    ? 'A mão não tem yaku válido.'
                    : 'A combinação de pedras não forma uma mão válida.'}
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

/** Seletor de vento da rodada (Leste/Sul) e do assento (todos os 4). */
function SeletorVentos({ mao, atualizarMao }: { mao: Mao; atualizarMao: any }) {
  return (
    <div style={{ display:'flex', gap:24, marginBottom:14, flexWrap:'wrap' }}>
      <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <span style={{ fontSize:'0.78rem', fontWeight:900, color:'#607080', textTransform:'uppercase' }}>
          Vento da Rodada
        </span>
        {/* Só Leste e Sul — regra padrão de riichi yonma */}
        <select
          value={mao.ventoRodada}
          style={{ minHeight:42, border:'2px solid #dde1e7', borderRadius:8, padding:'0 12px', fontWeight:800, background:'white' }}
          onChange={(e) => atualizarMao((r: Mao) => { r.ventoRodada = e.target.value as VentoMao })}
        >
          {VENTOS_RODADA.map((v) => (
            <option key={v.valor} value={v.valor}>{v.nome}</option>
          ))}
        </select>
      </label>

      <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <span style={{ fontSize:'0.78rem', fontWeight:900, color:'#607080', textTransform:'uppercase' }}>
          Assento
        </span>
        {/* Assento tem os 4 ventos */}
        <select
          value={mao.ventoAssento}
          style={{ minHeight:42, border:'2px solid #dde1e7', borderRadius:8, padding:'0 12px', fontWeight:800, background:'white' }}
          onChange={(e) => atualizarMao((r: Mao) => { r.ventoAssento = e.target.value as VentoMao })}
        >
          {VENTOS_ASSENTO.map((v) => (
            <option key={v.valor} value={v.valor}>{v.nome}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

/** Toggle Tsumo / Ron. */
function ToggleAgari({ mao, atualizarMao }: { mao: Mao; atualizarMao: any }) {
  return (
    <div style={{ display:'flex', background:'#f0f0f0', borderRadius:8, overflow:'hidden', width:'fit-content', marginBottom:4 }}>
      {(['tsumo', 'ron'] as const).map((tipo) => (
        <button key={tipo} type="button"
          style={{
            padding:'8px 24px', fontWeight:900, border:'none',
            background: mao.agari === tipo ? 'var(--primario)' : 'transparent',
            color: mao.agari === tipo ? 'white' : 'var(--escuro)',
            cursor:'pointer', textTransform:'uppercase', fontSize:'0.9rem',
          }}
          onClick={() => atualizarMao((r: Mao) => { r.agari = tipo })}>
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </button>
      ))}
    </div>
  )
}

/** Botão de ação de meld/dora com cor própria. */
function BotaoAcao({ rotulo, cor, ativo, desabilitado, aoClicar }: {
  tipo: string; rotulo: string; cor: string
  ativo: boolean; desabilitado: boolean; aoClicar: () => void
}) {
  return (
    <button type="button"
      disabled={desabilitado}
      onClick={aoClicar}
      style={{
        minHeight: 36, padding: '4px 12px', fontSize: '0.85rem',
        fontWeight: 900, border: `2px solid ${ativo ? cor : '#dde1e7'}`,
        borderRadius: 8, cursor: desabilitado ? 'not-allowed' : 'pointer',
        background: ativo ? cor : 'white',
        color: ativo ? 'white' : desabilitado ? '#bbb' : cor,
        opacity: desabilitado ? 0.45 : 1,
        transition: 'all 0.15s',
      }}
    >
      {rotulo}
    </button>
  )
}

/** Botão toggle genérico (cinza/azul). */
function BotaoToggle({ rotulo, ativo, desabilitado, aoClicar }: {
  rotulo: string; ativo: boolean; desabilitado: boolean; aoClicar: () => void
}) {
  return (
    <button type="button"
      className={ativo ? 'btn-primario' : 'btn-contorno'}
      disabled={desabilitado}
      style={{ minHeight:36, padding:'4px 14px', fontSize:'0.85rem', opacity: desabilitado ? 0.35 : 1 }}
      onClick={aoClicar}
    >
      {rotulo}
    </button>
  )
}

/** Seletor de Han na calculadora rápida. */
function SeletorHan({ han, fu, fuDisponiveis, aoMudarHan, aoMudarFu }: {
  han: number; fu: number
  fuDisponiveis: Map<number, number[]>
  aoMudarHan: (h: number) => void
  aoMudarFu: (f: number) => void
}) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'0.78rem', fontWeight:900, color:'#607080', textTransform:'uppercase', marginBottom:8 }}>Han</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', maxWidth:300 }}>
        {[...fuDisponiveis.keys()].map((h) => (
          <button key={h} className={han === h ? 'btn-primario' : 'btn-contorno'}
            style={{ minHeight:40, padding:'6px 14px' }}
            onClick={() => {
              aoMudarHan(h)
              const fus = fuDisponiveis.get(h)!
              if (!fus.includes(fu)) aoMudarFu(fus[0])
            }}>
            {h} Han
          </button>
        ))}
        {/* Patamar especial */}
        {[5, 6, 8, 11, 13].map((h) => (
          <button key={`sp${h}`} className={han === h ? 'btn-primario' : 'btn-contorno'}
            style={{ minHeight:40, padding:'6px 14px' }}
            onClick={() => aoMudarHan(h)}>
            {rotularHan(h)}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Seletor de Fu na calculadora rápida. */
function SeletorFu({ han, fu, fuDisponiveis, aoMudarFu }: {
  han: number; fu: number
  fuDisponiveis: Map<number, number[]>
  aoMudarFu: (f: number) => void
}) {
  const opcoes = fuDisponiveis.get(han) ?? []
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'0.78rem', fontWeight:900, color:'#607080', textTransform:'uppercase', marginBottom:8 }}>Fu</div>
      {han >= 5 ? (
        <span style={{ color:'#aaa', fontSize:'0.9rem' }}>— {rotularHan(han)} não usa fu —</span>
      ) : (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', maxWidth:300 }}>
          {opcoes.map((f) => (
            <button key={f} className={fu === f ? 'btn-primario' : 'btn-contorno'}
              style={{ minHeight:40, padding:'6px 14px' }}
              onClick={() => aoMudarFu(f)}>
              {f} Fu
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Exibição de pontos na calculadora rápida. */
function ExibicaoRapida({ resultado, isOya, agari, han, fu }: {
  resultado: any; isOya: boolean; agari: 'ron' | 'tsumo'; han: number; fu: number
}) {
  const pts = resultado?.pontos
  if (!pts) return null
  return (
    <div className="resultado-calculadora" style={{ marginTop:16 }}>
      <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.6)', marginBottom:6, fontWeight:800 }}>
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

/** Exibição completa: nome + pontos + lista de yaku. */
function ExibicaoCompleta({ resultado }: { resultado: any }) {
  const pts = resultado.pontos
  return (
    <>
      {resultado.nome && <div className="nome-mao">{resultado.nome}</div>}
      {resultado.yakuman > 0 && (
        <div style={{ fontSize:'1.1rem', color:'#ffd54f', fontWeight:800, marginBottom:4 }}>
          {resultado.yakuman}× Yakuman
        </div>
      )}
      {resultado.han > 0 && resultado.yakuman === 0 && (
        <div style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.6)', marginBottom:4 }}>
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
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.15)', margin:'14px 0 10px' }} />
          <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', fontWeight:800, textTransform:'uppercase', marginBottom:8 }}>
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

/** Rótulo legível para patamar especial de han. */
function rotularHan(h: number): string {
  if (h >= 13) return 'Yakuman'
  if (h >= 11) return 'Sanbaiman'
  if (h >= 8)  return 'Baiman'
  if (h >= 6)  return 'Haneman'
  return 'Mangan'
}
