import { useId, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CHAVE_VENTO, KANJI_VENTO, type Cadeira, type Partida } from '../../logica/partida'
import {
  contadoresDaPartida,
  linhasDoHistorico,
  linhasEmAndamento,
  maiorMao,
  type Patamar,
} from '../../logica/resumoPartida'

const CHAVE_PATAMAR: Record<Patamar, string> = {
  mangan: 'hanFu.limitMangan',
  haneman: 'hanFu.limitHaneman',
  baiman: 'hanFu.limitBaiman',
  sanbaiman: 'hanFu.limitSanbaiman',
  yakuman: 'hanFu.limitYakuman',
}

interface PropsCardMesa {
  partida: Partida
  modo: 'andamento' | 'historico'
  /** "Mesa 1", ou o tipo de partida no histórico. */
  titulo: string
  /** Linha de apoio antes da hora (ex.: "Rodada 2 · Mesa 1" no torneio). */
  apoio?: string
  nomeDe: (cadeira: Cadeira) => string
  aoAbrir: () => void
  aoCompartilhar: () => void
  aoExcluir: () => void
}

/**
 * Card de placar: cabeçalho com a rodada e as ações, grade 2×2 com os quatro
 * jogadores e, ao expandir, a tabela com os contadores do registro de mãos.
 */
