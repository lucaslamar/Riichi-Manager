/**
 * Testes da linha do tempo da mão, dos 3 tipos de furiten e das frases por extenso.
 *
 * Uso: npm run test:furiten
 */
import assert from 'node:assert/strict'
import { configDoPreset } from '../src/dominios/centerpiece/logica/configMesa'
import {
  muroPermiteKan,
  muroPermiteRiichi,
  pedrasNoMuro,
  ultimoDescarteDaMao,
  adicionarDescartes,
  adicionarKakan,
  candidatosNagashi,
  desfazerUltimoLance,
  ehQuatroVentos,
  lerPedrasDescartadas,
  marcarChamada,
  REGISTRO_VAZIO,
  type Lance,
} from '../src/dominios/centerpiece/logica/descartes'
import {
  descreverEsperas,
  descreverFuriten,
  descreverPedra,
  descreverRio,
} from '../src/dominios/centerpiece/logica/descreverPedras'
import { pagamentosChombo } from '../src/dominios/centerpiece/logica/aplicarChombo'
import { dadosDaPartidaParaMao } from '../src/dominios/centerpiece/logica/dadosDaPartida'
import { calcularFuriten } from '../src/dominios/centerpiece/logica/furiten'
import { passarVezPara } from '../src/dominios/centerpiece/logica/vez'
import {
  criarPartida,
  declararRiichi,
  desfazer,
  registrarChombo,
  registrarRyukyoku,
  registrarTsumo,
  type Cadeira,
} from '../src/dominios/centerpiece/logica/partida'
import {
  agruparChamada,
  chamarPedra,
  desfazerLance,
  desfazerUltimoDaMesa,
  esperasDaMao,
  furitenDe,
  maoPodeTerMudado,
  registrarDescartes,
  salvarMaoInformada,
} from '../src/dominios/centerpiece/logica/registroPartida'

let testes = 0
function teste(nome: string, corpo: () => void) {
  try {
    corpo()
    testes += 1
  } catch (erro) {
    console.error(`Falhou: ${nome}`)
    throw erro
  }
}

/** Monta a linha do tempo a partir de pares [cadeira, pedra]. */
function linha(...pares: [Cadeira, string][]): Lance[] {
  return pares.map(([cadeira, pedra], indice) => ({
    tipo: 'descarte',
    ordem: indice + 1,
    cadeira,
    pedra,
    riichi: false,
  }))
}

const ESPERAS = ['3s', '6s']
const t = (chave: string, p: Record<string, string | number> = {}) =>
  `${chave}${Object.keys(p).length ? JSON.stringify(p) : ''}`
const contexto = (id: string) => ({ id, agora: '2026-11-01T00:00:00.000Z' })
const novaPartida = () =>
  criarPartida('p', configDoPreset('padrao'), ['a', 'b', 'c', 'd'], '2026-11-01T00:00:00.000Z')

teste('sem pedra da espera não há furiten', () => {
  const estado = calcularFuriten(linha([0, '1m'], [1, '2m'], [2, '9p']), 0, ESPERAS)
  assert.equal(estado.principal, null)
  assert.deepEqual(estado.causas, [])
})

teste('pelos descartes: a pedra está no próprio rio', () => {
  const estado = calcularFuriten(linha([0, '6s'], [1, '2m']), 0, ESPERAS)
  assert.equal(estado.principal, 'descartes')
  assert.deepEqual(estado.causas[0], { tipo: 'descartes', pedra: '6s', ordem: 1, cadeira: 0 })
})

teste('pelos descartes: acaba quando a espera muda', () => {
  assert.equal(calcularFuriten(linha([0, '6s']), 0, ['1p', '4p']).principal, null)
})

teste('o 5 vermelho conta como o 5', () => {
  assert.equal(calcularFuriten(linha([0, '0p']), 0, ['5p']).principal, 'descartes')
  assert.equal(calcularFuriten(linha([1, '5p']), 0, ['0p']).principal, 'temporario')
})

teste('temporário: outro descartou e ninguém fez ron', () => {
  const estado = calcularFuriten(linha([0, '1m'], [1, '3s']), 0, ESPERAS)
  assert.equal(estado.principal, 'temporario')
  assert.deepEqual(estado.causas[0], { tipo: 'temporario', pedra: '3s', ordem: 2, cadeira: 1 })
})

