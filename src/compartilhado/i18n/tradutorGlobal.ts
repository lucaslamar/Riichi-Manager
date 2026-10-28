import { IDIOMA_PADRAO, type IdiomaSuportado } from './idiomas'
import { formatarNumero, type Parametros } from './traduzir'

type Tradutor = (chave: string, parametros?: Parametros) => string

let tradutorAtual: Tradutor = (chave) => chave
let idiomaAtual: IdiomaSuportado = IDIOMA_PADRAO

/**
 * Tradutor do idioma ativo para funções fora de componentes (ex.: nome acessível
 * de uma pedra, pontos formatados na lógica). O I18nProvider registra o atual a
 * cada troca de idioma.
 */
export function definirTradutorGlobal(tradutor: Tradutor, idioma: IdiomaSuportado) {
  tradutorAtual = tradutor
  idiomaAtual = idioma
}

export function traduzirGlobal(chave: string, parametros?: Parametros) {
  return tradutorAtual(chave, parametros)
}

/** Idioma ativo, para textos montados fora de componentes. */
export function idiomaGlobal() {
  return idiomaAtual
}

/** Número no formato do idioma ativo. */
export function formatarNumeroGlobal(valor: number) {
  return formatarNumero(valor, idiomaAtual)
}
