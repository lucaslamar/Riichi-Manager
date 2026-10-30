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
import packageJson from '../../../package.json'
import {
  CADEIA_RESERVA,
  IDIOMAS_SUPORTADOS,
  idiomaDoNavegador,
  normalizarIdiomaSalvo,
  type IdiomaSuportado,
} from './idiomas'
import { definirTradutorGlobal } from './tradutorGlobal'
import {
  formatarNumero,
  interpolar,
  textoDaChave,
  type Dicionario,
  type Parametros,
} from './traduzir'

export type { IdiomaSuportado } from './idiomas'
export { IDIOMA_PADRAO } from './idiomas'

const CHAVE_ARMAZENAMENTO = 'riichi-manager-idioma'

/** Fonte Noto de cada idioma CJK: o mesmo caractere tem desenho diferente em cada um. */
const FONTES_CJK: Partial<Record<IdiomaSuportado, string>> = {
  ja: 'Noto+Sans+JP',
  'zh-Hans': 'Noto+Sans+SC',
  ko: 'Noto+Sans+KR',
}

interface ContextoI18n {
  idioma: IdiomaSuportado
  idiomas: readonly IdiomaSuportado[]
  alterarIdioma: (idioma: IdiomaSuportado) => void
  t: (chave: string, parametros?: Parametros) => string
  /** Número no formato do idioma ativo. */
  numero: (valor: number) => string
}

const I18nContext = createContext<ContextoI18n | null>(null)

const dicionariosCarregados = new Map<IdiomaSuportado, Promise<Dicionario>>()

function carregarDicionario(idioma: IdiomaSuportado): Promise<Dicionario> {
  let pedido = dicionariosCarregados.get(idioma)
  if (!pedido) {
    // A versão no endereço faz cada versão nova do app buscar os textos novos,
    // em vez de um JSON antigo guardado no cache do navegador.
    pedido = fetch(`${import.meta.env.BASE_URL}locales/${idioma}.json?v=${packageJson.version}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`Locale não encontrado: ${idioma}`)
        return resposta.json() as Promise<Dicionario>
      })
      .catch(() => {
        dicionariosCarregados.delete(idioma)
        return {}
      })
    dicionariosCarregados.set(idioma, pedido)
  }
  return pedido
}

function idiomaInicial(): IdiomaSuportado {
  let salvo: string | null = null
  try {
    salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO)
  } catch {
    // Armazenamento bloqueado: segue para o idioma do navegador.
  }
  return (
    normalizarIdiomaSalvo(salvo) ?? idiomaDoNavegador(navigator.languages ?? [navigator.language])
  )
}

/** Carrega a fonte Noto do idioma CJK uma vez, só quando ele é escolhido. */
function carregarFonte(idioma: IdiomaSuportado) {
  const familia = FONTES_CJK[idioma]
  if (!familia || document.querySelector(`link[data-fonte-idioma="${idioma}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${familia}:wght@400;700;900&display=swap`
  link.dataset.fonteIdioma = idioma
  document.head.appendChild(link)
}

/**
 * Textos visíveis a partir de `public/locales`. A troca de idioma vale na hora,
 * sem recarregar; chave ausente cai no inglês e depois no pt-BR.
 *
 * Componentes novos devem usar `useI18n` para evitar textos fixos.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<IdiomaSuportado>(idiomaInicial)
  const [dicionarios, setDicionarios] = useState<Partial<Record<IdiomaSuportado, Dicionario>>>({})

  useEffect(() => {
    let cancelado = false
    for (const codigo of [idioma, ...CADEIA_RESERVA]) {
      carregarDicionario(codigo).then((dicionario) => {
        if (!cancelado) setDicionarios((atuais) => ({ ...atuais, [codigo]: dicionario }))
      })
    }

    document.documentElement.lang = idioma
    carregarFonte(idioma)
    try {
      window.localStorage.setItem(CHAVE_ARMAZENAMENTO, idioma)
    } catch {
      // Sem armazenamento a escolha vale só nesta sessão.
    }

    return () => {
      cancelado = true
    }
  }, [idioma])

  const traduzir = useCallback(
    (chave: string, parametros?: Parametros) => {
      for (const codigo of [idioma, ...CADEIA_RESERVA]) {
        const dicionario = dicionarios[codigo]
        const texto = dicionario && textoDaChave(dicionario, chave, codigo, parametros)
        if (texto !== undefined) return interpolar(texto, idioma, parametros)
      }
      return chave
    },
    [dicionarios, idioma],
  )

  // Antes dos filhos renderizarem: funções fora de componentes já usam o idioma novo.
  definirTradutorGlobal(traduzir, idioma)

  const valor = useMemo<ContextoI18n>(
    () => ({
      idioma,
      idiomas: IDIOMAS_SUPORTADOS,
      alterarIdioma: setIdioma,
      t: traduzir,
      numero: (numero: number) => formatarNumero(numero, idioma),
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
