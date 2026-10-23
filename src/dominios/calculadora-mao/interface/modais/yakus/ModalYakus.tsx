import { useState } from 'react'
import AbasModal, { type AbaModal } from '@/compartilhado/interface/componentes/modal/AbasModal'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  BEGINNER_GROUPS,
  CATEGORY_LABELS,
  DORA_NOTE,
  ORDEM_CATEGORIAS,
  YAKU,
  type Yaku,
  type YakuCategory,
} from '../../../logica/yakus'
import BlocoDica from '../glossario/BlocoDica'
import AbaGlossario from './AbaGlossario'
import { CampoBuscaGuia, ResultadoBuscaGuia } from './BuscaGuia'
import CartaoYaku from './CartaoYaku'
import './modal-yakus.css'

type AbaYakus = 'glossario' | 'iniciante' | YakuCategory | 'yakuman'

const ROTULOS_CURTOS: Record<YakuCategory, string> = {
  sequencias: 'Yaku de sequência',
  'terminais-honras': 'Yaku de terminais',
  'trincas-pares': 'Yaku de trincas',
  naipes: 'Yaku de naipe',
  outros: 'Outros yaku',
}

/** Ordem das abas (grade de 4 colunas): a primeira é a padrão ao abrir. */
const ABAS: AbaModal<AbaYakus>[] = [
  { chave: 'glossario', rotulo: 'Glossário' },
  { chave: 'iniciante', rotulo: 'Yaku para iniciantes' },
  ...ORDEM_CATEGORIAS.map((categoria) => ({ chave: categoria, rotulo: ROTULOS_CURTOS[categoria] })),
  { chave: 'yakuman', rotulo: 'Yakuman' },
]

const CHAVE_ABA = 'riichi-manager-aba-yakus'

const YAKU_POR_ID = new Map(YAKU.map((yaku) => [yaku.id, yaku]))

function lerAbaSalva(): AbaYakus {
  try {
    const salva = localStorage.getItem(CHAVE_ABA)
    return ABAS.find((aba) => aba.chave === salva)?.chave ?? ABAS[0].chave
  } catch {
    return ABAS[0].chave
  }
}

function salvarAba(aba: AbaYakus) {
  try {
    localStorage.setItem(CHAVE_ABA, aba)
  } catch {
    // Sem armazenamento (aba anônima, bloqueio): só não lembra a aba.
  }
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
  return (
    <>
      {BEGINNER_GROUPS.map((grupo) => (
        <section key={grupo.title} className="yaku-grupo">
          <h3 className="yaku-grupo__titulo">
            {grupo.title} <span className="yaku-grupo__subtitulo">({grupo.subtitle})</span>
          </h3>
          <div className="yaku-lista">
            {grupo.ids.map((id) => {
              const yaku = YAKU_POR_ID.get(id)
              return yaku ? <CartaoYaku key={id} yaku={yaku} /> : null
            })}
          </div>
        </section>
      ))}
      <BlocoDica texto={DORA_NOTE} className="yaku-nota-dora" />
    </>
  )
}

function ConteudoAba({ aba }: { aba: AbaYakus }) {
  if (aba === 'iniciante') return <AbaIniciante />
  if (aba === 'glossario') return <AbaGlossario />
  if (aba === 'yakuman') {
    return <ListaYakus titulo="Yakuman (mão máxima)" yakus={YAKU.filter((yaku) => yaku.yakuman)} />
  }
  return (
    <ListaYakus
      titulo={CATEGORY_LABELS[aba]}
      yakus={YAKU.filter((yaku) => yaku.category === aba && !yaku.yakuman)}
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
  const [aba, setAba] = useState<AbaYakus>(lerAbaSalva)
  const [busca, setBusca] = useState('')

  const escolherAba = (novaAba: AbaYakus) => {
    setAba(novaAba)
    salvarAba(novaAba)
    setBusca('')
  }

  return (
    <Modal
      titulo={
        <>
          Guia de bolso{' '}
          {/* Font Awesome grátis não tem ovelha: emoji, com nome para leitor de tela. */}
          <span className="yaku-modal__ovelha" role="img" aria-label="Ovelhinha">
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
        abas={ABAS}
        ativa={aba}
        aoEscolher={escolherAba}
        rotulo="Seções do guia"
        colunas={4}
      >
        <CampoBuscaGuia valor={busca} aoMudar={setBusca} />
        {busca.trim() ? (
          <ResultadoBuscaGuia busca={busca} abas={ABAS} aoAbrirAba={escolherAba} />
        ) : (
          <ConteudoAba aba={aba} />
        )}
      </AbasModal>
    </Modal>
  )
}
