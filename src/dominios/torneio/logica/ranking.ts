/**
 * Ranking do torneio: classificação com posição (empatados dividem a posição) e,
 * no Eliminatório, a fase em que cada um parou.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import type { MudancaRanking } from '@/dominios/centerpiece/logica/ranking'
import { classificar, type LinhaClassificacao } from './classificacao'
import { faseDaRodada, rankingEliminatorio } from './formatos/eliminatorio'
import { progressoDaRodada } from './torneio'
import type { Torneio } from './tipos'

export interface LinhaRankingTorneio extends LinhaClassificacao {
  posicao: number
  /** Só no Eliminatório: 0 = parou na classificatória. */
  fase?: number
}

export function rankingDoTorneio(torneio: Torneio, partidas: readonly Partida[]): LinhaRankingTorneio[] {
  const linhas: (LinhaClassificacao & { fase?: number })[] =
    torneio.formato.tipo === 'eliminatorio' ? rankingEliminatorio(torneio, partidas) : classificar(torneio, partidas)
  return comPosicoes(linhas)
}

function comPosicoes(linhas: readonly (LinhaClassificacao & { fase?: number })[]): LinhaRankingTorneio[] {
  return linhas.map((linha, indice) => {
    // Mesma fase e mesmos pontos: mesma posição (1, 2, 2, 4).
    let primeiro = indice
    while (
      primeiro > 0 &&
      linhas[primeiro - 1].pontos === linha.pontos &&
      linhas[primeiro - 1].desempate === linha.desempate &&
      linhas[primeiro - 1].fase === linha.fase
    ) {
      primeiro--
    }
    return { ...linha, posicao: primeiro + 1 }
  })
}

/** O ranking como estava no fim da rodada (a partir de 1). */
export function rankingAteRodada(
  torneio: Torneio,
  partidas: readonly Partida[],
  rodada: number,
): LinhaRankingTorneio[] {
  const recorte = recorteAteRodada(torneio, partidas, rodada)
  return rankingDoTorneio(recorte.torneio, recorte.partidas)
}

/** O torneio e as partidas como estavam no fim da rodada. Com null, tudo. */
export function recorteAteRodada(
  torneio: Torneio,
  partidas: readonly Partida[],
  rodada: number | null,
): { torneio: Torneio; partidas: readonly Partida[] } {
  if (rodada === null) return { torneio, partidas }
  return {
    torneio: { ...torneio, rodadas: torneio.rodadas.filter((item) => item.numero <= rodada) },
    partidas: partidas.filter((partida) => partida.vinculoTorneio && partida.vinculoTorneio.rodada < rodada),
  }
}

export interface MudancaPosicao {
  jogadorId: string
  /** null: ainda não tinha jogado. */
  antes: number | null
  agora: number
  /** Positivo subiu, negativo caiu. */
  variacao: number
}

export interface MudancasDoRanking {
  /** As setas comparam com o fim desta rodada. */
  desde: number
  jogadores: MudancaPosicao[]
}

/**
 * Mudança de posição na última rodada com resultado. Só compara rodadas fechadas:
 * com mesa faltando, quem ainda não jogou pareceria cair. No Eliminatório compara
 * dentro da fase, e quem foi cortado fica sem seta.
 */
export function mudancasDoRanking(torneio: Torneio, partidas: readonly Partida[]): MudancasDoRanking | null {
  const ultima = Math.max(
    0,
    ...partidas.map(({ status, vinculoTorneio: vinculo }) =>
      status === 'finalizada' && vinculo?.torneioId === torneio.id ? vinculo.rodada + 1 : 0,
    ),
  )
  const rodada = torneio.rodadas.find((item) => item.numero === ultima)
  if (!rodada || ultima < 2) return null

  const incompleta = torneio.rodadas
    .filter((item) => item.numero <= ultima)
    .some((item) => {
      const { finalizadas, total } = progressoDaRodada(partidas, torneio, item)
      return finalizadas < total
    })
  if (incompleta) return null

  let atuais = rankingDoTorneio(torneio, partidas)
  const { formato } = torneio
  if (formato.tipo === 'eliminatorio') {
    const fase = faseDaRodada(rodada)
    const anterior = torneio.rodadas.find((item) => item.numero === ultima - 1)
    const pontosZeraram = !formato.pontosCarregados && !!anterior && faseDaRodada(anterior) < fase
    const faseSeguinteJaSaiu = torneio.rodadas.some((item) => faseDaRodada(item) > fase)
    if (pontosZeraram || faseSeguinteJaSaiu) return null
    atuais = atuais.filter((linha) => linha.fase === fase)
  }

  const comparados = new Set(atuais.map((linha) => linha.jogadorId))
  const anteriores = new Map(
    comPosicoes(
      rankingAteRodada(torneio, partidas, ultima - 1).filter((linha) => comparados.has(linha.jogadorId)),
    ).map((linha) => [linha.jogadorId, linha]),
  )
  const jogadores = atuais
    .filter((linha) => linha.partidas > 0)
    .map(({ jogadorId, posicao }) => {
      const anterior = anteriores.get(jogadorId)
      const antes = anterior?.partidas ? anterior.posicao : null
      return { jogadorId, antes, agora: posicao, variacao: antes === null ? 0 : antes - posicao }
    })
  return { desde: ultima - 1, jogadores }
}

/** Como o ranking do torneio fica com o resultado `nova`. Corrigir troca a partida `substituirId`. */
export function mudancaAoRegistrar(
  torneio: Torneio,
  partidas: readonly Partida[],
  nova: Partida,
  substituirId?: string,
): MudancaRanking[] {
  const situacao = (lista: readonly Partida[]) =>
    new Map(rankingDoTorneio(torneio, lista).map((linha) => [linha.jogadorId, linha]))
  const antes = situacao(partidas)
  const depois = situacao([...partidas.filter((partida) => partida.id !== substituirId), nova])
  return (nova.resultado ?? []).flatMap(({ jogadorId }) => {
    const final = depois.get(jogadorId)
    if (!final) return []
    const inicial = antes.get(jogadorId)
    return [
      {
        jogadorId,
        antes: inicial?.partidas ? { total: inicial.pontos, posicao: inicial.posicao } : null,
        depois: { total: final.pontos, posicao: final.posicao },
      },
    ]
  })
}

/** "▲2", "▼1" ou vazio, para o compartilhamento. */
export function textoDaSeta(mudanca: MudancaPosicao | undefined): string {
  if (!mudanca?.variacao) return ''
  return mudanca.variacao > 0 ? `▲${mudanca.variacao}` : `▼${-mudanca.variacao}`
}

/** Texto do ranking para o WhatsApp. */
export function textoDoRanking(
  linhas: readonly LinhaRankingTorneio[],
  rotulos: { titulo: string; nome: (id: string) => string; pontos: (valor: number) => string; fase?: (fase: number) => string },
): string {
  const corpo = linhas.map(
    (linha) =>
      `${linha.partidas > 0 ? `${linha.posicao}.` : '–'} ${rotulos.nome(linha.jogadorId)} ${rotulos.pontos(linha.pontos)}${
        linha.fase !== undefined && rotulos.fase ? ` · ${rotulos.fase(linha.fase)}` : ''
      }`,
  )
  return [rotulos.titulo, '', ...corpo].join('\n')
}
