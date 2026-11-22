import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import type { RegrasWo } from '@/compartilhado/modo-jogo/regrasDoModo'

const CAMPOS: readonly { campo: keyof RegrasWo; chave: string; sinal: string }[] = [
  { campo: 'penalidade', chave: 'absent', sinal: '−' },
  { campo: 'presente', chave: 'present', sinal: '+' },
  { campo: 'toleranciaMinutos', chave: 'tolerance', sinal: '' },
  { campo: 'porMinuto', chave: 'perMinute', sinal: '−' },
]

/** WO e atraso, no fim da aba Pontuação. */
export default function CamposWo({ regras, aoMudar }: { regras: RegrasWo; aoMudar: (regras: RegrasWo) => void }) {
  const { t } = useI18n()
  const [textos, setTextos] = useState(() => CAMPOS.map(({ campo }) => String(regras[campo])))

  return (
    <div className="cfg-campo">
      <span className="cfg-campo-rotulo">
        {t('tournament.wo.settings')}
        <AjudaCampo rotulo={t('tournament.wo.settings')}>
          <p>{t('tournament.wo.whyAbsent')}</p>
          <p>{t('tournament.wo.whyPresent')}</p>
          <p>{t('tournament.wo.whyLate')}</p>
        </AjudaCampo>
      </span>
      <div className="trn-wo-campos">
        {CAMPOS.map(({ campo, chave, sinal }, indice) => (
          <label key={campo} className="cfg-campo">
            <span className="cfg-campo-rotulo">
              {t(`tournament.wo.${chave}`)}
              {sinal && ` (${sinal})`}
            </span>
            <input
              className="trn-campo"
              type="number"
              inputMode="decimal"
              min={0}
              value={textos[indice]}
              onChange={(evento) => {
                const digitado = evento.target.value
                setTextos(textos.map((texto, i) => (i === indice ? digitado : texto)))
                // Vazio não salva como zero.
                aoMudar({ ...regras, [campo]: digitado.trim() === '' ? Number.NaN : Number(digitado) })
              }}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
