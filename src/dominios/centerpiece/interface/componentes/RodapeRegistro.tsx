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
  salvar,
  salvas,
}: {
  soma: number
  total: number
  fechamento: Fechamento
  podeRegistrar: boolean
  aoRegistrar: () => void
  /** O disquete. Ausente: a tela não salva para continuar (torneio e MCR). */
  salvar?: { pode: boolean; aoTocar: () => void }
  /** A ampulheta das partidas em andamento. */
  salvas?: { quantas: number; aoTocar: () => void }
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
  const rotuloSalvas = salvas ? t('match.paused.listCount', { count: salvas.quantas }) : ''

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
        {(salvar || salvas) && (
          <span className="trn-rodape-icones">
            {salvas && (
              <button
                type="button"
                className="trn-adicionar-cadastro fin-rodape-salvas"
                aria-label={rotuloSalvas}
                title={rotuloSalvas}
                onClick={salvas.aoTocar}
              >
                <i className="fas fa-hourglass-half" aria-hidden="true" />
                <span className="rkf-contagem" aria-hidden="true">
                  {numero(salvas.quantas)}
                </span>
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
        )}
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
