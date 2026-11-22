import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { flushSync } from 'react-dom'
import { toqueIgnorado } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import {
  apagar,
  avaliar,
  digitadoSobre,
  digitarSobre,
  inserirValor,
  operar,
  partesDaExpressao,
  resolver,
  temOperacao,
} from '../../logica/expressaoPontos'
import { KANJI_VENTO, ORDEM_VENTOS, type Cadeira } from '../../logica/partida'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'
import { PROPS_TECLADO_COM_SINAL } from './CampoUma'
import './calculadora-pontos.css'

// Como no teclado do celular: 1 2 3 em cima.
const DIGITOS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

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
  baseDaConta,
  textoSoma,
  aoConfirmar,
  aoNavegar,
  aoCalcularMao,
  aoFechar,
}: {
  cadeira: Cadeira
  /** No lugar do kanji, quando a ordem dos ventos não é conhecida. */
  marca?: ReactNode
  nome: string
  /** Pontos já lançados. null: o visor mostra 0 só como placeholder. */
  inicial: number | null
  /** Com o visor ainda vazio, o + e o Calcular mão somam daqui (os pontos de partida). */
  baseDaConta?: number
  /** "Soma X / 100.000" com o que está no visor. */
  textoSoma?: (pontos: number | null) => ReactNode
  aoConfirmar: (pontos: number | null) => void
  /**
   * Deslizar para o lado (ou ‹ ›) passa para o jogador vizinho na ordem dos ventos.
   * `pontos` vem só quando a conta foi mexida: aí ela é gravada antes de passar.
   */
  aoNavegar?: (passo: 1 | -1, pontos: number | null | undefined) => void
  /**
   * No lugar do Han e Fu (MCR: a batida chinesa). `pontos` vem só quando a conta foi mexida,
   * para gravar antes.
   */
  aoCalcularMao?: (pontos: number | null | undefined) => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  // No MCR os pontos são pequenos: sem 00 e 000, com − e + maiores.
  const comZeros = useModoJogoAtual() !== 'mcr'
  const textoInicial = inicial === null ? '' : String(inicial)
  const [expressao, setExpressaoCrua] = useState(textoInicial)
  // Enquanto ninguém mexeu, o primeiro dígito troca o valor inteiro.
  const [mexeu, setMexeu] = useState(false)
  const setExpressao = (nova: string) => {
    // Tecla que não fez nada (00 no início) não gasta a troca do valor.
    if (nova === expressao) return
    setExpressaoCrua(nova)
    setMexeu(true)
  }
  const digitarTecla = (digitos: string) => {
    const nova = digitarSobre(expressao, digitos, !mexeu)
    setExpressao(nova)
    // O mesmo dígito que já estava (0 sobre 0) também conta como digitado.
    if (/^[1-9]|^0$/.test(digitos)) setMexeu(true)
  }
  /** De onde a conta sai: o visor ou, intocado e vazio, os pontos de partida. */
  const inicioDaConta = () =>
    !mexeu && expressao === '' && baseDaConta !== undefined ? String(baseDaConta) : expressao
  const somarNoVisor = () => setExpressao(operar(inicioDaConta(), '+'))
  /** Visor tocado: vira campo e chama o teclado do sistema. */
  const [editando, setEditando] = useState(false)
  const campo = useRef<HTMLInputElement | null>(null)
  // Outro jogador: a conta recomeça com os pontos dele.
  const [cadeiraAtual, setCadeiraAtual] = useState(cadeira)
  if (cadeiraAtual !== cadeira) {
    setCadeiraAtual(cadeira)
    setExpressaoCrua(textoInicial)
    setMexeu(false)
    setEditando(false)
  }
  const [calculandoMao, setCalculandoMao] = useState(false)
  const resultado = avaliar(expressao)
  const conta = temOperacao(expressao)

  const textoExpressao = partesDaExpressao(expressao)
    .map((parte) => (typeof parte === 'number' ? numero(parte) : parte === '-' ? '−' : '+'))
    .join(' ')
    // "-" no começo é o sinal do número, colado nele.
    .replace(/^− /, '−')

  // Enter só aciona o botão em foco quando a pessoa chegou nele pelo Tab. Depois de
  // tocar numa tecla, o foco fica nela e o Enter repetiria o dígito em vez de dar OK.
  const focoPorTab = useRef(false)
  const aoTeclar = useRef<(evento: KeyboardEvent) => void>(() => {})
  aoTeclar.current = (evento) => {
    if (calculandoMao || evento.defaultPrevented) return
    if (evento.ctrlKey || evento.metaKey || evento.altKey) return
    const alvo = evento.target as HTMLElement
    // Fora da folha (ex.: o Enter que acabou de abri-la): não é com ela.
    if (alvo !== document.body && !alvo.closest('.cpt-modal')) return
    if (evento.key === 'Tab') {
      focoPorTab.current = true
      return
    }
    if (evento.key === 'Enter') {
      if (evento.repeat || (focoPorTab.current && alvo.closest('button'))) return
      evento.preventDefault()
      aoConfirmar(resultado)
      return
    }
    // No campo do visor quem trata os caracteres é o onChange.
    if (alvo.matches('input, textarea')) return
    if (/^\d$/.test(evento.key)) digitarTecla(evento.key)
    else if (evento.key === '+') somarNoVisor()
    else if (evento.key === '-') setExpressao(operar(expressao, '-'))
    else if (evento.key === 'Backspace') setExpressao(apagar(expressao))
    else return
    evento.preventDefault()
    focoPorTab.current = false
  }
  useEffect(() => {
    const ouvir = (evento: KeyboardEvent) => aoTeclar.current(evento)
    const esquecerTab = () => {
      focoPorTab.current = false
    }
    window.addEventListener('keydown', ouvir)
    window.addEventListener('pointerdown', esquecerTab, true)
    return () => {
      window.removeEventListener('keydown', ouvir)
      window.removeEventListener('pointerdown', esquecerTab, true)
    }
  }, [])

  // O foco precisa acontecer dentro do toque para o iPhone abrir o teclado.
  const editarNoTeclado = () => {
    flushSync(() => setEditando(true))
    campo.current?.focus()
  }

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
            <span className="cpt-linha-topo">
              {textoSoma && <span className="cpt-soma">{textoSoma(resultado)}</span>}
              <span className="cpt-expressao">{conta ? `${textoExpressao} =` : ' '}</span>
            </span>
            {editando ? (
              <input
                ref={campo}
                className={`cpt-resultado cpt-campo${resultado !== null && resultado < 0 ? ' cpt-negativo' : ''}`}
                {...PROPS_TECLADO_COM_SINAL}
                autoComplete="off"
                enterKeyHint="done"
                aria-label={t('tournament.points.typeFor', { name: nome })}
                placeholder="0"
                value={expressao}
                onChange={(evento) => {
                  const texto = evento.target.value
                  setExpressao(digitadoSobre(expressao, texto, !mexeu))
                  setMexeu(true)
                }}
                onBlur={() => setEditando(false)}
              />
            ) : (
              <>
                <span
                  className={`cpt-resultado${resultado !== null && resultado < 0 ? ' cpt-negativo' : ''}${expressao === '' ? ' cpt-resultado--vazio' : ''}`}
                >
                  {resultado === null ? (expressao === '-' ? '−' : '0') : numero(resultado)}
                </span>
                <button
                  type="button"
                  className="cpt-visor-toque"
                  aria-label={t('tournament.points.typeFor', { name: nome })}
                  onClick={editarNoTeclado}
                />
              </>
            )}
          </div>

          <button
            type="button"
            className="btn-contorno cpt-calcular"
            onClick={() =>
              aoCalcularMao ? aoCalcularMao(mexeu ? resultado : undefined) : setCalculandoMao(true)
            }
          >
            <i className="fas fa-calculator" aria-hidden="true" />{' '}
            {t('tournament.points.calculateHand')}
          </button>

          <div className={`cpt-teclado${comZeros ? '' : ' cpt-teclado--sem-zeros'}`}>
            {tecla('C', t('tournament.points.clear'), () => setExpressao(''), ' cpt-tecla--acao')}
            {tecla(
              '⌫',
              t('tournament.points.backspace'),
              () => setExpressao(apagar(expressao)),
              ' cpt-tecla--acao cpt-tecla--apagar',
            )}
            {tecla(
              '−',
              t('tournament.points.minus'),
              () => setExpressao(operar(expressao, '-')),
              ' cpt-tecla--op cpt-tecla--menos',
            )}
            {tecla(
              '+',
              t('tournament.points.plus'),
              somarNoVisor,
              ' cpt-tecla--op cpt-tecla--mais',
            )}
            {DIGITOS.map((digito) => (
              <button
                key={digito}
                type="button"
                className="cpt-tecla"
                onClick={() => digitarTecla(digito)}
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
            {tecla('0', '0', () => digitarTecla('0'), ' cpt-tecla--zero')}
            {comZeros && tecla('00', t('tournament.points.hundred'), () => digitarTecla('00'))}
            {comZeros && tecla('000', t('tournament.points.thousand'), () => digitarTecla('000'))}
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
              setExpressao(inserirValor(inicioDaConta(), ganhoDaMao(calculado)))
              setCalculandoMao(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}
