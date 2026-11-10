import { useState, type KeyboardEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { posicoesDoRanking, semExcluidos } from '../../logica/ranking'
import { FILTROS_PADRAO, filtrosAtivos } from '../../logica/filtrosRanking'
import { useRankingGeral } from '../hooks/useRankingGeral'
import ModalFiltrosRanking from '../componentes/ModalFiltrosRanking'
import BlocoConfrontos from '../componentes/BlocoConfrontos'
import { nomesNoRanking } from '../componentes/nomesNoRanking'
import '../componentes/ranking-filtros.css'
import FerramentasDev from '../componentes/FerramentasDev'
import ModalBackup from '../componentes/ModalBackup'
import type { DuracaoRanking, PeriodoRanking } from '../../logica/filtrosRanking'

/** Ordem dos atalhos em ícone (o período personalizado fica só no modal). */
const PERIODOS_RAPIDOS: readonly PeriodoRanking[] = ['tudo', 'mes', 'ano']
const DURACOES_RAPIDAS: readonly DuracaoRanking[] = ['todas', 'hanchan', 'leste']
/** Próxima opção da lista, voltando ao começo (de fora da lista, a primeira). */
const proximo = <T,>(opcoes: readonly T[], atual: T) => opcoes[(opcoes.indexOf(atual) + 1) % opcoes.length]

/**
 * Ranking geral: soma das partidas finalizadas. Na aba Ranking é a raiz (sem
 * voltar), com o cadastro de jogadores e a engrenagem no cabeçalho.
 */
export default function PaginaRanking({
  aoVoltar,
  aoAbrirJogadores,
  aoAbrirJogador,
  aoRegistrarPartida,
}: {
  aoVoltar?: () => void
  aoAbrirJogadores?: () => void
  /** Toque no card: abre a tela do jogador com o mapa e os gráficos. */
  aoAbrirJogador?: (id: string) => void
  /** Atalho para Registrar partida finalizada (a mesma tela da Partida). */
  aoRegistrarPartida?: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { filtros, setFiltros, linhas: todas, confrontos } = useRankingGeral()
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [backupAberto, setBackupAberto] = useState(false)
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
        return filtros.periodo === 'personalizado'
          ? [filtros.inicio, filtros.fim].filter(Boolean).join(' – ') || t('match.ranking.periods.personalizado')
          : t(`match.ranking.periods.${filtros.periodo}`)
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
            {!aoVoltar && <BotaoConfiguracoes />}
          </>
        }
      />

      {/* Filtros discretos: o botão e os chips do que está ativo, numa linha só. */}
      <div className="rkf-barra">
        <button
          type="button"
          className={`rkf-icone${ativos.length > 0 ? ' rkf-icone--ativo' : ''}`}
          aria-label={t('match.ranking.filters.title')}
          title={t('match.ranking.filters.title')}
          aria-haspopup="dialog"
          onClick={() => setFiltrosAbertos(true)}
        >
          <i className="fas fa-filter" aria-hidden="true" />
          {ativos.length > 0 && <span className="rkf-contagem">{numero(ativos.length)}</span>}
        </button>
        {/* Atalhos: cada toque passa para a próxima opção; o chip ao lado mostra qual ficou. */}
        <button
          type="button"
          className={`rkf-icone${filtros.periodo !== 'tudo' ? ' rkf-icone--ativo' : ''}`}
          aria-label={`${t('match.ranking.period')}: ${t(`match.ranking.periods.${filtros.periodo}`)}`}
          title={`${t('match.ranking.period')}: ${t(`match.ranking.periods.${filtros.periodo}`)}`}
          onClick={() => setFiltros({ ...filtros, periodo: proximo(PERIODOS_RAPIDOS, filtros.periodo) })}
        >
          <i className="fas fa-calendar-days" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`rkf-icone${filtros.duracao !== 'todas' ? ' rkf-icone--ativo' : ''}`}
          aria-label={`${t('match.ranking.filters.duration')}: ${t(`match.ranking.filters.durations.${filtros.duracao}`)}`}
          title={`${t('match.ranking.filters.duration')}: ${t(`match.ranking.filters.durations.${filtros.duracao}`)}`}
          onClick={() => setFiltros({ ...filtros, duracao: proximo(DURACOES_RAPIDAS, filtros.duracao) })}
        >
          <i className="fas fa-stopwatch" aria-hidden="true" />
        </button>
        {/* Ações da lista, depois dos filtros: cadastro de jogadores e importar/exportar. */}
        <span className="rkf-separador" aria-hidden="true" />
        {aoRegistrarPartida && (
          <button
            type="button"
            className="rkf-icone"
            aria-label={t('match.manual.title')}
            title={t('match.manual.title')}
            onClick={aoRegistrarPartida}
          >
            <i className="fas fa-clipboard-check" aria-hidden="true" />
          </button>
        )}
        {aoAbrirJogadores && (
          <button
            type="button"
            className="rkf-icone"
            aria-label={t('players.title')}
            title={t('players.title')}
            onClick={aoAbrirJogadores}
          >
            <i className="fas fa-user-plus" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="rkf-icone"
          aria-label={t('backup.title')}
          title={t('backup.title')}
          aria-haspopup="dialog"
          onClick={() => setBackupAberto(true)}
        >
          <i className="fas fa-file-export" aria-hidden="true" />
        </button>
      </div>
      {/* Filtros ativos numa linha própria, abaixo dos ícones, para não disputar com eles. */}
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
          {ativos.length > 1 && (
            <button type="button" className="rkf-limpar" onClick={() => setFiltros(FILTROS_PADRAO)}>
              {t('match.ranking.filters.clear')}
            </button>
          )}
        </div>
      )}

      {filtros.jogadorId && confrontos && (
        <BlocoConfrontos
          jogadorId={filtros.jogadorId}
          confrontos={confrontos}
          aoEscolher={(jogadorId) => setFiltros({ ...filtros, jogadorId })}
          aoAnalisar={aoAbrirJogador}
        />
      )}

      {linhas.length === 0 ? (
        <p className="ptd-vazio">{t('match.ranking.empty')}</p>
      ) : (
        <ol className="ptd-ranking">
          {linhas.map((linha, indice) => {
            const nomes = nomesDe(linha.jogadorId)
            return (
            <li
              key={linha.jogadorId}
              className={`ptd-linha-ranking${aoAbrirJogador ? ' ptd-linha-ranking--toque' : ''}`}
              {...(aoAbrirJogador
                ? {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': t('match.player.open', { name: nomes.principal }),
                    onClick: () => aoAbrirJogador(linha.jogadorId),
                    onKeyDown: (evento: KeyboardEvent) => {
                      if (evento.key === 'Enter' || evento.key === ' ') {
                        evento.preventDefault()
                        aoAbrirJogador(linha.jogadorId)
                      }
                    },
                  }
                : {})}
            >
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
      {import.meta.env.DEV && <FerramentasDev />}

      {backupAberto && <ModalBackup aoFechar={() => setBackupAberto(false)} />}

      {filtrosAbertos && (
        <ModalFiltrosRanking filtros={filtros} aoAplicar={setFiltros} aoFechar={() => setFiltrosAbertos(false)} />
      )}
    </section>
  )
}
