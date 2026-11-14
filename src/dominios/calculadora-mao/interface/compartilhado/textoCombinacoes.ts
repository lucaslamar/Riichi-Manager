import { restricoesDe, type MotivoBloqueio } from '../../logica/combinacoesLocais'
import { YAKU_LOCAL_POR_ID } from '../../logica/yakusLocais'

type Traduzir = (chave: string, parametros?: Record<string, string | number>) => string

/** Um motivo em texto curto (ex.: "Só com Ron", "Não combina com Renhou"). */
export function textoMotivo(motivo: MotivoBloqueio, t: Traduzir): string {
  if (motivo.tipo === 'semOutro') {
    return t('localYaku.combo.semOutro', { name: YAKU_LOCAL_POR_ID.get(motivo.id)?.nome ?? motivo.id })
  }
  return t(`localYaku.combo.${motivo.tipo}`)
}

/**
 * Com o que o yaku local combina, numa linha: "Só com Ron · Não combina com
 * Renhou". Vazio quando combina com tudo.
 */
export function textoCombinacoes(id: string, t: Traduzir): string {
  return restricoesDe(id)
    .map((motivo) => textoMotivo(motivo, t))
    .join(' · ')
}
