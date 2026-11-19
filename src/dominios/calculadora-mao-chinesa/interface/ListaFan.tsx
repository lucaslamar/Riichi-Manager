import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { FanContado } from '../logica/tipos'

interface LinhaFan {
  chave: string
  nomeChines: string
  vezes: number
  total: number
}

/** Fan da mão: nome em português, nome chinês e valor. Flores entram por último. */
export default function ListaFan({ fans, flores }: { fans: FanContado[]; flores: number }) {
  const { t, numero } = useI18n()
  const linhas: LinhaFan[] = fans.map((fan) => ({ ...fan, total: fan.valor * fan.vezes }))
  if (flores > 0) linhas.push({ chave: 'huapai', nomeChines: '花牌', vezes: flores, total: flores })

  return (
    <ul className="mcr-lista-fan">
      {linhas.map((linha) => (
        <li key={linha.chave} className="mcr-lista-fan__item">
          <span className="mcr-lista-fan__nome">
            {t(`mcr.fan.${linha.chave}`)}
            {linha.vezes > 1 && ` ${t('mcr.resultado.vezes', { vezes: numero(linha.vezes) })}`}
            <span className="mcr-lista-fan__chines" lang="zh-Hans">
              {linha.nomeChines}
            </span>
          </span>
          <span className="mcr-lista-fan__valor">{numero(linha.total)}</span>
        </li>
      ))}
    </ul>
  )
}
