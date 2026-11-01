/**
 * Sorteio dos 2 dados e a parede de onde a mesa abre. O gerador vem de fora para
 * dar para testar. Contagem a partir do dealer, no sentido anti-horário.
 */
export type ParedeDados = 'dealer' | 'direita' | 'frente' | 'esquerda'

const PAREDES: readonly ParedeDados[] = ['dealer', 'direita', 'frente', 'esquerda']

export interface ResultadoDados {
  dado1: number
  dado2: number
  soma: number
  parede: ParedeDados
}

function umDado(aleatorio: () => number) {
  return Math.min(6, Math.floor(aleatorio() * 6) + 1)
}

/** 1/5/9 dealer, 2/6/10 à direita, 3/7/11 em frente, 4/8/12 à esquerda. */
export function paredeDaSoma(soma: number): ParedeDados {
  return PAREDES[(soma - 1) % 4]
}

export function jogarDados(aleatorio: () => number): ResultadoDados {
  const dado1 = umDado(aleatorio)
  const dado2 = umDado(aleatorio)
  const soma = dado1 + dado2
  return { dado1, dado2, soma, parede: paredeDaSoma(soma) }
}

/** Passos a partir do dealer na ordem das cadeiras, para pôr a seta no lado certo. */
export function passosDaParede(parede: ParedeDados) {
  return PAREDES.indexOf(parede)
}

/** Texto por extenso, para `aria-label` na web e `accessibilityLabel` no React Native. */
export function descreverDados(
  resultado: ResultadoDados,
  t: (chave: string, parametros?: Record<string, string | number>) => string,
) {
  return t('match.dice.description', {
    first: resultado.dado1,
    second: resultado.dado2,
    sum: resultado.soma,
    wall: t(`match.dice.wall.${resultado.parede}`),
  })
}
