/**
 * Histórico e ranking geral, derivados das partidas finalizadas. Nada fica salvo à
 * parte: cada partida já guarda o resultado calculado com a própria config, e
 * empate de pontos já vem com a uma dividida.
 */
import { lerVariante } from '@/compartilhado/mahjong/variante'
import type { Partida } from './partida'

export type FiltroPeriodo = 'mes' | 'ano' | 'tudo'
export type FiltroOrigem = 'todas' | 'casuais' | 'torneios'

export interface FiltrosRanking {
  periodo: FiltroPeriodo
  origem: FiltroOrigem
}

export interface LinhaRanking {
  jogadorId: string
  partidas: number
  pontuacaoTotal: number
  mediaColocacao: number
  percentualPrimeiro: number
  percentualQuarto: number
  percentualTobi: number
}

const arredondar = (valor: number) => Math.round(valor * 100) / 100

/**
 * Só as finalizadas, da mais recente para a mais antiga. Mesa de torneio só entra
 * depois de guardada pelo organizador.
 */
export function partidasDoHistorico(partidas: readonly Partida[]): Partida[] {
  return partidas
    .filter(
      (partida) =>
        partida.status === 'finalizada' &&
        partida.resultado &&
        partida.finalizadaEm &&
        (!partida.vinculoTorneio || partida.vinculoTorneio.guardada),
    )
    .sort((uma, outra) => (outra.finalizadaEm ?? '').localeCompare(uma.finalizadaEm ?? ''))
}

export function origemDaPartida(partida: Partida): 'casual' | 'torneio' {
  return partida.vinculoTorneio ? 'torneio' : 'casual'
}

function dentroDoPeriodo(iso: string, periodo: FiltroPeriodo, agora: Date) {
  if (periodo === 'tudo') return true
  const data = new Date(iso)
  if (data.getFullYear() !== agora.getFullYear()) return false
  return periodo === 'ano' || data.getMonth() === agora.getMonth()
}

export function calcularRanking(
  partidas: readonly Partida[],
  filtros: FiltrosRanking,
  agora: Date,
): LinhaRanking[] {
  const acumulado = new Map<
    string,
    { partidas: number; total: number; colocacoes: number; primeiros: number; quartos: number; tobis: number }
  >()

  for (const partida of partidasDoHistorico(partidas)) {
    const origem = origemDaPartida(partida)
    if (filtros.origem === 'casuais' && origem !== 'casual') continue
    if (filtros.origem === 'torneios' && origem !== 'torneio') continue
    if (!dentroDoPeriodo(partida.finalizadaEm ?? '', filtros.periodo, agora)) continue

    for (const linha of partida.resultado ?? []) {
      const atual = acumulado.get(linha.jogadorId) ?? {
        partidas: 0,
        total: 0,
        colocacoes: 0,
        primeiros: 0,
        quartos: 0,
        tobis: 0,
      }
      atual.partidas += 1
      atual.total += linha.final
      atual.colocacoes += linha.colocacao
      if (linha.colocacao === 1) atual.primeiros += 1
      if (linha.colocacao === 4) atual.quartos += 1
      if (linha.pontosBrutos < 0) atual.tobis += 1
      acumulado.set(linha.jogadorId, atual)
    }
  }

  return [...acumulado.entries()]
    .map(([jogadorId, dados]) => ({
      jogadorId,
      partidas: dados.partidas,
      pontuacaoTotal: arredondar(dados.total),
      mediaColocacao: arredondar(dados.colocacoes / dados.partidas),
      percentualPrimeiro: arredondar((dados.primeiros / dados.partidas) * 100),
      percentualQuarto: arredondar((dados.quartos / dados.partidas) * 100),
      percentualTobi: arredondar((dados.tobis / dados.partidas) * 100),
    }))
    .sort(
      (uma, outra) =>
        outra.pontuacaoTotal - uma.pontuacaoTotal || uma.mediaColocacao - outra.mediaColocacao,
    )
}

/** Onde o jogador aparece: mesas abertas pelo nome da tela e total de finalizadas. */
export function usoDoJogadorNasPartidas(partidas: readonly Partida[], jogadorId: string) {
  const joga = (partida: Partida) =>
    Object.values(partida.assentos).some((assento) => assento.jogadorId === jogadorId)
  const abertas = partidas.filter((partida) => partida.status === 'em_andamento')
  return {
    /** Índices base 1, os mesmos do seletor "Mesa N". */
    mesasAbertas: abertas.flatMap((partida, indice) => (joga(partida) ? [indice + 1] : [])),
    partidasFinalizadas: partidasDoHistorico(partidas).filter(joga).length,
  }
}

/** Guarda o nome em todas as partidas dele, antes de sair do cadastro. */
export function guardarNomeNasPartidas(partidas: readonly Partida[], jogadorId: string, nome: string): Partida[] {
  return partidas.map((partida) => {
    const assentos = { ...partida.assentos }
    let mudou = false
    for (const cadeira of [0, 1, 2, 3] as const) {
      if (assentos[cadeira].jogadorId === jogadorId) {
        assentos[cadeira] = { ...assentos[cadeira], nome }
        mudou = true
      }
    }
    return mudou ? { ...partida, assentos } : partida
  })
}

/** Quem saiu do cadastro sai do ranking; os demais seguem com os mesmos pontos. */
export function semExcluidos(linhas: readonly LinhaRanking[], existe: (id: string) => boolean) {
  return linhas.filter((linha) => existe(linha.jogadorId))
}

/** Posição de cada linha: pontuação igual fica na mesma posição. */
export function posicoesDoRanking(linhas: readonly LinhaRanking[]): number[] {
  return linhas.map(
    (linha) => linhas.findIndex((outra) => outra.pontuacaoTotal === linha.pontuacaoTotal) + 1,
  )
}

export interface MudancaRanking {
  jogadorId: string
  /** Sem partidas antes: estreia no ranking. */
  antes: { total: number; posicao: number } | null
  depois: { total: number; posicao: number }
}

/**
 * Como o ranking geral (todo o período) fica com a partida `nova`: total e
 * posição de cada jogador dela, antes e depois. Quem não está no cadastro
 * (convidado) fica de fora, como na tela do Ranking.
 */
export function mudancaNoRanking(
  partidas: readonly Partida[],
  nova: Partida,
  agora: Date,
  existe: (id: string) => boolean,
): MudancaRanking[] {
  const situacao = (lista: readonly Partida[]) => {
    const linhas = semExcluidos(calcularRanking(lista, { periodo: 'tudo', origem: 'todas' }, agora), existe)
    const posicoes = posicoesDoRanking(linhas)
    return new Map(
      linhas.map((linha, indice) => [linha.jogadorId, { total: linha.pontuacaoTotal, posicao: posicoes[indice] }]),
    )
  }
  // O ranking nunca mistura 4 e 3 jogadores: conta só as partidas da mesma variante.
  const mesma = partidas.filter((partida) => lerVariante(partida.variante) === lerVariante(nova.variante))
  const antes = situacao(mesma)
  const depois = situacao([...mesma, nova])
  return [...(nova.resultado ?? [])]
    .sort((uma, outra) => uma.colocacao - outra.colocacao)
    .flatMap((linha) => {
      const final = depois.get(linha.jogadorId)
      return final ? [{ jogadorId: linha.jogadorId, antes: antes.get(linha.jogadorId) ?? null, depois: final }] : []
    })
}
