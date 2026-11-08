import { useEffect, useRef, type MouseEvent } from 'react'
import { vibrar } from '@/compartilhado/adaptadores/vibracao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import type { Acao, CodigoPedra, ConfiguracaoCalculo, EsperaPossivel } from '../../../logica/mao'
import {
  CONSULTA_AKA_SEGURANDO_CINCO,
  HONRAS,
  NAIPES,
  codigoBase,
  nomePedraAcessivel,
} from '../../constantes'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

/** Quanto segurar o 5 para virar o 5 vermelho. */
const DURACAO_TOQUE_LONGO_MS = 450

interface CandidataPedraAgariTeclado {
  pedra: CodigoPedra
  han: number
  yakuman: number
  semYaku: boolean
  furiten: boolean
}

interface EscolhaChiiPendenteTeclado {
  chamada: CodigoPedra
  opcoes: CodigoPedra[][]
}

interface PropsTecladoPedras {
  acaoPendente: Acao | null
  configuracao: ConfiguracaoCalculo
  dorasReais: Set<string>
  esperasPorPedra: Map<string, EsperaPossivel>
  filtrarTecladoPorEspera: boolean
  furitenBloqueiaRon: boolean
  maoCompleta: boolean
  podeSelecionarPedra: (pedra: CodigoPedra) => boolean
  rotuloEsperaTeclado: (espera: Pick<EsperaPossivel, 'semYaku' | 'yakuman' | 'han'>) => string
  classeEsperaTeclado: (espera?: Pick<EsperaPossivel, 'semYaku' | 'furiten'>) => string
  contexto: 'montagem' | 'finalizacao'
  /** Falso na entrada por notação: só o rodapé de finalização (e a escolha de batida) aparece. */
  mostrarGrade?: boolean
  /** Nome da pedra no leitor de tela, quando quem usa o teclado tem o próprio. */
  rotuloPedra?: (pedra: CodigoPedra) => string
  maoProntaParaFinalizar?: boolean
  batidaDefinida?: boolean
  mensagemFinalizacao?: string | null
  selecionandoPedraAgari?: boolean
  candidatasPedraAgari?: Map<string, CandidataPedraAgariTeclado>
  escolhaChiiPendente?: EscolhaChiiPendenteTeclado | null
  aoAbrirRegras?: () => void
  aoAdicionarPedra: (pedra: CodigoPedra) => void
  aoFinalizarMao?: () => void
  aoCalcularDireto?: () => void
  aoAlternarSelecaoPedraAgari?: () => void
  aoEscolherPedraAgariPorCodigo?: (pedra: CodigoPedra) => void
  aoEscolherChiiPendente?: (chamada: CodigoPedra, sequencia: CodigoPedra[]) => void
}

/**
 * Renderiza o teclado de pedras e aplica bloqueios visuais de tenpai, furiten e limite fisico.
 *
 * Botao de tile chama `adicionarPedra`; o significado do clique vem de `acaoPendente`
 * (mao, descarte, indicador de dora ou meld). Regras ficam fora do JSX.
 */
