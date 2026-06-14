import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { CodigoPedra } from '../../../logica/mao'
import { nomePedraAcessivel } from '../../constantes'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

interface PropsDescartesMao {
  descartes: CodigoPedra[]
  temEsperaFuriten?: boolean
  aoRemoverDescarte: (indiceDescarte: number) => void
  aoLimparDescartes?: () => void
}

/** Lista os descartes proprios usados pela checagem de furiten. */
export function DescartesMao({
  descartes,
  temEsperaFuriten,
  aoRemoverDescarte,
  aoLimparDescartes,
}: PropsDescartesMao) {
  const { t } = useI18n()
  if (descartes.length === 0) return null
  const descartesAgrupados = descartes.reduce<
    Array<{ chave: string; pedra: CodigoPedra; quantidade: number; primeiroIndice: number }>
  >((lista, pedra, indice) => {
    const existente = lista.find((item) => item.chave === pedra)
    if (existente) existente.quantidade += 1
    else lista.push({ chave: pedra, pedra, quantidade: 1, primeiroIndice: indice })
    return lista
  }, [])

  return (
    <div className="descartes-selecionados descartes-furiten-row">
      <div className="descartes-furiten-header">
        <span className="descartes-furiten-label">
          DESCARTES <span className="descartes-contador">{descartes.length}/18</span>
        </span>
        {temEsperaFuriten && (
          <span className="chip-furiten-ativo">FURITEN</span>
        )}
      </div>
      <div className="descartes-furiten-scroll">
        <div className="descartes-furiten-list">
          {descartesAgrupados.map(({ chave, pedra, quantidade, primeiroIndice }) => (
            <button
              key={chave}
              className="chip-pedra descarte"
              type="button"
              title={t('calculator.removeDiscard', { tile: nomePedraAcessivel(pedra) })}
              aria-label={t('calculator.removeDiscard', {
                tile: `${nomePedraAcessivel(pedra)}, quantidade ${quantidade}`,
              })}
              onClick={() => aoRemoverDescarte(primeiroIndice)}
            >
              <PedraSvg pedra={pedra} />
              {quantidade > 1 && (
                <span className="contador-descarte-finalizacao">{quantidade}x</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {aoLimparDescartes && (
        <button
          className="descartes-trash-button"
          type="button"
          onClick={aoLimparDescartes}
          aria-label={t('calculator.clearDiscards')}
          title={t('calculator.clearDiscards')}
        >
          <i className="fas fa-trash" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
