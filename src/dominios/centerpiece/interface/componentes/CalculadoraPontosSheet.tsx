import { useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { toqueIgnorado } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import {
  apagar,
  avaliar,
  digitar,
  inserirValor,
  operar,
  partesDaExpressao,
  resolver,
  temOperacao,
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
  marca,
  nome,
  inicial,
  aoConfirmar,
  aoNavegar,
  aoFechar,
}: {
  cadeira: Cadeira
  /** No lugar do kanji, quando a ordem dos ventos não é conhecida. */
  marca?: ReactNode
  nome: string
  /** Pontos atuais do jogador, ou os de partida do torneio. */
  inicial: number
  aoConfirmar: (pontos: number | null) => void
  /**
   * Deslizar para o lado (ou ‹ ›) passa para o jogador vizinho na ordem dos ventos.
   * `pontos` vem só quando a conta foi mexida: aí ela é gravada antes de passar.
   */
  aoNavegar?: (passo: 1 | -1, pontos: number | null | undefined) => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const [expressao, setExpressaoCrua] = useState(String(inicial))
  const [mexeu, setMexeu] = useState(false)
  const setExpressao = (nova: string) => {
    setExpressaoCrua(nova)
    setMexeu(true)
  }
  // Outro jogador: a conta recomeça com os pontos dele.
  const [cadeiraAtual, setCadeiraAtual] = useState(cadeira)
  if (cadeiraAtual !== cadeira) {
    setCadeiraAtual(cadeira)
    setExpressaoCrua(String(inicial))
    setMexeu(false)
  }
  const [calculandoMao, setCalculandoMao] = useState(false)
  const resultado = avaliar(expressao)
  const conta = temOperacao(expressao)

  const textoExpressao = partesDaExpressao(expressao)
    .map((parte) => (typeof parte === 'number' ? numero(parte) : parte === '-' ? '−' : '+'))
    .join(' ')
    // "-" no começo é o sinal do número, colado nele.
    .replace(/^− /, '−')

  const navegar = (passo: 1 | -1) => aoNavegar?.(passo, mexeu ? resultado : undefined)

  // Deslize bem mais horizontal que vertical, como nas folhas de regras.
  const inicioToque = useRef<{ x: number; y: number } | null>(null)
  const propsToque = aoNavegar
    ? {
        onTouchStart: (evento: TouchEvent) => {
          const toque = evento.touches[0]
          inicioToque.current =
            evento.touches.length === 1 && toque && !toqueIgnorado(evento.target)
              ? { x: toque.clientX, y: toque.clientY }
              : null
        },
        onTouchEnd: (evento: TouchEvent) => {
          const comeco = inicioToque.current
          inicioToque.current = null
          const toque = evento.changedTouches[0]
          if (!comeco || !toque) return
          const deltaX = toque.clientX - comeco.x
          const deltaY = toque.clientY - comeco.y
          if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return
          navegar(deltaX < 0 ? 1 : -1)
        },
      }
    : {}

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
            <span aria-hidden="true">{marca ?? KANJI_VENTO[ORDEM_VENTOS[cadeira]]}</span> {nome}
          </span>
        }
        aoFechar={aoFechar}
        rotuloFechar={t('actions.close')}
        tamanho="pequena"
        className="cpt-modal"
        acoes={
          aoNavegar && (
            <>
              <button
                type="button"
                className="modal-acao"
                aria-label={t('tournament.points.previousPlayer')}
                title={t('tournament.points.previousPlayer')}
                onClick={() => navegar(-1)}
              >
                <i className="fas fa-chevron-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="modal-acao"
                aria-label={t('tournament.points.nextPlayer')}
                title={t('tournament.points.nextPlayer')}
                onClick={() => navegar(1)}
              >
                <i className="fas fa-chevron-right" aria-hidden="true" />
              </button>
            </>
          )
        }
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
        <div className="cpt-corpo" {...propsToque}>
          <div className="cpt-visor" aria-live="polite" aria-atomic="true">
            <span className="cpt-expressao">{conta ? `${textoExpressao} =` : ' '}</span>
            <span
              className={`cpt-resultado${resultado !== null && resultado < 0 ? ' cpt-negativo' : ''}`}
            >
              {resultado === null ? (expressao === '-' ? '−' : '0') : numero(resultado)}
            </span>
          </div>

          <button
            type="button"
            className="btn-contorno cpt-calcular"
            onClick={() => setCalculandoMao(true)}
          >
            <i className="fas fa-calculator" aria-hidden="true" />{' '}
            {t('tournament.points.calculateHand')}
          </button>

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
