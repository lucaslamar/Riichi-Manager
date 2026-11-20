import { useEffect, useId, useState } from 'react'
import { falarEmPartes, pararFala } from '@/compartilhado/adaptadores/voz'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { fanMcrPorId } from '@/compartilhado/mahjong/mcr/fans-mcr'
import { ESTILO_MELD } from '@/dominios/calculadora-mao/interface/constantes'
import '@/dominios/calculadora-mao/interface/modais/resultado/modal-resultado.css'
import { pedrasDaChamada, type CondicoesMcr, type Flor, type MaoChinesa } from '../logica/montagem'
import type { FanContado } from '../logica/tipos'
import { PedrasChamada } from './MaoChinesaAtual'
import { PedraChinesa, PedraFlor } from './PedraChinesa'
import type { ResultadoCalculoMcr } from './useCalculadoraMaoChinesa'

/** Número das Flores no guia do CMC. */
const ID_FLORES = 81
/** Fan da situação da batida: o destaque é a pedra da batida. */
const FANS_DA_BATIDA = new Set([
  'zimo',
  'miaoshouhuichun',
  'haidilaoyue',
  'hujuezhang',
  'qiangganghu',
  'gangshangkaihua',
])

type Destaque =
  | { tipo: 'pedras'; ids: number[] }
  | { tipo: 'mao' }
  | { tipo: 'batida' }
  | { tipo: 'flores' }

export interface LinhaResultado {
  chave: string
  id: number
  nomeMotor: string
  nomeChines: string
  valor: number
  destaque: Destaque
  /** Flores somam numa linha só: quantas. */
  vezes: number
}

export function linhasDoResultado(fans: FanContado[], flores: number): LinhaResultado[] {
  // Cada vez que um fan conta é uma linha, com as suas próprias pedras.
  const linhas = fans.flatMap((fan) =>
    fan.ocorrencias.map(
      (pedras, indice): LinhaResultado => ({
        chave: `${fan.chave}-${indice}`,
        id: fan.id,
        nomeMotor: fan.chave,
        nomeChines: fan.nomeChines,
        valor: fan.valor,
        vezes: 1,
        destaque: pedras
          ? { tipo: 'pedras', ids: pedras }
          : FANS_DA_BATIDA.has(fan.chave)
            ? { tipo: 'batida' }
            : { tipo: 'mao' },
      }),
    ),
  )
  if (flores > 0) {
    linhas.push({
      chave: 'huapai',
      id: ID_FLORES,
      nomeMotor: 'huapai',
      nomeChines: '花牌',
      valor: 1,
      vezes: flores,
      destaque: { tipo: 'flores' },
    })
  }
  return linhas
}

/** Pedra da tela: onde ela está, para casar com as pedras de cada fan. */
export interface PedraNaTela {
  chave: string
  id: number
}

/** Quais pedras da tela acendem para um fan: consome as pedras dele na ordem batida, mão, conjuntos. */
export function pedrasAcesas(destaque: Destaque, ordem: PedraNaTela[]): Set<string> {
  if (destaque.tipo === 'mao') return new Set(ordem.map((pedra) => pedra.chave))
  if (destaque.tipo === 'batida') return new Set(['batida'])
  if (destaque.tipo === 'flores') return new Set(['flores'])
  const faltam = new Map<number, number>()
  destaque.ids.forEach((id) => faltam.set(id, (faltam.get(id) ?? 0) + 1))
  const acesas = new Set<string>()
  for (const pedra of ordem) {
    const resta = faltam.get(pedra.id) ?? 0
    if (resta > 0) {
      acesas.add(pedra.chave)
      faltam.set(pedra.id, resta - 1)
    }
  }
  return acesas
}

/**
 * Resultado da Calculadora de Mão Chinesa, com a mesma casca e o mesmo visual do
 * resultado do Riichi: a mão com a batida e os conjuntos, as flores à parte, a
 * lista de fan (tocar abre a explicação e destaca as pedras) e os pagamentos.
 * Ao abrir, a voz diz "Hu!" ou "Zimo!" em chinês e o resultado em português.
 */
