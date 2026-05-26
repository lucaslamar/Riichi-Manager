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

type Dicionario = Record<string, unknown>

export const IDIOMA_PADRAO = 'pt-BR'

const IDIOMAS_SUPORTADOS = ['pt-BR', 'en-US', 'ja-JP', 'zh-CN', 'ko-KR'] as const

export type IdiomaSuportado = (typeof IDIOMAS_SUPORTADOS)[number]

interface ContextoI18n {
  idioma: IdiomaSuportado
  idiomas: readonly IdiomaSuportado[]
  alterarIdioma: (idioma: IdiomaSuportado) => void
  t: (chave: string, parametros?: Record<string, string | number>) => string
}

const I18nContext = createContext<ContextoI18n | null>(null)

function ehIdiomaSuportado(idioma: string | null): idioma is IdiomaSuportado {
  return !!idioma && IDIOMAS_SUPORTADOS.includes(idioma as IdiomaSuportado)
}

function buscarValor(dicionario: Dicionario, chave: string): string | undefined {
  const valor = chave.split('.').reduce<unknown>((atual, parte) => {
    if (!atual || typeof atual !== 'object') return undefined
    return (atual as Dicionario)[parte]
  }, dicionario)

  return typeof valor === 'string' ? valor : undefined
}

function interpolar(texto: string, parametros?: Record<string, string | number>) {
  if (!parametros) return texto
  return Object.entries(parametros).reduce(
    (textoAtual, [chave, valor]) => textoAtual.split(`{{${chave}}}`).join(String(valor)),
    texto,
  )
}

async function carregarDicionario(idioma: IdiomaSuportado): Promise<Dicionario> {
  const resposta = await fetch(`${import.meta.env.BASE_URL}locales/${idioma}.json`)
  if (!resposta.ok) throw new Error(`Locale nao encontrado: ${idioma}`)
  return resposta.json() as Promise<Dicionario>
}

/**
 * Carrega textos visiveis a partir de `public/locales`, preservando fallback em pt-BR.
 *
 * Chamado uma vez no ponto de entrada da aplicacao. Componentes novos devem usar `useI18n`
 * para evitar textos hardcoded e manter compatibilidade com GitHub Pages via `BASE_URL`.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<IdiomaSuportado>(() => {
    const salvo = window.localStorage.getItem('riichi-manager-idioma')
    return ehIdiomaSuportado(salvo) ? salvo : IDIOMA_PADRAO
  })
  const [dicionarioPadrao, setDicionarioPadrao] = useState<Dicionario>({})
  const [dicionarioAtual, setDicionarioAtual] = useState<Dicionario>({})

  useEffect(() => {
    let cancelado = false

    carregarDicionario(IDIOMA_PADRAO)
      .then((dicionario) => {
        if (!cancelado) setDicionarioPadrao(dicionario)
      })
      .catch(() => {
        if (!cancelado) setDicionarioPadrao({})
      })

    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    let cancelado = false

    carregarDicionario(idioma)
      .then((dicionario) => {
        if (!cancelado) setDicionarioAtual(dicionario)
      })
      .catch(() => {
        if (!cancelado) setDicionarioAtual({})
      })

    document.documentElement.lang = idioma
    window.localStorage.setItem('riichi-manager-idioma', idioma)

    return () => {
      cancelado = true
    }
  }, [idioma])

  const traduzir = useCallback(
    (chave: string, parametros?: Record<string, string | number>) => {
      const texto = buscarValor(dicionarioAtual, chave) ?? buscarValor(dicionarioPadrao, chave)
      return interpolar(texto ?? chave, parametros)
    },
    [dicionarioAtual, dicionarioPadrao],
  )

  const valor = useMemo<ContextoI18n>(
    () => ({
      idioma,
      idiomas: IDIOMAS_SUPORTADOS,
      alterarIdioma: setIdioma,
      t: traduzir,
    }),
    [idioma, traduzir],
  )

  return <I18nContext.Provider value={valor}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const contexto = useContext(I18nContext)
  if (!contexto) {
    throw new Error('useI18n deve ser usado dentro de I18nProvider')
  }
  return contexto
}
