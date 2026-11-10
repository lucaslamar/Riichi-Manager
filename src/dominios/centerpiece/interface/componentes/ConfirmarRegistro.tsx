import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { MudancaRanking } from '../../logica/ranking'
import type { Cadeira, ResultadoFinal } from '../../logica/partida'

/**
 * Confirmação do Registrar partida finalizada: uma linha por jogador com a
 * colocação, os pontos da mesa e, para quem está no cadastro, como fica no
 * ranking geral (posição e total, antes → depois).
 */
export default function ConfirmarRegistro({
  resultado,
  nomeDe,
  mudancas,
  aoConfirmar,
  aoFechar,
}: {
  resultado: readonly ResultadoFinal[]
  nomeDe: (cadeira: Cadeira) => string
  /** Vazio no torneio; convidados (fora do cadastro) não têm linha aqui. */
  mudancas: readonly MudancaRanking[]
  aoConfirmar: () => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`
  const lugar = (posicao: number) => t('match.result.place', { place: posicao })
  const linhas = [...resultado].sort((uma, outra) => uma.colocacao - outra.colocacao)

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
                <strong className="fin-mudanca-nome">{nomeDe(linha.cadeira)}</strong>
                <span className="ptd-apoio">
                  {t('match.result.breakdown', {
                    raw: numero(linha.pontosBrutos),
                    uma: comSinal(linha.uma),
                    oka: comSinal(linha.oka),
                  })}
                </span>
                {depois && (
                  // Ranking geral: posição e total antes → depois.
                  <span className="fin-mudanca-ranking">
                    <i className="fas fa-ranking-star" aria-hidden="true" />
                    <span className="sr-only">{t('match.manual.rankingTitle')}: </span>
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
      {mudancas.length > 0 && <p className="cfg-ajuda fin-legenda">{t('match.manual.rankingTitle')}</p>}
    </Modal>
  )
}
