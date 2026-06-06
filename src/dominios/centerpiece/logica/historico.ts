import type { EstadoCenterpiece, SnapshotCenterpiece } from './tipos'

const MAX_HISTORICO = 20

export function salvarSnapshot(estado: EstadoCenterpiece, descricao: string): EstadoCenterpiece {
  const snapshot: SnapshotCenterpiece = {
    descricao,
    iniciada: estado.iniciada,
    jogadores: estado.jogadores,
    rodadaVento: estado.rodadaVento,
    rodadaNumero: estado.rodadaNumero,
    honba: estado.honba,
    riichiSticks: estado.riichiSticks,
    pontosIniciais: estado.pontosIniciais,
  }
  return {
    ...estado,
    historico: [snapshot, ...estado.historico].slice(0, MAX_HISTORICO),
  }
}

export function desfazerUltimaAcao(estado: EstadoCenterpiece): EstadoCenterpiece {
  if (estado.historico.length === 0) return estado
  const [ultimo, ...restante] = estado.historico
  return { ...ultimo, historico: restante }
}
