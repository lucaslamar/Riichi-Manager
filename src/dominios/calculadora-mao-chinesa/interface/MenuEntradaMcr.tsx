import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'

/** No MCR a linha de chamadas tem só as quatro: o MPSZ fica neste menu. */
export default function MenuEntradaMcr({ aoAbrirNotacao }: { aoAbrirNotacao: () => void }) {
  const { t } = useI18n()
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        type="button"
        className="btn-configuracao-mao-cabecalho mcr-mais-entradas"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-label={t('acoes.mcr.mais')}
        title={t('acoes.mcr.mais')}
        onClick={() => setAberto(true)}
      >
        <i className="fas fa-ellipsis" aria-hidden="true" />
      </button>
      {aberto && (
        <Modal
          titulo={t('acoes.mcr.mais')}
          aoFechar={() => setAberto(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <button
            type="button"
            className="mcr-item-entrada"
            onClick={() => {
              setAberto(false)
              aoAbrirNotacao()
            }}
          >
            <i className="fas fa-keyboard" aria-hidden="true" />
            {t('acoes.mcr.mpsz')}
          </button>
        </Modal>
      )}
    </>
  )
}
