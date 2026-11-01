import type { EstadoTorneio } from '../../logica/tipos'

export interface PropsComTorneio {
  torneio: EstadoTorneio
}

export interface PropsComAtualizacao extends PropsComTorneio {
  /** Recebe uma função que transforma o estado atual no próximo estado. */
  atualizarTorneio: (fn: (torneioAtual: EstadoTorneio) => EstadoTorneio) => void
}
