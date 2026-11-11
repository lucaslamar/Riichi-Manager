import { useCallback, useState } from 'react'
import { localStorageDireto } from '@/compartilhado/persistencia/armazenamento'
import { lerVariante, type Variante } from '@/compartilhado/mahjong/variante'

export type ModuloVariante = 'calculadora-mao' | 'han-fu' | 'partida' | 'torneio' | 'ranking' | 'registro'

const chave = (modulo: ModuloVariante) => `mojoca:variante:${modulo}`

/**
 * Variante escolhida no módulo, lembrada em `mojoca:variante:<modulo>`. Sem nada
 * guardado, é `yonma` (4 jogadores).
 */
export function useVarianteModulo(modulo: ModuloVariante): [Variante, (variante: Variante) => void] {
  const [guardada, setGuardada] = useState<Variante>(() => lerVariante(localStorageDireto.ler(chave(modulo))))
  const alterar = useCallback(
    (variante: Variante) => {
      setGuardada(variante)
      localStorageDireto.gravar(chave(modulo), variante)
    },
    [modulo],
  )
  return [guardada, alterar]
}
