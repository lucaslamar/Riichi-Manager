import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/** Valor na moeda guardada na premiação, com centavos só quando tem. */
export function useDinheiro() {
  const { idioma } = useI18n()
  return (valor: number, moeda: string) => {
    const casas = Number.isInteger(valor) ? 0 : 2
    return new Intl.NumberFormat(idioma, {
      style: 'currency',
      currency: moeda,
      minimumFractionDigits: casas,
      maximumFractionDigits: casas,
    }).format(valor)
  }
}
