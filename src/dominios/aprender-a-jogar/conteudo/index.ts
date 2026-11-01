import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { conteudoEn } from './en'
import { conteudoEs } from './es'
import { conteudoJa } from './ja'
import { conteudoLt } from './lt'
import { conteudoPtBR } from './pt-BR'
import type { ConteudoTutorial } from './tipos'
import { conteudoZhHans } from './zh-Hans'

/** O coreano ainda não tem guia próprio: usa o inglês até ganhar o seu. */
const CONTEUDOS: Partial<Record<IdiomaSuportado, ConteudoTutorial>> = {
  'pt-BR': conteudoPtBR,
  en: conteudoEn,
  es: conteudoEs,
  ja: conteudoJa,
  lt: conteudoLt,
  'zh-Hans': conteudoZhHans,
}

export function conteudoGuia(idioma: IdiomaSuportado): ConteudoTutorial {
  return CONTEUDOS[idioma] ?? conteudoEn
}
