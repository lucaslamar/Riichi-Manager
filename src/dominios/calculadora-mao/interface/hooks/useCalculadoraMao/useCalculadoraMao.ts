import { useEffect, useMemo, useRef, useState } from 'react'
import { candidatasDaBatida, trocarBatida, type CandidataBatida } from '../../../logica/batida'
import { useAcoesMelds } from './useAcoesMelds'
import { useAcoesPedras } from './useAcoesPedras'
import { useEsperasMao } from './useEsperasMao'
import { useEstadoMao } from './useEstadoMao'
import { useResultadoMao } from './useResultadoMao'
import { ordenarPedras, type CodigoPedra, type ConfiguracaoCalculo, type Mao } from '../../../logica/mao'
import type { EscolhaChiiPendente } from './tipos'
import type { RegrasSanma } from '@/compartilhado/mahjong/variante'

const YAKU_APENAS_BONUS = new Set(['Dora', 'Uradora', 'Akadora', 'Dora manual'])

function resultadoTemYakuValido(resultado: ReturnType<typeof useResultadoMao>['resultado']) {
  if (!resultado || resultado.agari == null) return false
  if (resultado.yakuman > 0) return true
  if (resultado.semYaku) return false
  return resultado.yaku.some(([nome, _han, yakuman]) => yakuman || !YAKU_APENAS_BONUS.has(nome))
}

interface OpcionsCalculadoraMao {
  initialMao?: Partial<Pick<Mao, 'agari' | 'ventoRodada' | 'ventoAssento' | 'honba' | 'riichi' | 'ultimaPedra' | 'kan' | 'bencao' | 'descartes'>>
  fluxoCompleto?: boolean
  /** Regras vindas de fora (a mesa do Centerpiece). */
  configuracaoInicial?: ConfiguracaoCalculo
  /** Cópias que a partida já mostrou fora desta mão: contam no limite de 4 de cada pedra. */
  pedrasDaMesa?: CodigoPedra[]
  /**
   * Ron registrado na partida: a pedra descartada já é a batida. Ela aparece na mão
   * desde o começo, entra sozinha quando as outras 13 fecham e não dá para trocá-la.
   */
  pedraBatidaFixa?: CodigoPedra
  /** Sanma: regras de 3 jogadores. Ausente (ou `null`) = yonma, a mão fica como sempre. */
  regrasSanma?: RegrasSanma | null
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
export function useCalculadoraMao(opcoes?: OpcionsCalculadoraMao) {
  const estado = useEstadoMao(opcoes?.initialMao, opcoes?.configuracaoInicial)
  const {
    mao,
    atualizarMao,
    acaoPendente,
    setAcaoPendente,
    configuracao,
    slotsUsados,
    maoCompleta,
  } = estado
  // Sanma: a mão leva as regras (e o Kita) em `mao.sanma`; no yonma o campo não existe.
  // Limpar a mão também tira o campo, por isso ele volta aqui sempre que faltar.
  const regrasSanma = opcoes?.regrasSanma ?? null
  const sanmaAtual = mao.sanma
  const comNorte = mao.ventoAssento === '4' || mao.ventoRodada === '4'
  useEffect(() => {
    // Compara fora do rascunho (no immer o rascunho é outro objeto): sem mudança, nada é gravado.
    const desatualizada = regrasSanma ? sanmaAtual?.regras !== regrasSanma || comNorte : sanmaAtual !== undefined
    if (!desatualizada) return
    atualizarMao((rascunho) => {
      if (!regrasSanma) {
        delete rascunho.sanma
        return
      }
      rascunho.sanma = { regras: regrasSanma, kita: rascunho.sanma?.kita ?? 0 }
      // Não há assento nem rodada do Norte com 3 jogadores.
      if (rascunho.ventoAssento === '4') rascunho.ventoAssento = '1'
      if (rascunho.ventoRodada === '4') rascunho.ventoRodada = '1'
    })
  }, [atualizarMao, regrasSanma, sanmaAtual, comNorte])

  const [assinaturaCalculo, setAssinaturaCalculo] = useState<string | null>(null)
  const [etapaFinalizacaoAtiva, setEtapaFinalizacaoAtiva] = useState(false)
  const [selecionandoPedraAgari, setSelecionandoPedraAgari] = useState(false)
  const [escolhaChiiPendente, setEscolhaChiiPendente] = useState<EscolhaChiiPendente | null>(null)
  const [mensagemFinalizacao, setMensagemFinalizacao] = useState<string | null>(null)
  const fluxoPreconfiguradoRef = useRef(opcoes?.fluxoCompleto ?? false)
  const [fluxoOpcoes, setFluxoOpcoes] = useState({
    vitoriaDefinida: fluxoPreconfiguradoRef.current,
    ventoRodadaDefinido: true,
    ventoAssentoDefinido: fluxoPreconfiguradoRef.current,
  })

  // A tela pode crescer depois do primeiro render (girar o aparelho, trocar de
  // aparelho no DevTools). Ao virar tela grande, marca os padrões para todas as
  // opções aparecerem; ao voltar para o celular, mantém o que já foi escolhido.
  const fluxoCompleto = opcoes?.fluxoCompleto ?? false
  useEffect(() => {
    fluxoPreconfiguradoRef.current = fluxoCompleto
    if (!fluxoCompleto) return
    setFluxoOpcoes((fluxoAtual) => ({
      ...fluxoAtual,
      vitoriaDefinida: true,
      ventoAssentoDefinido: true,
    }))
  }, [fluxoCompleto])

  const assinaturaMaoAtual = useMemo(
    () =>
      JSON.stringify({
        mao,
        configuracao,
      }),
    [mao, configuracao],
  )
  const deveCalcularMao = maoCompleta && assinaturaCalculo === assinaturaMaoAtual

  // Pela chave: quem chama recria a lista a cada render, e as esperas recalculam quando ela muda.
  const pedraBatidaFixa = opcoes?.pedraBatidaFixa ?? null
  const batidaNaMao =
    !!pedraBatidaFixa && mao.indiceAgari >= 0 && mao.pedras[mao.indiceAgari] === pedraBatidaFixa
  /** A batida fixa que ainda não entrou na mão: aparece no fim dela e conta no limite. */
  const batidaReservada = pedraBatidaFixa && !batidaNaMao ? pedraBatidaFixa : null

  const chavePedrasDaMesa = [...(opcoes?.pedrasDaMesa ?? []), ...(batidaReservada ? [batidaReservada] : [])].join()
  const pedrasDaMesa = useMemo(
    () => (chavePedrasDaMesa ? chavePedrasDaMesa.split(',') : []),
    [chavePedrasDaMesa],
  )

  const acoesMelds = useAcoesMelds({
    mao,
    acaoPendente,
    slotsUsados,
    pedrasDaMesa,
    akadora: configuracao.akadora,
  })

  /*
   * Esperas precisam estar disponíveis antes das ações de clique:
   * ao clicar uma espera em furiten, a ação força `agari = ron` para exibir a penalidade correta.
   */
  const { esperasPossiveis, calculandoEsperas } = useEsperasMao({
    mao,
    configuracao,
    slotsUsados,
    pedrasDaMesa,
  })
  const resultados = useResultadoMao({
    mao,
    configuracao,
    maoCompleta,
    deveCalcularMao,
  })
  /*
   * Pedras que podem ser a batida (Mudar batida). Numa mão inválida não há esperas
   * para aproveitar e o cálculo roda a mão inteira para cada pedra, segundos no
   * celular. Por isso só roda quando a pessoa toca em Mudar batida (e depois de
   * desenhar a tela): completar a mão mostra Mudar batida e Finalizar mão na hora.
   */
  const [candidatasPedraAgari, setCandidatasPedraAgari] = useState(
    () => new Map<string, CandidataBatida>(),
  )
  useEffect(() => {
    setCandidatasPedraAgari(new Map())
    if (!maoCompleta || !selecionandoPedraAgari) return
    const id = window.setTimeout(() => setCandidatasPedraAgari(candidatasDaBatida(mao, configuracao)), 0)
    return () => window.clearTimeout(id)
  }, [configuracao, mao, maoCompleta, selecionandoPedraAgari])
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
    consumoDaMao: acoesMelds.consumoDaMao,
    sequenciasChiiPossiveis: acoesMelds.sequenciasChiiPossiveis,
    sequenciasChiiDaMaoPossiveis: acoesMelds.sequenciasChiiDaMaoPossiveis,
    setEscolhaChiiPendente,
    akadora: configuracao.akadora,
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
  const maoProntaParaEscolherBatida = maoCompleta
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
    setEscolhaChiiPendente(null)
    setMensagemFinalizacao(null)
    setEtapaFinalizacaoAtiva(true)
  }

