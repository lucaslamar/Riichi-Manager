import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  patamarDaMao,
  CHAVE_PATAMAR,
  type MaoDestacada,
} from '@/dominios/centerpiece/logica/resumoPartida'

/** "Haneman · 6 han 30 fu", ou os fan no Chinês. */
export default function TextoMao({ mao }: { mao: MaoDestacada }) {
  const { t } = useI18n()
  if (mao.fan !== undefined) return <>{t('stats.handFan', { fan: mao.fan })}</>
  const patamar = patamarDaMao(mao.han, mao.fu, mao.yakuman)
  // Yakuman não se conta em han e fu.
  const contagem =
    mao.yakuman || !mao.han
      ? null
      : mao.fu
        ? t('stats.handHanFu', { han: mao.han, fu: mao.fu })
        : t('stats.handHan', { han: mao.han })
  const nomePatamar = patamar
    ? `${t(CHAVE_PATAMAR[patamar])}${(mao.yakuman ?? 0) > 1 ? ` ×${mao.yakuman}` : ''}`
    : null
  return <>{[nomePatamar, contagem].filter(Boolean).join(' · ')}</>
}
