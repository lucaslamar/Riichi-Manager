import type { EstadoCenterpiece, ResultadoTsumo } from './tipos'
import { salvarSnapshot } from './historico'
import { processarPosVitoria } from './avancarRodada'

export function aplicarResultadoTsumo(
  estado: EstadoCenterpiece,
  resultado: ResultadoTsumo,
): EstadoCenterpiece {
  const comSnapshot = salvarSnapshot(estado, 'Tsumo')

  let totalRecebido = comSnapshot.riichiSticks * 1000

  const jogadoresIntermedios = comSnapshot.jogadores.map((j) => {
    if (j.id === resultado.vencedorId) return j
    const pagamento =
      j.vento === 'leste' ? resultado.pagamentoDealer : resultado.pagamentoNaoDealer
    totalRecebido += pagamento
    return { ...j, pontos: j.pontos - pagamento, riichi: false }
  })

  const jogadores = jogadoresIntermedios.map((j) =>
    j.id === resultado.vencedorId
      ? { ...j, pontos: j.pontos + totalRecebido, riichi: false }
      : j,
  )

  const posVitoria = processarPosVitoria(
    { ...comSnapshot, jogadores, riichiSticks: 0 },
    resultado.vencedorId,
  )

  return posVitoria
}
