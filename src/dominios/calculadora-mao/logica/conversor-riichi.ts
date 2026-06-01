import type { CodigoPedra, Mao, Meld } from './tipos'

// ─── Conversão para string ────────────────────────────────────────────────────

/** Agrupa pedras por naipe: ["1m","3m","2p"] → [["m","13"],["p","2"]] */
function agruparPorNaipe(pedras: CodigoPedra[]): [string, string][] {
  const grupos: Record<string, string[]> = { m: [], p: [], s: [], z: [] }
  for (const pedra of pedras) {
    const naipe = pedra[1]
    if (naipe && grupos[naipe]) grupos[naipe].push(pedra[0])
  }
  return Object.entries(grupos)
    .filter(([, nums]) => nums.length > 0)
    .map(([naipe, nums]) => [naipe, nums.join('')])
}

/**
 * Converte o estado da mão para a string de entrada da biblioteca `riichi`.
 *
 * Formato: pedras_em_mao + agari + melds + dora + modificadores
 * Exemplo: "123m456p+7p+111m+11z+r12"
 *   - +7p  = agari por ron na pedra 7p
 *   - +111m = pon de 1m
 *   - +11z  = kan fechado de 1z (apenas 2 pedras!)
 *   - +r12  = riichi, vento rodada=1, vento assento=2
 *
 * IMPORTANTE sobre kans:
 *   - Kan aberto  (+1111m): 4 pedras
 *   - Kan fechado (+11m):   apenas 2 pedras! (a lib deduz que é kan pelo contexto)
 */
export function converterMaoParaString(mao: Mao): string {
  let stringMao = ''
  const meldAgari = mao.agariMeld ? mao.melds[mao.agariMeld.indiceMeld] : null
  let pedrasCalculo = mao.pedras
  let indiceAgariCalculo = mao.indiceAgari
  let meldsCalculo: Meld[] = mao.melds

  if (mao.agariMeld && meldAgari) {
    const pedrasGrupo = [...meldAgari.pedras]
    let indicePedraAgari = Math.min(mao.agariMeld.indicePedra, pedrasGrupo.length - 1)

    if ((meldAgari.tipo === 'kanAberto' || meldAgari.tipo === 'kanFechado') && pedrasGrupo.length > 3) {
      const indiceRemover = pedrasGrupo.findIndex((_pedra, indice) => indice !== indicePedraAgari)
      if (indiceRemover >= 0) {
        pedrasGrupo.splice(indiceRemover, 1)
        if (indiceRemover < indicePedraAgari) indicePedraAgari--
      }
    }

    pedrasCalculo = [...mao.pedras, ...pedrasGrupo]
    indiceAgariCalculo = mao.pedras.length + indicePedraAgari
    meldsCalculo = mao.melds.filter((_meld, indice) => indice !== mao.agariMeld?.indiceMeld)
  }

  // 1. Pedras em mão (exceto a de agari)
  const pedrasSemAgari = pedrasCalculo.filter((_pedra, i) => i !== indiceAgariCalculo)
  for (const [naipe, nums] of agruparPorNaipe(pedrasSemAgari)) {
    stringMao += nums + naipe
  }

  // 2. Pedra de agari (prefixo '+' apenas para ron)
  const pedraAgari = pedrasCalculo[indiceAgariCalculo]
  if (pedraAgari) {
    if (mao.agari === 'ron') stringMao += '+'
    stringMao += pedraAgari
  }

  // 3. Melds
  for (const meld of meldsCalculo) {
    stringMao += '+'
    if (meld.tipo === 'chii' || meld.tipo === 'pon' || meld.tipo === 'kanAberto') {
      // Chii, pon e kan aberto: todas as pedras
      for (const pedra of meld.pedras) stringMao += pedra[0]
      stringMao += meld.pedras[0][1]
    } else {
      // Kan FECHADO: a lib espera apenas 2 pedras (1ª e 2ª)
      // Usar as duas primeiras para não duplicar akadora
      stringMao += meld.pedras[0][0] + meld.pedras[1][0] + meld.pedras[0][1]
    }
  }

  // 4. Modificadores
  stringMao += '+'
  if (mao.riichi) stringMao += mao.riichi.duplo ? 'w' : 'r'
  if (mao.riichi?.ippatsu) stringMao += 'i'
  if (mao.bencao) stringMao += 't'
  if (mao.ultimaPedra) stringMao += 'h'
  if (mao.kan) stringMao += 'k'
  stringMao += mao.ventoRodada + mao.ventoAssento

  return stringMao
}
