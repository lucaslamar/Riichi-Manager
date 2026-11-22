import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Fechamento } from '../../logica/saidaDaPartida'
import '../clube.css'
import '@/dominios/torneio/interface/torneio.css'

/** A barra da Lista, no registro: resumo à esquerda, ícones à direita e Registrar embaixo. */
export default function RodapeRegistro({
  soma,
  total,
  fechamento,
  podeRegistrar,
  aoRegistrar,
  limpar,
  configurar,
  salvar,
}: {
  soma: number
  total: number
  fechamento: Fechamento
  podeRegistrar: boolean
  aoRegistrar: () => void
  /** O disquete. Ausente: a tela não salva para continuar (torneio e MCR). */
  salvar?: { pode: boolean; aoTocar: () => void }
  limpar: { pode: boolean; aoTocar: () => void }
  /** Ausente: regras travadas (torneio e MCR). */
  configurar?: () => void
}) {
  const { t, numero } = useI18n()
  const { fecha, porSaida, depositosNaMesa } = fechamento

  const status = porSaida
    ? t('match.leftGame.sumFree')
    : depositosNaMesa > 0
      ? t('tournament.points.depositsLeft', { count: depositosNaMesa })
      : fecha
        ? t('tournament.points.sumOk')
        : t(soma < total ? 'tournament.points.sumShort' : 'tournament.points.sumOver', {
            points: numero(Math.abs(total - soma)),
          })

  return (
    <div className="ptd-rodape-fixo clb-rodape trn-rodape fin-rodape">
      <div className="trn-rodape-topo">
        <p className="clb-contagem" role="status">
          <span className="clb-contadores" aria-hidden="true">
            <span>
              <i className="fas fa-coins" />
              <strong>{numero(soma)}</strong>
            </span>
            <span className="clb-barra" />
            <span>{numero(total)}</span>
          </span>
          <span className="sr-only">
            {t('tournament.points.sum', { sum: numero(soma), total: numero(total) })}.{' '}
          </span>
          <span className={fecha ? 'trn-status--ok' : 'clb-falta'}>
            {status}
            {fecha && <i className="fas fa-check fin-rodape-ok" aria-hidden="true" />}
          </span>
        </p>
          {/* A ordem da Lista: lixeira, configs e a ação da tela. */}
          <span className="trn-rodape-icones">
            <button
              type="button"
              className="trn-adicionar-cadastro"
              aria-label={t('match.manual.clear')}
              title={t('match.manual.clear')}
              aria-haspopup="dialog"
              disabled={!limpar.pode}
              onClick={limpar.aoTocar}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
            {configurar && (
              <button
                type="button"
                className="trn-adicionar-cadastro"
                aria-label={t('match.manual.editRules')}
                title={t('match.manual.editRules')}
                aria-haspopup="dialog"
                onClick={configurar}
              >
                <i className="fas fa-sliders" aria-hidden="true" />
              </button>
            )}
            {salvar && (
              <button
                type="button"
                className="trn-adicionar-cadastro"
                aria-label={t('match.paused.save')}
                title={t('match.paused.save')}
                aria-haspopup="dialog"
                disabled={!salvar.pode}
                onClick={salvar.aoTocar}
              >
                <i className="fas fa-floppy-disk" aria-hidden="true" />
              </button>
            )}
          </span>
      </div>
      <button
        type="button"
        className="btn-primario ptd-btn-largo"
        disabled={!podeRegistrar}
        onClick={aoRegistrar}
      >
        <i className="fas fa-clipboard-check" aria-hidden="true" /> {t('match.manual.save')}
      </button>
    </div>
  )
}
