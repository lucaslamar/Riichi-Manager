import { useMemo, useState } from 'react'
import AbasModal, { type AbaModal } from '@/compartilhado/interface/componentes/modal/AbasModal'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useModoJogo } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import {
  ABAS_GUIA_MCR,
  CampoBuscaGuiaMcr,
  ConteudoGuiaMcr,
  idCartaoFan,
  rotuloAbaGuiaMcr,
  type AbaGuiaMcr,
} from '@/dominios/guia-bolso/mcr/ConteudoGuiaMcr'
import { conteudoGuiaBolso } from '../../../conteudo/guia-bolso'
import {
  GRUPOS_INICIANTE,
  ORDEM_CATEGORIAS,
  yakusDoIdioma,
  type Yaku,
  type YakuCategory,
} from '../../../logica/yakus'
import BlocoDica from '../glossario/BlocoDica'
import AbaGlossario from './AbaGlossario'
import { CampoBuscaGuia, ResultadoBuscaGuia } from './BuscaGuia'
import CartaoYaku from './CartaoYaku'
import AbaYakusEspeciais from './AbaYakusEspeciais'
import './modal-yakus.css'

type AbaYakus = 'glossario' | 'iniciante' | YakuCategory | 'yakuman' | 'especiais'

const CHAVE_ROTULO_CURTO: Record<YakuCategory, string> = {
  sequencias: 'pocketGuide.tabs.sequences',
  'terminais-honras': 'pocketGuide.tabs.terminals',
  'trincas-pares': 'pocketGuide.tabs.triplets',
  naipes: 'pocketGuide.tabs.suits',
  outros: 'pocketGuide.tabs.others',
}

function ListaYakus({ titulo, yakus }: { titulo: string; yakus: Yaku[] }) {
  return (
    <section className="yaku-grupo">
      <h3 className="yaku-grupo__titulo">{titulo}</h3>
      <div className="yaku-lista">
        {yakus.map((yaku) => (
          <CartaoYaku key={yaku.id} yaku={yaku} />
        ))}
      </div>
    </section>
  )
}

function AbaIniciante() {
  const { idioma } = useI18n()
  const { iniciante, notaDora } = conteudoGuiaBolso(idioma)
  const yakus = yakusDoIdioma(idioma)
  return (
    <>
      {GRUPOS_INICIANTE.map((ids, indice) => (
        <section key={ids[0]} className="yaku-grupo">
          <h3 className="yaku-grupo__titulo">
            {iniciante[indice].titulo}{' '}
            <span className="yaku-grupo__subtitulo">({iniciante[indice].subtitulo})</span>
          </h3>
          <div className="yaku-lista">
            {ids.map((id) => {
              const yaku = yakus.find((candidato) => candidato.id === id)
              return yaku ? <CartaoYaku key={id} yaku={yaku} /> : null
            })}
          </div>
        </section>
      ))}
      <BlocoDica texto={notaDora} className="yaku-nota-dora" />
    </>
  )
}

function ConteudoAba({ aba }: { aba: AbaYakus }) {
  const { t, idioma } = useI18n()
  const conteudo = conteudoGuiaBolso(idioma)
  const yakus = yakusDoIdioma(idioma)
  if (aba === 'iniciante') return <AbaIniciante />
  if (aba === 'glossario') return <AbaGlossario />
  if (aba === 'especiais') return <AbaYakusEspeciais />
  if (aba === 'yakuman') {
    return (
      <>
        <ListaYakus
          titulo={t('pocketGuide.yakumanHeading')}
          yakus={yakus.filter((yaku) => yaku.yakuman)}
        />
        <BlocoDica texto={conteudo.notaKazoe} className="yaku-nota-dora" />
      </>
    )
  }
  return (
    <ListaYakus
      titulo={conteudo.categorias[aba]}
      yakus={yakus.filter((yaku) => yaku.category === aba && !yaku.yakuman)}
    />
  )
}

/**
 * Referência de yakus para consulta durante a partida. Construída sobre a
 * Modal base (fundo, Esc, foco e trava de rolagem); aqui ficam só as abas
 * (Glossário, Yaku para iniciantes, uma por categoria e Yakuman), os cartões e
 * a busca, que vale para o Guia inteiro: com texto, o resultado entra no lugar
 * do conteúdo da aba; trocar de aba limpa a busca.
 */