teste('temporário: vale antes do primeiro descarte próprio', () => {
  assert.equal(calcularFuriten(linha([1, '3s']), 0, ESPERAS).principal, 'temporario')
})

teste('temporário: acaba no próximo descarte próprio', () => {
  assert.equal(calcularFuriten(linha([1, '3s'], [0, '1m']), 0, ESPERAS).principal, null)
})

teste('temporário: conta a pedra chamada por outro', () => {
  const registro = adicionarDescartes(REGISTRO_VAZIO, 1, ['3s'])
  const chamada = marcarChamada(registro, 1, { cadeira: 2, tipo: 'pon' })
  assert.equal(calcularFuriten(chamada.lances, 0, ESPERAS).principal, 'temporario')
})

teste('temporário: conta a pedra de kakan (chankan perdido)', () => {
  const registro = adicionarKakan(REGISTRO_VAZIO, 1, '6s')
  assert.equal(calcularFuriten(registro.lances, 0, ESPERAS).principal, 'temporario')
})

teste('o próprio kakan não causa furiten', () => {
  const registro = adicionarKakan(REGISTRO_VAZIO, 0, '6s')
  assert.equal(calcularFuriten(registro.lances, 0, ESPERAS).principal, null)
})

teste('de Riichi: passou depois do Riichi e dura até o fim da mão', () => {
  const lances = linha([0, '1m'], [1, '3s'], [0, '2m'], [1, '9m'])
  lances[0] = { ...lances[0], riichi: true } as Lance
  const estado = calcularFuriten(lances, 0, ESPERAS)
  assert.equal(estado.principal, 'riichi')
  assert.deepEqual(estado.tipos, ['riichi'])
})

teste('antes do Riichi conta só como temporário', () => {
  const lances = linha([1, '3s'], [0, '1m'])
  lances[1] = { ...lances[1], riichi: true } as Lance
  assert.equal(calcularFuriten(lances, 0, ESPERAS).principal, null)
})

teste('de Riichi vence os outros tipos no aviso', () => {
  const lances = linha([0, '6s'], [1, '3s'])
  lances[0] = { ...lances[0], riichi: true } as Lance
  const estado = calcularFuriten(lances, 0, ESPERAS)
  assert.deepEqual(estado.tipos, ['riichi', 'descartes'])
  assert.equal(estado.principal, 'riichi')
})

teste('ordem global e desfazer renumeram', () => {
  let registro = adicionarDescartes(REGISTRO_VAZIO, 0, ['1m', '2m'])
  registro = adicionarDescartes(registro, 1, ['3m'])
  assert.deepEqual(registro.lances.map((lance) => lance.ordem), [1, 2, 3])
  registro = desfazerUltimoLance(registro, 0)
  assert.deepEqual(registro.lances.map((lance) => [lance.ordem, lance.pedra]), [[1, '1m'], [2, '3m']])
})

teste('notação de descartes: vários de uma vez, erro e 5 cópias', () => {
  assert.deepEqual(lerPedrasDescartadas('3m 5P 1z', []).pedras, ['3m', '5p', '1z'])
  assert.ok(lerPedrasDescartadas('8z', []).erro)
  assert.ok(lerPedrasDescartadas('', []).erro)
  assert.equal(
    lerPedrasDescartadas('1m', linha([0, '1m'], [1, '1m'], [2, '1m'], [3, '1m'])).erro?.chave,
    'notation.errors.tooManyCopies',
  )
})

teste('esperas vêm da lógica da calculadora', () => {
  const pedras = ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '1p', '2p', '3p', '4s']
  assert.deepEqual(esperasDaMao(pedras, []), ['4s'])
})

