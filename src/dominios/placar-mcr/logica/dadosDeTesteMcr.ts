/**
 * Massa de teste do modo Chinês (só em `npm run dev`, pelo botão DEV): placares
 * MCR finalizados com os jogadores de teste do Riichi e um torneio Suíço MCR
 * encerrado, para o Ranking, o Histórico e o Torneio terem o que mostrar.
 */
import { IDS, PREFIXO_TESTE, sorteador } from '@/dominios/centerpiece/logica/dadosDeTeste'
import { proximaRodada, rodadasIniciais } from '@/dominios/torneio/logica/formatos'
import {
  criarRascunho,
  finalizarTorneio,
  formatoPadrao,
  iniciarTorneio,
} from '@/dominios/torneio/logica/torneio'
import type { Torneio } from '@/dominios/torneio/logica/tipos'
import {
  finalizar,
  novoPlacar,
  registrarMao,
  TOTAL_MAOS,
  type Cadeira,
  type PlacarMcr,
} from './placar'
import { partidasDoTorneioMcr } from './torneio'

const DIA = 86_400_000
type Sortear = () => number

/** Uma partida inteira (16 mãos): 1 em 5 empata, o resto vence por ron ou tsumo com 8 a 32 fan. */
function jogarPlacar(
  sortear: Sortear,
  id: string,
  jogadorIds: [string, string, string, string],
  quando: Date,
): PlacarMcr {
  let placar = novoPlacar(id, jogadorIds, 30, quando.toISOString())
  for (let mao = 0; mao < TOTAL_MAOS; mao++) {
    if (sortear() < 0.2) {
      placar = registrarMao(placar, { tipo: 'empate' })
      continue
    }
    const vencedor = Math.floor(sortear() * 4) as Cadeira
    const fan = 8 + Math.floor(sortear() * sortear() * 25)
    const descartador = ((vencedor + 1 + Math.floor(sortear() * 3)) % 4) as Cadeira
    placar = registrarMao(
      placar,
      sortear() < 0.3
        ? { tipo: 'vitoria', vencedor, forma: 'tsumo', fan }
        : { tipo: 'vitoria', vencedor, forma: 'ron', descartador, fan },
    )
  }
  return finalizar(placar, new Date(quando.getTime() + 90 * 60_000).toISOString())
}

function embaralhados(sortear: Sortear, ids: readonly string[]) {
  return [...ids].sort(() => sortear() - 0.5)
}

export function gerarDadosMcrDeTeste(agora: Date, semente = 21) {
  const sortear = sorteador(semente)
  const placares: PlacarMcr[] = []

  // Partidas avulsas nos últimos 6 meses.
  for (let indice = 0; indice < 30; indice++) {
    const quando = new Date(agora.getTime() - Math.floor(sortear() * 180) * DIA)
    quando.setHours(19, 0, 0, 0)
    const mesa = embaralhados(sortear, IDS).slice(0, 4) as [string, string, string, string]
    placares.push(jogarPlacar(sortear, `${PREFIXO_TESTE}mcr-${indice + 1}`, mesa, quando))
  }

  // Um Suíço MCR de 3 rodadas, encerrado.
  const inicio = new Date(agora.getTime() - 30 * DIA)
  inicio.setHours(14, 0, 0, 0)
  const iso = inicio.toISOString()
  const base: Torneio = {
    ...criarRascunho({ id: `${PREFIXO_TESTE}torneio-mcr`, agora: inicio, nome: 'Copa MCR' }),
    formato: formatoPadrao('suico'),
    jogo: 'mcr',
  }
  let torneio = iniciarTorneio(base, [...IDS], rodadasIniciais(base, IDS, iso), iso)
  const mesasTorneio: PlacarMcr[] = []
  for (let rodada = 1; rodada <= 3; rodada++) {
    const atual = torneio.rodadas[rodada - 1]
    for (const mesa of atual.mesas) {
      const quando = new Date(inicio.getTime() + (rodada - 1) * 2 * 3_600_000)
      mesasTorneio.push({
        ...jogarPlacar(
          sortear,
          `${PREFIXO_TESTE}mcr-t-r${rodada}m${mesa.numero}`,
          mesa.assentos,
          quando,
        ),
        torneio: { id: torneio.id, rodada: rodada - 1, mesa: mesa.numero - 1 },
      })
    }
    if (rodada < 3) {
      const proxima = proximaRodada(torneio, partidasDoTorneioMcr(mesasTorneio), iso)
      if (proxima) torneio = { ...torneio, rodadas: [...torneio.rodadas, proxima] }
    }
  }
  torneio = finalizarTorneio(torneio, new Date(inicio.getTime() + 6 * 3_600_000).toISOString())

  return { placares: [...placares, ...mesasTorneio], torneio }
}
