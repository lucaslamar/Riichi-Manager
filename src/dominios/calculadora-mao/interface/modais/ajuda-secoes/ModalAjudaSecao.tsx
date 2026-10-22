import { useState } from 'react'
import AbasModal from '@/compartilhado/interface/componentes/modal/AbasModal'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { parseMpszGrupos } from '../../../logica/yakus'
import { CiclosDora, PedrasExemplo } from '../yakus/PedrasExemplo'
import { TOPICOS_AJUDA, type BlocoAjuda, type TopicoAjuda } from './topicosAjuda'
import './ajuda-secoes.css'

/** Marcador nos textos de `sectionHelp` trocado pelo ícone de engrenagem. */
const MARCADOR_ENGRENAGEM = '[[engrenagem]]'

/** Texto da ajuda com o marcador da engrenagem virando o ícone de verdade. */
function TextoAjuda({ texto }: { texto: string }) {
  const partes = texto.split(MARCADOR_ENGRENAGEM)
  return partes.map((parte, indice) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: partes fixas de um texto
    <span key={indice}>
      {parte}
      {indice < partes.length - 1 && (
        <i className="fas fa-gear icone-texto-ajuda" role="img" aria-label="engrenagem" />
      )}
    </span>
  ))
}

/** Pedras de exemplo de um bloco (mesmas da aba Pedras da modal de Yakus). */
function VisualAjuda({ visual }: { visual: NonNullable<BlocoAjuda['visual']> }) {
  if (visual === 'ciclosDora') return <CiclosDora />
  return <PedrasExemplo grupos={parseMpszGrupos('0m0p0s')} rotulo="5 vermelho de Man, Pin e Sou" />
}

function BlocosAjuda({ blocos }: { blocos: BlocoAjuda[] }) {
  const { t } = useI18n()

  return blocos.map(({ subtitulo, item, icone, paragrafos = [], visual }, indice) => {
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
          <p key={chave}>
            <TextoAjuda texto={t(chave)} />
          </p>
        ))}
        {visual && <VisualAjuda visual={visual} />}
      </section>
    )
  })
}

/** Explica uma seção da finalização (aberta pelo botão "?" ao lado do título). */
export default function ModalAjudaSecao({
  topico,
  aoFechar,
}: {
  topico: TopicoAjuda
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { titulo, blocos = [], abas, tema } = TOPICOS_AJUDA[topico]
  const [indiceAba, setIndiceAba] = useState(0)

  return (
    <Modal
      titulo={t(titulo)}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      estiloTitulo="rotulo"
      className={`modal-ajuda-secao${tema ? ` modal-ajuda-secao--${tema}` : ''}${
        abas ? ' modal-ajuda-secao--abas' : ''
      }`}
    >
      {abas ? (
        <AbasModal
          abas={abas.map((aba, indice) => ({ chave: String(indice), rotulo: t(aba.rotulo) }))}
          ativa={String(indiceAba)}
          aoEscolher={(chave) => setIndiceAba(Number(chave))}
          rotulo={t(titulo)}
        >
          <BlocosAjuda blocos={abas[indiceAba].blocos} />
        </AbasModal>
      ) : (
        <BlocosAjuda blocos={blocos} />
      )}
    </Modal>
  )
}
