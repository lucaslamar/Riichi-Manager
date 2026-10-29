import { useId } from 'react'
import { useI18n, type IdiomaSuportado } from '@/compartilhado/i18n/I18nProvider'
import { ROTULOS_IDIOMA } from '@/compartilhado/i18n/idiomas'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'
import type { PreferenciaTema } from '@/compartilhado/tema/temas'
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
  const { t, idioma, idiomas, alterarIdioma } = useI18n()
  const preferencias = usePreferencias()
  const idSelectIdioma = useId()
  const idTituloTema = useId()

  return (
    <section className="pagina-regras" aria-label={t('menu.rulesShort')}>
      <h2 className="sr-only">{t('menu.rules')}</h2>

      <div className="cartao-regras">
        <i className="fas fa-globe cartao-regras__icone" aria-hidden="true" />
        <label className="cartao-regras__texto" htmlFor={idSelectIdioma}>
          <strong>{t('menu.language')}</strong>
        </label>
        <select
          id={idSelectIdioma}
          className="cartao-regras__select"
          value={idioma}
          onChange={(evento) => alterarIdioma(evento.target.value as IdiomaSuportado)}
        >
          {idiomas.map((opcao) => (
            <option key={opcao} value={opcao} lang={opcao}>
              {ROTULOS_IDIOMA[opcao]}
            </option>
          ))}
        </select>
      </div>

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
