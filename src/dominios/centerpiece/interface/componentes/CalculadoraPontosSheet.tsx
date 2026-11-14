import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import {
  apagar,
  avaliar,
  digitar,
  inserirValor,
  LIMITES,
  operar,
  partesDaExpressao,
  resolver,
  temOperacao,
  VALOR_RIICHI,
} from '../../logica/expressaoPontos'
import { KANJI_VENTO, ORDEM_VENTOS, type Cadeira } from '../../logica/partida'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'
import './calculadora-pontos.css'

const DIGITOS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const

/** Quanto o vencedor ganhou na mão calculada (honba incluído). */
function ganhoDaMao(resultado: ResultadoCalculoParaCenterpiece): number {
  if (resultado.tipoVitoria === 'ron') return resultado.pontosRon ?? 0
  const naoDealer = resultado.pagamentoNaoDealer ?? 0
  return resultado.vencedorEhLeste
    ? naoDealer * 3
    : (resultado.pagamentoDealer ?? 0) + naoDealer * 2
}

/**
 * Folha de pontos de um jogador da mesa: visor com a conta, atalhos de limite,
 * teclado de calculadora e a Calculadora (Han e Fu) opcional. Só grava no OK.
 */
export default function CalculadoraPontosSheet({
  cadeira,
  nome,
  inicial,
  aoConfirmar,
  aoFechar,
}: {
  cadeira: Cadeira
  nome: string
  /** Pontos atuais do jogador, ou os de partida do torneio. */
  inicial: number
  aoConfirmar: (pontos: number | null) => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const [expressao, setExpressao] = useState(String(inicial))
  const [dealer, setDealer] = useState(false)
  const [calculandoMao, setCalculandoMao] = useState(false)
  const resultado = avaliar(expressao)
  const conta = temOperacao(expressao)

  const textoExpressao = partesDaExpressao(expressao)
    .map((parte) => (typeof parte === 'number' ? numero(parte) : parte === '-' ? '−' : '+'))
    .join(' ')
    // "-" no começo é o sinal do número, colado nele.
    .replace(/^− /, '−')

  const tecla = (rotulo: string, falado: string, acao: () => void, classe = '') => (
    <button type="button" className={`cpt-tecla${classe}`} aria-label={falado} onClick={acao}>
      {rotulo}
    </button>
  )

  return (
    <>
      <Modal
        titulo={
          <span className="cpt-titulo">
            <span aria-hidden="true">{KANJI_VENTO[ORDEM_VENTOS[cadeira]]}</span> {nome}
          </span>
        }
        aoFechar={aoFechar}
        rotuloFechar={t('actions.close')}
        tamanho="pequena"
        className="cpt-modal"
        rodape={
          <button
            type="button"
            className="btn-primario cpt-ok"
            onClick={() => aoConfirmar(resultado)}
          >
            {t('tournament.points.ok')}
          </button>
        }
      >
        <div className="cpt-visor" aria-live="polite" aria-atomic="true">
          <span className="cpt-expressao">{conta ? `${textoExpressao} =` : ' '}</span>
          <span
            className={`cpt-resultado${resultado !== null && resultado < 0 ? ' cpt-negativo' : ''}`}
          >
            {resultado === null ? (expressao === '-' ? '−' : '0') : numero(resultado)}
          </span>
        </div>

        <div className="cpt-linha">
          <div
            className="ptd-segmentos cpt-dealer"
            role="group"
            aria-label={t('tournament.points.limits')}
          >
            {([false, true] as const).map((opcao) => (
              <button
                key={String(opcao)}
                type="button"
                className={`ptd-segmento${dealer === opcao ? ' ptd-segmento--ativo' : ''}`}
                aria-pressed={dealer === opcao}
                onClick={() => setDealer(opcao)}
              >
                {t(opcao ? 'tournament.points.dealer' : 'tournament.points.nonDealer')}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-contorno cpt-calcular"
            onClick={() => setCalculandoMao(true)}
          >
            <i className="fas fa-calculator" aria-hidden="true" />{' '}
            {t('tournament.points.calculateHand')}
          </button>
        </div>

        <div className="cpt-atalhos">
          {LIMITES.map((limite) => {
            const valor = dealer ? limite.dealer : limite.naoDealer
            const nomeLimite = t(`tournament.points.${limite.chave}`)
            return (
              <button
                key={limite.chave}
                type="button"
                className="cpt-atalho"
                aria-label={t('tournament.points.spokenValue', {
                  name: nomeLimite,
                  value: numero(valor),
                })}
                onClick={() => setExpressao(inserirValor(expressao, valor))}
              >
                <span>{nomeLimite}</span>
                <strong>{numero(valor)}</strong>
              </button>
            )
          })}
          <button
            type="button"
            className="cpt-atalho"
            aria-label={t('tournament.points.spokenValue', {
              name: t('tournament.points.riichi'),
              value: numero(VALOR_RIICHI),
            })}
            onClick={() => setExpressao(inserirValor(expressao, VALOR_RIICHI))}
          >
            <span>{t('tournament.points.riichi')}</span>
            <strong>{numero(VALOR_RIICHI)}</strong>
          </button>
        </div>

        <div className="cpt-teclado">
          {tecla('C', t('tournament.points.clear'), () => setExpressao(''), ' cpt-tecla--acao')}
          {tecla(
            '⌫',
            t('tournament.points.backspace'),
            () => setExpressao(apagar(expressao)),
            ' cpt-tecla--acao',
          )}
          {tecla(
            '−',
            t('tournament.points.minus'),
            () => setExpressao(operar(expressao, '-')),
            ' cpt-tecla--op',
          )}
          {tecla(
            '+',
            t('tournament.points.plus'),
            () => setExpressao(operar(expressao, '+')),
            ' cpt-tecla--op',
          )}
          {DIGITOS.map((digito) => (
            <button
              key={digito}
              type="button"
              className="cpt-tecla"
              onClick={() => setExpressao(digitar(expressao, digito))}
            >
              {digito}
            </button>
          ))}
          {tecla(
            '=',
            t('tournament.points.equals'),
            () => setExpressao(resolver(expressao)),
            ' cpt-tecla--igual',
          )}
          {tecla('0', '0', () => setExpressao(digitar(expressao, '0')), ' cpt-tecla--zero')}
          {tecla('000', t('tournament.points.thousand'), () =>
            setExpressao(digitar(expressao, '000')),
          )}
        </div>
      </Modal>

      {calculandoMao && (
        <Modal
          titulo={t('tournament.points.calculateHand')}
          aoFechar={() => setCalculandoMao(false)}
          rotuloFechar={t('actions.close')}
          tamanho="grande"
          className="cpt-modal-mao"
        >
          <PaginaCalculadoraHanFu
            initialIsOya={dealer}
            comSeletores
            rotuloUsar={t('tournament.points.useHand')}
            aoUsarResultado={(calculado) => {
              setExpressao(inserirValor(expressao, ganhoDaMao(calculado)))
              setCalculandoMao(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}
