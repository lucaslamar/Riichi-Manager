import { lazy, Suspense, useCallback, useState } from 'react'
import Cabecalho from '@/compartilhado/interface/layout/Cabecalho'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import PaginaRegras from '@/dominios/configuracoes/interface/PaginaRegras'
import GuiaAprender from '@/dominios/aprender-a-jogar/interface/GuiaAprender'
import packageJson from '../../package.json'

const PaginaCenterpiece = lazy(
  () => import('@/dominios/centerpiece/interface/paginas/PaginaCenterpiece'),
)
const PaginaTorneio = lazy(() => import('@/dominios/torneio-fast/interface/paginas/PaginaTorneio'))
const PaginaJogadores = lazy(() => import('@/dominios/jogadores/interface/paginas/PaginaJogadores'))
const DemoSeletorJogador = lazy(
  () => import('@/dominios/jogadores/interface/paginas/DemoSeletorJogador'),
)
const DemoConfigMesa = lazy(() => import('@/dominios/centerpiece/interface/paginas/DemoConfigMesa'))

export type TelaPrincipal =
  | 'calculadora'
  | 'calculadoraRapida'
  | 'sorteadorVentos'
  | 'centerpiece'
  | 'torneio'
  | 'jogadores'
  | 'seletor'
  | 'configmesa'
  | 'regras'
  | 'sobre'

/**
 * Caminho temporário de teste enquanto os módulos não voltam ao menu: só no
 * servidor de desenvolvimento, com `?modulo=centerpiece`, `torneio`, `jogadores`,
 * `seletor` ou `configmesa`.
 */
function telaInicial(): TelaPrincipal {
  if (import.meta.env.DEV) {
    const modulo = new URLSearchParams(window.location.search).get('modulo')
    if (
      modulo === 'centerpiece' ||
      modulo === 'torneio' ||
      modulo === 'jogadores' ||
      modulo === 'seletor' ||
      modulo === 'configmesa'
    )
      return modulo
  }
  return 'calculadora'
}

/**
 * Ordem das telas ao deslizar o dedo: a da barra inferior. 'aprender' é o guia
 * Aprender a jogar, que abre por cima em vez de trocar de tela.
 */
const ORDEM_DESLIZE: (TelaPrincipal | 'aprender')[] = [
  'calculadora',
  'calculadoraRapida',
  'sorteadorVentos',
  'aprender',
  'regras',
]

/**
 * Componente raiz da aplicacao. A Calculadora de Mao e a porta de entrada.
 */
export default function App() {
  const [tela, setTela] = useState<TelaPrincipal>(telaInicial)

  // Guia Aprender a jogar: tela cheia por cima de tudo. `chave` remonta o guia
  // a cada abertura, sempre na capa.
  const [guia, setGuia] = useState<{ chave: number } | null>(null)
  const abrirGuia = useCallback(() => {
    setGuia((atual) => ({ chave: (atual?.chave ?? 0) + 1 }))
  }, [])

  // Ir para uma tela fecha o guia: na capa dele a barra inferior fica à vista.
  const navegar = useCallback((proxima: TelaPrincipal) => {
    setGuia(null)
    setTela(proxima)
  }, [])

  // Deslizar segue a ordem da barra inferior. Dedo para a esquerda vai para a
  // tela seguinte e para a direita volta para a anterior. Os gestos da
  // Calculadora de Mão ficam na própria página (a finalização tem um caso a mais).
  const indiceTela = ORDEM_DESLIZE.indexOf(tela)
  const telaAnterior = indiceTela > 0 ? ORDEM_DESLIZE[indiceTela - 1] : undefined
  // Depois de Regras a fila recomeça na Calculadora de Mão.
  const proximaTela = indiceTela >= 0 ? (ORDEM_DESLIZE[indiceTela + 1] ?? 'calculadora') : undefined

  // Deslizar até o Aprender abre o guia por cima; ao fechar, a pessoa volta
  // para a tela de onde deslizou.
  const irPara = (destino: TelaPrincipal | 'aprender') =>
    destino === 'aprender' ? abrirGuia() : navegar(destino)
  // Na capa do guia, deslizar vai para a tela vizinha do Aprender na barra.
  const indiceAprender = ORDEM_DESLIZE.indexOf('aprender')
  const sairDoGuia = (passo: 1 | -1) => {
    const destino = ORDEM_DESLIZE[indiceAprender + passo] ?? 'calculadora'
    if (destino !== 'aprender') navegar(destino)
  }
  useDeslizeHorizontal({
    ativo: indiceTela >= 0 && tela !== 'calculadora',
    aoDeslizarDireita: telaAnterior && (() => irPara(telaAnterior)),
    aoDeslizarEsquerda: proximaTela && (() => irPara(proximaTela)),
  })

  return (
    <>
      <Cabecalho
        telaAtual={guia ? 'aprender' : tela}
        aoNavegar={navegar}
        aoAbrirAprender={() => abrirGuia()}
      />

      <main className="conteudo-principal">
        {/* Sempre montada: a mão em andamento continua lá ao voltar de outra tela. */}
        <PaginaCalculadoraMao
          aoIrParaProximaTela={() => navegar('calculadoraRapida')}
          visivel={tela === 'calculadora'}
        />
        {tela === 'calculadoraRapida' && <PaginaCalculadoraHanFu />}
        {tela === 'sorteadorVentos' && <PaginaSorteadorVentos />}
        <Suspense fallback={null}>
          {tela === 'centerpiece' && <PaginaCenterpiece />}
          {tela === 'torneio' && <PaginaTorneio aoVoltar={() => navegar('calculadora')} />}
          {tela === 'jogadores' && <PaginaJogadores />}
          {tela === 'seletor' && <DemoSeletorJogador />}
          {tela === 'configmesa' && <DemoConfigMesa />}
        </Suspense>
        {tela === 'regras' && <PaginaRegras />}
        {tela === 'sobre' && <PaginaSobre />}
      </main>

      {guia && (
        <GuiaAprender
          key={guia.chave}
          aoFechar={() => setGuia(null)}
          aoAbrirCalculadora={() => navegar('calculadora')}
          aoTrocarTela={sairDoGuia}
        />
      )}
    </>
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
