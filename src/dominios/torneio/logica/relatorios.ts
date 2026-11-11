/**
 * Relatórios do torneio para mandar no grupo (texto do WhatsApp ou imagem): a
 * rodada com as mesas e os resultados, e a classificação. Sem tela.
 */
import type { BlocoRelatorio, LinhaRelatorio, Relatorio, TomLinha } from '@/compartilhado/relatorio/relatorio'
import { KANJI_VENTO, ORDEM_VENTOS, type Partida, type Vento } from '@/dominios/centerpiece/logica/partida'
import { ehMesaFinal } from './formatos/eliminatorio'
import type { LinhaRankingTorneio } from './ranking'
import type { RodadaTorneio, Torneio } from './tipos'
import { statusNaTela } from './mesas'
import { partidaDaMesa, type StatusMesa } from './torneio'

const MEDALHAS = ['🥇', '🥈', '🥉']
const ICONE_STATUS: Record<StatusMesa, string> = {
  nao_iniciada: '⏳',
  em_andamento: '⏱️',
  finalizada: '✅',
}

function tomDe(valor: number): { tom?: TomLinha } {
  return valor === 0 ? {} : { tom: valor > 0 ? 'positivo' : 'negativo' }
}

/**
 * Rodada: um bloco por mesa. Mesa com resultado vira tabela, na ordem de colocação
 * e com os pontos finais. Sem resultado, os quatro na ordem das cadeiras.
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
    colocacao: (colocacao: number) => string
    pontos: (valor: number) => string
  },
): Relatorio {
  const final = ehMesaFinal(torneio, rodada)
  const blocos = rodada.mesas.map((mesa): BlocoRelatorio => {
    const partida = partidaDaMesa(partidas, torneio.id, rodada.numero, mesa.numero)
    const status = statusNaTela(torneio, rodada, mesa, partida)
    const cabecalho = {
      titulo: final ? rotulos.mesaFinal : rotulos.mesa(mesa.numero),
      detalhe: `${ICONE_STATUS[status]} ${rotulos.status(status)}`,
    }
    if (partida?.resultado?.length) {
      const linhas: LinhaRelatorio[] = [...partida.resultado]
        .sort((a, b) => a.colocacao - b.colocacao)
        .map((resultado) => ({
          esquerda: `${rotulos.colocacao(resultado.colocacao)} ${rotulos.nome(mesa.assentos[resultado.cadeira])}`,
          direita: rotulos.pontos(resultado.final),
          ...tomDe(resultado.final),
        }))
      return { ...cabecalho, tabela: true, linhas }
    }
    return {
      ...cabecalho,
      linhas: mesa.assentos.flatMap((jogadorId, cadeira) => {
        if (jogadorId === '') return []
        const vento = ORDEM_VENTOS[cadeira]
        const nome = rotulos.nome(jogadorId)
        return { esquerda: rotulos.ventos ? `${KANJI_VENTO[vento]} ${rotulos.vento(vento)}: ${nome}` : nome }
      }),
    }
  })
  return { titulo: rotulos.titulo, ...(rotulos.subtitulo ? { subtitulo: rotulos.subtitulo } : {}), blocos }
}

/**
 * Classificação. No texto: o pódio com medalhas (quando já houve partida) e a
 * tabela inteira alinhada. Na imagem: a lista com medalha no pódio e as cores.
 */
export function relatorioDoRanking(
  linhas: readonly LinhaRankingTorneio[],
  rotulos: {
    titulo: string
    subtitulo?: string
    nome: (jogadorId: string) => string
    /** Cabeçalho da tabela: "#  Jogador" e as colunas da direita. */
    colunas: readonly string[]
    /** As colunas da direita de cada um (pontos, média, partidas e, no Eliminatório, a fase). */
    valores: (linha: LinhaRankingTorneio) => readonly string[]
    /** Só os pontos, para o pódio. */
    pontos: (valor: number) => string
  },
): Relatorio {
  const jaJogaram = linhas.some((linha) => linha.partidas > 0)
  const podio: BlocoRelatorio = {
    so: 'texto',
    linhas: linhas
      .filter((linha) => linha.posicao <= 3)
      .map((linha) => ({
        esquerda: `${MEDALHAS[linha.posicao - 1]} ${rotulos.nome(linha.jogadorId)}`,
        direita: rotulos.pontos(linha.pontos),
        destaque: true,
      })),
  }
  const tabela: BlocoRelatorio = {
    so: 'texto',
    tabela: true,
    colunas: rotulos.colunas,
    linhas: linhas.map((linha) => ({
      esquerda: `${String(linha.posicao).padStart(2)} ${rotulos.nome(linha.jogadorId)}`,
      direita: rotulos.valores(linha),
    })),
  }
  const lista: BlocoRelatorio = {
    so: 'imagem',
    linhas: linhas.map((linha) => ({
      esquerda: `${MEDALHAS[linha.posicao - 1] ?? `${linha.posicao}.`} ${rotulos.nome(linha.jogadorId)}`,
      direita: rotulos.valores(linha),
      destaque: linha.posicao <= 3,
      ...tomDe(linha.pontos),
    })),
  }
  return {
    titulo: rotulos.titulo,
    ...(rotulos.subtitulo ? { subtitulo: rotulos.subtitulo } : {}),
    blocos: [...(jaJogaram ? [podio] : []), tabela, lista],
  }
}
