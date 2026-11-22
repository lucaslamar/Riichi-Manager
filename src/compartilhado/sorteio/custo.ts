/**
 * Custo do sorteio mitigado. São regras em ordem, comparadas uma a uma: somar com
 * pesos deixaria muitas faltas leves passarem na frente de uma grave.
 */
import { contarPares, contarTrios, contarVentos, jogadoresDaChave, type RodadaDoSorteio } from './contagens'

/**
 * Posições do custo, da regra mais grave para a mais leve:
 * 0 ventos (Leste de novo antes dos outros), 1 dupla pela 3ª vez, 2 trio repetido,
 * 3 repetições concentradas num jogador, 4 duplas repetidas.
 */
export const REGRAS = 5

export function compararCustos(um: ArrayLike<number>, outro: ArrayLike<number>): number {
  for (let regra = 0; regra < REGRAS; regra++) if (um[regra] !== outro[regra]) return um[regra] - outro[regra]
  return 0
}

export interface AvaliadorDeMesas {
  /** Soma no `custo` a mesa formada por `fila[inicio]` até `fila[inicio + porMesa - 1]`. */
  somar: (fila: Int32Array, inicio: number, custo: Float64Array) => void
}

/** Pré-calcula o histórico por índice: a busca avalia milhares de mesas. */
export function criarAvaliador(
  jogadores: readonly string[],
  anteriores: readonly RodadaDoSorteio[],
  porMesa: number,
  comVentos: boolean,
): AvaliadorDeMesas {
  const total = jogadores.length
  const indiceDe = new Map(jogadores.map((id, indice) => [id, indice]))
  const vezes = new Uint16Array(total * total)
  const jaRepetidos = new Int32Array(total)

  for (const [chave, quantas] of contarPares(anteriores)) {
    const [um, outro] = jogadoresDaChave(chave).map((id) => indiceDe.get(id))
    // Quem repetiu com alguém que já saiu continua contando como repetição dele.
    if (quantas > 1) {
      if (um !== undefined) jaRepetidos[um]++
      if (outro !== undefined) jaRepetidos[outro]++
    }
    if (um === undefined || outro === undefined) continue
    vezes[um * total + outro] = quantas
    vezes[outro * total + um] = quantas
  }

  // Por número e em qualquer ordem: montar e ordenar texto aqui dobrava o tempo da busca.
  const trios = new Set<number>()
  for (const chave of contarTrios(anteriores).keys()) {
    const [um, dois, tres] = jogadoresDaChave(chave).map((id) => indiceDe.get(id))
    if (um === undefined || dois === undefined || tres === undefined) continue
    for (const [a, b, c] of [[um, dois, tres], [um, tres, dois], [dois, um, tres], [dois, tres, um], [tres, um, dois], [tres, dois, um]]) {
      trios.add((a * total + b) * total + c)
    }
  }
  const ventos = contarVentos(anteriores)
  const leste = jogadores.map((id) => ventos.get(id)?.[0] ?? 0)
  const menorLeste = Math.min(...leste)
  const novosRepetidos = new Int32Array(porMesa)

  return {
    somar(fila, inicio, custo) {
      for (let um = 0; um < porMesa; um++) novosRepetidos[um] = 0
      let menorDaMesa = Infinity
      for (let um = 0; um < porMesa; um++) {
        const jogador = fila[inicio + um]
        if (leste[jogador] < menorDaMesa) menorDaMesa = leste[jogador]
        for (let dois = um + 1; dois < porMesa; dois++) {
          const colega = fila[inicio + dois]
          const juntos = vezes[jogador * total + colega]
          if (juntos === 0) continue
          custo[4] += juntos * juntos
          if (juntos === 1) {
            novosRepetidos[um]++
            novosRepetidos[dois]++
          } else {
            custo[1] += juntos - 1
          }
          for (let tres = dois + 1; tres < porMesa; tres++) {
            const terceiro = fila[inicio + tres]
            // Trio repetido exige as três duplas repetidas.
            if (!vezes[jogador * total + terceiro] || !vezes[colega * total + terceiro]) continue
            if (trios.has((jogador * total + colega) * total + terceiro)) custo[2]++
          }
        }
      }
      if (comVentos) custo[0] += menorDaMesa - menorLeste
      for (let um = 0; um < porMesa; um++) {
        const novos = novosRepetidos[um]
        if (novos === 0) continue
        const antes = jaRepetidos[fila[inicio + um]]
        custo[3] += (antes + novos) * (antes + novos) - antes * antes
      }
    },
  }
}
