/**
 * Timer de vez, em função pura: guarda quanto faltava e quando começou a contar
 * em vez de descontar a cada segundo, então sobrevive a pausa e a fechar o app.
 */
export type CadeiraVez = 0 | 1 | 2 | 3

export interface EstadoVez {
  cadeira: CadeiraVez
  /** Falso até o primeiro toque da mão: a vez já é do dealer, mas não conta. */
  comecou: boolean
  /** Milissegundos que faltavam quando o timer parou ou começou a contar. */
  restanteMs: number
  /** Quando começou a contar; `null` = parado. */
  contandoDesde: number | null
}

export function vezInicial(dealer: CadeiraVez, segundos: number): EstadoVez {
  return { cadeira: dealer, comecou: false, restanteMs: segundos * 1000, contandoDesde: null }
}

export function milissegundosRestantes(vez: EstadoVez, agora: number) {
  if (vez.contandoDesde === null) return vez.restanteMs
  return Math.max(0, vez.restanteMs - (agora - vez.contandoDesde))
}

export function segundosRestantes(vez: EstadoVez, agora: number) {
  return Math.ceil(milissegundosRestantes(vez, agora) / 1000)
}

/** Contando e zerado: o card pisca e o alarme toca até alguém passar a vez. */
export function tempoEsgotado(vez: EstadoVez, agora: number) {
  return vez.contandoDesde !== null && milissegundosRestantes(vez, agora) === 0
}

/** Passa para uma cadeira, com o tempo cheio e já contando. */
export function passarVezPara(cadeira: CadeiraVez, segundos: number, agora: number): EstadoVez {
  return { cadeira, comecou: true, restanteMs: segundos * 1000, contandoDesde: agora }
}

/** Toque no timer: o primeiro da mão começa a contar; os outros passam a vez. */
export function tocarTimer(vez: EstadoVez, segundos: number, agora: number, jogadores: 3 | 4 = 4): EstadoVez {
  if (!vez.comecou) return passarVezPara(vez.cadeira, segundos, agora)
  return passarVezPara(((vez.cadeira + 1) % jogadores) as CadeiraVez, segundos, agora)
}

/**
 * Timer sem dono (Centerpiece simples): todo toque recomeça o tempo cheio, para quem
 * for jogar. Não avança a cadeira, porque Pon, Chi e Kan pulam jogadores.
 */
export function reiniciarVez(vez: EstadoVez, segundos: number, agora: number): EstadoVez {
  return passarVezPara(vez.cadeira, segundos, agora)
}

export function pausarVez(vez: EstadoVez, agora: number): EstadoVez {
  if (vez.contandoDesde === null) return vez
  return { ...vez, restanteMs: milissegundosRestantes(vez, agora), contandoDesde: null }
}

export function retomarVez(vez: EstadoVez, agora: number): EstadoVez {
  if (vez.contandoDesde !== null) return vez
  return { ...vez, comecou: true, contandoDesde: agora }
}
