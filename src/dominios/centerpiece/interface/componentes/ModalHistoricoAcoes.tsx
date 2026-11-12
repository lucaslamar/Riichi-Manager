import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { EntradaHistorico, TipoAcao } from '../../logica/historicoAcoes'
import { CHAVE_VENTO, type Cadeira } from '../../logica/partida'

interface Props {
  historico: EntradaHistorico[]
  nomeDe: (cadeira: Cadeira) => string
  aoFechar: () => void
}

const ICONE: Record<TipoAcao, string> = {
  ron: 'fa-hand-point-right',
  tsumo: 'fa-hand',
  riichi: 'fa-flag',
  ryukyoku: 'fa-equals',
  chombo: 'fa-triangle-exclamation',
  abortivo: 'fa-ban',
  legado: 'fa-clock-rotate-left',
  desfazer: 'fa-rotate-left',
  paarenchan: 'fa-crown',
}

/**
 * Linha do tempo da partida, da ação mais recente para a mais antiga: cada linha
 * diz a rodada, quem fez o quê e quantos pontos andaram. O que foi desfeito fica
 * riscado, e o próprio Desfazer também aparece.
 */
export default function ModalHistoricoAcoes({ historico, nomeDe, aoFechar }: Props) {
  const { t, numero } = useI18n()

  const pontos = (valor: number) => `${valor > 0 ? '+' : valor < 0 ? '−' : ''}${numero(Math.abs(valor))}`

  const descrever = (entrada: EntradaHistorico): { texto: string; delta?: number } => {
    const quem = entrada.vencedores?.[0] ?? entrada.cadeira
    const nome = quem !== undefined ? nomeDe(quem) : ''
    const delta = quem !== undefined ? entrada.variacao?.[quem] : undefined
    switch (entrada.tipo) {
      case 'ron': {
        const nomes = (entrada.vencedores ?? []).map(nomeDe).join(', ')
        return {
          texto: t('match.history.ron', { name: nomes, payer: entrada.pagador !== undefined ? nomeDe(entrada.pagador) : '—' }),
          delta,
        }
      }
      case 'tsumo':
        return { texto: t('match.history.tsumo', { name: nome }), delta }
      case 'riichi':
        return { texto: t('match.history.riichi', { name: nome }), delta }
      case 'chombo':
        return { texto: t('match.history.chombo', { name: nome }), delta }
      case 'ryukyoku':
        return { texto: t('match.history.ryukyoku') }
      case 'abortivo':
        return { texto: t('match.history.abortive') }
      case 'paarenchan':
        return { texto: t('match.history.paarenchan', { name: nome }) }
      case 'desfazer':
        return { texto: t('match.history.undo', { action: t(`match.history.kind.${entrada.alvo ?? 'legado'}`) }) }
      default:
        return { texto: t('match.history.kind.legado') }
    }
  }

  const linhas = [...historico].reverse()

  return (
    <Modal titulo={t('match.history.title')} aoFechar={aoFechar} rotuloFechar={t('actions.close')} tamanho="media">
      {linhas.length === 0 ? (
        <p className="ptd-historico-vazio">{t('match.history.empty')}</p>
      ) : (
        <ol className="ptd-historico">
          {linhas.map((entrada) => {
            const { texto, delta } = descrever(entrada)
            const rodada = t('match.history.round', {
              wind: t(CHAVE_VENTO[entrada.rodada.vento]),
              number: entrada.rodada.numero,
              count: entrada.rodada.honba,
            })
            return (
              <li
                key={entrada.id}
                className={`ptd-historico-linha ptd-historico-linha--${entrada.tipo}${
                  entrada.desfeita ? ' ptd-historico-linha--desfeita' : ''
                }`}
              >
                <i className={`fas ${ICONE[entrada.tipo]}`} aria-hidden="true" />
                <div className="ptd-historico-texto">
                  <small>
                    {rodada}
                    {entrada.desfeita && <> · {t('match.history.undone')}</>}
                  </small>
                  <span>
                    {texto}
                    {delta !== undefined && delta !== 0 && (
                      <strong className={delta > 0 ? 'ptd-historico-ganho' : 'ptd-historico-perda'}> · {pontos(delta)}</strong>
                    )}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Modal>
  )
}
