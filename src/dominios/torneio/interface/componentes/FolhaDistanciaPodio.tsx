import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import EstatisticasJogador from '@/dominios/estatisticas/interface/EstatisticasJogador'
import type { EscopoEstatisticas } from '@/dominios/estatisticas/logica/escopo'
import { compararCom, disputantes } from '../../logica/distanciaPodio'
import type { FiltrosRankingTorneio } from '../../logica/filtrosRankingTorneio'
import type { LinhaRankingTorneio, MudancasDoRanking } from '../../logica/ranking'
import type { TextosDistancia } from '../hooks/useTextosDistancia'

/** O card do jogador no ranking: cabeçalho, comparação e as estatísticas no escopo do torneio. */
export default function FolhaDistanciaPodio({
  linhas,
  mudancas,
  jogadorId,
  escopo,
  unidade,
  textos,
  nome,
  pontos,
  coberta,
  aoNavegar,
  aoCompartilhar,
  aoFechar,
}: {
  linhas: readonly LinhaRankingTorneio[]
  mudancas: MudancasDoRanking | null
  jogadorId: string
  escopo: EscopoEstatisticas
  unidade: FiltrosRankingTorneio['unidade']
  textos: TextosDistancia
  nome: (jogadorId: string) => string
  pontos: (valor: number) => string
  /** Com o Compartilhar por cima, o deslize não troca de jogador. */
  coberta: boolean
  aoNavegar: (jogadorId: string) => void
  aoCompartilhar: (comparadoId: string | undefined) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [comparadoId, setComparadoId] = useState('')

  const jogaram = linhas.filter((linha) => linha.partidas > 0)
  const indice = jogaram.findIndex((linha) => linha.jogadorId === jogadorId)
  const andar = (passo: number) =>
    aoNavegar(jogaram[(indice + passo + jogaram.length) % jogaram.length].jogadorId)
  useDeslizeHorizontal({
    ativo: !coberta && jogaram.length > 1,
    dentroDaCamada: true,
    aoDeslizarDireita: () => andar(-1),
    aoDeslizarEsquerda: () => andar(1),
  })

  const linha = jogaram[indice]
  if (!linha) return null


  const mudanca = mudancas?.jogadores.find((item) => item.jogadorId === jogadorId)
  const eraNaRodada =
    mudancas && mudanca?.variacao && mudanca.antes !== null
      ? t('tournament.positionChange.wasInRound', {
          place: textos.lugar(mudanca.antes),
          round: mudancas.desde,
        })
      : null
  const comparado = compararCom(linhas, jogadorId, comparadoId)

  const rivais = disputantes(linhas, jogadorId).filter((outra) => outra.jogadorId !== jogadorId)


  return (
    <Modal
      titulo={nome(jogadorId)}
      subtitulo={
        <>
          <span className="trn-colocacao">{textos.lugar(linha.posicao)}</span> {pontos(linha.pontos)}
          {eraNaRodada && <span className="trn-era-no-card">{eraNaRodada}</span>}
        </>
      }
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="trn-distancia"
      acoes={
        <>
          <button
            type="button"
            className="modal-acao"
            aria-label={t('tournament.podiumGap.share', { name: nome(jogadorId) })}
            title={t('tournament.share.title')}
            aria-haspopup="dialog"
            onClick={() => aoCompartilhar(comparado ? comparadoId : undefined)}
          >
            <i className="fas fa-share-nodes" aria-hidden="true" />
          </button>
          {jogaram.length > 1 && (
          <>
            <button
              type="button"
              className="modal-acao"
              aria-label={t('tournament.points.previousPlayer')}
              title={t('tournament.points.previousPlayer')}
              onClick={() => andar(-1)}
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="modal-acao"
              aria-label={t('tournament.points.nextPlayer')}
              title={t('tournament.points.nextPlayer')}
              onClick={() => andar(1)}
            >
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </>
          )}
        </>
      }
    >
      {rivais.length > 0 && (
        <div className="trn-distancia-filtro">
          <select
            aria-label={t('tournament.podiumGap.compareWith')}
            value={comparado ? comparadoId : ''}
            onChange={(evento) => setComparadoId(evento.target.value)}
          >
            <option value="">{t('tournament.podiumGap.compareWith')}</option>
            {rivais.map((outra) => (
              <option key={outra.jogadorId} value={outra.jogadorId}>
                {textos.lugar(outra.posicao)} {nome(outra.jogadorId)}
              </option>
            ))}
          </select>
        </div>
      )}
      <EstatisticasJogador
        escopo={escopo}
        jogadorId={jogadorId}
        compacto
        comparadoId={comparado ? comparadoId : undefined}
        unidade={unidade}
      />
    </Modal>
  )
}
