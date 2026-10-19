import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import './modal-ajuda-doras.css'

/** Explica a diferença entre Doras na mão e Indicadores de Dora (botão "i" da finalização). */
export default function ModalAjudaDoras({ aoFechar }: { aoFechar: () => void }) {
  const { t } = useI18n()

  return (
    <Modal
      titulo={t('calculator.manualDoraHelpTitle')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      estiloTitulo="rotulo"
      className="modal-ajuda-doras"
    >
      <p>{t('calculator.manualDoraHelp')}</p>
      <p>{t('calculator.manualDoraHelpIndicadores')}</p>
    </Modal>
  )
}
