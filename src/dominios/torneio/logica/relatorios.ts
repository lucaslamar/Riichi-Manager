/**
 * Relatórios do torneio para mandar no grupo (texto do WhatsApp ou imagem): a
 * rodada com as mesas e os resultados, e a classificação. Sem tela.
 */
import type { BlocoRelatorio, LinhaRelatorio, Relatorio } from '@/compartilhado/relatorio/relatorio'
import { KANJI_VENTO, ORDEM_VENTOS, type Partida, type Vento } from '@/dominios/centerpiece/logica/partida'
import { ehMesaFinal } from './formatos/eliminatorio'
import type { LinhaRankingTorneio } from './ranking'
import type { RodadaTorneio, Torneio } from './tipos'
import { partidaDaMesa, statusDaMesa, type StatusMesa } from './torneio'

const MEDALHAS = ['🥇', '🥈', '🥉']

/**
 * Rodada: um bloco por mesa. Com resultado, os jogadores vêm na ordem de colocação
 * com a colocação e os pontos finais. Sem resultado, na ordem das cadeiras.
 */
export function relatorioDaRodada(
  torneio: Torneio,
  rodada: RodadaTorneio,
  partidas: readonly Partida[],
  rotulos: {
    titulo: string
    subtitulo?: string
    mesa: (numero: number) => string
    mesaFinal: string
    status: (status: StatusMesa) => string
    vento: (vento: Vento) => string
    nome: (jogadorId: string) => string
    /** false: só os nomes, os ventos saem na mesa. */
    ventos: boolean
    resultado: (colocacao: number, final: number) => string
  },
): Relatorio {
  const final = ehMesaFinal(torneio, rodada)
  const blocos = rodada.mesas.map((mesa): BlocoRelatorio => {
    const partida = partidaDaMesa(partidas, torneio.id, rodada.numero, mesa.numero)
    const linhas = mesa.assentos.map((jogadorId, cadeira) => {
      const vento = ORDEM_VENTOS[cadeira]
      const nome = rotulos.nome(jogadorId)
      const resultado = partida?.resultado?.find((linha) => linha.cadeira === cadeira)
      const linha: LinhaRelatorio = {
        esquerda: rotulos.ventos ? `${KANJI_VENTO[vento]} ${rotulos.vento(vento)}: ${nome}` : nome,
        ...(resultado
          ? {
              direita: rotulos.resultado(resultado.colocacao, resultado.final),
              ...(resultado.final !== 0 ? { tom: resultado.final > 0 ? ('positivo' as const) : ('negativo' as const) } : {}),
            }
          : {}),
      }
      return { linha, colocacao: resultado?.colocacao ?? cadeira + 1 }
    })
    return {
      titulo: final ? rotulos.mesaFinal : rotulos.mesa(mesa.numero),
      detalhe: rotulos.status(statusDaMesa(partida)),
      linhas: [...linhas].sort((a, b) => a.colocacao - b.colocacao).map(({ linha }) => linha),
    }
  })
  return { titulo: rotulos.titulo, ...(rotulos.subtitulo ? { subtitulo: rotulos.subtitulo } : {}), blocos }
}

/** Classificação: um bloco só, com medalha no pódio e pontos, média e partidas à direita. */
export function relatorioDoRanking(
  linhas: readonly LinhaRankingTorneio[],
  rotulos: {
    titulo: string
    subtitulo?: string
    nome: (jogadorId: string) => string
    /** O que vai à direita (pontos, média, partidas e, no Eliminatório, a fase). */
    valores: (linha: LinhaRankingTorneio) => string
  },
): Relatorio {
  return {
    titulo: rotulos.titulo,
    ...(rotulos.subtitulo ? { subtitulo: rotulos.subtitulo } : {}),
    blocos: [
      {
        linhas: linhas.map((linha) => ({
          esquerda: `${MEDALHAS[linha.posicao - 1] ?? `${linha.posicao}.`} ${rotulos.nome(linha.jogadorId)}`,
          direita: rotulos.valores(linha),
          destaque: linha.posicao <= 3,
          ...(linha.pontos !== 0 ? { tom: linha.pontos > 0 ? ('positivo' as const) : ('negativo' as const) } : {}),
        })),
      },
    ],
  }
}
