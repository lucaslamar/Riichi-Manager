import { useMemo, useState } from 'react'
import AbasModal, { type AbaModal } from '@/compartilhado/interface/componentes/modal/AbasModal'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
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
import './modal-yakus.css'

type AbaYakus = 'glossario' | 'iniciante' | YakuCategory | 'yakuman'

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
    ],
    [t],
  )

  const escolherAba = (novaAba: AbaYakus) => {
    setAba(novaAba)
    setBusca('')
  }

  return (
    <Modal
      titulo={
        <>
          {t('pocketGuide.title')}{' '}
          {/* Font Awesome grátis não tem ovelha: emoji, com nome para leitor de tela. */}
          <span className="yaku-modal__ovelha" role="img" aria-label={t('pocketGuide.sheep')}>
            🐑
          </span>
        </>
      }
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
