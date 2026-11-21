import { Fragment, useState } from 'react'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import AbasModal from '@/compartilhado/interface/componentes/modal/AbasModal'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { traduzirGlobal } from '@/compartilhado/i18n/tradutorGlobal'
import { parseMpszGrupos } from '../../../logica/yakus'
import TextoGlossario from '../glossario/TextoGlossario'
import { CiclosDora, PedrasExemplo } from '../yakus/PedrasExemplo'
import CenaAjuda from './CenaAjuda'
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
          className="fas fa-sliders icone-texto-ajuda"
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
      {blocos.map(
        (
          {
            subtitulo,
            item,
            icone,
            dica,
            paragrafos = [],
            visual,
            exemplo,
            cena,
            literal,
            divisoria,
            apoio = [],
          },
          indice,
        ) => {
          const tx = (chave: string) => (literal ? chave : t(chave))
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
            <p
              key={chave}
              className={subtitulo ? 'glossario-item__texto' : 'glossario-bloco__intro'}
            >
              <TextoAjuda texto={tx(chave)} ignorar={ignorar} />
            </p>
          ))
          if (!subtitulo) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
              <Fragment key={indice}>
                {textos}
                {visual && <VisualAjuda visual={visual} />}
                {exemplo && <PedrasExemplo grupos={parseMpszGrupos(exemplo)} rotulo={exemplo} />}
                {cena && <CenaAjuda nome={cena} />}
              </Fragment>
            )
          }
          if (!item && paragrafos.length === 0) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
              <h3
                key={indice}
                className={`glossario-bloco__titulo${divisoria ? ' glossario-bloco__titulo--divisoria' : ''}`}
              >
                {t(subtitulo)}
              </h3>
            )
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
            <div key={indice} className="glossario-item">
              <h4 className="glossario-item__nome">
                {tx(subtitulo)}
                {icone && <i className={`fas ${icone} icone-subtitulo-ajuda`} aria-hidden="true" />}
              </h4>
              {textos}
              {apoio.map((linha) => (
                <p key={linha} className="glossario-item__apoio">
                  {tx(linha)}
                </p>
              ))}
              {visual && <VisualAjuda visual={visual} />}
              {exemplo && <PedrasExemplo grupos={parseMpszGrupos(exemplo)} rotulo={exemplo} />}
              {cena && <CenaAjuda nome={cena} />}
            </div>
          )
        },
      )}
    </section>
  )
}

/** Explica uma seção da finalização (aberta pelo botão "?" ao lado do título). */
/** Trechos que só fazem sentido no Riichi. */
const SO_RIICHI = new Set(['sectionHelp.tiles.waits', 'sectionHelp.tiles.akaHan'])
/** Trechos do Riichi com uma versão do MCR. */
const TEXTO_MCR: Record<string, string> = {
  'sectionHelp.tiles.guide': 'sectionHelp.mcr.guide',
  'sectionHelp.tiles.finish': 'sectionHelp.mcr.finish',
  'sectionHelp.notation.tip': 'sectionHelp.mcr.notationTip',
}

export default function ModalAjudaSecao({
  topico,
  blocosExtras = [],
  aoFechar,
}: {
  topico: TopicoAjuda
  /** Blocos montados na hora, depois dos fixos (ex.: os yakus locais ligados). */
  blocosExtras?: BlocoAjuda[]
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { titulo, blocos: blocosFixos = [], abas, tema, termosProprios } = TOPICOS_AJUDA[topico]
  const chines = useModoJogoAtual() === 'mcr'
  // MCR: a mesma ajuda, sem o que é só do Riichi (han nas esperas, Aka dora) e com o texto do MCR.
  const blocos = [...blocosFixos, ...blocosExtras].flatMap((bloco) => {
    if (!chines) return [bloco]
    if (bloco.cena === 'pecasAka' || bloco.cena === 'mpszAka') return []
    const paragrafos = bloco.paragrafos
      ?.filter((chave) => !SO_RIICHI.has(chave))
      .map((chave) => TEXTO_MCR[chave] ?? chave)
    return [{ ...bloco, paragrafos }]
  })
  const [indiceAba, setIndiceAba] = useState(0)

  return (
    <Modal
      titulo={t(titulo)}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
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