teste('chamadas agrupam as últimas pedras escolhidas', () => {
  assert.deepEqual(agruparChamada(['9s', '3m', '1m', '2m'], 'chii'), {
    soltas: ['9s'],
    meld: { tipo: 'chii', pedras: ['1m', '2m', '3m'] },
  })
  assert.equal(agruparChamada(['1m', '2m', '4m'], 'chii'), null)
  assert.equal(agruparChamada(['1z', '2z', '3z'], 'chii'), null)
  assert.deepEqual(agruparChamada(['5p', '0p', '5p'], 'pon')?.meld.tipo, 'pon')
  assert.deepEqual(agruparChamada(['7z', '7z', '7z', '7z'], 'kanFechado')?.soltas, [])
  assert.equal(agruparChamada(['7z', '7z', '7z'], 'kanAberto'), null)
  const { meld, soltas } = agruparChamada(['4m', '5m', '6m', '7p', '8p', '9p', '1s', '1s', '2s', '3s', '1m', '2m', '3m'], 'chii')!
  assert.deepEqual(esperasDaMao(soltas, [meld]).sort(), ['1s', '4s'])
})

teste('desfazer da mesa volta o descarte, a chamada e a vez juntos', () => {
  const config = { ...configDoPreset('padrao'), timerVez: 30 as const }
  let partida = criarPartida('p', config, ['a', 'b', 'c', 'd'], '2026-11-01T00:00:00.000Z')
  partida = { ...partida, vez: passarVezPara(0, 30, 1000) }
  partida = registrarDescartes(partida, 0, ['1m'], { riichi: false }, contexto('a'))
  partida = chamarPedra(partida, 1, { cadeira: 2, tipo: 'pon' })
  partida = { ...partida, vez: passarVezPara(2, 30, 2000) }
  const lance = partida.registro?.lances[0]
  assert.ok(lance?.tipo === 'descarte' && lance.chamadaPor?.jogadorId === 'c')
  const voltou = desfazerUltimoDaMesa(partida, 3000)
  assert.equal(voltou.registro?.lances.length, 0)
  assert.equal(voltou.vez.cadeira, 0)
})

teste('Riichi pelo menu depois do descarte: o Desfazer tira o Riichi primeiro', () => {
  let partida = registrarDescartes(novaPartida(), 0, ['1m'], { riichi: false }, contexto('a'))
  partida = declararRiichi(partida, 1, contexto('r'))
  const voltou = desfazerUltimoDaMesa(partida, 1000)
  assert.equal(voltou.eventos.length, 0)
  assert.equal(voltou.registro?.lances.length, 1)
})

teste('Yakuman reverso: valores e soma zero', () => {
  const ko = pagamentosChombo('yakumanReverso', 1, 0)
  assert.deepEqual(ko, { 0: 16000, 1: -32000, 2: 8000, 3: 8000 })
  const oya = pagamentosChombo('yakumanReverso', 0, 0)
  assert.deepEqual(oya, { 0: -48000, 1: 16000, 2: 16000, 3: 16000 })
  const mangan = pagamentosChombo('manganReverso', 1, 0)
  assert.deepEqual(mangan, { 0: 4000, 1: -8000, 2: 2000, 3: 2000 })
  const config = { ...configDoPreset('padrao'), chombo: { tipo: 'yakumanReverso' as const } }
  const partida = registrarChombo(criarPartida('p', config, ['a', 'b', 'c', 'd'], 'x'), 1, contexto('c'))
  assert.equal(Object.values(partida.placar.pontos).reduce((a, b) => a + b, 0), 100000)
  assert.equal(partida.placar.cadeiraDealer, 0)
  assert.equal(partida.placar.honba, 0)
  assert.equal(desfazer(partida).placar.pontos[1], 25000)
})

teste('Riichi marcado no descarte paga o palito e desfazer devolve', () => {
  const partida = registrarDescartes(novaPartida(), 0, ['1m'], { riichi: true }, contexto('r'))
  assert.equal(partida.placar.pontos[0], 24000)
  assert.equal(partida.placar.palitos, 1)
  const lance = partida.registro?.lances[0]
  assert.ok(lance?.tipo === 'descarte' && lance.riichi)
  const voltou = desfazerLance(partida, 0)
  assert.equal(voltou.placar.pontos[0], 25000)
  assert.equal(voltou.eventos.length, 0)
  assert.equal(voltou.registro?.lances.length, 0)
})

teste('Riichi pelo menu deita só o próximo descarte', () => {
  let partida = declararRiichi(novaPartida(), 0, contexto('r'))
  partida = registrarDescartes(partida, 0, ['1m'], { riichi: false }, contexto('a'))
  partida = registrarDescartes(partida, 0, ['2m'], { riichi: false }, contexto('b'))
  const lances = partida.registro?.lances ?? []
  assert.deepEqual(lances.map((lance) => lance.tipo === 'descarte' && lance.riichi), [true, false])
  assert.equal(desfazerLance(partida, 0).placar.pontos[0], 24000)
})

