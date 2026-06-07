import { useState } from 'react'
import type { EntradaSetupCenterpiece, ModoAtribuicaoVentos } from '../../logica/tipos'
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
  const [texto, setTexto] = useState('')
  const [pontosIniciais, setPontosIniciais] = useState(25000)
  const [pontosCustom, setPontosCustom] = useState('')
  const [usarCustom, setUsarCustom] = useState(false)
  const [modoAtribuicaoVentos, setModoAtribuicaoVentos] =
    useState<ModoAtribuicaoVentos>('aleatorio')
  const [erro, setErro] = useState<string | null>(null)

  const pontosFinais = usarCustom ? parseInt(pontosCustom, 10) : pontosIniciais

  const parsearNomes = (): [string, string, string, string] | null => {
    const linhas = texto
      .split('\n')
      .map((linha) => linha.trim())
      .filter((linha) => linha.length > 0)

    if (linhas.length !== 4) {
      const diff = linhas.length < 4 ? 4 - linhas.length : linhas.length - 4
      if (linhas.length < 4) {
        setErro(t('centerpiece.setup.namesError.tooFew', { n: diff }))
      } else {
        setErro(t('centerpiece.setup.namesError.tooMany', { n: diff }))
      }
      return null
    }

    setErro(null)
    return linhas as [string, string, string, string]
  }

  const aoSubmeter = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const nomes = parsearNomes()
    if (!nomes) return
    if (!Number.isInteger(pontosFinais) || pontosFinais < 1000) {
      setErro(t('centerpiece.setup.customPointsError'))
      return
    }
    aoIniciar({ nomes, pontosIniciais: pontosFinais, modoAtribuicaoVentos })
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
          <p className="setup-names-hint">{t('centerpiece.setup.namesHint')}</p>
          <textarea
            className={`centerpiece-nomes-textarea${erro ? ' erro' : ''}`}
            value={texto}
            onChange={(evento) => { setTexto(evento.target.value); setErro(null) }}
            placeholder={t('centerpiece.setup.namesPlaceholder')}
            rows={4}
            aria-label={t('centerpiece.setup.playerNames')}
          />
          {erro && <p className="setup-names-erro" role="alert">{erro}</p>}
        </fieldset>

        <fieldset>
          <legend>{t('centerpiece.setup.windAssignment.title')}</legend>
          <div className="centerpiece-modo-ventos-opcoes">
            {(['aleatorio', 'ordemNomes'] as const).map((modo) => (
              <label
                key={modo}
                className={`opcao-pontos opcao-modo-vento ${
                  modoAtribuicaoVentos === modo ? 'ativa' : ''
                }`}
              >
                <input
                  type="radio"
                  name="modoAtribuicaoVentos"
                  value={modo}
                  checked={modoAtribuicaoVentos === modo}
                  onChange={() => setModoAtribuicaoVentos(modo)}
                />
                <span>
                  <strong>{t(`centerpiece.setup.windAssignment.${modo}.label`)}</strong>
                  <small>{t(`centerpiece.setup.windAssignment.${modo}.help`)}</small>
                </span>
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
            {t(
              modoAtribuicaoVentos === 'aleatorio'
                ? 'centerpiece.setup.startRandom'
                : 'centerpiece.setup.startOrdered',
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
