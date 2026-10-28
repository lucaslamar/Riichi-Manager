import type { IdiomaSuportado } from './idiomas'

/**
 * Busca e montagem de textos, sem dependência de React ou DOM.
 *
 * Plural: a chave vira um objeto com as categorias do `Intl.PluralRules`
 * (`one`, `few`, `many`, `other`…) e o parâmetro `count` escolhe a forma. Lituano
 * usa `one`, `few`, `many` e `other`; japonês, chinês e coreano só `other`.
 *
 * Números em parâmetros saem formatados no idioma ativo (8000 → "8.000" em
 * pt-BR, "8,000" em inglês, "8 000" em lituano).
 */

export type Dicionario = { [chave: string]: string | Dicionario }
export type Parametros = Record<string, string | number>

const CATEGORIAS_PLURAL = new Set(['zero', 'one', 'two', 'few', 'many', 'other'])

function ehPlural(valor: Dicionario) {
  return 'other' in valor && Object.keys(valor).every((chave) => CATEGORIAS_PLURAL.has(chave))
}

function buscar(dicionario: Dicionario, chave: string): string | Dicionario | undefined {
  let atual: string | Dicionario | undefined = dicionario
  for (const parte of chave.split('.')) {
    if (!atual || typeof atual !== 'object') return undefined
    atual = atual[parte]
  }
  return atual
}

const regrasPlural = new Map<string, Intl.PluralRules>()
const formatosNumero = new Map<string, Intl.NumberFormat>()

function regraPlural(idioma: string) {
  let regra = regrasPlural.get(idioma)
  if (!regra) {
    regra = new Intl.PluralRules(idioma)
    regrasPlural.set(idioma, regra)
  }
  return regra
}

export function formatarNumero(valor: number, idioma: IdiomaSuportado) {
  let formato = formatosNumero.get(idioma)
  if (!formato) {
    formato = new Intl.NumberFormat(idioma)
    formatosNumero.set(idioma, formato)
  }
  return formato.format(valor)
}

/** Texto da chave num dicionário, já com a forma de plural certa; `undefined` se faltar. */
export function textoDaChave(
  dicionario: Dicionario,
  chave: string,
  idioma: IdiomaSuportado,
  parametros?: Parametros,
): string | undefined {
  const valor = buscar(dicionario, chave)
  if (typeof valor === 'string') return valor
  if (!valor || !ehPlural(valor)) return undefined
  const quantidade = Number(parametros?.count ?? 0)
  const forma = valor[regraPlural(idioma).select(quantidade)] ?? valor.other
  return typeof forma === 'string' ? forma : undefined
}

export function interpolar(texto: string, idioma: IdiomaSuportado, parametros?: Parametros) {
  if (!parametros) return texto
  return texto.replace(/\{\{(\w+)\}\}/g, (inteiro, nome: string) => {
    const valor = parametros[nome]
    if (valor === undefined) return inteiro
    return typeof valor === 'number' ? formatarNumero(valor, idioma) : valor
  })
}

/** Todas as chaves-folha de um dicionário (um plural conta como uma chave só). */
export function listarChaves(dicionario: Dicionario, prefixo = ''): string[] {
  return Object.entries(dicionario).flatMap(([chave, valor]) => {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave
    if (typeof valor === 'string' || ehPlural(valor)) return [caminho]
    return listarChaves(valor, caminho)
  })
}
