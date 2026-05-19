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
  type ConfiguracaoCalculo,
  type DetalheFu,
} from '../logica/calculo/mao'

// ─── Constantes de UI ─────────────────────────────────────────────────────────

const NAIPES = [
  { naipe: 'm' as const, rotulo: 'Man (万)' },
  { naipe: 'p' as const, rotulo: 'Pin (筒)' },
  { naipe: 's' as const, rotulo: 'Sou (索)' },
]

const HONRAS: CodigoPedra[] = ['1z', '2z', '3z', '4z', '5z', '6z', '7z']
const NOMES_HONRAS = ['Ton', 'Nan', 'Sha', 'Pei', 'Haku', 'Hatsu', 'Chun']

const NOMES_ARQUIVOS_PEDRAS: Record<string, string> = {
  '1z': 'Ton',
  '2z': 'Nan',
  '3z': 'Shaa',
  '4z': 'Pei',
  '5z': 'Haku',
  '6z': 'Hatsu',
  '7z': 'Chun',
}

function arquivoPedra(pedra: CodigoPedra): string {
  const valor = pedra[0]
  const naipe = pedra[1]
  if (valor === '0' && naipe === 'm') return 'Man5-Dora'
  if (valor === '0' && naipe === 'p') return 'Pin5-Dora'
  if (valor === '0' && naipe === 's') return 'Sou5-Dora'
  if (naipe === 'm') return `Man${valor}`
  if (naipe === 'p') return `Pin${valor}`
  if (naipe === 's') return `Sou${valor}`
  return NOMES_ARQUIVOS_PEDRAS[pedra] ?? 'Blank'
}

function codigoBase(pedra: CodigoPedra): CodigoPedra {
  return pedra[0] === '0' ? `5${pedra[1]}` : pedra
}

function valorPedra(pedra: CodigoPedra): number {
  return pedra[0] === '0' ? 5 : Number(pedra[0])
}

function expandirGrupoMesmoValor(pedra: CodigoPedra, tamanho: number): CodigoPedra[] {
  if (pedra[0] !== '0') return Array(tamanho).fill(pedra)
  return [pedra, ...Array(tamanho - 1).fill(codigoBase(pedra))]
}

function urlPedra(nomeArquivo: string, formato: 'png' | 'svg'): string {
  const pasta = formato === 'png' ? 'regular-png' : 'regular'
  return `tiles/${pasta}/${nomeArquivo}.${formato}?v=2`
}

function ehPedraNumerada(pedra: CodigoPedra): boolean {
  return ['m', 'p', 's'].includes(pedra[1])
}

function podeAdicionarAoChii(selecionadas: CodigoPedra[], pedra: CodigoPedra): boolean {
  if (!ehPedraNumerada(pedra)) return false
  if (selecionadas.length >= 3) return false
  if (selecionadas.some((p) => !ehPedraNumerada(p) || p[1] !== pedra[1])) return false

  const numeros = [...selecionadas, pedra].map(valorPedra)
  if (new Set(numeros).size !== numeros.length) return false

  return [1, 2, 3, 4, 5, 6, 7].some((inicio) =>
    numeros.every((n) => n >= inicio && n <= inicio + 2)
  )
}

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

