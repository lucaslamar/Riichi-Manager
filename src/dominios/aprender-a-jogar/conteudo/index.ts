import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { conteudoEn } from './en'
import { conteudoEs } from './es'
import { conteudoJa } from './ja'
import { conteudoPtBR } from './pt-BR'
import type { ConteudoTutorial } from './tipos'
import { conteudoZhHans } from './zh-Hans'

/** Coreano e lituano ainda não têm guia próprio: usam o inglês até ganharem o seu. */
const CONTEUDOS: Partial<Record<IdiomaSuportado, ConteudoTutorial>> = {
  'pt-BR': conteudoPtBR,
  en: conteudoEn,
  es: conteudoEs,
  ja: conteudoJa,
  'zh-Hans': conteudoZhHans,
}

export function conteudoGuia(idioma: IdiomaSuportado): ConteudoTutorial {
  return CONTEUDOS[idioma] ?? conteudoEn
}
