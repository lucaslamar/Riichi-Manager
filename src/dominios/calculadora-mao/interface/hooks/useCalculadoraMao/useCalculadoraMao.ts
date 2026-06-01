import { useEffect, useMemo, useState } from 'react'
import { useAcoesMelds } from './useAcoesMelds'
import { useAcoesPedras } from './useAcoesPedras'
import { useEsperasMao } from './useEsperasMao'
import { useEstadoMao } from './useEstadoMao'
import { useResultadoMao } from './useResultadoMao'
import { calcularMao, ordenarPedras, type CodigoPedra } from '../../../logica/mao'
import { codigoBase } from '../../constantes'

const YAKU_APENAS_BONUS = new Set(['Dora', 'Uradora', 'Akadora', 'Dora manual'])

interface CandidataPedraAgari {
  pedra: CodigoPedra
  han: number
  yakuman: number
  semYaku: boolean
  furiten: boolean
}

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
    slotsUsados,
    maoCompleta,
  } = estado
  const [assinaturaCalculo, setAssinaturaCalculo] = useState<string | null>(null)
  const [etapaFinalizacaoAtiva, setEtapaFinalizacaoAtiva] = useState(false)
  const [selecionandoPedraAgari, setSelecionandoPedraAgari] = useState(false)
  const [mensagemFinalizacao, setMensagemFinalizacao] = useState<string | null>(null)
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
    maoCompleta,
    deveCalcularMao,
  })
  const candidatasPedraAgari = useMemo(() => {
    if (!maoCompleta) return new Map<string, CandidataPedraAgari>()

    const candidatas = new Map<string, CandidataPedraAgari>()
    const registrarCandidata = (pedra: CodigoPedra, maoCandidata: typeof mao) => {
      const chave = codigoBase(pedra)
      if (candidatas.has(chave)) return

      try {
        const resultado = calcularMao(maoCandidata, configuracao)
        if (resultado.agari == null) return
        candidatas.set(chave, {
          pedra,
          han: resultado.han,
          yakuman: resultado.yakuman,
          semYaku: resultado.semYaku,
          furiten: false,
        })
      } catch {
        // Nem toda tile visivel precisa ser uma batida calculavel; ela apenas nao vira candidata no teclado.
      }
    }

    mao.pedras.forEach((pedra, indiceAgari) => {
      registrarCandidata(pedra, {
        ...mao,
        indiceAgari,
        agariMeld: null,
      })
    })

    mao.melds.forEach((meld, indiceMeld) => {
      meld.pedras.forEach((pedra, indicePedra) => {
        registrarCandidata(pedra, {
          ...mao,
          indiceAgari: -1,
          agariMeld: {
            indiceMeld,
            indicePedra,
            pedra,
            tipo: meld.tipo,
            pedrasConsumidasMao:
              mao.agariMeld?.indiceMeld === indiceMeld
                ? mao.agariMeld.pedrasConsumidasMao
                : meld.pedras.filter((_pedraMeld, indice) => indice !== indicePedra),
          },
        })
      })
    })

    const ronBloqueadoPorFuriten =
      [...candidatas.entries()].some(
        ([chave, candidata]) =>
          !candidata.semYaku && mao.descartes.some((descarte) => codigoBase(descarte) === chave),
      )

    if (ronBloqueadoPorFuriten) {
      candidatas.forEach((candidata) => {
        if (!candidata.semYaku) candidata.furiten = true
      })
    }

    return candidatas
  }, [configuracao, mao, maoCompleta])
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
    podeCriarMeld: acoesMelds.podeCriarMeld,
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
  const maoProntaParaFinalizar = maoCompleta && (mao.indiceAgari >= 0 || !!mao.agariMeld)
  const podeCalcularMao = maoProntaParaFinalizar
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
    if (!maoProntaParaFinalizar) {
      setMensagemFinalizacao('Escolha a pedra da batida.')
      return
    }
    setSelecionandoPedraAgari(false)
    setMensagemFinalizacao(null)
    setEtapaFinalizacaoAtiva(true)
  }

  const alternarSelecaoPedraAgari = () => {
    if (!maoCompleta) return
    setSelecionandoPedraAgari((selecionando) => {
      const proximo = !selecionando
      setMensagemFinalizacao(proximo ? 'Escolha a pedra da batida.' : null)
      return proximo
    })
  }

  const escolherPedraAgariMao = (indicePedra: number) => {
    if (!maoCompleta || indicePedra < 0 || indicePedra >= mao.pedras.length) return

    atualizarMao((rascunho) => {
      rascunho.indiceAgari = indicePedra
      rascunho.agariMeld = null
    })
    setSelecionandoPedraAgari(false)
    setMensagemFinalizacao('Pedra da batida selecionada.')
    setAssinaturaCalculo(null)
  }

  const escolherPedraAgariMeld = (indiceMeld: number, indicePedra: number) => {
    if (!maoCompleta) return
    const meld = mao.melds[indiceMeld]
    const pedra = meld?.pedras[indicePedra]
    if (!meld || !pedra) return

    atualizarMao((rascunho) => {
      const meldAtual = rascunho.melds[indiceMeld]
      const pedraAtual = meldAtual?.pedras[indicePedra]
      if (!meldAtual || !pedraAtual) return

      rascunho.indiceAgari = -1
      rascunho.agariMeld = {
        indiceMeld,
        indicePedra,
        pedra: pedraAtual,
        tipo: meldAtual.tipo,
        pedrasConsumidasMao:
          rascunho.agariMeld?.indiceMeld === indiceMeld
            ? rascunho.agariMeld.pedrasConsumidasMao
            : meldAtual.pedras.filter((_pedraMeld, indice) => indice !== indicePedra),
      }
    })
    setSelecionandoPedraAgari(false)
    setMensagemFinalizacao('Pedra da batida selecionada.')
    setAssinaturaCalculo(null)
  }

  const escolherPedraAgariPorCodigo = (pedra: CodigoPedra) => {
    if (!maoCompleta) return
    const chave = codigoBase(pedra)
    const indicePedra = mao.pedras.findIndex((pedraMao) => codigoBase(pedraMao) === chave)
    if (indicePedra >= 0) {
      escolherPedraAgariMao(indicePedra)
      return
    }

    const indiceMeld = mao.melds.findIndex((meld) =>
      meld.pedras.some((pedraMeld) => codigoBase(pedraMeld) === chave),
    )
    if (indiceMeld < 0) return
    const indicePedraMeld = mao.melds[indiceMeld].pedras.findIndex(
      (pedraMeld) => codigoBase(pedraMeld) === chave,
    )
    escolherPedraAgariMeld(indiceMeld, indicePedraMeld)
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
    setSelecionandoPedraAgari(false)
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
    setSelecionandoPedraAgari(false)
    setAssinaturaCalculo(null)
  }, [setAcaoPendente, slotsUsados])

  useEffect(() => {
    if (maoProntaParaFinalizar) return

    setEtapaFinalizacaoAtiva(false)
    setSelecionandoPedraAgari(false)
    setAssinaturaCalculo(null)
  }, [maoProntaParaFinalizar])

  useEffect(() => {
    if (mao.riichi || (mao.uradora.length === 0 && mao.uradoraManual === 0)) return

    atualizarMao((rascunho) => {
      rascunho.uradora = []
      rascunho.uradoraManual = 0
    })
  }, [atualizarMao, mao.riichi, mao.uradora.length, mao.uradoraManual])

  useEffect(() => {
    if (!acaoPendente) return

    const acaoAindaPodeContinuar =
      (acaoPendente.tipo === 'chii' && podeChii) ||
      (acaoPendente.tipo === 'pon' && podePon) ||
      (acaoPendente.tipo === 'kanAberto' && podeKanAberto) ||
      (acaoPendente.tipo === 'kanFechado' && podeKanFechado) ||
      acaoPendente.tipo === 'dora' ||
      (acaoPendente.tipo === 'uradora' && !!mao.riichi) ||
      acaoPendente.tipo === 'descarte'

    if (!acaoAindaPodeContinuar) setAcaoPendente(null)
  }, [
    acaoPendente,
    podeChii,
    podeKanAberto,
    podeKanFechado,
    podePon,
    setAcaoPendente,
    mao.riichi,
  ])

  const alternarAcaoCalculadora = (tipo: Parameters<typeof acoesPedras.alternarAcao>[0]) => {
    const acaoEstrutural =
      tipo === 'chii' || tipo === 'pon' || tipo === 'kanAberto' || tipo === 'kanFechado'

    if (acaoEstrutural && acaoPendente?.tipo !== tipo) {
      setSelecionandoPedraAgari(false)
      setMensagemFinalizacao(null)
      setAssinaturaCalculo(null)
    }

    acoesPedras.alternarAcao(tipo)
  }

  return {
    ...estado,
    contarCodigo: acoesMelds.contarCodigo,
    contarAka: acoesMelds.contarAka,
    podeSelecionarPedra: acoesMelds.podeSelecionarPedra,
    ...resultados,
    deveCalcularMao,
    etapaFinalizacaoAtiva,
    selecionandoPedraAgari,
    mensagemFinalizacao,
    candidatasPedraAgari,
    maoProntaParaFinalizar,
    podeCalcularMao: podeCalcularMao && fluxoConfiguracaoCompleto,
    calcularMaoAtual,
    finalizarMao,
    alternarSelecaoPedraAgari,
    escolherPedraAgariMao,
    escolherPedraAgariMeld,
    escolherPedraAgariPorCodigo,
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
    alternarAcao: alternarAcaoCalculadora,
    podeMeld,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    maoAberta,
  }
}

export type EstadoCalculadoraMao = ReturnType<typeof useCalculadoraMao>
