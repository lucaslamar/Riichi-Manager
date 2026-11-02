import { useId } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'
import type { PreferenciaTema } from '@/compartilhado/tema/temas'
import packageJson from '../../../../package.json'
import './pagina-regras.css'

const OPCOES_TEMA: { valor: PreferenciaTema; chave: string }[] = [
  { valor: 'claro', chave: 'pages.themeLight' },
  { valor: 'escuro', chave: 'pages.themeVelvet' },
  { valor: 'automatico', chave: 'pages.themeAuto' },
]

/**
 * Aba Regras: preferências de uso do app, em cartões. As regras de mesa da
 * calculadora ficam no menu contextual da Calculadora de Mão.
 */
export default function PaginaRegras() {
  const { t } = useI18n()
  const preferencias = usePreferencias()
  const idTituloTema = useId()

  return (
    <section className="pagina-regras" aria-label={t('menu.rulesShort')}>
      <h2 className="sr-only">{t('menu.rules')}</h2>

      <div
        className="cartao-regras cartao-regras--empilhado"
        role="radiogroup"
        aria-labelledby={idTituloTema}
      >
        <i className="fas fa-moon cartao-regras__icone" aria-hidden="true" />
        <span className="cartao-regras__texto">
          <strong id={idTituloTema}>{t('pages.theme')}</strong>
          <span>{t('pages.themeHelp')}</span>
        </span>
        <div className="segmentos-tema">
          {OPCOES_TEMA.map((opcao) => (
            <label key={opcao.valor} className="segmento-tema">
              <input
                type="radio"
                name="tema"
                value={opcao.valor}
                checked={preferencias.tema === opcao.valor}
                onChange={() => preferencias.alterar('tema', opcao.valor)}
              />
              <span>{t(opcao.chave)}</span>
            </label>
          ))}
        </div>
      </div>

      <CartaoSwitch
        icone="fa-circle-half-stroke"
        titulo={t('pages.highContrast')}
        descricao={t('pages.highContrastHelp')}
        ligado={preferencias.altoContraste}
        aoMudar={(ligado) => preferencias.alterar('altoContraste', ligado)}
      />
      <CartaoSwitch
        icone="fa-compress"
        titulo={t('pages.compactMode')}
        descricao={t('pages.compactModeHelp')}
        ligado={preferencias.modoCompacto}
        aoMudar={(ligado) => preferencias.alterar('modoCompacto', ligado)}
      />
      <CartaoSwitch
        icone="fa-hand-pointer"
        titulo={t('pages.largeTouchTargets')}
        descricao={t('pages.largeTouchTargetsHelp')}
        ligado={preferencias.toqueAmpliado}
        aoMudar={(ligado) => preferencias.alterar('toqueAmpliado', ligado)}
      />

      <div className="sobre-mojoca">
        <h3>{t('pages.aboutTitle')}</h3>
        <p>{t('pages.aboutText')}</p>
        <p className="sobre-mojoca__versao">
          {t('pages.versionLine', { version: packageJson.version })}
        </p>
        <a href="https://github.com/lucaslamar/Riichi-Manager" target="_blank" rel="noreferrer">
          <i className="fab fa-github" aria-hidden="true" /> GitHub
        </a>
        <a href="https://github.com/lucaslamar/Riichi-Manager/issues/new" target="_blank" rel="noreferrer">
          <i className="fas fa-bug" aria-hidden="true" /> {t('pages.reportIssue')}
        </a>
      </div>
    </section>
  )
}

/**
 * Cartão inteiro como interruptor: `button` com `role="switch"`, então Espaço e
 * Enter alternam pelo teclado sem código extra.
 */
function CartaoSwitch({
  icone,
  titulo,
  descricao,
  ligado,
  aoMudar,
}: {
  icone: string
  titulo: string
  descricao: string
  ligado: boolean
  aoMudar: (ligado: boolean) => void
}) {
  const idTitulo = useId()
  const idDescricao = useId()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-labelledby={idTitulo}
      aria-describedby={idDescricao}
      className="cartao-regras cartao-regras--switch"
      onClick={() => aoMudar(!ligado)}
    >
      <i className={`fas ${icone} cartao-regras__icone`} aria-hidden="true" />
      <span className="cartao-regras__texto">
        <strong id={idTitulo}>{titulo}</strong>
        <span id={idDescricao}>{descricao}</span>
      </span>
      <span className="interruptor" aria-hidden="true" />
    </button>
  )
}
