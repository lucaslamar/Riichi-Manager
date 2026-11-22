/**
 * Relatórios do torneio para mandar no grupo (texto do WhatsApp ou imagem): a
 * rodada com as mesas e os resultados, e a classificação. Sem tela.
 */
import { LARGURA_ESQUERDA, type BlocoRelatorio, type LinhaRelatorio, type Relatorio, type TomLinha } from '@/compartilhado/relatorio/relatorio'
import { KANJI_VENTO, ORDEM_VENTOS, type Partida, type Vento } from '@/dominios/centerpiece/logica/partida'
import {
  candidatosAoPrimeiro,
  compararCom,
  disputantes,
  distanciaParaPodio,
  distanciasDoPodio,
  vizinhosDoJogador,
  type DistanciaAlvo,
} from './distanciaPodio'
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
 * com os pontos que ficaram na mesa e os finais. Sem resultado, os quatro na ordem das cadeiras.
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
    /** Os pontos que ficaram na mesa, sem uma e oka. */
    pontosDaMesa: (valor: number) => string
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
          direita: [rotulos.pontosDaMesa(resultado.pontosBrutos), rotulos.pontos(resultado.final)],
          ...tomDe(resultado.final),
        }))
      return { ...cabecalho, tabela: true, corSoNaUltima: true, linhas }
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
    /** Seta da mudança de posição ("▲2", "▼1" ou vazio), quando há comparação. */
    seta?: (jogadorId: string) => string
  },
): Relatorio {
  const setas = new Map(linhas.map((linha) => [linha.jogadorId, rotulos.seta?.(linha.jogadorId) ?? '']))
  const larguraSeta = Math.max(0, ...[...setas.values()].map((seta) => seta.length))
  const setaDe = (linha: LinhaRankingTorneio) => setas.get(linha.jogadorId) ?? ''
  const jaJogaram = linhas.some((linha) => linha.partidas > 0)
  const podio: BlocoRelatorio = {
    so: 'texto',
    // Quem ainda não jogou não sobe ao pódio nem ganha medalha (todos com 0 empatavam em 1º).
    linhas: linhas
      .filter((linha) => linha.partidas > 0 && linha.posicao <= 3)
      .map((linha) => ({
        esquerda: `${MEDALHAS[linha.posicao - 1]} ${rotulos.nome(linha.jogadorId)}`,
        direita: rotulos.pontos(linha.pontos),
        destaque: true,
      })),
  }
  const tabela: BlocoRelatorio = {
    so: 'texto',
    tabela: true,
    ...(larguraSeta ? { larguraEsquerda: LARGURA_ESQUERDA + larguraSeta } : {}),
    colunas: rotulos.colunas,
    linhas: linhas.map((linha) => ({
      esquerda: `${(linha.partidas > 0 ? String(linha.posicao) : '–').padStart(2)}${setaDe(linha).padEnd(larguraSeta)} ${rotulos.nome(linha.jogadorId)}`,
      direita: rotulos.valores(linha),
    })),
  }
  const lista: BlocoRelatorio = {
    so: 'imagem',
    linhas: linhas.map((linha) => ({
      esquerda: `${linha.partidas === 0 ? '–' : (MEDALHAS[linha.posicao - 1] ?? `${linha.posicao}.`)}${setaDe(linha) ? ` ${setaDe(linha)}` : ''} ${rotulos.nome(linha.jogadorId)}`,
      direita: rotulos.valores(linha),
      destaque: linha.partidas > 0 && linha.posicao <= 3,
      ...tomDe(linha.pontos),
    })),
  }
  return {
    titulo: rotulos.titulo,
    ...(rotulos.subtitulo ? { subtitulo: rotulos.subtitulo } : {}),
    blocos: [...(jaJogaram ? [podio] : []), tabela, lista],
  }
}

interface RotulosDistancia {
  titulo: string
  subtitulo: string
  chamada: string
  nome: (jogadorId: string) => string
  pontos: (valor: number) => string
  lugar: (posicao: number) => string
  /** "Para o 1º (Fulano)". */
  rotulo: (alvo: DistanciaAlvo) => string
  valor: (alvo: DistanciaAlvo) => string
  detalhe: (alvo: DistanciaAlvo) => string
  /** "15,4 · 2 Mangans". */
  resumo: (alvo: DistanciaAlvo) => string
}

