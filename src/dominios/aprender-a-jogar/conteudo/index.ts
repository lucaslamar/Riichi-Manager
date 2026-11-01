import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { conteudoEn } from './en'
import { conteudoEs } from './es'
import { conteudoPtBR } from './pt-BR'
import type { ConteudoTutorial } from './tipos'

/** O guia existe em pt-BR, en e es; os outros idiomas usam o inglês até ganharem o seu. */
const CONTEUDOS: Partial<Record<IdiomaSuportado, ConteudoTutorial>> = {
  'pt-BR': conteudoPtBR,
  en: conteudoEn,
  es: conteudoEs,
}

export function conteudoGuia(idioma: IdiomaSuportado): ConteudoTutorial {
  return CONTEUDOS[idioma] ?? conteudoEn
}
