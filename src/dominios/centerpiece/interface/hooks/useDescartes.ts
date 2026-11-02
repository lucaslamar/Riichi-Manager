import { useMemo } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { removerMao, type MaoInformada, type TipoChamada } from '../../logica/descartes'
import type { Cadeira, Partida } from '../../logica/partida'
import {
  chamarPedra,
  registrarDescartes,
  registrarKakan,
  salvarMaoInformada,
} from '../../logica/registroPartida'

/** Ações do registro de descartes da partida aberta. */
export function useDescartes(atualizar: (transformar: (partida: Partida) => Partida) => void) {
  return useMemo(
    () => ({
      descartar: (cadeira: Cadeira, pedras: CodigoPedra[], riichi: boolean) =>
        atualizar((atual) =>
          registrarDescartes(atual, cadeira, pedras, { riichi }, {
            id: gerarId(),
            agora: new Date().toISOString(),
          }),
        ),
      kakan: (cadeira: Cadeira, pedra: CodigoPedra, fechado = false) =>
        atualizar((atual) => registrarKakan(atual, cadeira, pedra, fechado)),
      chamar: (ordem: number, chamada?: { cadeira: Cadeira; tipo: TipoChamada }) =>
        atualizar((atual) => chamarPedra(atual, ordem, chamada)),
      informarMao: (cadeira: Cadeira, mao: Omit<MaoInformada, 'aposOrdem'>) =>
        atualizar((atual) => salvarMaoInformada(atual, cadeira, mao)),
      apagarMao: (cadeira: Cadeira) =>
        atualizar((atual) =>
          atual.registro ? { ...atual, registro: removerMao(atual.registro, cadeira) } : atual,
        ),
    }),
    [atualizar],
  )
}

export type AcoesDescartes = ReturnType<typeof useDescartes>
