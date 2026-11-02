import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { REGISTRO_VAZIO } from '../../logica/descartes'
import type { Cadeira, Partida } from '../../logica/partida'
import RioPedras from './RioPedras'

/** Rio de um jogador, aberto pelo menu dele: só para ver, não registra nada. */
export default function ModalRio({
  partida,
  cadeira,
  nomeDe,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { lances } = partida.registro ?? REGISTRO_VAZIO
  return (
    <Modal
      titulo={t('match.discards.title', { name: nomeDe(cadeira) })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-primario" onClick={aoFechar}>
            {t('actions.close')}
          </button>
        </div>
      }
    >
      <RioPedras lances={lances} cadeira={cadeira} nomeDe={nomeDe} destacarAposRiichi />
    </Modal>
  )
}
