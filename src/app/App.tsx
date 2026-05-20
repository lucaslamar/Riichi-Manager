/**
 * @fileoverview Componente raiz da aplicação — App.tsx
 *
 * O App é o "gerente" de tudo:
 * - Mantém o estado global do torneio (persistido no localStorage).
 * - Controla qual tela está sendo exibida (roteamento manual sem biblioteca).
 * - Passa dados e callbacks para os componentes filhos via props.
 *
 * Conceitos React demonstrados:
 * - `useState`: estado local que dispara re-render ao mudar.
 * - `useCallback`: memoiza funções passadas como props para evitar re-renders desnecessários.
 * - "Lifting state up": o estado vive no nível mais alto que precisa dele.
 * - Prop drilling controlado: passamos apenas o que cada componente precisa.
 */

import { useState, useCallback } from 'react'
import {
  carregarTorneio,
  salvarTorneio,
  criarTorneioVazio,
} from '@/dominios/torneio-fast/persistencia/armazenamento'
import type { EstadoTorneio } from '@/dominios/torneio-fast/logica/tipos'
import Cabecalho from '@/compartilhado/interface/layout/Cabecalho'
import MenuInicial from '@/compartilhado/interface/layout/MenuInicial'
import {
  ConfiguracaoTorneio,
  RankingGeral,
  TimerRodada,
  PainelQualidade,
  GradeRodadas,
} from '@/dominios/torneio-fast/interface/componentes/ComponentesTorneio'
import PaginaCalculadora from '@/dominios/calculadora/interface/paginas/PaginaCalculadora'

// ─── Tipo de telas ────────────────────────────────────────────────────────────

/**
 * Todas as telas possíveis da aplicação.
 * Exportado para que outros componentes possam tipificar callbacks de navegação.
 */
export type TelaPrincipal =
  | 'inicio'
  | 'configuracaoTorneio'
  | 'calculadora'
  | 'suico'
  | 'referenciaYaku'

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Retorna true se o torneio tem jogadores e grade montada. */
function torneioAtivo(torneioAtual: EstadoTorneio): boolean {
  return torneioAtual.jogadores.length > 0 && torneioAtual.grade.length > 0
}

// ─── Componente raiz ──────────────────────────────────────────────────────────

/**
 * Componente raiz — montado uma única vez no index.html via main.tsx.
 * Toda a árvore de componentes vive dentro deste.
 *
 * @returns JSX de toda a aplicação.
 */
