import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import type { RegrasDoModo } from '@/compartilhado/modo-jogo/regrasDoModo'
import {
  compararCom,
  disputantes,
  distanciaParaPodio,
  vizinhosDoJogador,
  type DistanciaAlvo,
} from '../../logica/distanciaPodio'
import type { LinhaRankingTorneio } from '../../logica/ranking'
import type { TextosDistancia } from '../hooks/useTextosDistancia'

/** Quanto falta para o pódio, os vizinhos e a comparação livre de um jogador. */
export default function FolhaDistanciaPodio({
  linhas,
  jogadorId,
  regras,
  textos,
  nome,
  pontos,
  coberta,
  aoNavegar,
  aoCompartilhar,
  aoFechar,
}: {
  linhas: readonly LinhaRankingTorneio[]
  jogadorId: string
  regras: RegrasDoModo
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

  const { faltam, vantagem } = distanciaParaPodio(linhas, jogadorId)
  const comparado = compararCom(linhas, jogadorId, comparadoId)
  const secoes = [
    { id: 'podio', alvos: [...faltam, ...vantagem] },
    { id: 'vizinhos', alvos: vizinhosDoJogador(linhas, jogadorId) },
    { id: 'comparado', alvos: comparado ? [comparado] : [] },
  ].filter((secao) => secao.alvos.length > 0)
  const rivais = disputantes(linhas, jogadorId).filter((outra) => outra.jogadorId !== jogadorId)

  const item = (alvo: DistanciaAlvo) => (
    <li key={`${alvo.relacao}-${alvo.jogadorId}`} className={alvo.posicao <= 3 ? `trn-podio--${alvo.posicao}` : undefined}>
      {alvo.posicao <= 3 && (
        <span className="trn-medalha" aria-hidden="true">
          {alvo.posicao}
        </span>
      )}
      <span className="trn-distancia-rotulo">{textos.rotulo(alvo)}</span>
      <strong className={alvo.relacao === 'vantagem' || alvo.relacao === 'sobreOUltimo' ? 'trn-positivo' : undefined}>
        {textos.valor(alvo)}
        {alvo.diferenca > 0 && <span className="sr-only"> {t(regras.rotuloPontos)}</span>}
      </strong>
      <small>
        {textos.detalhe(alvo)}
        {textos.detalheOculto(alvo) && <span className="sr-only"> · {textos.detalheOculto(alvo)}</span>}
      </small>
    </li>
  )

  return (
    <Modal
      titulo={nome(jogadorId)}
      subtitulo={
        <>
          <span className="trn-colocacao">{textos.lugar(linha.posicao)}</span> {pontos(linha.pontos)}
        </>
      }
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="trn-distancia"
      acoes={
        jogaram.length > 1 && (
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
        )
      }
    >
      <div aria-live="polite">
        {secoes.map((secao) => (
          <ul key={secao.id} className="trn-distancia-lista">
            {secao.alvos.map(item)}
          </ul>
        ))}
      </div>
      <div className="trn-distancia-acoes">
        {rivais.length > 0 && (
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
        )}
        <button
          type="button"
          className="cm-btn-icone"
          aria-label={t('tournament.podiumGap.share', { name: nome(jogadorId) })}
          title={t('tournament.share.title')}
          aria-haspopup="dialog"
          onClick={() => aoCompartilhar(comparado ? comparadoId : undefined)}
        >
          <i className="fas fa-share-nodes" aria-hidden="true" />
        </button>
      </div>
      <p className="cfg-ajuda trn-distancia-aviso">{t(`tournament.podiumGap.approx.${regras.modo}`)}</p>
    </Modal>
  )
}
