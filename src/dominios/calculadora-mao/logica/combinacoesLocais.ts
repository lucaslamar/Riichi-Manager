/**
 * Com o que cada yaku local de situação combina (ou não). Uma tabela só, usada
 * pela calculadora (que bloqueia e desmarca o que não combina) e pelos textos do
 * "?", do Guia de bolso e do Aprender. Funções puras, sem tela.
 *
 * `kan` segue a mão: no Tsumo é o Rinshan, no Ron é o Chankan.
 */

export interface RegraCombinacao {
  /** Só vale com esta batida. */
  batida?: 'ron' | 'tsumo'
  /** Precisa do Riichi marcado, ou não pode ter Riichi. */
  riichi?: 'exige' | 'proibe'
  /** Precisa do Rinshan (kan no Tsumo), ou não pode ter Rinshan nem Chankan. */
  kan?: 'exige' | 'proibe'
  /** Não pode ser Haitei/Houtei. */
  semUltimaPedra?: boolean
  /** Não pode ser Tenhou/Chiihou. */
  semTenhou?: boolean
  /** Yakus locais que não combinam com este (vale para os dois lados). */
  exclui?: readonly string[]
}

export const REGRAS_COMBINACAO: Readonly<Record<string, RegraCombinacao>> = {
  // Ron no descarte com que o oponente declarou Riichi.
  tsubameGaeshi: { batida: 'ron', semTenhou: true },
  // Ron no descarte logo depois de um kan: não é o Chankan (roubar o kan).
  kanburi: { batida: 'ron', kan: 'proibe', semTenhou: true, exclui: ['renhou'] },
  // Precisa de pedras já visíveis na mesa.
  ketsupaihou: { semTenhou: true },
  // Riichi aberto: sem Riichi não existe.
  openRiichi: { riichi: 'exige', semTenhou: true },
  // Rinshan depois de dois kans seguidos.
  renkaihou: { batida: 'tsumo', kan: 'exige' },
  // Ron antes da primeira compra, sem chamadas: sem Riichi, sem descartes próprios.
  renhou: { batida: 'ron', riichi: 'proibe', kan: 'proibe', semUltimaPedra: true, exclui: ['kanburi', 'maneman'] },
  // Copiar os primeiros descartes de alguém: já houve descartes.
  maneman: { semTenhou: true, exclui: ['renhou'] },
  paarenchan: {},
  // Kan no primeiro turno e vitória no Rinshan logo em seguida.
  toukanhou: { batida: 'tsumo', kan: 'exige', riichi: 'proibe', semUltimaPedra: true },
  // Mão inicial sem conexão, na primeira compra.
  shiisanpuutaa: { batida: 'tsumo', riichi: 'proibe', kan: 'proibe', semUltimaPedra: true, semTenhou: true },
}

/** O que está marcado na mão agora. */
export interface EstadoCondicoes {
  agari: 'ron' | 'tsumo'
  riichi: boolean
  kan: boolean
  ultimaPedra: boolean
  bencao: boolean
  locais: readonly string[]
}

export type MotivoBloqueio =
  | { tipo: 'soRon' | 'soTsumo' | 'exigeRiichi' | 'semRiichi' | 'exigeRinshan' | 'semKan' | 'semUltimaPedra' | 'semTenhou' }
  | { tipo: 'semOutro'; id: string }

/** Os yakus locais que não combinam com `id`, olhando a regra dos dois lados. */
export function excluidosPor(id: string): string[] {
  const proprios = REGRAS_COMBINACAO[id]?.exclui ?? []
  const deOutros = Object.entries(REGRAS_COMBINACAO)
    .filter(([, regra]) => regra.exclui?.includes(id))
    .map(([outro]) => outro)
  return [...new Set([...proprios, ...deOutros])]
}

/** Todas as restrições do yaku, para os textos (não depende do que está marcado). */
export function restricoesDe(id: string): MotivoBloqueio[] {
  const regra = REGRAS_COMBINACAO[id]
  if (!regra) return []
  const motivos: MotivoBloqueio[] = []
  if (regra.batida === 'ron') motivos.push({ tipo: 'soRon' })
  if (regra.batida === 'tsumo') motivos.push({ tipo: 'soTsumo' })
  if (regra.riichi === 'exige') motivos.push({ tipo: 'exigeRiichi' })
  if (regra.riichi === 'proibe') motivos.push({ tipo: 'semRiichi' })
  if (regra.kan === 'exige') motivos.push({ tipo: 'exigeRinshan' })
  if (regra.kan === 'proibe') motivos.push({ tipo: 'semKan' })
  if (regra.semUltimaPedra) motivos.push({ tipo: 'semUltimaPedra' })
  if (regra.semTenhou) motivos.push({ tipo: 'semTenhou' })
  excluidosPor(id).forEach((outro) => motivos.push({ tipo: 'semOutro', id: outro }))
  return motivos
}

/** O que impede marcar `id` agora. Vazio: pode marcar. */
export function bloqueiosDe(id: string, estado: EstadoCondicoes): MotivoBloqueio[] {
  return restricoesDe(id).filter((motivo) => {
    switch (motivo.tipo) {
      case 'soRon':
        return estado.agari !== 'ron'
      case 'soTsumo':
        return estado.agari !== 'tsumo'
      case 'exigeRiichi':
        return !estado.riichi
      case 'semRiichi':
        return estado.riichi
      case 'exigeRinshan':
        return !(estado.agari === 'tsumo' && estado.kan)
      case 'semKan':
        return estado.kan
      case 'semUltimaPedra':
        return estado.ultimaPedra
      case 'semTenhou':
        return estado.bencao
      case 'semOutro':
        return estado.locais.includes(motivo.id)
    }
  })
}

/**
 * Tira os yakus locais marcados que deixaram de combinar (ex.: trocou para
 * Tsumo com o Kanburi marcado). Os que vêm antes na lista têm preferência.
 */
export function locaisQueCombinam(estado: EstadoCondicoes): string[] {
  const ficam: string[] = []
  for (const id of estado.locais) {
    if (bloqueiosDe(id, { ...estado, locais: ficam }).length === 0) ficam.push(id)
  }
  return ficam
}
