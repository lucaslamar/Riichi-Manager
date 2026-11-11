/**
 * Sorteio dos 2 dados e a parede de onde a mesa abre. O gerador vem de fora para
 * dar para testar. Contagem a partir do dealer, no sentido anti-horário.
 */
export type ParedeDados = 'dealer' | 'direita' | 'frente' | 'esquerda'

const PAREDES: readonly ParedeDados[] = ['dealer', 'direita', 'frente', 'esquerda']
/** Sanma: a contagem gira entre 3 (Leste, Sul à direita, Oeste à esquerda). */
const PAREDES_SANMA: readonly ParedeDados[] = ['dealer', 'direita', 'esquerda']

const paredesDe = (jogadores: 3 | 4) => (jogadores === 3 ? PAREDES_SANMA : PAREDES)

export interface ResultadoDados {
  dado1: number
  dado2: number
  soma: number
  parede: ParedeDados
}

function umDado(aleatorio: () => number) {
  return Math.min(6, Math.floor(aleatorio() * 6) + 1)
}

/**
 * 1/5/9 dealer, 2/6/10 à direita, 3/7/11 em frente, 4/8/12 à esquerda. No Sanma:
 * 4/7/10 Leste, 2/5/8/11 Sul (direita) e 3/6/9/12 Oeste (esquerda).
 */
export function paredeDaSoma(soma: number, jogadores: number = 4): ParedeDados {
  // Qualquer valor que não seja 3 conta como 4 (ex.: o índice quando usada em `.map`).
  const quantos = jogadores === 3 ? 3 : 4
  return paredesDe(quantos)[(soma - 1) % quantos]
}

export function jogarDados(aleatorio: () => number, jogadores: 3 | 4 = 4): ResultadoDados {
  const dado1 = umDado(aleatorio)
  const dado2 = umDado(aleatorio)
  const soma = dado1 + dado2
  return { dado1, dado2, soma, parede: paredeDaSoma(soma, jogadores) }
}

/** Passos a partir do dealer na ordem das cadeiras, para pôr a seta no lado certo. */
export function passosDaParede(parede: ParedeDados, jogadores: 3 | 4 = 4) {
  return paredesDe(jogadores).indexOf(parede)
}

/** Somas que abrem a parede a N passos do dealer: 0 → 1, 5 e 9 (Leste). */
export function numerosDaParede(passos: number, jogadores: 3 | 4 = 4) {
  const inicio = jogadores === 3 ? [1, 4, 7, 10] : [1, 5, 9]
  // No Sanma o 1 sai (dois dados nunca somam 1): o Leste fica com 4, 7 e 10.
  return inicio
    .map((numero) => numero + passos)
    .filter((numero) => numero <= 12 && (jogadores === 4 || numero >= 2))
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
