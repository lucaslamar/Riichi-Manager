import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/** Uma casa, como no ranking: "14,4" e "+3,2". */
export function useFormatoEstatisticas() {
  const { idioma } = useI18n()
  const casas = { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  const simples = new Intl.NumberFormat(idioma, casas)
  const sinal = new Intl.NumberFormat(idioma, { ...casas, signDisplay: 'exceptZero' })
  const porcento = new Intl.NumberFormat(idioma, { ...casas, style: 'percent' })
  return {
    decimal: (valor: number) => simples.format(valor),
    comSinal: (valor: number) => sinal.format(valor),
    percentual: (fracao: number) => porcento.format(fracao),
  }
}
