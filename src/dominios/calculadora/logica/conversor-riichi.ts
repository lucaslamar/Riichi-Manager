import type { CodigoPedra, Mao } from './tipos'

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

/** Calcula a pedra dora real a partir do indicador. */
function proximaDora(pedra: CodigoPedra, sanma: boolean): CodigoPedra {
  const num = Number(pedra[0]) || 5
  const naipe = pedra[1]
  if (naipe === 'z') {
    if (num <= 4) return `${(num % 4) + 1}z`
    return `${((num - 5) % 3) + 5}z`
  }
  if (sanma && naipe === 'm') return num === 1 ? '9m' : '1m'
  return `${(num % 9) + 1}${naipe}`
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
  const sanma = false // padrão: yonma (4 jogadores)

  // 1. Pedras em mão (exceto a de agari)
  const pedrasSemAgari = mao.pedras.filter((_pedra, i) => i !== mao.indiceAgari)
  for (const [naipe, nums] of agruparPorNaipe(pedrasSemAgari)) {
    stringMao += nums + naipe
  }

  // 2. Pedra de agari (prefixo '+' apenas para ron)
  const pedraAgari = mao.pedras[mao.indiceAgari]
  if (pedraAgari) {
    if (mao.agari === 'ron') stringMao += '+'
    stringMao += pedraAgari
  }

  // 3. Melds
  for (const meld of mao.melds) {
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

  // 4. Dora (indicadores → lib converte para a pedra real internamente)
  if (mao.doraManual === 0 && mao.dora.length) {
    stringMao += '+d'
    for (const [naipe, nums] of agruparPorNaipe(
      mao.dora.map((indicadorDora) => proximaDora(indicadorDora, sanma)),
    )) {
      stringMao += nums + naipe
    }
  }

  // 5. Uradora
  if (mao.doraManual === 0 && mao.uradora.length) {
    stringMao += '+u'
    for (const [naipe, nums] of agruparPorNaipe(
      mao.uradora.map((indicadorUradora) => proximaDora(indicadorUradora, sanma)),
    )) {
      stringMao += nums + naipe
    }
  }

  // 6. Modificadores
  stringMao += '+'
  if (mao.riichi) stringMao += mao.riichi.duplo ? 'w' : 'r'
  if (mao.riichi?.ippatsu) stringMao += 'i'
  if (mao.bencao) stringMao += 't'
  if (mao.ultimaPedra) stringMao += 'h'
  if (mao.kan) stringMao += 'k'
  stringMao += mao.ventoRodada + mao.ventoAssento

  return stringMao
}
