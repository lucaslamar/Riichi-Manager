import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ContextoCenterpieceMao } from '@/dominios/centerpiece/logica/tipos-integracao'
import type { Mao } from '../../../logica/mao'

/** Avisa o que veio preenchido pela partida; as opções continuam editáveis logo abaixo. */
export function AvisoDadosPartida({
  contexto,
  mao,
}: {
  contexto: ContextoCenterpieceMao
  mao: Mao
}) {
  const { t } = useI18n()
  const [dispensado, setDispensado] = useState(false)
  const { dados } = contexto
  if (!dados) return null

  const tsumo = contexto.tipoVitoria === 'tsumo'
  const itens = [
    dados.riichi?.duplo ? t('match.fromMatch.doubleRiichi') : dados.riichi && 'Riichi',
    dados.riichi?.ippatsu && 'Ippatsu',
    dados.ultimaPedra && (tsumo ? 'Haitei' : 'Houtei'),
    dados.kan && (tsumo ? 'Rinshan' : 'Chankan'),
    dados.primeiraCompra && (contexto.vencedorEhLeste ? 'Tenhou' : 'Chiihou'),
    dados.descartes.length > 0 && t('match.fromMatch.discards', { count: dados.descartes.length }),
  ].filter((item): item is string => !!item)

  const maximoIndicadores = dados.kans + 1
  const indicadoresDemais = Math.max(mao.dora.length, mao.uradora.length) > maximoIndicadores

  // O excesso de indicadores avisa mesmo depois de dispensar: pode ter sido engano.
  if (!indicadoresDemais && (dispensado || (itens.length === 0 && dados.kans === 0))) return null

  return (
    <section className="aviso-dados-partida" role="status">
      {!dispensado && (
        <>
          <div className="aviso-dados-partida-topo">
            <strong>{t('match.fromMatch.title')}</strong>
            <button
              type="button"
              className="aviso-dados-partida-fechar"
              aria-label={t('actions.close')}
              onClick={() => setDispensado(true)}
            >
              <i className="fas fa-xmark" aria-hidden="true" />
            </button>
          </div>
          {itens.length > 0 && <p>{itens.join(' · ')}</p>}
          {dados.kans > 0 && !indicadoresDemais && (
            <p>{t('match.fromMatch.doraExpected', { kans: dados.kans, count: maximoIndicadores })}</p>
          )}
          <p className="aviso-dados-partida-ajuda">{t('match.fromMatch.help')}</p>
        </>
      )}
      {indicadoresDemais && (
        <p className="aviso-dados-partida-alerta">
          {t('match.fromMatch.doraOver', { kans: dados.kans, count: maximoIndicadores })}
        </p>
      )}
    </section>
  )
}