export default function ModalYakus({ aoFechar }: { aoFechar: () => void }) {
  const { isChines } = useModoJogo()
  return isChines ? <ModalGuiaMcr aoFechar={aoFechar} /> : <ModalGuiaRiichi aoFechar={aoFechar} />
}

/** Título do Guia de bolso, igual nos dois modos. */
function TituloGuia() {
  const { t } = useI18n()
  return (
    <>
      {t('pocketGuide.title')}{' '}
      {/* Font Awesome grátis não tem ovelha: emoji, com nome para leitor de tela. */}
      <span className="yaku-modal__ovelha" role="img" aria-label={t('pocketGuide.sheep')}>
        🐑
      </span>
    </>
  )
}

/**
 * Guia de bolso do modo Chinês: a mesma modal, abas e busca do Riichi, com os 81
 * fan do guia do CMC por categoria e uma aba com todos por pontos.
 */
function ModalGuiaMcr({ aoFechar }: { aoFechar: () => void }) {
  const { t } = useI18n()
  // Abre no Glossário, como o do Riichi.
  const [aba, setAba] = useState<AbaGuiaMcr>('glossario')
  const [busca, setBusca] = useState('')
  const abas = useMemo<AbaModal<AbaGuiaMcr>[]>(
    () => ABAS_GUIA_MCR.map((chave) => ({ chave, rotulo: rotuloAbaGuiaMcr(chave, t) })),
    [t],
  )
  const escolherAba = (novaAba: AbaGuiaMcr) => {
    setAba(novaAba)
    setBusca('')
  }
  // Fan citado em "Não combina com": abre a aba com todos e leva o foco até ele.
  const irPara = (id: number) => {
    escolherAba('pontos')
    window.setTimeout(() => {
      const cartao = document.getElementById(idCartaoFan(id))
      cartao?.scrollIntoView({ block: 'start' })
      cartao?.focus({ preventScroll: true })
    })
  }
  return (
    <Modal
      titulo={<TituloGuia />}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      className="yaku-modal"
    >
      <AbasModal
        abas={abas}
        ativa={aba}
        aoEscolher={escolherAba}
        rotulo={t('pocketGuide.tabsLabel')}
        colunas={4}
        fixo={<CampoBuscaGuiaMcr valor={busca} aoMudar={setBusca} />}
      >
        <ConteudoGuiaMcr aba={aba} busca={busca} aoIrPara={irPara} />
      </AbasModal>
    </Modal>
  )
}

function ModalGuiaRiichi({ aoFechar }: { aoFechar: () => void }) {
  const { t } = useI18n()
  // Abre sempre no Glossário (a primeira aba), sem lembrar a última aberta.
  const [aba, setAba] = useState<AbaYakus>('glossario')
  const [busca, setBusca] = useState('')

  /** Ordem das abas (grade de 4 colunas): a primeira é a padrão ao abrir. */
  const abas = useMemo<AbaModal<AbaYakus>[]>(
    () => [
      { chave: 'glossario', rotulo: t('pocketGuide.tabs.glossary') },
      { chave: 'iniciante', rotulo: t('pocketGuide.tabs.beginner') },
      ...ORDEM_CATEGORIAS.map((categoria) => ({
        chave: categoria,
        rotulo: t(CHAVE_ROTULO_CURTO[categoria]),
      })),
      { chave: 'yakuman', rotulo: t('pocketGuide.tabs.yakuman') },
      { chave: 'especiais', rotulo: t('pocketGuide.tabs.special') },
    ],
    [t],
  )

  const escolherAba = (novaAba: AbaYakus) => {
    setAba(novaAba)
    setBusca('')
  }

  return (
    <Modal
      titulo={<TituloGuia />}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      className="yaku-modal"
    >
      <AbasModal
        abas={abas}
        ativa={aba}
        aoEscolher={escolherAba}
        rotulo={t('pocketGuide.tabsLabel')}
        colunas={4}
        fixo={<CampoBuscaGuia valor={busca} aoMudar={setBusca} />}
      >
        {busca.trim() ? (
          <ResultadoBuscaGuia busca={busca} abas={abas} aoAbrirAba={escolherAba} />
        ) : (
          <ConteudoAba aba={aba} />
        )}
      </AbasModal>
    </Modal>
  )
}
