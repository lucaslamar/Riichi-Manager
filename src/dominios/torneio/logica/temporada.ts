/**
 * Pontos corridos (temporada): uma liga com vários encontros ao longo de um
 * período. Cada encontro é um Torneio com formato `temporada`, com a própria lista
 * e o próprio sorteio. O ranking da temporada junta as partidas de todos.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { configPadraoTorneio, criarRascunho } from './torneio'
import type { CriterioTemporada, Temporada, Torneio } from './tipos'

export function criarTemporada(dados: {
  id: string
  nome: string
  inicio: string
  fim: string
  agora: string
}): Temporada {
  return {
    id: dados.id,
    nome: dados.nome,
    inicio: dados.inicio,
    fim: dados.fim,
    criterio: { tipo: 'soma' },
    config: configPadraoTorneio(),
    criadaEm: dados.agora,
  }
}

export function encontrosDaTemporada(torneios: readonly Torneio[], temporadaId: string): Torneio[] {
  return torneios
    .filter((torneio) => torneio.formato.tipo === 'temporada' && torneio.formato.temporadaId === temporadaId)
    .sort((um, outro) => um.data.localeCompare(outro.data) || um.criadoEm.localeCompare(outro.criadoEm))
}

/** Novo encontro: rascunho com as regras da temporada, pronto para a Lista. */
export function novoEncontro(temporada: Temporada, contexto: { id: string; agora: Date; nome: string }): Torneio {
  return {
    ...criarRascunho(contexto),
    formato: { tipo: 'temporada', temporadaId: temporada.id },
    config: temporada.config,
  }
}

export interface LinhaTemporada {
  jogadorId: string
  /** O número que ordena, conforme o critério. */
  valor: number
  partidas: number
  encontros: number
  soma: number
  /** Média: não chegou ao mínimo de partidas (fica no fim, fora da ordem). */
  abaixoDoMinimo: boolean
}

const arredondar = (valor: number) => Math.round(valor * 10) / 10

/**
 * Ranking acumulado: soma total, média por partida (com mínimo de partidas) ou
 * soma dos melhores N resultados de partida.
 */
export function rankingTemporada(
  encontros: readonly Torneio[],
  partidas: readonly Partida[],
  criterio: CriterioTemporada,
): LinhaTemporada[] {
  const ids = new Set(encontros.map((encontro) => encontro.id))
  const resultados = new Map<string, { finais: number[]; encontros: Set<string> }>()
  for (const partida of partidas) {
    const vinculo = partida.vinculoTorneio
    if (!vinculo || !ids.has(vinculo.torneioId) || partida.status !== 'finalizada') continue
    for (const linha of partida.resultado ?? []) {
      const atual = resultados.get(linha.jogadorId) ?? { finais: [], encontros: new Set<string>() }
      atual.finais.push(linha.final)
      atual.encontros.add(vinculo.torneioId)
      resultados.set(linha.jogadorId, atual)
    }
  }
  // Quem esteve em algum encontro e ainda não terminou partida aparece com zero.
  for (const encontro of encontros) {
    for (const id of encontro.jogadorIds) {
      if (!resultados.has(id)) resultados.set(id, { finais: [], encontros: new Set([encontro.id]) })
    }
  }

  const linhas = [...resultados.entries()].map(([jogadorId, dados]) => {
    const soma = dados.finais.reduce((total, final) => total + final, 0)
    const partidasJogadas = dados.finais.length
    let valor = soma
    let abaixoDoMinimo = false
    if (criterio.tipo === 'media') {
      valor = partidasJogadas ? soma / partidasJogadas : 0
      abaixoDoMinimo = partidasJogadas < criterio.minimoPartidas
    } else if (criterio.tipo === 'melhores') {
      valor = [...dados.finais]
        .sort((um, outro) => outro - um)
        .slice(0, criterio.quantidade)
        .reduce((total, final) => total + final, 0)
    }
    return {
      jogadorId,
      valor: arredondar(valor),
      partidas: partidasJogadas,
      encontros: dados.encontros.size,
      soma: arredondar(soma),
      abaixoDoMinimo,
    }
  })
  return linhas.sort(
    (uma, outra) =>
      Number(uma.abaixoDoMinimo) - Number(outra.abaixoDoMinimo) ||
      outra.valor - uma.valor ||
      outra.partidas - uma.partidas,
  )
}
