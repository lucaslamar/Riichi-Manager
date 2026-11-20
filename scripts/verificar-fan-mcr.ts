/**
 * Testes do motor de fan MCR (porte do GB-Mahjong) e do pagamento MCR.
 * Os casos de `dados/casos-fan-mcr.json` vêm do gb-mahjong-js (MIT © Choimoe),
 * gerados a partir do GB-Mahjong original (MIT © Zheng Fan).
 *
 * Uso: npm run test:fan-mcr
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contarFan, FANS, ehBatida } from '../src/dominios/calculadora-mao-chinesa/logica/motor/fan'
import {
  grupo,
  TIPO_GRUPO,
  type Grupo,
  type MaoGb,
  type Pedra,
} from '../src/dominios/calculadora-mao-chinesa/logica/motor/pedras'
import { calcularFanMcr } from '../src/dominios/calculadora-mao-chinesa/logica/fan-mcr'
import { calcularPagamentoMcr } from '../src/dominios/calculadora-mao-chinesa/logica/pontuacao-mcr'
import {
  adicionarFlor,
  escolherBatida,
  MAO_CHINESA_VAZIA,
  proximaFlor,
  removerFlor,
  sequenciasDoChi,
} from '../src/dominios/calculadora-mao-chinesa/logica/montagem'
import { buscarFansMcr, fanMcrPorId, FANS_MCR } from '../src/compartilhado/mahjong/mcr/fans-mcr'

const BASE: Record<string, number> = {
  m: 1,
  s: 10,
  p: 19,
  E: 28,
  S: 29,
  W: 30,
  N: 31,
  C: 32,
  F: 33,
  P: 34,
}

/** Lê a notação do GB-Mahjong: `[123m,1][EEEE]456p...|EE1000|abc`. */
function lerNotacaoGb(texto: string): { mao: MaoGb; flores: number } {
  const s = texto.replace(/ /g, '')
  const [parteMao, estado = 'EE0000', flores = ''] = s.split('|')
  const chamados: Grupo[] = []
  const pedras: Pedra[] = []
  let numeros = ''
  for (const bloco of parteMao.match(/\[[^\]]+\]|[^[]+/g) ?? []) {
    if (bloco.startsWith('[')) {
      const [corpo, oferta] = bloco.slice(1, -1).split(',')
      const naipe = corpo.at(-1)!
      const ids = /[msp]/.test(naipe)
        ? [...corpo.slice(0, -1)].map((c) => BASE[naipe] - 1 + Number(c))
        : [...corpo].map((c) => BASE[c])
      const tipo =
        ids.length === 4
          ? TIPO_GRUPO.kan
          : ids[0] === ids[1]
            ? TIPO_GRUPO.trinca
            : TIPO_GRUPO.sequencia
      const padrao = ids.length === 4 ? 0 : 1
      chamados.push(grupo(tipo, ids[1], oferta ? Number(oferta) : padrao))
      continue
    }
    for (const c of bloco) {
      if (/\d/.test(c)) numeros += c
      else if (/[msp]/.test(c)) {
        for (const n of numeros) pedras.push({ id: BASE[c] - 1 + Number(n), marca: 0 })
        numeros = ''
      } else pedras.push({ id: BASE[c], marca: 0 })
    }
  }
  const tsumo = estado[2] === '1'
  pedras[pedras.length - 1].marca = tsumo ? 1 : 2
  const qtdFlores = /^\d$/.test(flores) ? Number(flores) : flores.length
  return {
    mao: {
      chamados,
      pedras,
      ventoRodada: BASE[estado[0]],
      ventoAssento: BASE[estado[1]],
      tsumo,
      ultimaDoTipo: estado[3] === '1',
      ultimaDaParede: estado[4] === '1',
      kan: estado[5] === '1',
    },
    flores: qtdFlores,
  }
}

const nomes = (r: ReturnType<typeof contarFan>, flores: number) => {
  const lista = r.fans.flatMap(({ chave, vezes }) =>
    Array<string>(vezes).fill(`FAN_${chave.toUpperCase()}`),
  )
  lista.push(...Array<string>(flores).fill('FAN_HUAPAI'))
  const ordem = (n: string) => FANS.findIndex(([c]) => `FAN_${c.toUpperCase()}` === n)
  return lista.sort((a, b) => ordem(a) - ordem(b))
}

interface Caso {
  input: string
  expectedNames: string[]
  altExpectedNames: string[] | null
}
const casos: Caso[] = JSON.parse(
  readFileSync(new URL('./dados/casos-fan-mcr.json', import.meta.url), 'utf8'),
)
let falhas = 0
for (const caso of casos) {
  const { mao, flores } = lerNotacaoGb(caso.input)
  const obtido = nomes(contarFan(mao), flores)
  const ordem = (n: string) => FANS.findIndex(([c]) => `FAN_${c.toUpperCase()}` === n)
  const esperado = [...caso.expectedNames].sort((a, b) => ordem(a) - ordem(b))
  const alternativo =
    caso.altExpectedNames && [...caso.altExpectedNames].sort((a, b) => ordem(a) - ordem(b))
  const ok =
    JSON.stringify(obtido) === JSON.stringify(esperado) ||
    (alternativo !== null && JSON.stringify(obtido) === JSON.stringify(alternativo))
  if (!ok) {
    falhas++
    console.error(
      `✗ ${caso.input}\n  esperado ${esperado.join(' ')}\n  obtido   ${obtido.join(' ')}`,
    )
  }
}
assert.equal(falhas, 0, `${falhas} de ${casos.length} casos do GB-Mahjong falharam`)
console.log(`✓ ${casos.length} casos do GB-Mahjong`)

