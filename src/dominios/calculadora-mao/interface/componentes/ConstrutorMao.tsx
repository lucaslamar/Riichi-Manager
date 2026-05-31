import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { codigoBase, proximaDoraIndicada } from '../constantes'
import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { AcoesConstrutorMao } from './construtor-mao/AcoesConstrutorMao'
import { DescartesMao } from './construtor-mao/DescartesMao'
import { IndicadoresDora } from './construtor-mao/IndicadoresDora'
import { MaoAtual } from './construtor-mao/MaoAtual'
import { TecladoPedras } from './construtor-mao/TecladoPedras'

interface PropsConstrutorMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
  contexto?: 'montagem' | 'finalizacao'
  aoAbrirRegras?: () => void
  acoesCabecalho?: ReactNode
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
}: PropsConstrutorMao) {
  const { t } = useI18n()
  const sentinelaStickyRef = useRef<HTMLDivElement | null>(null)
  const [maoEditorGrudado, setMaoEditorGrudado] = useState(false)
  const [menuAcoesMaoAberto, setMenuAcoesMaoAberto] = useState(false)
  const {
    mao,
    atualizarMao,
    acaoPendente,
    configuracao,
    totalPedras,
    slotsUsados,
    maoCompleta,
    podeSelecionarPedra,
    adicionarPedra,
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
    selecionandoPedraAgari,
    mensagemFinalizacao,
    candidatasPedraAgari,
    fluxoOpcoes,
    finalizarMao,
    alternarSelecaoPedraAgari,
    escolherPedraAgariMao,
    escolherPedraAgariMeld,
    escolherPedraAgariPorCodigo,
  } = estado

  /**
   * Converte indicadores escolhidos em doras reais para destacar o teclado.
   * Quando há dora manual, indicadores visuais são ignorados pelo cálculo.
   */
  const dorasReais = useMemo(
    () =>
      new Set(
        mao.doraManual > 0
          ? []
          : [...mao.dora, ...mao.uradora].map((indicador) =>
              codigoBase(proximaDoraIndicada(indicador)),
            ),
      ),
    [mao.dora, mao.doraManual, mao.uradora],
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
    () => new Map(esperasPossiveis.map((espera) => [codigoBase(espera.pedra), espera])),
    [esperasPossiveis],
  )

  /** Texto curto exibido dentro do badge de espera no teclado. */
  const rotuloEsperaTeclado = (
    espera: Pick<(typeof esperasPossiveis)[number], 'semYaku' | 'yakuman' | 'han'>,
  ) => {
    if (espera.semYaku) return t('calculator.noYaku')
    if (espera.yakuman > 0) return `${espera.yakuman}x`
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
    chii: { rotulo: t('melds.chii'), cor: '#4caf50' },
    pon: { rotulo: t('melds.pon'), cor: '#2196f3' },
    kanAberto: { rotulo: t('melds.kanAberto'), cor: '#ba68c8' },
    kanFechado: { rotulo: t('melds.kanFechado'), cor: '#9c27b0' },
    dora: { rotulo: t('melds.dora'), cor: '#d97706' },
    uradora: { rotulo: t('melds.uradora'), cor: '#d97706' },
    descarte: { rotulo: t('melds.discards'), cor: '#111827' },
  }
  const acaoMobileAtiva = acaoPendente ? rotulosAcaoMobile[acaoPendente.tipo] : null
  const acaoMeldAtiva =
    acaoPendente?.tipo === 'chii' ||
    acaoPendente?.tipo === 'pon' ||
    acaoPendente?.tipo === 'kanAberto' ||
    acaoPendente?.tipo === 'kanFechado'
      ? acaoPendente
      : null
  const mostrarTeclado = contexto === 'montagem' || !!acaoPendente

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
    <div className={`${embutido ? '' : 'card'} construtor-mao construtor-mao-${contexto}`.trim()}>
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
        aoAbrirMenuAcoes={() => setMenuAcoesMaoAberto((aberto) => !aberto)}
        aoAlternarAcao={alternarAcaoMao}
        aoAdicionarPedra={adicionarPedra}
        aoEscolherPedraAgariMao={escolherPedraAgariMao}
        aoEscolherPedraAgariMeld={escolherPedraAgariMeld}
        aoRemoverPedra={removerPedra}
        aoRemoverMeld={removerMeld}
        aoLimpar={limpar}
      />

      {contexto === 'montagem' && (
        <>
          <IndicadoresDora mao={mao} atualizarMao={atualizarMao} />
          <DescartesMao descartes={mao.descartes} aoRemoverDescarte={removerDescarte} />

          <div className="acoes-construtor-mao">
            <AcoesConstrutorMao
              mao={mao}
              acaoPendente={acaoPendente}
              podeChii={podeChii}
              podePon={podePon}
              podeKanAberto={podeKanAberto}
              podeKanFechado={podeKanFechado}
              aoAlternarAcao={alternarAcaoMao}
            />
          </div>

        </>
      )}

      {mostrarTeclado && (
        <div className="painel-teclado-calculadora">
          <span className="sr-only" aria-live="polite">
            {mensagemFinalizacao ??
              (contexto === 'montagem' && maoProntaParaFinalizar
                ? t('calculator.readyToFinalizeAnnouncement')
                : '')}
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
                  compacto
                />
              </div>
            </div>
          )}
          <TecladoPedras
            acaoPendente={acaoPendente}
            configuracao={configuracao}
            doraManual={mao.doraManual}
            dorasReais={dorasReais}
            esperasPorPedra={esperasPorPedra}
            filtrarTecladoPorEspera={filtrarTecladoPorEspera}
            furitenBloqueiaRon={furitenBloqueiaRonNoTeclado}
            maoCompleta={maoCompleta}
            podeSelecionarPedra={podeSelecionarPedra}
            rotuloEsperaTeclado={rotuloEsperaTeclado}
            classeEsperaTeclado={classeEsperaTeclado}
            contexto={contexto}
            maoProntaParaFinalizar={contexto === 'montagem' && maoProntaParaFinalizar}
            mensagemFinalizacao={mensagemFinalizacao}
            selecionandoPedraAgari={selecionandoPedraAgari}
            candidatasPedraAgari={candidatasPedraAgari}
            aoAbrirRegras={contexto === 'montagem' ? aoAbrirRegras : undefined}
            aoAdicionarPedra={adicionarPedra}
            aoFinalizarMao={finalizarMao}
            aoAlternarSelecaoPedraAgari={alternarSelecaoPedraAgari}
            aoEscolherPedraAgariPorCodigo={escolherPedraAgariPorCodigo}
          />
        </div>
      )}
    </div>
  )
}
