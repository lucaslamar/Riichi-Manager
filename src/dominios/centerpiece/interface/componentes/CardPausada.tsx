import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CHAVE_VENTO, KANJI_VENTO } from '../../logica/partida'
import type { PartidaPausada } from '../../logica/partidaPausada'
import { useTextoAndamento } from '../hooks/useTextoAndamento'

/** Uma partida salva para continuar, com retomar e descartar. */
export default function CardPausada({
  pausada,
  nomeDe,
  aoRetomar,
  aoDescartar,
}: {
  pausada: PartidaPausada
  nomeDe: (cadeira: number) => string
  aoRetomar: () => void
  aoDescartar: () => void
}) {
  const { t, numero, idioma } = useI18n()
  const textoAndamento = useTextoAndamento()
  const titulo = textoAndamento(pausada)
  const salvaEm = new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(pausada.salvaEm),
  )

  return (
    <article className="cm-card fin-pausada" aria-label={titulo}>
      <header className="cm-topo">
        <div className="cm-titulo">
          <strong>{titulo}</strong>
          <span className="cm-hora">
            {t('match.paused.dealerIs', { name: nomeDe(pausada.cadeiraDealer) })} ·{' '}
            <time dateTime={pausada.salvaEm}>{salvaEm}</time>
          </span>
        </div>
      </header>
      <ul className="cm-grade">
        {pausada.assentos.map(({ cadeira, vento, pontos, saiu }) => (
          <li
            key={cadeira}
            className={`cm-celula${cadeira === pausada.cadeiraDealer ? ' cm-celula--destaque' : ''}`}
          >
            {pausada.ordemDosVentos ? (
              <span className="cm-posicao">
                <span aria-hidden="true">{KANJI_VENTO[vento]}</span>
                <span className="sr-only">{t(CHAVE_VENTO[vento])}</span>
              </span>
            ) : (
              <span className="cm-posicao">{cadeira + 1}</span>
            )}
            <span className="cm-nome">
              <span className="cm-nome-texto">{nomeDe(cadeira)}</span>
              {saiu && <span className="cm-selo">{t('match.leftGame.tag')}</span>}
            </span>
            <span className={`cm-pontos${(pontos ?? 0) < 0 ? ' cm-negativo' : ''}`}>
              {pontos === null ? '–' : numero(pontos)}
            </span>
          </li>
        ))}
      </ul>
      <div className="fin-pausada-acoes">
        <button type="button" className="btn-contorno" onClick={aoDescartar}>
          {t('match.home.discard')}
        </button>
        <button type="button" className="btn-primario" onClick={aoRetomar}>
          {t('match.paused.resume')}
        </button>
      </div>
    </article>
  )
}
