import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { FAN_MINIMO_MCR } from '@/dominios/calculadora-mao-chinesa/logica/fan-mcr'
import { KANJI_VENTO, ventoDaCadeira } from '@/dominios/centerpiece/logica/partida'
import { CADEIRAS, pontosDaMao, validarMao, type Cadeira, type MaoMcr } from '../logica/placar'

export type PassoBatidaMcr = 'pagador' | 'calculo' | 'fan' | 'confirmacao'

/** Registro de uma vitória, nas mesmas etapas da batida do Riichi. */
export interface BatidaMcr {
  forma: 'ron' | 'tsumo'
  vencedor: Cadeira
  /** Quem descartou a pedra do ron (do descarte já vem escolhido). */
  descartador: Cadeira | null
  passo: PassoBatidaMcr
  /** Etapas desta batida: o ron do descarte não pergunta quem pagou. */
  etapas: PassoBatidaMcr[]
  fan: number
  /** Calculadora de Mão aberta por cima da mesa. */
  calculadora: 'pedras' | 'notacao' | null
}

const FORMAS_DE_CALCULAR = [
  {
    calculadora: 'fan',
    icone: 'fa-calculator',
    rotulo: 'placar.mcr.porFan',
    dica: 'placar.mcr.porFanAjuda',
  },
  {
    calculadora: 'pedras',
    icone: 'fa-hand',
    rotulo: 'match.win.byTiles',
    dica: 'match.win.byTilesHelp',
  },
  {
    calculadora: 'notacao',
    icone: 'fa-keyboard',
    rotulo: 'match.win.byNotation',
    dica: 'match.win.byNotationHelp',
  },
] as const

export function novaBatidaMcr(
  forma: BatidaMcr['forma'],
  vencedor: Cadeira,
  descartador: Cadeira | null = null,
): BatidaMcr {
  const etapas: PassoBatidaMcr[] =
    forma === 'ron' && descartador === null
      ? ['pagador', 'calculo', 'fan', 'confirmacao']
      : ['calculo', 'fan', 'confirmacao']
  return {
    forma,
    vencedor,
    descartador,
    passo: etapas[0],
    etapas,
    fan: FAN_MINIMO_MCR,
    calculadora: null,
  }
}

export function maoDaBatida(batida: BatidaMcr): MaoMcr {
  return batida.forma === 'tsumo'
    ? { tipo: 'vitoria', vencedor: batida.vencedor, forma: 'tsumo', fan: batida.fan }
    : {
        tipo: 'vitoria',
        vencedor: batida.vencedor,
        forma: 'ron',
        descartador: batida.descartador ?? undefined,
        fan: batida.fan,
      }
}

/**
 * As etapas da batida do Riichi no MCR: quem pagou (no ron do menu), como
 * calcular (fan direto, teclado de pedras ou MPSZ), o fan e a confirmação.
 */
