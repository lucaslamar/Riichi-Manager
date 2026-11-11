/**
 * Regras que valem para todo formato que monta rodada a rodada (Suíço, fases do
 * Eliminatório, Pontos corridos): repetição de adversários e ventos equilibrados.
 */
import type { AssentosMesa, MesaTorneio, RodadaTorneio } from '../tipos'

/** Jogadores por mesa: 4 no yonma, 3 no Sanma (a 4ª cadeira da mesa fica vazia, `''`). */
export type JogadoresPorMesa = 3 | 4

/** Ids de quem senta na mesa, sem a cadeira vazia do Sanma. */
export const ocupantes = (assentos: readonly string[]) => assentos.filter((jogador) => jogador !== '')

export const chaveDoPar = (um: string, outro: string) => (um < outro ? `${um}|${outro}` : `${outro}|${um}`)

/** Quantas vezes cada dupla já se enfrentou. */
export function contarPares(rodadas: readonly RodadaTorneio[]): Map<string, number> {
  const contagem = new Map<string, number>()
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      const jogadores = ocupantes(mesa.assentos)
      for (let um = 0; um < jogadores.length; um++) {
        for (let outro = um + 1; outro < jogadores.length; outro++) {
          const chave = chaveDoPar(jogadores[um], jogadores[outro])
          contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
        }
      }
    }
  }
  return contagem
}

/** Custo de juntar estes jogadores: cada encontro anterior pesa ao quadrado. */
export function custoDaMesa(jogadores: readonly string[], pares: ReadonlyMap<string, number>): number {
  let custo = 0
  for (let um = 0; um < jogadores.length; um++) {
    for (let outro = um + 1; outro < jogadores.length; outro++) {
      const vezes = pares.get(chaveDoPar(jogadores[um], jogadores[outro])) ?? 0
      custo += vezes * vezes
    }
  }
  return custo
}

/** Vezes em cada vento (東 南 西 北) por jogador. */
export function contarVentos(rodadas: readonly RodadaTorneio[]): Map<string, [number, number, number, number]> {
  const contagem = new Map<string, [number, number, number, number]>()
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      mesa.assentos.forEach((jogador, vento) => {
        if (jogador === '') return
        const linha = contagem.get(jogador) ?? [0, 0, 0, 0]
        linha[vento] += 1
        contagem.set(jogador, linha)
      })
    }
  }
  return contagem
}

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

/** Assentos da mesa; no Sanma a 4ª cadeira (Norte) fica vazia. */
export function assentosDoGrupo(grupo: readonly string[]): AssentosMesa {
  return [grupo[0], grupo[1], grupo[2], grupo[3] ?? ''] as AssentosMesa
}

/**
 * Senta os 4 da mesa: quem foi Leste menos vezes tem prioridade para Leste, depois
 * o mesmo para os outros ventos. Leste pesa mais porque é quem dá as cartas.
 */
export function assentarComVentos(
  grupo: readonly string[],
  ventos: ReadonlyMap<string, readonly number[]>,
): AssentosMesa {
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
 * Mesas a partir de uma ordem (classificação ou sorteio): de 4 em 4. Quando alguém
 * já enfrentou outro da mesa, ou quando a mesa não tem ninguém "na vez" de ser
 * Leste, troca com o vizinho de ordem mais próximo em outra mesa, se isso melhorar.
 */
export function mesasPelaOrdem(
  ordem: readonly string[],
  anteriores: readonly RodadaTorneio[],
  porMesa: JogadoresPorMesa = 4,
): MesaTorneio[] {
  const pares = contarPares(anteriores)
  const ventos = contarVentos(anteriores)
  const fila = [...ordem]
  const totalMesas = Math.floor(fila.length / porMesa)
  const grupo = (mesa: number) => fila.slice(mesa * porMesa, mesa * porMesa + porMesa)
  const leste = (jogador: string) => ventos.get(jogador)?.[0] ?? 0
  const menorLeste = Math.min(...fila.map(leste))
  /**
   * Cada mesa precisa de alguém com o menor número de Leste do torneio; sem isso,
   * um jogador seria Leste de novo enquanto outro ainda não foi. Isso pesa mais
   * que repetir adversário.
   */
  const custo = (mesa: number) => {
    const jogadores = grupo(mesa)
    return custoDaMesa(jogadores, pares) * 100 + (Math.min(...jogadores.map(leste)) - menorLeste) * 1_000_000
  }

  for (let passada = 0; passada < 20; passada++) {
    let melhorou = false
    for (let mesa = 0; mesa < totalMesas; mesa++) {
      if (custo(mesa) === 0) continue
      // Trocas com as outras mesas, da menor distância de posição para a maior.
      const trocas: [number, number][] = []
      for (let vizinha = 0; vizinha < totalMesas; vizinha++) {
        if (vizinha === mesa) continue
        for (let de = mesa * porMesa; de < mesa * porMesa + porMesa; de++) {
          for (let para = vizinha * porMesa; para < vizinha * porMesa + porMesa; para++) trocas.push([de, para])
        }
      }
      trocas.sort(([de1, para1], [de2, para2]) => Math.abs(de1 - para1) - Math.abs(de2 - para2))
      for (const [de, para] of trocas) {
        const vizinha = Math.floor(para / porMesa)
        const antes = custo(mesa) + custo(vizinha)
        ;[fila[de], fila[para]] = [fila[para], fila[de]]
        const depois = custo(mesa) + custo(vizinha)
        if (depois < antes) {
          melhorou = true
          break
        }
        ;[fila[de], fila[para]] = [fila[para], fila[de]]
      }
    }
    if (!melhorou) break
  }

  return Array.from({ length: totalMesas }, (_, mesa) => ({
    numero: mesa + 1,
    assentos: assentarComVentos(grupo(mesa), ventos),
  }))
}
