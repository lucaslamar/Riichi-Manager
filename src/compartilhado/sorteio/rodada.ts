/** Sorteio mitigado de uma rodada: embaralha, tenta várias vezes e fica com a de menor custo. */
import { embaralhar, inteiroAleatorioSeguro, type InteiroAleatorio } from './aleatorio'
import { mesmasMesas, type JogadoresPorMesa, type MesaDaRodada, type RodadaDoSorteio } from './contagens'
import { compararCustos, criarAvaliador } from './custo'
import { melhorarFila, mesasDaFila } from './mesas'
import { rodadaSemRepetir } from './semRepeticao'

const TENTATIVAS = 1500
/** Cada tentativa custa perto de mesas², então torneio grande tenta menos para não travar o celular. */
const ORCAMENTO_DE_TROCAS = 7_500
const TENTATIVAS_MINIMAS = 8
/** Nas grades sem repetição, sorteios até achar mesas diferentes das que saíram. */
const TENTATIVAS_DIFERENTE = 12

export interface OpcoesDoSorteio {
  porMesa?: JogadoresPorMesa
  /** Falso: os ventos saem na mesa, então não pesam. */
  comVentos?: boolean
  aleatorio?: InteiroAleatorio
  /** Sortear de novo: entre sorteios tão bons quanto, prefere mesas diferentes destas. */
  evitar?: RodadaDoSorteio['mesas']
}

export function sortearRodada(
  jogadores: readonly string[],
  anteriores: readonly RodadaDoSorteio[],
  { porMesa = 4, comVentos = true, aleatorio = inteiroAleatorioSeguro, evitar }: OpcoesDoSorteio = {},
): MesaDaRodada[] {
  const semRepetir = () => rodadaSemRepetir(jogadores, anteriores, porMesa, comVentos, aleatorio)
  let perfeita = semRepetir()
  for (let vez = 0; perfeita && evitar && vez < TENTATIVAS_DIFERENTE && mesmasMesas(perfeita, evitar); vez++) {
    perfeita = semRepetir() ?? perfeita
  }
  if (perfeita) return perfeita

  const avaliador = criarAvaliador(jogadores, anteriores, porMesa, comVentos)
  const indices = jogadores.map((_, indice) => indice)
  const mesasNaRodada = Math.max(1, Math.floor(jogadores.length / porMesa))
  const tentativas = Math.max(
    TENTATIVAS_MINIMAS,
    Math.min(TENTATIVAS, Math.floor(ORCAMENTO_DE_TROCAS / (mesasNaRodada * mesasNaRodada))),
  )

  const montar = (fila: Int32Array) =>
    mesasDaFila(Array.from(fila, (indice) => jogadores[indice]), anteriores, porMesa, comVentos)

  let melhorFila: Int32Array | null = null
  let melhorCusto: Float64Array | null = null
  let melhorEhIgual = false
  for (let tentativa = 0; tentativa < tentativas; tentativa++) {
    const fila = Int32Array.from(embaralhar(indices, aleatorio))
    const custo = melhorarFila(fila, porMesa, avaliador)
    const diferenca = melhorCusto ? compararCustos(custo, melhorCusto) : -1
    if (diferenca > 0 || (diferenca === 0 && !melhorEhIgual)) continue
    const igual = !!evitar && mesmasMesas(montar(fila), evitar)
    if (diferenca === 0 && igual) continue
    melhorFila = fila
    melhorCusto = custo
    melhorEhIgual = igual
    if (!igual && custo.every((valor) => valor === 0)) break
  }
  return montar(melhorFila ?? Int32Array.from(indices))
}
