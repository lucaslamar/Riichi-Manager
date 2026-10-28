/**
 * Idiomas do app, sem dependência de DOM: servem à web e a um futuro app nativo.
 * Os textos ficam em `public/locales/<codigo>.json`.
 */
export const IDIOMAS_SUPORTADOS = ['pt-BR', 'en', 'ja', 'zh-Hans', 'ko', 'lt'] as const

export type IdiomaSuportado = (typeof IDIOMAS_SUPORTADOS)[number]

export const IDIOMA_PADRAO: IdiomaSuportado = 'pt-BR'

/** Ordem de reserva quando falta uma chave no idioma atual. */
export const CADEIA_RESERVA: IdiomaSuportado[] = ['en', 'pt-BR']

/** Nome de cada idioma escrito nele mesmo, como aparece no seletor. */
export const ROTULOS_IDIOMA: Record<IdiomaSuportado, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
  ja: '日本語',
  'zh-Hans': '简体中文',
  ko: '한국어',
  lt: 'Lietuvių',
}

/** Códigos salvos por versões antigas do app. */
const CODIGOS_ANTIGOS: Record<string, IdiomaSuportado> = {
  'en-US': 'en',
  'ja-JP': 'ja',
  'zh-CN': 'zh-Hans',
  'ko-KR': 'ko',
}

export function ehIdiomaSuportado(idioma: string | null | undefined): idioma is IdiomaSuportado {
  return !!idioma && (IDIOMAS_SUPORTADOS as readonly string[]).includes(idioma)
}

/** Converte um código salvo (inclusive os antigos) num idioma suportado. */
export function normalizarIdiomaSalvo(salvo: string | null): IdiomaSuportado | null {
  if (!salvo) return null
  if (ehIdiomaSuportado(salvo)) return salvo
  return CODIGOS_ANTIGOS[salvo] ?? null
}

/**
 * Primeiro idioma do navegador que o app suporta; senão, pt-BR. Português de
 * Portugal cai em pt-BR, e chinês simplificado (zh, zh-CN, zh-SG) em zh-Hans.
 * Chinês tradicional (zh-TW, zh-HK, zh-Hant) não tem tradução e é ignorado.
 */
export function idiomaDoNavegador(preferidos: readonly string[]): IdiomaSuportado {
  for (const preferido of preferidos) {
    const codigo = preferido.toLowerCase()
    const [base] = codigo.split('-')
    if (base === 'pt') return 'pt-BR'
    if (base === 'zh') {
      if (/hant|tw|hk|mo/.test(codigo)) continue
      return 'zh-Hans'
    }
    if (base === 'en' || base === 'ja' || base === 'ko' || base === 'lt') return base
  }
  return IDIOMA_PADRAO
}
