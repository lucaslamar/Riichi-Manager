import type { PropsComTorneio } from './tipos'

interface PropsRanking extends PropsComTorneio {
  aoReiniciar: () => void
  aoExportarPdf: () => void
}

/**
 * Tabela de classificação geral do torneio.
 * Ordena os jogadores por pontos de torneio (PT) a cada re-render.
 *
 * @param props - torneio, aoReiniciar, aoExportarPdf.
 */
export function RankingGeral({ torneio, aoReiniciar, aoExportarPdf }: PropsRanking) {
  // `Object.entries` transforma o objeto em array de [nome, pontos] para poder ordenar.
  const ordenados = Object.entries(torneio.classificacao).sort(([, a], [, b]) => b - a)

  return (
    <section className="card" aria-label="Classificação geral">
      <div className="cabecalho-secao">
        <i className="fas fa-chart-bar icone-secao" aria-hidden="true" />
        <h2>Classificação Geral</h2>
      </div>

      <div className="tabela-ranking-responsiva">
        <table id="tabelaRanking">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Jogador</th>
              <th style={{ textAlign: 'right' }}>PT</th>
            </tr>
          </thead>
          <tbody>
            {/* `.map()` transforma o array em elementos JSX — equivale a um for loop */}
            {ordenados.map(([jogador, pontos], i) => (
              // `key` é obrigatório em listas React para identificar elementos únicos.
              <tr key={jogador}>
                <td>{i + 1}º</td>
                <td>{jogador}</td>
                <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--primario)' }}>
                  {pontos > 0 ? '+' : ''}
                  {pontos.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="acoes-ranking">
        <button
          className="btn-contorno btn-perigo"
          type="button"
          onClick={() => {
            if (window.confirm('Reiniciar o torneio? Todos os dados serão perdidos.')) {
              aoReiniciar()
            }
          }}
        >
          <i className="fas fa-undo" /> Reiniciar torneio
        </button>
        <button className="btn-contorno" type="button" onClick={aoExportarPdf}>
          <i className="fas fa-file-pdf" /> Gerar PDF
        </button>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMER DA RODADA
// ═══════════════════════════════════════════════════════════════════════════════
