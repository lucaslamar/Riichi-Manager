import { restricoesDe, type MotivoBloqueio } from '../../logica/combinacoesLocais'
import { YAKU_LOCAL_POR_ID } from '../../logica/yakusLocais'

type Traduzir = (chave: string, parametros?: Record<string, string | number>) => string

/** O que cada restrição "não combina com" lista: nomes como nos botões. */
const NOMES_EXCLUIDOS: Partial<Record<MotivoBloqueio['tipo'], string[]>> = {
  semRiichi: ['Riichi'],
  semKan: ['Rinshan', 'Chankan'],
  semUltimaPedra: ['Haitei', 'Houtei'],
  semTenhou: ['Tenhou', 'Chiihou'],
}

/** Um motivo em texto curto (ex.: "Só com Ron", "Não combina com Renhou"). */
export function textoMotivo(motivo: MotivoBloqueio, t: Traduzir): string {
  if (motivo.tipo === 'semOutro') {
    return t('localYaku.combo.semOutro', { name: YAKU_LOCAL_POR_ID.get(motivo.id)?.nome ?? motivo.id })
  }
  return t(`localYaku.combo.${motivo.tipo}`)
}

/**
 * Com o que o yaku local combina, em até duas frases curtas: o que ele exige
 * ("Só com Tsumo, precisa do Rinshan.") e uma lista só do que não combina
 * ("Não combina com Riichi, Haitei e Houtei."). Vazio quando combina com tudo.
 */
export function textoCombinacoes(id: string, t: Traduzir, idioma: string): string {
  const motivos = restricoesDe(id)
  const exige = motivos
    .filter((motivo) => ['soRon', 'soTsumo', 'exigeRiichi', 'exigeRinshan'].includes(motivo.tipo))
    .map((motivo) => t(`localYaku.combo.${motivo.tipo}`))
  const nomes = motivos.flatMap((motivo) =>
    motivo.tipo === 'semOutro'
      ? [YAKU_LOCAL_POR_ID.get(motivo.id)?.nome ?? motivo.id]
      : (NOMES_EXCLUIDOS[motivo.tipo] ?? []),
  )
  // "Riichi, Haitei e Houtei": vírgulas e o "e" do idioma antes do último.
  const lista =
    nomes.length < 2
      ? (nomes[0] ?? '')
      : `${nomes.slice(0, -1).join(', ')} ${t('localYaku.combo.and')} ${nomes[nomes.length - 1]}`
  const frases = [
    // A primeira letra sobe: "precisa do Riichi" sozinho abre a frase.
    exige.length > 0 ? `${exige.join(', ').replace(/^./, (letra) => letra.toLocaleUpperCase(idioma))}.` : '',
    nomes.length > 0 ? t('localYaku.combo.notWith', { list: lista }) : '',
  ]
  return frases.filter(Boolean).join(' ')
}