export default function App() {
  // ── Estado global do torneio ────────────────────────────────────────────────
  // `useState` aceita uma função de inicialização (lazy init) — `carregarTorneio`
  // só é chamada uma vez, na primeira renderização.
  const [torneio, setTorneioInterno] = useState<EstadoTorneio>(carregarTorneio)

  // ── Tela atual ──────────────────────────────────────────────────────────────
  const [tela, setTela] = useState<TelaPrincipal>('inicio')

  // ── Callbacks memoizados ────────────────────────────────────────────────────
  // `useCallback` evita recriar a função a cada render — importante quando
  // a função é passada como prop para componentes que usam React.memo.

  /**
   * Substitui o torneio completo e persiste no localStorage.
   * Usado quando o estado novo não depende do estado anterior.
   */
  const definirTorneio = useCallback((proximo: EstadoTorneio) => {
    setTorneioInterno(proximo)
    salvarTorneio(proximo)
  }, [])

  /**
   * Atualiza o torneio via função transformadora.
   * Padrão funcional: recebe o estado atual, devolve o novo.
   * Garante que atualizações rápidas não percam dados (sem race conditions).
   */
  const atualizarTorneio = useCallback(
    (transformar: (torneioAtual: EstadoTorneio) => EstadoTorneio) => {
      setTorneioInterno((anterior) => {
        const proximo = transformar(anterior)
        salvarTorneio(proximo)
        return proximo
      })
    },
    [],
  )

  /**
   * Reinicia o torneio para o estado vazio e volta ao cadastro.
   */
  const reiniciarTorneio = useCallback(() => {
    const vazio = criarTorneioVazio()
    setTorneioInterno(vazio)
    salvarTorneio(vazio)
    setTela('configuracaoTorneio')
  }, [])

  /**
   * Callback chamado pela ConfiguracaoTorneio quando a grade é gerada.
   */
  const aoIniciarTorneio = useCallback(
    (torneioGerado: EstadoTorneio) => {
      definirTorneio(torneioGerado)
      setTela('inicio')
    },
    [definirTorneio],
  )

  const exportarPdf = useCallback(() => {
    // jsPDF é carregado via CDN no index.html e fica disponível em window.jspdf
    const janela = window as any
    const jsPDF = janela.jspdf?.jsPDF
    if (!jsPDF) {
      alert('jsPDF não carregou. Verifique a conexão.')
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Ranking — Riichi Manager', 14, 20)
    doc.setFontSize(11)

    const linhas = Object.entries(torneio.classificacao)
      .sort(([, a], [, b]) => b - a)
      .map(([jogador, pts], i) => [`${i + 1}º`, jogador, `${pts > 0 ? '+' : ''}${pts.toFixed(1)}`])

    doc.autoTable({ head: [['Pos.', 'Jogador', 'PT']], body: linhas, startY: 30 })
    doc.save('ranking-riichi.pdf')
  }, [torneio])

  // ── Render ──────────────────────────────────────────────────────────────────

  const ativo = torneioAtivo(torneio)

  return (
    // Fragment (<>) agrupa elementos sem criar um nó DOM extra.
    <>
      <Cabecalho />

      {/*
        Roteamento manual: exibe o componente certo com base no estado `tela`.
        Em projetos maiores usaríamos React Router, mas para este app é suficiente.
      */}
      <main className="conteudo-principal">
        {/* ── Calculadora (disponível sempre, independente de torneio) ── */}
        {tela === 'calculadora' && <PaginaCalculadora aoVoltar={() => setTela('inicio')} />}

        {/* ── Telas sem torneio ativo ── */}
        {tela !== 'calculadora' && !ativo && (
          <>
            {tela === 'inicio' && (
              <MenuInicial
                aoClicarTorneioFast={() => setTela('configuracaoTorneio')}
                aoNavegar={setTela}
              />
            )}

            {tela === 'configuracaoTorneio' && (
              <ConfiguracaoTorneio
                aoIniciar={aoIniciarTorneio}
                aoVoltar={() => setTela('inicio')}
              />
            )}

            {/* Telas em desenvolvimento */}
            {(tela === 'suico' || tela === 'referenciaYaku') && (
              <PlaceholderFuncionalidade tela={tela} aoVoltar={() => setTela('inicio')} />
            )}
          </>
        )}

        {/* ── Torneio em andamento ── */}
        {tela !== 'calculadora' && ativo && (
          <>
            <RankingGeral
              torneio={torneio}
              aoReiniciar={reiniciarTorneio}
              aoExportarPdf={exportarPdf}
            />

            <TimerRodada torneio={torneio} atualizarTorneio={atualizarTorneio} />

            <PainelQualidade torneio={torneio} atualizarTorneio={atualizarTorneio} />

            <GradeRodadas torneio={torneio} atualizarTorneio={atualizarTorneio} />

            {/* Botão flutuante para abrir a calculadora durante o torneio */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
              <button
                className="btn-primario"
                type="button"
                style={{
                  borderRadius: '50px',
                  padding: '14px 20px',
                  boxShadow: '0 4px 16px rgba(33,150,243,0.4)',
                }}
                onClick={() => setTela('calculadora')}
                title="Abrir calculadora"
              >
                <i className="fas fa-calculator" /> Calculadora
              </button>
            </div>
          </>
        )}
      </main>
    </>
  )
}

// ─── Placeholder de funcionalidade futura ─────────────────────────────────────

const CONFIG_PLACEHOLDER: Record<string, { icone: string; titulo: string; descricao: string }> = {
  suico: {
    icone: 'fa-trophy',
    titulo: 'Sistema Suíço',
    descricao:
      'Módulo de torneio suíço com múltiplas rodadas e emparelhamento dinâmico. Em desenvolvimento.',
  },
  referenciaYaku: {
    icone: 'fa-book',
    titulo: 'Referência de Yaku',
    descricao:
      'Guia visual completo de todos os yaku com exemplos e valor em han. Em desenvolvimento.',
  },
}

function PlaceholderFuncionalidade({
  tela,
  aoVoltar,
}: {
  tela: TelaPrincipal
  aoVoltar: () => void
}) {
  const config = CONFIG_PLACEHOLDER[tela]
  if (!config) return null

  return (
    <section className="card placeholder-funcionalidade">
      <div className="placeholder-icone">
        <i className={`fas ${config.icone}`} />
      </div>
      <div>
        <h2>{config.titulo}</h2>
        <p style={{ color: '#607080', fontWeight: 700, margin: '8px 0 0' }}>{config.descricao}</p>
      </div>
      <div className="acoes" style={{ justifyContent: 'center' }}>
        <button className="btn-contorno" type="button" onClick={aoVoltar}>
          <i className="fas fa-arrow-left" /> Voltar
        </button>
      </div>
    </section>
  )
}
