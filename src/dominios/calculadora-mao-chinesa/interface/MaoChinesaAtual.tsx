import type { ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { ChipMeldMao } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/ChipMeldMao'
import {
  GradePedrasMao,
  PedraMao,
} from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraMao'
import { PedrasMeld } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import { ESTILO_MELD } from '@/dominios/calculadora-mao/interface/constantes'
import { pedrasContadas, pedrasDaChamada, type MaoChinesa } from '../logica/montagem'
import { PedraFlor } from './PedraFlor'
import { codigoPedra, nomePedra } from './pedras'

/**
 * A mão montada, com o mesmo visual da Calculadora de Mão japonesa: pedras soltas,
 * conjuntos e, no MCR, as flores. Na montagem um toque remove; na finalização,
 * tocar numa pedra a escolhe como a da batida.
 */
export default function MaoChinesaAtual({
  mao,
  contexto,
  acoesCabecalho,
  aoTocarPedra,
  aoRemoverChamada,
  aoRemoverFlor,
  aoLimpar,
}: {
  mao: MaoChinesa
  contexto: 'montagem' | 'finalizacao'
  acoesCabecalho?: ReactNode
  aoTocarPedra: (indice: number) => void
  aoRemoverChamada: (indice: number) => void
  aoRemoverFlor: (flor: MaoChinesa['flores'][number]) => void
  aoLimpar: () => void
}) {
  const { t } = useI18n()
  const total = Math.min(pedrasContadas(mao), 14)
  const ultima = mao.pedras.length - 1
  const montagem = contexto === 'montagem'
  const titulo = montagem
    ? t('calculator.buildTitle', { total })
    : `${t('calculator.completeHand')} ${total}/14`

  return (
    <div className="mao-editor-fixo">
      <div className="cabecalho-mao-editor">
        <div className="titulo-mao-linha">
          <h3 className="titulo-mao-editor">
            <i className="fas fa-layer-group" style={{ marginRight: 6 }} aria-hidden="true" />
            {titulo}
          </h3>
        </div>
        <div className="acoes-cabecalho-mao">
          {acoesCabecalho}
          {(pedrasContadas(mao) > 0 || mao.flores.length > 0) && (
            <button
              className="btn-limpar-mao-cabecalho"
              type="button"
              onClick={aoLimpar}
              aria-label={t('actions.clear')}
              title={t('actions.clear')}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="pedras-selecionadas">
        <GradePedrasMao className={montagem ? '' : 'mao-principal-finalizacao'}>
          {mao.pedras.map((id, indice) => {
            const ehBatida = indice === ultima && (!montagem || pedrasContadas(mao) === 14)
            const tile = nomePedra(id)
            return (
              <PedraMao
                key={indice}
                pedra={codigoPedra(id)}
                rotulo={
                  montagem
                    ? ehBatida
                      ? t('calculator.removeWinningTile', { tile })
                      : t('calculator.removeTile', { tile })
                    : t('calculator.selectWinningTile', { tile })
                }
                ehAgari={ehBatida}
                aoClicar={() => aoTocarPedra(indice)}
              />
            )
          })}
        </GradePedrasMao>

        {mao.chamadas.map((chamada, indice) => {
          const tipo = chamada.tipo === 'chi' ? 'chii' : chamada.tipo
          return (
            <ChipMeldMao
              key={`chamada-${indice}`}
              tipo={tipo}
              titulo={t('calculator.removeMeld', { meld: t(ESTILO_MELD[tipo].rotulo) })}
              aoClicar={() => montagem && aoRemoverChamada(indice)}
            >
              <PedrasMeld meld={{ tipo, pedras: pedrasDaChamada(chamada).map(codigoPedra) }} />
            </ChipMeldMao>
          )
        })}

        {mao.flores.length > 0 && (
          <div className="mcr-flores-mao" role="group" aria-label={t('mcr.entrada.flores')}>
            {mao.flores.map((flor) => (
              <button
                key={flor}
                type="button"
                className="chip-pedra pedra-mao mcr-flor-mao"
                aria-label={t('mcr.entrada.removerFlor', { flor: t(`mcr.flores.${flor}`) })}
                title={t(`mcr.flores.${flor}`)}
                onClick={() => aoRemoverFlor(flor)}
              >
                <PedraFlor flor={flor} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
