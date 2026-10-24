import type {
  ConteudoTutorial,
  ReferenceTopic,
  TutorialModule,
  TutorialPage,
} from '../conteudo/tipos'

/**
 * Uma tela do livro, na ordem em que se lê: capa do guia → capa do Módulo 1
 * → 1.1 → … → quiz → capa do Módulo 2 → … → conclusão → créditos.
 */
export type PaginaLivro =
  | { tipo: 'capaGuia'; id: string }
  | { tipo: 'capaModulo'; id: string; modulo: TutorialModule }
  | { tipo: 'pagina'; id: string; modulo: TutorialModule; pagina: TutorialPage }
  | { tipo: 'quiz'; id: string; modulo: TutorialModule }
  | { tipo: 'conclusao'; id: string }
  | { tipo: 'creditos'; id: string }

export const ID_CAPA_GUIA = 'capa-guia'
export const ID_CREDITOS = 'creditos'

export const idCapaModulo = (modulo: TutorialModule) => `capa-${modulo.id}`
export const idQuizModulo = (modulo: TutorialModule) => `${modulo.id}-quiz`

export function montarLivro(conteudo: ConteudoTutorial): PaginaLivro[] {
  const paginas: PaginaLivro[] = [{ tipo: 'capaGuia', id: ID_CAPA_GUIA }]
  for (const modulo of conteudo.tutorialModules) {
    paginas.push({ tipo: 'capaModulo', id: idCapaModulo(modulo), modulo })
    for (const pagina of modulo.pages) {
      paginas.push({ tipo: 'pagina', id: pagina.id, modulo, pagina })
    }
    if (modulo.quiz) paginas.push({ tipo: 'quiz', id: idQuizModulo(modulo), modulo })
  }
  paginas.push({ tipo: 'conclusao', id: 'conclusao' }, { tipo: 'creditos', id: ID_CREDITOS })
  return paginas
}

/** Módulo da página, para o título da barra e o progresso. */
export function moduloDaPagina(pagina: PaginaLivro | undefined): TutorialModule | undefined {
  return pagina && 'modulo' in pagina ? pagina.modulo : undefined
}

/**
 * Onde um destino leva: uma tela do livro ou um tópico de Regras à parte.
 * `pagina#cartao` também diz qual cartão abrir (ex.: 'yakus-iniciantes#tanyao').
 */
export function resolverDestino(
  livro: PaginaLivro[],
  conteudo: ConteudoTutorial,
  destino: string,
): (({ livro: number } | { regra: ReferenceTopic }) & { cartao?: string }) | null {
  const [id, cartao] = destino.split('#')
  const indice = livro.findIndex((pagina) => pagina.id === id)
  if (indice >= 0) return { livro: indice, cartao }
  const regra = conteudo.referenceTopics.find((topico) => topico.id === id)
  return regra ? { regra, cartao } : null
}
