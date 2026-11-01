import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { conteudoEs } from './es'
import { conteudoPtBR } from './pt-BR'
import type { ConteudoTutorial } from './tipos'

/** O guia existe em pt-BR e es; os outros idiomas usam o pt-BR até ganharem o seu. */
const CONTEUDOS: Partial<Record<IdiomaSuportado, ConteudoTutorial>> = {
  'pt-BR': conteudoPtBR,
  es: conteudoEs,
}

export function conteudoGuia(idioma: IdiomaSuportado): ConteudoTutorial {
  return CONTEUDOS[idioma] ?? conteudoPtBR
}
