import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  HAN_MAXIMO,
  HAN_MINIMO,
  HONBA_MAXIMO,
  formatarPontos,
  obterYakumanMultiplo,
  type CelulaReferenciaHanFu,
  type LimiteReferenciaHanFu,
  type PagamentosReferenciaHanFu,
  type ReferenciaRapidaHanFu,
  type ResultadoPontuacaoHanFu,
} from '../../logica'

interface PropsControleNumerico {
  rotulo: string
  valor: number
  minimo: number
  maximo: number
  ariaMenos: string
  ariaMais: string
  aoMudar: (valor: number) => void
  aoDiminuir?: () => void
  aoAumentar?: () => void
  desabilitarMenos?: boolean
  desabilitarMais?: boolean
  desabilitarControle?: boolean
  descricao?: string | null
  valorExibido?: string
}

export function ControleNumericoHanFu({
  rotulo,
  valor,
  minimo,
  maximo,
  ariaMenos,
  ariaMais,
  aoMudar,
  aoDiminuir,
  aoAumentar,
  desabilitarMenos,
  desabilitarMais,
  desabilitarControle,
  descricao,
  valorExibido,
}: PropsControleNumerico) {
  const menosDesabilitado = desabilitarControle || (desabilitarMenos ?? valor <= minimo)
  const maisDesabilitado = desabilitarControle || (desabilitarMais ?? valor >= maximo)

  return (
    <section
      className={`controle-han-fu ${desabilitarControle ? 'desabilitado' : ''}`}
      aria-label={rotulo}
    >
      <span className="controle-han-fu-rotulo">{rotulo}</span>
      <div className="controle-han-fu-corpo">
        <button
          type="button"
          className="botao-stepper-han-fu"
          aria-label={ariaMenos}
          disabled={menosDesabilitado}
          onClick={() => (aoDiminuir ? aoDiminuir() : aoMudar(Math.max(minimo, valor - 1)))}
        >
          <span aria-hidden="true">-</span>
        </button>
        <strong>{valorExibido ?? valor}</strong>
        <button
          type="button"
          className="botao-stepper-han-fu"
          aria-label={ariaMais}
          disabled={maisDesabilitado}
          onClick={() => (aoAumentar ? aoAumentar() : aoMudar(Math.min(maximo, valor + 1)))}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      {descricao ? <span className="aviso-fu-han-fu">{descricao}</span> : null}
    </section>
  )
}

export function ControleHan({
  han,
  aoMudarHan,
}: {
  han: number
  aoMudarHan: (han: number) => void
}) {
  const { t } = useI18n()
  const yakumanMultiplo = obterYakumanMultiplo(han)
  const valorExibido = han >= 14 ? `${yakumanMultiplo}Y` : String(han)

  return (
    <ControleNumericoHanFu
      rotulo={t('hanFu.han')}
      valor={han}
      minimo={HAN_MINIMO}
      maximo={HAN_MAXIMO}
      ariaMenos={t('hanFu.decreaseHan')}
      ariaMais={t('hanFu.increaseHan')}
      aoMudar={aoMudarHan}
      valorExibido={valorExibido}
    />
  )
}

export function ControleFu({
  fu,
  han,
  fuDisponiveis,
  aoMudarFu,
}: {
  fu: number
  han: number
  fuDisponiveis: number[]
  aoMudarFu: (fu: number) => void
}) {
  const { t } = useI18n()
  const modoYakuman = obterYakumanMultiplo(han) > 0
  const indiceAtual = Math.max(0, fuDisponiveis.indexOf(fu))
  const fuAnterior = fuDisponiveis[Math.max(0, indiceAtual - 1)]
  const proximoFu = fuDisponiveis[Math.min(fuDisponiveis.length - 1, indiceAtual + 1)]

  return (
    <ControleNumericoHanFu
      rotulo={t('hanFu.fu')}
      valor={fu}
      minimo={fuDisponiveis[0] ?? 20}
      maximo={fuDisponiveis[fuDisponiveis.length - 1] ?? 110}
      ariaMenos={t('hanFu.decreaseFu')}
      ariaMais={t('hanFu.increaseFu')}
      aoMudar={aoMudarFu}
      aoDiminuir={() => aoMudarFu(fuAnterior)}
      aoAumentar={() => aoMudarFu(proximoFu)}
      desabilitarMenos={indiceAtual <= 0 || modoYakuman}
      desabilitarMais={indiceAtual >= fuDisponiveis.length - 1 || modoYakuman}
      desabilitarControle={modoYakuman}
      descricao={modoYakuman ? t('hanFu.yakumanFuHint') : han >= 5 ? t('hanFu.limitFuHint') : null}
    />
  )
}

