import { useCallback, useEffect, useState } from 'react'
import {
  carregarTorneio,
  salvarTorneio,
  criarTorneioVazio,
} from '@/dominios/torneio-fast/persistencia/armazenamento'
import type { EstadoTorneio } from '@/dominios/torneio-fast/logica/tipos'
import {
  segundosRestantesBase,
  sincronizarTimerExpirado,
} from '@/dominios/torneio-fast/logica/acoes'
import Cabecalho from '@/compartilhado/interface/layout/Cabecalho'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { ROTULOS_IDIOMA } from '@/compartilhado/i18n/idiomas'
import {
  ConfiguracaoTorneio,
  RankingGeral,
  TimerRodada,
  PainelQualidade,
  GradeRodadas,
} from '@/dominios/torneio-fast/interface/componentes'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaSorteadorVentos from '@/dominios/sorteador-ventos/interface/paginas/PaginaSorteadorVentos'
import packageJson from '../../package.json'

export type TelaPrincipal =
  | 'calculadora'
  | 'calculadoraRapida'
  | 'sorteadorVentos'
  | 'configuracaoTorneio'
  | 'regras'
  | 'sobre'

function torneioAtivo(torneioAtual: EstadoTorneio): boolean {
  return torneioAtual.jogadores.length > 0 && torneioAtual.grade.length > 0
}

/**
 * Componente raiz da aplicacao.
 *
 * A calculadora e a porta de entrada quando nao ha torneio salvo em andamento.
 * O Torneio Fast continua preservado no mesmo estado global/localStorage, mas
 * fica acessivel pelo menu global em vez de dominar o primeiro acesso.
 */
export default function App() {
  const { t } = useI18n()
  const [torneio, setTorneioInterno] = useState<EstadoTorneio>(carregarTorneio)
  const [tela, setTela] = useState<TelaPrincipal>(() =>
    torneioAtivo(torneio) ? 'configuracaoTorneio' : 'calculadora',
  )
  const ativo = torneioAtivo(torneio)

  const definirTorneio = useCallback((proximo: EstadoTorneio) => {
    setTorneioInterno(proximo)
    salvarTorneio(proximo)
  }, [])

  const atualizarTorneio = useCallback(
    (transformar: (torneioAtual: EstadoTorneio) => EstadoTorneio) => {
      setTorneioInterno((anterior) => {
        const proximo = transformar(anterior)
        salvarTorneio(proximo)
        return proximo
      })
    },
    [],
  )

  const reiniciarTorneio = useCallback(() => {
    const vazio = criarTorneioVazio()
    setTorneioInterno(vazio)
    salvarTorneio(vazio)
    setTela('configuracaoTorneio')
  }, [])

  const aoIniciarTorneio = useCallback(
    (torneioGerado: EstadoTorneio) => {
      definirTorneio(torneioGerado)
      setTela('configuracaoTorneio')
    },
    [definirTorneio],
  )

  const exportarPdf = useCallback(() => {
    const janela = window as any
    const jsPDF = janela.jspdf?.jsPDF
    if (!jsPDF) {
      alert('jsPDF nao carregou. Verifique a conexao.')
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`Ranking - ${t('global.appName')}`, 14, 20)
    doc.setFontSize(11)

    const linhas = Object.entries(torneio.classificacao)
      .sort(([, pontosA], [, pontosB]) => pontosB - pontosA)
      .map(([jogador, pontos], indice) => [
        `${indice + 1}o`,
        jogador,
        `${pontos > 0 ? '+' : ''}${pontos.toFixed(1)}`,
      ])

    doc.autoTable({ head: [['Pos.', 'Jogador', 'PT']], body: linhas, startY: 30 })
    doc.save('ranking-riichi.pdf')
  }, [torneio, t])

  return (
    <>
      <Cabecalho telaAtual={tela} torneioAtivo={ativo} aoNavegar={setTela} />

      <main className="conteudo-principal">
        {tela === 'calculadora' && <PaginaCalculadoraMao />}
        {tela === 'calculadoraRapida' && <PaginaCalculadoraHanFu />}
        {tela === 'sorteadorVentos' && <PaginaSorteadorVentos />}

        {tela === 'configuracaoTorneio' &&
          (ativo ? (
            <PainelTorneioAtivo
              torneio={torneio}
              atualizarTorneio={atualizarTorneio}
              reiniciarTorneio={reiniciarTorneio}
              exportarPdf={exportarPdf}
            />
          ) : (
            <ConfiguracaoTorneio
              aoIniciar={aoIniciarTorneio}
              aoVoltar={() => setTela('calculadora')}
            />
          ))}

        {tela === 'regras' && <PaginaRegrasConfiguracoes />}
        {tela === 'sobre' && <PaginaSobre />}
      </main>
    </>
  )
}

function PainelTorneioAtivo({
  torneio,
  atualizarTorneio,
  reiniciarTorneio,
  exportarPdf,
}: {
  torneio: EstadoTorneio
  atualizarTorneio: (transformar: (torneioAtual: EstadoTorneio) => EstadoTorneio) => void
  reiniciarTorneio: () => void
  exportarPdf: () => void
}) {
  const [agora, setAgora] = useState(Date.now)

  useEffect(() => {
    setAgora(Date.now())
    if (!torneio.timer.rodando) return

    const intervalo = window.setInterval(() => {
      const proximoAgora = Date.now()
      setAgora(proximoAgora)

      if (segundosRestantesBase(torneio.timer, proximoAgora) === 0) {
        atualizarTorneio(sincronizarTimerExpirado)
      }
    }, 500)

    return () => window.clearInterval(intervalo)
  }, [torneio.timer, atualizarTorneio])

  return (
    <div className="torneio-fast">
      <RankingGeral torneio={torneio} aoReiniciar={reiniciarTorneio} aoExportarPdf={exportarPdf} />
      <TimerRodada torneio={torneio} atualizarTorneio={atualizarTorneio} agora={agora} />
      <PainelQualidade torneio={torneio} atualizarTorneio={atualizarTorneio} />
      <GradeRodadas torneio={torneio} atualizarTorneio={atualizarTorneio} agora={agora} />
    </div>
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
