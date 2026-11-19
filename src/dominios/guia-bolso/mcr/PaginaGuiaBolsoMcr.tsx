import { useId, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import {
  buscarFansMcr,
  CATEGORIAS_FAN_MCR,
  FANS_MCR,
  PATAMARES_FAN_MCR,
  YAKUS_SEM_EQUIVALENTE_MCR,
  type CategoriaFanMcr,
  type PontosFanMcr,
} from '@/compartilhado/mahjong/mcr/fans-mcr'
import CartaoFanMcr, { idCartaoFan } from './CartaoFanMcr'
import CreditosCmc from './CreditosCmc'
import './guia-bolso-mcr.css'

const CATEGORIAS = Object.entries(CATEGORIAS_FAN_MCR) as [CategoriaFanMcr, string][]

/** Guia de Bolso do modo Chinês: os 81 fan do guia do CMC, por patamar de pontos. */
export default function PaginaGuiaBolsoMcr() {
  const { t, numero } = useI18n()
  const [busca, setBusca] = useState('')
  const [pontos, setPontos] = useState<PontosFanMcr | null>(null)
  const [categoria, setCategoria] = useState<CategoriaFanMcr | null>(null)
  const idBusca = useId()
  const idPontos = useId()
  const idCategoria = useId()

  const fans = buscarFansMcr(FANS_MCR, busca).filter(
    (fan) =>
      (pontos === null || fan.pontos === pontos) &&
      (categoria === null || fan.categoria === categoria),
  )
  const grupos = PATAMARES_FAN_MCR.map((patamar) => ({
    patamar,
    fans: fans.filter((fan) => fan.pontos === patamar),
  })).filter((grupo) => grupo.fans.length > 0)

  // Ir para um fan citado: limpa a busca e os filtros para ele aparecer e leva o foco até ele.
  const irPara = (id: number) => {
    setBusca('')
    setPontos(null)
    setCategoria(null)
    window.setTimeout(() => {
      const cartao = document.getElementById(idCartaoFan(id))
      cartao?.scrollIntoView({ block: 'start' })
      cartao?.focus({ preventScroll: true })
    })
  }

  return (
    <div className="guia-mcr">
      <TituloTela titulo={t('guiaBolso.mcr.titulo')} />

      <div className="guia-mcr__filtros">
        <label htmlFor={idBusca} className="guia-mcr__rotulo">
          {t('guiaBolso.mcr.rotuloBusca')}
        </label>
        <input
          id={idBusca}
          type="search"
          className="guia-mcr__busca"
          placeholder={t('guiaBolso.mcr.busca')}
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <div className="guia-mcr__selects">
          <div>
            <label htmlFor={idPontos} className="guia-mcr__rotulo">
              {t('guiaBolso.mcr.pontos')}
            </label>
            <select
              id={idPontos}
              value={pontos ?? ''}
              onChange={(evento) =>
                setPontos(
                  evento.target.value ? (Number(evento.target.value) as PontosFanMcr) : null,
                )
              }
            >
              <option value="">{t('guiaBolso.mcr.todosPontos')}</option>
              {PATAMARES_FAN_MCR.map((patamar) => (
                <option key={patamar} value={patamar}>
                  {t('guiaBolso.mcr.pontosFan', { pontos: numero(patamar) })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={idCategoria} className="guia-mcr__rotulo">
              {t('guiaBolso.mcr.categoria')}
            </label>
            <select
              id={idCategoria}
              value={categoria ?? ''}
              onChange={(evento) =>
                setCategoria((evento.target.value || null) as CategoriaFanMcr | null)
              }
            >
              <option value="">{t('guiaBolso.mcr.todasCategorias')}</option>
              {CATEGORIAS.map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="guia-mcr__contagem" aria-live="polite">
          {t('guiaBolso.mcr.encontrados', { count: fans.length })}
        </p>
      </div>

      {grupos.length === 0 && <p className="guia-mcr__vazio">{t('guiaBolso.mcr.nenhum')}</p>}
      {grupos.map(({ patamar, fans: doPatamar }) => (
        <section
          key={patamar}
          className="guia-mcr__patamar"
          aria-labelledby={`patamar-mcr-${patamar}`}
        >
          <h3 id={`patamar-mcr-${patamar}`} className="guia-mcr__patamar-titulo">
            {t('guiaBolso.mcr.pontosFan', { pontos: numero(patamar) })}
          </h3>
          {doPatamar.map((fan) => (
            <CartaoFanMcr key={fan.id} fan={fan} aoIrPara={irPara} />
          ))}
        </section>
      ))}

      <aside className="guia-mcr__sem-equivalente">
        <h3>{t('guiaBolso.mcr.semEquivalenteTitulo')}</h3>
        <p>
          {t('guiaBolso.mcr.semEquivalenteExato', {
            lista: YAKUS_SEM_EQUIVALENTE_MCR.semEquivalenteExato.join(', '),
          })}
        </p>
        <p>
          {t('guiaBolso.mcr.naoExistem', {
            lista: YAKUS_SEM_EQUIVALENTE_MCR.naoExistem.join(', '),
          })}
        </p>
      </aside>

      <CreditosCmc />
    </div>
  )
}
