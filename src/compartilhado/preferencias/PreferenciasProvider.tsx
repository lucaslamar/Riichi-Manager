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
  TEMA_AZUL,
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
  telaCheiaMesa: 'riichi-manager-tela-cheia-mesa',
  telaAcesaMesa: 'riichi-manager-tela-acesa-mesa',
  pedras: 'riichi-manager-pedras',
} as const

/** Cor das pedras: automático segue o tema (pretas no claro, brancas no escuro). */
export type PreferenciaPedras = 'automatico' | 'brancas' | 'pretas'
export type PedrasEfetivas = 'brancas' | 'pretas'

export function resolverPedras(pedras: PreferenciaPedras, tema: TemaEfetivo): PedrasEfetivas {
  if (pedras !== 'automatico') return pedras
  return tema === 'claro' ? 'pretas' : 'brancas'
}

export interface Preferencias {
  tema: PreferenciaTema
  altoContraste: boolean
  modoCompacto: boolean
  toqueAmpliado: boolean
  /** Entra em tela cheia no toque que abre uma mesa. */
  telaCheiaMesa: boolean
  telaAcesaMesa: boolean
  pedras: PreferenciaPedras
}

interface ContextoPreferencias extends Preferencias {
  temaEfetivo: TemaEfetivo
  pedrasEfetivas: PedrasEfetivas
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

function lerPedras(valor: string | null): PreferenciaPedras {
  return valor === 'brancas' || valor === 'pretas' ? valor : 'automatico'
}

function lerPreferencias(): Preferencias {
  const tema = lerArmazenado(CHAVES_PREFERENCIAS.tema)
  return {
    // Sem escolha salva, o app abre no tema escuro.
    tema: tema === 'claro' || tema === 'automatico' || tema === 'azul' ? tema : 'escuro',
    altoContraste: lerArmazenado(CHAVES_PREFERENCIAS.altoContraste) === 'true',
    modoCompacto: lerArmazenado(CHAVES_PREFERENCIAS.modoCompacto) === 'true',
    toqueAmpliado: lerArmazenado(CHAVES_PREFERENCIAS.toqueAmpliado) === 'true',
    telaCheiaMesa: lerArmazenado(CHAVES_PREFERENCIAS.telaCheiaMesa) === 'true',
    telaAcesaMesa: lerArmazenado(CHAVES_PREFERENCIAS.telaAcesaMesa) !== 'false',
    pedras: lerPedras(lerArmazenado(CHAVES_PREFERENCIAS.pedras)),
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
  const pedrasEfetivas = resolverPedras(preferencias.pedras, temaEfetivo)

  // Face das pedras (CSS) e arte (PedraSvg) leem daqui.
  useEffect(() => {
    document.documentElement.dataset.pedras = pedrasEfetivas
  }, [pedrasEfetivas])

  useEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.tema = temaEfetivo
    raiz.style.colorScheme = temaEfetivo === 'escuro' ? 'dark' : 'light'
    const azul = preferencias.tema === 'azul'
    if (azul) raiz.dataset.cor = 'azul'
    else delete raiz.dataset.cor
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', azul ? TEMA_AZUL.navBackground : COR_BARRA_NAVEGADOR[temaEfetivo])
  }, [temaEfetivo, preferencias.tema])

  useEffect(() => {
    const { tema, altoContraste, modoCompacto, toqueAmpliado, telaCheiaMesa, telaAcesaMesa, pedras } = preferencias
    document.body.classList.toggle('alto-contraste', altoContraste)
    document.body.classList.toggle('modo-compacto', modoCompacto)
    document.body.classList.toggle('toque-ampliado', toqueAmpliado)
    salvar(CHAVES_PREFERENCIAS.tema, tema)
    salvar(CHAVES_PREFERENCIAS.altoContraste, String(altoContraste))
    salvar(CHAVES_PREFERENCIAS.modoCompacto, String(modoCompacto))
    salvar(CHAVES_PREFERENCIAS.toqueAmpliado, String(toqueAmpliado))
    salvar(CHAVES_PREFERENCIAS.telaCheiaMesa, String(telaCheiaMesa))
    salvar(CHAVES_PREFERENCIAS.telaAcesaMesa, String(telaAcesaMesa))
    salvar(CHAVES_PREFERENCIAS.pedras, pedras)
  }, [preferencias])

  const alterar = useCallback<ContextoPreferencias['alterar']>((chave, valor) => {
    setPreferencias((atuais) => ({ ...atuais, [chave]: valor }))
  }, [])

  const valor = useMemo<ContextoPreferencias>(
    () => ({ ...preferencias, temaEfetivo, pedrasEfetivas, alterar }),
    [preferencias, temaEfetivo, pedrasEfetivas, alterar],
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
