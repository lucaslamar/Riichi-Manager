/**
 * Testes do parser da notação de mão (`parseHand`) e do adaptador para as
 * pedras da calculadora (`notacao.ts`).
 *
 * Uso: npm run test:notacao
 */
import assert from 'node:assert/strict'
import { parseHand } from '../src/dominios/calculadora-mao/logica/parseHand'
import {
  gerarNotacao,
  gerarNotacaoCompleta,
  interpretarNotacao,
  interpretarNotacaoCompleta,
  normalizarNotacao,
  pedraDoTile,
} from '../src/dominios/calculadora-mao/logica/notacao'

const casos: [string, () => void][] = []
const caso = (nome: string, teste: () => void) => casos.push([nome, teste])

// ─── parseHand ───────────────────────────────────────────────────────────────

caso('parseHand: mão do exemplo', () => {
  const { tiles, error } = parseHand('2388m447p2458889s')
  assert.equal(error, undefined)
  assert.equal(tiles.length, 14)
  assert.deepEqual(
    tiles.map((tile) => `${tile.num}${tile.suit}`).join(' '),
    '2m 3m 8m 8m 4p 4p 7p 2s 4s 5s 8s 8s 8s 9s',
  )
  assert.ok(tiles.every((tile) => !tile.red))
})

caso('parseHand: 0m é o cinco vermelho', () => {
  const { tiles, error } = parseHand('0m')
  assert.equal(error, undefined)
  assert.deepEqual(tiles, [{ suit: 'm', num: 5, red: true }])
})

caso('parseHand: 8z é inválido', () => {
  const { error } = parseHand('123m8z')
  assert.match(error ?? '', /8z não existe/)
})

caso('parseHand: naipe faltando no final', () => {
  const { tiles, error } = parseHand('123m456')
  assert.match(error ?? '', /Faltou o naipe/)
  assert.equal(tiles.length, 3)
})

caso('parseHand: naipe sem números antes', () => {
  assert.match(parseHand('m123p').error ?? '', /Naipe "m" sem números/)
})

caso('parseHand: 5 peças iguais', () => {
  assert.match(parseHand('11111m').error ?? '', /Mais de 4 peças 1m/)
  // O 5 vermelho conta como 5 comum.
  assert.match(parseHand('05555p').error ?? '', /Mais de 4 peças 5p/)
})

caso('parseHand: string vazia', () => {
  assert.deepEqual(parseHand(''), { tiles: [] })
})

// ─── Adaptador ───────────────────────────────────────────────────────────────

const semMelds = { melds: [], akadora: true }

caso('adaptador: converte para CodigoPedra (0 = vermelho, z = honras)', () => {
  assert.equal(pedraDoTile({ suit: 'p', num: 5, red: true }), '0p')
  assert.equal(pedraDoTile({ suit: 'z', num: 7, red: false }), '7z')
  const { pedras, erro } = interpretarNotacao('0m1234567z', semMelds)
  assert.equal(erro, null)
  assert.deepEqual(pedras, ['0m', '1z', '2z', '3z', '4z', '5z', '6z', '7z'])
})

caso('adaptador: traduz o erro do parser para chave de i18n', () => {
  assert.deepEqual(interpretarNotacao('8z', semMelds).erro, {
    chave: 'notation.errors.invalidHonor',
    parametros: { tile: '8z' },
  })
  assert.equal(interpretarNotacao('12', semMelds).erro?.chave, 'notation.errors.missingSuit')
})

caso('adaptador: mais de 14 slots, somando melds', () => {
  assert.equal(
    interpretarNotacao('111222333444555m', semMelds).erro?.chave,
    'notation.errors.tooManyTiles',
  )
  const comPon = { melds: [{ tipo: 'pon' as const, pedras: ['1z', '1z', '1z'] }], akadora: true }
  assert.equal(interpretarNotacao('12345678999m', comPon).erro, null)
  assert.deepEqual(interpretarNotacao('123456789999m', comPon).erro, {
    chave: 'notation.errors.tooManyTiles',
    parametros: { max: 11 },
  })
  assert.equal(interpretarNotacao('11z', comPon).erro?.chave, 'notation.errors.tooManyCopies')
})

