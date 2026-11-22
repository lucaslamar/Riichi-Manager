import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { RegrasDoModo } from '@/compartilhado/modo-jogo/regrasDoModo'
import Segmentos from '@/dominios/centerpiece/interface/componentes/Segmentos'
import {
  FILTROS_PADRAO_TORNEIO,
  type FiltrosRankingTorneio,
  type VisaoRanking,
} from '../../logica/filtrosRankingTorneio'

const VISOES: readonly VisaoRanking[] = ['classificacao', 'disputa']
const TODAS = 0

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Filtros do Ranking do torneio. Só valem depois de Aplicar. */
export default function ModalFiltrosRankingTorneio({
  filtros,
  regras,
  jogadorIds,
  rodadas,
  nome,
  aoAplicar,
  aoFechar,
}: {
  filtros: FiltrosRankingTorneio
  regras: RegrasDoModo
  jogadorIds: readonly string[]
  /** Rodadas com resultado. */
  rodadas: readonly number[]
  nome: (jogadorId: string) => string
  aoAplicar: (filtros: FiltrosRankingTorneio) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [rascunho, setRascunho] = useState(filtros)
  const [busca, setBusca] = useState('')
  const mudar = (parcial: Partial<FiltrosRankingTorneio>) => setRascunho((atual) => ({ ...atual, ...parcial }))

  const termo = normalizar(busca.trim())
  const sugestoes = termo ? jogadorIds.filter((id) => normalizar(nome(id)).includes(termo)).slice(0, 6) : []
  const unidades: FiltrosRankingTorneio['unidade'][] = ['pontos', ...regras.unidadesDistancia.map((item) => item.id)]

  return (
    <Modal
      titulo={t('tournament.rankingFilters.open')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      className="rkf-modal"
      rodape={
        <div className="cfg-acoes rkf-acoes">
          <button type="button" className="btn-contorno" onClick={() => setRascunho(FILTROS_PADRAO_TORNEIO)}>
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
        <Segmentos
          rotulo={t('tournament.rankingFilters.view')}
          opcoes={VISOES}
          valor={rascunho.visao}
          aoMudar={(visao) => mudar({ visao })}
          texto={(opcao) =>
            opcao === 'disputa' ? t('tournament.podiumGap.race') : t('tournament.rankingFilters.viewTable')
          }
        />

        <fieldset className="rkf-grupo">
          <legend className="rkf-titulo">{t('tournament.rankingFilters.follow')}</legend>
          {rascunho.acompanharId ? (
            <div className="rkf-escolhido trn-acompanhado">
              <strong>{nome(rascunho.acompanharId)}</strong>
              <button
                type="button"
                className="rkf-remover"
                aria-label={t('tournament.rankingFilters.unfollow')}
                onClick={() => mudar({ acompanharId: null })}
              >
                <i className="fas fa-xmark" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <CampoBusca
                valor={busca}
                aoMudar={setBusca}
                rotulo={t('tournament.rankingFilters.follow')}
                placeholder={t('match.ranking.filters.playerSearch')}
                rotuloLimpar={t('actions.clear')}
              />
              {sugestoes.length > 0 && (
                <ul className="rkf-sugestoes">
                  {sugestoes.map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          mudar({ acompanharId: id })
                          setBusca('')
                        }}
                      >
                        <strong>{nome(id)}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </fieldset>

        {rodadas.length > 1 && (
          <Segmentos
            rotulo={t('tournament.rankingFilters.untilRound')}
            opcoes={[TODAS, ...rodadas]}
            valor={rascunho.ateRodada ?? TODAS}
            aoMudar={(rodada) => mudar({ ateRodada: rodada === TODAS ? null : rodada })}
            texto={(opcao) => (opcao === TODAS ? t('tournament.rankingFilters.allRounds') : String(opcao))}
          />
        )}

        <Segmentos
          rotulo={t('tournament.rankingFilters.unit')}
          opcoes={unidades}
          valor={rascunho.unidade}
          aoMudar={(unidade) => mudar({ unidade })}
          texto={(opcao) => (opcao === 'pontos' ? t(regras.rotuloPontos) : t(`tournament.podiumGap.units.${opcao}`))}
        />
      </div>
    </Modal>
  )
}
