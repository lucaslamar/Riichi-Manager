import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { TipoChamada } from '../logica/montagem'
import { PedraChinesa } from './PedraChinesa'
import { nomePedra } from './pedras'
import type { ChiPendente } from './useCalculadoraMaoChinesa'

const NAIPES = [
  { classe: 'm', chave: 'calculator.suitMan', rotuloCurto: 'Man', inicio: 1 },
  { classe: 'p', chave: 'calculator.suitPin', rotuloCurto: 'Pin', inicio: 19 },
  { classe: 's', chave: 'calculator.suitSou', rotuloCurto: 'Sou', inicio: 10 },
] as const
/** Mesma ordem do teclado do Riichi: ventos e depois dragões branco, verde e vermelho. */
const HONRAS = [28, 29, 30, 31, 34, 33, 32]
const CHAVE_CHAMADA: Record<TipoChamada, string> = {
  chi: 'melds.chii',
  pon: 'melds.pon',
  kanAberto: 'melds.kanAberto',
  kanFechado: 'melds.kanFechado',
}

/**
 * Teclado de pedras do MCR com as mesmas classes do teclado do Riichi (o visual
 * vem do mesmo CSS) e a arte chinesa. As flores entram na finalização da mão.
 */
export default function TecladoChines({
  mostrarGrade = true,
  acao,
  podeTocarPedra,
  chiPendente,
  maoPronta,
  aoTocarPedra,
  aoEscolherChi,
  aoFinalizar,
  selecionandoBatida,
  aoAlternarSelecaoBatida,
}: {
  /** Com o MPSZ aberto, só o rodapé (Mudar batida e Finalizar) aparece. */
  mostrarGrade?: boolean
  acao: TipoChamada | null
  podeTocarPedra: (id: number) => boolean
  chiPendente: ChiPendente | null
  maoPronta: boolean
  aoTocarPedra: (id: number) => void
  aoEscolherChi: (meio: number) => void
  aoFinalizar: () => void
  selecionandoBatida: boolean
  aoAlternarSelecaoBatida: () => void
}) {
  const { t } = useI18n()

  const rotulo = (id: number, indisponivel: boolean) => {
    const tile = nomePedra(id)
    if (indisponivel) return t('calculator.disabledTile', { tile })
    if (acao) return t('calculator.chooseMeldTile', { tile, meld: t(CHAVE_CHAMADA[acao]) })
    return t('calculator.addTileToHand', { tile })
  }

  const botaoPedra = (id: number) => {
    const indisponivel = !podeTocarPedra(id)
    return (
      <button
        key={id}
        type="button"
        className={`btn-pedra${indisponivel ? ' indisponivel' : ''}`}
        title={nomePedra(id)}
        aria-label={rotulo(id, indisponivel)}
        disabled={indisponivel}
        onClick={() => aoTocarPedra(id)}
      >
        <PedraChinesa id={id} />
      </button>
    )
  }

  return (
    <div
      className={`teclado-pedras teclado-pedras-montagem${maoPronta ? ' teclado-mao-pronta' : ''}`}
      aria-label={t('calculator.keyboard')}
    >
      {chiPendente && (
        <div
          className="seletor-chii-pendente"
          role="group"
          aria-label={t('calculator.chooseChiiSequence')}
        >
          <span>{t('calculator.chooseChiiSequence')}</span>
          <div>
            {chiPendente.meios.map((meio) => {
              const sequencia = [meio - 1, meio, meio + 1]
              const nome = sequencia.map(nomePedra).join(', ')
              return (
                <button
                  key={meio}
                  type="button"
                  className="opcao-chii-pendente"
                  aria-label={t('calculator.chooseChiiSequenceOption', { sequence: nome })}
                  title={t('calculator.chooseChiiSequenceOption', { sequence: nome })}
                  onClick={() => aoEscolherChi(meio)}
                >
                  {sequencia.map((id) => (
                    <span key={id} className="chip-pedra mini">
                      <PedraChinesa id={id} />
                    </span>
                  ))}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {mostrarGrade && (
        <>
          {NAIPES.map(({ classe, chave, rotuloCurto, inicio }) => (
            <div
              key={classe}
              className={`grupo-teclado-naipe grupo-teclado-${classe}`}
              role="group"
              aria-label={t(chave)}
            >
              <div className="rotulo-naipe-teclado" data-mobile-label={rotuloCurto}>
                {t(chave)}
              </div>
              <div className="linha-naipe">
                {Array.from({ length: 9 }, (_, i) => botaoPedra(inicio + i))}
              </div>
            </div>
          ))}

          <div
            className="grupo-teclado-naipe grupo-teclado-honras"
            role="group"
            aria-label={t('calculator.honors')}
          >
            <div className="rotulo-naipe-teclado" data-mobile-label="Hon">
              {t('calculator.honors')}
            </div>
            <div className="linha-naipe">{HONRAS.map(botaoPedra)}</div>
          </div>
        </>
      )}

      {maoPronta && (
        <div className="rodape-teclado-finalizacao">
          {/* O mesmo "Mudar batida" da calculadora japonesa. */}
          <button
            className={`botao-mudar-batida-teclado ${selecionandoBatida ? 'ativo' : ''}`}
            type="button"
            aria-label={t('calculator.changeWinningTile')}
            aria-pressed={selecionandoBatida}
            onClick={aoAlternarSelecaoBatida}
          >
            <span className="texto-batida-completo">{t('calculator.changeWinningTile')}</span>
            <span className="texto-batida-curto">{t('calculator.changeWinningTileShort')}</span>
          </button>
          <button
            className="botao-finalizar-mao-teclado"
            type="button"
            aria-label={t('calculator.finalTitle')}
            disabled={selecionandoBatida}
            onClick={aoFinalizar}
          >
            {t('calculator.finalTitle')}
          </button>
        </div>
      )}
    </div>
  )
}
