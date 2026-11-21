/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { nomeApp } from '@/compartilhado/marca/nome-app'
import { CHAVE_MODO_JOGO, lerModoJogo, type ModoJogo } from './tipos'

interface ContextoModoJogo {
  modo: ModoJogo
  setModo: (modo: ModoJogo) => void
  isChines: boolean
}

const ModoJogoContext = createContext<ContextoModoJogo | null>(null)

function lerArmazenado(): ModoJogo {
  try {
    return lerModoJogo(window.localStorage.getItem(CHAVE_MODO_JOGO))
  } catch {
    return lerModoJogo(null)
  }
}

/** Modo de jogo global. Vale na hora, em todo o app, e fica salvo no aparelho. */
export function ModoJogoProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState(lerArmazenado)

  useEffect(() => {
    document.documentElement.dataset.modo = modo
    document.title = nomeApp(modo)
    try {
      window.localStorage.setItem(CHAVE_MODO_JOGO, modo)
    } catch {
      // Armazenamento bloqueado: a escolha vale só nesta sessão.
    }
  }, [modo])

  const valor = useMemo(() => ({ modo, setModo, isChines: modo === 'mcr' }), [modo])
  return <ModoJogoContext.Provider value={valor}>{children}</ModoJogoContext.Provider>
}

export function useModoJogo() {
  const contexto = useContext(ModoJogoContext)
  if (!contexto) throw new Error('useModoJogo deve ser usado dentro de ModoJogoProvider')
  return contexto
}

/** O modo atual, ou o Riichi fora do provedor (telas isoladas e testes). */
export function useModoJogoAtual(): ModoJogo {
  return useContext(ModoJogoContext)?.modo ?? 'riichi'
}