export function ControleHonba({
  honba,
  aoMudarHonba,
}: {
  honba: number
  aoMudarHonba: (valor: number) => void
}) {
  const { t } = useI18n()
  return (
    <ControleNumericoHanFu
      rotulo={t('hanFu.honba')}
      valor={honba}
      minimo={0}
      maximo={HONBA_MAXIMO}
      ariaMenos={t('hanFu.decreaseHonba')}
      ariaMais={t('hanFu.increaseHonba')}
      aoMudar={aoMudarHonba}
    />
  )
}

export function CardResultadoHanFu({ resultado }: { resultado: ResultadoPontuacaoHanFu }) {
  const { t } = useI18n()
  const detalhe =
    resultado.tipoVitoria === 'ron'
      ? t('hanFu.ronDetail', { points: formatarPontos(resultado.ron ?? resultado.principal) })
      : resultado.ehDealer
        ? t('hanFu.dealerTsumoDetail', { points: formatarPontos(resultado.tsumo?.all ?? 0) })
        : t('hanFu.nonDealerTsumoDetail', {
            dealer: formatarPontos(resultado.tsumo?.dealer ?? 0),
            nonDealer: formatarPontos(resultado.tsumo?.nonDealer ?? 0),
          })

  return (
    <section className="resultado-han-fu" aria-live="polite" aria-label={t('hanFu.result')}>
      <div className="resultado-han-fu-topo">
        <span>{resultado.descricao}</span>
        {resultado.honba > 0 ? (
          <span>{t('hanFu.honbaCount', { count: resultado.honba })}</span>
        ) : null}
      </div>
      {resultado.modoYakuman ? (
        <span className="resultado-yakuman-han-fu">{resultado.nomeCategoria}</span>
      ) : null}
      <strong>{resultado.totalFormatado}</strong>
      <span className="resultado-han-fu-pontos">{t('hanFu.pointsSuffix')}</span>
      <div className="detalhe-han-fu">{detalhe}</div>
      {resultado.ehLimite && !resultado.modoYakuman ? (
        <div className="badge-limite-han-fu">{resultado.nomeCategoria}</div>
      ) : null}
    </section>
  )
}

