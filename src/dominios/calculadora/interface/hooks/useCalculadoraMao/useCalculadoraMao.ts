import { useEffect, useMemo, useState } from 'react'
import { useAcoesMelds } from './useAcoesMelds'
import { useAcoesPedras } from './useAcoesPedras'
import { useEsperasMao } from './useEsperasMao'
import { useEstadoMao } from './useEstadoMao'
import { useResultadoMao } from './useResultadoMao'
import { ordenarPedras } from '../../../logica/mao'

const YAKU_APENAS_BONUS = new Set(['Dora', 'Uradora', 'Akadora', 'Dora manual'])

function resultadoTemYakuValido(resultado: ReturnType<typeof useResultadoMao>['resultado']) {
  if (!resultado || resultado.agari == null) return false
  if (resultado.yakuman > 0) return true
  if (resultado.semYaku) return false
  return resultado.yaku.some(([nome, _han, yakuman]) => yakuman || !YAKU_APENAS_BONUS.has(nome))
}

/**
 * Orquestra estado, ações e resultados da calculadora de mão.
 * Componentes devem depender deste hook público, enquanto regras internas ficam nos hooks especializados.
 *
 * Como ler este módulo:
 * 1. `useEstadoMao` guarda a mão e opções editáveis.
 * 2. `useAcoesMelds` responde se uma pedra ou meld pode ser selecionado.
 * 3. `useEsperasMao` e `useResultadoMao` calculam dados derivados.
 * 4. `useAcoesPedras` junta validações e mutações disparadas por clique.
 *
 * A API retornada aqui é a superfície pública da interface da calculadora.
 * Evite mudar nomes sem revisar todos os componentes consumidores.
 */
