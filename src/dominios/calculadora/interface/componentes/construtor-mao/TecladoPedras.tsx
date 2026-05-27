import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Acao, CodigoPedra, ConfiguracaoCalculo, EsperaPossivel } from '../../../logica/mao'
import { HONRAS, NAIPES, codigoBase, nomePedraAcessivel } from '../../constantes'
import { PedraSvg } from '../PedraSvg'

interface PropsTecladoPedras {
  acaoPendente: Acao | null
  configuracao: ConfiguracaoCalculo
  doraManual: number
  dorasReais: Set<string>
  esperasPorPedra: Map<string, EsperaPossivel>
  filtrarTecladoPorEspera: boolean
  maoCompleta: boolean
  podeSelecionarPedra: (pedra: CodigoPedra) => boolean
  rotuloEsperaTeclado: (espera: EsperaPossivel) => string
  classeEsperaTeclado: (espera?: EsperaPossivel) => string
  contexto: 'montagem' | 'finalizacao'
  maoProntaParaFinalizar?: boolean
  aoAbrirRegras?: () => void
  aoAdicionarPedra: (pedra: CodigoPedra) => void
  aoFinalizarMao?: () => void
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
  doraManual,
  dorasReais,
  esperasPorPedra,
  filtrarTecladoPorEspera,
  maoCompleta,
  podeSelecionarPedra,
  rotuloEsperaTeclado,
  classeEsperaTeclado,
  contexto,
  maoProntaParaFinalizar = false,
  aoAbrirRegras,
  aoAdicionarPedra,
  aoFinalizarMao,
}: PropsTecladoPedras) {
  const { t } = useI18n()

  const renderizarBadgeEspera = (espera?: EsperaPossivel) =>
    espera ? (
      <span
        className={`badge-espera-teclado ${
          espera.semYaku ? 'sem-yaku' : espera.furiten ? 'furiten' : ''
        }`}
      >
        {rotuloEsperaTeclado(espera)}
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
    const cheiaESemAcao = maoCompleta && !acaoPendente
    const invalidaParaAcao = !podeSelecionarPedra(codigo)
    const ehDoraReal = dorasReais.has(codigoBase(codigo))
    const espera = esperasPorPedra.get(codigoBase(codigo))
    const bloqueadaPorEspera = filtrarTecladoPorEspera && (!espera || espera.semYaku)
    const indisponivel = cheiaESemAcao || invalidaParaAcao || bloqueadaPorEspera
    const esperaVisivel = invalidaParaAcao ? undefined : espera
    const rotuloEspera = esperaVisivel
      ? `${rotuloEsperaTeclado(esperaVisivel)}${esperaVisivel.furiten ? ` - ${t('calculator.furiten')}` : ''}`
      : undefined

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
        aria-label={labelBotaoPedra(codigo, indisponivel)}
        disabled={indisponivel}
        onClick={() => aoAdicionarPedra(codigo)}
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
              {configuracao.akadora &&
                doraManual === 0 &&
                renderizarBotaoPedra(`0${naipe}`, t('calculator.akaDora'))}
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
          <button
            className="botao-finalizar-mao-teclado"
            type="button"
            aria-label={t('calculator.goToHandFinalization')}
            onClick={aoFinalizarMao}
          >
            {t('calculator.goToHandFinalization')}
          </button>
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