export default function ModalBatidaMcr({
  batida,
  nomes,
  pontos,
  dealer,
  aoMudar,
  aoAplicar,
  aoFechar,
}: {
  batida: BatidaMcr
  nomes: readonly string[]
  pontos: readonly number[]
  dealer: Cadeira
  aoMudar: (proxima: BatidaMcr) => void
  aoAplicar: () => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const { passo, etapas, forma, vencedor, descartador, fan } = batida
  const indice = etapas.indexOf(passo)
  const erro = validarMao(maoDaBatida(batida))
  const deltas = pontosDaMao(maoDaBatida(batida))

  const voltar = () => (indice > 0 ? aoMudar({ ...batida, passo: etapas[indice - 1] }) : aoFechar())

  return (
    <Modal
      titulo={t(forma === 'tsumo' ? 'match.win.tsumoOf' : 'placar.mcr.ronDe', {
        name: nomes[vencedor],
      })}
      subtitulo={t('match.win.step', { current: indice + 1, total: etapas.length })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={voltar}>
            {t('actions.back')}
          </button>
          {passo === 'fan' && (
            <button
              type="button"
              className="btn-primario"
              disabled={erro !== null}
              onClick={() => aoMudar({ ...batida, passo: 'confirmacao' })}
            >
              {t('match.win.next')}
            </button>
          )}
          {passo === 'confirmacao' && (
            <button
              type="button"
              className="btn-primario"
              disabled={erro !== null}
              onClick={aoAplicar}
            >
              {t('match.win.apply')}
            </button>
          )}
        </div>
      }
    >
      {passo === 'pagador' && (
        <>
          <p className="ptd-rotulo">{t('match.win.payer')}</p>
          <div className="ptd-lista-opcoes">
            {CADEIRAS.filter((cadeira) => cadeira !== vencedor).map((cadeira) => (
              <button
                key={cadeira}
                type="button"
                className={`ptd-opcao${descartador === cadeira ? ' ptd-opcao--ativa' : ''}`}
                aria-pressed={descartador === cadeira}
                onClick={() => aoMudar({ ...batida, descartador: cadeira, passo: 'calculo' })}
              >
                <span aria-hidden="true">{KANJI_VENTO[ventoDaCadeira(cadeira, dealer)]}</span>
                <span className="ptd-opcao-nome">{nomes[cadeira]}</span>
                <span className="ptd-opcao-valor">{numero(pontos[cadeira])}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {passo === 'calculo' && (
        <>
          <p className="ptd-rotulo">{t('match.win.howToScore', { name: nomes[vencedor] })}</p>
          <div className="ptd-lista-opcoes">
            {FORMAS_DE_CALCULAR.map((opcao) => (
              <button
                key={opcao.calculadora}
                type="button"
                className="ptd-opcao"
                onClick={() =>
                  aoMudar(
                    opcao.calculadora === 'fan'
                      ? { ...batida, passo: 'fan' }
                      : { ...batida, calculadora: opcao.calculadora },
                  )
                }
              >
                <i className={`fas ${opcao.icone} ptd-opcao-icone`} aria-hidden="true" />
                <span className="ptd-opcao-nome">
                  {t(opcao.rotulo)}
                  <small className="ptd-opcao-dica">{t(opcao.dica)}</small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {passo === 'fan' && (
        <>
          <label className="ptd-rotulo" htmlFor="placar-mcr-fan">
            {t('placar.mcr.fan')}
          </label>
          <div className="placar-mcr__fan">
            <button
              type="button"
              className="btn-contorno placar-mcr__passo"
              aria-label={t('placar.mcr.menosFan')}
              disabled={fan <= FAN_MINIMO_MCR}
              onClick={() => aoMudar({ ...batida, fan: Math.max(FAN_MINIMO_MCR, fan - 1) })}
            >
              <i className="fas fa-minus" aria-hidden="true" />
            </button>
            <input
              id="placar-mcr-fan"
              type="number"
              inputMode="numeric"
              min={FAN_MINIMO_MCR}
              value={fan}
              onChange={(evento) => aoMudar({ ...batida, fan: Number(evento.target.value) })}
            />
            <button
              type="button"
              className="btn-contorno placar-mcr__passo"
              aria-label={t('placar.mcr.maisFan')}
              onClick={() => aoMudar({ ...batida, fan: fan + 1 })}
            >
              <i className="fas fa-plus" aria-hidden="true" />
            </button>
          </div>
          <p className="placar-mcr__ajuda">{t('placar.mcr.fanAjuda')}</p>
          {erro && (
            <p className="placar-mcr__erro" role="alert">
              {t(`placar.mcr.erros.${erro}`)}
            </p>
          )}
        </>
      )}

      {passo === 'confirmacao' && (
        <>
          <p className="ptd-rotulo">
            {t(`calculator.${forma}`)} · {t('placar.mcr.qtdFan', { fan: numero(fan) })}
          </p>
          <ul className="ptd-linhas">
            {descartador !== null && (
              <li>
                <span>{t('match.win.paidBy')}</span>
                <strong>{nomes[descartador]}</strong>
              </li>
            )}
            {CADEIRAS.map((cadeira) => (
              <li key={cadeira}>
                <span>{nomes[cadeira]}</span>
                <strong className={deltas[cadeira] > 0 ? 'ptd-positivo' : undefined}>
                  {(deltas[cadeira] > 0 ? '+' : '') + numero(deltas[cadeira])}
                </strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  )
}
