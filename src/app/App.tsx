import { useCallback, useEffect, useState } from 'react'
import Cabecalho from '@/compartilhado/interface/layout/Cabecalho'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { ROTULOS_IDIOMA } from '@/compartilhado/i18n/idiomas'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import packageJson from '../../package.json'

export type TelaPrincipal =
  | 'calculadora'
  | 'calculadoraRapida'
  | 'sorteadorVentos'
  | 'regras'
  | 'sobre'

/**
 * Componente raiz da aplicacao. A Calculadora de Mao e a porta de entrada.
 */
export default function App() {
  const [tela, setTela] = useState<TelaPrincipal>('calculadora')
  /** Tela de origem quando a Han e Fu é aberta pelo atalho da Calculadora de Mão. */
  const [telaRetorno, setTelaRetorno] = useState<TelaPrincipal | null>(null)

  const navegar = useCallback((proxima: TelaPrincipal) => {
    setTelaRetorno(null)
    setTela(proxima)
  }, [])

  const abrirCalculadoraRapida = useCallback(() => {
    setTelaRetorno('calculadora')
    setTela('calculadoraRapida')
  }, [])

  const voltar =
    telaRetorno && tela === 'calculadoraRapida' ? () => navegar(telaRetorno) : undefined

  return (
    <>
      <Cabecalho telaAtual={tela} aoNavegar={navegar} aoVoltar={voltar} />

      <main className="conteudo-principal">
        {tela === 'calculadora' && (
          <PaginaCalculadoraMao aoAbrirCalculadoraRapida={abrirCalculadoraRapida} />
        )}
        {tela === 'calculadoraRapida' && <PaginaCalculadoraHanFu />}
        {tela === 'sorteadorVentos' && <PaginaSorteadorVentos />}
        {tela === 'regras' && <PaginaRegrasConfiguracoes />}
        {tela === 'sobre' && <PaginaSobre />}
      </main>
    </>
  )
}

function PaginaRegrasConfiguracoes() {
  const { t, idioma, idiomas, alterarIdioma } = useI18n()
  const [altoContraste, setAltoContraste] = useState(
    () => window.localStorage.getItem('riichi-manager-alto-contraste') === 'true',
  )
  const [modoCompacto, setModoCompacto] = useState(
    () => window.localStorage.getItem('riichi-manager-modo-compacto') === 'true',
  )
  const [toqueAmpliado, setToqueAmpliado] = useState(
    () => window.localStorage.getItem('riichi-manager-toque-ampliado') === 'true',
  )

  useEffect(() => {
    document.body.classList.toggle('alto-contraste', altoContraste)
    document.body.classList.toggle('modo-compacto', modoCompacto)
    document.body.classList.toggle('toque-ampliado', toqueAmpliado)
    window.localStorage.setItem('riichi-manager-alto-contraste', String(altoContraste))
    window.localStorage.setItem('riichi-manager-modo-compacto', String(modoCompacto))
    window.localStorage.setItem('riichi-manager-toque-ampliado', String(toqueAmpliado))
  }, [altoContraste, modoCompacto, toqueAmpliado])

  return (
    <section className="card pagina-estatica">
      <div className="cabecalho-secao">
        <i className="fas fa-sliders-h icone-secao" aria-hidden="true" />
        <div>
          <h2>{t('pages.rulesTitle')}</h2>
          <p className="subtitulo-secao">{t('pages.rulesText')}</p>
        </div>
      </div>
      <div className="grupo-configuracoes-usuario">
        <label className="seletor-idioma">
          <span>
            <i className="fas fa-globe" aria-hidden="true" />
            {t('menu.language')}
          </span>
          <select
            value={idioma}
            aria-label={t('menu.language')}
            onChange={(evento) => alterarIdioma(evento.target.value as typeof idioma)}
          >
            {idiomas.map((opcaoIdioma) => (
              <option key={opcaoIdioma} value={opcaoIdioma}>
                {ROTULOS_IDIOMA[opcaoIdioma]}
              </option>
            ))}
          </select>
        </label>
        <OpcaoPreferencia
          titulo={t('pages.highContrast')}
          descricao={t('pages.highContrastHelp')}
          marcado={altoContraste}
          aoMudar={setAltoContraste}
        />
        <OpcaoPreferencia
          titulo={t('pages.compactMode')}
          descricao={t('pages.compactModeHelp')}
          marcado={modoCompacto}
          aoMudar={setModoCompacto}
        />
        <OpcaoPreferencia
          titulo={t('pages.largeTouchTargets')}
          descricao={t('pages.largeTouchTargetsHelp')}
          marcado={toqueAmpliado}
          aoMudar={setToqueAmpliado}
        />
      </div>
    </section>
  )
}

function PaginaSobre() {
  const { t } = useI18n()
  const linkApoio = ''

  return (
    <section className="card pagina-estatica">
      <div className="cabecalho-secao">
        <i className="fas fa-info-circle icone-secao" aria-hidden="true" />
        <div>
          <h2>{t('pages.aboutTitle')}</h2>
          <p className="subtitulo-secao">{t('pages.aboutText')}</p>
        </div>
      </div>
      <div className="grupo-sobre">
        <span className="chip-sobre">{t('pages.version', { version: packageJson.version })}</span>
        <span className="chip-sobre">{t('pages.author')}</span>
      </div>
      <div className="acoes-sobre">
        <a
          className="btn-contorno"
          href="https://github.com/lucaslamar/Riichi-Manager"
          target="_blank"
          rel="noreferrer"
        >
          <i className="fab fa-github" aria-hidden="true" /> GitHub
        </a>
        <a
          className="btn-contorno"
          href="https://github.com/lucaslamar/Riichi-Manager/issues/new"
          target="_blank"
          rel="noreferrer"
        >
          <i className="fas fa-bug" aria-hidden="true" /> {t('pages.reportIssue')}
        </a>
        {linkApoio && (
          <a className="btn-primario" href={linkApoio} target="_blank" rel="noreferrer">
            <i className="fas fa-mug-hot" aria-hidden="true" /> {t('pages.supportProject')}
          </a>
        )}
      </div>
    </section>
  )
}

function OpcaoPreferencia({
  titulo,
  descricao,
  marcado,
  aoMudar,
}: {
  titulo: string
  descricao: string
  marcado: boolean
  aoMudar: (marcado: boolean) => void
}) {
  return (
    <label className="opcao-configuracao-usuario">
      <span>
        <strong>{titulo}</strong>
        <span>{descricao}</span>
      </span>
      <input
        type="checkbox"
        checked={marcado}
        onChange={(evento) => aoMudar(evento.target.checked)}
      />
    </label>
  )
}