caso('adaptador: Aka dora desligado ou repetido', () => {
  assert.equal(
    interpretarNotacao('0m', { melds: [], akadora: false }).erro?.chave,
    'notation.errors.akaDisabled',
  )
  assert.equal(interpretarNotacao('00m', semMelds).erro?.chave, 'notation.errors.duplicateAka')
})

caso('adaptador: aceita maiúsculas e espaços', () => {
  assert.equal(normalizarNotacao(' 2388M 447p\t2458889S '), '2388m447p2458889s')
  const { pedras, erro } = interpretarNotacao(normalizarNotacao('123M 456P'), semMelds)
  assert.equal(erro, null)
  assert.deepEqual(pedras, ['1m', '2m', '3m', '4p', '5p', '6p'])
})

caso('adaptador: gerarNotacao põe a batida por último e volta igual', () => {
  const pedras = ['2m', '3m', '0m', '4p', '4p', '7z']
  assert.equal(gerarNotacao(pedras), '230m44p7z')
  assert.equal(gerarNotacao(pedras, 0), '30m44p7z2m')
  assert.equal(gerarNotacao(pedras, 5), '230m44p7z')
  assert.equal(gerarNotacao([]), '')
  const relida = interpretarNotacao(gerarNotacao(pedras, 0), semMelds).pedras
  assert.equal(relida[relida.length - 1], '2m')
})

caso('chamadas: c deduz chi, pon e kan aberto; a é kan fechado', () => {
  const { pedras, melds, erro } = interpretarNotacaoCompleta('238m44p123mc111pc1111sa', {
    akadora: true,
  })
  assert.equal(erro, null)
  assert.deepEqual(pedras, ['2m', '3m', '8m', '4p', '4p'])
  assert.deepEqual(melds, [
    { tipo: 'chii', pedras: ['1m', '2m', '3m'] },
    { tipo: 'pon', pedras: ['1p', '1p', '1p'] },
    { tipo: 'kanFechado', pedras: ['1s', '1s', '1s', '1s'] },
  ])
  assert.deepEqual(interpretarNotacaoCompleta('7777zc', { akadora: true }).melds, [
    { tipo: 'kanAberto', pedras: ['7z', '7z', '7z', '7z'] },
  ])
  // Chi com o 5 vermelho, digitado fora de ordem.
  assert.deepEqual(interpretarNotacaoCompleta('604pc', { akadora: true }).melds, [
    { tipo: 'chii', pedras: ['4p', '0p', '6p'] },
  ])
})

caso('chamadas: formatos inválidos e limites somando melds', () => {
  const erro = (texto: string) => interpretarNotacaoCompleta(texto, { akadora: true }).erro
  assert.deepEqual(erro('124mc'), {
    chave: 'notation.errors.invalidCall',
    parametros: { group: '124mc' },
  })
  assert.equal(erro('123zc')?.chave, 'notation.errors.invalidCall')
  assert.equal(erro('111ma')?.chave, 'notation.errors.invalidClosedKan')
  assert.equal(erro('8zc')?.chave, 'notation.errors.invalidHonor')
  assert.equal(erro('11m111mc')?.chave, 'notation.errors.tooManyCopies')
  assert.equal(erro('112233445566m123pc')?.chave, 'notation.errors.tooManyTiles')
  assert.equal(erro('111pcx')?.chave, 'notation.errors.invalidChar')
})

caso('chamadas: gerarNotacaoCompleta volta igual', () => {
  const melds = [
    { tipo: 'chii' as const, pedras: ['4p', '0p', '6p'] },
    { tipo: 'kanFechado' as const, pedras: ['1s', '1s', '1s', '1s'] },
  ]
  const texto = gerarNotacaoCompleta(['2m', '3m', '4m', '7z', '7z'], 0, melds)
  assert.equal(texto, '34m77z2m 406pc 1111sa')
  const relida = interpretarNotacaoCompleta(normalizarNotacao(texto), { akadora: true })
  assert.equal(relida.erro, null)
  assert.equal(relida.pedras[relida.pedras.length - 1], '2m')
  assert.deepEqual(relida.melds, melds)
})

let falhas = 0
for (const [nome, teste] of casos) {
  try {
    teste()
  } catch (erro) {
    falhas++
    console.error(`✗ ${nome}\n  ${(erro as Error).message}`)
  }
}

if (falhas) {
  console.error(`Notação: ${falhas} de ${casos.length} testes falharam.`)
  process.exit(1)
}
console.log(`Notação ok: ${casos.length} testes.`)