teste('desfazer o Riichi na mesa tira a pedra deitada', () => {
  const comRiichi = registrarDescartes(novaPartida(), 0, ['1m'], { riichi: true }, contexto('r'))
  const desfeita = desfazer(comRiichi)
  const lance = desfeita.registro?.lances[0]
  assert.equal(desfeita.placar.pontos[0], 25000)
  assert.ok(lance?.tipo === 'descarte' && !lance.riichi)
})

teste('fim da mão limpa o rio, some a mão e guarda no histórico', () => {
  let partida = registrarDescartes(novaPartida(), 1, ['1m', '2m'], { riichi: false }, contexto('a'))
  partida = salvarMaoInformada(partida, 1, {
    notacao: 'x',
    pedras: [],
    melds: [],
    esperas: ['1m'],
  })
  assert.equal(furitenDe(partida, 1)?.principal, 'descartes')
  const fim = registrarRyukyoku(partida, { tenpai: [] }, contexto('b'))
  assert.equal(fim.registro, undefined)
  assert.equal(fim.eventos[fim.eventos.length - 1].lances?.length, 2)
  assert.equal(furitenDe(fim, 1), null)
  const volta = desfazer(fim)
  assert.equal(volta.registro?.lances.length, 2)
  assert.deepEqual(volta.registro?.maos, {})
})

teste('mão sem registro não grava lances no histórico', () => {
  const fim = registrarTsumo(novaPartida(), { vencedor: 0, pagamentoDealer: 0, pagamentoNaoDealer: 500 }, contexto('t'))
  assert.equal(fim.eventos[0].lances, undefined)
})

teste('descarte depois de informar pede para conferir a mão', () => {
  let partida = salvarMaoInformada(novaPartida(), 1, { notacao: 'x', pedras: [], melds: [], esperas: ['9p'] })
  assert.equal(maoPodeTerMudado(partida, 1), false)
  partida = registrarDescartes(partida, 1, ['1m'], { riichi: false }, contexto('a'))
  assert.equal(maoPodeTerMudado(partida, 1), true)
})

teste('Nagashi: só terminais e honras, sem pedra chamada', () => {
  const lances = linha([0, '1m'], [1, '9p'], [2, '1z'], [3, '5s'], [0, '7z'], [1, '0p'])
  assert.deepEqual(candidatosNagashi(lances), [0, 2])
  assert.deepEqual(candidatosNagashi([]), [])
  const registro = marcarChamada({ lances, maos: {} }, 1, { cadeira: 1, tipo: 'pon' })
  assert.deepEqual(candidatosNagashi(registro.lances), [2])
})

teste('4 ventos: os 4 primeiros iguais, de 4 jogadores e sem chamada', () => {
  const quatro = linha([0, '2z'], [1, '2z'], [2, '2z'], [3, '2z'])
  assert.equal(ehQuatroVentos(quatro), true)
  assert.equal(ehQuatroVentos(quatro.slice(0, 3)), false)
  assert.equal(ehQuatroVentos([...quatro, ...linha([0, '1m'])]), false)
  assert.equal(ehQuatroVentos(linha([0, '5z'], [1, '5z'], [2, '5z'], [3, '5z'])), false)
  assert.equal(ehQuatroVentos(linha([0, '2z'], [1, '2z'], [2, '2z'], [3, '3z'])), false)
  assert.equal(ehQuatroVentos(linha([0, '2z'], [0, '2z'], [2, '2z'], [3, '2z'])), false)
  const chamada = marcarChamada({ lances: quatro, maos: {} }, 2, { cadeira: 2, tipo: 'pon' })
  assert.equal(ehQuatroVentos(chamada.lances), false)
})

