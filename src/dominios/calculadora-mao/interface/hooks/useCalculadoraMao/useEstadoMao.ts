import { useState } from 'react'
import { useImmer } from 'use-immer'
import {
  configuracaoPadrao,
  contarPedrasTotais,
  contarSlotsLogicos,
  type Acao,
  type Mao,
  type ConfiguracaoCalculo,
} from '../../../logica/mao'
import { MAO_VAZIA } from '../../constantes'
import type { EstadoMaoCalculadora } from './tipos'

/**
 * Mantém o estado editável da calculadora em um ponto único.
 * Também expõe contadores derivados usados por validações, cabeçalho e resultado.
 *
 * Este arquivo deve continuar simples: ele cria estado, calcula totais e devolve tudo.
 * Regras de clique, resultado e esperas pertencem aos hooks vizinhos.
 */
type InitialMaoOverrides = Partial<Pick<Mao, 'agari' | 'ventoRodada' | 'ventoAssento' | 'honba'>>

export function useEstadoMao(initialMao?: InitialMaoOverrides): EstadoMaoCalculadora {
  const [mao, atualizarMao] = useImmer<Mao>(initialMao ? { ...MAO_VAZIA, ...initialMao } : MAO_VAZIA)
  const [acaoPendente, setAcaoPendente] = useState<Acao | null>(null)
  const [configuracao, setConfiguracao] = useState<ConfiguracaoCalculo>(configuracaoPadrao)
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false)

  const totalPedras = contarPedrasTotais(mao)
  const slotsUsados = contarSlotsLogicos(mao)
  const maoCompleta = slotsUsados >= 14

  return {
    mao,
    atualizarMao,
    acaoPendente,
    setAcaoPendente,
    configuracao,
    setConfiguracao,
    modalRegrasAberto,
    setModalRegrasAberto,
    totalPedras,
    slotsUsados,
    maoCompleta,
  }
}
