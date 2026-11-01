/**
 * Testes do parser da notação de mão (`parseHand`) e do adaptador para as
 * pedras da calculadora (`notacao.ts`).
 *
 * Uso: npm run test:notacao
 */
import assert from 'node:assert/strict'
import { parseHand } from '../src/dominios/calculadora-mao/logica/parseHand'
import {
  chamadasPossiveis,
  fecharPendentes,
  gerarNotacao,
  gerarNotacaoCompleta,
  grupoCabeNosPendentes,
  grupoDaChamada,
  interpretarNotacao,
  interpretarNotacaoCompleta,
  lerPendentes,
  normalizarNotacao,
  pedraDoTile,
  podeDigitarNumero,
  separarPendentes,
  slotsDosPendentes,
  sequenciasChiComNumero,
  tipoDoGrupoPendente,
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

caso('teclado: chamadas possíveis no último grupo', () => {
  const tipos = (texto: string) => [...chamadasPossiveis(texto)].sort()
  assert.deepEqual(tipos('2388m447p123m'), ['chii'])
  assert.deepEqual(tipos('2388m111p'), ['pon'])
  assert.deepEqual(tipos('1111s'), ['kanAberto', 'kanFechado'])
  assert.deepEqual(tipos('406p'), ['chii'])
  assert.deepEqual(tipos('124m'), [])
  assert.deepEqual(tipos('123mc'), [])
  assert.deepEqual(tipos('12'), [])
  assert.deepEqual(tipos(''), [])
})

caso('teclado: vários grupos esperando o mesmo naipe', () => {
  assert.deepEqual(separarPendentes('238m999c123c78'), {
    completo: '238m',
    pendentes: '999c123c78',
  })
  assert.deepEqual(separarPendentes('123mc'), { completo: '123mc', pendentes: '' })
  assert.deepEqual(separarPendentes('123mc45'), { completo: '123mc', pendentes: '45' })
  assert.deepEqual(lerPendentes('999c78'), [
    { digitos: '999', marca: 'c' },
    { digitos: '78', marca: '' },
  ])
  assert.equal(fecharPendentes('123c456c789', 'm'), '123mc456mc789m')
  assert.equal(fecharPendentes('7777a', 'z'), '7777za')
  const { melds, pedras, erro } = interpretarNotacaoCompleta(fecharPendentes('123c456c789', 'm'), {
    akadora: true,
  })
  assert.equal(erro, null)
  assert.deepEqual(
    melds.map((meld) => meld.tipo),
    ['chii', 'chii'],
  )
  assert.deepEqual(pedras, ['7m', '8m', '9m'])
  assert.equal(tipoDoGrupoPendente({ digitos: '999', marca: 'c' }), 'pon')
  assert.equal(tipoDoGrupoPendente({ digitos: '406', marca: 'c' }), 'chii')
  assert.equal(tipoDoGrupoPendente({ digitos: '1111', marca: 'a' }), 'kanFechado')
  assert.equal(tipoDoGrupoPendente({ digitos: '12', marca: 'c' }), null)
  assert.equal(tipoDoGrupoPendente({ digitos: '12', marca: '' }), null)
  assert.deepEqual([...chamadasPossiveis('999c111')], ['pon'])
  assert.deepEqual([...chamadasPossiveis('999c')], [])
  assert.equal(grupoCabeNosPendentes('999', '999'), false)
  assert.equal(grupoCabeNosPendentes('9', '999'), true)
  assert.equal(grupoCabeNosPendentes('0', '055'), false)
})

caso('teclado: slots dos grupos sem naipe', () => {
  assert.equal(slotsDosPendentes(''), 0)
  assert.equal(slotsDosPendentes('745644'), 6)
  assert.equal(slotsDosPendentes('888c745'), 6)
  assert.equal(slotsDosPendentes('1111a'), 3)
  assert.equal(slotsDosPendentes('1111c123c7'), 7)
})

caso('teclado: no máximo 4 de cada número e um 0 no grupo sem naipe', () => {
  assert.equal(podeDigitarNumero('888', '8'), true)
  assert.equal(podeDigitarNumero('8888', '8'), false)
  assert.equal(podeDigitarNumero('555', '0'), true)
  assert.equal(podeDigitarNumero('0555', '5'), false)
  assert.equal(podeDigitarNumero('0', '0'), false)
  assert.equal(podeDigitarNumero('', '1'), true)
})

caso('teclado: número depois da chamada marcada', () => {
  assert.equal(grupoDaChamada('8', 'pon'), '888')
  assert.equal(grupoDaChamada('0', 'pon'), '055')
  assert.equal(grupoDaChamada('8', 'kanAberto'), '8888')
  assert.equal(grupoDaChamada('7', 'kanFechado'), '7777')
  assert.equal(grupoDaChamada('4', 'chii'), null)
  assert.deepEqual(sequenciasChiComNumero('4'), ['234', '345', '456'])
  assert.deepEqual(sequenciasChiComNumero('1'), ['123'])
  assert.deepEqual(sequenciasChiComNumero('2'), ['123', '234'])
  assert.deepEqual(sequenciasChiComNumero('9'), ['789'])
  assert.deepEqual(sequenciasChiComNumero('0'), ['340', '406', '067'])
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
