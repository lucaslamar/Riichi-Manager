/** Mesas a partir de uma ordem, usadas pelo Torneio e pelo Clube. Sem tela e sem domínio. */
import {
  contarVentos,
  type Assentos,
  type JogadoresPorMesa,
  type MesaDaRodada,
  type RodadaDoSorteio,
} from './contagens'
import { compararCustos, criarAvaliador, REGRAS, type AvaliadorDeMesas } from './custo'

/** Todas as ordens de N posições: 24 para 4, 6 para 3. */
function permutacoes(tamanho: number): number[][] {
  const saida: number[][] = []
  const montar = (atual: number[]) => {
    if (atual.length === tamanho) return void saida.push(atual)
    for (let indice = 0; indice < tamanho; indice++) if (!atual.includes(indice)) montar([...atual, indice])
  }
  montar([])
  return saida
}

const PERMUTACOES: Record<JogadoresPorMesa, number[][]> = { 3: permutacoes(3), 4: permutacoes(4) }
const PASSADAS = 20

/** Assentos da mesa; no Sanma a 4ª cadeira (Norte) fica vazia. */
export function assentosDoGrupo(grupo: readonly string[]): Assentos {
  return [grupo[0], grupo[1], grupo[2], grupo[3] ?? '']
}

/**
 * Senta os 4 da mesa: quem foi Leste menos vezes tem prioridade para Leste, depois
 * o mesmo para os outros ventos. Leste pesa mais porque é quem dá as cartas.
 */
export function assentarComVentos(
  grupo: readonly string[],
  ventos: ReadonlyMap<string, readonly number[]>,
): Assentos {
  const PESOS = [100, 10, 10, 10]
  const ordens = PERMUTACOES[grupo.length === 3 ? 3 : 4]
  let melhor = ordens[0]
  let melhorCusto = Infinity
  for (const ordem of ordens) {
    // ordem[vento] = índice no grupo de quem senta nesse vento
    const custo = ordem.reduce(
      (soma, indiceGrupo, vento) => soma + (ventos.get(grupo[indiceGrupo])?.[vento] ?? 0) * PESOS[vento],
      0,
    )
    if (custo < melhorCusto) {
      melhorCusto = custo
      melhor = ordem
    }
  }
  return assentosDoGrupo(melhor.map((indiceGrupo) => grupo[indiceGrupo]))
}

/**
 * Troca jogadores entre mesas, dos vizinhos de ordem para os mais distantes,
 * enquanto o custo cair. Altera a `fila` e devolve o custo da rodada.
 */
export function melhorarFila(fila: Int32Array, porMesa: number, avaliador: AvaliadorDeMesas): Float64Array {
  const totalMesas = Math.floor(fila.length / porMesa)
  const custos = Array.from({ length: totalMesas }, (_, mesa) => {
    const custo = new Float64Array(REGRAS)
    avaliador.somar(fila, mesa * porMesa, custo)
    return custo
  })
  const antes = new Float64Array(REGRAS)
  const depois = new Float64Array(REGRAS)

  for (let passada = 0; passada < PASSADAS; passada++) {
    let melhorou = false
    for (let mesa = 0; mesa < totalMesas; mesa++) {
      if (custos[mesa].every((valor) => valor === 0)) continue
      const inicio = mesa * porMesa
      let trocou = false
      for (let distancia = 1; distancia < fila.length && !trocou; distancia++) {
        for (let de = inicio; de < inicio + porMesa && !trocou; de++) {
          for (let sentido = -1; sentido <= 1; sentido += 2) {
            const para = de + distancia * sentido
            if (para < 0 || para >= totalMesas * porMesa || (para >= inicio && para < inicio + porMesa)) continue
            const vizinha = Math.floor(para / porMesa)
            for (let regra = 0; regra < REGRAS; regra++) antes[regra] = custos[mesa][regra] + custos[vizinha][regra]
            const saindo = fila[de]
            fila[de] = fila[para]
            fila[para] = saindo
            for (let regra = 0; regra < REGRAS; regra++) depois[regra] = 0
            avaliador.somar(fila, inicio, depois)
            avaliador.somar(fila, vizinha * porMesa, depois)
            if (compararCustos(depois, antes) < 0) {
              custos[mesa].fill(0)
              custos[vizinha].fill(0)
              avaliador.somar(fila, inicio, custos[mesa])
              avaliador.somar(fila, vizinha * porMesa, custos[vizinha])
              trocou = true
              melhorou = true
              break
            }
            fila[para] = fila[de]
            fila[de] = saindo
          }
        }
      }
    }
    if (!melhorou) break
  }

  const total = new Float64Array(REGRAS)
  for (const custo of custos) for (let regra = 0; regra < REGRAS; regra++) total[regra] += custo[regra]
  return total
}

export function mesasDaFila(
  fila: readonly string[],
  anteriores: readonly RodadaDoSorteio[],
  porMesa: JogadoresPorMesa,
  comVentos: boolean,
): MesaDaRodada[] {
  const ventos = contarVentos(anteriores)
  return Array.from({ length: Math.floor(fila.length / porMesa) }, (_, mesa) => {
    const grupo = fila.slice(mesa * porMesa, (mesa + 1) * porMesa)
    return { numero: mesa + 1, assentos: comVentos ? assentarComVentos(grupo, ventos) : assentosDoGrupo(grupo) }
  })
}

/**
 * Mesas a partir de uma ordem (a classificação, no Suíço e nos cortes): de 4 em 4,
 * com trocas entre vizinhos para cumprir as regras de `custo.ts`. Sem ventos
 * sorteados (`comVentos` falso) os ventos não pesam.
 */
export function mesasPelaOrdem(
  ordem: readonly string[],
  anteriores: readonly RodadaDoSorteio[],
  porMesa: JogadoresPorMesa = 4,
  comVentos = true,
): MesaDaRodada[] {
  const fila = Int32Array.from(ordem, (_, indice) => indice)
  melhorarFila(fila, porMesa, criarAvaliador(ordem, anteriores, porMesa, comVentos))
  return mesasDaFila(Array.from(fila, (indice) => ordem[indice]), anteriores, porMesa, comVentos)
}
