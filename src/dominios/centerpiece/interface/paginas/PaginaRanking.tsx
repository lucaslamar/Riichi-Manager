import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { posicoesDoRanking, semExcluidos } from '../../logica/ranking'
import { FILTROS_PADRAO, filtrosAtivos, type PeriodoRanking } from '../../logica/filtrosRanking'
import { useRankingGeral } from '../hooks/useRankingGeral'
import ModalFiltrosRanking from '../componentes/ModalFiltrosRanking'
import BlocoConfrontos from '../componentes/BlocoConfrontos'
import { nomesNoRanking } from '../componentes/nomesNoRanking'
import '../componentes/ranking-filtros.css'

/** Atalhos de período no topo; o personalizado fica só no modal. */
const PERIODOS: readonly PeriodoRanking[] = ['mes', 'ano', 'tudo']

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
  const { filtros, setFiltros, linhas: todas, confrontos } = useRankingGeral()
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const ativos = filtrosAtivos(filtros)
  const linhas = semExcluidos(todas, (id) => jogadores.some((jogador) => jogador.id === id))
  const posicoes = posicoesDoRanking(linhas)

  const nomesDe = (id: string) => nomesNoRanking(jogadores.find((item) => item.id === id))
  /** Texto curto de cada filtro ativo, para o chip removível. */
  const textoDoChip = (ativo: (typeof ativos)[number]) => {
    switch (ativo) {
      case 'jogador':
        return nomesDe(filtros.jogadorId ?? '').principal
      case 'periodo':
        return t('match.ranking.periods.personalizado')
      case 'duracao':
        return t(`match.ranking.filters.durations.${filtros.duracao}`)
      case 'origem':
        return t(`match.ranking.filters.origins.${filtros.origem}`)
      case 'minimo':
        return t('match.ranking.filters.minimumChip', { count: filtros.minimoPartidas })
      case 'ordem':
        return t(`match.ranking.filters.sorts.${filtros.ordenarPor}`)
    }
  }
  const semFiltro = (ativo: (typeof ativos)[number]) => {
    switch (ativo) {
      case 'jogador':
        return { ...filtros, jogadorId: undefined }
      case 'periodo':
        return { ...filtros, periodo: FILTROS_PADRAO.periodo, inicio: undefined, fim: undefined }
      case 'duracao':
        return { ...filtros, duracao: FILTROS_PADRAO.duracao }
      case 'origem':
        return { ...filtros, origem: FILTROS_PADRAO.origem }
      case 'minimo':
        return { ...filtros, minimoPartidas: FILTROS_PADRAO.minimoPartidas }
      case 'ordem':
        return { ...filtros, ordenarPor: FILTROS_PADRAO.ordenarPor }
    }
  }
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

  return (
    <section className="ptd-inicio">
      <TituloTela
        titulo={aoVoltar ? t('match.home.ranking') : t('menu.ranking')}
        aoVoltar={aoVoltar}
        acoes={
          <>
            <button
              type="button"
              className="botao-voltar-tela botao-acao-tela rkf-botao-filtro"
              aria-label={t('match.ranking.filters.title')}
              title={t('match.ranking.filters.title')}
              aria-haspopup="dialog"
              onClick={() => setFiltrosAbertos(true)}
            >
              <i className="fas fa-filter" aria-hidden="true" />
              {ativos.length > 0 && <span className="rkf-ponto" aria-hidden="true" />}
            </button>
            {aoAbrirJogadores && (
              <button
                type="button"
                className="botao-voltar-tela botao-acao-tela"
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
              className={`ptd-segmento${filtros.periodo === opcao ? ' ptd-segmento--ativo' : ''}`}
              aria-pressed={filtros.periodo === opcao}
              onClick={() => setFiltros({ ...filtros, periodo: opcao })}
            >
              {t(`match.ranking.periods.${opcao}`)}
            </button>
          ))}
        </div>
        {ativos.length > 0 && (
          <div className="rkf-chips">
            {ativos.map((ativo) => (
              <button
                key={ativo}
                type="button"
                className="rkf-chip"
                aria-label={t('match.ranking.filters.remove', { filter: textoDoChip(ativo) })}
                onClick={() => setFiltros(semFiltro(ativo))}
              >
                {textoDoChip(ativo)}
                <i className="fas fa-xmark" aria-hidden="true" />
              </button>
            ))}
            <button type="button" className="rkf-limpar" onClick={() => setFiltros(FILTROS_PADRAO)}>
              {t('match.ranking.filters.clear')}
            </button>
          </div>
        )}
      </div>

      {filtros.jogadorId && confrontos && (
        <BlocoConfrontos
          jogadorId={filtros.jogadorId}
          confrontos={confrontos}
          aoEscolher={(jogadorId) => setFiltros({ ...filtros, jogadorId })}
        />
      )}

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
      {filtrosAbertos && (
        <ModalFiltrosRanking filtros={filtros} aoAplicar={setFiltros} aoFechar={() => setFiltrosAbertos(false)} />
      )}
    </section>
  )
}