export function useCalculadoraMao() {
  const estado = useEstadoMao()
  const {
    mao,
    atualizarMao,
    acaoPendente,
    setAcaoPendente,
    configuracao,
    han,
    fu,
    slotsUsados,
    maoCompleta,
  } = estado
  const [assinaturaCalculo, setAssinaturaCalculo] = useState<string | null>(null)
  const [etapaFinalizacaoAtiva, setEtapaFinalizacaoAtiva] = useState(false)
  const [fluxoOpcoes, setFluxoOpcoes] = useState({
    vitoriaDefinida: false,
    ventoRodadaDefinido: false,
    ventoAssentoDefinido: false,
  })
  const assinaturaMaoAtual = useMemo(
    () =>
      JSON.stringify({
        mao,
        configuracao,
      }),
    [mao, configuracao],
  )
  const deveCalcularMao = maoCompleta && assinaturaCalculo === assinaturaMaoAtual

  const acoesMelds = useAcoesMelds({ mao, acaoPendente, slotsUsados })

  /*
   * Esperas precisam estar disponíveis antes das ações de clique:
   * ao clicar uma espera em furiten, a ação força `agari = ron` para exibir a penalidade correta.
   */
  const { esperasPossiveis, calculandoEsperas } = useEsperasMao({
    mao,
    configuracao,
    slotsUsados,
  })
  const resultados = useResultadoMao({
    mao,
    configuracao,
    han,
    fu,
    maoCompleta,
    deveCalcularMao,
  })
  const acoesPedras = useAcoesPedras({
    estado: {
      mao,
      atualizarMao,
      acaoPendente,
      setAcaoPendente,
      slotsUsados,
      maoCompleta,
    },
    esperasPossiveis,
    podeAdicionarPedras: acoesMelds.podeAdicionarPedras,
    podeFormarMeldComMao: acoesMelds.podeFormarMeldComMao,
    indicesPedrasNaMaoPara: acoesMelds.indicesPedrasNaMaoPara,
    sequenciasChiiPossiveis: acoesMelds.sequenciasChiiPossiveis,
    escolherSequenciaChii: acoesMelds.escolherSequenciaChii,
  })

  const podeMeld = mao.riichi === null && !mao.bencao
  const podeChii = podeMeld && acoesMelds.podeChii
  const podePon = podeMeld && acoesMelds.podePon
  const podeKanAberto = podeMeld && acoesMelds.podeKanAberto
  const podeKanFechado = !mao.bencao && acoesMelds.podeKanFechado
  const maoAberta = mao.melds.some((meld) => meld.tipo !== 'kanFechado')
  const resultadoComYakuValido = resultadoTemYakuValido(resultados.resultado)
  const resultadoMaoInvalida =
    deveCalcularMao &&
    maoCompleta &&
    (!!resultados.resultado || resultados.resultado === null) &&
    !resultados.furitenRonCompleto &&
    !resultadoComYakuValido
  const podeCalcularMao = slotsUsados >= 14
  const maoProntaParaFinalizar = maoCompleta && (mao.indiceAgari >= 0 || !!mao.agariMeld)
  const fluxoConfiguracaoCompleto =
    fluxoOpcoes.vitoriaDefinida &&
    fluxoOpcoes.ventoRodadaDefinido &&
    fluxoOpcoes.ventoAssentoDefinido
  /**
   * Dispara o calculo final somente quando a mao e as opcoes obrigatorias estao prontas.
   *
   * Chamado pelo botao Calcular na etapa Finalizar Mao. Nao altera a mao e nao abre
   * modal diretamente; apenas congela a assinatura usada por `useResultadoMao`.
   */
  const calcularMaoAtual = () => {
    if (!podeCalcularMao || !fluxoConfiguracaoCompleto) return
    setAssinaturaCalculo(assinaturaMaoAtual)
  }

  /** Avanca da montagem para a etapa de finalizacao somente por decisao explicita do usuario. */
  const finalizarMao = () => {
    if (!maoProntaParaFinalizar) return
    setEtapaFinalizacaoAtiva(true)
  }

  /**
   * Remove apenas a pedra vencedora e retorna a calculadora para a montagem em tenpai.
   *
   * Chamado pelo botao "Voltar para montagem" da etapa de finalizacao. Preserva ventos,
   * honba, doras, riichi e condicoes especiais para reaproveitar configuracoes ao escolher
   * outra espera. Nao toca nas regras de calculo.
   */
  const voltarParaMontagem = () => {
    if (!maoCompleta || (mao.indiceAgari < 0 && !mao.agariMeld)) return
    setEtapaFinalizacaoAtiva(false)
    atualizarMao((rascunho) => {
      if (rascunho.agariMeld) {
        const agariMeld = rascunho.agariMeld
        rascunho.melds.splice(agariMeld.indiceMeld, 1)
        rascunho.pedras.push(...agariMeld.pedrasConsumidasMao)
        ordenarPedras(rascunho.pedras)
        rascunho.agariMeld = null
      } else {
        rascunho.pedras.splice(rascunho.indiceAgari, 1)
      }
      rascunho.indiceAgari = -1
    })
    setAssinaturaCalculo(null)
  }

  /**
   * Registra que o usuario escolheu Ron ou Tsumo.
   *
   * Chamado pelos botoes de vitoria na etapa Finalizar Mao. Afeta o calculo de pontos
   * e as condicoes especiais disponiveis, mas nao recalcula ate o botao Calcular.
   */
  const marcarVitoriaDefinida = () =>
    setFluxoOpcoes((fluxoAtual) => ({ ...fluxoAtual, vitoriaDefinida: true }))

  /** Marca que o vento da rodada foi revisado na etapa de finalizacao. */
  const marcarVentoRodadaDefinido = () =>
    setFluxoOpcoes((fluxoAtual) => ({ ...fluxoAtual, ventoRodadaDefinido: true }))

  /** Marca que o vento do jogador foi revisado na etapa de finalizacao. */
  const marcarVentoAssentoDefinido = () =>
    setFluxoOpcoes((fluxoAtual) => ({ ...fluxoAtual, ventoAssentoDefinido: true }))

  useEffect(() => {
    if (slotsUsados >= 13) return

    setAcaoPendente((acaoAtual) =>
      acaoAtual?.tipo === 'dora' || acaoAtual?.tipo === 'uradora' ? null : acaoAtual,
    )
    setFluxoOpcoes({
      vitoriaDefinida: false,
      ventoRodadaDefinido: false,
      ventoAssentoDefinido: false,
    })
    setEtapaFinalizacaoAtiva(false)
    setAssinaturaCalculo(null)
  }, [setAcaoPendente, slotsUsados])

  useEffect(() => {
    if (maoProntaParaFinalizar) return

    setEtapaFinalizacaoAtiva(false)
    setAssinaturaCalculo(null)
  }, [maoProntaParaFinalizar])

  useEffect(() => {
    if (!acaoPendente) return

    const acaoAindaPodeContinuar =
      (acaoPendente.tipo === 'chii' && podeChii) ||
      (acaoPendente.tipo === 'pon' && podePon) ||
      (acaoPendente.tipo === 'kanAberto' && podeKanAberto) ||
      (acaoPendente.tipo === 'kanFechado' && podeKanFechado) ||
      acaoPendente.tipo === 'dora' ||
      acaoPendente.tipo === 'uradora' ||
      acaoPendente.tipo === 'descarte'

    if (!acaoAindaPodeContinuar) setAcaoPendente(null)
  }, [
    acaoPendente,
    podeChii,
    podeKanAberto,
    podeKanFechado,
    podePon,
    setAcaoPendente,
  ])

  return {
    ...estado,
    contarCodigo: acoesMelds.contarCodigo,
    contarAka: acoesMelds.contarAka,
    podeSelecionarPedra: acoesMelds.podeSelecionarPedra,
    ...resultados,
    deveCalcularMao,
    etapaFinalizacaoAtiva,
    maoProntaParaFinalizar,
    podeCalcularMao: podeCalcularMao && fluxoConfiguracaoCompleto,
    calcularMaoAtual,
    finalizarMao,
    voltarParaMontagem,
    resultadoComYakuValido,
    resultadoMaoInvalida,
    fluxoOpcoes,
    fluxoConfiguracaoCompleto,
    marcarVitoriaDefinida,
    marcarVentoRodadaDefinido,
    marcarVentoAssentoDefinido,
    esperasPossiveis,
    calculandoEsperas,
    ...acoesPedras,
    podeMeld,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    maoAberta,
  }
}

export type EstadoCalculadoraMao = ReturnType<typeof useCalculadoraMao>
