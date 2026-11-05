import { useEffect, useId, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { SELETOR_CAMADAS } from '@/compartilhado/interface/componentes/modal/pilhaCamadas'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
import { nomePedraAcessivel } from '../../constantes'
import {
  chamadasPossiveis,
  fecharPendentes,
  grupoCabeNosPendentes,
  grupoDaChamada,
  lerPendentes,
  podeDigitarNumero,
  separarPendentes,
  sequenciasChiComNumero,
  slotsDosPendentes,
  tipoDoGrupoPendente,
  type CodigoPedra,
  type EsperaPossivel,
  type Meld,
} from '../../../logica/mao'
import './campo-notacao-mao.css'

interface PropsCampoNotacaoMao {
  valor: string
  aoMudar: (texto: string) => void
  aoConfirmar?: () => void
  /** Volta para o teclado de pedras (o mesmo que deslizar o dedo para a direita). */
  aoVoltar?: () => void
  /** AC: zera tudo, como a lixeira da mão. */
  aoLimpar: () => void
  /** Slots já ocupados na mão, sem contar o que espera o naipe. */
  slotsMao: number
  /** Erro da notação já traduzido; sem erro, nada aparece além do teclado. */
  erro?: string | null
  /** Chamada marcada antes do grupo (a ação pendente do teclado de pedras). */
  chamadaArmada: Meld['tipo'] | null
  /** Marca uma chamada (tocar de novo desmarca) ou, com `null`, desmarca. */
  aoArmarChamada: (tipo: Meld['tipo'] | null) => void
  /** Esperas da mão em tenpai, as mesmas do teclado de pedras. */
  esperas: EsperaPossivel[]
  rotuloEspera: (espera: EsperaPossivel) => string
  aoEscolherEspera: (pedra: CodigoPedra) => void
  /** Sem Aka dora nas regras, o 0 (5 vermelho) fica desabilitado. */
  akadora: boolean
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
 *   ‹ Peças           AC  ⌫   ← barra de ferramentas, como a da calculadora
 *   ─────────────────────────
 *   Chi  Pon  Kan  Kan f.      ← linha de funções (como C ( ) % ÷); deitado, vai para a esquerda
 *    1    2    3    m          ← números na ordem do teclado do celular
 *    4    5    6    p          ← naipes na coluna dos operadores
 *    7    8    9    s
 *         0         z
 */
const TECLAS: Tecla[] = [
  // De 1 a 7, a legenda lembra a honra que o número vira com o z.
  ...['1', '2', '3', '4', '5', '6', '7'].map((numero) => ({
    valor: numero,
    area: `n${numero}`,
    dica: `notation.keys.honor${numero}`,
  })),
  { valor: '8', area: 'n8' },
  { valor: '9', area: 'n9' },
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
 * Chi, `4` → escolher 234, 345 ou 456). Dá para seguir montando grupos e números:
 * o naipe, tocado no fim, vale para todos.
 * Chi, Pon e Kan escrevem `c` (o tipo sai do grupo); Kan fechado, `a`.
 */
const CHAMADAS: {
  tipo: Meld['tipo']
  marca: string
  rotulo: string
  variante: string
}[] = [
  { tipo: 'chii', marca: 'c', rotulo: 'melds.chii', variante: 'chi' },
  { tipo: 'pon', marca: 'c', rotulo: 'melds.pon', variante: 'pon' },
  { tipo: 'kanAberto', marca: 'c', rotulo: 'melds.kanCompact', variante: 'kan-open' },
  {
    tipo: 'kanFechado',
    marca: 'a',
    rotulo: 'melds.kanClosedCompact',
    variante: 'kan-closed',
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
  aoLimpar,
  slotsMao,
  erro = null,
  chamadaArmada,
  aoArmarChamada,
  esperas,
  rotuloEspera,
  aoEscolherEspera,
  akadora,
}: PropsCampoNotacaoMao) {
  const { t } = useI18n()
  const idMensagem = useId()
  const possiveis = chamadasPossiveis(valor)
  const { pendentes } = separarPendentes(valor)
  const numerosDe = (grupos: string) => grupos.replace(/[ca]/g, '')

  // Toques seguidos antes do próximo render partem do último texto, não de `valor`.
  const valorRef = useRef(valor)
  valorRef.current = valor
  const mudar = (texto: string) => {
    valorRef.current = texto
    aoMudar(texto)
  }
  const digitar = (texto: string) => mudar(valorRef.current + texto)
  /** Uma chamada sem naipe é uma unidade: ⌫ tira o grupo todo. */
  const apagar = () => {
    const atual = separarPendentes(valorRef.current)
    const grupoMarcado = atual.pendentes.match(/\d+[ca]$/)?.[0]
    const texto = atual.completo + atual.pendentes
    mudar(texto.slice(0, -(grupoMarcado?.length ?? 1)))
  }
  const limpar = () => {
    valorRef.current = ''
    aoLimpar()
  }

  /** Sequências de chi com o número que ainda cabem nos grupos sem naipe. */
  const sequenciasPossiveis = (numero: string, numerosPendentes: string) =>
    sequenciasChiComNumero(numero).filter((sequencia) =>
      grupoCabeNosPendentes(numerosPendentes, sequencia),
    )

  /** Chi marcado e um número digitado: escolher a sequência, ainda sem naipe. */
  const numeroAberto = pendentes.match(/\d+$/)?.[0] ?? ''
  const opcoesChi =
    chamadaArmada === 'chii' && numeroAberto.length === 1
      ? sequenciasPossiveis(
          numeroAberto,
          numerosDe(pendentes.slice(0, pendentes.length - numeroAberto.length)),
        )
      : []

  /** Números travam quando não cabem mais: 4 iguais (ou um 0) entre os grupos sem naipe. */
  const numeroBloqueado = (numero: string, pendentesAtuais: string) => {
    const numeros = numerosDe(pendentesAtuais)
    const slotsLivres = 14 - slotsMao - slotsDosPendentes(pendentesAtuais)
    if (chamadaArmada) {
      // Toda chamada ocupa 3 slots, mesmo o kan.
      if (slotsLivres < 3) return true
      if (chamadaArmada === 'chii') {
        return opcoesChi.length > 0 || sequenciasPossiveis(numero, numeros).length === 0
      }
      return !grupoCabeNosPendentes(numeros, grupoDaChamada(numero, chamadaArmada) ?? numero)
    }
    if (!podeDigitarNumero(numeros, numero)) return true
    if (slotsLivres > 0) return false
    // Mão cheia: só o 4º igual passa, porque com a tecla Kan ele não ocupa slot a mais.
    const aberto = pendentesAtuais.match(/\d+$/)?.[0] ?? ''
    const base = (digito: string) => (digito === '0' ? '5' : digito)
    return !(
      slotsLivres === 0 &&
      aberto.length === 3 &&
      [...aberto].every((digito) => base(digito) === base(numero))
    )
  }

  const marcaArmada = chamadaArmada === 'kanFechado' ? 'a' : 'c'

  /** Com chamada marcada o número já monta o grupo, e dá para seguir montando outros. */
  const tocarNumero = (numero: string) => {
    const { pendentes: atuais } = separarPendentes(valorRef.current)
    if (numeroBloqueado(numero, atuais)) return
    if (chamadaArmada === 'chii') {
      // Uma sequência só (1 → 123, 9 → 789): entra direto; senão, escolhe abaixo.
      const sequencias = sequenciasPossiveis(numero, numerosDe(atuais))
      digitar(sequencias.length === 1 ? sequencias[0] + marcaArmada : numero)
      return
    }
    const grupo = chamadaArmada && grupoDaChamada(numero, chamadaArmada)
    digitar(grupo ? grupo + marcaArmada : numero)
  }

  /** Troca o número sem naipe pela sequência de chi escolhida. */
  const escolherSequenciaChi = (sequencia: string) => {
    const texto = valorRef.current.slice(0, valorRef.current.length - numeroAberto.length)
    mudar(texto + sequencia + marcaArmada)
  }

  /** Naipe sem efeito: nada esperando, chi ainda sem sequência ou chi em honras. */
  const temChiPendente = lerPendentes(pendentes).some(
    (grupo) => tipoDoGrupoPendente(grupo) === 'chii',
  )
  const naipeBloqueado = (naipe: string) =>
    !pendentes || opcoesChi.length > 0 || (naipe === 'z' && temChiPendente)

  /** O naipe vale para todos os grupos que estavam esperando. */
  const tocarNaipe = (naipe: string) => {
    const atual = separarPendentes(valorRef.current)
    if (!atual.pendentes || opcoesChi.length > 0) return
    aoArmarChamada(null)
    mudar(atual.completo + fecharPendentes(atual.pendentes, naipe))
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
  const acoes = useRef({ digitar, apagar, aoConfirmar, tocarNumero, tocarNaipe, akadora })
  acoes.current = { digitar, apagar, aoConfirmar, tocarNumero, tocarNaipe, akadora }

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
      // Sem Aka dora o 0 do teclado físico também não faz nada, como a tecla da tela.
      if (tecla === '0' && !acoes.current.akadora) return
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
        {aoVoltar && (
          <button className="botao-voltar-pedras-notacao" type="button" onClick={aoVoltar}>
            <i className="fas fa-chevron-left" aria-hidden="true" />
            <span>{t('notation.backToTiles')}</span>
          </button>
        )}
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

      {opcoesChi.length > 0 && (
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

      {esperas.length > 0 && !pendentes && !chamadaArmada && (
        <div className="opcoes-espera-notacao" role="group" aria-label={t('calculator.chooseWait')}>
          <span>{t('calculator.chooseWait')}</span>
          <div>
            {esperas.map((espera) => (
              <button
                key={espera.pedra}
                className="opcao-espera-notacao"
                type="button"
                aria-label={`${nomePedraAcessivel(espera.pedra)}, ${rotuloEspera(espera)}`}
                onClick={() => aoEscolherEspera(espera.pedra)}
              >
                <span className="chip-pedra mini">
                  <PedraSvg pedra={espera.pedra} />
                </span>
                <small>{rotuloEspera(espera)}</small>
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

      <div className="chamadas-notacao-mao" role="group" aria-label={t('calculator.actionsMenu')}>
        {CHAMADAS.map((chamada) => (
          <button
            key={chamada.tipo}
            className={`tecla-notacao-mao chamada action-tab action-tab--${chamada.variante} ${
              chamadaArmada === chamada.tipo ? 'active' : ''
            }`.trim()}
            type="button"
            aria-pressed={chamadaArmada === chamada.tipo}
            // Acende quando cabe no último grupo, ou para marcar antes de um grupo novo.
            disabled={!possiveis.has(chamada.tipo) && /\d$/.test(pendentes)}
            onClick={() => tocarChamada(chamada)}
          >
            <span className="rotulo-tecla-notacao-mao">{t(chamada.rotulo)}</span>
          </button>
        ))}
      </div>

      <div
        className="teclado-notacao-mao"
        role="group"
        aria-label={t('notation.keyboard')}
        aria-describedby={erro ? idMensagem : undefined}
      >
        {TECLAS.map((tecla) => (
          <button
            key={tecla.valor}
            className={`tecla-notacao-mao area-${tecla.area} ${tecla.classe ?? ''}`.trim()}
            type="button"
            aria-label={tecla.dica ? `${tecla.valor.toUpperCase()} – ${t(tecla.dica)}` : undefined}
            disabled={
              tecla.classe === 'naipe'
                ? naipeBloqueado(tecla.valor)
                : (tecla.valor === '0' && !akadora) || numeroBloqueado(tecla.valor, pendentes)
            }
            onClick={() =>
              tecla.classe === 'naipe' ? tocarNaipe(tecla.valor) : tocarNumero(tecla.valor)
            }
          >
            <span className="rotulo-tecla-notacao-mao">{tecla.valor.toUpperCase()}</span>
            {tecla.dica && <span className="dica-tecla-notacao-mao">{t(tecla.dica)}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