// Mãos de teste do brief (seção 9).
const fanDe = (notacao: string, flores = 0) =>
  calcularFanMcr({ ...lerNotacaoGb(notacao).mao }, flores)
const chaves = (r: ReturnType<typeof fanDe>) => r.fans.map((f) => f.chave)

const puro = fanDe('123345567789s11s|EE1000')
assert.ok(chaves(puro).includes('qingyise'), 'Full Flush 24')
assert.ok(chaves(puro).includes('buqiuren'), 'Fully Concealed 4')

const setePares = fanDe('1155m3377s99pEECC|EE0000')
assert.ok(chaves(setePares).includes('qidui'), 'Seven Pairs 24')

assert.equal(fanDe('19m19s19pESWNCFPP|EE0000').fanSemFlores, 88, 'Thirteen Orphans 88')

const trincas = fanDe('[111m,1][999p,1][777s,2]CCCEE|EE0000')
assert.ok(
  chaves(trincas).includes('pengpenghu') && chaves(trincas).includes('jianke'),
  'All Pungs + Dragon Pung',
)

const seteComFlores = fanDe('[234m,1][567s,1][345p,1]678m22p|EE0000', 2)
assert.ok(
  seteComFlores.fanSemFlores < 8 && !seteComFlores.valido,
  'Menos de 8 fan sem flores é inválida',
)
assert.equal(seteComFlores.fanTotal, seteComFlores.fanSemFlores + 2, 'Flores somam no total')

assert.ok(!ehBatida(lerNotacaoGb('123m456m789m234s56s|EE0000').mao), 'Mão incompleta não bate')

assert.deepEqual(calcularPagamentoMcr(8, 'ron'), {
  ganhadorRecebe: 32,
  pagamentos: [
    { quem: 'descartador', valor: 16 },
    { quem: 'outro', valor: 8 },
    { quem: 'outro', valor: 8 },
  ],
})
assert.deepEqual(calcularPagamentoMcr(8, 'tsumo'), {
  ganhadorRecebe: 48,
  pagamentos: [
    { quem: 'outro', valor: 16 },
    { quem: 'outro', valor: 16 },
    { quem: 'outro', valor: 16 },
  ],
})
console.log('✓ mãos e pagamentos do brief')

// Dados de exibição do guia do CMC (fans-mcr.ts).
assert.equal(FANS_MCR.length, 81, '81 fan')
assert.deepEqual(
  FANS_MCR.map((fan) => fan.id),
  Array.from({ length: 81 }, (_, i) => i + 1),
  'Ids de 1 a 81 em ordem',
)
FANS_MCR.forEach((fan) => {
  assert.equal(fan.pontos, FANS[fan.id][2], `Fan ${fan.id} tem os mesmos pontos no guia e no motor`)
  assert.equal(
    fan.hanzi.replace('调', '钓'),
    FANS[fan.id][1],
    `Fan ${fan.id} é o mesmo no guia e no motor`,
  )
})
for (const termo of ['清一色', 'full flush', 'chinitsu', '22', 'naipe puro']) {
  assert.ok(
    buscarFansMcr(FANS_MCR, termo).some((fan) => fan.id === 22),
    `"${termo}" encontra o fan 22`,
  )
}
assert.equal(FANS_MCR.filter((fan) => fan.pontos === 88).length, 7, 'Patamar 88 tem 7 fan')
assert.equal(FANS_MCR.filter((fan) => fan.pontos === 1).length, 13, 'Patamar 1 tem 13 fan')
assert.deepEqual(
  FANS_MCR.filter((fan) => fan.categoria === 'esperas').map((fan) => fan.id),
  [77, 78, 79],
  'Esperas: 77, 78 e 79',
)
FANS_MCR.forEach((fan) =>
  fan.naoCombina?.forEach((id) =>
    assert.ok(fanMcrPorId(id), `Fan ${fan.id} não combina com um fan que existe`),
  ),
)
console.log('✓ 81 fan do guia do CMC')

// Montagem da mão: Chi como na calculadora japonesa, flores e troca da batida.
{
  const vazia = MAO_CHINESA_VAZIA
  assert.deepEqual(sequenciasDoChi(vazia, 5), [4, 5, 6], 'Chi no 5m: 345, 456 e 567')
  assert.deepEqual(sequenciasDoChi(vazia, 1), [2], 'Chi no 1m: só 123')
  assert.deepEqual(sequenciasDoChi(vazia, 28), [], 'Honra não faz Chi')
  let mao = adicionarFlor(adicionarFlor(adicionarFlor(vazia, 'flor'), 'estacao'), 'flor')
  assert.deepEqual(mao.flores, [1, 2, 5], 'Cada toque traz a próxima flor ou estação')
  mao = removerFlor(mao, 1)
  assert.equal(proximaFlor(mao, 'flor'), 1, 'A flor removida volta a ser a próxima')
  const comPedras = { ...vazia, pedras: [1, 2, 3] }
  assert.deepEqual(
    escolherBatida(comPedras, 0).pedras,
    [2, 3, 1],
    'A pedra escolhida vira a da batida',
  )
}
console.log('✓ montagem da mão chinesa')
