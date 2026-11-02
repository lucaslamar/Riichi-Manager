import { useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from './modal/Modal'

/** Botão "?" ao lado do rótulo de um campo, que abre a ajuda dele numa folha. */
export default function AjudaCampo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  const { t } = useI18n()
  const [aberta, setAberta] = useState(false)

  return (
    <>
      <button
        type="button"
        className="ajuda-campo"
        aria-label={t('actions.helpFor', { field: rotulo })}
        onClick={(evento) => {
          // Dentro de um <label>: o toque não pode ir para o campo.
          evento.preventDefault()
          setAberta(true)
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      {aberta && (
        <Modal
          titulo={rotulo}
          aoFechar={() => setAberta(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          className="modal-folha ajuda-campo-folha"
        >
          {children}
        </Modal>
      )}
    </>
  )
}
