import { useCallback, useEffect, useMemo, useState } from 'react'
import Cabecalho from '@/compartilhado/interface/layout/Cabecalho'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { ROTULOS_IDIOMA } from '@/compartilhado/i18n/idiomas'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import { ContextoAprender } from '@/dominios/aprender-a-jogar/interface/ContextoAprender'
import GuiaAprender from '@/dominios/aprender-a-jogar/interface/GuiaAprender'
import packageJson from '../../package.json'

export type TelaPrincipal =
  | 'calculadora'
  | 'calculadoraRapida'
  | 'sorteadorVentos'
  | 'regras'
  | 'sobre'

/**
 * Ordem das telas ao deslizar o dedo: a barra inferior, com a Han e Fu antes
 * da Mão. 'aprender' é o guia Aprender a jogar, que abre por cima em vez de
 * trocar de tela.
 */
const ORDEM_DESLIZE: (TelaPrincipal | 'aprender')[] = [
  'calculadoraRapida',
  'calculadora',
  'sorteadorVentos',
  'aprender',
  'regras',
]

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

  // Deslizar segue a ordem da barra inferior, com a Han e Fu à esquerda da
  // Calculadora de Mão. Dedo para a esquerda vai para a tela seguinte e para a
  // direita volta para a anterior. Os gestos da Calculadora de Mão ficam na
  // própria página (a finalização tem um caso a mais).
  const indiceTela = ORDEM_DESLIZE.indexOf(tela)
  const telaAnterior = indiceTela > 0 ? ORDEM_DESLIZE[indiceTela - 1] : undefined
  // Depois de Regras a fila recomeça na Calculadora de Mão (a Han e Fu fica
  // fora do círculo: só se chega nela deslizando para a direita na Mão).
  const proximaTela = indiceTela >= 0 ? (ORDEM_DESLIZE[indiceTela + 1] ?? 'calculadora') : undefined
  // A Han e Fu é ponta da fila e tem a seta de voltar: deslizar no sentido da
  // seta (dedo para a direita) também volta para a Calculadora de Mão.
  const voltarDaHanFu = tela === 'calculadoraRapida' ? (voltar ?? (() => navegar('calculadora'))) : undefined

  // Guia Aprender a jogar: tela cheia por cima de tudo (até de uma modal, quando
  // aberto pelo "Ver em Aprender a jogar" de uma ajuda). `chave` remonta o guia
  // a cada abertura, já na página do destino.
  const [guia, setGuia] = useState<{ destino?: string; chave: number } | null>(null)
  const abrirGuia = useCallback((destino?: string) => {
    setGuia((atual) => ({ destino, chave: (atual?.chave ?? 0) + 1 }))
  }, [])
  const aprender = useMemo(() => ({ abrir: abrirGuia, aberto: !!guia }), [abrirGuia, guia])

  // Deslizar até o Aprender abre o guia por cima; ao fechar, a pessoa volta
  // para a tela de onde deslizou.
  const irPara = (destino: TelaPrincipal | 'aprender') =>
    destino === 'aprender' ? abrirGuia() : navegar(destino)
  useDeslizeHorizontal({
    ativo: indiceTela >= 0 && tela !== 'calculadora',
    aoDeslizarDireita: voltarDaHanFu ?? (telaAnterior && (() => irPara(telaAnterior))),
    aoDeslizarEsquerda: proximaTela && (() => irPara(proximaTela)),
  })

  return (
    <ContextoAprender.Provider value={aprender}>
      <Cabecalho
        telaAtual={tela}
        aoNavegar={navegar}
        aoVoltar={voltar}
        aoAbrirAprender={() => abrirGuia()}
      />

      <main className="conteudo-principal">
        {/* Sempre montada: a mão em andamento continua lá ao voltar de outra tela. */}
        <PaginaCalculadoraMao
          aoAbrirCalculadoraRapida={abrirCalculadoraRapida}
          aoIrParaProximaTela={() => navegar('sorteadorVentos')}
          visivel={tela === 'calculadora'}
        />
        {tela === 'calculadoraRapida' && <PaginaCalculadoraHanFu />}
        {tela === 'sorteadorVentos' && <PaginaSorteadorVentos />}
        {tela === 'regras' && <PaginaRegrasConfiguracoes />}
        {tela === 'sobre' && <PaginaSobre />}
      </main>

      {guia && (
        <GuiaAprender
          key={guia.chave}
          destino={guia.destino}
          aoFechar={() => setGuia(null)}
          aoAbrirCalculadora={() => {
            setGuia(null)
            navegar('calculadora')
          }}
        />
      )}
    </ContextoAprender.Provider>
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
      <section className="opcao-configuracao-usuario" aria-labelledby="titulo-como-funciona-sorteio">
        <div>
          <strong id="titulo-como-funciona-sorteio">{t('windDraw.howItWorksTitle')}</strong>
          <span>{t('windDraw.howItWorksText')}</span>
        </div>
      </section>
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