/** Cada distância em duas linhas: a diferença e, embaixo, as mãos. */
function linhasDeDistancia(alvos: readonly DistanciaAlvo[], rotulos: RotulosDistancia): LinhaRelatorio[] {
  return alvos.flatMap((alvo) => {
    const detalhe = rotulos.detalhe(alvo)
    const vantagem = alvo.relacao === 'vantagem' || alvo.relacao === 'sobreOUltimo'
    const linha: LinhaRelatorio = {
      esquerda: rotulos.rotulo(alvo),
      direita: rotulos.valor(alvo),
      destaque: true,
      ...(vantagem ? { tom: 'positivo' as const } : {}),
    }
    return detalhe ? [linha, { esquerda: detalhe }] : [linha]
  })
}

/** Disputa do pódio: a faixa, os candidatos, quem está sendo acompanhado e os 2 últimos. */
export function relatorioDaDisputa(
  torneio: Torneio,
  partidas: readonly Partida[],
  linhas: readonly LinhaRankingTorneio[],
  acompanhadoId: string | null,
  rotulos: RotulosDistancia & {
    podio: string
    candidatos: string
    fundo: string
    versus: (acima: string, abaixo: string) => string
    soComAjuda: string
    vantagemNoFundo: (valor: string) => string
    paraSair: (valor: string) => string
  },
): Relatorio {
  const { lugar, nome } = rotulos
  const blocos: BlocoRelatorio[] = [
    {
      titulo: rotulos.podio,
      linhas: distanciasDoPodio(linhas).faixa.map(({ acima, abaixo, distancia }) => ({
        esquerda: rotulos.versus(lugar(acima), lugar(abaixo)),
        direita: rotulos.resumo(distancia),
      })),
    },
    {
      titulo: rotulos.candidatos,
      linhas: candidatosAoPrimeiro(torneio, partidas, linhas).map(({ linha, paraOLider, alcanca }) => ({
        esquerda: `${MEDALHAS[linha.posicao - 1] ?? lugar(linha.posicao)} ${nome(linha.jogadorId)}${alcanca === false ? ` (${rotulos.soComAjuda})` : ''}`,
        direita: !paraOLider
          ? rotulos.pontos(linha.pontos)
          : `${paraOLider.diferenca ? '−' : ''}${rotulos.resumo(paraOLider)}`,
        destaque: linha.posicao <= 3,
      })),
    },
  ]

  if (acompanhadoId) {
    const { faltam, vantagem } = distanciaParaPodio(linhas, acompanhadoId)
    const alvos = [...faltam, ...vantagem, ...vizinhosDoJogador(linhas, acompanhadoId)]
    if (alvos.length) blocos.push({ titulo: nome(acompanhadoId), linhas: linhasDeDistancia(alvos, rotulos) })
  }

  const disputa = disputantes(linhas)
  // Com 4 ou menos, o fundo já está inteiro no pódio.
  if (disputa.length > 4) {
    const [penultimo, ultimo] = disputa.slice(-2)
    const distancia = compararCom(linhas, ultimo.jogadorId, penultimo.jogadorId)
    if (distancia) {
      blocos.push({
        titulo: rotulos.fundo,
        linhas: [
          {
            esquerda: `${lugar(penultimo.posicao)} ${nome(penultimo.jogadorId)}`,
            direita: rotulos.vantagemNoFundo(rotulos.valor(distancia)),
          },
          {
            esquerda: `${lugar(ultimo.posicao)} ${nome(ultimo.jogadorId)}`,
            direita: rotulos.paraSair(rotulos.resumo(distancia)),
          },
        ],
      })
    }
  }
  return { titulo: rotulos.titulo, subtitulo: rotulos.subtitulo, chamada: rotulos.chamada, blocos }
}

/** A folha de um jogador: pódio, vizinhos e a comparação escolhida. */
export function relatorioDoJogador(
  linhas: readonly LinhaRankingTorneio[],
  jogadorId: string,
  comparadoId: string | undefined,
  rotulos: RotulosDistancia,
): Relatorio {
  const { faltam, vantagem } = distanciaParaPodio(linhas, jogadorId)
  const comparado = comparadoId ? compararCom(linhas, jogadorId, comparadoId) : null
  const blocos = [[...faltam, ...vantagem], vizinhosDoJogador(linhas, jogadorId), comparado ? [comparado] : []]
    .filter((alvos) => alvos.length > 0)
    .map((alvos): BlocoRelatorio => ({ linhas: linhasDeDistancia(alvos, rotulos) }))
  return { titulo: rotulos.titulo, subtitulo: rotulos.subtitulo, chamada: rotulos.chamada, blocos }
}
