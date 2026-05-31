import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

/**
 * Contrato de interface da etapa de finalizacao.
 *
 * A finalizacao revisa a mao completa, configura a vitoria e calcula o resultado.
 * Ela nao remove tiles ou melds; a edicao estrutural volta para a montagem pelo lapis.
 */
export function useFinalizacaoMao(estado: EstadoCalculadoraMao) {
  return {
    mao: estado.mao,
    atualizarMao: estado.atualizarMao,
    configuracao: estado.configuracao,
    setConfiguracao: estado.setConfiguracao,
    maoCompleta: estado.maoCompleta,
    maoProntaParaFinalizar: estado.maoProntaParaFinalizar,
    etapaFinalizacaoAtiva: estado.etapaFinalizacaoAtiva,
    slotsUsados: estado.slotsUsados,
    totalPedras: estado.totalPedras,
    maoAberta: estado.maoAberta,
    fluxoOpcoes: estado.fluxoOpcoes,
    fluxoConfiguracaoCompleto: estado.fluxoConfiguracaoCompleto,
    marcarVitoriaDefinida: estado.marcarVitoriaDefinida,
    marcarVentoRodadaDefinido: estado.marcarVentoRodadaDefinido,
    marcarVentoAssentoDefinido: estado.marcarVentoAssentoDefinido,
    escolherPedraAgariMao: estado.escolherPedraAgariMao,
    escolherPedraAgariMeld: estado.escolherPedraAgariMeld,
    voltarParaMontagem: estado.voltarParaMontagem,
    limpar: estado.limpar,
    resultado: estado.resultado,
    furitenRonCompleto: estado.furitenRonCompleto,
    deveCalcularMao: estado.deveCalcularMao,
    podeCalcularMao: estado.podeCalcularMao,
    calcularMaoAtual: estado.calcularMaoAtual,
    resultadoComYakuValido: estado.resultadoComYakuValido,
    resultadoMaoInvalida: estado.resultadoMaoInvalida,
  }
}

export type EstadoFinalizacaoMao = ReturnType<typeof useFinalizacaoMao>
