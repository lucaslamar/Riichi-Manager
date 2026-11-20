import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Flor } from '../logica/montagem'
import type { TipoChamada } from '../logica/montagem'
import BotaoFlor, { FLORES_DO_TIPO, type TipoFlor } from './BotaoFlor'
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
const CHAVE_CHAMADA: Record<TipoChamada, string> = {
  chi: 'melds.chii',
  pon: 'melds.pon',
  kanAberto: 'melds.kanAberto',
  kanFechado: 'melds.kanFechado',
}

/**
 * Teclado de pedras do MCR com as mesmas classes do teclado do Riichi (o visual
 * vem do mesmo CSS) e a arte chinesa. Flor e estação ficam nas pontas da linha
 * das honras, uma pedra de cada.
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
  const [escolhendoFlor, setEscolhendoFlor] = useState<TipoFlor | null>(null)

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

      {escolhendoFlor && (
        <div
          className="seletor-chii-pendente"
          role="group"
          aria-label={t('mcr.entrada.escolherFlor')}
        >
          <span>{t('mcr.entrada.escolherFlor')}</span>
          <div>
            {FLORES_DO_TIPO[escolhendoFlor].map((flor) => (
              <button
                key={flor}
                type="button"
                className="opcao-chii-pendente"
                disabled={temFlor(flor)}
                aria-label={t('mcr.entrada.adicionarFlor', { flor: t(`mcr.flores.${flor}`) })}
                title={t(`mcr.flores.${flor}`)}
                onClick={() => {
                  aoTocarFlor(flor)
                  setEscolhendoFlor(null)
                }}
              >
                <span className="chip-pedra mini">
                  <PedraFlor flor={flor} />
                </span>
              </button>
            ))}
            <button
              type="button"
              className="opcao-chii-pendente"
              onClick={() => setEscolhendoFlor(null)}
            >
              {t('actions.cancel')}
            </button>
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
        <div className="linha-naipe linha-honras-9">
          <BotaoFlor
            tipo="flor"
            temFlor={temFlor}
            aoTocarFlor={aoTocarFlor}
            aoEscolher={setEscolhendoFlor}
          />
          {HONRAS.map(botaoPedra)}
          <BotaoFlor
            tipo="estacao"
            temFlor={temFlor}
            aoTocarFlor={aoTocarFlor}
            aoEscolher={setEscolhendoFlor}
          />
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
