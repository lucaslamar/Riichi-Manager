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
  parseMpszGrupos,
  type Yaku,
  type YakuCategory,
} from '../../../logica/yakus'
import { termoGlossarioDoNome } from '../../../logica/glossario'
import TextoGlossario from '../glossario/TextoGlossario'
import AbaGlossario from './AbaGlossario'
import { PedrasExemplo } from './PedrasExemplo'
import './modal-yakus.css'

type AbaYakus = 'glossario' | 'iniciante' | YakuCategory | 'yakuman'

const ROTULOS_CURTOS: Record<YakuCategory, string> = {
  sequencias: 'Sequências',
  'terminais-honras': 'Terminais',
  'trincas-pares': 'Trincas',
  naipes: 'Naipes',
  outros: 'Outros',
}

/** Ordem das abas (grade de 4 colunas): a primeira é a padrão ao abrir. */
const ABAS: AbaModal<AbaYakus>[] = [
  { chave: 'glossario', rotulo: 'Glossário' },
  { chave: 'iniciante', rotulo: 'Iniciante' },
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

function formatarHan(han: number | null, bonus?: boolean) {
  if (han === null) return '—'
  return bonus ? `+${han}` : String(han)
}

function SeloHan({ yaku }: { yaku: Yaku }) {
  if (yaku.yakuman) {
    return <span className="yaku-badge yaku-badge--yakuman">YAKUMAN</span>
  }

  return (
    <span className="yaku-badge">
      <span>
        Fechada <strong>{formatarHan(yaku.hanClosed, yaku.bonus)}</strong>
      </span>
      <span className="yaku-badge__divisor" aria-hidden="true">
        |
      </span>
      <span>
        Aberta <strong>{formatarHan(yaku.hanOpen, yaku.bonus)}</strong>
      </span>
    </span>
  )
}

function CartaoYaku({ yaku }: { yaku: Yaku }) {
  return (
    <article className={`yaku-card${yaku.yakuman ? ' yaku-card--yakuman' : ''}`}>
      <header className="yaku-card__topo">
        <h4 className="yaku-card__nome">
          {yaku.romaji}{' '}
          <span className="yaku-card__kanji" lang="ja">
            {yaku.kanji}
          </span>
        </h4>
        <SeloHan yaku={yaku} />
      </header>
      <p className="yaku-card__pt">{yaku.namePt}</p>
      <p className="yaku-card__descricao">
        <TextoGlossario texto={yaku.description} ignorar={[termoGlossarioDoNome(yaku.romaji)]} />
      </p>
      {yaku.example && (
        <PedrasExemplo grupos={parseMpszGrupos(yaku.example)} rotulo={`Exemplo: ${yaku.example}`} />
      )}
    </article>
  )
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
      <p className="yaku-nota-dora">
        <i className="fas fa-circle-info" aria-hidden="true" />{' '}
        <TextoGlossario texto={DORA_NOTE} />
      </p>
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
 * (Glossário, Iniciante, uma por categoria e Yakuman) e os cartões.
 */
export default function ModalYakus({ aoFechar }: { aoFechar: () => void }) {
  const { t } = useI18n()
  const [aba, setAba] = useState<AbaYakus>(lerAbaSalva)

  const escolherAba = (novaAba: AbaYakus) => {
    setAba(novaAba)
    salvarAba(novaAba)
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
        <ConteudoAba aba={aba} />
      </AbasModal>
    </Modal>
  )
}
