import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { conteudo as en } from './en'
import { conteudo as ja } from './ja'
import { conteudo as ko } from './ko'
import { conteudo as lt } from './lt'
import { conteudo as ptBR } from './pt-BR'
import type { ConteudoGuiaBolso } from './tipos'
import { conteudo as zhHans } from './zh-Hans'

export type * from './tipos'

/**
 * Textos do Guia de bolso por idioma. Ficam no código (e não em
 * `public/locales`) porque são texto longo de leitura, com aliases e listas;
 * o tipo `ConteudoGuiaBolso` garante que nenhum idioma fique sem um texto.
 * Os rótulos curtos da modal (abas, busca) estão em `pocketGuide.*` nos locales.
 */
const CONTEUDOS: Record<IdiomaSuportado, ConteudoGuiaBolso> = {
  'pt-BR': ptBR,
  en,
  ja,
  'zh-Hans': zhHans,
  ko,
  lt,
}

export function conteudoGuiaBolso(idioma: IdiomaSuportado): ConteudoGuiaBolso {
  return CONTEUDOS[idioma]
}
