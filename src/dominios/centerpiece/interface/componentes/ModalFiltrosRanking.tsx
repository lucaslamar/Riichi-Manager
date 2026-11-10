import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomesNoRanking } from './nomesNoRanking'
import {
  FILTROS_PADRAO,
  type DuracaoRanking,
  type FiltrosRankingGeral,
  type OrdemRanking,
  type OrigemRanking,
  type PeriodoRanking,
} from '../../logica/filtrosRanking'
import './ranking-filtros.css'

const PERIODOS: readonly PeriodoRanking[] = ['mes', 'ano', 'tudo', 'personalizado']
const DURACOES: readonly DuracaoRanking[] = ['todas', 'hanchan', 'leste']
const ORIGENS: readonly OrigemRanking[] = ['todas', 'app', 'fora']
const MINIMOS: readonly FiltrosRankingGeral['minimoPartidas'][] = [0, 3, 5, 10]
const ORDENS: readonly OrdemRanking[] = ['pontuacao', 'media', 'primeiro', 'partidas']

/** Normaliza para buscar sem acento nem maiúscula. */
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Grupo de opções em segmentos, como os atalhos de período da tela. */
function Segmentos<T extends string | number>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  texto,
}: {
  rotulo: string
  opcoes: readonly T[]
  valor: T
  aoMudar: (valor: T) => void
  texto: (opcao: T) => string
}) {
  return (
    <fieldset className="rkf-grupo">
      <legend className="rkf-titulo">{rotulo}</legend>
      <div className="ptd-segmentos rkf-segmentos">
        {opcoes.map((opcao) => (
          <button
            key={opcao}
            type="button"
            className={`ptd-segmento${valor === opcao ? ' ptd-segmento--ativo' : ''}`}
            aria-pressed={valor === opcao}
            onClick={() => aoMudar(opcao)}
          >
            {texto(opcao)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** Bottom sheet com todos os filtros. Só vale depois de Aplicar. */
export default function ModalFiltrosRanking({
  filtros,
  aoAplicar,
  aoFechar,
}: {
  filtros: FiltrosRankingGeral
  aoAplicar: (filtros: FiltrosRankingGeral) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { jogadores } = useJogadores()
  const [rascunho, setRascunho] = useState(filtros)
  const [busca, setBusca] = useState('')
  const mudar = (parcial: Partial<FiltrosRankingGeral>) => setRascunho((atual) => ({ ...atual, ...parcial }))

  const escolhido = jogadores.find((jogador) => jogador.id === rascunho.jogadorId)
  const termo = normalizar(busca.trim())
  const sugestoes = termo
    ? jogadores
        .filter((jogador) => !jogador.arquivado)
        .filter((jogador) => normalizar(`${jogador.nome} ${jogador.apelido ?? ''}`).includes(termo))
        .slice(0, 6)
    : []

  return (
    <Modal
      titulo={t('match.ranking.filters.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      className="rkf-modal"
      rodape={
        <div className="cfg-acoes rkf-acoes">
          <button type="button" className="btn-contorno" onClick={() => setRascunho(FILTROS_PADRAO)}>
            {t('match.ranking.filters.clear')}
          </button>
          <button
            type="button"
            className="btn-primario"
            onClick={() => {
              aoAplicar(rascunho)
              aoFechar()
            }}
          >
            {t('match.ranking.filters.apply')}
          </button>
        </div>
      }
    >
      <div className="rkf-corpo">
        <fieldset className="rkf-grupo">
          <legend className="rkf-titulo">{t('match.ranking.filters.player')}</legend>
          {escolhido ? (
            <div className="rkf-escolhido">
              <span className="ptd-ranking-nomes">
                <strong>{nomesNoRanking(escolhido).principal}</strong>
                {nomesNoRanking(escolhido).apoio && (
                  <small className="ptd-ranking-nome-completo">{nomesNoRanking(escolhido).apoio}</small>
                )}
              </span>
              <button
                type="button"
                className="rkf-remover"
                aria-label={t('match.ranking.filters.removePlayer')}
                onClick={() => mudar({ jogadorId: undefined })}
              >
                <i className="fas fa-xmark" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <CampoBusca
                valor={busca}
                aoMudar={setBusca}
                rotulo={t('match.ranking.filters.player')}
                placeholder={t('match.ranking.filters.playerSearch')}
                rotuloLimpar={t('actions.clear')}
              />
              {sugestoes.length > 0 && (
                <ul className="rkf-sugestoes">
                  {sugestoes.map((jogador) => {
                    const nomes = nomesNoRanking(jogador)
                    return (
                      <li key={jogador.id}>
                        <button
                          type="button"
                          onClick={() => {
                            mudar({ jogadorId: jogador.id })
                            setBusca('')
                          }}
                        >
                          <strong>{nomes.principal}</strong>
                          {nomes.apoio && <small>{nomes.apoio}</small>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </fieldset>

        <Segmentos
          rotulo={t('match.ranking.period')}
          opcoes={PERIODOS}
          valor={rascunho.periodo}
          aoMudar={(periodo) => mudar({ periodo })}
          texto={(opcao) => t(`match.ranking.periods.${opcao}`)}
        />
        {rascunho.periodo === 'personalizado' && (
          <div className="rkf-datas">
            <label>
              <span>{t('match.ranking.filters.from')}</span>
              <input
                type="date"
                value={rascunho.inicio ?? ''}
                max={rascunho.fim}
                onChange={(evento) => mudar({ inicio: evento.target.value || undefined })}
              />
            </label>
            <label>
              <span>{t('match.ranking.filters.to')}</span>
              <input
                type="date"
                value={rascunho.fim ?? ''}
                min={rascunho.inicio}
                onChange={(evento) => mudar({ fim: evento.target.value || undefined })}
              />
            </label>
          </div>
        )}

        <Segmentos
          rotulo={t('match.ranking.filters.duration')}
          opcoes={DURACOES}
          valor={rascunho.duracao}
          aoMudar={(duracao) => mudar({ duracao })}
          texto={(opcao) => t(`match.ranking.filters.durations.${opcao}`)}
        />
        <Segmentos
          rotulo={t('match.ranking.filters.origin')}
          opcoes={ORIGENS}
          valor={rascunho.origem}
          aoMudar={(origem) => mudar({ origem })}
          texto={(opcao) => t(`match.ranking.filters.origins.${opcao}`)}
        />
        <Segmentos
          rotulo={t('match.ranking.filters.minimum')}
          opcoes={MINIMOS}
          valor={rascunho.minimoPartidas}
          aoMudar={(minimoPartidas) => mudar({ minimoPartidas })}
          texto={(opcao) => (opcao === 0 ? t('match.ranking.filters.noMinimum') : String(opcao))}
        />
        <Segmentos
          rotulo={t('match.ranking.filters.sort')}
          opcoes={ORDENS}
          valor={rascunho.ordenarPor}
          aoMudar={(ordenarPor) => mudar({ ordenarPor })}
          texto={(opcao) => t(`match.ranking.filters.sorts.${opcao}`)}
        />
      </div>
    </Modal>
  )
}
