import { Fragment, useState } from 'react'
import AbasModal from '@/compartilhado/interface/componentes/modal/AbasModal'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { traduzirGlobal } from '@/compartilhado/i18n/tradutorGlobal'
import { parseMpszGrupos } from '../../../logica/yakus'
import TextoGlossario from '../glossario/TextoGlossario'
import { CiclosDora, PedrasExemplo } from '../yakus/PedrasExemplo'
import { TOPICOS_AJUDA, type BlocoAjuda, type TopicoAjuda } from './topicosAjuda'
import '../glossario/bloco-dica.css'
import '../glossario/bloco-glossario.css'
import './ajuda-secoes.css'

/** Marcador nos textos de `sectionHelp` trocado pelo ícone de engrenagem. */
const MARCADOR_ENGRENAGEM = '[[engrenagem]]'

/**
 * Texto da ajuda com o marcador da engrenagem virando o ícone de verdade e os
 * termos do glossário virando link (menos os que a própria ajuda explica).
 */
function TextoAjuda({ texto, ignorar }: { texto: string; ignorar?: string[] }) {
  const partes = texto.split(MARCADOR_ENGRENAGEM)
  return partes.map((parte, indice) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: partes fixas de um texto
    <span key={indice}>
      <TextoGlossario texto={parte} ignorar={ignorar} />
      {indice < partes.length - 1 && (
        <i
          className="fas fa-gear icone-texto-ajuda"
          role="img"
          aria-label={traduzirGlobal('calculator.gearIcon')}
        />
      )}
    </span>
  ))
}

/** Pedras de exemplo de um bloco (mesmas do Glossário). */
function VisualAjuda({ visual }: { visual: NonNullable<BlocoAjuda['visual']> }) {
  if (visual === 'ciclosDora') return <CiclosDora />
  if (visual === 'notacao')
    return <PedrasExemplo grupos={parseMpszGrupos('2388m447p')} rotulo="2388m447p" />
  return <PedrasExemplo grupos={parseMpszGrupos('0m0p0s')} rotulo="5 vermelho de Man, Pin e Sou" />
}

/**
 * Conteúdo da ajuda no mesmo bloco do Glossário (BlocoGlossario): parágrafos
 * sem subtítulo são a abertura, subtítulos são itens com divisória, um
 * subtítulo de assunto sem texto (ex.: "Qual é o Dora?") vira rótulo de grupo
 * e `dica` vira o bloco cinza (BlocoDica), com o subtítulo em negrito.
 */
function BlocosAjuda({ blocos, ignorar }: { blocos: BlocoAjuda[]; ignorar?: string[] }) {
  const { t } = useI18n()

  return (
    <section className="glossario-bloco">
      {blocos.map(({ subtitulo, item, icone, dica, paragrafos = [], visual }, indice) => {
        if (dica) {
          return paragrafos.map((chave) => (
            <p key={chave} className="bloco-dica ajuda-dica">
              <i className="fas fa-circle-info" aria-hidden="true" />{' '}
              {subtitulo && <strong>{t(subtitulo)}: </strong>}
              <TextoAjuda texto={t(chave)} ignorar={ignorar} />
            </p>
          ))
        }
        const textos = paragrafos.map((chave) => (
          <p key={chave} className={subtitulo ? 'glossario-item__texto' : 'glossario-bloco__intro'}>
            <TextoAjuda texto={t(chave)} ignorar={ignorar} />
          </p>
        ))
        if (!subtitulo) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
            <Fragment key={indice}>
              {textos}
              {visual && <VisualAjuda visual={visual} />}
            </Fragment>
          )
        }
        if (!item && paragrafos.length === 0) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
            <h3 key={indice} className="glossario-bloco__titulo">
              {t(subtitulo)}
            </h3>
          )
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
          <div key={indice} className="glossario-item">
            <h4 className="glossario-item__nome">
              {t(subtitulo)}
              {icone && <i className={`fas ${icone} icone-subtitulo-ajuda`} aria-hidden="true" />}
            </h4>
            {textos}
            {visual && <VisualAjuda visual={visual} />}
          </div>
        )
      })}
    </section>
  )
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
  const { titulo, blocos = [], abas, tema, termosProprios } = TOPICOS_AJUDA[topico]
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
          <BlocosAjuda blocos={abas[indiceAba].blocos} ignorar={termosProprios} />
        </AbasModal>
      ) : (
        <BlocosAjuda blocos={blocos} ignorar={termosProprios} />
      )}
    </Modal>
  )
}
