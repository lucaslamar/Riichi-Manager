import { useState } from 'react'
import type { PropsComAtualizacao } from './tipos'
import { embaralhar } from '../../logica/aleatorio'
import { gerarGrade } from '../../logica/sorteio'
import { rotuloQualidade } from '../../logica/qualidade'
import { criarTimerVazio } from '../../persistencia/armazenamento'

/**
 * Exibe métricas de qualidade do sorteio e permite refazer a grade.
 *
 * @param props - torneio e atualizarTorneio.
 */
export function PainelQualidade({ torneio, atualizarTorneio }: PropsComAtualizacao) {
  const [aberto, setAberto] = useState(false)
  const { qualidade } = torneio
  if (!qualidade) return null

  const handleRefazer = () => {
    if (
      !window.confirm(
        'Refazer o sorteio mantendo os mesmos nomes?\nIsso apaga resultados e acréscimos.',
      )
    )
      return

    atualizarTorneio((torneioAtual) => {
      const embaralhados = embaralhar(torneioAtual.jogadores)
      const grade = gerarGrade(embaralhados)
      return {
        ...torneioAtual,
        jogadores: embaralhados,
        grade: grade.rodadas,
        qualidade: grade.qualidade,
        classificacao: Object.fromEntries(embaralhados.map((j) => [j, 0])),
        mesasConcluidas: {},
        pontuacoesPorMesa: {},
        timer: criarTimerVazio(0, torneioAtual.timer.totalSegundos),
      }
    })
  }

  const metricaOponente =
    qualidade.limiteRepetidosPorJogador === null
      ? `${qualidade.maxRepetidosPorJogador}`
      : `${qualidade.maxRepetidosPorJogador}/${qualidade.limiteRepetidosPorJogador}`

  return (
    <section className="card" aria-label="Qualidade da grade">
      <button
        className="cabecalho-secao cabecalho-colapsavel"
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
      >
        <i className="fas fa-clipboard-check icone-secao" aria-hidden="true" />
        <h2 style={{ flex: 1 }}>Diagnóstico da Grade</h2>
        <span className="pilula-status">{rotuloQualidade(qualidade)}</span>
        <i className="fas fa-chevron-down icone-chevron" aria-hidden="true" />
      </button>

      <div className={`painel-colapsavel ${aberto ? 'painel-aberto' : ''}`}>
        <dl className="metricas" style={{ marginTop: 16 }}>
          <div>
            <dt>Leste exato</dt>
            <dd>{qualidade.lesteExato ? 'Sim' : 'Não'}</dd>
          </div>
          <div>
            <dt>Max. encontros por par</dt>
            <dd>{qualidade.maxRepeticioesPar}</dd>
          </div>
          <div>
            <dt>Pares 2×</dt>
            <dd>
              {qualidade.quantidadeDuasVezes}/{qualidade.quantidadeIdealRepetidos}
            </dd>
          </div>
          <div>
            <dt>Adversários rep./jogador</dt>
            <dd>{metricaOponente}</dd>
          </div>
          <div>
            <dt>Pares 3×+</dt>
            <dd>{qualidade.quantidadeTresVezesMais}</dd>
          </div>
          <div>
            <dt>Mesas iguais</dt>
            <dd>{qualidade.mesasCompletasRepetidas}</dd>
          </div>
        </dl>

        {qualidade.paresRepetidos.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: '0.9rem',
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
            >
              Pares que se repetiram
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {qualidade.paresRepetidos.map((par) => (
                <span
                  key={par.jogadores.join('+')}
                  className={`chip-par ${par.vezes >= 3 ? 'perigo' : ''}`}
                >
                  {par.jogadores[0]} + {par.jogadores[1]} <strong>{par.vezes}×</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="acoes-qualidade">
          <p style={{ margin: 0, color: '#607080', fontSize: '0.9rem', fontWeight: 800 }}>
            Nota ruim? Refaça o sorteio com os mesmos jogadores.
          </p>
          <button className="btn-contorno" type="button" onClick={handleRefazer}>
            <i className="fas fa-shuffle" /> Refazer sorteio
          </button>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE DE RODADAS E MESAS
// ═══════════════════════════════════════════════════════════════════════════════
