import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { MAXIMO_FLORES } from '../logica/fan-mcr'
import type { CondicoesMcr, Vento } from '../logica/montagem'
import { PEDRA } from '../logica/motor/pedras'
import Segmentado from './Segmentado'

const VENTOS: { valor: Vento; chave: string }[] = [
  { valor: PEDRA.E, chave: 'winds.east' },
  { valor: PEDRA.S, chave: 'winds.south' },
  { valor: PEDRA.W, chave: 'winds.west' },
  { valor: PEDRA.N, chave: 'winds.north' },
]

type CondicaoLigavel = 'ultimaPedra' | 'kan' | 'ultimaDoTipo'

/** Ron ou tsumo, ventos e condições especiais do MCR. */
export default function ControlesCondicoes({
  condicoes,
  aoMudar,
}: {
  condicoes: CondicoesMcr
  aoMudar: <Chave extends keyof CondicoesMcr>(chave: Chave, valor: CondicoesMcr[Chave]) => void
}) {
  const { t, numero } = useI18n()
  const tsumo = condicoes.forma === 'tsumo'
  const ventos = VENTOS.map(({ valor, chave }) => ({ valor, rotulo: t(chave) }))

  const interruptores: { chave: CondicaoLigavel; icone: string; rotulo: string; ajuda?: string }[] = [
    { chave: 'ultimaPedra', icone: 'fa-hourglass-end', rotulo: t(tsumo ? 'mcr.condicoes.ultimaParede' : 'mcr.condicoes.ultimoDescarte') },
    { chave: 'kan', icone: 'fa-layer-group', rotulo: t(tsumo ? 'mcr.condicoes.reposicaoKan' : 'mcr.condicoes.rouboKan') },
    { chave: 'ultimaDoTipo', icone: 'fa-eye', rotulo: t('mcr.condicoes.ultimaDoTipo'), ajuda: t('mcr.condicoes.ultimaDoTipoAjuda') },
  ]

  return (
    <section className="card mcr-secao" aria-labelledby="mcr-condicoes-titulo">
      <h3 id="mcr-condicoes-titulo" className="mcr-secao__titulo">
        {t('mcr.condicoes.titulo')}
      </h3>

      <span className="mcr-rotulo">{t('mcr.condicoes.forma')}</span>
      <Segmentado
        rotulo={t('mcr.condicoes.forma')}
        valor={condicoes.forma}
        aoMudar={(forma) => aoMudar('forma', forma)}
        opcoes={[
          { valor: 'ron', rotulo: t('mcr.condicoes.ron') },
          { valor: 'tsumo', rotulo: t('mcr.condicoes.tsumo') },
        ]}
      />

      <span className="mcr-rotulo">{t('mcr.condicoes.ventoRodada')}</span>
      <Segmentado
        rotulo={t('mcr.condicoes.ventoRodada')}
        valor={condicoes.ventoRodada}
        aoMudar={(vento) => aoMudar('ventoRodada', vento)}
        opcoes={ventos}
      />

      <span className="mcr-rotulo">{t('mcr.condicoes.ventoAssento')}</span>
      <Segmentado
        rotulo={t('mcr.condicoes.ventoAssento')}
        valor={condicoes.ventoAssento}
        aoMudar={(vento) => aoMudar('ventoAssento', vento)}
        opcoes={ventos}
      />

      <div className="mcr-interruptores">
        {interruptores.map(({ chave, icone, rotulo, ajuda }) => (
          <button
            key={chave}
            type="button"
            role="switch"
            aria-checked={condicoes[chave]}
            className="cartao-regras cartao-regras--switch"
            onClick={() => aoMudar(chave, !condicoes[chave])}
          >
            <i className={`fas ${icone} cartao-regras__icone`} aria-hidden="true" />
            <span className="cartao-regras__texto">
              <strong>{rotulo}</strong>
              {ajuda && <span>{ajuda}</span>}
            </span>
            <span className="interruptor" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="mcr-flores">
        <span className="cartao-regras__texto">
          <strong>{t('mcr.condicoes.flores')}</strong>
          <span>{t('mcr.condicoes.floresAjuda')}</span>
        </span>
        <div className="mcr-flores__controle">
          <button
            type="button"
            className="btn-contorno mcr-flores__botao"
            aria-label={t('mcr.condicoes.menosFlor')}
            disabled={condicoes.flores === 0}
            onClick={() => aoMudar('flores', condicoes.flores - 1)}
          >
            <i className="fas fa-minus" aria-hidden="true" />
          </button>
          <output className="mcr-flores__valor" aria-live="polite">
            {numero(condicoes.flores)}
          </output>
          <button
            type="button"
            className="btn-contorno mcr-flores__botao"
            aria-label={t('mcr.condicoes.maisFlor')}
            disabled={condicoes.flores === MAXIMO_FLORES}
            onClick={() => aoMudar('flores', condicoes.flores + 1)}
          >
            <i className="fas fa-plus" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
