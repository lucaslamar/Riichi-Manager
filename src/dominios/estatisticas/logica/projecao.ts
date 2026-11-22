/** Distância para o próximo, sem fim definido: projeção pela média de cada um. Sem tela. */

/** Com menos que isto a média ainda é ruído. O mesmo menor mínimo do filtro do Ranking. */
export const MINIMO_PARA_PROJETAR = 3
/** Acima disto a conta não diz mais nada. */
export const MAXIMO_DE_JOGOS = 100
/** Folga para a divisão exata não cair um jogo antes. */
const EPSILON = 1e-9

export interface LinhaProjetavel {
  jogadorId: string
  pontos: number
  partidas: number
}

export type Projecao = {
  diferenca: number
  minhaMedia: number
  mediaDele: number
} & (
  | { resultado: 'passa'; jogos: number }
  | { resultado: 'poucosJogos' | 'mediaMenor' | 'longeDemais' }
)

/** Quem está logo acima em pontos. Empatados não contam como acima. */
export function proximoAcima<T extends LinhaProjetavel>(
  linhas: readonly T[],
  jogadorId: string,
): T | null {
  const eu = linhas.find((linha) => linha.jogadorId === jogadorId)
  if (!eu) return null
  return linhas.reduce<T | null>(
    (perto, linha) =>
      linha.pontos > eu.pontos && (!perto || linha.pontos < perto.pontos) ? linha : perto,
    null,
  )
}

/** Em quantos jogos `eu` passa `outro`, os dois mantendo a média. */
export function projetarUltrapassagem(eu: LinhaProjetavel, outro: LinhaProjetavel): Projecao {
  const diferenca = Math.round((outro.pontos - eu.pontos) * 10) / 10
  const minhaMedia = eu.partidas ? eu.pontos / eu.partidas : 0
  const mediaDele = outro.partidas ? outro.pontos / outro.partidas : 0
  const base = { diferenca, minhaMedia, mediaDele }

  if (Math.min(eu.partidas, outro.partidas) < MINIMO_PARA_PROJETAR) {
    return { ...base, resultado: 'poucosJogos' }
  }
  const ganhoPorJogo = minhaMedia - mediaDele
  if (ganhoPorJogo <= EPSILON) return { ...base, resultado: 'mediaMenor' }

  // Passar é ficar acima: na divisão exata, o jogo seguinte.
  const jogos = Math.floor(diferenca / ganhoPorJogo + EPSILON) + 1
  return jogos > MAXIMO_DE_JOGOS
    ? { ...base, resultado: 'longeDemais' }
    : { ...base, resultado: 'passa', jogos }
}
