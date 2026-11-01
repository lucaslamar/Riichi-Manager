import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { partesDoNome } from '@/dominios/jogadores/logica/jogadores'
import type { FiltroOrigem, FiltroPeriodo } from '../../logica/ranking'
import { useRankingGeral } from '../hooks/useRankingGeral'

const PERIODOS: readonly FiltroPeriodo[] = ['mes', 'ano', 'tudo']
const ORIGENS: readonly FiltroOrigem[] = ['todas', 'casuais', 'torneios']

/** Ranking geral: partidas finalizadas, casuais e de torneio. */
export default function PaginaRanking({ aoVoltar }: { aoVoltar: () => void }) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { periodo, setPeriodo, origem, setOrigem, linhas, posicoes } = useRankingGeral()

  const nomeDe = (id: string) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? partesDoNome(jogador).principal : '—'
  }
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

  return (
    <section className="ptd-inicio">
      <TituloTela titulo={t('match.home.ranking')} aoVoltar={aoVoltar} />

      <div className="ptd-filtros">
        <div className="ptd-segmentos" role="group" aria-label={t('match.ranking.period')}>
          {PERIODOS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={`ptd-segmento${periodo === opcao ? ' ptd-segmento--ativo' : ''}`}
              aria-pressed={periodo === opcao}
              onClick={() => setPeriodo(opcao)}
            >
              {t(`match.ranking.periods.${opcao}`)}
            </button>
          ))}
        </div>
        <div className="ptd-segmentos" role="group" aria-label={t('match.ranking.origin')}>
          {ORIGENS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={`ptd-segmento${origem === opcao ? ' ptd-segmento--ativo' : ''}`}
              aria-pressed={origem === opcao}
              onClick={() => setOrigem(opcao)}
            >
              {t(`match.ranking.origins.${opcao}`)}
            </button>
          ))}
        </div>
      </div>

      {linhas.length === 0 ? (
        <p className="ptd-vazio">{t('match.ranking.empty')}</p>
      ) : (
        <ol className="ptd-ranking">
          {linhas.map((linha, indice) => (
            <li key={linha.jogadorId} className="ptd-linha-ranking">
              <div className="ptd-linha-ranking-topo">
                <span className="ptd-resultado-lugar">
                  {t('match.result.place', { place: posicoes[indice] })}
                </span>
                <strong className="ptd-opcao-nome">{nomeDe(linha.jogadorId)}</strong>
                <strong className={linha.pontuacaoTotal < 0 ? 'ptd-negativo' : 'ptd-positivo'}>
                  {comSinal(linha.pontuacaoTotal)}
                </strong>
              </div>
              <dl className="ptd-metricas">
                <div>
                  <dt>{t('match.ranking.games')}</dt>
                  <dd>{numero(linha.partidas)}</dd>
                </div>
                <div>
                  <dt>{t('match.ranking.averagePlace')}</dt>
                  <dd>{numero(linha.mediaColocacao)}</dd>
                </div>
                <div>
                  <dt>{t('match.ranking.first')}</dt>
                  <dd>{numero(linha.percentualPrimeiro)}%</dd>
                </div>
                <div>
                  <dt>{t('match.ranking.fourth')}</dt>
                  <dd>{numero(linha.percentualQuarto)}%</dd>
                </div>
                <div>
                  <dt>{t('match.ranking.tobi')}</dt>
                  <dd>{numero(linha.percentualTobi)}%</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
