import { useId } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Variante } from '@/compartilhado/mahjong/variante'
import './seletor-variante.css'

const OPCOES: { valor: Variante; chave: string }[] = [
  { valor: 'yonma', chave: 'sanma.variante4' },
  { valor: 'sanma', chave: 'sanma.variante3' },
]

/**
 * `4 jogadores | 3 jogadores`. Rádios nativos:
 * as setas do teclado trocam a opção sem código extra.
 */
export default function SeletorVariante({
  valor,
  aoMudar,
  desabilitado = false,
  className,
}: {
  valor: Variante
  aoMudar: (variante: Variante) => void
  desabilitado?: boolean
  className?: string
}) {
  const { t } = useI18n()
  const nome = useId()
  return (
    <div
      className={`seletor-variante${className ? ` ${className}` : ''}`}
      role="radiogroup"
      aria-label={t('sanma.seletorAria')}
      aria-disabled={desabilitado || undefined}
    >
      {OPCOES.map((opcao) => (
        <label key={opcao.valor} className="seletor-variante__opcao">
          <input
            type="radio"
            name={nome}
            value={opcao.valor}
            checked={valor === opcao.valor}
            disabled={desabilitado}
            onChange={() => aoMudar(opcao.valor)}
          />
          <span>{t(opcao.chave)}</span>
        </label>
      ))}
    </div>
  )
}
