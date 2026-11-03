import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { conteudoEn } from './en'
import { conteudoEs } from './es'
import { conteudoJa } from './ja'
import { conteudoKo } from './ko'
import { conteudoLt } from './lt'
import { conteudoPtBR } from './pt-BR'
import type { ConteudoTutorial } from './tipos'
import { conteudoZhHans } from './zh-Hans'

/** Idioma sem guia próprio cai no inglês (o `i18n:check` avisa). */
const CONTEUDOS: Partial<Record<IdiomaSuportado, ConteudoTutorial>> = {
  'pt-BR': conteudoPtBR,
  en: conteudoEn,
  es: conteudoEs,
  ja: conteudoJa,
  ko: conteudoKo,
  lt: conteudoLt,
  'zh-Hans': conteudoZhHans,
}

/** O idioma tem o guia traduzido (sem cair no inglês). */
export function temGuiaProprio(idioma: IdiomaSuportado): boolean {
  return idioma in CONTEUDOS
}

export function conteudoGuia(idioma: IdiomaSuportado): ConteudoTutorial {
  return CONTEUDOS[idioma] ?? conteudoEn
}
