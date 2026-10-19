import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { TOPICOS_AJUDA, type TopicoAjuda } from './topicosAjuda'
import './ajuda-secoes.css'

/** Explica uma seção da finalização (aberta pelo botão "?" ao lado do título). */
export default function ModalAjudaSecao({
  topico,
  aoFechar,
}: {
  topico: TopicoAjuda
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { titulo, blocos, tema } = TOPICOS_AJUDA[topico]

  return (
    <Modal
      titulo={t(titulo)}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      estiloTitulo="rotulo"
      className={`modal-ajuda-secao${tema ? ` modal-ajuda-secao--${tema}` : ''}`}
    >
      {blocos.map(({ subtitulo, item, icone, paragrafos = [], lista }, indice) => {
        const Subtitulo = item ? 'h4' : 'h3'

        return (
          <section
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
            key={indice}
            className={`bloco-ajuda-secao${item ? ' bloco-ajuda-secao--item' : ''}`}
          >
            {subtitulo && (
              <Subtitulo>
                {t(subtitulo)}
                {icone && <i className={`fas ${icone} icone-subtitulo-ajuda`} aria-hidden="true" />}
              </Subtitulo>
            )}
            {paragrafos.map((chave) => (
              <p key={chave}>{t(chave)}</p>
            ))}
            {lista && (
              <ul>
                {lista.map(({ termo, texto }) => (
                  <li key={texto}>
                    <strong>{t(termo)}:</strong> {t(texto)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </Modal>
  )
}