teste('frases por extenso', () => {
  assert.equal(descreverPedra('3m', t), 'spokenTiles.man{"number":"3"}')
  assert.equal(descreverPedra('0s', t), 'spokenTiles.red.sou')
  assert.equal(descreverPedra('1z', t), 'spokenTiles.east')
  assert.equal(descreverPedra('5z', t), 'spokenTiles.white')
  assert.equal(descreverEsperas(['3s', '6s'], t), 'spokenTiles.sou{"number":"3 spokenTiles.and 6"}')
  const descartes = adicionarDescartes(REGISTRO_VAZIO, 0, ['1z'], { indiceRiichi: 0 }).lances
  const rio = descreverRio('Ana', descartes as never, () => 'Bia', t)
  assert.ok(rio.includes('spokenTiles.river') && rio.includes('riichiMark') && rio.includes('Ana'))
  assert.ok(descreverRio('Ana', [], () => '', t).includes('noDiscards'))
  const estado = calcularFuriten(linha([1, '3s']), 0, ESPERAS)
  assert.ok(descreverFuriten(estado, ESPERAS, t).startsWith('match.furiten.temporary.title'))
})

teste('muro: abre com 69 e cada descarte leva à próxima compra', () => {
  assert.equal(pedrasNoMuro([]), 69)
  assert.equal(pedrasNoMuro(linha([0, '1m'])), 68)
  assert.equal(pedrasNoMuro(linha([0, '1m'], [1, '2m'], [2, '3m'])), 66)
})

teste('muro: chi, pon e ron não compram; kan compra a reposição', () => {
  const comChamada = (tipo: 'chi' | 'pon' | 'kan' | 'ron') =>
    linha([0, '1m']).map((lance) =>
      lance.tipo === 'descarte' ? { ...lance, chamadaPor: { cadeira: 1 as Cadeira, tipo } } : lance,
    )
  assert.equal(pedrasNoMuro(comChamada('chi')), 69)
  assert.equal(pedrasNoMuro(comChamada('pon')), 69)
  assert.equal(pedrasNoMuro(comChamada('ron')), 69)
  assert.equal(pedrasNoMuro(comChamada('kan')), 68)
  const fechado: Lance = { tipo: 'kakan', ordem: 1, cadeira: 0, pedra: '1m', fechado: true }
  const kakan: Lance = { tipo: 'kakan', ordem: 2, cadeira: 0, pedra: '2m' }
  assert.equal(pedrasNoMuro([fechado, kakan]), 67)
})

const descartes = (quantos: number) =>
  Array.from({ length: quantos }, (_, indice) => linha([0, '1m']).map((lance) => ({ ...lance, ordem: indice + 1 }))[0])

teste('muro: Riichi só com 4 ou mais; kan só com alguma pedra; nunca fica negativo', () => {
  assert.equal(pedrasNoMuro(descartes(65)), 4)
  assert.equal(muroPermiteRiichi(descartes(65)), true)
  assert.equal(muroPermiteRiichi(descartes(66)), false)
  assert.equal(muroPermiteKan(descartes(68)), true)
  assert.equal(muroPermiteKan(descartes(69)), false)
  assert.equal(pedrasNoMuro(descartes(75)), 0)
})

teste('muro: o descarte feito com o muro vazio é o último da mão', () => {
  assert.equal(ultimoDescarteDaMao(descartes(69)), false)
  assert.equal(ultimoDescarteDaMao(descartes(70)), true)
})

teste('Riichi com menos de 4 no muro não é declarado', () => {
  const base = novaPartida()
  const lances = descartes(66)
  const partida = registrarDescartes({ ...base, registro: { lances, maos: {} } }, 0, ['1m'], { riichi: true }, contexto('r'))
  assert.deepEqual(partida.placar.riichi, [])
})

teste('passar por um kan fechado não dá furiten', () => {
  const fechado: Lance = { tipo: 'kakan', ordem: 1, cadeira: 1, pedra: '3s', fechado: true }
  assert.equal(calcularFuriten([fechado], 0, ESPERAS).principal, null)
})

const dados = (lances: Lance[], cadeira: Cadeira, tipo: 'ron' | 'tsumo', emRiichi = false) =>
  dadosDaPartidaParaMao({ lances, cadeira, tipo, emRiichi })
const comRiichi = (lances: Lance[], ordem: number) =>
  lances.map((lance) => (lance.ordem === ordem && lance.tipo === 'descarte' ? { ...lance, riichi: true } : lance))
