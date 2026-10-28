import { useMemo } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import type { AbaModal } from '@/compartilhado/interface/componentes/modal/AbasModal'
import { buscarNoGlossario, correspondeBusca } from '../../../logica/glossario'
import BlocoGlossario from '../glossario/BlocoGlossario'
import CartaoYaku from './CartaoYaku'
import './busca-guia.css'

/** Campo de busca do Guia de bolso, preso logo abaixo das abas. */
export function CampoBuscaGuia({
  valor,
  aoMudar,
}: {
  valor: string
  aoMudar: (valor: string) => void
}) {
  const { t } = useI18n()
  return (
    <CampoBusca
      valor={valor}
      aoMudar={aoMudar}
      rotulo={t('pocketGuide.search.label')}
      placeholder={t('pocketGuide.search.placeholder')}
      rotuloLimpar={t('pocketGuide.search.clear')}
    />
  )
}

/**
 * Resultado da busca, no lugar do conteúdo da aba: as abas do Guia pelo nome,
 * os verbetes do glossário (dentro do bloco do assunto) e os cartões de yaku.
 */
export function ResultadoBuscaGuia<Chave extends string>({
  busca,
  abas,
  aoAbrirAba,
}: {
  busca: string
  abas: AbaModal<Chave>[]
  aoAbrirAba: (chave: Chave) => void
}) {
  const { t, idioma } = useI18n()
  const { secoes, yakus } = useMemo(() => buscarNoGlossario(busca, idioma), [busca, idioma])
  const abasEncontradas = abas.filter((aba) => correspondeBusca(busca, [aba.rotulo], idioma))
  const nadaEncontrado = abasEncontradas.length === 0 && secoes.length === 0 && yakus.length === 0

  return (
    <div aria-live="polite">
      {nadaEncontrado && (
        <p className="busca-guia__vazio">
          {t('pocketGuide.search.nothingFound', { busca: busca.trim() })}
        </p>
      )}
      {abasEncontradas.length > 0 && (
        <section className="glossario-bloco glossario-bloco--cartao busca-guia__abas">
          <h3 className="glossario-bloco__titulo">{t('pocketGuide.search.tabsHeading')}</h3>
          {abasEncontradas.map((aba) => (
            <button key={aba.chave} type="button" onClick={() => aoAbrirAba(aba.chave)}>
              {aba.rotulo}
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          ))}
        </section>
      )}
      {secoes.map((secao) => (
        <BlocoGlossario key={secao.id} secao={secao} />
      ))}
      {yakus.length > 0 && (
        <section className="busca-guia__yakus">
          <h3 className="yaku-grupo__titulo">{t('pocketGuide.yaku')}</h3>
          <div className="yaku-lista">
            {yakus.map((yaku) => (
              <CartaoYaku key={yaku.id} yaku={yaku} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
