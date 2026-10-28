import { useLayoutEffect, useRef } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { buscarTermoGlossario, buscarYakuDoTermo } from '../../../logica/glossario'
import CartaoYaku from '../yakus/CartaoYaku'
import BlocoGlossario, { TituloSecaoGlossario } from './BlocoGlossario'

/** Título da tela de termo: o assunto do glossário em que o termo está (ou "Yaku"). */
export function TituloTermo({ termo }: { termo: string }) {
  const { t, idioma } = useI18n()
  if (buscarYakuDoTermo(termo, idioma)) return <span>{t('pocketGuide.yaku')}</span>
  const encontrado = buscarTermoGlossario(termo, idioma)
  return encontrado ? <TituloSecaoGlossario secao={encontrado.secao} /> : null
}

/**
 * Definição de um termo do glossário, aberta ao tocar num termo destacado
 * (TextoGlossario) como uma tela da própria modal: o bloco do assunto inteiro
 * (ex.: Espera e vitória), com o item do termo destacado em amarelo e já à
 * vista. Link de yaku abre o cartão dele, como nas abas do Guia de bolso.
 */
export function ConteudoTermo({ termo }: { termo: string }) {
  const { idioma } = useI18n()
  const encontrado = buscarTermoGlossario(termo, idioma)
  const conteudoRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const conteudo = conteudoRef.current
    const rolavel = conteudo?.closest('.modal-tela, .modal-corpo')
    const destaque = conteudo?.querySelector('.glossario-item--destaque')
    if (!rolavel || !destaque) return
    rolavel.scrollTop +=
      destaque.getBoundingClientRect().top -
      rolavel.getBoundingClientRect().top -
      rolavel.clientHeight / 4
  }, [])

  const yaku = buscarYakuDoTermo(termo, idioma)
  if (yaku) return <CartaoYaku yaku={yaku} />
  if (!encontrado) return null
  return (
    <div ref={conteudoRef}>
      <BlocoGlossario secao={encontrado.secao} destaque={encontrado.item?.id} comTitulo={false} />
    </div>
  )
}

/**
 * Modal própria do termo, só para textos fora de qualquer modal (dentro de
 * uma, o termo abre como tela dela). Termos aqui dentro também abrem como tela.
 */
export default function ModalTermo({ termo, aoFechar }: { termo: string; aoFechar: () => void }) {
  const { t } = useI18n()
  return (
    <Modal
      titulo={<TituloTermo termo={termo} />}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
    >
      <ConteudoTermo termo={termo} />
    </Modal>
  )
}
