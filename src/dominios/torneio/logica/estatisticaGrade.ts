import { estatisticaDaGrade, type EstatisticaDaGrade } from '@/compartilhado/sorteio/estatistica'
import { faseDaRodada } from './formatos/eliminatorio'
import { jogadoresPorMesa, sorteiaVentos } from './torneio'
import type { Torneio } from './tipos'

/**
 * Qualidade do sorteio até a rodada (sem `numero`, do torneio inteiro). A grade do
 * Rodízio sai de uma vez, então conta inteira. No Eliminatório vale a classificatória:
 * nos cortes as mesas vêm da classificação e repetir é inevitável.
 */
export function estatisticaDoTorneio(torneio: Torneio, numero?: number): EstatisticaDaGrade | null {
  const { formato, jogadorIds } = torneio
  const porMesa = jogadoresPorMesa(torneio)
  // Uma mesa só: não há o que sortear.
  if (jogadorIds.length <= porMesa) return null

  let rodadas = torneio.rodadas
  let gradeInteira = formato.tipo === 'rodizio'
  if (formato.tipo === 'eliminatorio') {
    const vista = rodadas.find((rodada) => rodada.numero === numero)
    if (vista && faseDaRodada(vista) > 0) return null
    rodadas = rodadas.filter((rodada) => faseDaRodada(rodada) === 0)
    gradeInteira = formato.classificatoria === 'rodizio'
  }
  if (numero !== undefined && !gradeInteira) rodadas = rodadas.filter((rodada) => rodada.numero <= numero)
  if (rodadas.length === 0) return null

  return estatisticaDaGrade(rodadas, jogadorIds, porMesa, sorteiaVentos(torneio))
}
