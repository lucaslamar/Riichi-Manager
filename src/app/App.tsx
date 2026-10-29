import { useCallback, useState } from 'react'
import Cabecalho from '@/compartilhado/interface/layout/Cabecalho'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import PaginaRegras from '@/dominios/configuracoes/interface/PaginaRegras'
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
  'aprender',
  'sorteadorVentos',
  'regras',
]

/**
 * Componente raiz da aplicacao. A Calculadora de Mao e a porta de entrada.
 */
export default function App() {
  const [tela, setTela] = useState<TelaPrincipal>('calculadora')
  /** Tela de origem quando a Han e Fu é aberta pelo atalho da Calculadora de Mão. */
  const [telaRetorno, setTelaRetorno] = useState<TelaPrincipal | null>(null)

  // Guia Aprender a jogar: tela cheia por cima de tudo. `chave` remonta o guia
  // a cada abertura, sempre na capa.
  const [guia, setGuia] = useState<{ chave: number } | null>(null)
  const abrirGuia = useCallback(() => {
    setGuia((atual) => ({ chave: (atual?.chave ?? 0) + 1 }))
  }, [])

  // Ir para uma tela fecha o guia: na capa dele a barra inferior fica à vista.
  const navegar = useCallback((proxima: TelaPrincipal) => {
    setGuia(null)
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
    aoDeslizarDireita: voltarDaHanFu ?? (telaAnterior && (() => irPara(telaAnterior))),
    aoDeslizarEsquerda: proximaTela && (() => irPara(proximaTela)),
  })

  return (
    <>
      <Cabecalho
        telaAtual={guia ? 'aprender' : tela}
        aoNavegar={navegar}
        aoVoltar={voltar}
        aoAbrirAprender={() => abrirGuia()}
      />

      <main className="conteudo-principal">
        {/* Sempre montada: a mão em andamento continua lá ao voltar de outra tela. */}
        <PaginaCalculadoraMao
          aoAbrirCalculadoraRapida={abrirCalculadoraRapida}
          aoIrParaProximaTela={() => abrirGuia()}
          visivel={tela === 'calculadora'}
        />
        {tela === 'calculadoraRapida' && <PaginaCalculadoraHanFu />}
        {tela === 'sorteadorVentos' && <PaginaSorteadorVentos />}
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