const chamado = (lances: Lance[], ordem: number, tipo: 'chi' | 'pon' | 'kan', cadeira: Cadeira = 2) =>
  lances.map((lance) =>
    lance.ordem === ordem && lance.tipo === 'descarte' ? { ...lance, chamadaPor: { cadeira, tipo } } : lance,
  )

teste('dados da partida: Riichi duplo no primeiro descarte, sem chamadas antes', () => {
  const lances = comRiichi(linha([0, '1m'], [1, '2m']), 1)
  assert.deepEqual(dados(lances, 0, 'tsumo', true).riichi, { duplo: true, ippatsu: true })
  const comPon = comRiichi(chamado(linha([3, '9m'], [0, '1m']), 1, 'pon'), 2)
  assert.equal(dados(comPon, 0, 'tsumo', true).riichi?.duplo, false)
})

teste('dados da partida: Ippatsu cai com novo descarte ou chamada de alguém', () => {
  const base = linha([0, '1m'], [1, '2m'], [0, '3m'], [1, '4m'])
  assert.equal(dados(comRiichi(base, 3), 0, 'tsumo', true).riichi?.ippatsu, true)
  assert.equal(dados(comRiichi(base, 1), 0, 'tsumo', true).riichi?.ippatsu, false)
  assert.equal(dados(chamado(comRiichi(base, 3), 4, 'pon'), 0, 'tsumo', true).riichi?.ippatsu, false)
})

teste('dados da partida: Riichi pelo menu não inventa duplo nem Ippatsu', () => {
  assert.deepEqual(dados(linha([1, '1m']), 0, 'tsumo', true).riichi, { duplo: false, ippatsu: false })
  assert.equal(dados(linha([1, '1m']), 0, 'tsumo', false).riichi, null)
})

teste('dados da partida: Haitei com o muro em zero e Houtei no último descarte', () => {
  const lances = descartes(69).map((lance) => ({ ...lance, cadeira: 1 as Cadeira }))
  assert.equal(dados(lances, 0, 'tsumo').ultimaPedra, true)
  assert.equal(dados(lances.slice(0, 68), 0, 'tsumo').ultimaPedra, false)
  const ate70 = descartes(70).map((lance) => ({ ...lance, cadeira: 1 as Cadeira }))
  assert.equal(dados(ate70, 0, 'ron').ultimaPedra, true)
  assert.equal(dados(lances, 0, 'ron').ultimaPedra, false)
})

teste('dados da partida: Rinshan no próprio kan e Chankan no kakan de outro', () => {
  const fechado: Lance = { tipo: 'kakan', ordem: 1, cadeira: 0, pedra: '1m', fechado: true }
  const kakanOutro: Lance = { tipo: 'kakan', ordem: 1, cadeira: 1, pedra: '1m' }
  assert.equal(dados([fechado], 0, 'tsumo').kan, true)
  assert.equal(dados(chamado(linha([1, '1m']), 1, 'kan', 0), 0, 'tsumo').kan, true)
  assert.equal(dados([kakanOutro], 0, 'ron').kan, true)
  assert.equal(dados([{ ...fechado, cadeira: 1 }], 0, 'ron').kan, false)
  assert.equal(dados(linha([1, '1m']), 0, 'tsumo').kan, false)
})

teste('dados da partida: primeira compra, descartes do vencedor e kans', () => {
  assert.equal(dados([], 0, 'tsumo').primeiraCompra, false)
  assert.equal(dados(linha([0, '1m']), 1, 'tsumo').primeiraCompra, true)
  assert.equal(dados(chamado(linha([0, '1m']), 1, 'pon'), 1, 'tsumo').primeiraCompra, false)
  assert.equal(dados(linha([1, '1m'], [0, '2m']), 0, 'tsumo').primeiraCompra, false)
  assert.equal(dados(linha([0, '1m']), 1, 'ron').primeiraCompra, false)
  assert.deepEqual(dados(linha([0, '1m'], [1, '2m'], [0, '3m']), 0, 'ron').descartes, ['1m', '3m'])
  const doisKans = chamado([...linha([1, '1m']), { tipo: 'kakan', ordem: 2, cadeira: 2, pedra: '5p' } as Lance], 1, 'kan')
  assert.equal(dados(doisKans, 0, 'ron').kans, 2)
})

console.log(`Furiten ok: ${testes} testes.`)
