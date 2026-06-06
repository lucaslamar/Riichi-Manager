import { useState } from 'react'
import type { EntradaSetupCenterpiece } from '../../logica/tipos'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

interface PropsSetupCenterpiece {
  pontosIniciaisExistentes?: number
  aoIniciar: (entrada: EntradaSetupCenterpiece) => void
  aoRetomar?: () => void
}

const PONTOS_PRESET = [25000, 30000]

export default function SetupCenterpiece({
  pontosIniciaisExistentes,
  aoIniciar,
  aoRetomar,
}: PropsSetupCenterpiece) {
  const { t } = useI18n()
  const [nomes, setNomes] = useState<[string, string, string, string]>(['', '', '', ''])
  const [pontosIniciais, setPontosIniciais] = useState(25000)
  const [pontosCustom, setPontosCustom] = useState('')
  const [usarCustom, setUsarCustom] = useState(false)

  const pontosFinais = usarCustom ? (parseInt(pontosCustom, 10) || 25000) : pontosIniciais

  const aoMudarNome = (indice: number, valor: string) => {
    const novosNomes: [string, string, string, string] = [...nomes] as [string, string, string, string]
    novosNomes[indice] = valor
    setNomes(novosNomes)
  }

  const aoSubmeter = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    aoIniciar({ nomes, pontosIniciais: pontosFinais })
  }

  return (
    <section className="card centerpiece-setup">
      <div className="cabecalho-secao">
        <i className="fas fa-table icone-secao" aria-hidden="true" />
        <div>
          <h2>{t('centerpiece.setup.title')}</h2>
          <p className="subtitulo-secao">{t('centerpiece.setup.subtitle')}</p>
        </div>
      </div>

      {pontosIniciaisExistentes !== undefined && aoRetomar && (
        <div className="centerpiece-retomar">
          <p>{t('centerpiece.continue.title')}</p>
          <button type="button" className="btn-primario" onClick={aoRetomar}>
            <i className="fas fa-play" aria-hidden="true" />
            {t('centerpiece.continue.resume')}
          </button>
        </div>
      )}

      <form onSubmit={aoSubmeter} className="centerpiece-form">
        <fieldset>
          <legend>{t('centerpiece.setup.playerNames')}</legend>
          <div className="centerpiece-nomes-grade">
            {nomes.map((nome, i) => (
              <label key={i} className="campo-nome-jogador">
                <span>{t('centerpiece.setup.player', { n: i + 1 })}</span>
                <input
                  type="text"
                  value={nome}
                  onChange={(evento) => aoMudarNome(i, evento.target.value)}
                  placeholder={t('centerpiece.setup.player', { n: i + 1 })}
                  maxLength={20}
                  aria-label={t('centerpiece.setup.player', { n: i + 1 })}
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t('centerpiece.setup.initialPoints')}</legend>
          <div className="centerpiece-pontos-opcoes">
            {PONTOS_PRESET.map((pts) => (
              <label key={pts} className={`opcao-pontos ${!usarCustom && pontosIniciais === pts ? 'ativa' : ''}`}>
                <input
                  type="radio"
                  name="pontos"
                  value={pts}
                  checked={!usarCustom && pontosIniciais === pts}
                  onChange={() => { setPontosIniciais(pts); setUsarCustom(false) }}
                />
                <span>{pts.toLocaleString('pt-BR')}</span>
              </label>
            ))}
            <label className={`opcao-pontos ${usarCustom ? 'ativa' : ''}`}>
              <input
                type="radio"
                name="pontos"
                checked={usarCustom}
                onChange={() => setUsarCustom(true)}
              />
              <span>{t('centerpiece.setup.custom')}</span>
            </label>
          </div>
          {usarCustom && (
            <input
              type="number"
              className="centerpiece-input-custom"
              value={pontosCustom}
              onChange={(evento) => setPontosCustom(evento.target.value)}
              placeholder="25000"
              min={1000}
              max={999999}
              aria-label={t('centerpiece.setup.initialPoints')}
            />
          )}
        </fieldset>

        <div className="acoes">
          <button type="submit" className="btn-primario">
            <i className="fas fa-dice" aria-hidden="true" />
            {t('centerpiece.setup.start')}
          </button>
        </div>
      </form>
    </section>
  )
}
