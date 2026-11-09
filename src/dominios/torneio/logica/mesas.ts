/**
 * Mesas e rodadas em jogo: relógios, partida de cada mesa, sortear de novo e o
 * texto para compartilhar. Sem tela.
 */
import { configSoPontuacao } from '@/dominios/centerpiece/logica/configMesa'
import { criarPartida, KANJI_VENTO, ORDEM_VENTOS, type Partida, type Vento } from '@/dominios/centerpiece/logica/partida'
import { proximaRodada, rodadasIniciais } from './formatos'
import { relogioParado, statusDaMesa, type StatusMesa } from './torneio'
import type { MesaTorneio, Relogio, RodadaTorneio, Torneio } from './tipos'

export function relogioDaRodada(torneio: Torneio, rodada: RodadaTorneio): Relogio {
  return rodada.relogio ?? relogioParado(torneio.timers.rodadaSegundos)
}

/** O relógio já foi ligado alguma vez (correndo ou pausado depois de começar). */
export function relogioComecou(relogio: Relogio | null): boolean {
  return !!relogio && (relogio.iniciadoEm !== null || relogio.corridoSegundos > 0)
}

/**
 * Status que a mesa mostra. Sem o Centerpiece nas mesas, a partida só existe ao
 * registrar o resultado: até lá, a mesa fica "Em andamento" assim que o timer da
 * rodada (ou o da própria mesa) começa.
 */
export function statusNaTela(
  torneio: Torneio,
  rodada: RodadaTorneio,
  mesa: MesaTorneio,
  partida: Partida | undefined,
): StatusMesa {
  const status = statusDaMesa(partida)
  if (status !== 'nao_iniciada') return status
  const comecou = relogioComecou(relogioDaRodada(torneio, rodada)) || relogioComecou(relogioDaMesa(torneio, mesa))
  return comecou ? 'em_andamento' : status
}

/** Timer por mesa: mesmo tempo da rodada, contado a partir do início da mesa. */
export function relogioDaMesa(torneio: Torneio, mesa: MesaTorneio): Relogio | null {
  if (!torneio.timers.porMesa) return null
  return mesa.relogio ?? relogioParado(torneio.timers.rodadaSegundos)
}

export function trocarRodada(
  torneio: Torneio,
  numero: number,
  transformar: (rodada: RodadaTorneio) => RodadaTorneio,
): Torneio {
  return {
    ...torneio,
    rodadas: torneio.rodadas.map((rodada) => (rodada.numero === numero ? transformar(rodada) : rodada)),
  }
}

export function trocarMesa(
  torneio: Torneio,
  numeroRodada: number,
  numeroMesa: number,
  transformar: (mesa: MesaTorneio) => MesaTorneio,
): Torneio {
  return trocarRodada(torneio, numeroRodada, (rodada) => ({
    ...rodada,
    mesas: rodada.mesas.map((mesa) => (mesa.numero === numeroMesa ? transformar(mesa) : mesa)),
  }))
}

/**
 * Partida do Centerpiece para a mesa: jogadores nas cadeiras na ordem 東 南 西 北 e
 * as regras do torneio. Já nasce guardada: quando terminar, entra nos dois rankings.
 */
export function partidaDaMesaNova(
  torneio: Torneio,
  rodada: RodadaTorneio,
  mesa: MesaTorneio,
  contexto: { id: string; agora: string; nomes?: readonly string[] },
): Partida {
  return {
    ...criarPartida(contexto.id, configSoPontuacao(torneio.config), mesa.assentos, contexto.agora, contexto.nomes),
    vinculoTorneio: { torneioId: torneio.id, rodada: rodada.numero - 1, mesa: mesa.numero - 1, guardada: true },
  }
}

/** A rodada ainda pode ser sorteada de novo: nenhuma mesa dela foi aberta ou registrada. */
export function podeSortearDeNovo(torneio: Torneio, partidas: readonly Partida[]): boolean {
  const ultima = torneio.rodadas[torneio.rodadas.length - 1]
  if (!ultima || torneio.status !== 'em_andamento') return false
  return !partidas.some(
    (partida) => partida.vinculoTorneio?.torneioId === torneio.id && partida.vinculoTorneio.rodada === ultima.numero - 1,
  )
}

/**
 * Sorteia de novo a rodada atual. Sem nenhuma partida no torneio, refaz o sorteio
 * inicial (no Rodízio, a grade inteira). Senão, refaz só a última rodada.
 */
export function sortearDeNovo(torneio: Torneio, partidas: readonly Partida[], agora: string): Torneio {
  const temPartida = partidas.some((partida) => partida.vinculoTorneio?.torneioId === torneio.id)
  if (!temPartida) return { ...torneio, rodadas: rodadasIniciais(torneio, torneio.jogadorIds, agora) }
  const semUltima = { ...torneio, rodadas: torneio.rodadas.slice(0, -1) }
  const nova = proximaRodada(semUltima, partidas, agora)
  return nova ? { ...semUltima, rodadas: [...semUltima.rodadas, nova] } : torneio
}

/**
 * Reinicia o sorteio do zero com os mesmos jogadores: as rodadas iniciais saem de
 * novo (no Rodízio, a grade inteira). Os resultados do torneio saem junto, por fora.
 */
export function reiniciarSorteio(torneio: Torneio, agora: string): Torneio {
  return { ...torneio, rodadas: rodadasIniciais(torneio, torneio.jogadorIds, agora), atualizadoEm: agora }
}

/** "南2": rodada do vento e número da mão em jogo. */
export function maoAtual(partida: Partida): string {
  return `${KANJI_VENTO[partida.placar.rodadaVento]}${partida.placar.rodadaNumero}`
}

/** Texto para o WhatsApp: rodada, mesas, ventos e nomes. */
export function textoDaRodada(
  rodada: RodadaTorneio,
  rotulos: {
    titulo: string
    mesa: (numero: number) => string
    vento: (vento: Vento) => string
    nome: (jogadorId: string) => string
    /** false: só os nomes, os ventos saem na mesa. */
    ventos?: boolean
  },
): string {
  const blocos = rodada.mesas.map((mesa) =>
    [
      `*${rotulos.mesa(mesa.numero)}*`,
      ...mesa.assentos.map((jogadorId, indice) =>
        rotulos.ventos === false
          ? `• ${rotulos.nome(jogadorId)}`
          : `${KANJI_VENTO[ORDEM_VENTOS[indice]]} ${rotulos.vento(ORDEM_VENTOS[indice])}: ${rotulos.nome(jogadorId)}`,
      ),
    ].join('\n'),
  )
  return [rotulos.titulo, ...blocos].join('\n\n')
}
