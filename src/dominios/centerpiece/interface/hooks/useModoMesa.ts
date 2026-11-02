import { useState } from 'react'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import type { ModoMesa } from '../componentes/MesaQuadrada'

const CHAVE = 'riichi-manager-modo-mesa'

/** A escolha da pessoa vale; sem escolha, tela baixa deitada abre em lista. */
export function useModoMesa() {
  const telaBaixa = useMediaQuery('(orientation: landscape) and (max-height: 500px)')
  const [escolhido, setEscolhido] = useState<ModoMesa | null>(() => {
    const salvo = armazenamentoLocal.ler(CHAVE)
    return salvo === 'mesa' || salvo === 'lista' ? salvo : null
  })
  const modo: ModoMesa = escolhido ?? (telaBaixa ? 'lista' : 'mesa')
  return {
    modo,
    alternar: () => {
      const proximo: ModoMesa = modo === 'mesa' ? 'lista' : 'mesa'
      setEscolhido(proximo)
      armazenamentoLocal.gravar(CHAVE, proximo)
    },
  }
}
