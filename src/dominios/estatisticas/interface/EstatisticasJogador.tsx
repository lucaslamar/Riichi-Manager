import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useTextosDistancia } from '@/dominios/torneio/interface/hooks/useTextosDistancia'
import {
  compararCom,
  distanciaParaPodio,
  vizinhosDoJogador,
} from '@/dominios/torneio/logica/distanciaPodio'
import type { FiltrosRankingTorneio } from '@/dominios/torneio/logica/filtrosRankingTorneio'
import type { EscopoEstatisticas } from '../logica/escopo'
import { formaDoJogador } from '../logica/forma'
import ListaViradas from './ListaViradas'
import NumerosJogador from './NumerosJogador'
import ProjecaoProximo from './ProjecaoProximo'
import { useVisaoDoEscopo } from './useVisaoDoEscopo'
import './estatisticas.css'

/**
 * As estatísticas de um jogador, as mesmas no torneio, na temporada e no geral.
 * Compacto (o card do ranking): as viradas primeiro e os números recolhidos.
 */
export default function EstatisticasJogador({
  escopo,
  jogadorId,
  compacto = false,
  comparadoId,
  unidade = 'pontos',
  semPosicoes = false,
  semMaiorDeTodos = false,
}: {
  escopo: EscopoEstatisticas
  jogadorId: string
  compacto?: boolean
  comparadoId?: string
  unidade?: FiltrosRankingTorneio['unidade']
  /** A tela do jogador já tem o gráfico de posições. */
  semPosicoes?: boolean
  /** A tela do torneio já mostra a maior mão no topo. */
  semMaiorDeTodos?: boolean
}) {
  const { t, idioma } = useI18n()
  const { visao, nome, regras } = useVisaoDoEscopo(escopo)
  const textos = useTextosDistancia(regras, unidade, nome)
  const { linhas, partidas, viradas } = visao

  const { faltam, vantagem } = distanciaParaPodio(linhas, jogadorId)
  const comparado = comparadoId ? compararCom(linhas, jogadorId, comparadoId) : null
  // A comparação escolhida vem primeiro, colada no seletor.
  const secoes = [
    { id: 'comparado', alvos: comparado ? [comparado] : [] },
    { id: 'podio', alvos: [...faltam, ...vantagem] },
    { id: 'vizinhos', alvos: vizinhosDoJogador(linhas, jogadorId) },
  ].filter((secao) => secao.alvos.length > 0)

  const formaDe = (id: string) => (visao.forma ? formaDoJogador(visao.forma, id) : null)
  const numeros = (
    <NumerosJogador
      partidas={partidas}
      jogadorId={jogadorId}
      escopo={escopo.tipo}
      modo={regras.modo}
      nome={nome}
      semPosicoes={semPosicoes}
      semMaiorDeTodos={semMaiorDeTodos}
      forma={formaDe(jogadorId)}
    />
  )

  const prazo = () => {
    if (viradas.tipo !== 'cenarios' || !viradas.ate) return null
    const data = new Intl.DateTimeFormat(idioma, { dateStyle: 'short' }).format(
      new Date(`${viradas.ate}T12:00:00`),
    )
    const jogos = viradas.restantesDe(jogadorId)
    if (jogos === 0) return t('stats.deadline.over', { date: data })
    return jogos === null
      ? t('stats.deadline.unknown', { date: data })
      : t('stats.deadline.estimate', { date: data, games: jogos })
  }
  const textoPrazo = prazo()

  const aproximado =
    viradas.tipo === 'projecao'
      ? t('stats.projection.approx')
      : viradas.bonus || regras.modo === 'mcr'
        ? t(`tournament.podiumGap.approx.${regras.modo}`)
        : t('stats.onlySum')

  return (
    <div className="est-jogador">
      {!compacto && numeros}
      {!compacto && (
        <h4 className="est-titulo">
          {t(viradas.tipo === 'projecao' ? 'stats.projection.title' : 'stats.turn.title')}
        </h4>
      )}
      {textoPrazo && <p className="est-apoio">{textoPrazo}</p>}
      {viradas.tipo === 'projecao' ? (
        <ProjecaoProximo linhas={linhas} jogadorId={jogadorId} nome={nome} />
      ) : (
        <div aria-live="polite">
          <ListaViradas
            secoes={secoes}
            jogadorId={jogadorId}
            regras={regras}
            bonus={viradas.bonus}
            unidade={unidade}
            textos={textos}
            nome={nome}
            restantesDe={viradas.restantesDe}
            formaDe={formaDe}
          />
        </div>
      )}
      {compacto && (
        <details className="est-recolhido">
          <summary>{t(`stats.numbers.${escopo.tipo}`)}</summary>
          {numeros}
        </details>
      )}
      <p className="cfg-ajuda trn-distancia-aviso">{aproximado}</p>
    </div>
  )
}