const CONFIGURACOES_REGRAS: {
  chave: keyof ConfiguracaoCalculo
  titulo: string
  ligado: string
  desligado: string
  ajuda: string
}[] = [
  {
    chave: 'akadora',
    titulo: 'Aka dora',
    ligado: 'Ativar',
    desligado: 'Desativar',
    ajuda: 'Permite contar os cincos vermelhos como dora. Quando ativado, o teclado mostra um 5 vermelho para cada naipe.',
  },
  {
    chave: 'tanyaoAberto',
    titulo: 'Tanyao aberto',
    ligado: 'Permitido',
    desligado: 'Fechado apenas',
    ajuda: 'Define se Tanyao vale com chamadas abertas. É comum em regras japonesas modernas, mas alguns grupos usam kuitan nashi.',
  },
  {
    chave: 'fuVentosDuplo',
    titulo: 'Par de vento duplo',
    ligado: '4 fu',
    desligado: '2 fu',
    ajuda: 'Quando o par é ao mesmo tempo vento da rodada e do assento, algumas regras somam 4 fu. Em regras competitivas modernas costuma ser 2 fu.',
  },
  {
    chave: 'fuRinshan',
    titulo: 'Fu em Rinshan',
    ligado: '+2 fu',
    desligado: 'Sem +2 fu',
    ajuda: 'Define se uma vitória por Rinshan Kaihou recebe também os 2 fu de tsumo.',
  },
  {
    chave: 'kiriageMangan',
    titulo: 'Kiriage mangan',
    ligado: 'Ativar',
    desligado: 'Desativar',
    ajuda: 'Arredonda 4 han 30 fu e 3 han 60 fu para mangan quando a regra da mesa usa kiriage.',
  },
  {
    chave: 'kazoeYakuman',
    titulo: 'Kazoe yakuman',
    ligado: 'Yakuman',
    desligado: 'Sanbaiman',
    ajuda: 'Define se 13 ou mais han sem yakuman natural contam como yakuman contado ou param em Sanbaiman.',
  },
  {
    chave: 'yakumanDuplo',
    titulo: 'Yakuman duplo',
    ligado: 'Permitir',
    desligado: 'Simples',
    ajuda: 'Permite formas especiais como Suuankou tanki ou Kokushi 13 esperas valerem yakuman duplo.',
  },
  {
    chave: 'multiYakuman',
    titulo: 'Yakuman acumulado',
    ligado: 'Permitir',
    desligado: 'Um so',
    ajuda: 'Permite somar múltiplos yakuman na mesma mão, por exemplo Daisuushii junto com Tsuuiisou.',
  },
]

// ─── Cores dos melds ──────────────────────────────────────────────────────────

/**
 * Cada tipo de meld tem cor e rótulo diferente para identificação rápida.
 */
