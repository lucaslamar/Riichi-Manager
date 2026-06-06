import { useState, useMemo } from 'react'
import type { EstadoCenterpiece, TipoVitoria, MetodoCalculo, ResultadoRon, ResultadoTsumo } from '../../logica/tipos'
import { calcularPontuacaoHanFu } from '@/dominios/calculadora-han-fu/logica/calcularPontuacaoHanFu'
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

type Passo = 'tipo' | 'vencedor' | 'pagador' | 'calculo' | 'hanfu' | 'manual'

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
  const [metodo, setMetodo] = useState<MetodoCalculo>('hanFu')
  const [passo, setPasso] = useState<Passo>('tipo')
  const [han, setHan] = useState(1)
  const [fu, setFu] = useState(30)
  const [valorManual, setValorManual] = useState('')
  const [valorManualDealer, setValorManualDealer] = useState('')

  const vencedor = estado.jogadores.find((j) => j.id === vencedorId)
  const ehDealer = vencedor?.vento === 'leste'

  const resultadoHanFu = useMemo(() => {
    if (!vencedor) return null
    try {
      return calcularPontuacaoHanFu({
        han,
        fu,
        honba: estado.honba,
        ehDealer: !!ehDealer,
        tipoVitoria,
      })
    } catch {
      return null
    }
  }, [han, fu, estado.honba, ehDealer, tipoVitoria, vencedor])

  const avancarParaVencedor = () => setPasso('vencedor')
  const avancarParaPagador = () => { if (vencedorId) setPasso('pagador') }
  const avancarParaCalculo = () => { if (tipoVitoria === 'ron' ? pagadorId : vencedorId) setPasso('calculo') }
  const avancarParaEntrada = () => { if (metodo === 'hanFu') setPasso('hanfu'); else setPasso('manual') }

  const confirmar = () => {
    if (tipoVitoria === 'ron') {
      let pontos = 0
      if (metodo === 'hanFu' && resultadoHanFu?.ron !== undefined) {
        pontos = resultadoHanFu.ron
      } else {
        pontos = parseInt(valorManual, 10) || 0
      }
      if (!pontos || !vencedorId || !pagadorId) return
      aoRegistrarRon({ vencedorId, pagadorId, pontos })
    } else {
      let pagDealer = 0
      let pagNaoDealer = 0
      if (metodo === 'hanFu' && resultadoHanFu?.tsumo) {
        pagDealer = resultadoHanFu.tsumo.dealer
        pagNaoDealer = resultadoHanFu.tsumo.nonDealer ?? resultadoHanFu.tsumo.dealer
      } else {
        pagDealer = parseInt(valorManualDealer, 10) || 0
        pagNaoDealer = parseInt(valorManual, 10) || 0
      }
      if (!pagDealer || !pagNaoDealer || !vencedorId) return
      aoRegistrarTsumo({ vencedorId, pagamentoDealer: pagDealer, pagamentoNaoDealer: pagNaoDealer })
    }
  }

  const voltar = () => {
    const fluxo: Passo[] = tipoVitoria === 'ron'
      ? ['tipo', 'vencedor', 'pagador', 'calculo', metodo === 'hanFu' ? 'hanfu' : 'manual']
      : ['tipo', 'vencedor', 'calculo', metodo === 'hanFu' ? 'hanfu' : 'manual']
    const idx = fluxo.indexOf(passo)
    if (idx > 0) setPasso(fluxo[idx - 1])
    else aoFechar()
  }

  return (
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
                <button type="button" className="btn-primario" onClick={avancarParaVencedor}>{t('centerpiece.win.next')}</button>
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
                <button type="button" className="btn-primario" onClick={tipoVitoria === 'ron' ? avancarParaPagador : avancarParaCalculo} disabled={!vencedorId}>
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
                <button type="button" className="btn-primario" onClick={avancarParaCalculo} disabled={!pagadorId}>
                  {t('centerpiece.win.next')}
                </button>
              </div>
            </div>
          )}

          {passo === 'calculo' && (
            <div className="modal-secao">
              <p className="modal-label">{t('centerpiece.win.calcMethod')}</p>
              <div className="modal-opcoes-2col">
                <button
                  type="button"
                  className={`opcao-vitoria ${metodo === 'hanFu' ? 'ativa' : ''}`}
                  onClick={() => setMetodo('hanFu')}
                >
                  <i className="fas fa-calculator" aria-hidden="true" />
                  {t('centerpiece.win.byHanFu')}
                </button>
                <button
                  type="button"
                  className={`opcao-vitoria ${metodo === 'manual' ? 'ativa' : ''}`}
                  onClick={() => setMetodo('manual')}
                >
                  <i className="fas fa-pencil" aria-hidden="true" />
                  {t('centerpiece.win.manual')}
                </button>
              </div>
              <div className="modal-rodape-acoes">
                <button type="button" className="btn-contorno" onClick={voltar}>{t('actions.back')}</button>
                <button type="button" className="btn-primario" onClick={avancarParaEntrada}>
                  {t('centerpiece.win.next')}
                </button>
              </div>
            </div>
          )}

          {passo === 'hanfu' && (
            <div className="modal-secao">
              <p className="modal-label">
                {vencedor?.nome} — {tipoVitoria === 'ron' ? 'Ron' : 'Tsumo'}
                {ehDealer ? ` (${t('hanFu.dealer')})` : ` (${t('hanFu.nonDealer')})`}
              </p>
              <div className="hanfu-controles">
                <div className="hanfu-campo">
                  <label>{t('centerpiece.win.han')}</label>
                  <div className="hanfu-stepper">
                    <button type="button" onClick={() => setHan((prev) => Math.max(1, prev - 1))}>−</button>
                    <span>{han}</span>
                    <button type="button" onClick={() => setHan((prev) => Math.min(13, prev + 1))}>+</button>
                  </div>
                </div>
                <div className="hanfu-campo">
                  <label>{t('centerpiece.win.fu')}</label>
                  <div className="hanfu-stepper">
                    <button type="button" onClick={() => setFu((prev) => Math.max(20, prev - 10))}>−</button>
                    <span>{fu}</span>
                    <button type="button" onClick={() => setFu((prev) => Math.min(130, prev + 10))}>+</button>
                  </div>
                </div>
              </div>
              {resultadoHanFu && (
                <div className="hanfu-resultado">
                  <span className="hanfu-categoria">{resultadoHanFu.descricao}</span>
                  <span className="hanfu-valor">{resultadoHanFu.detalhePagamento}</span>
                  {estado.honba > 0 && (
                    <span className="hanfu-honba">
                      {t('hanFu.honbaCount', { count: estado.honba })}
                    </span>
                  )}
                </div>
              )}
              <div className="modal-rodape-acoes">
                <button type="button" className="btn-contorno" onClick={voltar}>{t('actions.back')}</button>
                <button
                  type="button"
                  className="btn-primario"
                  onClick={confirmar}
                  disabled={!resultadoHanFu || (tipoVitoria === 'ron' ? !resultadoHanFu.ron : !resultadoHanFu.tsumo)}
                >
                  {t('centerpiece.win.confirm')}
                </button>
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
                <button type="button" className="btn-primario" onClick={confirmar}>
                  {t('centerpiece.win.confirm')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
