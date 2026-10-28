/**
 * Paletas de tema do app, sem dependência de CSS ou DOM: a mesma tabela serve
 * para a web (via variáveis CSS em `tema-escuro.css`) e para um futuro app em
 * React Native (via StyleSheet).
 *
 * O tema claro continua sendo o visual original do app: na web, cada cor fixa
 * dos estilos virou `var(--cor-…, #valor-claro)`, então as variáveis `--cor-*`
 * só existem no tema escuro e o claro cai no valor de reserva. Aqui fica só o
 * núcleo do claro, para quem precisar dele fora do CSS.
 *
 * `scripts/verificar-tema.ts` confere que `tema-escuro.css` usa exatamente estes
 * valores e que os pares principais passam no contraste WCAG AA.
 */

export type PreferenciaTema = 'claro' | 'escuro' | 'automatico'
export type TemaEfetivo = 'claro' | 'escuro'

export interface PaletaTema {
  /** Fundo da tela. */
  background: string
  /** Cards. */
  surface: string
  /** Inputs, select, áreas internas. */
  surfaceAlt: string
  /** Bordas de cards e inputs. */
  border: string
  /** Bordas de controles (switch desligado, select): 3:1 sobre `surface`. */
  borderControl: string
  text: string
  textMuted: string
  primary: string
  onPrimary: string
  /** Fundo suave do estado ativo (chips, abas). */
  primarySoft: string
  primaryBorder: string
  secondary: string
  /** `secondary` clareado para quando ele vira texto. */
  secondaryText: string
  accent: string
  accentSoft: string
  accentBorder: string
  focus: string
  danger: string
  dangerSoft: string
  dangerBorder: string
  success: string
  successSoft: string
  successBorder: string
  warning: string
  warningSoft: string
  warningBorder: string
  /** Barra inferior e cabeçalho. */
  navBackground: string
}

/** Velvet Darkness: quase todo preto com leve tom roxo; lavanda, roxo e rosa só como acento. */
export const VELVET_DARKNESS: PaletaTema = {
  background: '#0B090F',
  surface: '#141019',
  surfaceAlt: '#1C1724',
  border: '#2C2438',
  borderControl: '#7A6C94',
  text: '#ECE6F0',
  textMuted: '#A398B8',
  primary: '#B9A3E3',
  onPrimary: '#1A1424',
  primarySoft: '#251D35',
  primaryBorder: '#57487A',
  secondary: '#8A4FD1',
  secondaryText: '#C29BF2',
  accent: '#E06AB0',
  accentSoft: '#2A1524',
  accentBorder: '#6A2E55',
  focus: '#F4B7C6',
  danger: '#FF6B7A',
  dangerSoft: '#2B1219',
  dangerBorder: '#702A36',
  success: '#6FD6A8',
  successSoft: '#10241C',
  successBorder: '#255C45',
  warning: '#F27CC4',
  warningSoft: '#2E1428',
  warningBorder: '#7A2E60',
  navBackground: '#070609',
}

/** Velvet Darkness + Alto contraste: só estes três mudam. */
export const VELVET_DARKNESS_ALTO_CONTRASTE: Partial<PaletaTema> = {
  text: '#FFFFFF',
  textMuted: '#E2DAF0',
  border: '#8A7AA8',
}

/** Núcleo do tema claro original (fundo, cartão, texto e destaque). */
export const TEMA_CLARO = {
  background: '#EEF2F7',
  surface: '#FFFFFF',
  text: '#102A43',
  textMuted: '#607080',
  primary: '#2196F3',
}

/** `meta theme-color` de cada tema. */
export const COR_BARRA_NAVEGADOR: Record<TemaEfetivo, string> = {
  claro: '#101827',
  escuro: VELVET_DARKNESS.background,
}

export function resolverTema(preferencia: PreferenciaTema, sistemaEscuro: boolean): TemaEfetivo {
  if (preferencia === 'automatico') return sistemaEscuro ? 'escuro' : 'claro'
  return preferencia
}