export default function ModalResultadoMcr({
  mao,
  condicoes,
  resultado,
  aoFechar,
  aoNovaMao,
}: {
  mao: MaoChinesa
  condicoes: CondicoesMcr
  resultado: ResultadoCalculoMcr
  aoFechar: () => void
  aoNovaMao: () => void
}) {
  const { t, numero } = useI18n()
  const idDescricao = useId()
  const { fan, pagamento } = resultado
  const invalida = !fan.batida || !fan.valido
  const linhas = linhasDoResultado(fan.fans, fan.flores)
  const [aberta, setAberta] = useState<string | null>(null)
  const linhaAberta = linhas.find((linha) => linha.chave === aberta)
  const nomeDe = (linha: LinhaResultado) =>
    fanMcrPorId(linha.id)?.pt ?? t(`mcr.fan.${linha.nomeMotor}`)

  const ocultas = mao.pedras.slice(0, -1)
  const batida = mao.pedras[mao.pedras.length - 1]
  const ordem: PedraNaTela[] = [
    { chave: 'batida', id: batida },
    ...ocultas.map((id, indice) => ({ chave: `oculta-${indice}`, id })),
    ...mao.chamadas.flatMap((chamada, indice) =>
      pedrasDaChamada(chamada).map((id, posicao) => ({
        chave: `chamada-${indice}-${posicao}`,
        id,
      })),
    ),
  ]
  const acesas = linhaAberta ? pedrasAcesas(linhaAberta.destaque, ordem) : null
  const acesa = (chave: string) => acesas?.has(chave) ?? false
  const classeDestaque = (chave: string) =>
    acesa(chave) ? ' destaque-yaku' : acesas ? ' apagada' : ''
  const descricaoDe = (chave: string) => (acesa(chave) ? idDescricao : undefined)

  // O resultado é falado ao abrir, como no Riichi.
  useEffect(() => {
    const textoPagamentos = pagamento
      ? [
          `${t('mcr.resultado.vencedorRecebe')} ${numero(pagamento.ganhadorRecebe)}`,
          ...(pagamento.pagamentos[0].quem === 'descartador'
            ? [
                `${t('mcr.resultado.descartador')} ${numero(pagamento.pagamentos[0].valor)}`,
                `${t('mcr.resultado.outro')} ${numero(pagamento.pagamentos[1].valor)}`,
              ]
            : [`${t('mcr.resultado.cadaJogador')} ${numero(pagamento.pagamentos[0].valor)}`]),
        ]
      : []
    const resumo = invalida
      ? t(fan.batida ? 'mcr.resultado.invalida' : 'mcr.resultado.naoBate')
      : [
          ...[...linhas].sort((a, b) => b.valor - a.valor).map(nomeDe),
          t('mcr.resultado.fanTotal', { total: numero(fan.fanTotal) }),
          ...textoPagamentos,
        ].join('. ')
    falarEmPartes([
      // A chamada de vitória em chinês: Hu (ron) ou Zimo (tsumo).
      { texto: invalida ? '' : condicoes.forma === 'tsumo' ? '自摸！' : '胡！', idioma: 'zh-CN' },
      { texto: resumo },
    ])
    return pararFala
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Modal
      titulo={invalida ? t('mcr.resultado.invalidaTitulo') : t('calculator.result')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      tom={invalida ? 'alerta' : 'padrao'}
      className="modal-resultado"
      semBotaoFechar
      acoes={
        <>
          <button
            type="button"
            className="modal-acao"
            aria-label={t('actions.backToFinish')}
            title={t('actions.backToFinish')}
            onClick={aoFechar}
          >
            <i className="fas fa-pen" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="modal-acao modal-acao--destrutiva"
            aria-label={t('actions.newHand')}
            title={t('actions.newHand')}
            onClick={aoNovaMao}
          >
            <i className="fas fa-trash" aria-hidden="true" />
          </button>
        </>
      }
    >
      {linhaAberta && (
        <span id={idDescricao} className="sr-only">
          {nomeDe(linhaAberta)}
        </span>
      )}

      <div className={`mao-calculada${acesas ? ' mcr-destacando' : ''}`}>
        <div className="resultado-grupo-mao" aria-label={t('calculator.closedHand')}>
          {ocultas.map((id, indice) => (
            <span
              key={`oculta-${indice}`}
              className={`chip-pedra resultado-pedra${classeDestaque(`oculta-${indice}`)}`}
              aria-describedby={descricaoDe(`oculta-${indice}`)}
            >
              <PedraChinesa id={id} />
            </span>
          ))}
          <span
            className={`chip-pedra resultado-pedra agari${classeDestaque('batida')}`}
            aria-describedby={descricaoDe('batida')}
          >
            <PedraChinesa id={batida} />
            <span className="badge-pedra-agari">{t('calculator.winningTile')}</span>
          </span>
        </div>
        {mao.chamadas.map((chamada, indice) => {
          const tipo = chamada.tipo === 'chi' ? 'chii' : chamada.tipo
          const chaves = pedrasDaChamada(chamada).map(
            (_, posicao) => `chamada-${indice}-${posicao}`,
          )
          const destacada = chaves.some(acesa)
          return (
            <span
              key={`chamada-${indice}`}
              className={`resultado-meld resultado-meld-${tipo}${destacada ? ' destaque-yaku' : acesas ? ' apagada' : ''}`}
              style={{ borderColor: ESTILO_MELD[tipo].borda }}
              aria-label={t(ESTILO_MELD[tipo].rotulo)}
              aria-describedby={destacada ? idDescricao : undefined}
            >
              <PedrasChamada chamada={chamada} />
            </span>
          )
        })}
        {mao.flores.length > 0 && (
          <div
            className={`resultado-grupo-mao mcr-flores-resultado${classeDestaque('flores')}`}
            aria-label={t('mcr.entrada.flores')}
          >
            {mao.flores.map((flor: Flor) => (
              <span key={flor} className="chip-pedra resultado-pedra">
                <PedraFlor flor={flor} />
              </span>
            ))}
          </div>
        )}
      </div>

      {invalida ? (
        <p className="mcr-aviso">
          {t(fan.batida ? 'mcr.resultado.invalida' : 'mcr.resultado.naoBate')}
        </p>
      ) : (
        <p className="mcr-resultado__total">
          {t('mcr.resultado.fanTotal', { total: numero(fan.fanTotal) })}
        </p>
      )}
      {fan.batida && fan.flores > 0 && (
        <p className="mcr-resultado__detalhe">
          {t('mcr.resultado.semFlores', {
            fan: numero(fan.fanSemFlores),
            flores: numero(fan.flores),
          })}
        </p>
      )}

      {fan.batida && (
        <ul className="mcr-lista-fan">
          {linhas.map((linha) => {
            const dados = fanMcrPorId(linha.id)
            const estaAberta = aberta === linha.chave
            const idPainel = `${idDescricao}-${linha.chave}`
            return (
              <li key={linha.chave} className="mcr-lista-fan__item mcr-lista-fan__item--abre">
                <button
                  type="button"
                  className="mcr-lista-fan__botao"
                  aria-expanded={estaAberta}
                  aria-controls={idPainel}
                  onClick={() => setAberta(estaAberta ? null : linha.chave)}
                >
                  <span className="mcr-lista-fan__nome">
                    {nomeDe(linha)}
                    {linha.vezes > 1 &&
                      ` ${t('mcr.resultado.vezes', { vezes: numero(linha.vezes) })}`}
                    <span className="mcr-lista-fan__chines" lang="zh-Hans">
                      {linha.nomeChines}
                    </span>
                  </span>
                  <span className="mcr-lista-fan__valor">{numero(linha.valor * linha.vezes)}</span>
                  <i
                    className={`fas ${estaAberta ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                    aria-hidden="true"
                  />
                </button>
                <div id={idPainel} className="mcr-lista-fan__detalhe" hidden={!estaAberta}>
                  {dados && (
                    <>
                      <p className="mcr-lista-fan__meta">
                        {t('guiaBolso.mcr.pontosFan', { pontos: numero(dados.pontos) })} ·{' '}
                        <span lang="zh-Hans">{dados.hanzi}</span> ·{' '}
                        <span lang="en">{dados.en}</span>
                      </p>
                      <p>{dados.descricao}</p>
                      {dados.observacao && <p>{dados.observacao}</p>}
                      {dados.yakuRiichi && (
                        <span className="fan-mcr__riichi">
                          {t('guiaBolso.mcr.riichi', { yaku: dados.yakuRiichi })}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {pagamento && (
        <>
          <h4 className="mcr-secao__subtitulo">{t('mcr.resultado.pagamentos')}</h4>
          <dl className="mcr-pagamentos">
            <dt>{t('mcr.resultado.vencedorRecebe')}</dt>
            <dd>{t('mcr.resultado.pontos', { pontos: numero(pagamento.ganhadorRecebe) })}</dd>
            {pagamento.pagamentos[0].quem === 'descartador' ? (
              <>
                <dt>{t('mcr.resultado.descartador')}</dt>
                <dd>
                  {t('mcr.resultado.pontos', { pontos: numero(pagamento.pagamentos[0].valor) })}
                </dd>
                <dt>{t('mcr.resultado.outro')}</dt>
                <dd>
                  {t('mcr.resultado.pontos', { pontos: numero(pagamento.pagamentos[1].valor) })}
                </dd>
              </>
            ) : (
              <>
                <dt>{t('mcr.resultado.cadaJogador')}</dt>
                <dd>
                  {t('mcr.resultado.pontos', { pontos: numero(pagamento.pagamentos[0].valor) })}
                </dd>
              </>
            )}
          </dl>
        </>
      )}
    </Modal>
  )
}
