import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  FILTROS_LISTA_PADRAO,
  filtrosListaAtivos,
  ORDENS_LISTA,
  PERIODOS_LISTA,
  type FiltrosLista,
} from '../../logica/filtrosAndamento'
import './ranking-filtros.css'

/**
 * Barra de busca com o botão de filtros, como no Ranking. A folha só muda a
 * lista depois de Aplicar.
 */
export default function BuscaFiltrosLista({
  busca,
  aoBuscar,
  filtros,
  aoFiltrar,
  placeholder,
  formatos,
}: {
  busca: string
  aoBuscar: (busca: string) => void
  filtros: FiltrosLista
  aoFiltrar: (filtros: FiltrosLista) => void
  /** Texto do campo, quando a lista busca outra coisa. */
  placeholder?: string
  /** Histórico de torneios: os formatos, com 'todos' primeiro. */
  formatos?: readonly { valor: string; rotulo: string }[]
}) {
  const { t, numero } = useI18n()
  const [aberta, setAberta] = useState(false)
  const ativos = filtrosListaAtivos(filtros)

  return (
    <div className="lsf-barra">
      <CampoBusca
        valor={busca}
        aoMudar={aoBuscar}
        rotulo={t('match.listFilters.search')}
        placeholder={placeholder ?? t('match.listFilters.searchPlaceholder')}
        rotuloLimpar={t('actions.clear')}
        className="lsf-busca"
      />
      <button
        type="button"
        className={`rkf-icone${ativos > 0 ? ' rkf-icone--ativo' : ''}`}
        aria-label={t('match.ranking.filters.title')}
        title={t('match.ranking.filters.title')}
        aria-haspopup="dialog"
        onClick={() => setAberta(true)}
      >
        <i className="fas fa-filter" aria-hidden="true" />
        {ativos > 0 && <span className="rkf-contagem">{numero(ativos)}</span>}
      </button>
      {aberta && (
        <FolhaFiltros
          filtros={filtros}
          formatos={formatos}
          aoFechar={() => setAberta(false)}
          aoAplicar={(novos) => {
            aoFiltrar(novos)
            setAberta(false)
          }}
        />
      )}
    </div>
  )
}

function FolhaFiltros({
  filtros,
  formatos,
  aoFechar,
  aoAplicar,
}: {
  filtros: FiltrosLista
  formatos?: readonly { valor: string; rotulo: string }[]
  aoFechar: () => void
  aoAplicar: (filtros: FiltrosLista) => void
}) {
  const { t } = useI18n()
  const [rascunho, setRascunho] = useState(filtros)

  const grupo = <T extends string>(
    rotulo: string,
    opcoes: readonly T[],
    valor: T,
    texto: (opcao: T) => string,
    aoMudar: (opcao: T) => void,
  ) => (
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

  return (
    <Modal
      titulo={t('match.ranking.filters.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <div className="ptd-acoes-folha">
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setRascunho(FILTROS_LISTA_PADRAO)}
          >
            {t('match.ranking.filters.clear')}
          </button>
          <button type="button" className="btn-primario" onClick={() => aoAplicar(rascunho)}>
            {t('match.ranking.filters.apply')}
          </button>
        </div>
      }
    >
      <div className="rkf-corpo">
        {formatos &&
          grupo(
            t('tournament.history.format'),
            formatos.map((formato) => formato.valor),
            rascunho.formato ?? 'todos',
            (opcao) => formatos.find((formato) => formato.valor === opcao)?.rotulo ?? opcao,
            (formato) => setRascunho({ ...rascunho, formato }),
          )}
        {grupo(
          t('match.ranking.period'),
          PERIODOS_LISTA,
          rascunho.periodo,
          (opcao) => t(`match.listFilters.periods.${opcao}`),
          (periodo) => setRascunho({ ...rascunho, periodo }),
        )}
        {grupo(
          t('match.listFilters.order'),
          ORDENS_LISTA,
          rascunho.ordem,
          (opcao) => t(`match.listFilters.orders.${opcao}`),
          (ordem) => setRascunho({ ...rascunho, ordem }),
        )}
      </div>
    </Modal>
  )
}
