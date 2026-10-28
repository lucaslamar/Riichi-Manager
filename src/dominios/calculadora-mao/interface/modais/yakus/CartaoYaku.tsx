import { useI18n } from '@/compartilhado/i18n/I18nProvider'
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
  const { t } = useI18n()
  if (yaku.yakuman) {
    return <span className="yaku-badge yaku-badge--yakuman">{t('pocketGuide.yakumanBadge')}</span>
  }

  return (
    <span className="yaku-badge">
      <span>
        {t('pocketGuide.closed')} <strong>{formatarHan(yaku.hanClosed, yaku.bonus)}</strong>
      </span>
      <span className="yaku-badge__divisor" aria-hidden="true">
        |
      </span>
      <span>
        {t('pocketGuide.open')} <strong>{formatarHan(yaku.hanOpen, yaku.bonus)}</strong>
      </span>
    </span>
  )
}

/**
 * Cartão de um yaku da referência (abas do Guia de bolso e tela aberta ao
 * tocar no nome de um yaku): nome, han, descrição, dica e exemplo.
 *
 * No título, o nome do idioma; ao lado, o kanji (idiomas em romaji) ou o
 * romaji (ja, zh-Hans, ko), para casar com o que se fala em mesa.
 */
export default function CartaoYaku({ yaku }: { yaku: Yaku }) {
  const { t, idioma } = useI18n()
  const ignorar = [
    termoGlossarioDoNome(yaku.romaji, idioma),
    termoGlossarioDoNome(yaku.titulo, idioma),
  ]
  const emRomaji = yaku.titulo === yaku.romaji
  return (
    <article className={`yaku-card${yaku.yakuman ? ' yaku-card--yakuman' : ''}`}>
      <header className="yaku-card__topo">
        <h4 className="yaku-card__nome">
          {yaku.titulo}{' '}
          <span className="yaku-card__kanji" lang={emRomaji ? 'ja' : 'ja-Latn'}>
            {emRomaji ? yaku.kanji : yaku.romaji}
          </span>
        </h4>
        <SeloHan yaku={yaku} />
      </header>
      {yaku.nome && <p className="yaku-card__pt">{yaku.nome}</p>}
      <p className="yaku-card__descricao">
        <TextoGlossario texto={yaku.descricao} ignorar={ignorar} />
      </p>
      {yaku.dica && <BlocoDica texto={yaku.dica} ignorar={ignorar} />}
      {yaku.example && (
        <PedrasExemplo
          grupos={parseMpszGrupos(yaku.example)}
          rotulo={t('pocketGuide.example', { exemplo: yaku.example })}
        />
      )}
    </article>
  )
}
