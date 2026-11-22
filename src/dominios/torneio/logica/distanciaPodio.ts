/** Distância entre posições do ranking do torneio. Sem tela. */
import type { RegrasDoModo, UnidadeDistancia } from '@/compartilhado/modo-jogo/regrasDoModo'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import type { LinhaRankingTorneio } from './ranking'
import { totalDeRodadas } from './torneio'
import type { Torneio } from './tipos'

const LUGARES_DO_PODIO = 3
const CANDIDATOS = { minimo: 4, maximo: 8 }

export type Relacao = 'falta' | 'vantagem' | 'subir' | 'sairDoUltimo' | 'sobreOUltimo'

export interface DistanciaAlvo {
  relacao: Relacao
  posicao: number
  jogadorId: string
  /** Em pontos do ranking, sempre positivo e com 1 casa. */
  diferenca: number
  /** Com pontos empatados, o que separa os dois (MCR: pontos das partidas). 0 no Riichi. */
  desempate: number
}

const umaCasa = (valor: number) => Math.round(valor * 10) / 10

function alvo(de: LinhaRankingTorneio, para: LinhaRankingTorneio, relacao: Relacao): DistanciaAlvo {
  const diferenca = umaCasa(Math.abs(de.pontos - para.pontos))
  return {
    relacao,
    posicao: para.posicao,
    jogadorId: para.jogadorId,
    diferenca,
    desempate: diferenca === 0 ? Math.abs(de.desempate - para.desempate) : 0,
  }
}

/** Mãos (ou vitórias) para cobrir a diferença, para cima. */
export function maosParaCobrir(diferenca: number, unidade: UnidadeDistancia, regras: RegrasDoModo): number {
  // Arredonda antes: 67,9 − 51,9 dá 16,000000000000007 e viraria 3 mangans.
  return Math.ceil(Math.round(umaCasa(diferenca) * regras.escalaPontos * 10) / 10 / unidade.valor)
}

/** Quem disputa com o jogador: já jogou e, no Eliminatório, está na mesma fase. Sem jogador, a fase de cima. */
export function disputantes(linhas: readonly LinhaRankingTorneio[], jogadorId?: string): LinhaRankingTorneio[] {
  const jogaram = linhas.filter((linha) => linha.partidas > 0)
  const referencia = jogadorId ? jogaram.find((linha) => linha.jogadorId === jogadorId) : jogaram[0]
  return referencia ? jogaram.filter((linha) => linha.fase === referencia.fase) : []
}

/** `faltam`: quem está acima no pódio. `vantagem`: de quem está no pódio, até o 4º. */
export function distanciaParaPodio(
  linhas: readonly LinhaRankingTorneio[],
  jogadorId: string,
): { faltam: DistanciaAlvo[]; vantagem: DistanciaAlvo[] } {
  const disputa = disputantes(linhas, jogadorId)
  const indice = disputa.findIndex((linha) => linha.jogadorId === jogadorId)
  if (indice < 0) return { faltam: [], vantagem: [] }
  const eu = disputa[indice]
  const faltam = disputa.slice(0, Math.min(indice, LUGARES_DO_PODIO)).map((linha) => alvo(eu, linha, 'falta'))
  const vantagem =
    indice < LUGARES_DO_PODIO
      ? disputa.slice(indice + 1, LUGARES_DO_PODIO + 1).map((linha) => alvo(eu, linha, 'vantagem'))
      : []
  return { faltam, vantagem }
}

/** Quem está logo acima e logo abaixo, sem repetir o que o pódio já mostra. */
export function vizinhosDoJogador(linhas: readonly LinhaRankingTorneio[], jogadorId: string): DistanciaAlvo[] {
  const disputa = disputantes(linhas, jogadorId)
  const indice = disputa.findIndex((linha) => linha.jogadorId === jogadorId)
  if (indice < 0) return []
  const ultimo = disputa.length - 1
  const vizinhos: DistanciaAlvo[] = []
  if (indice - 1 >= LUGARES_DO_PODIO) {
    vizinhos.push(alvo(disputa[indice], disputa[indice - 1], indice === ultimo ? 'sairDoUltimo' : 'subir'))
  }
  const abaixo = indice + 1
  const podioJaMostra = indice < LUGARES_DO_PODIO && abaixo <= LUGARES_DO_PODIO
  if (abaixo <= ultimo && !podioJaMostra) {
    vizinhos.push(alvo(disputa[indice], disputa[abaixo], abaixo === ultimo ? 'sobreOUltimo' : 'vantagem'))
  }
  return vizinhos
}