const ESTILO_MELD: Record<Meld['tipo'], { fundo: string; borda: string; rotulo: string }> = {
  chii:       { fundo: '#e8f5e9', borda: '#4caf50', rotulo: 'Chi' },
  pon:        { fundo: '#e3f2fd', borda: '#2196f3', rotulo: 'Pon' },
  kanAberto:  { fundo: '#fff3e0', borda: '#ff9800', rotulo: 'Kan aberto' },
  kanFechado: { fundo: '#f3e5f5', borda: '#9c27b0', rotulo: 'Kan fechado' },
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface PropsPagina {
  aoVoltar: () => void
}

export default function PaginaCalculadora({ aoVoltar }: PropsPagina) {
  const [mao, atualizarMao] = useImmer<Mao>(MAO_VAZIA)
  const [acaoPendente, setAcaoPendente] = useState<Acao | null>(null)
  const [modo, setModo] = useState<'completo' | 'rapido'>('completo')
  const [configuracao, setConfiguracao] = useState<ConfiguracaoCalculo>(configuracaoPadrao)
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false)

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
  const contarCodigo = (c: CodigoPedra) => todasPedras.filter((p) => codigoBase(p) === codigoBase(c)).length
  const contarAka = (c: CodigoPedra) => todasPedras.filter((p) => p === c).length
  const podeAdicionarPedras = (pedras: CodigoPedra[]) =>
    pedras.every((pedra) =>
      contarCodigo(pedra) + pedras.filter((p) => codigoBase(p) === codigoBase(pedra)).length <= 4
      && (pedra[0] !== '0' || contarAka(pedra) + pedras.filter((p) => p === pedra).length <= 1)
    )
  const podeSelecionarPedra = (pedra: CodigoPedra): boolean => {
    if (!acaoPendente) return podeAdicionarPedras([pedra])
    switch (acaoPendente.tipo) {
      case 'dora':
      case 'uradora':
        if (pedra[0] === '0') return false
        return podeAdicionarPedras([pedra])
      case 'pon':
        return podeAdicionarPedras(expandirGrupoMesmoValor(pedra, 3))
      case 'kanAberto':
      case 'kanFechado':
        return podeAdicionarPedras(expandirGrupoMesmoValor(pedra, 4))
      case 'chii':
        return podeAdicionarAoChii(acaoPendente.pedras, pedra) && podeAdicionarPedras([pedra])
    }
  }

  // Calculadora rápida
  const tabelaRapida = calcularHanFu(han, fu, configuracao)
  const resultadoRapido = montarPontosRapidos(mao.ventoAssento === '1', mao.agari, tabelaRapida)
  const fuDisponiveis = fuValidos(mao.agari)

  // Resultado completo (calculado ao vivo quando a mão está completa)
  const resultado = maoCompleta
    ? (() => { try { return calcularMao(mao, configuracao) } catch { return null } })()
    : null

  // ── Handlers ────────────────────────────────────────────────────────────────

  const adicionarPedra = (pedra: CodigoPedra) => {
    if (!acaoPendente) {
      // Bloqueia se a mão já está completa (14 slots)
      if (maoCompleta) return
      if (!podeAdicionarPedras([pedra])) return
      atualizarMao((r) => {
        r.pedras.push(pedra)
        ordenarPedras(r.pedras)
        r.indiceAgari = r.pedras.lastIndexOf(pedra)
      })
      return
    }

    switch (acaoPendente.tipo) {
      case 'dora':
        if (pedra[0] === '0') return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((r) => { r.dora.push(pedra) })
        setAcaoPendente(null)
        return
      case 'uradora':
        if (pedra[0] === '0') return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((r) => { r.uradora.push(pedra) })
        setAcaoPendente(null)
        return
      case 'pon':
        {
        const pedras = expandirGrupoMesmoValor(pedra, 3)
        if (!podeAdicionarPedras(pedras)) return
        atualizarMao((r) => {
          r.melds.push({ tipo: 'pon', pedras })
          ordenarMelds(r.melds)
          r.riichi = null
        })
        setAcaoPendente(null)
        return
        }
      case 'kanAberto':
        {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!podeAdicionarPedras(pedras)) return
        atualizarMao((r) => {
          r.melds.push({ tipo: 'kanAberto', pedras })
          ordenarMelds(r.melds)
          r.riichi = null
        })
        setAcaoPendente(null)
        return
        }
      case 'kanFechado':
        {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!podeAdicionarPedras(pedras)) return
        atualizarMao((r) => {
          r.melds.push({ tipo: 'kanFechado', pedras })
          ordenarMelds(r.melds)
        })
        setAcaoPendente(null)
        return
        }
      case 'chii': {
        if (!podeAdicionarAoChii(acaoPendente.pedras, pedra)) return
        if (!podeAdicionarPedras([pedra])) return
        const novasPedras = [...acaoPendente.pedras, pedra]
        if (novasPedras.length < 3) {
          setAcaoPendente({ tipo: 'chii', pedras: novasPedras })
        } else {
          const pedrasChii = ordenarPedras([...novasPedras])
          atualizarMao((r) => {
            r.melds.push({ tipo: 'chii', pedras: [...pedrasChii] })
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
  const podeKanFechado = mao.riichi === null && !mao.bencao && slotsLivres >= 3
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
          className="btn-contorno"
          type="button"
          onClick={() => setModalRegrasAberto(true)}
          title="Configurar regras de cálculo"
          style={{ minHeight:40, padding:'8px 16px' }}
        >
          <i className="fas fa-sliders-h" /> Regras
        </button>
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
                  <PedraSvg pedra={pedra} />
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
                    <PedrasMeld meld={meld} />
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
                        <PedraSvg pedra={p} />
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
                        <PedraSvg pedra={p} />
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
              <BotaoAcao tipo="kanFechado" rotulo="Kan (fechado)" cor="#9c27b0" ativo={acaoPendente?.tipo === 'kanFechado'} desabilitado={!podeKanFechado} aoClicar={() => alternarAcao('kanFechado')} />
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
                      const invalidaParaAcao = !podeSelecionarPedra(codigo)
                      return (
                        <button key={codigo} className="btn-pedra" type="button"
                          disabled={esgotada || cheiaESemAcao || invalidaParaAcao}
                          onClick={() => adicionarPedra(codigo)}>
                          <PedraSvg pedra={codigo} />
                        </button>
                      )
                    })}
                    {configuracao.akadora && (() => {
                      const codigo = `0${naipe}`
                      const esgotada = contarAka(codigo) >= 1 || contarCodigo(codigo) >= 4
                      const cheiaESemAcao = maoCompleta && !acaoPendente
                      const invalidaParaAcao = !podeSelecionarPedra(codigo)
                      return (
                        <button
                          key={codigo}
                          className="btn-pedra btn-pedra-aka"
                          type="button"
                          title="5 vermelho (aka dora)"
                          disabled={esgotada || cheiaESemAcao || invalidaParaAcao}
                          onClick={() => adicionarPedra(codigo)}
                        >
                          <PedraSvg pedra={codigo} />
                        </button>
                      )
                    })()}
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
                      disabled={contarCodigo(codigo) >= 4 || (maoCompleta && !acaoPendente) || !podeSelecionarPedra(codigo)}
                      onClick={() => adicionarPedra(codigo)}>
                      <PedraSvg pedra={codigo} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: opções da mão */}
          <div className="card">
            <ResumoMaoFixo mao={mao} totalPedras={totalPedras} slotsUsados={slotsUsados} />
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

      {modalRegrasAberto && (
        <ModalRegras
          configuracao={configuracao}
          aoMudar={setConfiguracao}
          aoFechar={() => setModalRegrasAberto(false)}
        />
      )}
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ModalRegras({ configuracao, aoMudar, aoFechar }: {
  configuracao: ConfiguracaoCalculo
  aoMudar: (config: ConfiguracaoCalculo) => void
  aoFechar: () => void
}) {
  const alternar = (chave: keyof ConfiguracaoCalculo) => {
    aoMudar({ ...configuracao, [chave]: !configuracao[chave] })
  }

  return (
    <div className="modal-regras-fundo" role="presentation" onMouseDown={aoFechar}>
      <div
        className="modal-regras"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-regras"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-regras-cabecalho">
          <div>
            <h3 id="titulo-regras">Regras de cálculo</h3>
            <p>Escolha as variações usadas pela mesa.</p>
          </div>
          <button className="btn-icone" type="button" onClick={aoFechar} aria-label="Fechar regras">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="lista-regras">
          {CONFIGURACOES_REGRAS.map((regra) => {
            const ativo = configuracao[regra.chave]
            return (
              <div className="linha-regra" key={regra.chave}>
                <div className="texto-regra">
                  <strong>{regra.titulo}</strong>
                  <span>{regra.ajuda}</span>
                </div>
                <div className="controle-regra" aria-label={regra.titulo}>
                  <button
                    type="button"
                    className={ativo ? 'ativo' : ''}
                    onClick={() => { if (!ativo) alternar(regra.chave) }}
                  >
                    {regra.ligado}
                  </button>
                  <button
                    type="button"
                    className={!ativo ? 'ativo' : ''}
                    onClick={() => { if (ativo) alternar(regra.chave) }}
                  >
                    {regra.desligado}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="modal-regras-rodape">
          <button type="button" className="btn-contorno" onClick={() => aoMudar(configuracaoPadrao)}>
            Restaurar padrao
          </button>
          <button type="button" className="btn-primario" onClick={aoFechar}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

function ResumoMaoFixo({ mao, totalPedras, slotsUsados }: {
  mao: Mao
  totalPedras: number
  slotsUsados: number
}) {
  if (totalPedras === 0 && mao.dora.length === 0 && mao.uradora.length === 0) return null

  return (
    <div className="resumo-mao-fixo" aria-label="Resumo da mão">
      <div className="resumo-mao-linha">
        <strong>Mão</strong>
        <span>{totalPedras} pedras · {slotsUsados}/14 slots</span>
      </div>
      <div className="resumo-mao-pedras">
        {mao.pedras.map((pedra, i) => (
          <span key={`mao-${i}`} className={`chip-pedra mini ${i === mao.indiceAgari ? 'agari' : ''}`}>
            <PedraSvg pedra={pedra} />
          </span>
        ))}
        {mao.melds.map((meld, i) => (
          <span key={`meld-resumo-${i}`} className="resumo-meld">
            <PedrasMeld meld={meld} />
          </span>
        ))}
      </div>
      {(mao.dora.length > 0 || mao.uradora.length > 0) && (
        <div className="resumo-mao-doras">
          {mao.dora.length > 0 && (
            <span><strong>Dora</strong> {mao.dora.map((p, i) => <PedraSvg key={`d-${i}`} pedra={p} />)}</span>
          )}
          {mao.uradora.length > 0 && (
            <span><strong>Uradora</strong> {mao.uradora.map((p, i) => <PedraSvg key={`u-${i}`} pedra={p} />)}</span>
          )}
        </div>
      )}
    </div>
  )
}

function PedraSvg({ pedra, virada = false, deLado = false }: {
  pedra?: CodigoPedra
  virada?: boolean
  deLado?: boolean
}) {
  const [formato, setFormato] = useState<'png' | 'svg' | 'texto'>('png')
  const nomeArquivo = virada ? 'Back' : pedra ? arquivoPedra(pedra) : 'Blank'
  const alt = virada ? 'Pedra virada' : pedra ?? 'Pedra vazia'

  if (formato === 'texto') {
    return (
      <span className={`tile-img tile-fallback ${deLado ? 'tile-img-lado' : ''}`} aria-label={alt}>
        {virada ? '' : pedra}
      </span>
    )
  }

  return (
    <img
      className={`tile-img ${pedra === '5z' ? 'tile-img-haku' : ''} ${deLado ? 'tile-img-lado' : ''}`}
      src={urlPedra(nomeArquivo, formato)}
      alt=""
      aria-label={alt}
      draggable={false}
      onError={() => setFormato(formato === 'png' ? 'svg' : 'texto')}
    />
  )
}

function PedrasMeld({ meld }: { meld: Meld }) {
  if (meld.tipo === 'kanFechado') {
    return (
      <span className="meld-pedras">
        <PedraSvg virada />
        <PedraSvg pedra={meld.pedras[1]} />
        <PedraSvg pedra={meld.pedras[2]} />
        <PedraSvg virada />
      </span>
    )
  }

  return (
    <span className="meld-pedras">
      {meld.pedras.map((p, j) => (
        <PedraSvg key={j} pedra={p} deLado={j === 0} />
      ))}
    </span>
  )
}

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
      {resultado.fuDetalhes?.length > 0 && resultado.yakuman === 0 && (
        <>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.15)', margin:'14px 0 10px' }} />
          <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', fontWeight:800, textTransform:'uppercase', marginBottom:8 }}>
            Fu
          </div>
          <div className="lista-fu">
            {resultado.fuDetalhes.map((detalhe: DetalheFu, i: number) => (
              <span key={i} className="chip-fu">
                <strong>{detalhe.fu} fu</strong>
                <span>{detalhe.tipo}</span>
                <small>{detalhe.descricao}</small>
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