export function SeletorDealer({
  isOya,
  aoMudar,
}: {
  isOya: boolean
  aoMudar: (valor: boolean) => void
}) {
  const { t } = useI18n()
  return (
    <section className="grupo-seletor-han-fu" aria-label={t('hanFu.isDealer')}>
      <span>{t('hanFu.isDealer')}</span>
      <div className="seletor-segmentado-han-fu">
        {[
          { valor: true, rotulo: t('hanFu.yes') },
          { valor: false, rotulo: t('hanFu.no') },
        ].map((opcao) => (
          <button
            key={String(opcao.valor)}
            type="button"
            className={isOya === opcao.valor ? 'ativo' : undefined}
            aria-pressed={isOya === opcao.valor}
            onClick={() => aoMudar(opcao.valor)}
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
    </section>
  )
}

export function SeletorTipoVitoria({
  agari,
  aoMudar,
}: {
  agari: 'ron' | 'tsumo'
  aoMudar: (valor: 'ron' | 'tsumo') => void
}) {
  const { t } = useI18n()
  return (
    <section className="grupo-seletor-han-fu" aria-label={t('hanFu.winType')}>
      <span>{t('hanFu.winType')}</span>
      <div className="seletor-segmentado-han-fu">
        {(['ron', 'tsumo'] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            className={agari === tipo ? 'ativo' : undefined}
            aria-pressed={agari === tipo}
            onClick={() => aoMudar(tipo)}
          >
            {tipo === 'ron' ? t('calculator.ron') : t('calculator.tsumo')}
          </button>
        ))}
      </div>
    </section>
  )
}

export function TabelaReferenciaRapida({ referencia }: { referencia: ReferenciaRapidaHanFu }) {
  const { t } = useI18n()

  return (
    <section className="referencia-han-fu" aria-labelledby="referencia-han-fu-titulo">
      <div className="cabecalho-referencia-han-fu">
        <span>
          <strong id="referencia-han-fu-titulo">{t('hanFu.quickReference')}</strong>
          <small>{t('hanFu.quickReferenceHint')}</small>
        </span>
        <small className="legenda-referencia-han-fu">{t('hanFu.quickReferenceLegend')}</small>
      </div>
      <div id="conteudo-referencia-han-fu" className="conteudo-referencia-han-fu">
        <div
          className="tabela-referencia-han-fu"
          role="table"
          aria-label={t('hanFu.quickReference')}
        >
          <div className="linha-referencia-han-fu cabecalho" role="row">
            <span role="columnheader">{t('hanFu.referenceCorner')}</span>
            {(referencia.linhas.find((l) => l.han === 2) ?? referencia.linhas[0])?.celulas.map(
              (celula) => (
                <span key={celula.fu} role="columnheader">
                  {celula.fu}
                </span>
              ),
            )}
          </div>
          {referencia.linhas.map((linha) => (
            <div
              className="linha-referencia-han-fu"
              role="row"
              key={linha.han}
              data-han={linha.han}
            >
              <strong role="rowheader">{rotularHan(linha.han, t)}</strong>
              {linha.celulas.map((celula) => (
                <CelulaReferencia key={`${linha.han}-${celula.fu}`} celula={celula} />
              ))}
            </div>
          ))}
        </div>
        <section className="bloco-limites-han-fu" aria-label={t('hanFu.limitReference')}>
          <h4>{t('hanFu.limitReference')}</h4>
          <div className="limites-referencia-han-fu">
            {referencia.limites.map((limite) => (
              <LimiteReferencia
                key={limite.faixa}
                limite={limite}
                nome={rotularLimite(limite.han, t)}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function CelulaReferencia({ celula }: { celula: CelulaReferenciaHanFu }) {
  if (!celula.disponivel || !celula.pagamentos) {
    return (
      <span
        className="celula-referencia-vazia"
        role="cell"
        aria-label={`${celula.han} han ${celula.fu} fu indisponivel`}
      >
        –
      </span>
    )
  }

  return (
    <div
      className={`celula-referencia-han-fu ${celula.ativa ? 'ativo' : ''} ${
        celula.categoria !== 'normal' ? 'limite' : ''
      }`}
      role="cell"
      aria-label={`${celula.han} han ${celula.fu} fu`}
    >
      <span className="fu-celula-referencia">{celula.fu} Fu</span>
      <PagamentosReferencia pagamentos={celula.pagamentos} />
    </div>
  )
}

function LimiteReferencia({ limite, nome }: { limite: LimiteReferenciaHanFu; nome: string }) {
  return (
    <div className={limite.ativo ? 'ativo' : undefined}>
      <strong>{limite.faixa}</strong>
      <span>{nome}</span>
      <PagamentosReferencia pagamentos={limite.pagamentos} compacto />
    </div>
  )
}

function PagamentosReferencia({
  pagamentos,
  compacto = false,
}: {
  pagamentos: PagamentosReferenciaHanFu
  compacto?: boolean
}) {
  return (
    <dl className={`pagamentos-referencia-han-fu ${compacto ? 'compacto' : ''}`}>
      <div>
        <dt>Ron</dt>
        <dd>
          <span>
            <abbr title="Nao leste">子</abbr> {pagamentos.ronNaoLeste}
          </span>
          <span>
            <abbr title="Leste">東</abbr> {pagamentos.ronLeste}
          </span>
        </dd>
      </div>
      <div>
        <dt>Tsumo</dt>
        <dd>
          <span>
            <abbr title="Nao leste">子</abbr> {pagamentos.tsumoNaoLeste}
          </span>
          <span>
            <abbr title="Leste">東</abbr> {pagamentos.tsumoLeste}
          </span>
        </dd>
      </div>
    </dl>
  )
}

function rotularHan(
  han: number,
  traduzir: (chave: string, parametros?: Record<string, string | number>) => string,
): string {
  if (han >= 5) return traduzir('hanFu.fivePlusHan')
  return `${han} Han`
}

function rotularLimite(
  han: number,
  traduzir: (chave: string, parametros?: Record<string, string | number>) => string,
): string {
  if (han === 5) return traduzir('hanFu.limitMangan')
  if (han === 6) return traduzir('hanFu.limitHaneman')
  if (han === 8) return traduzir('hanFu.limitBaiman')
  if (han === 11) return traduzir('hanFu.limitSanbaiman')
  if (han === 13) return traduzir('hanFu.limitYakuman')
  if (han === 14) return traduzir('hanFu.limitDoubleYakuman')
  if (han === 15) return traduzir('hanFu.limitTripleYakuman')
  if (han === 16) return traduzir('hanFu.limitQuadrupleYakuman')
  if (han === 17) return traduzir('hanFu.limitQuintupleYakuman')
  return traduzir('hanFu.limitSextupleYakuman')
}
