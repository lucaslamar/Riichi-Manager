/* eslint-disable react-refresh/only-export-components */
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { VentoMao } from '../../../logica/mao'
import { PedraSvg } from './PedraSvg'

// Como nos jogos, o Leste (vento do dealer) aparece em vermelho.
const ARQUIVO_VENTO: Partial<Record<VentoMao, string>> = { '1': 'Ton-Vermelho' }

export function chaveNomeVento(valor: VentoMao) {
  return valor === '1'
    ? 'winds.east'
    : valor === '2'
      ? 'winds.south'
      : valor === '3'
        ? 'winds.west'
        : 'winds.north'
}

/**
 * Pedra de um vento (arte do jogo + nome), a mesma da Configuração de ventos
 * da Calculadora de Mão. Reaproveitada pelo Sorteador de Ventos.
 */
export function PedraVento({
  vento,
  mostrarNome = true,
}: {
  vento: VentoMao
  mostrarNome?: boolean
}) {
  const { t } = useI18n()

  return (
    <>
      <PedraSvg pedra={`${vento}z`} arquivo={ARQUIVO_VENTO[vento]} />
      {mostrarNome && <small className="label-vento">{t(chaveNomeVento(vento))}</small>}
    </>
  )
}
