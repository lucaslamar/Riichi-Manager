import type { Acao, CodigoPedra, ConfiguracaoCalculo, EsperaPossivel } from '../../../logica/mao'
import { HONRAS, NAIPES, codigoBase } from '../../constantes'
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
  aoAdicionarPedra: (pedra: CodigoPedra) => void
}

/**
 * Renderiza o teclado de pedras e aplica os bloqueios visuais de tenpai, furiten e limite físico.
 * Não decide regras de negócio; apenas consulta as funções recebidas do hook principal.
 *
 * Como ler este componente:
 * - `renderizarBotaoPedra` concentra a lógica comum de disabled, título e badges;
 * - o JSX final só organiza naipes, aka doras e honras;
 * - qualquer mudança de regra deve entrar no hook, não aqui.
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
  aoAdicionarPedra,
}: PropsTecladoPedras) {
  /** Badge compacto usado quando uma pedra representa uma espera possível. */
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

  /**
   * Monta um botão de pedra com todos os estados visuais relevantes.
   * Recebe título opcional para casos especiais, como aka dora.
   */
  const renderizarBotaoPedra = (codigo: CodigoPedra, tituloPadrao?: string) => {
    const cheiaESemAcao = maoCompleta && !acaoPendente
    const invalidaParaAcao = !podeSelecionarPedra(codigo)
    const ehDoraReal = dorasReais.has(codigoBase(codigo))
    const espera = esperasPorPedra.get(codigoBase(codigo))
    const bloqueadaPorEspera = filtrarTecladoPorEspera && (!espera || espera.semYaku)
    const indisponivel = cheiaESemAcao || invalidaParaAcao || bloqueadaPorEspera
    const esperaVisivel = invalidaParaAcao ? undefined : espera
    const rotuloEspera = esperaVisivel
      ? `${rotuloEsperaTeclado(esperaVisivel)}${esperaVisivel.furiten ? ' - furiten' : ''}`
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
            : rotuloEspera ?? tituloPadrao
        }
        disabled={indisponivel}
        onClick={() => aoAdicionarPedra(codigo)}
      >
        <PedraSvg pedra={codigo} />
        {renderizarBadgeEspera(esperaVisivel)}
      </button>
    )
  }

  return (
    <div className="teclado-pedras">
      {NAIPES.map(({ naipe, rotulo }) => (
        <div key={naipe} className={`grupo-teclado-naipe grupo-teclado-${naipe}`}>
          <div
            className="rotulo-naipe-teclado"
            data-mobile-label={naipe === 'm' ? '万' : naipe === 'p' ? '筒' : '索'}
          >
            {rotulo}
          </div>
          <div className="linha-naipe">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((numero) =>
              renderizarBotaoPedra(`${numero}${naipe}`),
            )}
            {configuracao.akadora &&
              doraManual === 0 &&
              renderizarBotaoPedra(`0${naipe}`, '5 vermelho (aka dora)')}
          </div>
        </div>
      ))}
      <div className="grupo-teclado-naipe grupo-teclado-honras">
        <div className="rotulo-naipe-teclado" data-mobile-label="字">
          Honras (Jihai / Kazehai)
        </div>
        <div className="linha-naipe">
          {HONRAS.map((codigo) => renderizarBotaoPedra(codigo))}
        </div>
      </div>
    </div>
  )
}
