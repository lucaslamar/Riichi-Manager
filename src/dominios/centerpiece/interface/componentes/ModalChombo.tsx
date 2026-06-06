import { useState } from 'react'
import type { EstadoCenterpiece } from '../../logica/tipos'
import { calcularChomboDealer } from '../../logica/aplicarChombo'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

interface PropsModalChombo {
  estado: EstadoCenterpiece
  aoConfirmarPadrao: (jogadorId: string) => void
  aoConfirmarManual: (jogadorId: string, valorPorJogador: number) => void
  aoFechar: () => void
}

const KANJI_VENTO: Record<string, string> = {
  leste: '東', sul: '南', oeste: '西', norte: '北',
}

export default function ModalChombo({
  estado,
  aoConfirmarPadrao,
  aoConfirmarManual,
  aoFechar,
}: PropsModalChombo) {
  const { t } = useI18n()
  const [jogadorId, setJogadorId] = useState<string>('')
  const [tipoPenalidade, setTipoPenalidade] = useState<'padrao' | 'manual'>('padrao')
  const [valorCustom, setValorCustom] = useState('')

  const jogador = estado.jogadores.find((j) => j.id === jogadorId)
  const ehDealer = jogador?.vento === 'leste'
  const chomboInfo = ehDealer !== undefined ? calcularChomboDealer(ehDealer) : null

  const confirmar = () => {
    if (!jogadorId) return
    if (tipoPenalidade === 'padrao') {
      aoConfirmarPadrao(jogadorId)
    } else {
      const valor = parseInt(valorCustom, 10)
      if (!valor || valor <= 0) return
      aoConfirmarManual(jogadorId, valor)
    }
  }

  return (
    <div className="centerpiece-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-chombo-titulo">
      <div className="centerpiece-modal">
        <div className="modal-cabecalho">
          <h3 id="modal-chombo-titulo">{t('centerpiece.chombo.title')}</h3>
          <button type="button" className="modal-fechar" onClick={aoFechar} aria-label={t('actions.close')}>
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-corpo">
          <p className="modal-label">{t('centerpiece.chombo.player')}</p>
          <div className="modal-lista-jogadores">
            {estado.jogadores.map((j) => (
              <button
                key={j.id}
                type="button"
                className={`opcao-jogador ${jogadorId === j.id ? 'ativa' : ''}`}
                onClick={() => setJogadorId(j.id)}
              >
                <span className={`kanji-vento vento-${j.vento}`}>{KANJI_VENTO[j.vento]}</span>
                <span>{j.nome}</span>
                <span className="pontos-jogador">{j.pontos.toLocaleString('pt-BR')}</span>
              </button>
            ))}
          </div>

          {jogadorId && (
            <>
              <p className="modal-label">{t('centerpiece.chombo.penalty')}</p>
              <div className="modal-opcoes-2col">
                <button
                  type="button"
                  className={`opcao-vitoria ${tipoPenalidade === 'padrao' ? 'ativa' : ''}`}
                  onClick={() => setTipoPenalidade('padrao')}
                >
                  {t('centerpiece.chombo.preset')}
                </button>
                <button
                  type="button"
                  className={`opcao-vitoria ${tipoPenalidade === 'manual' ? 'ativa' : ''}`}
                  onClick={() => setTipoPenalidade('manual')}
                >
                  {t('centerpiece.chombo.custom')}
                </button>
              </div>

              {tipoPenalidade === 'padrao' && chomboInfo && (
                <div className="chombo-preview">
                  <p>
                    {ehDealer
                      ? `4.000 pts para cada jogador (total: ${chomboInfo.total.toLocaleString('pt-BR')})`
                      : `4.000 pts ao Leste + 2.000 aos outros (total: ${chomboInfo.total.toLocaleString('pt-BR')})`}
                  </p>
                </div>
              )}

              {tipoPenalidade === 'manual' && (
                <label className="campo-manual">
                  <span>{t('centerpiece.chombo.valuePerPlayer')}</span>
                  <input
                    type="number"
                    value={valorCustom}
                    onChange={(evento) => setValorCustom(evento.target.value)}
                    placeholder="4000"
                    min={0}
                  />
                </label>
              )}
            </>
          )}

          <div className="modal-rodape-acoes">
            <button type="button" className="btn-contorno" onClick={aoFechar}>{t('actions.close')}</button>
            <button
              type="button"
              className="btn-primario btn-perigo"
              onClick={confirmar}
              disabled={!jogadorId || (tipoPenalidade === 'manual' && !valorCustom)}
            >
              {t('centerpiece.chombo.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
