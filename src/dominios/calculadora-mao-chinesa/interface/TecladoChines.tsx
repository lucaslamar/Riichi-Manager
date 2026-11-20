import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Flor } from '../logica/montagem'
import type { TipoChamada } from '../logica/montagem'
import { PedraChinesa, PedraFlor } from './PedraChinesa'
import { nomePedra } from './pedras'
import type { ChiPendente } from './useCalculadoraMaoChinesa'

const NAIPES = [
  { classe: 'm', chave: 'calculator.suitMan', rotuloCurto: 'Man', inicio: 1 },
  { classe: 'p', chave: 'calculator.suitPin', rotuloCurto: 'Pin', inicio: 19 },
  { classe: 's', chave: 'calculator.suitSou', rotuloCurto: 'Sou', inicio: 10 },
] as const
/** Mesma ordem do teclado do Riichi: ventos e depois dragões branco, verde e vermelho. */
const HONRAS = [28, 29, 30, 31, 34, 33, 32]
const FLORES: Flor[] = [1, 2, 3, 4, 5, 6, 7, 8]
const CHAVE_CHAMADA: Record<TipoChamada, string> = {
  chi: 'melds.chii',
  pon: 'melds.pon',
  kanAberto: 'melds.kanAberto',
  kanFechado: 'melds.kanFechado',
}

/**
 * Teclado de pedras do MCR com as mesmas classes do teclado do Riichi (o visual
 * vem do mesmo CSS), a arte chinesa e uma linha de flores e estações.
 */
export default function TecladoChines({
  acao,
  podeTocarPedra,
  temFlor,
  chiPendente,
  maoPronta,
  aoTocarPedra,
  aoTocarFlor,
  aoEscolherChi,
  aoFinalizar,
}: {
  acao: TipoChamada | null
  podeTocarPedra: (id: number) => boolean
  temFlor: (flor: Flor) => boolean
  chiPendente: ChiPendente | null
  maoPronta: boolean
  aoTocarPedra: (id: number) => void
  aoTocarFlor: (flor: Flor) => void
  aoEscolherChi: (meio: number) => void
  aoFinalizar: () => void
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

      <div
        className="grupo-teclado-naipe grupo-teclado-flores"
        role="group"
        aria-label={t('mcr.entrada.flores')}
      >
        <div className="rotulo-naipe-teclado" data-mobile-label={t('mcr.entrada.floresCurto')}>
          {t('mcr.entrada.flores')}
        </div>
        <div className="linha-naipe">
          {FLORES.map((flor) => {
            const usada = temFlor(flor)
            return (
              <button
                key={flor}
                type="button"
                className={`btn-pedra${usada ? ' indisponivel' : ''}`}
                title={t(`mcr.flores.${flor}`)}
                aria-label={
                  usada
                    ? t('calculator.disabledTile', { tile: t(`mcr.flores.${flor}`) })
                    : t('mcr.entrada.adicionarFlor', { flor: t(`mcr.flores.${flor}`) })
                }
                disabled={usada}
                onClick={() => aoTocarFlor(flor)}
              >
                <PedraFlor flor={flor} />
              </button>
            )
          })}
        </div>
      </div>

      {maoPronta && (
        <div className="rodape-teclado-finalizacao">
          <button
            className="botao-finalizar-mao-teclado"
            type="button"
            aria-label={t('calculator.finalTitle')}
            onClick={aoFinalizar}
          >
            {t('calculator.finalTitle')}
          </button>
        </div>
      )}
    </div>
  )
}
