/**
 * Eliminatório: fase classificatória (fase 0, Rodízio ou Suíço) e depois um corte
 * por fase. Em cada fase eliminatória as mesas seguem a classificação, como no
 * Suíço. Os pontos podem seguir de uma fase para a outra ou zerar a cada corte.
 */
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { classificar, type LinhaClassificacao } from '../classificacao'
import type { ConfigFormato, RodadaTorneio, Torneio } from '../tipos'
import { mesasPelaOrdem } from './comum'

type FormatoEliminatorio = Extract<ConfigFormato, { tipo: 'eliminatorio' }>

export const faseDaRodada = (rodada: RodadaTorneio) => rodada.fase ?? 0

/** Quem joga a fase: quem sentou nas mesas dela (fica certo mesmo se um resultado for corrigido depois). */
export function participantesDaFase(torneio: Torneio, fase: number): string[] {
  if (fase === 0) return torneio.jogadorIds
  const sentados = new Set(
    torneio.rodadas.filter((rodada) => faseDaRodada(rodada) === fase).flatMap((rodada) => rodada.mesas.flatMap((mesa) => mesa.assentos)),
  )
  return torneio.jogadorIds.filter((id) => sentados.has(id))
}

/**
 * Classificação dentro da fase, só com quem a joga. Com pontos carregados conta
 * tudo desde a classificatória; com pontos zerados, só as rodadas da fase.
 */
export function classificacaoDaFase(
  torneio: Torneio,
  partidas: readonly Partida[],
  fase: number,
  formato: FormatoEliminatorio,
): LinhaClassificacao[] {
  const rodadas = new Set(
    torneio.rodadas
      .filter((rodada) => (formato.pontosCarregados ? faseDaRodada(rodada) <= fase : faseDaRodada(rodada) === fase))
      .map((rodada) => rodada.numero),
  )
  const participantes = new Set(participantesDaFase(torneio, fase))
  return classificar(torneio, partidas, rodadas).filter((linha) => participantes.has(linha.jogadorId))
}

export function proximaRodadaEliminatoria(
  torneio: Torneio,
  formato: FormatoEliminatorio,
  partidas: readonly Partida[],
  agora: string,
): RodadaTorneio | null {
  const ultima = torneio.rodadas[torneio.rodadas.length - 1]
  if (!ultima) return null
  const fase = faseDaRodada(ultima)
  const jogadasNaFase = torneio.rodadas.filter((rodada) => faseDaRodada(rodada) === fase).length
  const limite = fase === 0 ? formato.rodadasClassificatoria : formato.rodadasPorFase
  const numero = torneio.rodadas.length + 1

  if (jogadasNaFase < limite) {
    // O Rodízio da classificatória já saiu inteiro no sorteio.
    if (fase === 0 && formato.classificatoria === 'rodizio') return null
    const ordem = classificacaoDaFase(torneio, partidas, fase, formato).map((linha) => linha.jogadorId)
    return { numero, fase, geradaEm: agora, mesas: mesasPelaOrdem(ordem, torneio.rodadas) }
  }

  if (fase >= formato.cortes.length) return null
  const avancam = classificacaoDaFase(torneio, partidas, fase, formato)
    .slice(0, formato.cortes[fase])
    .map((linha) => linha.jogadorId)
  return { numero, fase: fase + 1, geradaEm: agora, mesas: mesasPelaOrdem(avancam, torneio.rodadas) }
}

/** A última fase eliminatória com uma mesa só. */
export function ehMesaFinal(torneio: Torneio, rodada: RodadaTorneio): boolean {
  const { formato } = torneio
  return (
    formato.tipo === 'eliminatorio' &&
    faseDaRodada(rodada) === formato.cortes.length &&
    formato.cortes.length > 0 &&
    rodada.mesas.length === 1
  )
}

export interface LinhaEliminatorio extends LinhaClassificacao {
  /** Até onde o jogador chegou: 0 = classificatória. */
  fase: number
}

/**
 * Ranking final: quem foi mais longe vem antes; dentro da mesma fase, pelos pontos
 * da classificação daquela fase.
 */
export function rankingEliminatorio(torneio: Torneio, partidas: readonly Partida[]): LinhaEliminatorio[] {
  const { formato } = torneio
  if (formato.tipo !== 'eliminatorio') return []
  const ultimaFase = Math.max(0, ...torneio.rodadas.map(faseDaRodada))
  const vistos = new Set<string>()
  const saida: LinhaEliminatorio[] = []
  for (let fase = ultimaFase; fase >= 0; fase--) {
    for (const linha of classificacaoDaFase(torneio, partidas, fase, formato)) {
      if (vistos.has(linha.jogadorId)) continue
      vistos.add(linha.jogadorId)
      saida.push({ ...linha, fase })
    }
  }
  return saida
}
