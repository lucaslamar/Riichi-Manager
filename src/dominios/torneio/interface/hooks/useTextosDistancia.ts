import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { RegrasDoModo, UnidadeDistancia } from '@/compartilhado/modo-jogo/regrasDoModo'
import { maosParaCobrir, type DistanciaAlvo } from '../../logica/distanciaPodio'
import type { FiltrosRankingTorneio } from '../../logica/filtrosRankingTorneio'

const CHAVE_DA_RELACAO: Record<DistanciaAlvo['relacao'], string> = {
  falta: 'toPlace',
  vantagem: 'lead',
  subir: 'upOne',
  sairDoUltimo: 'leaveLast',
  sobreOUltimo: 'overLast',
}

/** Os textos da distância na unidade escolhida. Os mesmos na tela, na folha e no compartilhamento. */
export function useTextosDistancia(
  regras: RegrasDoModo,
  unidade: FiltrosRankingTorneio['unidade'],
  nome: (jogadorId: string) => string,
) {
  const { t, idioma, numero } = useI18n()
  const formato = new Intl.NumberFormat(idioma, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const escolhida = regras.unidadesDistancia.find((item) => item.id === unidade)
  const referencia = escolhida ?? regras.unidadesDistancia[0]

  const lugar = (posicao: number) => t('tournament.podiumGap.ordinal', { place: posicao })
  const emMaos = (alvo: DistanciaAlvo, item: UnidadeDistancia) =>
    t(`tournament.podiumGap.hands.${item.id}`, { count: maosParaCobrir(alvo.diferenca, item, regras) })
  const valor = (alvo: DistanciaAlvo) =>
    alvo.diferenca === 0 ? t('tournament.podiumGap.tied') : formato.format(alvo.diferenca)
  const desempate = (alvo: DistanciaAlvo) =>
    alvo.desempate ? t('tournament.podiumGap.tiebreak', { points: numero(alvo.desempate) }) : ''

  return {
    lugar,
    valor,
    rotulo: (alvo: DistanciaAlvo) =>
      t(`tournament.podiumGap.${CHAVE_DA_RELACAO[alvo.relacao]}`, {
        place: lugar(alvo.posicao),
        name: nome(alvo.jogadorId),
      }),
    /** A linha de baixo: as mãos, ou o desempate de quem está empatado. */
    detalhe: (alvo: DistanciaAlvo) =>
      alvo.diferenca === 0
        ? desempate(alvo)
        : (escolhida ? [escolhida] : regras.unidadesDistancia.filter((item) => item.resumida))
            .map((item) => emMaos(alvo, item))
            .join(' · '),
    /** O que a linha de baixo não mostra (Baiman), para o leitor de tela. */
    detalheOculto: (alvo: DistanciaAlvo) =>
      alvo.diferenca === 0 || escolhida
        ? ''
        : regras.unidadesDistancia
            .filter((item) => !item.resumida)
            .map((item) => emMaos(alvo, item))
            .join(' · '),
    /** "15,4 · 2 Mangans". */
    resumo: (alvo: DistanciaAlvo) =>
      [valor(alvo), alvo.diferenca === 0 ? desempate(alvo) : emMaos(alvo, referencia)].filter(Boolean).join(' · '),
    /** Na célula da tabela cabe só o número, na unidade escolhida. */
    celula: (alvo: DistanciaAlvo) =>
      alvo.diferenca === 0
        ? '='
        : escolhida
          ? numero(maosParaCobrir(alvo.diferenca, escolhida, regras))
          : formato.format(alvo.diferenca),
  }
}

export type TextosDistancia = ReturnType<typeof useTextosDistancia>
