/**
 * Testes dos formatos do torneio: ninguém em duas mesas na mesma rodada, ventos
 * equilibrados e repetição de adversários mínima.
 *
 * Uso: npm run test:formatos
 */
import assert from 'node:assert/strict'
import { qualidadeDasRodadas, gerarRodizio } from '../src/dominios/torneio/logica/formatos/rodizio/rodizio'
import type { RodadaTorneio } from '../src/dominios/torneio/logica/tipos'

const agora = '2026-11-08T14:00:00.000Z'
const jogadores = (total: number) => Array.from({ length: total }, (_, indice) => `j${indice + 1}`)

/** Todo mundo uma vez por rodada, mesas de 4. */
export function conferirRodadas(rodadas: readonly RodadaTorneio[], ids: readonly string[]) {
  for (const rodada of rodadas) {
    const sentados = rodada.mesas.flatMap((mesa) => mesa.assentos)
    assert.equal(rodada.mesas.length, ids.length / 4, `rodada ${rodada.numero}: mesas de 4`)
    assert.deepEqual([...sentados].sort(), [...ids].sort(), `rodada ${rodada.numero}: cada um uma vez`)
  }
}

/** Quantas vezes cada um sentou em cada vento. */
export function contagemDeVentos(rodadas: readonly RodadaTorneio[]) {
  const contagem = new Map<string, number[]>()
  for (const rodada of rodadas) {
    for (const mesa of rodada.mesas) {
      mesa.assentos.forEach((jogador, vento) => {
        const linha = contagem.get(jogador) ?? [0, 0, 0, 0]
        linha[vento] += 1
        contagem.set(jogador, linha)
      })
    }
  }
  return contagem
}

// ─── Rodízio ────────────────────────────────────────────────────────────────
for (const total of [8, 12, 16]) {
  const ids = jogadores(total)
  const { rodadas, qualidade } = gerarRodizio(ids, 4, agora)
  assert.equal(rodadas.length, 4)
  conferirRodadas(rodadas, ids)
  for (const [jogador, ventos] of contagemDeVentos(rodadas)) {
    assert.deepEqual(ventos, [1, 1, 1, 1], `Rodízio ${total}: ${jogador} uma vez em cada vento`)
  }
  const convertida = qualidadeDasRodadas(rodadas, total)
  assert.equal(convertida.score, qualidade.score, 'conversão da grade não muda a nota')
  assert.equal(convertida.quantidadeParesRepetidos, qualidade.quantidadeParesRepetidos)
  // Com 8 jogadores e 4 rodadas a repetição é inevitável; com mais, cada par se cruza no máximo 2 vezes.
  assert.ok(qualidade.maxRepeticioesPar <= (total === 8 ? 3 : 2), `Rodízio ${total}: repetição máxima ${qualidade.maxRepeticioesPar}`)
  console.log(
    `Rodízio ${total}: pares repetidos ${qualidade.quantidadeParesRepetidos} (ideal ${qualidade.quantidadeIdealRepetidos}), máx ${qualidade.maxRepeticioesPar}`,
  )
}

console.log('Formatos ok.')
