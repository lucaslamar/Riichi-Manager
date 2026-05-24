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
import type { ModoCalculadora, EstadoMaoCalculadora } from './tipos'

/**
 * Mantém o estado editável da calculadora em um ponto único.
 * Também expõe contadores derivados usados por validações, cabeçalho e resultado.
 *
 * Este arquivo deve continuar simples: ele cria estado, calcula totais e devolve tudo.
 * Regras de clique, resultado e esperas pertencem aos hooks vizinhos.
 */
export function useEstadoMao(): EstadoMaoCalculadora {
  const [mao, atualizarMao] = useImmer<Mao>(MAO_VAZIA)
  const [acaoPendente, setAcaoPendente] = useState<Acao | null>(null)
  const [modo, setModo] = useState<ModoCalculadora>('completo')
  const [configuracao, setConfiguracao] = useState<ConfiguracaoCalculo>(configuracaoPadrao)
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false)
  const [han, setHan] = useState(1)
  const [fu, setFu] = useState(30)

  const totalPedras = contarPedrasTotais(mao)
  const slotsUsados = contarSlotsLogicos(mao)
  const maoCompleta = slotsUsados >= 14

  return {
    mao,
    atualizarMao,
    acaoPendente,
    setAcaoPendente,
    modo,
    setModo,
    configuracao,
    setConfiguracao,
    modalRegrasAberto,
    setModalRegrasAberto,
    han,
    setHan,
    fu,
    setFu,
    totalPedras,
    slotsUsados,
    maoCompleta,
  }
}
