import { useState } from 'react'
import type { EstadoCenterpiece, TipoVitoria, ResultadoRon, ResultadoTsumo } from '../../logica/tipos'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'
import PaginaCalculadoraHanFu from '@/dominios/calculadora-han-fu/interface/paginas/PaginaCalculadoraHanFu'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

interface PropsModalRegistrarBatida {
  estado: EstadoCenterpiece
  aoRegistrarRon: (r: ResultadoRon) => void
  aoRegistrarTsumo: (r: ResultadoTsumo) => void
  aoFechar: () => void
}

const KANJI_VENTO: Record<string, string> = {
  leste: '東', sul: '南', oeste: '西', norte: '北',
}

type Passo = 'tipo' | 'vencedor' | 'pagador' | 'calculo' | 'calculadoraHanFu' | 'calculadoraMao' | 'manual' | 'confirmacao'

export default function ModalRegistrarBatida({
  estado,
  aoRegistrarRon,
  aoRegistrarTsumo,
  aoFechar,
}: PropsModalRegistrarBatida) {
  const { t } = useI18n()
  const [tipoVitoria, setTipoVitoria] = useState<TipoVitoria>('ron')
  const [vencedorId, setVencedorId] = useState<string>('')
  const [pagadorId, setPagadorId] = useState<string>('')
  const [passo, setPasso] = useState<Passo>('tipo')
  const [resultadoCalculo, setResultadoCalculo] = useState<ResultadoCalculoParaCenterpiece | null>(null)
  const [valorManual, setValorManual] = useState('')
  const [valorManualDealer, setValorManualDealer] = useState('')

  const vencedor = estado.jogadores.find((j) => j.id === vencedorId)
  const pagador = estado.jogadores.find((j) => j.id === pagadorId)
  const ehDealer = vencedor?.vento === 'leste'

  const irPara = (proximo: Passo) => setPasso(proximo)

  const voltar = () => {
    const fluxo: Passo[] =
      tipoVitoria === 'ron'
        ? ['tipo', 'vencedor', 'pagador', 'calculo']
        : ['tipo', 'vencedor', 'calculo']
    const idx = fluxo.indexOf(passo)
    if (idx > 0) {
      setPasso(fluxo[idx - 1])
    } else if (passo === 'calculadoraHanFu' || passo === 'calculadoraMao' || passo === 'manual') {
      setPasso('calculo')
    } else if (passo === 'confirmacao') {
      setPasso('calculo')
      setResultadoCalculo(null)
    } else {
      aoFechar()
    }
  }

  const receberResultado = (resultado: ResultadoCalculoParaCenterpiece) => {
    if (tipoVitoria !== resultado.tipoVitoria) return
    setResultadoCalculo(resultado)
    setPasso('confirmacao')
  }

  const confirmar = () => {
    if (tipoVitoria === 'ron') {
      let pontos = resultadoCalculo?.pontosRon ?? parseInt(valorManual, 10)
      if (!pontos || !vencedorId || !pagadorId) return
      aoRegistrarRon({ vencedorId, pagadorId, pontos })
    } else {
      let pagDealer = resultadoCalculo?.pagamentoDealer ?? parseInt(valorManualDealer, 10)
      let pagNaoDealer = resultadoCalculo?.pagamentoNaoDealer ?? parseInt(valorManual, 10)
      if (pagDealer == null || !pagNaoDealer || !vencedorId) return
      aoRegistrarTsumo({ vencedorId, pagamentoDealer: pagDealer, pagamentoNaoDealer: pagNaoDealer })
    }
  }

  const confirmarManual = () => {
    if (tipoVitoria === 'ron') {
      const pontos = parseInt(valorManual, 10)
      if (!pontos || !vencedorId || !pagadorId) return
      aoRegistrarRon({ vencedorId, pagadorId, pontos })
    } else {
      const pagDealer = parseInt(valorManualDealer, 10) || 0
      const pagNaoDealer = parseInt(valorManual, 10) || 0
      if (!pagNaoDealer || !vencedorId) return
      aoRegistrarTsumo({ vencedorId, pagamentoDealer: pagDealer, pagamentoNaoDealer: pagNaoDealer })
    }
  }

  const mostrarOverlayCalc = passo === 'calculadoraHanFu' || passo === 'calculadoraMao'

  return (
    <>
      <div className="centerpiece-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-batida-titulo">
        <div className="centerpiece-modal">
          <div className="modal-cabecalho">
            <h3 id="modal-batida-titulo">{t('centerpiece.win.title')}</h3>
            <button type="button" className="modal-fechar" onClick={aoFechar} aria-label={t('actions.close')}>
              <i className="fas fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div className="modal-corpo">
            {passo === 'tipo' && (
              <div className="modal-secao">
                <p className="modal-label">{t('centerpiece.win.type')}</p>
                <div className="modal-opcoes-2col">
                  <button
                    type="button"
                    className={`opcao-vitoria ${tipoVitoria === 'ron' ? 'ativa' : ''}`}
                    onClick={() => setTipoVitoria('ron')}
                  >
                    Ron
                  </button>
                  <button
                    type="button"
                    className={`opcao-vitoria ${tipoVitoria === 'tsumo' ? 'ativa' : ''}`}
                    onClick={() => setTipoVitoria('tsumo')}
                  >
                    Tsumo
                  </button>
                </div>
                <div className="modal-rodape-acoes">
                  <button type="button" className="btn-contorno" onClick={aoFechar}>{t('actions.back')}</button>
                  <button type="button" className="btn-primario" onClick={() => irPara('vencedor')}>{t('centerpiece.win.next')}</button>
                </div>
              </div>
            )}

            {passo === 'vencedor' && (
              <div className="modal-secao">
                <p className="modal-label">{t('centerpiece.win.winner')}</p>
                <div className="modal-lista-jogadores">
                  {estado.jogadores.map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      className={`opcao-jogador ${vencedorId === j.id ? 'ativa' : ''}`}
                      onClick={() => setVencedorId(j.id)}
                    >
                      <span className={`kanji-vento vento-${j.vento}`}>{KANJI_VENTO[j.vento]}</span>
                      <span>{j.nome}</span>
                      <span className="pontos-jogador">{j.pontos.toLocaleString('pt-BR')}</span>
                    </button>
                  ))}
                </div>
                <div className="modal-rodape-acoes">
                  <button type="button" className="btn-contorno" onClick={voltar}>{t('actions.back')}</button>
                  <button type="button" className="btn-primario" onClick={() => irPara(tipoVitoria === 'ron' ? 'pagador' : 'calculo')} disabled={!vencedorId}>
                    {t('centerpiece.win.next')}
                  </button>
                </div>
              </div>
            )}

            {passo === 'pagador' && tipoVitoria === 'ron' && (
              <div className="modal-secao">
                <p className="modal-label">{t('centerpiece.win.payer')}</p>
                <div className="modal-lista-jogadores">
                  {estado.jogadores.filter((j) => j.id !== vencedorId).map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      className={`opcao-jogador ${pagadorId === j.id ? 'ativa' : ''}`}
                      onClick={() => setPagadorId(j.id)}
                    >
                      <span className={`kanji-vento vento-${j.vento}`}>{KANJI_VENTO[j.vento]}</span>
                      <span>{j.nome}</span>
                      <span className="pontos-jogador">{j.pontos.toLocaleString('pt-BR')}</span>
                    </button>
                  ))}
                </div>
                <div className="modal-rodape-acoes">
                  <button type="button" className="btn-contorno" onClick={voltar}>{t('actions.back')}</button>
                  <button type="button" className="btn-primario" onClick={() => irPara('calculo')} disabled={!pagadorId}>
                    {t('centerpiece.win.next')}
                  </button>
                </div>
              </div>
            )}

            {passo === 'calculo' && (
              <div className="modal-secao">
                <p className="modal-label">{t('centerpiece.win.calcMethod')}</p>
                <div className="modal-opcoes-calcular">
                  <button type="button" className="opcao-vitoria opcao-calc" onClick={() => irPara('calculadoraHanFu')}>
                    <i className="fas fa-calculator" aria-hidden="true" />
                    {t('centerpiece.win.byHanFu')}
                  </button>
                  <button type="button" className="opcao-vitoria opcao-calc" onClick={() => irPara('calculadoraMao')}>
                    <i className="fas fa-hand" aria-hidden="true" />
                    {t('centerpiece.win.byMao')}
                  </button>
                  <button type="button" className="opcao-vitoria opcao-calc" onClick={() => irPara('manual')}>
                    <i className="fas fa-pencil" aria-hidden="true" />
                    {t('centerpiece.win.manual')}
                  </button>
                </div>
                <div className="modal-rodape-acoes">
                  <button type="button" className="btn-contorno" onClick={voltar}>{t('actions.back')}</button>
                </div>
              </div>
            )}

            {passo === 'manual' && (
              <div className="modal-secao">
                <p className="modal-label">
                  {vencedor?.nome} — {tipoVitoria === 'ron' ? 'Ron' : 'Tsumo'}
                </p>
                {tipoVitoria === 'ron' ? (
                  <label className="campo-manual">
                    <span>{t('centerpiece.win.value')}</span>
                    <input
                      type="number"
                      value={valorManual}
                      onChange={(evento) => setValorManual(evento.target.value)}
                      placeholder="8000"
                      min={0}
                    />
                  </label>
                ) : (
                  <>
                    <label className="campo-manual">
                      <span>{t('centerpiece.win.valueDealer')}</span>
                      <input
                        type="number"
                        value={valorManualDealer}
                        onChange={(evento) => setValorManualDealer(evento.target.value)}
                        placeholder="4000"
                        min={0}
                      />
                    </label>
                    <label className="campo-manual">
                      <span>{t('centerpiece.win.valueNonDealer')}</span>
                      <input
                        type="number"
                        value={valorManual}
                        onChange={(evento) => setValorManual(evento.target.value)}
                        placeholder="2000"
                        min={0}
                      />
                    </label>
                  </>
                )}
                <div className="modal-rodape-acoes">
                  <button type="button" className="btn-contorno" onClick={voltar}>{t('actions.back')}</button>
                  <button
                    type="button"
                    className="btn-primario"
                    onClick={confirmarManual}
                    disabled={tipoVitoria === 'ron' ? !valorManual : !valorManual && !valorManualDealer}
                  >
                    {t('centerpiece.win.confirm')}
                  </button>
                </div>
              </div>
            )}

            {passo === 'confirmacao' && resultadoCalculo && (
              <div className="modal-secao">
                <p className="modal-label">{t('centerpiece.win.summaryTitle')}</p>
                <div className="cp-confirmacao-resumo">
                  <div className="cp-confirmacao-linha">
                    <span className="cp-conf-label">{t('centerpiece.win.winner')}</span>
                    <span className="cp-conf-valor">
                      <span className={`kanji-vento vento-${vencedor?.vento}`}>{vencedor ? KANJI_VENTO[vencedor.vento] : ''}</span>
                      {vencedor?.nome}
                    </span>
                  </div>
                  <div className="cp-confirmacao-linha">
                    <span className="cp-conf-label">{t('centerpiece.win.type')}</span>
                    <span className="cp-conf-valor">{tipoVitoria === 'ron' ? 'Ron' : 'Tsumo'}</span>
                  </div>
                  {tipoVitoria === 'ron' && pagador && (
                    <div className="cp-confirmacao-linha">
                      <span className="cp-conf-label">{t('centerpiece.win.payer')}</span>
                      <span className="cp-conf-valor">
                        <span className={`kanji-vento vento-${pagador.vento}`}>{KANJI_VENTO[pagador.vento]}</span>
                        {pagador.nome}
                      </span>
                    </div>
                  )}
                  {resultadoCalculo.han != null && resultadoCalculo.fu != null && (
                    <div className="cp-confirmacao-linha">
                      <span className="cp-conf-label">Han / Fu</span>
                      <span className="cp-conf-valor">{resultadoCalculo.han} han / {resultadoCalculo.fu} fu</span>
                    </div>
                  )}
                  {resultadoCalculo.categoria && (
                    <div className="cp-confirmacao-linha">
                      <span className="cp-conf-label">Categoria</span>
                      <span className="cp-conf-valor">{resultadoCalculo.categoria}</span>
                    </div>
                  )}
                  {tipoVitoria === 'ron' && resultadoCalculo.pontosRon != null && (
                    <div className="cp-confirmacao-linha destaque">
                      <span className="cp-conf-label">{t('centerpiece.win.value')}</span>
                      <span className="cp-conf-valor">{resultadoCalculo.pontosRon.toLocaleString('pt-BR')} pts</span>
                    </div>
                  )}
                  {tipoVitoria === 'tsumo' && (
                    <>
                      {!ehDealer && resultadoCalculo.pagamentoDealer != null && (
                        <div className="cp-confirmacao-linha">
                          <span className="cp-conf-label">{t('centerpiece.win.valueDealer')}</span>
                          <span className="cp-conf-valor">{resultadoCalculo.pagamentoDealer.toLocaleString('pt-BR')} pts</span>
                        </div>
                      )}
                      {resultadoCalculo.pagamentoNaoDealer != null && (
                        <div className="cp-confirmacao-linha destaque">
                          <span className="cp-conf-label">{ehDealer ? 'Cada jogador paga' : t('centerpiece.win.valueNonDealer')}</span>
                          <span className="cp-conf-valor">{resultadoCalculo.pagamentoNaoDealer.toLocaleString('pt-BR')} pts</span>
                        </div>
                      )}
                    </>
                  )}
                  {estado.riichiSticks > 0 && (
                    <div className="cp-confirmacao-linha">
                      <span className="cp-conf-label">Riichi sticks</span>
                      <span className="cp-conf-valor">+{(estado.riichiSticks * 1000).toLocaleString('pt-BR')} pts</span>
                    </div>
                  )}
                </div>
                <div className="modal-rodape-acoes">
                  <button type="button" className="btn-contorno" onClick={() => { setPasso('calculo'); setResultadoCalculo(null) }}>
                    {t('centerpiece.win.recalculate')}
                  </button>
                  <button type="button" className="btn-primario" onClick={confirmar}>
                    {t('centerpiece.win.applyResult')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrarOverlayCalc && (
        <div className="cp-calc-overlay" role="dialog" aria-modal="true">
          <div className="cp-calc-overlay-header">
            <button type="button" className="btn-contorno cp-calc-voltar" onClick={() => irPara('calculo')}>
              <i className="fas fa-arrow-left" aria-hidden="true" />
              {t('actions.back')}
            </button>
            <span className="cp-calc-titulo">
              {passo === 'calculadoraHanFu' ? t('centerpiece.win.byHanFu') : t('centerpiece.win.byMao')}
              {vencedor && (
                <> — {vencedor.nome} ({tipoVitoria === 'ron' ? 'Ron' : 'Tsumo'}){ehDealer ? ' · Leste' : ''}</>
              )}
            </span>
          </div>
          <div className="cp-calc-conteudo">
            {passo === 'calculadoraHanFu' && (
              <PaginaCalculadoraHanFu
                aoUsarResultado={receberResultado}
                initialIsOya={ehDealer}
                initialAgari={tipoVitoria}
                initialHonba={estado.honba}
              />
            )}
            {passo === 'calculadoraMao' && (
              <PaginaCalculadoraMao aoUsarResultado={receberResultado} />
            )}
          </div>
        </div>
      )}
    </>
  )
}
