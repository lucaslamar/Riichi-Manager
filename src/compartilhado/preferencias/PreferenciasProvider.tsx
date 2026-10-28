/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  COR_BARRA_NAVEGADOR,
  resolverTema,
  type PreferenciaTema,
  type TemaEfetivo,
} from '@/compartilhado/tema/temas'

/**
 * Chaves no localStorage. As mesmas do script em `index.html`, que aplica o
 * tema e as classes antes do React montar (sem piscar o tema claro).
 */
export const CHAVES_PREFERENCIAS = {
  tema: 'riichi-manager-tema',
  altoContraste: 'riichi-manager-alto-contraste',
  modoCompacto: 'riichi-manager-modo-compacto',
  toqueAmpliado: 'riichi-manager-toque-ampliado',
} as const

export interface Preferencias {
  tema: PreferenciaTema
  altoContraste: boolean
  modoCompacto: boolean
  toqueAmpliado: boolean
}

interface ContextoPreferencias extends Preferencias {
  temaEfetivo: TemaEfetivo
  alterar: <Chave extends keyof Preferencias>(chave: Chave, valor: Preferencias[Chave]) => void
}

const PreferenciasContext = createContext<ContextoPreferencias | null>(null)

const CONSULTA_ESCURO = '(prefers-color-scheme: dark)'

function lerArmazenado(chave: string) {
  try {
    return window.localStorage.getItem(chave)
  } catch {
    return null
  }
}

function salvar(chave: string, valor: string) {
  try {
    window.localStorage.setItem(chave, valor)
  } catch {
    // Navegação privada ou armazenamento bloqueado: a escolha vale só nesta sessão.
  }
}

function lerPreferencias(): Preferencias {
  const tema = lerArmazenado(CHAVES_PREFERENCIAS.tema)
  return {
    // Sem escolha salva, o app abre no tema escuro.
    tema: tema === 'claro' || tema === 'automatico' ? tema : 'escuro',
    altoContraste: lerArmazenado(CHAVES_PREFERENCIAS.altoContraste) === 'true',
    modoCompacto: lerArmazenado(CHAVES_PREFERENCIAS.modoCompacto) === 'true',
    toqueAmpliado: lerArmazenado(CHAVES_PREFERENCIAS.toqueAmpliado) === 'true',
  }
}

function sistemaEstaEscuro() {
  return window.matchMedia?.(CONSULTA_ESCURO).matches ?? false
}

/**
 * Preferências de uso (tema, alto contraste, modo compacto e toque ampliado).
 * Aplicadas no documento desde a abertura do app, em qualquer tela.
 */
export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState(lerPreferencias)
  const [sistemaEscuro, setSistemaEscuro] = useState(sistemaEstaEscuro)

  useEffect(() => {
    const consulta = window.matchMedia?.(CONSULTA_ESCURO)
    if (!consulta) return
    const aoMudar = (evento: MediaQueryListEvent) => setSistemaEscuro(evento.matches)
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  const temaEfetivo = resolverTema(preferencias.tema, sistemaEscuro)

  useEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.tema = temaEfetivo
    raiz.style.colorScheme = temaEfetivo === 'escuro' ? 'dark' : 'light'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', COR_BARRA_NAVEGADOR[temaEfetivo])
  }, [temaEfetivo])

  useEffect(() => {
    const { tema, altoContraste, modoCompacto, toqueAmpliado } = preferencias
    document.body.classList.toggle('alto-contraste', altoContraste)
    document.body.classList.toggle('modo-compacto', modoCompacto)
    document.body.classList.toggle('toque-ampliado', toqueAmpliado)
    salvar(CHAVES_PREFERENCIAS.tema, tema)
    salvar(CHAVES_PREFERENCIAS.altoContraste, String(altoContraste))
    salvar(CHAVES_PREFERENCIAS.modoCompacto, String(modoCompacto))
    salvar(CHAVES_PREFERENCIAS.toqueAmpliado, String(toqueAmpliado))
  }, [preferencias])

  const alterar = useCallback<ContextoPreferencias['alterar']>((chave, valor) => {
    setPreferencias((atuais) => ({ ...atuais, [chave]: valor }))
  }, [])

  const valor = useMemo<ContextoPreferencias>(
    () => ({ ...preferencias, temaEfetivo, alterar }),
    [preferencias, temaEfetivo, alterar],
  )

  return <PreferenciasContext.Provider value={valor}>{children}</PreferenciasContext.Provider>
}

export function usePreferencias() {
  const contexto = useContext(PreferenciasContext)
  if (!contexto) {
    throw new Error('usePreferencias deve ser usado dentro de PreferenciasProvider')
  }
  return contexto
}