export function TecladoPedras({
  acaoPendente,
  configuracao,
  dorasReais,
  esperasPorPedra,
  filtrarTecladoPorEspera,
  furitenBloqueiaRon,
  maoCompleta,
  podeSelecionarPedra,
  rotuloEsperaTeclado,
  classeEsperaTeclado,
  contexto,
  mostrarGrade = true,
  rotuloPedra,
  maoProntaParaFinalizar = false,
  batidaDefinida = maoProntaParaFinalizar,
  mensagemFinalizacao,
  selecionandoPedraAgari = false,
  candidatasPedraAgari = new Map(),
  escolhaChiiPendente,
  aoAbrirRegras,
  aoAdicionarPedra,
  aoFinalizarMao,
  aoCalcularDireto,
  aoAlternarSelecaoPedraAgari,
  aoEscolherPedraAgariPorCodigo,
  aoEscolherChiiPendente,
}: PropsTecladoPedras) {
  const { t } = useI18n()
  // Celular em pé com Aka dora: segurar o 5 de cada naipe põe o 5 vermelho, e os
  // naipes ficam com 9 pedras. Decidido aqui para valer em todos os teclados.
  const celularEmPe = useMediaQuery(CONSULTA_AKA_SEGURANDO_CINCO)
  const akaNoCinco = celularEmPe && configuracao.akadora
  const gradeVisivel = mostrarGrade || selecionandoPedraAgari

  const renderizarBadgeEspera = (
    espera?: Pick<EsperaPossivel, 'semYaku' | 'furiten' | 'yakuman' | 'han'>,
  ) =>
    espera ? (
      <span
        className={`badge-espera-teclado ${
          espera.semYaku ? 'sem-yaku' : espera.furiten && furitenBloqueiaRon ? 'furiten' : ''
        }`}
      >
        {espera.furiten && furitenBloqueiaRon && !espera.semYaku
          ? t('calculator.furiten')
          : rotuloEsperaTeclado(espera)}
      </span>
    ) : null

  const labelBotaoPedra = (codigo: CodigoPedra, indisponivel: boolean) => {
    if (rotuloPedra) return rotuloPedra(codigo)
    const tile = nomePedraAcessivel(codigo)
    if (indisponivel) return t('calculator.disabledTile', { tile })
    if (acaoPendente?.tipo === 'descarte') return t('calculator.addTileToDiscards', { tile })
    if (acaoPendente?.tipo === 'dora') return t('calculator.selectDoraIndicator', { tile })
    if (acaoPendente?.tipo === 'uradora') return t('calculator.selectUraDoraIndicator', { tile })
    if (
      acaoPendente?.tipo === 'chii' ||
      acaoPendente?.tipo === 'pon' ||
      acaoPendente?.tipo === 'kanAberto' ||
      acaoPendente?.tipo === 'kanFechado'
    ) {
      return t('calculator.chooseMeldTile', { tile, meld: t(`melds.${acaoPendente.tipo}`) })
    }
    return t('calculator.addTileToHand', { tile })
  }

  /**
   * Selo do 5 com o vermelho livre: o han do 5 comum e, em vermelho, o do 5
   * vermelho (ex.: 7/8 HAN). Sem diferença, sem yaku ou em furiten, fica o selo comum.
   */
  const renderizarBadgeComAka = (
    comum: Pick<EsperaPossivel, 'semYaku' | 'furiten' | 'yakuman' | 'han'>,
    vermelho: Pick<EsperaPossivel, 'semYaku' | 'furiten' | 'yakuman' | 'han'>,
  ) => {
    const bloqueada = (espera: typeof comum) => espera.semYaku || (espera.furiten && furitenBloqueiaRon)
    const valor = (espera: typeof comum) => (espera.yakuman > 0 ? `${espera.yakuman}Y` : String(espera.han))
    if (bloqueada(comum) || bloqueada(vermelho) || valor(comum) === valor(vermelho)) {
      return renderizarBadgeEspera(comum)
    }
    const sufixo = comum.yakuman === 0 && vermelho.yakuman === 0 ? ' han' : ''
    return (
      <span className="badge-espera-teclado badge-espera-teclado--com-aka">
        {valor(comum)}/<span className="badge-espera-teclado__aka">{valor(vermelho)}</span>
        {sufixo}
      </span>
    )
  }

  const acionarPedra = (codigo: CodigoPedra) =>
    selecionandoPedraAgari ? aoEscolherPedraAgariPorCodigo?.(codigo) : aoAdicionarPedra(codigo)

  const pedraIndisponivel = (codigo: CodigoPedra) => {
    if (selecionandoPedraAgari) return !candidatasPedraAgari.get(codigo)
    const cheiaESemAcao = maoCompleta && !acaoPendente
    const bloqueadaPorEspera =
      filtrarTecladoPorEspera && (!esperasPorPedra.get(codigo) || esperasPorPedra.get(codigo)?.semYaku)
    return cheiaESemAcao || !podeSelecionarPedra(codigo) || Boolean(bloqueadaPorEspera)
  }

  // Segurar o 5: o toque longo põe o 5 vermelho e o toque seguinte (o clique que o
  // navegador manda ao soltar) é ignorado.
  const toqueLongo = useRef<{ timer: number | null; disparou: boolean }>({ timer: null, disparou: false })
  const cancelarToqueLongo = () => {
    if (toqueLongo.current.timer !== null) window.clearTimeout(toqueLongo.current.timer)
    toqueLongo.current.timer = null
  }
  useEffect(() => cancelarToqueLongo, [])

  const modoMeldAtivo =
    acaoPendente?.tipo === 'chii' ||
    acaoPendente?.tipo === 'pon' ||
    acaoPendente?.tipo === 'kanAberto' ||
    acaoPendente?.tipo === 'kanFechado'

  /** A espera que o selo da pedra mostra (ou nenhuma), já com o furiten ajustado. */
  const esperaVisivelDe = (codigo: CodigoPedra) => {
    const base = selecionandoPedraAgari
      ? candidatasPedraAgari.get(codigo)
      : !podeSelecionarPedra(codigo) || modoMeldAtivo
        ? undefined
        : esperasPorPedra.get(codigo)
    return base?.furiten && !furitenBloqueiaRon ? { ...base, furiten: false } : base
  }

  const renderizarBotaoPedra = (codigo: CodigoPedra, tituloPadrao?: string) => {
    // Celular em pé com Aka dora: o 5 de cada naipe também dá o vermelho, segurando.
    const aka: CodigoPedra | null =
      akaNoCinco && codigo[0] === '5' && codigo[1] !== 'z' ? (`0${codigo[1]}` as CodigoPedra) : null
    const akaDisponivel = aka !== null && !pedraIndisponivel(aka)
    const candidataAgari = candidatasPedraAgari.get(codigo)
    const cheiaESemAcao = maoCompleta && !acaoPendente && !selecionandoPedraAgari
    const invalidaParaAcao = !podeSelecionarPedra(codigo)
    const ehDoraReal = dorasReais.has(codigoBase(codigo))
    const espera = esperasPorPedra.get(codigo)
    const bloqueadaPorEspera = filtrarTecladoPorEspera && (!espera || espera.semYaku)
    const indisponivel = selecionandoPedraAgari
      ? !candidataAgari
      : cheiaESemAcao || invalidaParaAcao || bloqueadaPorEspera
    const esperaComum = esperaVisivelDe(codigo)
    const esperaAka = aka !== null && akaDisponivel ? esperaVisivelDe(aka) : undefined
    const label = selecionandoPedraAgari
      ? candidataAgari
        ? t('calculator.selectWinningTile', { tile: nomePedraAcessivel(codigo) })
        : t('calculator.disabledTile', { tile: nomePedraAcessivel(codigo) })
      : labelBotaoPedra(codigo, indisponivel)

    // Com o 5 normal esgotado, o toque comum dá o vermelho, se ele ainda estiver livre.
    const soAka = aka !== null && indisponivel && akaDisponivel
    // Só o vermelho: o selo é o dele. Os dois livres: o selo mostra os dois valores.
    const esperaVisivel = soAka ? esperaAka : (esperaComum ?? esperaAka)
    const comDoisValores = !soAka && esperaComum !== undefined && esperaAka !== undefined
    const badge =
      comDoisValores && esperaComum && esperaAka
        ? renderizarBadgeComAka(esperaComum, esperaAka)
        : renderizarBadgeEspera(esperaVisivel)
    const rotuloEspera = esperaVisivel
      ? `${rotuloEsperaTeclado(esperaVisivel)}${esperaVisivel.furiten ? ` - ${t('calculator.furiten')}` : ''}${
          comDoisValores && esperaAka ? ` · ${t('calculator.akaDora')}: ${rotuloEsperaTeclado(esperaAka)}` : ''
        }`
      : undefined
    const segurando =
      aka !== null && akaDisponivel
        ? {
            onPointerDown: () => {
              cancelarToqueLongo()
              toqueLongo.current.disparou = false
              toqueLongo.current.timer = window.setTimeout(() => {
                toqueLongo.current.timer = null
                toqueLongo.current.disparou = true
                vibrar(30)
                acionarPedra(aka)
              }, DURACAO_TOQUE_LONGO_MS)
            },
            onPointerUp: cancelarToqueLongo,
            onPointerLeave: cancelarToqueLongo,
            onPointerCancel: cancelarToqueLongo,
            onContextMenu: (evento: MouseEvent) => evento.preventDefault(),
          }
        : {}

    return (
      <button
        key={codigo}
        className={`btn-pedra ${codigo[0] === '0' ? 'btn-pedra-aka' : ''} ${
          ehDoraReal ? 'dora-real' : ''
        } ${classeEsperaTeclado(esperaVisivel)} ${indisponivel && !soAka ? 'indisponivel' : ''}${
          aka !== null ? ' btn-pedra-com-aka' : ''
        }`}
        type="button"
        title={
          tituloPadrao && rotuloEspera
            ? `${tituloPadrao} - ${rotuloEspera}`
            : (rotuloEspera ?? tituloPadrao ?? nomePedraAcessivel(codigo))
        }
        aria-label={
          soAka
            ? labelBotaoPedra(aka, false)
            : akaDisponivel
              ? `${label}${rotuloEspera ? `, ${rotuloEspera}` : ''}. ${t('calculator.holdForAka')}`
              : label
        }
        disabled={indisponivel && !soAka}
        {...segurando}
        onClick={() => {
          if (toqueLongo.current.disparou) {
            toqueLongo.current.disparou = false
            return
          }
          acionarPedra(soAka && aka ? aka : codigo)
        }}
      >
        <PedraSvg pedra={soAka && aka ? aka : codigo} />
        {badge}
        {akaDisponivel && !soAka && <span className="ponto-aka-teclado" aria-hidden="true" />}
      </button>
    )
  }

  const renderizarOpcaoChii = (sequencia: CodigoPedra[], indice: number) => {
    const sequenciaFisica = sequencia.map((pedraSequencia) =>
      codigoBase(pedraSequencia) === codigoBase(escolhaChiiPendente?.chamada ?? pedraSequencia)
        ? (escolhaChiiPendente?.chamada ?? pedraSequencia)
        : pedraSequencia,
    )
    const rotulo = sequenciaFisica.map((pedra) => nomePedraAcessivel(pedra)).join(', ')

    return (
      <button
        key={`${sequencia.join('-')}-${indice}`}
        className="opcao-chii-pendente"
        type="button"
        aria-label={t('calculator.chooseChiiSequenceOption', { sequence: rotulo })}
        title={t('calculator.chooseChiiSequenceOption', { sequence: rotulo })}
        onClick={() =>
          escolhaChiiPendente &&
          aoEscolherChiiPendente?.(escolhaChiiPendente.chamada, sequencia)
        }
      >
        {sequenciaFisica.map((pedra) => (
          <span key={pedra} className="chip-pedra mini">
            <PedraSvg pedra={pedra} />
          </span>
        ))}
      </button>
    )
  }

  return (
    <div
      className={`teclado-pedras teclado-pedras-${contexto} ${
        maoProntaParaFinalizar ? 'teclado-mao-pronta' : ''
      }${akaNoCinco ? ' teclado-aka-no-cinco' : ''}`}
      aria-label={t('calculator.keyboard')}
    >
      {contexto === 'montagem' && aoAbrirRegras && !maoProntaParaFinalizar && gradeVisivel && (
        <button
          className="botao-configuracao-teclado"
          type="button"
          aria-label={t('rulesModal.open')}
          title={t('rulesModal.open')}
          onClick={aoAbrirRegras}
        >
          <i className="fas fa-gear" aria-hidden="true" />
        </button>
      )}
      {contexto === 'montagem' && escolhaChiiPendente && (
        <div className="seletor-chii-pendente" role="group" aria-label={t('calculator.chooseChiiSequence')}>
          <span>{t('calculator.chooseChiiSequence')}</span>
          <div>{escolhaChiiPendente.opcoes.map(renderizarOpcaoChii)}</div>
          {aoAbrirRegras && !maoProntaParaFinalizar && (
            <button
              className="botao-configuracao-chii"
              type="button"
              aria-label={t('rulesModal.open')}
              title={t('rulesModal.open')}
              onClick={aoAbrirRegras}
            >
              <i className="fas fa-gear" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      {gradeVisivel && NAIPES.map(({ naipe }) => {
        const rotulo =
          naipe === 'm'
            ? t('calculator.suitMan')
            : naipe === 'p'
              ? t('calculator.suitPin')
              : t('calculator.suitSou')

        return (
          <div
            key={naipe}
            className={`grupo-teclado-naipe grupo-teclado-${naipe}`}
            role="group"
            aria-label={rotulo}
          >
            <div
              className="rotulo-naipe-teclado"
              data-mobile-label={naipe === 'm' ? 'Man' : naipe === 'p' ? 'Pin' : 'Sou'}
            >
              {rotulo}
            </div>
            <div className="linha-naipe">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((numero) =>
                renderizarBotaoPedra(`${numero}${naipe}`),
              )}
              {configuracao.akadora &&
                !akaNoCinco &&
                renderizarBotaoPedra(`0${naipe}`, t('calculator.akaDora'))}
            </div>
          </div>
        )
      })}
      {gradeVisivel && (
        <div
          className="grupo-teclado-naipe grupo-teclado-honras"
          role="group"
          aria-label={t('calculator.honors')}
        >
          <div className="rotulo-naipe-teclado" data-mobile-label="Hon">
            {t('calculator.honors')}
          </div>
          <div className="linha-naipe">{HONRAS.map((codigo) => renderizarBotaoPedra(codigo))}</div>
        </div>
      )}
      {contexto === 'montagem' && maoProntaParaFinalizar && (aoFinalizarMao || aoCalcularDireto) && (
        <div className="rodape-teclado-finalizacao">
          {aoAlternarSelecaoPedraAgari && (
            <button
              className={`botao-mudar-batida-teclado ${selecionandoPedraAgari ? 'ativo' : ''}`}
              type="button"
              aria-label={t('calculator.changeWinningTile')}
              aria-pressed={selecionandoPedraAgari}
              onClick={aoAlternarSelecaoPedraAgari}
            >
              <span className="texto-batida-completo">{t('calculator.changeWinningTile')}</span>
              <span className="texto-batida-curto">{t('calculator.changeWinningTileShort')}</span>
            </button>
          )}
          {aoCalcularDireto ? (
            <button
              className="botao-finalizar-mao-teclado"
              type="button"
              aria-label={t('actions.calculate')}
              disabled={selecionandoPedraAgari || !batidaDefinida}
              onClick={aoCalcularDireto}
            >
              {t('actions.calculate')}
            </button>
          ) : aoFinalizarMao ? (
            <button
              className="botao-finalizar-mao-teclado"
              type="button"
              aria-label={t('calculator.finalTitle')}
              disabled={selecionandoPedraAgari || !batidaDefinida}
              onClick={aoFinalizarMao}
            >
              {t('calculator.finalTitle')}
            </button>
          ) : null}
          {mensagemFinalizacao && (
            <span className="mensagem-finalizacao-teclado" role="status">
              {mensagemFinalizacao}
            </span>
          )}
          {aoAbrirRegras && (
            <button
              className="botao-configuracao-teclado botao-configuracao-teclado-rodape"
              type="button"
              aria-label={t('rulesModal.open')}
              title={t('rulesModal.open')}
              onClick={aoAbrirRegras}
            >
              <i className="fas fa-gear" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
