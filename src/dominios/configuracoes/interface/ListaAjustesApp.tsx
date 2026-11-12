import { useId, useState, type ReactNode } from 'react'
import { entrarTelaCheia, suportaTelaCheia } from '@/compartilhado/adaptadores/telaCheia'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { IDIOMAS_SUPORTADOS, ROTULOS_IDIOMA, type IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { usePreferencias, type PreferenciaPedras } from '@/compartilhado/preferencias/PreferenciasProvider'
import type { PreferenciaTema } from '@/compartilhado/tema/temas'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { CHAVE_LIMITE_DETALHES } from '@/services/storage/armazenamentoDados'
import { lerLimiteDetalhes } from '@/services/storage/partidaArmazenada'
import './pagina-regras.css'

const OPCOES_TEMA: { valor: PreferenciaTema; chave: string }[] = [
  { valor: 'escuro', chave: 'pages.themeVelvet' },
  { valor: 'claro', chave: 'pages.themeBlue' },
  { valor: 'automatico', chave: 'pages.themeAuto' },
]

/** Quantas partidas finalizadas guardam o mão a mão; as mais antigas ficam só com o resultado. */
const OPCOES_LIMITE_DETALHES = [50, 100, 250, 500] as const

const OPCOES_PEDRAS: { valor: PreferenciaPedras; chave: string }[] = [
  { valor: 'brancas', chave: 'pages.tilesWhite' },
  { valor: 'pretas', chave: 'pages.tilesBlack' },
  { valor: 'automatico', chave: 'pages.themeAuto' },
]

/**
 * Cartões dos ajustes do app (Idioma, Tema, Pedras, acessibilidade e tela), iguais
 * na tela Ajustes e na aba "Ajustes do app" das Configurações. Leem e gravam nas
 * preferências globais, então valem na hora nos dois lugares.
 */
export default function ListaAjustesApp({ antesDaTela }: {
  /** Cartão a mais antes dos de tela cheia (a tela Ajustes põe o Instalar ali). */
  antesDaTela?: ReactNode
} = {}) {
  const { t, idioma, alterarIdioma } = useI18n()
  const preferencias = usePreferencias()
  const idTituloIdioma = useId()
  const idTituloTema = useId()
  const idTituloPedras = useId()
  const nomeTema = useId()
  const nomePedras = useId()
  const temTelaCheia = suportaTelaCheia()

  return (
    <>
      <div className="cartao-regras cartao-regras--empilhado">
        <i className="fas fa-globe cartao-regras__icone" aria-hidden="true" />
        <span className="cartao-regras__texto">
          <strong id={idTituloIdioma}>{t('menu.language')}</strong>
          <span>{t('pages.languageHelp')}</span>
        </span>
        <select
          className="seletor-idioma-cartao"
          aria-labelledby={idTituloIdioma}
          value={idioma}
          onChange={(evento) => alterarIdioma(evento.target.value as IdiomaSuportado)}
        >
          {IDIOMAS_SUPORTADOS.map((opcao) => (
            <option key={opcao} value={opcao}>
              {ROTULOS_IDIOMA[opcao]}
            </option>
          ))}
        </select>
      </div>

      <div className="cartao-regras cartao-regras--empilhado" role="radiogroup" aria-labelledby={idTituloTema}>
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
                name={nomeTema}
                value={opcao.valor}
                checked={preferencias.tema === opcao.valor}
                onChange={() => preferencias.alterar('tema', opcao.valor)}
              />
              <span>{t(opcao.chave)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cor das pedras: automático = pretas no claro (contraste) e brancas no escuro. */}
      <div className="cartao-regras cartao-regras--empilhado" role="radiogroup" aria-labelledby={idTituloPedras}>
        <i className="fas fa-chess-board cartao-regras__icone" aria-hidden="true" />
        <span className="cartao-regras__texto">
          <strong id={idTituloPedras}>{t('pages.tiles')}</strong>
          <span>{t('pages.tilesHelp')}</span>
        </span>
        <div className="segmentos-tema">
          {OPCOES_PEDRAS.map((opcao) => (
            <label key={opcao.valor} className="segmento-tema">
              <input
                type="radio"
                name={nomePedras}
                value={opcao.valor}
                checked={preferencias.pedras === opcao.valor}
                onChange={() => preferencias.alterar('pedras', opcao.valor)}
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

      {antesDaTela}
      {temTelaCheia && (
        <>
          <CartaoAcao
            icone="fa-expand"
            titulo={t('pages.fullscreenTitle')}
            descricao={t('pages.fullscreenHelp')}
            aoTocar={entrarTelaCheia}
          />
          <CartaoSwitch
            icone="fa-up-right-and-down-left-from-center"
            titulo={t('pages.fullscreenOnTable')}
            descricao={t('pages.fullscreenOnTableHelp')}
            ligado={preferencias.telaCheiaMesa}
            aoMudar={(ligado) => preferencias.alterar('telaCheiaMesa', ligado)}
          />
        </>
      )}
      {'wakeLock' in navigator && (
        <CartaoSwitch
          icone="fa-sun"
          titulo={t('pages.keepAwake')}
          descricao={t('pages.keepAwakeHelp')}
          ligado={preferencias.telaAcesaMesa}
          aoMudar={(ligado) => preferencias.alterar('telaAcesaMesa', ligado)}
        />
      )}
      <CartaoLimiteDetalhes />
    </>
  )
}

/**
 * "Guardar detalhes das últimas N partidas": o mão a mão das mais antigas sai
 * para poupar espaço; o resultado delas fica para sempre no ranking e no histórico.
 */
function CartaoLimiteDetalhes() {
  const { t, numero } = useI18n()
  const idTitulo = useId()
  const nome = useId()
  const [limite, setLimite] = useState(() => lerLimiteDetalhes(armazenamentoLocal.ler(CHAVE_LIMITE_DETALHES)))
  const escolher = (valor: number) => {
    setLimite(valor)
    armazenamentoLocal.gravar(CHAVE_LIMITE_DETALHES, String(valor))
  }
  return (
    <div className="cartao-regras cartao-regras--empilhado" role="radiogroup" aria-labelledby={idTitulo}>
      <i className="fas fa-box-archive cartao-regras__icone" aria-hidden="true" />
      <span className="cartao-regras__texto">
        <strong id={idTitulo}>{t('pages.matchDetails')}</strong>
        <span>{t('pages.matchDetailsHelp')}</span>
      </span>
      <div className="segmentos-tema">
        {OPCOES_LIMITE_DETALHES.map((valor) => (
          <label key={valor} className="segmento-tema">
            <input type="radio" name={nome} value={valor} checked={limite === valor} onChange={() => escolher(valor)} />
            <span>{numero(valor)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

/** Cartão inteiro como botão, para o que acontece na hora. */
export function CartaoAcao({
  icone,
  titulo,
  descricao,
  aoTocar,
}: {
  icone: string
  titulo: string
  descricao: string
  aoTocar: () => void
}) {
  return (
    <button type="button" className="cartao-regras cartao-regras--switch" onClick={aoTocar}>
      <i className={`fas ${icone} cartao-regras__icone`} aria-hidden="true" />
      <span className="cartao-regras__texto">
        <strong>{titulo}</strong>
        <span>{descricao}</span>
      </span>
    </button>
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
