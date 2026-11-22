import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { MudancaRanking } from '../../logica/ranking'
import type { Cadeira, ResultadoFinal } from '../../logica/partida'

/**
 * Confirmação do Registrar partida finalizada: uma linha por jogador com a
 * colocação, os pontos da mesa e, para quem está no cadastro, como fica no
 * ranking (o geral ou, no torneio, o do torneio): posição e total, antes → depois.
 */
export default function ConfirmarRegistro({
  resultado,
  nomeDe,
  mudancas,
  semUma = false,
  comPontos = false,
  tituloRanking = 'match.manual.rankingTitle',
  aoConfirmar,
  aoFechar,
}: {
  resultado: readonly ResultadoFinal[]
  nomeDe: (cadeira: Cadeira) => string
  /** No ranking geral, convidados (fora do cadastro) não têm linha aqui. */
  mudancas: readonly MudancaRanking[]
  /** MCR: o total já é o ponto da mesa, sem uma nem oka. */
  semUma?: boolean
  /** Torneio MCR: os pontos da partida, ao lado dos pontos de mesa. */
  comPontos?: boolean
  /** Chave do texto que diz qual ranking é. */
  tituloRanking?: string
  aoConfirmar: () => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`
  const lugar = (posicao: number) => t('match.result.place', { place: posicao })
  const linhas = [...resultado].sort((uma, outra) => uma.colocacao - outra.colocacao)
  // Sem oka na partida, a coluna Oka (sempre 0) não aparece.
  const comOka = linhas.some((linha) => linha.oka !== 0)

  return (
    <Modal
      titulo={t('match.manual.confirmTitle')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="fin-confirmar"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button type="button" className="btn-primario" onClick={aoConfirmar}>
            {t('match.manual.confirm')}
          </button>
        </div>
      }
    >
      <ol className="fin-mudancas">
        {linhas.map((linha) => {
          const mudanca = mudancas.find((item) => item.jogadorId === linha.jogadorId)
          const antes = mudanca?.antes ?? null
          const depois = mudanca?.depois
          const sentido =
            !depois || !antes || depois.posicao === antes.posicao ? 0 : depois.posicao < antes.posicao ? 1 : -1
          return (
            <li key={linha.cadeira}>
              <span className="ptd-resultado-lugar">{lugar(linha.colocacao)}</span>
              <div className="ptd-resultado-dados">
                <strong className="fin-mudanca-nome">
                  {nomeDe(linha.cadeira)}
                  {linha.saiu && (
                    <>
                      {' '}
                      <small className="fin-selo-wo">{t('match.leftGame.tag')}</small>
                    </>
                  )}
                </strong>
                {linha.saiu && linha.multa > 0 && (
                  <span className="ptd-apoio">
                    {t('match.result.penalty', { points: numero(linha.multa) })}
                  </span>
                )}
                {/* Pontos, uma e oka em colunas pequenas, com o título em cima. */}
                {(!semUma || comPontos) && (
                  <dl className="fin-detalhes">
                    <div>
                      <dt>{t('match.cards.points')}</dt>
                      <dd>{numero(linha.pontosBrutos)}</dd>
                    </div>
                    {!semUma && (
                      <div>
                        <dt>{t('tableConfig.umaLabel')}</dt>
                        <dd>{comSinal(linha.uma)}</dd>
                      </div>
                    )}
                    {comOka && (
                      <div>
                        <dt>{t('tableConfig.okaLabel')}</dt>
                        <dd>{comSinal(linha.oka)}</dd>
                      </div>
                    )}
                  </dl>
                )}
                {!!linha.atraso && (
                  <span className="ptd-apoio">{t('tournament.wo.lateBy', { minutes: linha.atraso })}</span>
                )}
                {depois && (
                  // Posição e total antes → depois.
                  <span className="fin-mudanca-ranking">
                    <i className="fas fa-ranking-star" aria-hidden="true" />
                    <span className="sr-only">{t(tituloRanking)}: </span>
                    {antes ? lugar(antes.posicao) : t('match.manual.firstGame')}
                    <i className="fas fa-arrow-right fin-seta" aria-hidden="true" />
                    <strong>{lugar(depois.posicao)}</strong>
                    {sentido !== 0 && (
                      <i
                        className={`fas ${sentido > 0 ? 'fa-caret-up ptd-positivo' : 'fa-caret-down ptd-negativo'}`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="fin-mudanca-total">
                      {antes ? comSinal(antes.total) : '0'}
                      <i className="fas fa-arrow-right fin-seta" aria-hidden="true" />
                      <strong className={depois.total < 0 ? 'ptd-negativo' : 'ptd-positivo'}>
                        {comSinal(depois.total)}
                      </strong>
                    </span>
                  </span>
                )}
              </div>
              <strong className={linha.final < 0 ? 'ptd-negativo' : 'ptd-positivo'}>{comSinal(linha.final)}</strong>
            </li>
          )
        })}
      </ol>
      {mudancas.length > 0 && <p className="cfg-ajuda fin-legenda">{t(tituloRanking)}</p>}
    </Modal>
  )
}
