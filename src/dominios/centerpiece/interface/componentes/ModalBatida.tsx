import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  CADEIRAS,
  KANJI_VENTO,
  ventoDaCadeira,
  type Cadeira,
  type Partida,
} from '../../logica/partida'
import { MAXIMO_VENCEDORES, type EstadoBatida, type PassoBatida } from '../hooks/estadoBatida'
import type { NomeDaCadeira } from './ModaisPartida'

/** Registro de batida em etapas, com indicador 1/4. */
export default function ModalBatida({
  partida,
  batida,
  nomeDe,
  aoMudar,
  aoAplicar,
  aoFechar,
}: {
  partida: Partida
  batida: EstadoBatida
  nomeDe: NomeDaCadeira
  aoMudar: (proxima: EstadoBatida) => void
  aoAplicar: () => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const { placar, config } = partida
  const { tipo, passo, vencedorAtual, pagador, vencedores } = batida

  const etapas: PassoBatida[] =
    tipo === 'ron'
      ? ['tipo', 'vencedor', 'pagador', 'calculo', 'confirmacao']
      : ['tipo', 'vencedor', 'calculo', 'confirmacao']
  const indice = etapas.indexOf(passo)

  const voltar = () => {
    // Vencedor extra: volta para a confirmação, com quem já foi calculado.
    if (vencedores.length > 0 && passo !== 'confirmacao') {
      aoMudar({ ...batida, passo: 'confirmacao', vencedorAtual: null })
    } else if (passo === 'confirmacao') {
      aoMudar({ ...batida, passo: 'calculo', vencedorAtual: vencedores[0].cadeira, vencedores: [] })
    } else if (indice > 0) {
      aoMudar({ ...batida, passo: etapas[indice - 1] })
    } else {
      aoFechar()
    }
  }

  const Jogador = ({
    cadeira,
    ativo,
    bloqueado,
    aoTocar,
  }: {
    cadeira: Cadeira
    ativo: boolean
    bloqueado?: boolean
    aoTocar: () => void
  }) => (
    <button
      type="button"
      className={`ptd-opcao${ativo ? ' ptd-opcao--ativa' : ''}`}
      aria-pressed={ativo}
      disabled={bloqueado}
      onClick={aoTocar}
    >
      <span aria-hidden="true">{KANJI_VENTO[ventoDaCadeira(cadeira, placar.cadeiraDealer)]}</span>
      <span className="ptd-opcao-nome">{nomeDe(cadeira)}</span>
      <span className="ptd-opcao-valor">{numero(placar.pontos[cadeira])}</span>
    </button>
  )

  const jaVenceu = (cadeira: Cadeira) => vencedores.some((item) => item.cadeira === cadeira)
  const podeAdicionar =
    tipo === 'ron' &&
    vencedores.length < MAXIMO_VENCEDORES[config.ronMultiplo] &&
    vencedores.length < 3

  const totalRecebido = (item: EstadoBatida['vencedores'][number]) => {
    const { resultado, cadeira } = item
    if (resultado.tipoVitoria === 'ron') return resultado.pontosRon ?? 0
    const ehDealer = cadeira === placar.cadeiraDealer
    return ehDealer
      ? (resultado.pagamentoNaoDealer ?? 0) * 3
      : (resultado.pagamentoDealer ?? 0) + (resultado.pagamentoNaoDealer ?? 0) * 2
  }

  const proximoHabilitado =
    passo === 'tipo' ||
    (passo === 'vencedor' && vencedorAtual !== null) ||
    (passo === 'pagador' && pagador !== null)
  const proximo = () => {
    if (passo === 'vencedor' && vencedores.length > 0) {
      aoMudar({ ...batida, passo: 'calculo' })
    } else {
      aoMudar({ ...batida, passo: etapas[indice + 1] })
    }
  }

  return (
    <Modal
      titulo={t('match.win.title')}
      subtitulo={t('match.win.step', { current: indice + 1, total: etapas.length })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={voltar}>
            {t('actions.back')}
          </button>
          {passo === 'confirmacao' ? (
            <button type="button" className="btn-primario" onClick={aoAplicar}>
              {t('match.win.apply')}
            </button>
          ) : (
            passo !== 'calculo' && (
              <button
                type="button"
                className="btn-primario"
                disabled={!proximoHabilitado}
                onClick={proximo}
              >
                {t('match.win.next')}
              </button>
            )
          )}
        </div>
      }
    >
      {passo === 'tipo' && (
        <>
          <p className="ptd-rotulo">{t('match.win.type')}</p>
          <div className="ptd-segmentos">
            {(['ron', 'tsumo'] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                className={`ptd-segmento${tipo === opcao ? ' ptd-segmento--ativo' : ''}`}
                aria-pressed={tipo === opcao}
                onClick={() => aoMudar({ ...batida, tipo: opcao })}
              >
                {t(`calculator.${opcao}`)}
              </button>
            ))}
          </div>
        </>
      )}

      {passo === 'vencedor' && (
        <>
          <p className="ptd-rotulo">{t('match.win.winner')}</p>
          <div className="ptd-lista-opcoes">
            {CADEIRAS.map((cadeira) => (
              <Jogador
                key={cadeira}
                cadeira={cadeira}
                ativo={vencedorAtual === cadeira}
                bloqueado={cadeira === pagador || jaVenceu(cadeira)}
                aoTocar={() => aoMudar({ ...batida, vencedorAtual: cadeira })}
              />
            ))}
          </div>
        </>
      )}

      {passo === 'pagador' && (
        <>
          <p className="ptd-rotulo">{t('match.win.payer')}</p>
          <div className="ptd-lista-opcoes">
            {CADEIRAS.filter((cadeira) => cadeira !== vencedorAtual).map((cadeira) => (
              <Jogador
                key={cadeira}
                cadeira={cadeira}
                ativo={pagador === cadeira}
                aoTocar={() => aoMudar({ ...batida, pagador: cadeira })}
              />
            ))}
          </div>
        </>
      )}

      {passo === 'calculo' && (
        <>
          <p className="ptd-rotulo">
            {t('match.win.howToScore', { name: vencedorAtual !== null ? nomeDe(vencedorAtual) : '' })}
          </p>
          <div className="ptd-lista-opcoes">
            <button
              type="button"
              className="ptd-opcao"
              onClick={() => aoMudar({ ...batida, calculadora: 'hanFu' })}
            >
              <i className="fas fa-calculator" aria-hidden="true" />
              {t('match.win.byHanFu')}
            </button>
            <button
              type="button"
              className="ptd-opcao"
              onClick={() => aoMudar({ ...batida, calculadora: 'mao' })}
            >
              <i className="fas fa-hand" aria-hidden="true" />
              {t('match.win.byHand')}
            </button>
          </div>
        </>
      )}

      {passo === 'confirmacao' && (
        <>
          <p className="ptd-rotulo">{t(`calculator.${tipo}`)}</p>
          <ul className="ptd-linhas">
            {pagador !== null && (
              <li>
                <span>{t('match.win.paidBy')}</span>
                <strong>{nomeDe(pagador)}</strong>
              </li>
            )}
            {vencedores.map((item) => (
              <li key={item.cadeira}>
                <span>
                  {nomeDe(item.cadeira)}
                  {item.resultado.han != null && item.resultado.fu != null
                    ? ` · ${t('calculator.hanFuSummary', { han: item.resultado.han, fu: item.resultado.fu })}`
                    : ''}
                </span>
                <strong className="ptd-positivo">+{numero(totalRecebido(item))}</strong>
              </li>
            ))}
            {placar.palitos > 0 && (
              <li>
                <span>{t('match.win.sticks')}</span>
                <strong>+{numero(placar.palitos * 1000)}</strong>
              </li>
            )}
          </ul>
          {podeAdicionar && (
            <button
              type="button"
              className="btn-contorno ptd-btn-largo"
              onClick={() => aoMudar({ ...batida, passo: 'vencedor', vencedorAtual: null })}
            >
              <i className="fas fa-plus" aria-hidden="true" />
              {t('match.win.addWinner')}
            </button>
          )}
        </>
      )}
    </Modal>
  )
}
