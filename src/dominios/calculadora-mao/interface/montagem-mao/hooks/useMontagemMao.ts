import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

/**
 * Contrato de interface da etapa de montagem.
 *
 * A montagem e a unica etapa com handlers destrutivos de estrutura: adicionar/remover
 * pedras, criar/remover melds, marcar descartes/furiten e escolher a batida antes de
 * avancar para a finalizacao.
 */
export function useMontagemMao(estado: EstadoCalculadoraMao) {
  return {
    mao: estado.mao,
    atualizarMao: estado.atualizarMao,
    acaoPendente: estado.acaoPendente,
    configuracao: estado.configuracao,
    totalPedras: estado.totalPedras,
    slotsUsados: estado.slotsUsados,
    maoCompleta: estado.maoCompleta,
    podeSelecionarPedra: estado.podeSelecionarPedra,
    adicionarPedra: estado.adicionarPedra,
    removerPedra: estado.removerPedra,
    removerMeld: estado.removerMeld,
    removerDescarte: estado.removerDescarte,
    limpar: estado.limpar,
    alternarAcao: estado.alternarAcao,
    podeChii: estado.podeChii,
    podePon: estado.podePon,
    podeKanAberto: estado.podeKanAberto,
    podeKanFechado: estado.podeKanFechado,
    esperasPossiveis: estado.esperasPossiveis,
    maoProntaParaFinalizar: estado.maoProntaParaFinalizar,
    selecionandoPedraAgari: estado.selecionandoPedraAgari,
    mensagemFinalizacao: estado.mensagemFinalizacao,
    candidatasPedraAgari: estado.candidatasPedraAgari,
    fluxoOpcoes: estado.fluxoOpcoes,
    finalizarMao: estado.finalizarMao,
    alternarSelecaoPedraAgari: estado.alternarSelecaoPedraAgari,
    escolherPedraAgariMao: estado.escolherPedraAgariMao,
    escolherPedraAgariMeld: estado.escolherPedraAgariMeld,
    escolherPedraAgariPorCodigo: estado.escolherPedraAgariPorCodigo,
    resultadoMaoInvalida: estado.resultadoMaoInvalida,
  }
}

export type EstadoMontagemMao = ReturnType<typeof useMontagemMao>
