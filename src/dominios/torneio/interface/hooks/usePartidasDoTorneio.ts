import { useMemo } from 'react'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { usePartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { acoesPlacaresMcr, usePlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'
import { partidasDoTorneioMcr } from '@/dominios/placar-mcr/logica/torneio'

/**
 * As partidas que o Torneio lê. No modo Chinês, são os placares MCR das mesas,
 * pontuados com os pontos de mesa; o resto do Torneio é o mesmo do Riichi.
 */
export function usePartidasDoTorneio() {
  const riichi = usePartidas()
  const placares = usePlacaresMcr()
  const chines = useModoJogoAtual() === 'mcr'
  const partidasMcr = useMemo(() => partidasDoTorneioMcr(placares), [placares])
  if (!chines) return riichi
  return {
    ...riichi,
    partidas: partidasMcr,
    descartarDoTorneio: (torneioId: string) =>
      placares
        .filter((placar) => placar.torneio?.id === torneioId)
        .forEach((placar) => acoesPlacaresMcr.excluir(placar.id)),
  }
}
