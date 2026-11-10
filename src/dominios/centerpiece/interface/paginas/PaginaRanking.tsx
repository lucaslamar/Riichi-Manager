import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { partesDoNome } from '@/dominios/jogadores/logica/jogadores'
import { posicoesDoRanking, semExcluidos, type FiltroPeriodo } from '../../logica/ranking'
import { useRankingGeral } from '../hooks/useRankingGeral'

const PERIODOS: readonly FiltroPeriodo[] = ['mes', 'ano', 'tudo']

/**
 * Ranking geral: soma das partidas finalizadas. Na aba Ranking é a raiz (sem
 * voltar), com o cadastro de jogadores e a engrenagem no cabeçalho.
 */
export default function PaginaRanking({
  aoVoltar,
  aoAbrirJogadores,
}: {
  aoVoltar?: () => void
  aoAbrirJogadores?: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { periodo, setPeriodo, linhas: todas } = useRankingGeral()
  const linhas = semExcluidos(todas, (id) => jogadores.some((jogador) => jogador.id === id))
  const posicoes = posicoesDoRanking(linhas)

  /** Apelido em destaque e o nome embaixo (omitido se não houver apelido ou se forem iguais). */
  const nomesDe = (id: string) => {
    const jogador = jogadores.find((item) => item.id === id)
    if (!jogador) return { principal: '—', apoio: undefined }
    const partes = partesDoNome(jogador)
    const apelido = jogador.apelido ?? partes.apoio
    const nome = partes.principal
    return apelido && apelido !== nome ? { principal: apelido, apoio: nome } : { principal: nome, apoio: undefined }
  }
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

  return (
    <section className="ptd-inicio">
      <TituloTela
        titulo={aoVoltar ? t('match.home.ranking') : t('menu.ranking')}
        aoVoltar={aoVoltar}
        acoes={
          <>
            {aoAbrirJogadores && (
              <button
                type="button"
                className="botao-voltar-tela"
                aria-label={t('players.title')}
                title={t('players.title')}
                onClick={aoAbrirJogadores}
              >
                <i className="fas fa-user-plus" aria-hidden="true" />
              </button>
            )}
            {!aoVoltar && <BotaoConfiguracoes />}
          </>
        }
      />

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
      </div>

      {linhas.length === 0 ? (
        <p className="ptd-vazio">{t('match.ranking.empty')}</p>
      ) : (
        <ol className="ptd-ranking">
          {linhas.map((linha, indice) => {
            const nomes = nomesDe(linha.jogadorId)
            return (
            <li key={linha.jogadorId} className="ptd-linha-ranking">
              <div className="ptd-linha-ranking-topo">
                <span className="ptd-resultado-lugar">
                  {t('match.result.place', { place: posicoes[indice] })}
                </span>
                <span className="ptd-ranking-nomes">
                  <strong className="ptd-opcao-nome">{nomes.principal}</strong>
                  {nomes.apoio && <small className="ptd-ranking-nome-completo">{nomes.apoio}</small>}
                </span>
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
            )
          })}
        </ol>
      )}
    </section>
  )
}
