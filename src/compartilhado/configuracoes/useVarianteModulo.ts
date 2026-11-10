import { useCallback, useState } from 'react'
import { localStorageDireto } from '@/compartilhado/persistencia/armazenamento'
import { lerVariante, type Variante } from '@/compartilhado/mahjong/variante'
import { useConfigSanma } from './useConfigSanma'

export type ModuloVariante = 'calculadora-mao' | 'han-fu' | 'partida' | 'torneio' | 'ranking' | 'registro'

const chave = (modulo: ModuloVariante) => `mojoca:variante:${modulo}`

/**
 * Variante escolhida no módulo, lembrada em `mojoca:variante:<modulo>`. Com o
 * Sanma desligado é sempre `yonma`, seja o que for que estiver guardado.
 */
export function useVarianteModulo(modulo: ModuloVariante): [Variante, (variante: Variante) => void] {
  const { sanmaHabilitado } = useConfigSanma()
  const [guardada, setGuardada] = useState<Variante>(() => lerVariante(localStorageDireto.ler(chave(modulo))))
  const alterar = useCallback(
    (variante: Variante) => {
      setGuardada(variante)
      localStorageDireto.gravar(chave(modulo), variante)
    },
    [modulo],
  )
  return [sanmaHabilitado ? guardada : 'yonma', alterar]
}
