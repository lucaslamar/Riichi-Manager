import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Acao, CodigoPedra, ConfiguracaoCalculo, EsperaPossivel } from '../../../logica/mao'
import { HONRAS, NAIPES, codigoBase, nomePedraAcessivel } from '../../constantes'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

interface CandidataPedraAgariTeclado {
  pedra: CodigoPedra
  han: number
  yakuman: number
  semYaku: boolean
  furiten: boolean
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
  maoProntaParaFinalizar?: boolean
  mensagemFinalizacao?: string | null
  selecionandoPedraAgari?: boolean
  candidatasPedraAgari?: Map<string, CandidataPedraAgariTeclado>
  aoAbrirRegras?: () => void
  aoAdicionarPedra: (pedra: CodigoPedra) => void
  aoFinalizarMao?: () => void
  aoAlternarSelecaoPedraAgari?: () => void
  aoEscolherPedraAgariPorCodigo?: (pedra: CodigoPedra) => void
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
  maoProntaParaFinalizar = false,
  mensagemFinalizacao,
  selecionandoPedraAgari = false,
  candidatasPedraAgari = new Map(),
  aoAbrirRegras,
  aoAdicionarPedra,
  aoFinalizarMao,
  aoAlternarSelecaoPedraAgari,
  aoEscolherPedraAgariPorCodigo,
}: PropsTecladoPedras) {
  const { t } = useI18n()

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

  const renderizarBotaoPedra = (codigo: CodigoPedra, tituloPadrao?: string) => {
    const candidataAgari = candidatasPedraAgari.get(codigoBase(codigo))
    const cheiaESemAcao = maoCompleta && !acaoPendente && !selecionandoPedraAgari
    const invalidaParaAcao = !podeSelecionarPedra(codigo)
    const modoMeldAtivo =
      acaoPendente?.tipo === 'chii' ||
      acaoPendente?.tipo === 'pon' ||
      acaoPendente?.tipo === 'kanAberto' ||
      acaoPendente?.tipo === 'kanFechado'
    const ehDoraReal = dorasReais.has(codigoBase(codigo))
    const espera = esperasPorPedra.get(codigoBase(codigo))
    const bloqueadaPorEspera = filtrarTecladoPorEspera && (!espera || espera.semYaku)
    const indisponivel = selecionandoPedraAgari
      ? !candidataAgari
      : cheiaESemAcao || invalidaParaAcao || bloqueadaPorEspera
    const esperaVisivelBase = selecionandoPedraAgari
      ? candidataAgari
      : invalidaParaAcao
        ? undefined
        : modoMeldAtivo
          ? undefined
          : espera
    const esperaVisivel =
      esperaVisivelBase?.furiten && !furitenBloqueiaRon
        ? { ...esperaVisivelBase, furiten: false }
        : esperaVisivelBase
    const rotuloEspera = esperaVisivel
      ? `${rotuloEsperaTeclado(esperaVisivel)}${esperaVisivel.furiten ? ` - ${t('calculator.furiten')}` : ''}`
      : undefined
    const label = selecionandoPedraAgari
      ? candidataAgari
        ? t('calculator.selectWinningTile', { tile: nomePedraAcessivel(codigo) })
        : t('calculator.disabledTile', { tile: nomePedraAcessivel(codigo) })
      : labelBotaoPedra(codigo, indisponivel)

    return (
      <button
        key={codigo}
        className={`btn-pedra ${codigo[0] === '0' ? 'btn-pedra-aka' : ''} ${
          ehDoraReal ? 'dora-real' : ''
        } ${classeEsperaTeclado(esperaVisivel)} ${indisponivel ? 'indisponivel' : ''}`}
        type="button"
        title={
          tituloPadrao && rotuloEspera
            ? `${tituloPadrao} - ${rotuloEspera}`
            : (rotuloEspera ?? tituloPadrao ?? nomePedraAcessivel(codigo))
        }
        aria-label={label}
        disabled={indisponivel}
        onClick={() =>
          selecionandoPedraAgari
            ? aoEscolherPedraAgariPorCodigo?.(codigo)
            : aoAdicionarPedra(codigo)
        }
      >
        <PedraSvg pedra={codigo} />
        {renderizarBadgeEspera(esperaVisivel)}
      </button>
    )
  }

  return (
    <div
      className={`teclado-pedras teclado-pedras-${contexto} ${
        maoProntaParaFinalizar ? 'teclado-mao-pronta' : ''
      }`}
      aria-label={t('calculator.keyboard')}
    >
      {contexto === 'montagem' && aoAbrirRegras && !maoProntaParaFinalizar && (
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
      {NAIPES.map(({ naipe }) => {
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
              {configuracao.akadora && renderizarBotaoPedra(`0${naipe}`, t('calculator.akaDora'))}
            </div>
          </div>
        )
      })}
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
      {contexto === 'montagem' && maoProntaParaFinalizar && aoFinalizarMao && (
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
          <button
            className="botao-finalizar-mao-teclado"
            type="button"
            aria-label={t('calculator.goToHandFinalization')}
            disabled={selecionandoPedraAgari}
            onClick={aoFinalizarMao}
          >
            {t('calculator.goToHandFinalization')}
          </button>
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
