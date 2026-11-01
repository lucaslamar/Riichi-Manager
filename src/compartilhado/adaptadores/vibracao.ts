/** Vibração do aparelho. O iPhone não tem a API no navegador: lá simplesmente não vibra. */
export function vibrar(padrao: number | number[] = 200) {
  if (typeof navigator.vibrate === 'function') navigator.vibrate(padrao)
}
