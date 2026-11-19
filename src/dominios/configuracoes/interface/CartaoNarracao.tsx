import { useId } from 'react'
import {
  falar,
  VELOCIDADE_MAXIMA,
  VELOCIDADE_MINIMA,
  vozDisponivel,
  type NomesPedrasNarracao,
  type SaidaNarracao,
} from '@/compartilhado/adaptadores/voz'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useConfigNarracao } from '@/compartilhado/interface/narracao/useNarracao'
import { descreverPedraNarracao } from '@/dominios/calculadora-mao/interface/narracao/narrarMao'
import { CartaoSwitch } from './ListaAjustesApp'

const NOMES_PEDRAS: { valor: NomesPedrasNarracao; chave: string }[] = [
  { valor: 'pt', chave: 'pages.narrationTilesPt' },
  { valor: 'ja', chave: 'pages.narrationTilesJa' },
]
const SAIDAS: { valor: SaidaNarracao; chave: string }[] = [
  { valor: 'voz', chave: 'pages.narrationOutputVoice' },
  { valor: 'leitor', chave: 'pages.narrationOutputReader' },
]

/** Narração por voz: liga, velocidade, saída (voz do app ou leitor) e nomes das pedras. */
export default function CartaoNarracao() {
  const { t, numero } = useI18n()
  const { config, alterar } = useConfigNarracao()
  const temVoz = vozDisponivel()
  const idVelocidade = useId()
  const idSaida = useId()
  const idPedras = useId()
  const nomeSaida = useId()
  const nomePedras = useId()
  const velocidade = `${numero(config.velocidade)}x`

  return (
    <>
      <CartaoSwitch
        icone="fa-volume-high"
        titulo={t('pages.narration')}
        descricao={t('pages.narrationHelp')}
        ligado={config.ativa}
        aoMudar={(ativa) => alterar({ ativa })}
      />
      {config.ativa && (
        <div className="cartao-regras cartao-regras--empilhado">
          <i className="fas fa-sliders cartao-regras__icone" aria-hidden="true" />
          <span className="cartao-regras__texto">
            <span>{t('pages.narrationShortcuts')}</span>
            {!temVoz && <span>{t('pages.narrationNoVoice')}</span>}
          </span>
          <div className="cartao-narracao__opcoes">
            {temVoz && (
              <>
                <label className="cartao-regras__texto" htmlFor={idVelocidade}>
                  <strong>
                    {t('pages.narrationSpeed')}: {velocidade}
                  </strong>
                </label>
                <input
                  id={idVelocidade}
                  type="range"
                  min={VELOCIDADE_MINIMA}
                  max={VELOCIDADE_MAXIMA}
                  step={0.1}
                  value={config.velocidade}
                  aria-valuetext={velocidade}
                  onChange={(evento) => alterar({ velocidade: Number(evento.target.value) })}
                />
                <div role="radiogroup" aria-labelledby={idSaida} aria-describedby={`${idSaida}-ajuda`}>
                  <strong id={idSaida}>{t('pages.narrationOutput')}</strong>
                  <span id={`${idSaida}-ajuda`} className="cartao-regras__texto">
                    <span>{t('pages.narrationOutputHelp')}</span>
                  </span>
                  <div className="segmentos-tema">
                    {SAIDAS.map((opcao) => (
                      <label key={opcao.valor} className="segmento-tema">
                        <input
                          type="radio"
                          name={nomeSaida}
                          checked={config.saida === opcao.valor}
                          onChange={() => alterar({ saida: opcao.valor })}
                        />
                        <span>{t(opcao.chave)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div role="radiogroup" aria-labelledby={idPedras}>
              <strong id={idPedras}>{t('pages.narrationTileNames')}</strong>
              <div className="segmentos-tema">
                {NOMES_PEDRAS.map((opcao) => (
                  <label key={opcao.valor} className="segmento-tema">
                    <input
                      type="radio"
                      name={nomePedras}
                      checked={config.idiomaPedras === opcao.valor}
                      onChange={() => alterar({ idiomaPedras: opcao.valor })}
                    />
                    <span>{t(opcao.chave)}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn-contorno"
              onClick={() =>
                falar(
                  ['0s', '7z'].map((pedra) => descreverPedraNarracao(pedra, config.idiomaPedras, t)).join(', '),
                )
              }
            >
              {t('pages.narrationTest')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
