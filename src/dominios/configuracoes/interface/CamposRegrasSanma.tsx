import { useId, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useConfigSanma } from '@/compartilhado/configuracoes/useConfigSanma'
import { REGRAS_SANMA_PADRAO, type ModoPagamentoTsumo, type RegrasSanma } from '@/compartilhado/mahjong/variante'
import './pagina-regras.css'

type CampoNumero = 'pontosIniciais' | 'pontosRetorno' | 'honbaRon' | 'honbaTsumoPorJogador' | 'notenTotal'

const CAMPOS_NUMERO: { campo: CampoNumero; chave: string; passo: number }[] = [
  { campo: 'pontosIniciais', chave: 'sanma.pontosIniciais', passo: 1000 },
  { campo: 'pontosRetorno', chave: 'sanma.pontosRetorno', passo: 1000 },
  { campo: 'honbaRon', chave: 'sanma.honbaRon', passo: 100 },
  { campo: 'honbaTsumoPorJogador', chave: 'sanma.honbaTsumo', passo: 100 },
  { campo: 'notenTotal', chave: 'sanma.notenTotal', passo: 1000 },
]

const MODOS_TSUMO: { valor: ModoPagamentoTsumo; chave: string }[] = [
  { valor: 'tsumo-son', chave: 'sanma.tsumoSon' },
  { valor: 'divisao-norte', chave: 'sanma.divisaoNorte' },
]

/**
 * Regras de Sanma (Kita, pagamento do tsumo, pontos, Uma, honba e noten), com
 * Restaurar padrão. Aparecem embaixo de Jogadores quando a regra está em 3 jogadores.
 */
export default function CamposRegrasSanma() {
  const { t } = useI18n()
  const { regrasSanma, setRegrasSanma } = useConfigSanma()
  const [confirmando, setConfirmando] = useState(false)
  const idTituloTsumo = useId()
  const nomeTsumo = useId()

  const alterar = <Campo extends keyof RegrasSanma>(campo: Campo, valor: RegrasSanma[Campo]) =>
    setRegrasSanma({ ...regrasSanma, [campo]: valor })

  const numeroDe = (texto: string, reserva: number) => {
    const valor = Number(texto)
    return texto.trim() !== '' && Number.isFinite(valor) ? valor : reserva
  }

  return (
    <>
      <div className="regras-sanma">
          <strong className="regras-sanma__titulo">{t('sanma.regrasTitulo')}</strong>
          <div className="regras-sanma__corpo">
            <label className="regras-sanma__check">
              <input
                type="checkbox"
                checked={regrasSanma.kitaNukidora}
                onChange={(evento) => alterar('kitaNukidora', evento.target.checked)}
              />
              <span>{t('sanma.kitaNukidora')}</span>
            </label>
            <label className="regras-sanma__check">
              <input
                type="checkbox"
                checked={regrasSanma.norteYakuhai}
                onChange={(evento) => alterar('norteYakuhai', evento.target.checked)}
              />
              <span>{t('sanma.norteYakuhai')}</span>
            </label>

            <div role="radiogroup" aria-labelledby={idTituloTsumo} className="regras-sanma__grupo">
              <strong id={idTituloTsumo}>{t('sanma.pagamentoTsumo')}</strong>
              {MODOS_TSUMO.map((modo) => (
                <label key={modo.valor} className="regras-sanma__check">
                  <input
                    type="radio"
                    name={nomeTsumo}
                    checked={regrasSanma.pagamentoTsumo === modo.valor}
                    onChange={() => alterar('pagamentoTsumo', modo.valor)}
                  />
                  <span>{t(modo.chave)}</span>
                </label>
              ))}
            </div>

            {CAMPOS_NUMERO.map(({ campo, chave, passo }) => (
              <label key={campo} className="regras-sanma__numero">
                <span>{t(chave)}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  step={passo}
                  value={regrasSanma[campo]}
                  onChange={(evento) => alterar(campo, numeroDe(evento.target.value, regrasSanma[campo]))}
                />
              </label>
            ))}

            <fieldset className="regras-sanma__uma">
              <legend>{t('sanma.uma')}</legend>
              {regrasSanma.uma.map((valor, indice) => (
                <label key={indice} className="regras-sanma__numero">
                  <span>{t('sanma.umaPosicao', { posicao: indice + 1 })}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={valor}
                    onChange={(evento) => {
                      const uma = [...regrasSanma.uma] as RegrasSanma['uma']
                      uma[indice] = numeroDe(evento.target.value, valor)
                      alterar('uma', uma)
                    }}
                  />
                </label>
              ))}
            </fieldset>

            <button type="button" className="btn-contorno regras-sanma__restaurar" onClick={() => setConfirmando(true)}>
              {t('sanma.restaurarPadrao')}
            </button>
          </div>
      </div>

      {confirmando && (
        <Modal
          titulo={t('sanma.restaurarPadrao')}
          aoFechar={() => setConfirmando(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          rodape={
            <div className="regras-sanma__acoes">
              <button type="button" className="btn-contorno" onClick={() => setConfirmando(false)}>
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                className="btn-primario"
                onClick={() => {
                  setRegrasSanma({ ...REGRAS_SANMA_PADRAO, uma: [...REGRAS_SANMA_PADRAO.uma] })
                  setConfirmando(false)
                }}
              >
                {t('sanma.restaurarPadrao')}
              </button>
            </div>
          }
        >
          <p>{t('sanma.restaurarConfirmacao')}</p>
        </Modal>
      )}
    </>
  )
}
