import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import type { RegraSaida } from '../../logica/saidaDaPartida'
import BotoesOpcao from './BotoesOpcao'

/** A regra do W.O. no meio da partida, nas regras do torneio e nas do registro. */
export default function CamposSaida({
  regra,
  aoMudar,
}: {
  regra: RegraSaida
  aoMudar: (regra: RegraSaida) => void
}) {
  const { t } = useI18n()
  const [penalidade, setPenalidade] = useState(() => String(regra.penalidade))

  return (
    <div className="cfg-campo">
      <span className="cfg-campo-rotulo">
        {t('match.leftGame.settings')}
        <AjudaCampo rotulo={t('match.leftGame.settings')}>
          <p>{t('match.leftGame.helpDefault')}</p>
          <p>{t('match.leftGame.helpPenalty')}</p>
          <p>{t('match.leftGame.helpSum')}</p>
        </AjudaCampo>
      </span>
      <BotoesOpcao<'ultimo' | 'pontos'>
        rotulo={t('match.leftGame.settings')}
        valor={regra.ficaEmUltimo ? 'ultimo' : 'pontos'}
        aoEscolher={(valor) => aoMudar({ ...regra, ficaEmUltimo: valor === 'ultimo' })}
        opcoes={[
          { valor: 'ultimo', rotulo: t('match.leftGame.last') },
          { valor: 'pontos', rotulo: t('match.leftGame.byPoints') },
        ]}
      />
      <label className="cfg-campo cfg-saida-penalidade">
        <span className="cfg-campo-rotulo">{t('match.leftGame.penalty')} (−)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={penalidade}
          onChange={(evento) => {
            const digitado = evento.target.value
            setPenalidade(digitado)
            // Vazio não salva como zero.
            const valor = digitado.trim() === '' ? Number.NaN : Number(digitado)
            aoMudar({ ...regra, penalidade: valor })
          }}
        />
      </label>
    </div>
  )
}
