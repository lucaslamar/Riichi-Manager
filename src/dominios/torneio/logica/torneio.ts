/**
 * Regras gerais do torneio, valem para todos os formatos. Os pontos vêm das
 * partidas com `vinculoTorneio` (rodada e mesa com base zero).
 */
import { alterarConfig, configDoPreset, type ConfigMesa } from '@/dominios/centerpiece/logica/configMesa'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { normalizarTexto } from '@/dominios/jogadores/logica/jogadores'
import type { ConfigFormato, FormatoTorneio, Relogio, RodadaTorneio, Torneio } from './tipos'

export const SEGUNDOS_RODADA_PADRAO = 90 * 60
export const RODADAS_PADRAO = 4

/** Padrão do torneio: 30.000 de partida e de retorno, sem oka. */
export function configPadraoTorneio(): ConfigMesa {
  return alterarConfig(configDoPreset('padrao'), { pontosPartida: 30000, pontosRetorno: 30000 })
}

export function formatoPadrao(tipo: FormatoTorneio): ConfigFormato {
  switch (tipo) {
    case 'rodizio':
      return { tipo, rodadas: RODADAS_PADRAO }
    case 'suico':
      return { tipo, rodadas: RODADAS_PADRAO }
    case 'eliminatorio':
      return {
        tipo,
        classificatoria: 'suico',
        rodadasClassificatoria: 3,
        cortes: [4],
        rodadasPorFase: 1,
        pontosCarregados: true,
      }
    case 'corridos':
      return { tipo }
    case 'temporada':
      return { tipo, temporadaId: '' }
  }
}

export function dataDoDia(agora: Date): string {
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`
}

export function criarRascunho(contexto: { id: string; agora: Date; nome: string }): Torneio {
  const iso = contexto.agora.toISOString()
  return {
    id: contexto.id,
    nome: contexto.nome,
    data: dataDoDia(contexto.agora),
    formato: formatoPadrao('rodizio'),
    config: configPadraoTorneio(),
    timers: { rodadaSegundos: SEGUNDOS_RODADA_PADRAO, porMesa: false },
    jogadorIds: [],
    rodadas: [],
    status: 'rascunho',
    criadoEm: iso,
    atualizadoEm: iso,
  }
}

export function relogioParado(totalSegundos: number): Relogio {
  return { totalSegundos, acrescimoSegundos: 0, corridoSegundos: 0, iniciadoEm: null }
}

export function partidasDoTorneio(partidas: readonly Partida[], torneioId: string) {
  return partidas.filter((partida) => partida.vinculoTorneio?.torneioId === torneioId)
}

/** `numeroRodada` e `numeroMesa` começam em 1, como na tela. */
export function partidaDaMesa(
  partidas: readonly Partida[],
  torneioId: string,
  numeroRodada: number,
  numeroMesa: number,
): Partida | undefined {
  return partidas.find(
    ({ vinculoTorneio: vinculo }) =>
      vinculo?.torneioId === torneioId &&
      vinculo.rodada === numeroRodada - 1 &&
      vinculo.mesa === numeroMesa - 1,
  )
}

export type StatusMesa = 'nao_iniciada' | 'em_andamento' | 'finalizada'

export function statusDaMesa(partida: Partida | undefined): StatusMesa {
  if (!partida) return 'nao_iniciada'
  return partida.status === 'em_andamento' ? 'em_andamento' : 'finalizada'
}

export function progressoDaRodada(partidas: readonly Partida[], torneio: Torneio, rodada: RodadaTorneio) {
  const finalizadas = rodada.mesas.filter(
    (mesa) => statusDaMesa(partidaDaMesa(partidas, torneio.id, rodada.numero, mesa.numero)) === 'finalizada',
  ).length
  return { finalizadas, total: rodada.mesas.length }
}

/**
 * A rodada em jogo: a primeira com mesa sem resultado. O Rodízio gera a grade
 * inteira de uma vez, então "a última gerada" não serve. Sem partidas, a primeira.
 */
export function rodadaAtual(torneio: Torneio, partidas: readonly Partida[] = []): RodadaTorneio | undefined {
  return (
    torneio.rodadas.find((rodada) => {
      const { finalizadas, total } = progressoDaRodada(partidas, torneio, rodada)
      return finalizadas < total
    }) ?? torneio.rodadas[torneio.rodadas.length - 1]
  )
}

/** Rodadas previstas; `null` quando o organizador decide quando parar. */
export function totalDeRodadas(formato: ConfigFormato): number | null {
  switch (formato.tipo) {
    case 'rodizio':
    case 'suico':
      return formato.rodadas
    case 'eliminatorio':
      return formato.rodadasClassificatoria + formato.cortes.length * formato.rodadasPorFase
    default:
      return null
  }
}

export function mesasDoTorneio(torneio: Torneio) {
  return rodadaAtual(torneio)?.mesas.length ?? Math.floor(torneio.jogadorIds.length / 4)
}

/** O torneio que o card do menu abre: o rascunho ou o que está em jogo. */
export function torneioAtivo(torneios: readonly Torneio[]): Torneio | undefined {
  return [...torneios]
    .filter((torneio) => torneio.status !== 'finalizado')
    .sort((um, outro) => outro.atualizadoEm.localeCompare(um.atualizadoEm))[0]
}

export interface FiltroHistorico {
  busca: string
  formato: FormatoTorneio | 'todos'
  /** `AAAA-MM-DD`, inclusivos; vazio = sem limite. */
  de: string
  ate: string
}

export function historicoDeTorneios(
  torneios: readonly Torneio[],
  filtro: FiltroHistorico,
  nomeDe: (jogadorId: string) => string,
): Torneio[] {
  const busca = normalizarTexto(filtro.busca)
  return torneios
    .filter((torneio) => torneio.status === 'finalizado')
    .filter((torneio) => filtro.formato === 'todos' || torneio.formato.tipo === filtro.formato)
    .filter((torneio) => !filtro.de || torneio.data >= filtro.de)
    .filter((torneio) => !filtro.ate || torneio.data <= filtro.ate)
    .filter(
      (torneio) =>
        !busca ||
        normalizarTexto(torneio.nome).includes(busca) ||
        torneio.jogadorIds.some((id) => normalizarTexto(nomeDe(id)).includes(busca)),
    )
    .sort((um, outro) => outro.data.localeCompare(um.data) || outro.criadoEm.localeCompare(um.criadoEm))
}

export function finalizarTorneio(torneio: Torneio, agora: string): Torneio {
  return { ...torneio, status: 'finalizado', finalizadoEm: agora, atualizadoEm: agora }
}

/** Lista sorteada: o rascunho vira torneio em andamento com a primeira rodada. */
export function iniciarTorneio(
  torneio: Torneio,
  jogadorIds: string[],
  rodadas: RodadaTorneio[],
  agora: string,
): Torneio {
  return { ...torneio, jogadorIds, rodadas, status: 'em_andamento', atualizadoEm: agora }
}

/** Aborta o sorteio: o torneio volta a ser rascunho, sem rodadas, para editar a lista e sortear de novo. */
export function abortarTorneio(torneio: Torneio, agora: string): Torneio {
  return { ...torneio, rodadas: [], status: 'rascunho', atualizadoEm: agora }
}
