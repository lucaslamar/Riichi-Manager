#!/usr/bin/env node

/**
 * scripts/check-wind-fairness.ts
 *
 * Confere se o Sorteador de Ventos é justo: roda `embaralharVentos()` um
 * milhão de vezes e mostra, para cada posição (J1–J4), a porcentagem de cada
 * vento. Sai com código 1 se alguma célula ficar fora de 24,5%–25,5%.
 *
 * Execute a partir da RAIZ do projeto:
 *
 *   npx tsx scripts/check-wind-fairness.ts
 */

import { VENTOS_MESA, embaralharVentos } from '../src/dominios/sorteador-ventos/logica/sortearVento'

const RODADAS = 1_000_000
const MINIMO = 24.5
const MAXIMO = 25.5
const NOMES: Record<string, string> = { '1': 'Leste', '2': 'Sul', '3': 'Oeste', '4': 'Norte' }

function log(msg: string): void {
  console.log(msg)
}

const contagem = VENTOS_MESA.map(() => new Map(VENTOS_MESA.map((vento) => [vento, 0])))

for (let rodada = 0; rodada < RODADAS; rodada++) {
  embaralharVentos().forEach((vento, posicao) => {
    contagem[posicao].set(vento, (contagem[posicao].get(vento) ?? 0) + 1)
  })
}

let foraDoIntervalo = 0

log(`\nSorteio de ventos — ${RODADAS.toLocaleString('pt-BR')} embaralhamentos\n`)
log(['     ', ...VENTOS_MESA.map((vento) => NOMES[vento].padStart(8))].join(''))

contagem.forEach((porVento, posicao) => {
  const celulas = VENTOS_MESA.map((vento) => {
    const porcentagem = ((porVento.get(vento) ?? 0) / RODADAS) * 100
    const ok = porcentagem >= MINIMO && porcentagem <= MAXIMO
    if (!ok) foraDoIntervalo++
    return `${porcentagem.toFixed(2)}%${ok ? ' ' : '!'}`.padStart(8)
  })
  log([`J${posicao + 1}   `, ...celulas].join(''))
})

if (foraDoIntervalo > 0) {
  log(`\n✖ ${foraDoIntervalo} célula(s) fora de ${MINIMO}%–${MAXIMO}%.`)
  process.exit(1)
}

log(`\n✔ Todas as células entre ${MINIMO}% e ${MAXIMO}%.`)