export function compararCom(
  linhas: readonly LinhaRankingTorneio[],
  jogadorId: string,
  outroId: string,
): DistanciaAlvo | null {
  const disputa = disputantes(linhas, jogadorId)
  const meu = disputa.findIndex((linha) => linha.jogadorId === jogadorId)
  const dele = disputa.findIndex((linha) => linha.jogadorId === outroId)
  if (meu < 0 || dele < 0 || meu === dele) return null
  return alvo(disputa[meu], disputa[dele], dele < meu ? 'falta' : 'vantagem')
}

export interface DistanciasDoPodio {
  /** 1º × 2º, 2º × 3º e 3º × 4º, pelo lugar na tabela. */
  faixa: { acima: number; abaixo: number; distancia: DistanciaAlvo }[]
  /** Por jogador da disputa. No pódio, `sobreOQuarto` no lugar de `paraTerceiro`. */
  porJogador: Map<
    string,
    { paraPrimeiro: DistanciaAlvo | null; paraTerceiro: DistanciaAlvo | null; sobreOQuarto: DistanciaAlvo | null }
  >
}

export function distanciasDoPodio(linhas: readonly LinhaRankingTorneio[]): DistanciasDoPodio {
  const disputa = disputantes(linhas)
  const faixa = disputa.slice(0, LUGARES_DO_PODIO).flatMap((linha, indice) => {
    const seguinte = disputa[indice + 1]
    return seguinte ? [{ acima: indice + 1, abaixo: indice + 2, distancia: alvo(linha, seguinte, 'vantagem') }] : []
  })
  const terceiro = disputa[LUGARES_DO_PODIO - 1]
  const quarto = disputa[LUGARES_DO_PODIO]
  const porJogador = new Map(
    disputa.map((linha, indice) => {
      const noPodio = indice < LUGARES_DO_PODIO
      return [
        linha.jogadorId,
        {
          paraPrimeiro: indice === 0 ? null : alvo(linha, disputa[0], 'falta'),
          paraTerceiro: noPodio || !terceiro ? null : alvo(linha, terceiro, 'falta'),
          sobreOQuarto: noPodio && quarto ? alvo(linha, quarto, 'vantagem') : null,
        },
      ]
    }),
  )
  return { faixa, porJogador }
}

export interface Candidato {
  linha: LinhaRankingTorneio
  /** null para o líder. */
  paraOLider: DistanciaAlvo | null
  /** null quando o formato não tem rodadas (ou os pontos ainda zeram no corte). */
  alcanca: boolean | null
}

/**
 * Candidatos ao 1º: a metade de cima (4 a 8). "Alcança": diferença até o que faltam
 * de rodadas para ele × o melhor resultado de uma rodada no torneio. É uma estimativa.
 */
export function candidatosAoPrimeiro(
  torneio: Torneio,
  partidas: readonly Partida[],
  linhas: readonly LinhaRankingTorneio[],
): Candidato[] {
  const disputa = disputantes(linhas)
  const quantos = Math.min(CANDIDATOS.maximo, Math.max(CANDIDATOS.minimo, Math.ceil(disputa.length / 2)))

  const { formato } = torneio
  const total = totalDeRodadas(formato)
  const aindaZera = formato.tipo === 'eliminatorio' && !formato.pontosCarregados
  const estima = total !== null && !aindaZera && torneio.status === 'em_andamento'

  const jogadas = new Map<string, number>()
  let melhorRodada = 0
  for (const { status, vinculoTorneio, resultado, wo } of partidas) {
    if (status !== 'finalizada' || vinculoTorneio?.torneioId !== torneio.id) continue
    for (const { jogadorId, final } of resultado ?? []) {
      jogadas.set(jogadorId, (jogadas.get(jogadorId) ?? 0) + 1)
      if (!wo) melhorRodada = Math.max(melhorRodada, final)
    }
  }

  return disputa.slice(0, quantos).map((linha, indice) => {
    if (indice === 0) return { linha, paraOLider: null, alcanca: null }
    const paraOLider = alvo(linha, disputa[0], 'falta')
    const restantes = Math.max(0, (total ?? 0) - (jogadas.get(linha.jogadorId) ?? 0))
    const alcanca = estima ? paraOLider.diferenca <= umaCasa(restantes * melhorRodada) : null
    return { linha, paraOLider, alcanca }
  })
}
