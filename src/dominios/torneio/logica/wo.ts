/** WO e atraso do torneio (regra da casa, só Riichi de 4). Sem tela. */
import { regrasDoModo, type RegrasWo } from '@/compartilhado/modo-jogo/regrasDoModo'
import { CADEIRAS, criarPartida, type Cadeira, type Partida } from '@/dominios/centerpiece/logica/partida'
import { trocarRodada } from './mesas'
import { jogadoresPorMesa, partidaDaMesa } from './torneio'
import type { AssentosMesa, MesaTorneio, RodadaTorneio, Torneio } from './tipos'

const arredondar = (valor: number) => Math.round(valor * 10) / 10

/** null onde o WO não existe: no Chinês e no Sanma, sem valores definidos. */
export function regrasWoDe(torneio: Pick<Torneio, 'jogo' | 'variante' | 'wo'>): RegrasWo | null {
  const padrao = regrasDoModo(torneio.jogo ?? 'riichi').woPadrao
  if (!padrao || jogadoresPorMesa(torneio) !== 4) return null
  return { ...padrao, ...torneio.wo }
}

export function regrasWoValidas(regras: RegrasWo): boolean {
  const { penalidade, presente, toleranciaMinutos, porMinuto } = regras
  if (![penalidade, presente, porMinuto].every((valor) => Number.isFinite(valor) && valor >= 0)) return false
  return Number.isInteger(toleranciaMinutos) && toleranciaMinutos >= 0 && toleranciaMinutos <= 60
}

/** Com 1 ausente a mesa fecha em zero. Com mais não fecha, de propósito. */
export function pontosDoWo(regras: RegrasWo, ausentes: readonly Cadeira[], cadeira: Cadeira): number {
  return ausentes.includes(cadeira) ? -regras.penalidade : regras.presente
}

/**
 * O WO é uma partida finalizada do torneio, para o ranking somar sem caso especial.
 * Fica fora do histórico e do Ranking geral (`partidasDoHistorico`).
 */
export function criarPartidaWo(
  torneio: Torneio,
  rodada: RodadaTorneio,
  mesa: MesaTorneio,
  ausentes: readonly Cadeira[],
  contexto: { id: string; agora: string; nomes: readonly string[]; regras: RegrasWo },
): Partida {
  const { id, agora, nomes, regras } = contexto
  const resultado = CADEIRAS.map((cadeira) => ({
    cadeira,
    jogadorId: mesa.assentos[cadeira],
    // Só ordena a lista: WO não entra na média de colocação.
    colocacao: ausentes.includes(cadeira) ? 2 : 1,
    pontosBrutos: 0,
    uma: 0,
    oka: 0,
    multa: 0,
    final: pontosDoWo(regras, ausentes, cadeira),
  })).sort((uma, outra) => uma.colocacao - outra.colocacao)
  return {
    ...criarPartida(id, torneio.config, mesa.assentos, agora, nomes),
    status: 'finalizada',
    finalizadaEm: agora,
    registradaManual: true,
    ordemDosVentos: false,
    wo: { ausentes: [...ausentes] },
    vinculoTorneio: { torneioId: torneio.id, rodada: rodada.numero - 1, mesa: mesa.numero - 1, guardada: true },
    resultado,
  }
}

export interface Remontagem {
  /** Com os assentos trocados. */
  torneio: Torneio
  /** A mesa que fica com os ausentes. */
  outra: MesaTorneio
  ausentes: Cadeira[]
  substituirId: string
}

/**
 * Remontar antes do WO: os presentes de outra mesa com WO completam esta, e os
 * ausentes daqui vão para lá. Ninguém sai da rodada, só troca de lugar.
 */
export function remontagemPossivel(
  torneio: Torneio,
  partidas: readonly Partida[],
  rodada: RodadaTorneio,
  mesa: MesaTorneio,
  ausentesAqui: readonly Cadeira[],
): Remontagem | null {
  if (ausentesAqui.length === 0) return null
  for (const outra of rodada.mesas) {
    if (outra.numero === mesa.numero) continue
    const partida = partidaDaMesa(partidas, torneio.id, rodada.numero, outra.numero)
    const ausentesLa = partida?.wo?.ausentes
    if (!partida || !ausentesLa) continue
    const presentesLa = CADEIRAS.filter((cadeira) => !ausentesLa.includes(cadeira))
    if (presentesLa.length < ausentesAqui.length) continue

    const aqui = [...mesa.assentos] as AssentosMesa
    const la = [...outra.assentos] as AssentosMesa
    const vagas = presentesLa.slice(0, ausentesAqui.length)
    ausentesAqui.forEach((cadeira, indice) => {
      aqui[cadeira] = outra.assentos[vagas[indice]]
      la[vagas[indice]] = mesa.assentos[cadeira]
    })
    const novas = new Map([
      [mesa.numero, aqui],
      [outra.numero, la],
    ])
    return {
      torneio: trocarRodada(torneio, rodada.numero, (atual) => ({
        ...atual,
        mesas: atual.mesas.map((item) => ({ ...item, assentos: novas.get(item.numero) ?? item.assentos })),
      })),
      outra: { ...outra, assentos: la },
      ausentes: [...ausentesLa, ...vagas].sort((uma, b) => uma - b),
      substituirId: partida.id,
    }
  }
  return null
}

/** Desconta os minutos de atraso do resultado, sem mexer na colocação. */
export function aplicarAtrasos(
  partida: Partida,
  minutosPorJogador: Readonly<Record<string, number>>,
  regras: RegrasWo,
): Partida {
  if (!partida.resultado) return partida
  return {
    ...partida,
    resultado: partida.resultado.map((linha) => {
      const minutos = Math.min(regras.toleranciaMinutos, Math.max(0, minutosPorJogador[linha.jogadorId] ?? 0))
      if (minutos === 0) return linha
      return { ...linha, atraso: minutos, final: arredondar(linha.final - minutos * regras.porMinuto) }
    }),
  }
}

/** Quantas vezes cada um levou WO no torneio. */
export function ausenciasPorWo(torneio: Torneio, partidas: readonly Partida[]): Map<string, number> {
  const ausencias = new Map<string, number>()
  for (const { wo, vinculoTorneio, assentos } of partidas) {
    if (!wo || vinculoTorneio?.torneioId !== torneio.id) continue
    for (const cadeira of wo.ausentes) {
      const id = assentos[cadeira].jogadorId
      ausencias.set(id, (ausencias.get(id) ?? 0) + 1)
    }
  }
  return ausencias
}
