import type { Dispatch, SetStateAction } from 'react'
import type { Updater } from 'use-immer'
import type {
  Acao,
  CodigoPedra,
  ConfiguracaoCalculo,
  EsperaPossivel,
  Mao,
} from '../../../logica/mao'

export type ModoCalculadora = 'completo' | 'rapido'
export type TipoMeldCalculadora = 'chii' | 'pon' | 'kanAberto' | 'kanFechado'

/**
 * Estado bruto e setters compartilhados entre os hooks especializados.
 * Mantém o tipo explícito para facilitar manutenção sem precisar abrir o hook orquestrador.
 */
export interface EstadoMaoCalculadora {
  mao: Mao
  atualizarMao: Updater<Mao>
  acaoPendente: Acao | null
  setAcaoPendente: Dispatch<SetStateAction<Acao | null>>
  modo: ModoCalculadora
  setModo: Dispatch<SetStateAction<ModoCalculadora>>
  configuracao: ConfiguracaoCalculo
  setConfiguracao: Dispatch<SetStateAction<ConfiguracaoCalculo>>
  modalRegrasAberto: boolean
  setModalRegrasAberto: Dispatch<SetStateAction<boolean>>
  han: number
  setHan: Dispatch<SetStateAction<number>>
  fu: number
  setFu: Dispatch<SetStateAction<number>>
  totalPedras: number
  slotsUsados: number
  maoCompleta: boolean
}

/**
 * Funções puras de validação de clique/meld.
 * Elas não devem alterar estado; quem muta a mão é `useAcoesPedras`.
 */
export interface AcoesMeldsCalculadora {
  contarCodigo: (codigo: CodigoPedra) => number
  contarAka: (codigo: CodigoPedra) => number
  indicesPedrasNaMaoPara: (pedras: CodigoPedra[]) => number[]
  podeFormarMeldComMao: (pedras: CodigoPedra[], slotsMeld?: number) => boolean
  podeAdicionarPedras: (pedras: CodigoPedra[]) => boolean
  podeSelecionarPedra: (pedra: CodigoPedra) => boolean
  podeChii: boolean
  podePon: boolean
  podeKanAberto: boolean
  podeKanFechado: boolean
  sequenciasChiiPossiveis: (pedras: CodigoPedra[]) => CodigoPedra[][]
  escolherSequenciaChii: (
    pedrasSelecionadas: CodigoPedra[],
    sequencias: CodigoPedra[][],
  ) => CodigoPedra[] | null
}

/** Resultado do cálculo assíncrono de esperas para mãos com 13 slots. */
export interface EstadoEsperasCalculadora {
  esperasPossiveis: EsperaPossivel[]
  calculandoEsperas: boolean
}
