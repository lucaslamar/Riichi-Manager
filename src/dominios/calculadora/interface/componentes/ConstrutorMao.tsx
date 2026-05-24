import { useEffect, useMemo, useRef, useState } from 'react'
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
}

const ROTULOS_ACAO_MOBILE = {
  chii: { rotulo: 'Chii', cor: '#4caf50' },
  pon: { rotulo: 'Pon', cor: '#2196f3' },
  kanAberto: { rotulo: 'Kan aberto', cor: '#ba68c8' },
  kanFechado: { rotulo: 'Kan fechado', cor: '#9c27b0' },
  dora: { rotulo: 'Dora', cor: '#ec4899' },
  uradora: { rotulo: 'Uradora', cor: '#ec4899' },
  descarte: { rotulo: 'Descartes', cor: '#111827' },
}

/**
 * Área para montar a mão completa pedra por pedra.
 *
 * Como ler este componente:
 * - aqui ficam apenas estados de interface local, como sticky e menu mobile;
 * - dados derivados leves são preparados e repassados para subcomponentes;
 * - a edição real da mão continua no hook `useCalculadoraMao`.
 */
export default function ConstrutorMao({ estado, embutido = false }: PropsConstrutorMao) {
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
    podeMeld,
    podeKanFechado,
    esperasPossiveis,
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
    ? 'Furiten'
    : temEsperaValida
      ? 'Tenpai'
      : temEsperaSemYaku
        ? 'Sem yaku'
        : null
  const filtrarTecladoPorEspera = slotsUsados === 13 && !acaoPendente && temEsperaValida
  const esperasPorPedra = useMemo(
    () => new Map(esperasPossiveis.map((espera) => [codigoBase(espera.pedra), espera])),
    [esperasPossiveis],
  )

  /** Texto curto exibido dentro do badge de espera no teclado. */
  const rotuloEsperaTeclado = (espera: (typeof esperasPossiveis)[number]) => {
    if (espera.semYaku) return 'sem yaku'
    if (espera.yakuman > 0) return `${espera.yakuman}x`
    return `${espera.han} han`
  }

  /** Classe visual que separa espera válida, furiten e espera sem yaku. */
  const classeEsperaTeclado = (espera?: (typeof esperasPossiveis)[number]) => {
    if (!espera) return ''
    if (espera.semYaku) return 'espera-sem-yaku'
    return espera.furiten ? 'espera-valida espera-furiten' : 'espera-valida'
  }

  const acaoMobileAtiva = acaoPendente ? ROTULOS_ACAO_MOBILE[acaoPendente.tipo] : null
  const acaoMeldAtiva =
    acaoPendente?.tipo === 'chii' ||
    acaoPendente?.tipo === 'pon' ||
    acaoPendente?.tipo === 'kanAberto' ||
    acaoPendente?.tipo === 'kanFechado'
      ? acaoPendente
      : null

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
    <div className={embutido ? undefined : 'card'}>
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
        podeMeld={podeMeld}
        podeKanFechado={podeKanFechado}
        aoAbrirMenuAcoes={() => setMenuAcoesMaoAberto((aberto) => !aberto)}
        aoAlternarAcao={alternarAcaoMao}
        aoAdicionarPedra={adicionarPedra}
        aoRemoverPedra={removerPedra}
        aoRemoverMeld={removerMeld}
        aoLimpar={limpar}
      />

      <IndicadoresDora mao={mao} atualizarMao={atualizarMao} />
      <DescartesMao descartes={mao.descartes} aoRemoverDescarte={removerDescarte} />

      <div className="acoes-construtor-mao">
        <AcoesConstrutorMao
          mao={mao}
          acaoPendente={acaoPendente}
          podeMeld={podeMeld}
          podeKanFechado={podeKanFechado}
          aoAlternarAcao={alternarAcaoMao}
        />
      </div>

      <TecladoPedras
        acaoPendente={acaoPendente}
        configuracao={configuracao}
        doraManual={mao.doraManual}
        dorasReais={dorasReais}
        esperasPorPedra={esperasPorPedra}
        filtrarTecladoPorEspera={filtrarTecladoPorEspera}
        maoCompleta={maoCompleta}
        podeSelecionarPedra={podeSelecionarPedra}
        rotuloEsperaTeclado={rotuloEsperaTeclado}
        classeEsperaTeclado={classeEsperaTeclado}
        aoAdicionarPedra={adicionarPedra}
      />
    </div>
  )
}
