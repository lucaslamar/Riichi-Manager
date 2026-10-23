import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { VentoMao } from '../../../logica/mao'
import { PedraVento, chaveNomeVento } from './PedraVento'

/**
 * Grade de escolha de um vento (pedra + nome), no padrão visual da finalização
 * da mão. A pedra em si vem de `PedraVento`, compartilhada com o Sorteador.
 */
export function GradeVentos({
  id,
  titulo,
  opcoes,
  selecionado,
  destacarIgual = false,
  rotuloAcessivel,
  aoEscolher,
}: {
  id?: string
  titulo: string
  opcoes: { valor: VentoMao }[]
  /** Vento marcado, ou null quando ainda não foi escolhido. */
  selecionado: VentoMao | null
  /** Realça o selecionado quando coincide com o outro vento (ex.: vento duplo). */
  destacarIgual?: boolean
  rotuloAcessivel: (nomeVento: string) => string
  aoEscolher: (valor: VentoMao) => void
}) {
  const { t } = useI18n()

  return (
    <div id={id} className="campo-vento-mao secao-vento-finalizacao">
      <span>{titulo}</span>
      <div className="pedras-vento-mao grade-ventos-finalizacao" role="group" aria-label={titulo}>
        {opcoes.map((vento) => {
          const nomeVento = t(chaveNomeVento(vento.valor))
          const ativo = selecionado === vento.valor

          return (
            <button
              key={vento.valor}
              type="button"
              className={`btn-vento-pedra botao-vento-finalizacao ${ativo ? 'ativo' : ''} ${
                ativo && destacarIgual ? 'vento-igual' : ''
              }`}
              aria-pressed={ativo}
              aria-label={rotuloAcessivel(nomeVento)}
              title={nomeVento}
              onClick={() => aoEscolher(vento.valor)}
            >
              <PedraVento vento={vento.valor} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
