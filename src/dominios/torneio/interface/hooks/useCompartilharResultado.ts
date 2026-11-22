import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Relatorio } from '@/compartilhado/relatorio/relatorio'
import {
  mudancasDoRanking,
  rankingDoTorneio,
  recorteAteRodada,
  textoDaSeta,
} from '../../logica/ranking'
import { premiacaoDe } from '../../logica/premiacao'
import { blocoDaPremiacao, relatorioDoRanking } from '../../logica/relatorios'
import { ausenciasPorWo } from '../../logica/wo'
import type { Torneio } from '../../logica/tipos'
import { useDinheiro } from './useDinheiro'
import { useNomeNoTorneio } from './useNomeNoTorneio'
import { usePartidasDoTorneio } from './usePartidasDoTorneio'

/** A classificação para compartilhar, a mesma no Ranking e no menu do torneio. */
export function useCompartilharResultado(torneio: Torneio) {
  const { t, idioma, numero } = useI18n()
  const { partidas } = usePartidasDoTorneio()
  const nomeDoTorneio = useNomeNoTorneio()
  const emMoeda = useDinheiro()

  const nome = (id: string) => nomeDoTorneio(torneio, id)
  const decimais = (casas: number) =>
    new Intl.NumberFormat(idioma, { minimumFractionDigits: casas, maximumFractionDigits: casas })
  const pontos = (valor: number) => `${valor > 0 ? '+' : ''}${decimais(1).format(valor)}`
  const media = (valor: number) => (valor ? decimais(2).format(valor) : '–')
  const fase = (valor: number) =>
    valor === 0
      ? t('tournament.ranking.phaseQualifier')
      : t('tournament.ranking.phaseCut', { number: valor })

  const comPremio = (base: Relatorio): Relatorio => {
    // O encontro de temporada não tem prêmio próprio: ele é da Temporada.
    const premiacao = torneio.formato.tipo === 'temporada' ? undefined : torneio.premiacao
    const premio = premiacaoDe(premiacao, torneio.jogadorIds.length)
    if (!premio) return base
    const bloco = blocoDaPremiacao(premio, {
      titulo: t('tournament.prize.byPlace'),
      lugar: (place) => t('tournament.podiumGap.ordinal', { place }),
      dinheiro: (valor) => emMoeda(valor, premiacao?.moeda ?? 'BRL'),
    })
    return { ...base, blocos: [...base.blocos, bloco] }
  }

  const classificacao = (ateRodada: number | null = null): Relatorio => {
    const recorte = recorteAteRodada(torneio, partidas, ateRodada)
    const linhas = rankingDoTorneio(recorte.torneio, recorte.partidas)
    const mudancas = mudancasDoRanking(recorte.torneio, recorte.partidas)
    const eliminatorio = torneio.formato.tipo === 'eliminatorio'
    const subtitulo = [
      t('tournament.ranking.title'),
      t(`tournament.formatsShort.${torneio.formato.tipo}`),
      ateRodada === null ? null : t('tournament.share.untilRound', { round: ateRodada }),
    ]
      .filter(Boolean)
      .join(' · ')

    const base = relatorioDoRanking(linhas, {
      titulo: torneio.nome,
      subtitulo,
      nome,
      colunas: [
        ` # ${t('tournament.ranking.player')}`,
        t('tournament.ranking.pointsShort'),
        t('tournament.ranking.averagePlaceShort'),
        t('tournament.ranking.gamesShort'),
        ...(eliminatorio ? [t('tournament.ranking.phase')] : []),
      ],
      valores: (linha) => [
        pontos(linha.pontos),
        media(linha.mediaColocacao),
        numero(linha.partidas),
        ...(eliminatorio ? [fase(linha.fase ?? 0)] : []),
      ],
      pontos,
      seta: (id) => textoDaSeta(mudancas?.jogadores.find((item) => item.jogadorId === id)),
    })

    const ausencias = ausenciasPorWo(recorte.torneio, recorte.partidas)
    if (!ausencias.size) return comPremio(base)
    const blocoWo = {
      titulo: t('tournament.wo.tag'),
      linhas: [...ausencias].map(([id, vezes]) => ({ esquerda: nome(id), direita: numero(vezes) })),
    }
    return comPremio({ ...base, blocos: [...base.blocos, blocoWo] })
  }

  return { classificacao, comPremio }
}
