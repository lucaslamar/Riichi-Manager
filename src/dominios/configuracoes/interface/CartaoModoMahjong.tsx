import { useId } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { haMaoEmAndamento, marcarMaoEmAndamento } from '@/compartilhado/modo-jogo/maoEmAndamento'
import { useModoJogo } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import type { ModoJogo } from '@/compartilhado/modo-jogo/tipos'

const OPCOES_MODO: { valor: ModoJogo; chave: string }[] = [
  { valor: 'riichi', chave: 'configuracoes.mahjong.riichi' },
  { valor: 'mcr', chave: 'configuracoes.mahjong.chines' },
]

/** Escolha das regras do app: Japonês (Riichi) ou Chinês (MCR / Guobiao). */
export default function CartaoModoMahjong() {
  const { t } = useI18n()
  const { modo, setModo } = useModoJogo()
  const idTitulo = useId()
  const idAjuda = useId()
  const nome = useId()

  const escolher = (proximo: ModoJogo) => {
    if (proximo === modo) return
    if (haMaoEmAndamento() && !window.confirm(t('configuracoes.mahjong.confirmarTroca'))) return
    marcarMaoEmAndamento(false)
    setModo(proximo)
  }

  return (
    <div
      className="cartao-regras cartao-regras--empilhado"
      role="radiogroup"
      aria-labelledby={idTitulo}
      aria-describedby={idAjuda}
    >
      <i className="fas fa-cubes cartao-regras__icone" aria-hidden="true" />
      <span className="cartao-regras__texto">
        <strong id={idTitulo}>{t('configuracoes.mahjong.titulo')}</strong>
        <span>{t('configuracoes.mahjong.descricao')}</span>
      </span>
      <div className="segmentos-tema">
        {OPCOES_MODO.map((opcao) => (
          <label key={opcao.valor} className="segmento-tema">
            <input
              type="radio"
              name={nome}
              value={opcao.valor}
              checked={modo === opcao.valor}
              onChange={() => escolher(opcao.valor)}
            />
            <span>{t(opcao.chave)}</span>
          </label>
        ))}
      </div>
      <span id={idAjuda} className="cartao-regras__ajuda-modo">
        {t(modo === 'mcr' ? 'configuracoes.mahjong.ajudaChines' : 'configuracoes.mahjong.ajudaRiichi')}
      </span>
    </div>
  )
}
