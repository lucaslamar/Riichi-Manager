import { useEffect, useId, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { SELETOR_CAMADAS } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'
import {
  chamadasPossiveis,
  expandirChamada,
  grupoDaChamada,
  normalizarNotacao,
  podeDigitarNumero,
  sequenciasChiComNumero,
  type Meld,
} from '../../../logica/mao'
import BotaoAjuda from '../../modais/ajuda-secoes/BotaoAjuda'
import './campo-notacao-mao.css'

interface PropsCampoNotacaoMao {
  valor: string
  aoMudar: (texto: string) => void
  aoConfirmar?: () => void
  /** Volta para o teclado de pedras (o mesmo que deslizar para a esquerda). */
  aoVoltar: () => void
  /** Erro da notação já traduzido; sem erro, nada aparece além do teclado. */
  erro?: string | null
  /** Chamada marcada antes do grupo (a ação pendente do teclado de pedras). */
  chamadaArmada: Meld['tipo'] | null
  /** Marca uma chamada (tocar de novo desmarca) ou, com `null`, desmarca. */
  aoArmarChamada: (tipo: Meld['tipo'] | null) => void
}

interface Tecla {
  valor: string
  /** Lugar na grade (`grid-area`), no layout de calculadora. */
  area: string
  dica?: string
  classe?: string
}

/**
 * Layout de calculadora, para digitar rápido sem pensar onde fica cada tecla:
 *
 *   ‹ Peças  ?        AC  ⌫   ← barra de ferramentas, como a da calculadora
 *   ─────────────────────────
 *   Chi  Pon  Kan  Kan f.      ← linha de funções (como C ( ) % ÷)
 *    7    8    9    m
 *    4    5    6    p          ← naipes na coluna dos operadores
 *    1    2    3    s
 *         0         z
 */
const TECLAS: Tecla[] = [
  ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((numero) => ({
    valor: numero,
    area: `n${numero}`,
  })),
  { valor: '0', area: 'n0', dica: 'notation.keys.redFive' },
  { valor: 'm', area: 'm', dica: 'notation.keys.man', classe: 'naipe' },
  { valor: 'p', area: 'p', dica: 'notation.keys.pin', classe: 'naipe' },
  { valor: 's', area: 's', dica: 'notation.keys.sou', classe: 'naipe' },
  { valor: 'z', area: 'z', dica: 'notation.keys.honors', classe: 'naipe' },
]

/**
 * Chamadas, nas duas ordens. Depois do grupo: só acende a que cabe no último
 * grupo digitado (`123m` → Chi). Antes do grupo, como no teclado de pedras: a
 * tecla fica marcada e o número já monta o grupo sem naipe (Pon, `8` → três 8;
 * Chi, `4` → escolher 234, 345 ou 456); o naipe fecha a chamada.
 * Chi, Pon e Kan escrevem `c` (o tipo sai do grupo); Kan fechado, `a`.
 */
const CHAMADAS: {
  tipo: Meld['tipo']
  marca: string
  rotulo: string
  variante: string
  area: string
}[] = [
  { tipo: 'chii', marca: 'c', rotulo: 'melds.chii', variante: 'chi', area: 'chi' },
  { tipo: 'pon', marca: 'c', rotulo: 'melds.pon', variante: 'pon', area: 'pon' },
  { tipo: 'kanAberto', marca: 'c', rotulo: 'melds.kanCompact', variante: 'kan-open', area: 'kan' },
  {
    tipo: 'kanFechado',
    marca: 'a',
    rotulo: 'melds.kanClosedCompact',
    variante: 'kan-closed',
    area: 'kanf',
  },
]

/** Teclas que o teclado físico também aceita (computador ou teclado externo). */
const TECLAS_FISICAS = /^[0-9mpszca ]$/

/**
 * Notação da mão (`2388m447p 123mc`) digitada num teclado próprio, só com as
 * teclas que ela usa. Não há visor: cada número entra na mão, acima, como uma
 * pedra branca e vira a pedra de verdade quando o naipe é escolhido. O teclado do
 * aparelho nunca abre, então a tela não se mexe. No computador, o teclado físico
 * também funciona. Quem interpreta o texto é o `ConstrutorMao`.
 */
export function CampoNotacaoMao({
  valor,
  aoMudar,
  aoConfirmar,
  aoVoltar,
  erro = null,
  chamadaArmada,
  aoArmarChamada,
}: PropsCampoNotacaoMao) {
  const { t } = useI18n()
  const idMensagem = useId()
  const possiveis = chamadasPossiveis(valor)
  const pendentesDoTexto = (texto: string) => normalizarNotacao(texto).match(/\d+$/)?.[0] ?? ''
  const pendentes = pendentesDoTexto(valor)

  // Toques seguidos antes do próximo render partem do último texto, não de `valor`.
  const valorRef = useRef(valor)
  valorRef.current = valor
  const mudar = (texto: string) => {
    valorRef.current = texto
    aoMudar(texto)
  }
  const digitar = (texto: string) => mudar(valorRef.current + texto)
  /** Com chamada marcada, o grupo sem naipe é uma unidade: ⌫ tira ele todo. */
  const apagar = () => {
    const pendentesAtuais = pendentesDoTexto(valorRef.current)
    const quantos = chamadaArmada && pendentesAtuais ? pendentesAtuais.length : 1
    mudar(valorRef.current.slice(0, -quantos))
  }
  /** AC: limpa a notação, e com ela a mão fechada e as chamadas. */
  const limpar = () => {
    aoArmarChamada(null)
    mudar('')
  }

  /**
   * Números travam quando o grupo sem naipe já tem 4 iguais (ou um 0) e, com
   * chamada marcada, depois do primeiro: o grupo já foi montado e falta o naipe.
   */
  const numeroBloqueado = (numero: string, pendentesAtuais: string) =>
    !podeDigitarNumero(pendentesAtuais, numero) || (!!chamadaArmada && !!pendentesAtuais)

  /** Chi marcado e um número digitado: as sequências possíveis, sem naipe. */
  const opcoesChi =
    chamadaArmada === 'chii' && pendentes.length === 1 ? sequenciasChiComNumero(pendentes) : []

  const tocarNumero = (numero: string) => {
    if (numeroBloqueado(numero, pendentesDoTexto(valorRef.current))) return
    if (chamadaArmada === 'chii') {
      // Uma sequência só (1 → 123, 9 → 789): entra direto; senão, escolhe abaixo.
      const sequencias = sequenciasChiComNumero(numero)
      digitar(sequencias.length === 1 ? sequencias[0] : numero)
      return
    }
    digitar((chamadaArmada && grupoDaChamada(numero, chamadaArmada)) || numero)
  }

  /** Troca o número sem naipe pela sequência de chi escolhida. */
  const escolherSequenciaChi = (sequencia: string) => {
    const pendentesAtuais = pendentesDoTexto(valorRef.current)
    mudar(valorRef.current.slice(0, valorRef.current.length - pendentesAtuais.length) + sequencia)
  }

  /** Naipe sem efeito: chamada marcada sem grupo, chi ainda sem sequência ou chi em honras. */
  const naipeBloqueado = (naipe: string) =>
    !!chamadaArmada &&
    (!pendentes || opcoesChi.length > 1 || (chamadaArmada === 'chii' && naipe === 'z'))

  /** Com uma chamada marcada, o naipe completa o grupo; senão é só a letra. */
  const tocarNaipe = (naipe: string) => {
    if (naipeBloqueado(naipe)) return
    const pendentesAtuais = pendentesDoTexto(valorRef.current)
    if (chamadaArmada && pendentesAtuais) {
      const grupo = expandirChamada(pendentesAtuais, naipe, chamadaArmada)
      if (!grupo) return
      aoArmarChamada(null)
      mudar(valorRef.current.slice(0, valorRef.current.length - pendentesAtuais.length) + grupo)
      return
    }
    digitar(naipe)
  }

  const tocarChamada = (chamada: (typeof CHAMADAS)[number]) => {
    if (possiveis.has(chamada.tipo)) {
      aoArmarChamada(null)
      digitar(chamada.marca)
      return
    }
    aoArmarChamada(chamada.tipo)
  }

  // Ref: o listener do teclado físico fica fixo e usa sempre o estado atual.
  const acoes = useRef({ digitar, apagar, aoConfirmar, tocarNumero, tocarNaipe })
  acoes.current = { digitar, apagar, aoConfirmar, tocarNumero, tocarNaipe }

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.ctrlKey || evento.metaKey || evento.altKey) return
      const alvo = evento.target
      if (
        alvo instanceof Element &&
        alvo.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }
      if (document.querySelector(SELETOR_CAMADAS)) return
      const tecla = evento.key.toLowerCase()
      if (/^\d$/.test(tecla)) acoes.current.tocarNumero(tecla)
      else if (/^[mpsz]$/.test(tecla)) acoes.current.tocarNaipe(tecla)
      else if (TECLAS_FISICAS.test(tecla)) acoes.current.digitar(tecla)
      else if (evento.key === 'Backspace') acoes.current.apagar()
      else if (evento.key === 'Enter') acoes.current.aoConfirmar?.()
      else return
      evento.preventDefault()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  return (
    <div className="campo-notacao-mao">
      <div className="barra-notacao-mao" role="toolbar" aria-label={t('notation.toggle')}>
        <button className="botao-voltar-pedras-notacao" type="button" onClick={aoVoltar}>
          <i className="fas fa-chevron-left" aria-hidden="true" />
          <span>{t('notation.backToTiles')}</span>
        </button>
        <BotaoAjuda topico="notacao" />
        <span className="espaco-barra-notacao-mao" aria-hidden="true" />
        <button
          className="acao-barra-notacao-mao limpar"
          type="button"
          aria-label={t('notation.keys.clear')}
          title={t('notation.keys.clear')}
          onClick={limpar}
        >
          AC
        </button>
        <button
          className="acao-barra-notacao-mao apagar"
          type="button"
          aria-label={t('notation.keys.backspace')}
          title={t('notation.keys.backspace')}
          onClick={apagar}
        >
          <i className="fas fa-delete-left" aria-hidden="true" />
        </button>
      </div>

      {opcoesChi.length > 1 && (
        <div
          className="opcoes-chi-notacao"
          role="group"
          aria-label={t('calculator.chooseChiiSequence')}
        >
          <span>{t('calculator.chooseChiiSequence')}</span>
          <div>
            {opcoesChi.map((sequencia) => (
              <button
                key={sequencia}
                className="opcao-chi-notacao"
                type="button"
                aria-label={t('calculator.chooseChiiSequenceOption', {
                  sequence: [...sequencia]
                    .map((digito) => (digito === '0' ? '5' : digito))
                    .join(', '),
                })}
                onClick={() => escolherSequenciaChi(sequencia)}
              >
                {[...sequencia].map((digito, indice) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: posições fixas da sequência
                    key={indice}
                    className={`pedra-branca-notacao ${digito === '0' ? 'vermelha' : ''}`.trim()}
                  >
                    {digito === '0' ? '5' : digito}
                  </span>
                ))}
              </button>
            ))}
          </div>
        </div>
      )}

      {erro && (
        <small id={idMensagem} className="mensagem-campo-notacao-mao com-erro" role="alert">
          {erro}
        </small>
      )}

      <div
        className="teclado-notacao-mao"
        role="group"
        aria-label={t('notation.keyboard')}
        aria-describedby={erro ? idMensagem : undefined}
      >
        {CHAMADAS.map((chamada) => (
          <button
            key={chamada.tipo}
            className={`tecla-notacao-mao chamada area-${chamada.area} action-tab action-tab--${chamada.variante} ${
              chamadaArmada === chamada.tipo ? 'active' : ''
            }`.trim()}
            type="button"
            aria-pressed={chamadaArmada === chamada.tipo}
            // Acende quando cabe no último grupo, ou para marcar antes de um grupo novo.
            disabled={!possiveis.has(chamada.tipo) && !!pendentes}
            onClick={() => tocarChamada(chamada)}
          >
            <span className="rotulo-tecla-notacao-mao">{t(chamada.rotulo)}</span>
          </button>
        ))}
        {TECLAS.map((tecla) => (
          <button
            key={tecla.valor}
            className={`tecla-notacao-mao area-${tecla.area} ${tecla.classe ?? ''}`.trim()}
            type="button"
            aria-label={tecla.dica ? `${tecla.valor} – ${t(tecla.dica)}` : undefined}
            disabled={
              tecla.classe === 'naipe'
                ? naipeBloqueado(tecla.valor)
                : numeroBloqueado(tecla.valor, pendentes)
            }
            onClick={() =>
              tecla.classe === 'naipe' ? tocarNaipe(tecla.valor) : tocarNumero(tecla.valor)
            }
          >
            <span className="rotulo-tecla-notacao-mao">{tecla.valor}</span>
            {tecla.dica && <span className="dica-tecla-notacao-mao">{t(tecla.dica)}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
