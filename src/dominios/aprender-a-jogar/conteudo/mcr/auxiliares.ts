/**
 * Montagem do livro do MCR: os textos vêm de `tutorial.mcr.*` nos locales e os
 * fan, as mãos e as respostas, de `fans-mcr.ts` e do motor.
 */
import type { Parametros } from '@/compartilhado/i18n/traduzir'
import type { TutorialBlock, TutorialModule, TutorialPage } from '../tipos'

export type Traduzir = (chave: string, parametros?: Parametros) => string
export type Quiz = Extract<TutorialBlock, { type: 'quiz' }>

/** Pergunta com as opções em `<chave>.op1`, `.op2`…; `certa` conta a partir de 0. */
export function quiz(t: Traduzir, chave: string, total: number, certa: number): Quiz {
  return {
    type: 'quiz',
    question: t(`${chave}.pergunta`),
    answer: t(`${chave}.resposta`),
    options: Array.from({ length: total }, (_, indice) => ({
      label: t(`${chave}.op${indice + 1}`),
      ...(indice === certa && { correct: true }),
    })),
  }
}

export const texto = (md: string): TutorialBlock => ({ type: 'text', md })

export const pagina = (title: string, blocks: TutorialBlock[]) => ({ title, blocks })

/** Módulo com as páginas numeradas na ordem (ids `<módulo>-1`, `-2`…). */
export function criarModulo(
  id: string,
  number: number,
  title: string,
  cover: string,
  paginas: Pick<TutorialPage, 'title' | 'blocks'>[],
  perguntas: Quiz[],
): TutorialModule {
  return {
    id,
    number,
    title,
    cover,
    pages: paginas.map((conteudo, indice) => ({
      id: `${id}-${indice + 1}`,
      number: `${number}.${indice + 1}`,
      ...conteudo,
    })),
    quiz: perguntas,
  }
}
