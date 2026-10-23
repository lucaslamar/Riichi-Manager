import type { VentoMao } from '../../calculadora-mao/logica/mao'

/** Ordem canônica da mesa: Leste, Sul, Oeste, Norte. */
export const VENTOS_MESA: readonly VentoMao[] = ['1', '2', '3', '4']

/**
 * Inteiro uniforme em [0, max) a partir de `crypto.getRandomValues`.
 * A amostragem por rejeição descarta o "resto" do intervalo de 32 bits, que
 * daria um pouco mais de chance aos primeiros valores (viés do módulo).
 */
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  let x: number
  do {
    crypto.getRandomValues(buf)
    x = buf[0]
  } while (x >= limit)
  return x % max
}

/**
 * Embaralha os ventos uma única vez (Fisher–Yates com gerador criptográfico).
 * O sorteio só revela esta ordem, um vento por toque: o momento do toque e a
 * posição de quem sorteia não mudam o resultado.
 */
export function embaralharVentos(ventos: readonly VentoMao[] = VENTOS_MESA): VentoMao[] {
  const a = [...ventos]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
