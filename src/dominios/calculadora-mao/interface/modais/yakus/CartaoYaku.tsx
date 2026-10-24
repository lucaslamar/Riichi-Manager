import LinkVerNoGuia from '@/dominios/aprender-a-jogar/interface/componentes/LinkVerNoGuia'
import { termoGlossarioDoNome } from '../../../logica/glossario'
import { parseMpszGrupos, type Yaku } from '../../../logica/yakus'
import BlocoDica from '../glossario/BlocoDica'
import TextoGlossario from '../glossario/TextoGlossario'
import { PedrasExemplo } from './PedrasExemplo'
import './modal-yakus.css'

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

/**
 * Cartão de um yaku da referência (abas do Guia de bolso e tela aberta ao
 * tocar no nome de um yaku): nome, han, descrição, dica e exemplo.
 */
export default function CartaoYaku({ yaku }: { yaku: Yaku }) {
  const ignorar = [termoGlossarioDoNome(yaku.romaji)]
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
        <TextoGlossario texto={yaku.description} ignorar={ignorar} />
      </p>
      {yaku.dica && <BlocoDica texto={yaku.dica} ignorar={ignorar} />}
      {yaku.example && (
        <PedrasExemplo grupos={parseMpszGrupos(yaku.example)} rotulo={`Exemplo: ${yaku.example}`} />
      )}
      <LinkVerNoGuia chave={`yaku:${yaku.id}`} />
    </article>
  )
}