  const alternarSelecaoPedraAgari = () => {
    // Ron da partida: a batida é a pedra descartada, não se escolhe outra.
    if (pedraBatidaFixa) return
    if (!maoCompleta) return
    setSelecionandoPedraAgari((selecionando) => {
      const proximo = !selecionando
      setEscolhaChiiPendente(null)
      setMensagemFinalizacao(proximo ? 'Escolha a pedra da batida.' : null)
      return proximo
    })
  }

  const escolherPedraAgariMao = (indicePedra: number) => {
    if (pedraBatidaFixa || !maoCompleta || indicePedra < 0 || indicePedra >= mao.pedras.length) return

    atualizarMao((rascunho) => {
      rascunho.indiceAgari = indicePedra
      rascunho.agariMeld = null
    })
    setSelecionandoPedraAgari(false)
    setMensagemFinalizacao('Pedra da batida selecionada.')
    setAssinaturaCalculo(null)
  }

  const escolherPedraAgariMeld = (indiceMeld: number, indicePedra: number) => {
    if (pedraBatidaFixa || !maoCompleta) return
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
    if (pedraBatidaFixa || !maoCompleta) return
    const trocada = trocarBatida(mao, pedra, configuracao)
    if (trocada) {
      atualizarMao((rascunho) => {
        rascunho.pedras = trocada.pedras
        rascunho.melds = trocada.melds
        rascunho.indiceAgari = trocada.indiceAgari
        rascunho.agariMeld = null
      })
      setSelecionandoPedraAgari(false)
      setMensagemFinalizacao('Pedra da batida selecionada.')
      setAssinaturaCalculo(null)
      return
    }
    const indicePedra = mao.pedras.findIndex((pedraMao) => pedraMao === pedra)
    if (indicePedra >= 0) {
      escolherPedraAgariMao(indicePedra)
      return
    }

    if (!mao.agariMeld) return
    const { indiceMeld, indicePedra: indicePedraMeld } = mao.agariMeld
    const pedraMeld = mao.melds[indiceMeld]?.pedras[indicePedraMeld]
    if (pedraMeld === pedra) escolherPedraAgariMeld(indiceMeld, indicePedraMeld)
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
    setEscolhaChiiPendente(null)
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
      vitoriaDefinida: fluxoPreconfiguradoRef.current,
      ventoRodadaDefinido: true,
      ventoAssentoDefinido: fluxoPreconfiguradoRef.current,
    })
    setEtapaFinalizacaoAtiva(false)
    setSelecionandoPedraAgari(false)
    setEscolhaChiiPendente(null)
    setAssinaturaCalculo(null)
  }, [setAcaoPendente, slotsUsados])

  useEffect(() => {
    if (maoProntaParaFinalizar) return

    setEtapaFinalizacaoAtiva(false)
    setSelecionandoPedraAgari(false)
    setEscolhaChiiPendente(null)
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
      setEscolhaChiiPendente(null)
      setMensagemFinalizacao(null)
      setAssinaturaCalculo(null)
    }

    acoesPedras.alternarAcao(tipo)
  }

  /** Entrada por notação: troca a mão e os melds e sai de qualquer escolha de batida em curso. */
  const substituirMaoNotacao = (entrada: Parameters<typeof acoesPedras.substituirMaoNotacao>[0]) => {
    setSelecionandoPedraAgari(false)
    setMensagemFinalizacao(null)
    acoesPedras.substituirMaoNotacao(entrada)
  }

  // Batida fixa: ao chegar a 13 slots vindo de menos (um Pon que fecha a mão, por
  // exemplo), a chamada em curso sai, para a batida poder entrar.
  const slotsAnterioresRef = useRef(slotsUsados)
  useEffect(() => {
    const anteriores = slotsAnterioresRef.current
    slotsAnterioresRef.current = slotsUsados
    if (pedraBatidaFixa && anteriores < 13 && slotsUsados === 13) setAcaoPendente(null)
  }, [pedraBatidaFixa, setAcaoPendente, slotsUsados])

  // Com as outras 13 prontas, a batida fixa entra na mão já marcada. Na notação, se
  // ela foi digitada, passa a ser a batida no lugar da última pedra digitada.
  useEffect(() => {
    if (!pedraBatidaFixa || batidaNaMao || mao.agariMeld) return
    if (slotsUsados === 13 && !acaoPendente) {
      atualizarMao((rascunho) => {
        rascunho.pedras.push(pedraBatidaFixa)
        ordenarPedras(rascunho.pedras)
        rascunho.indiceAgari = rascunho.pedras.lastIndexOf(pedraBatidaFixa)
        rascunho.agariMeld = null
      })
    } else if (maoCompleta && mao.pedras.includes(pedraBatidaFixa)) {
      atualizarMao((rascunho) => {
        rascunho.indiceAgari = rascunho.pedras.lastIndexOf(pedraBatidaFixa)
      })
    }
  }, [acaoPendente, atualizarMao, batidaNaMao, mao.agariMeld, mao.pedras, maoCompleta, pedraBatidaFixa, slotsUsados])

  /**
   * Batida fixa: tirar uma pedra da mão completa tira também a batida, que volta a
   * esperar no fim da mão. Tocar na própria batida não faz nada.
   */
  const removerPedra = (indicePedra: number) => {
    if (!batidaNaMao) {
      acoesPedras.removerPedra(indicePedra)
      return
    }
    if (indicePedra === mao.indiceAgari) return
    atualizarMao((rascunho) => {
      for (const indice of [indicePedra, rascunho.indiceAgari].sort((a, b) => b - a)) {
        rascunho.pedras.splice(indice, 1)
      }
      rascunho.indiceAgari = -1
      rascunho.agariMeld = null
    })
    setEscolhaChiiPendente(null)
    setAcaoPendente(null)
  }

  const removerMeld = (indiceMeld: number) => {
    if (batidaNaMao) {
      atualizarMao((rascunho) => {
        rascunho.pedras.splice(rascunho.indiceAgari, 1)
        rascunho.indiceAgari = -1
      })
    }
    acoesPedras.removerMeld(indiceMeld)
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
    escolhaChiiPendente,
    mensagemFinalizacao,
    candidatasPedraAgari,
    maoProntaParaFinalizar,
    maoProntaParaEscolherBatida,
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
    substituirMaoNotacao,
    removerPedra,
    removerMeld,
    batidaFixa: !!pedraBatidaFixa,
    batidaReservada,
    podeMeld,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    maoAberta,
  }
}

export type EstadoCalculadoraMao = ReturnType<typeof useCalculadoraMao>
