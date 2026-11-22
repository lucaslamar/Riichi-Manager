import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { faseDaRodada } from './formatos/eliminatorio'
import { totalDeRodadas } from './torneio'
import type { Torneio } from './tipos'

/**
 * Jogos que faltam para o jogador, até onde os pontos de agora valem. null: o formato
 * não tem número de rodadas. Cortado no Eliminatório não joga mais.
 */
export function jogosRestantes(
  torneio: Torneio,
  partidas: readonly Partida[],
  jogadorId: string,
): number | null {
  if (torneio.status === 'finalizado') return 0
  const { formato } = torneio
  const total = totalDeRodadas(formato)
  if (total === null) return null

  let limite = total
  let rodadasQueContam = new Set(torneio.rodadas.map((rodada) => rodada.numero))
  if (formato.tipo === 'eliminatorio') {
    const fase = Math.max(0, ...torneio.rodadas.map(faseDaRodada))
    const daFase = torneio.rodadas.filter((rodada) => faseDaRodada(rodada) === fase)
    const naFase = daFase.some((rodada) =>
      rodada.mesas.some((mesa) => mesa.assentos.includes(jogadorId)),
    )
    if (fase > 0 && !naFase) return 0
    // Com os pontos zerados a cada corte, a diferença só vale até o fim da fase.
    if (!formato.pontosCarregados) {
      limite = fase === 0 ? formato.rodadasClassificatoria : formato.rodadasPorFase
      rodadasQueContam = new Set(daFase.map((rodada) => rodada.numero))
    }
  }

  const jogados = partidas.filter(
    ({ status, vinculoTorneio, resultado }) =>
      status === 'finalizada' &&
      vinculoTorneio?.torneioId === torneio.id &&
      rodadasQueContam.has(vinculoTorneio.rodada + 1) &&
      resultado?.some((linha) => linha.jogadorId === jogadorId),
  ).length
  return Math.max(0, limite - jogados)
}
