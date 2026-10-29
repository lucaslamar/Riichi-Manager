import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { gerarNotacao, interpretarNotacao, ordenarPedras } from '../../../logica/mao'
import { codigoBase, proximaDoraIndicada } from '../../constantes'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { AcoesConstrutorMao } from './AcoesConstrutorMao'
import { DescartesMao } from './DescartesMao'
import MahjongNotationInput from './MahjongNotationInput'
import { MaoAtual } from './MaoAtual'
import { TecladoPedras } from './TecladoPedras'

type ModoEntradaMao = 'pecas' | 'notacao'

const CHAVE_MODO_ENTRADA = 'riichi-manager-calculadora-entrada'

function lerModoEntrada(): ModoEntradaMao {
  try {
    return window.localStorage.getItem(CHAVE_MODO_ENTRADA) === 'notacao' ? 'notacao' : 'pecas'
  } catch {
    return 'pecas'
  }
}

function salvarModoEntrada(modo: ModoEntradaMao) {
  try {
    window.localStorage.setItem(CHAVE_MODO_ENTRADA, modo)
  } catch {
    // Navegação privada ou armazenamento bloqueado: a escolha vale só nesta sessão.
  }
}

/** Mão fechada que a notação descreve; uma batida em meld devolve as pedras consumidas. */
function pedrasParaNotacao(mao: EstadoCalculadoraMao['mao']) {
  return mao.agariMeld ? [...mao.pedras, ...mao.agariMeld.pedrasConsumidasMao] : mao.pedras
}

interface PropsConstrutorMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
  contexto?: 'montagem' | 'finalizacao'
  aoAbrirRegras?: () => void
  acoesCabecalho?: ReactNode
  aoCalcularDireto?: () => void
  aoAbrirCalculadoraRapida?: () => void
}

/**
 * Área para montar a mão completa pedra por pedra.
 *
 * Como ler este componente:
 * - aqui ficam apenas estados de interface local, como sticky e menu mobile;
 * - dados derivados leves são preparados e repassados para subcomponentes;
 * - a edição real da mão continua no hook `useCalculadoraMao`.
 */