export default function CardMesa({
  partida,
  modo,
  titulo,
  apoio,
  nomeDe,
  aoAbrir,
  aoCompartilhar,
  aoExcluir,
}: PropsCardMesa) {
  const { t, numero, idioma } = useI18n()
  const [aberto, setAberto] = useState(false)
  const idDetalhes = useId()
  const historico = modo === 'historico'

  const linhas = historico ? linhasDoHistorico(partida) : linhasEmAndamento(partida)
  const destaque = maiorMao(partida)
  const contadores = contadoresDaPartida(partida)
  const { placar } = partida

  const rodada = historico
    ? null
    : `${KANJI_VENTO[placar.rodadaVento]}${placar.rodadaNumero}${
        placar.honba > 0 ? ` · ${t('match.cards.honba', { count: placar.honba })}` : ''
      }`
  const momento = historico ? partida.finalizadaEm : partida.criadaEm
  const hora = momento
    ? new Intl.DateTimeFormat(idioma, historico ? { dateStyle: 'short', timeStyle: 'short' } : { timeStyle: 'short' }).format(
        new Date(momento),
      )
    : ''
  const cabecalho = [titulo, rodada].filter(Boolean).join(' · ')
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`
  const posicao = (linha: (typeof linhas)[number]) =>
    historico
      ? t('match.result.place', { place: linha.colocacao ?? 0 })
      : KANJI_VENTO[linha.vento]
  const posicaoFalada = (linha: (typeof linhas)[number]) =>
    historico ? t('match.result.place', { place: linha.colocacao ?? 0 }) : t(CHAVE_VENTO[linha.vento])
  const contador = (cadeira: Cadeira, campo: 'riichi' | 'ron' | 'tsumo' | 'dealIn') =>
    contadores ? numero(contadores[cadeira][campo]) : '–'

  return (
    <article className={`cm-card${aberto ? ' cm-card--aberto' : ''}`} aria-label={cabecalho}>
      <header className="cm-topo">
        <div className="cm-titulo">
          <strong>{cabecalho}</strong>
          {(apoio || hora) && (
            <span className="cm-hora">
              {apoio && `${apoio} · `}
              {hora && <time dateTime={momento}>{hora}</time>}
            </span>
          )}
        </div>
        <div className="cm-acoes">
          <button
            type="button"
            className="cm-btn-icone"
            aria-label={t('match.cards.shareNamed', { table: cabecalho })}
            title={t('match.club.share')}
            onClick={aoCompartilhar}
          >
            <i className="fas fa-share-nodes" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="cm-btn-icone cm-btn-icone--perigo"
            aria-label={t('match.cards.deleteNamed', { table: cabecalho })}
            title={t('players.delete')}
            onClick={aoExcluir}
          >
            <i className="fas fa-trash" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={historico ? 'cm-btn-icone' : 'btn-primario cm-abrir'}
            aria-label={t(historico ? 'match.cards.viewNamed' : 'match.cards.openNamed', { table: cabecalho })}
            title={historico ? t('match.cards.view') : undefined}
            onClick={aoAbrir}
          >
            {/* No histórico, o olho: ver a partida já finalizada. */}
            {historico ? <i className="fas fa-eye" aria-hidden="true" /> : t('match.cards.open')}
          </button>
        </div>
      </header>

      <ul className="cm-grade">
        {linhas.map((linha) => {
          const nome = nomeDe(linha.cadeira)
          const selo = destaque?.cadeira === linha.cadeira ? t(CHAVE_PATAMAR[destaque.patamar]) : null
          const falado = [
            posicaoFalada(linha),
            nome,
            t('match.cards.pointsSpoken', { points: numero(linha.pontos) }),
            !historico && linha.destaque ? t('match.cards.dealer') : null,
            selo ? t('match.cards.biggestHand', { hand: selo }) : null,
          ]
            .filter(Boolean)
            .join(', ')
          return (
            <li
              key={linha.cadeira}
              className={`cm-celula${linha.destaque ? ' cm-celula--destaque' : ''}`}
              aria-label={falado}
            >
              <span className={`cm-posicao${historico ? ' cm-posicao--lugar' : ''}`} aria-hidden="true">
                {posicao(linha)}
              </span>
              <span className="cm-nome" aria-hidden="true">
                <span className="cm-nome-texto">{nome}</span>
                {selo && <span className="cm-selo">{selo}</span>}
              </span>
              <span className={`cm-pontos${linha.pontos < 0 ? ' cm-negativo' : ''}`} aria-hidden="true">
                {numero(linha.pontos)}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Fechado, a tabela fica com visibility: hidden, fora do leitor de tela e do Tab. */}
      <div className="cm-detalhes" id={idDetalhes}>
        <div className="cm-detalhes-rolagem">
          <table className="cm-tabela">
            <thead>
              <tr>
                <th scope="col">{t('match.cards.player')}</th>
                <th scope="col">{t('match.cards.points')}</th>
                {historico && (
                  <th scope="col">
                    <abbr title={t('match.cards.deltaHelp')}>Δ</abbr>
                  </th>
                )}
                <th scope="col">{t('match.event.riichi')}</th>
                <th scope="col">{t('match.event.ron')}</th>
                <th scope="col">{t('match.event.tsumo')}</th>
                <th scope="col">{t('match.cards.dealIn')}</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => (
                <tr key={linha.cadeira}>
                  <th scope="row">
                    <span aria-hidden="true" className="cm-tabela-posicao">
                      {posicao(linha)}
                    </span>{' '}
                    {nomeDe(linha.cadeira)}
                  </th>
                  <td className={linha.pontos < 0 ? 'cm-negativo' : undefined}>{numero(linha.pontos)}</td>
                  {historico && (
                    <td className={(linha.delta ?? 0) < 0 ? 'cm-negativo' : undefined}>
                      {linha.delta === undefined ? '–' : comSinal(linha.delta)}
                    </td>
                  )}
                  <td>{contador(linha.cadeira, 'riichi')}</td>
                  <td>{contador(linha.cadeira, 'ron')}</td>
                  <td>{contador(linha.cadeira, 'tsumo')}</td>
                  <td>{contador(linha.cadeira, 'dealIn')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="button"
        className="cm-expandir"
        aria-expanded={aberto}
        aria-controls={idDetalhes}
        aria-label={t(aberto ? 'match.cards.collapse' : 'match.cards.expand')}
        onClick={() => setAberto((atual) => !atual)}
      >
        <i className="fas fa-chevron-down" aria-hidden="true" />
      </button>
    </article>
  )
}
