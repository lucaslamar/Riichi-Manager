import type {
  ConteudoTutorial,
  TutorialModule,
  TutorialPage,
  TutorialPart,
} from '../conteudo/tipos'

/**
 * Uma tela do livro, na ordem em que se lê: capa do guia → capa da Parte 1 →
 * capa do Módulo 1 → 1.1 → … → quiz → capa do Módulo 2 → … → marco ("Você já
 * pode jogar!") → capa da Parte 2 → … → conclusão.
 */
export type PaginaLivro =
  | { tipo: 'capaGuia'; id: string }
  /** Marco antes da parte (ex.: "Você já pode jogar!"), numa tela só dele. */
  | { tipo: 'marco'; id: string; parte: TutorialPart }
  | { tipo: 'capaParte'; id: string; parte: TutorialPart }
  | { tipo: 'capaModulo'; id: string; modulo: TutorialModule }
  | { tipo: 'pagina'; id: string; modulo: TutorialModule; pagina: TutorialPage }
  /** Uma pergunta do quiz do módulo por tela; `pergunta` a partir de 0. */
  | { tipo: 'quiz'; id: string; modulo: TutorialModule; pergunta: number }
  | { tipo: 'conclusao'; id: string }

export const ID_CAPA_GUIA = 'capa-guia'

export const idCapaParte = (parte: TutorialPart) => `parte-${parte.id}`
export const idCapaModulo = (modulo: TutorialModule) => `capa-${modulo.id}`
/** A primeira pergunta guarda o id de sempre (o progresso salvo e o índice apontam para ela). */
export const idQuizModulo = (modulo: TutorialModule, pergunta = 0) =>
  pergunta === 0 ? `${modulo.id}-quiz` : `${modulo.id}-quiz-${pergunta + 1}`

/** Todos os módulos, na ordem do livro. */
export const modulosDoLivro = (conteudo: ConteudoTutorial) =>
  conteudo.tutorialParts.flatMap((parte) => parte.modules)

export function montarLivro(conteudo: ConteudoTutorial): PaginaLivro[] {
  const paginas: PaginaLivro[] = [{ tipo: 'capaGuia', id: ID_CAPA_GUIA }]
  for (const parte of conteudo.tutorialParts) {
    if (parte.milestone) paginas.push({ tipo: 'marco', id: `marco-${parte.id}`, parte })
    paginas.push({ tipo: 'capaParte', id: idCapaParte(parte), parte })
    for (const modulo of parte.modules) {
      paginas.push({ tipo: 'capaModulo', id: idCapaModulo(modulo), modulo })
      for (const pagina of modulo.pages) {
        paginas.push({ tipo: 'pagina', id: pagina.id, modulo, pagina })
      }
      modulo.quiz?.forEach((_, pergunta) => {
        paginas.push({ tipo: 'quiz', id: idQuizModulo(modulo, pergunta), modulo, pergunta })
      })
    }
  }
  paginas.push({ tipo: 'conclusao', id: 'conclusao' })
  return paginas
}

/** Módulo da página, para o título da barra e o progresso. */
export function moduloDaPagina(pagina: PaginaLivro | undefined): TutorialModule | undefined {
  return pagina && 'modulo' in pagina ? pagina.modulo : undefined
}

/**
 * Chegar aqui conclui o módulo: o quiz (qualquer pergunta) ou, sem quiz, a
 * última página.
 */
export function fimDoModulo(pagina: PaginaLivro): boolean {
  if (pagina.tipo === 'quiz') return true
  if (pagina.tipo !== 'pagina' || pagina.modulo.quiz) return false
  return pagina.modulo.pages[pagina.modulo.pages.length - 1] === pagina.pagina
}
