import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ReactNode } from 'react'
import type { CodigoPedra } from '../../../logica/mao'
import { PedraSvg } from './PedraSvg'

interface PropsPedraMao {
  pedra: CodigoPedra
  /** Texto do title/aria-label (a acao do clique muda conforme a tela). */
  rotulo: string
  ehAgari?: boolean
  selecionada?: boolean
  chombo?: boolean
  aoClicar: () => void
}

/**
 * Pedra de visualizacao da mao, usada na montagem e na finalizacao.
 *
 * O tamanho vem do token --pedra-mao-largura (base/tokens.css), herdado da
 * grade ou da tela; altura e selo "Batida" escalam a partir dele, entao ajustar
 * o tamanho e so trocar o token.
 */
export function PedraMao({
  pedra,
  rotulo,
  ehAgari = false,
  selecionada = false,
  chombo = false,
  aoClicar,
}: PropsPedraMao) {
  const { t } = useI18n()
  const classe = `chip-pedra pedra-mao ${ehAgari ? 'agari' : ''} ${
    selecionada ? 'selecionada-meld' : ''
  } ${chombo ? 'chombo' : ''}`

  return (
    <button className={classe} type="button" title={rotulo} aria-label={rotulo} onClick={aoClicar}>
      <PedraSvg pedra={pedra} />
      {ehAgari && <span className="badge-pedra-agari">{t('calculator.winningTile')}</span>}
    </button>
  )
}

/**
 * Grade das pedras soltas da mao: --pedra-mao-colunas por linha, cada coluna
 * com --pedra-mao-largura e espaco --pedra-mao-gap. `compacta` reduz a pedra
 * quando a mao passa de 14 pedras fisicas (kans), para nao empurrar o teclado.
 */
export function GradePedrasMao({
  children,
  compacta = false,
  className = '',
}: {
  children: ReactNode
  compacta?: boolean
  className?: string
}) {
  return (
    <div className={`grade-pedras-mao ${compacta ? 'compacta' : ''} ${className}`}>{children}</div>
  )
}