export default function ConstrutorMao({
  estado,
  embutido = false,
  contexto = 'montagem',
  aoAbrirRegras,
  acoesCabecalho,
  aoCalcularDireto,
  aoAbrirCalculadoraRapida,
}: PropsConstrutorMao) {
  const { t } = useI18n()
  const sentinelaStickyRef = useRef<HTMLDivElement | null>(null)
  const [maoEditorGrudado, setMaoEditorGrudado] = useState(false)
  const [menuAcoesMaoAberto, setMenuAcoesMaoAberto] = useState(false)
  const {
    mao,
    acaoPendente,
    configuracao,
    totalPedras,
    slotsUsados,
    maoCompleta,
    podeSelecionarPedra,
    adicionarPedra,
    adicionarPedraDaMao,
    removerPedra,
    removerMeld,
    removerDescarte,
    limpar,
    alternarAcao,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    resultadoMaoInvalida,
    esperasPossiveis,
    maoProntaParaFinalizar,
    maoProntaParaEscolherBatida,
    selecionandoPedraAgari,
    escolhaChiiPendente,
    mensagemFinalizacao,
    candidatasPedraAgari,
    fluxoOpcoes,
    finalizarMao,
    alternarSelecaoPedraAgari,
    escolherPedraAgariMao,
    escolherPedraAgariMeld,
    escolherPedraAgariPorCodigo,
    escolherChiiPendente,
    substituirPedrasMao,
  } = estado

  const [modoEntrada, setModoEntrada] = useState<ModoEntradaMao>(lerModoEntrada)
  const [textoNotacao, setTextoNotacao] = useState(() =>
    gerarNotacao(pedrasParaNotacao(mao), mao.agariMeld ? -1 : mao.indiceAgari),
  )
  const melds = useMemo(
    () =>
      mao.agariMeld
        ? mao.melds.filter((_meld, indice) => indice !== mao.agariMeld?.indiceMeld)
        : mao.melds,
    [mao.melds, mao.agariMeld],
  )
  const notacao = useMemo(
    () => interpretarNotacao(textoNotacao, { melds, akadora: configuracao.akadora }),
    [textoNotacao, melds, configuracao.akadora],
  )
  const entradaPorNotacao = contexto === 'montagem' && modoEntrada === 'notacao'
  const erroNotacao = entradaPorNotacao ? notacao.erro : null

  const trocarModoEntrada = (modo: ModoEntradaMao) => {
    if (modo === modoEntrada) return
    // Ao entrar na notação, o texto parte do que já está na mão; na volta, a mão já está sincronizada.
    if (modo === 'notacao') {
      setTextoNotacao(gerarNotacao(pedrasParaNotacao(mao), mao.agariMeld ? -1 : mao.indiceAgari))
      estado.setAcaoPendente(null)
    }
    setModoEntrada(modo)
    salvarModoEntrada(modo)
  }

  /** Com erro, a mão mantém a última leitura válida, mas sem batida: nada é calculado. */
  const mudarTextoNotacao = (texto: string) => {
    setTextoNotacao(texto)
    const resultado = interpretarNotacao(texto, { melds, akadora: configuracao.akadora })
    substituirPedrasMao(resultado.erro ? null : resultado.pedras)
  }

  /*
   * Mudanças feitas fora do campo (remover pedra tocando nela, Limpar) reescrevem
   * o texto. Digitar não dispara isto: texto válido deixa a mão igual ao que foi
   * lido, e texto com erro não mexe nas pedras. Só compara as pedras: a ordem
   * digitada e a batida ficam como estão.
   */
  const assinaturaPedrasMao = ordenarPedras([...mao.pedras]).join()
  useEffect(() => {
    if (!entradaPorNotacao) return
    const lidas = ordenarPedras([...notacao.pedras]).join()
    if (lidas === assinaturaPedrasMao) return
    setTextoNotacao(gerarNotacao(mao.pedras, mao.indiceAgari))
    // O texto só acompanha a mão; reagir a `notacao` aqui desfaria o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinaturaPedrasMao, entradaPorNotacao])

  // Chii, pon, kan, dora e descarte escolhem pedras pelo teclado de peças.
  useEffect(() => {
    if (acaoPendente && entradaPorNotacao) {
      setModoEntrada('pecas')
      salvarModoEntrada('pecas')
    }
  }, [acaoPendente, entradaPorNotacao])

  /**
   * Converte indicadores escolhidos em doras reais para destacar o teclado.
   * Quando há dora manual, indicadores visuais são ignorados pelo cálculo.
   */
  const dorasReais = useMemo(
    () =>
      new Set(
        [...mao.dora, ...mao.uradora].map((indicador) =>
          codigoBase(proximaDoraIndicada(indicador)),
        ),
      ),
    [mao.dora, mao.uradora],
  )

  const temEsperaValida = esperasPossiveis.some((espera) => !espera.semYaku)
  const temEsperaSemYaku = esperasPossiveis.some((espera) => espera.semYaku)
  const temEsperaFuriten = esperasPossiveis.some((espera) => !espera.semYaku && espera.furiten)
  const statusTenpai = temEsperaFuriten
    ? t('calculator.furiten')
    : temEsperaValida
      ? t('calculator.tenpai')
      : temEsperaSemYaku
        ? t('calculator.noYaku')
        : null
  const filtrarTecladoPorEspera = slotsUsados === 13 && !acaoPendente && temEsperaValida
  const furitenBloqueiaRonNoTeclado = mao.agari === 'ron' || !fluxoOpcoes.vitoriaDefinida
  const esperasPorPedra = useMemo(
    () => new Map(esperasPossiveis.map((espera) => [espera.pedra, espera])),
    [esperasPossiveis],
  )

  /** Texto curto exibido dentro do badge de espera no teclado. */
  const rotuloEsperaTeclado = (
    espera: Pick<(typeof esperasPossiveis)[number], 'semYaku' | 'yakuman' | 'han'>,
  ) => {
    if (espera.semYaku) return t('calculator.noYaku')
    if (espera.yakuman > 0) return `${espera.yakuman}Y`
    return `${espera.han} han`
  }

  /** Classe visual que separa espera válida, furiten e espera sem yaku. */
  const classeEsperaTeclado = (
    espera?: Pick<(typeof esperasPossiveis)[number], 'semYaku' | 'furiten'>,
  ) => {
    if (!espera) return ''
    if (espera.semYaku) return 'espera-sem-yaku'
    return espera.furiten ? 'espera-valida espera-furiten' : 'espera-valida'
  }

  const rotulosAcaoMobile = {
    chii: { rotulo: t('melds.chii'), cor: 'var(--cor-sucesso, #4caf50)' },
    pon: { rotulo: t('melds.pon'), cor: 'var(--cor-primario, #2196f3)' },
    kanAberto: { rotulo: t('melds.kanAberto'), cor: 'var(--cor-destaque, #ba68c8)' },
    kanFechado: { rotulo: t('melds.kanFechado'), cor: 'var(--cor-secundario-texto, #9c27b0)' },
    dora: { rotulo: t('melds.dora'), cor: 'var(--cor-aviso, #d97706)' },
    uradora: { rotulo: t('melds.uradora'), cor: 'var(--cor-aviso, #d97706)' },
    descarte: { rotulo: t('melds.discards'), cor: 'var(--cor-texto, #111827)' },
  }
  const acaoMobileAtiva = acaoPendente ? rotulosAcaoMobile[acaoPendente.tipo] : null
  const acaoMeldAtiva =
    acaoPendente?.tipo === 'chii' ||
    acaoPendente?.tipo === 'pon' ||
    acaoPendente?.tipo === 'kanAberto' ||
    acaoPendente?.tipo === 'kanFechado'
      ? acaoPendente
      : null
  const mostrarTeclado = contexto === 'montagem'
  const mostrarFinalizacaoNoTeclado =
    contexto === 'montagem' && maoProntaParaEscolherBatida && !acaoMeldAtiva && !erroNotacao
  const aoConfirmarNotacao = () => {
    if (!mostrarFinalizacaoNoTeclado || !maoProntaParaFinalizar || selecionandoPedraAgari) return
    if (aoCalcularDireto) aoCalcularDireto()
    else finalizarMao()
  }

  /**
   * Marca na mão fechada as pedras já escolhidas durante uma ação de chii.
   * A comparação usa código base para tratar aka dora como equivalente ao 5 normal.
   */
  const indicesSelecionadosChii = useMemo(() => {
    const indicesSelecionados = new Set<number>()
    if (acaoPendente?.tipo !== 'chii') return indicesSelecionados

    for (const pedraSelecionada of acaoPendente.pedras) {
      const indice = mao.pedras.findIndex(
        (pedraMao, indicePedra) =>
          !indicesSelecionados.has(indicePedra) &&
          codigoBase(pedraMao) === codigoBase(pedraSelecionada),
      )
      if (indice >= 0) indicesSelecionados.add(indice)
    }
    return indicesSelecionados
  }, [acaoPendente, mao.pedras])

  /** Troca o modo do próximo clique e fecha o menu mobile para manter feedback imediato. */
  const alternarAcaoMao = (tipo: Parameters<typeof alternarAcao>[0]) => {
    alternarAcao(tipo)
    setMenuAcoesMaoAberto(false)
  }

  const limparDescartes = () => {
    estado.atualizarMao((rascunho) => {
      rascunho.descartes = []
    })
  }

  useEffect(() => {
    const atualizarEstadoSticky = () => {
      const sentinela = sentinelaStickyRef.current
      if (!sentinela) return
      setMaoEditorGrudado(sentinela.getBoundingClientRect().top < 8)
    }

    atualizarEstadoSticky()
    window.addEventListener('scroll', atualizarEstadoSticky, { passive: true })
    window.addEventListener('resize', atualizarEstadoSticky)

    return () => {
      window.removeEventListener('scroll', atualizarEstadoSticky)
      window.removeEventListener('resize', atualizarEstadoSticky)
    }
  }, [])

  return (
    <div
      className={`${embutido ? '' : 'card'} construtor-mao construtor-mao-${contexto} ${
        selecionandoPedraAgari ? 'selecionando-batida' : ''
      }`.trim()}
    >
      <div ref={sentinelaStickyRef} aria-hidden="true" />
      <MaoAtual
        mao={mao}
        acaoPendente={acaoPendente}
        acaoMeldAtiva={acaoMeldAtiva}
        acaoMobileAtiva={acaoMobileAtiva}
        totalPedras={totalPedras}
        slotsUsados={slotsUsados}
        maoEditorGrudado={maoEditorGrudado}
        menuAcoesMaoAberto={menuAcoesMaoAberto}
        indicesSelecionadosChii={indicesSelecionadosChii}
        statusTenpai={statusTenpai}
        temEsperaValida={temEsperaValida}
        temEsperaSemYaku={temEsperaSemYaku}
        temEsperaFuriten={temEsperaFuriten}
        podeChii={podeChii}
        podePon={podePon}
        podeKanAberto={podeKanAberto}
        podeKanFechado={podeKanFechado}
        maoInvalida={resultadoMaoInvalida}
        selecionandoPedraAgari={selecionandoPedraAgari}
        contexto={contexto}
        acoesCabecalho={acoesCabecalho}
        aoAbrirRegras={aoAbrirRegras}
        aoAbrirCalculadoraRapida={aoAbrirCalculadoraRapida}
        aoAbrirMenuAcoes={() => setMenuAcoesMaoAberto((aberto) => !aberto)}
        aoAlternarAcao={alternarAcaoMao}
        aoAdicionarPedraDaMao={adicionarPedraDaMao}
        aoEscolherPedraAgariMao={escolherPedraAgariMao}
        aoEscolherPedraAgariMeld={escolherPedraAgariMeld}
        aoRemoverPedra={contexto === 'montagem' ? removerPedra : () => undefined}
        aoRemoverMeld={contexto === 'montagem' ? removerMeld : () => undefined}
        aoLimpar={limpar}
      />

      {contexto === 'montagem' && (
        <>
          <DescartesMao
            descartes={mao.descartes}
            temEsperaFuriten={temEsperaFuriten}
            aoRemoverDescarte={removerDescarte}
            aoLimparDescartes={limparDescartes}
          />

          <div className="acoes-construtor-mao">
            <AcoesConstrutorMao
              mao={mao}
              acaoPendente={acaoPendente}
              podeChii={podeChii}
              podePon={podePon}
              podeKanAberto={podeKanAberto}
              podeKanFechado={podeKanFechado}
              aoAlternarAcao={alternarAcaoMao}
              aoAbrirCalculadoraRapida={aoAbrirCalculadoraRapida}
            />
          </div>
        </>
      )}

      {mostrarTeclado && (
        <div className="painel-teclado-calculadora">
          <span className="sr-only" aria-live="polite">
            {mensagemFinalizacao ??
              (mostrarFinalizacaoNoTeclado ? t('calculator.readyToFinalizeAnnouncement') : '')}
          </span>
          {contexto === 'montagem' && (
            <div className="menu-acoes-teclado-mobile" aria-label={t('calculator.actionsMenu')}>
              <div className="opcoes-acoes-mao-mobile">
                <AcoesConstrutorMao
                  mao={mao}
                  acaoPendente={acaoPendente}
                  podeChii={podeChii}
                  podePon={podePon}
                  podeKanAberto={podeKanAberto}
                  podeKanFechado={podeKanFechado}
                  aoAlternarAcao={alternarAcaoMao}
                  aoAbrirCalculadoraRapida={aoAbrirCalculadoraRapida}
                  compacto
                />
                {aoAbrirRegras && !mostrarFinalizacaoNoTeclado && (
                  <button
                    className="botao-configuracao-toolbar"
                    type="button"
                    aria-label={t('rulesModal.open')}
                    title={t('rulesModal.open')}
                    onClick={aoAbrirRegras}
                  >
                    <i className="fas fa-gear" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}
          {contexto === 'montagem' && (
            <div className="seletor-entrada-mao" role="group" aria-label={t('notation.modeLabel')}>
              {(['pecas', 'notacao'] as const).map((modo) => (
                <button
                  key={modo}
                  className={modoEntrada === modo ? 'ativo' : ''}
                  type="button"
                  aria-pressed={modoEntrada === modo}
                  onClick={() => trocarModoEntrada(modo)}
                >
                  {t(modo === 'pecas' ? 'notation.modeTiles' : 'notation.modeNotation')}
                </button>
              ))}
            </div>
          )}
          {entradaPorNotacao && (
            <MahjongNotationInput
              value={textoNotacao}
              onChange={mudarTextoNotacao}
              onSubmit={aoConfirmarNotacao}
              erro={!!erroNotacao}
              mensagem={
                erroNotacao
                  ? t(erroNotacao.chave, erroNotacao.parametros)
                  : t('notation.tileCount', { count: notacao.pedras.length })
              }
            />
          )}
          {(!entradaPorNotacao || mostrarFinalizacaoNoTeclado || selecionandoPedraAgari) && (
            <TecladoPedras
              mostrarGrade={!entradaPorNotacao}
              acaoPendente={acaoPendente}
              configuracao={configuracao}
              dorasReais={dorasReais}
              esperasPorPedra={esperasPorPedra}
              filtrarTecladoPorEspera={filtrarTecladoPorEspera}
              furitenBloqueiaRon={furitenBloqueiaRonNoTeclado}
              maoCompleta={maoCompleta}
              podeSelecionarPedra={podeSelecionarPedra}
              rotuloEsperaTeclado={rotuloEsperaTeclado}
              classeEsperaTeclado={classeEsperaTeclado}
              contexto={contexto}
              maoProntaParaFinalizar={mostrarFinalizacaoNoTeclado}
              batidaDefinida={maoProntaParaFinalizar}
              mensagemFinalizacao={mensagemFinalizacao}
              selecionandoPedraAgari={selecionandoPedraAgari}
              candidatasPedraAgari={candidatasPedraAgari}
              escolhaChiiPendente={escolhaChiiPendente}
              aoAbrirRegras={contexto === 'montagem' ? aoAbrirRegras : undefined}
              aoAdicionarPedra={adicionarPedra}
              aoFinalizarMao={aoCalcularDireto ? undefined : finalizarMao}
              aoCalcularDireto={aoCalcularDireto}
              aoAlternarSelecaoPedraAgari={alternarSelecaoPedraAgari}
              aoEscolherPedraAgariPorCodigo={escolherPedraAgariPorCodigo}
              aoEscolherChiiPendente={escolherChiiPendente}
            />
          )}
        </div>
      )}
    </div>
  )
}
