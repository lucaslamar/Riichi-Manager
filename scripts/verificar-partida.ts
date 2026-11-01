/**
 * Testes do motor de partida: batidas, ryukyoku, chombo, fim de jogo, resultado,
 * timer de vez, dados, Centerpiece simples e migração da mesa antiga.
 *
 * Uso: npm run test:partida
 */
import assert from 'node:assert/strict'
import { configDoPreset, alterarConfig, type ConfigMesa } from '../src/dominios/centerpiece/logica/configMesa'
import {
  ajustarHonba,
  normalizarSimples,
  proximoDealer,
  repetirDealer,
  SIMPLES_INICIAL,
} from '../src/dominios/centerpiece/logica/centerpieceSimples'
import { jogarDados, numerosDaParede, paredeDaSoma } from '../src/dominios/centerpiece/logica/dados'
import { migrarMesaAntiga, somaPontos } from '../src/dominios/centerpiece/logica/migrarMesaAntiga'
import {
  calcularResultado,
  criarPartida,
  declararRiichi,
  desfazer,
  diferencasDePontos,
  encerrarPorAgariYame,
  finalizarPartida,
  registrarAbortivo,
  registrarChombo,
  registrarRon,
  registrarRyukyoku,
  registrarTsumo,
  ventoDaCadeira,
  type Partida,
} from '../src/dominios/centerpiece/logica/partida'
import {
  passarVezPara,
  pausarVez,
  retomarVez,
  segundosRestantes,
  tempoEsgotado,
  tocarTimer,
  vezInicial,
} from '../src/dominios/centerpiece/logica/vez'

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

const IDS = ['a', 'b', 'c', 'd'] as const
const CTX = { id: 'e', agora: '2026-11-01T12:00:00.000Z' }
const nova = (config: ConfigMesa = configDoPreset('padrao')) => criarPartida('p', config, IDS, CTX.agora)
const pontos = (p: Partida) => [p.placar.pontos[0], p.placar.pontos[1], p.placar.pontos[2], p.placar.pontos[3]]
const soma = (p: Partida) => pontos(p).reduce((a, b) => a + b, 0) + p.placar.palitos * 1000

/** Passa o dealer com um ron pequeno de quem não é dealer. */
function passarDealer(p: Partida): Partida {
  const dealer = p.placar.cadeiraDealer
  const vencedor = ((dealer + 1) % 4) as 0 | 1 | 2 | 3
  const pagador = ((dealer + 2) % 4) as 0 | 1 | 2 | 3
  return registrarRon(p, { pagador, vencedores: [{ cadeira: vencedor, pontos: 1000 }] }, CTX)
}

teste('ron de não dealer paga, passa o dealer e zera honba', () => {
  const p = registrarRon(nova(), { pagador: 2, vencedores: [{ cadeira: 1, pontos: 3900 }] }, CTX)
  assert.deepEqual(pontos(p), [25000, 28900, 21100, 25000])
  assert.equal(p.placar.cadeiraDealer, 1)
  assert.equal(p.placar.rodadaNumero, 2)
  assert.equal(p.placar.honba, 0)
})

teste('dealer vence: fica, honba sobe e o valor da calculadora não ganha honba de novo', () => {
  let p = registrarRon(nova(), { pagador: 1, vencedores: [{ cadeira: 0, pontos: 1500 }] }, CTX)
  assert.equal(p.placar.cadeiraDealer, 0)
  assert.equal(p.placar.honba, 1)
  p = registrarRon(p, { pagador: 1, vencedores: [{ cadeira: 0, pontos: 1800 }] }, CTX)
  assert.deepEqual(pontos(p), [28300, 21700, 25000, 25000])
  assert.equal(p.placar.honba, 2)
})

teste('a cadeira nunca muda: só o vento gira ao passar o dealer', () => {
  const p = passarDealer(nova())
  assert.deepEqual(p.assentos[0].jogadorId, 'a')
  assert.equal(ventoDaCadeira(1, p.placar.cadeiraDealer), 'leste')
  assert.equal(ventoDaCadeira(0, p.placar.cadeiraDealer), 'norte')
})

teste('Riichi: desconta 1.000, vai para a mesa e o vencedor leva os palitos', () => {
  let p = declararRiichi(nova(), 2, CTX)
  assert.deepEqual(pontos(p), [25000, 25000, 24000, 25000])
  assert.equal(p.placar.palitos, 1)
  assert.equal(declararRiichi(p, 2, CTX), p)
  p = registrarTsumo(p, { vencedor: 1, pagamentoDealer: 2000, pagamentoNaoDealer: 1000 }, CTX)
  assert.deepEqual(pontos(p), [23000, 30000, 23000, 24000])
  assert.equal(p.placar.palitos, 0)
  assert.deepEqual(p.placar.riichi, [])
})

teste('tsumo do dealer: todos pagam o mesmo', () => {
  const p = registrarTsumo(nova(), { vencedor: 0, pagamentoDealer: 0, pagamentoNaoDealer: 2000 }, CTX)
  assert.deepEqual(pontos(p), [31000, 23000, 23000, 23000])
  assert.equal(p.placar.cadeiraDealer, 0)
})

teste('ron duplo: cada um recebe, Riichi do vencedor volta, resto para o mais próximo', () => {
  let p = declararRiichi(nova(), 3, CTX)
  p = declararRiichi(p, 1, CTX)
  p = registrarRon(p, { pagador: 0, vencedores: [{ cadeira: 3, pontos: 2000 }, { cadeira: 2, pontos: 1000 }] }, CTX)
  // Riichi da 1 (perdedor) vai para a 2, a mais próxima depois do pagador; a 3 recebe o próprio.
  assert.deepEqual(pontos(p), [22000, 24000, 27000, 27000])
  assert.equal(soma(p), 100000)
})

teste('ron duplo com dealer entre os vencedores mantém o dealer', () => {
  const p = registrarRon(nova(), { pagador: 2, vencedores: [{ cadeira: 0, pontos: 1000 }, { cadeira: 1, pontos: 1000 }] }, CTX)
  assert.equal(p.placar.cadeiraDealer, 0)
  assert.equal(p.placar.honba, 1)
})

teste('ryukyoku: noten paga, dealer tenpai fica, palitos seguem na mesa', () => {
  let p = declararRiichi(nova(), 1, CTX)
  p = registrarRyukyoku(p, { tenpai: [0, 1] }, CTX)
  assert.deepEqual(pontos(p), [26500, 25500, 23500, 23500])
  assert.equal(p.placar.cadeiraDealer, 0)
  assert.equal(p.placar.honba, 1)
  assert.equal(p.placar.palitos, 1)
  assert.deepEqual(p.placar.riichi, [])
})

teste('ryukyoku: dealer noten passa e honba sobe; 0 tenpai não troca pontos', () => {
  const p = registrarRyukyoku(nova(), { tenpai: [] }, CTX)
  assert.deepEqual(pontos(p), [25000, 25000, 25000, 25000])
  assert.equal(p.placar.cadeiraDealer, 1)
  assert.equal(p.placar.honba, 1)
})

teste('Nagashi Mangan substitui o noten', () => {
  const p = registrarRyukyoku(nova(), { tenpai: [0], nagashi: [1] }, CTX)
  assert.deepEqual(pontos(p), [21000, 33000, 23000, 23000])
})

teste('abortivo não paga e o dealer fica', () => {
  const p = registrarAbortivo(declararRiichi(nova(), 0, CTX), 'quatroVentos', CTX)
  assert.equal(p.placar.cadeiraDealer, 0)
  assert.equal(p.placar.honba, 1)
  assert.equal(p.placar.palitos, 1)
  assert.equal(p.placar.rodadaNumero, 1)
})

teste('chombo Mangan reverso paga na hora e devolve os palitos da mão', () => {
  let p = declararRiichi(nova(), 3, CTX)
  p = registrarChombo(p, 1, CTX)
  assert.deepEqual(pontos(p), [29000, 17000, 27000, 27000])
  assert.equal(p.placar.palitos, 0)
  assert.equal(p.placar.cadeiraDealer, 0)
  assert.equal(p.placar.honba, 0)
})

teste('chombo do dealer: 4.000 de cada lado', () => {
  assert.deepEqual(pontos(registrarChombo(nova(), 0, CTX)), [13000, 29000, 29000, 29000])
})

teste('chombo fixo não mexe nos pontos e sai da pontuação final', () => {
  let p = registrarChombo(nova(configDoPreset('wrc')), 1, CTX)
  assert.deepEqual(pontos(p), [30000, 30000, 30000, 30000])
  p = finalizarPartida(p, CTX.agora)
  const multado = p.resultado?.find((r) => r.cadeira === 1)
  assert.equal(multado?.multa, 30)
})

teste('Leste apenas acaba no Leste 4, sem voltar ao Leste 1', () => {
  const config = alterarConfig(configDoPreset('padrao'), { tipoPartida: 'leste', agariYame: false })
  let p = nova(config)
  for (let i = 0; i < 3; i += 1) p = passarDealer(p)
  assert.equal(p.placar.rodadaNumero, 4)
  assert.equal(p.fim, undefined)
  p = passarDealer(p)
  assert.equal(p.fim, 'ultimaMao')
  assert.equal(p.placar.rodadaVento, 'leste')
  assert.equal(p.placar.rodadaNumero, 4)
})

teste('Hanchan acaba no Sul 4', () => {
  let p = nova()
  for (let i = 0; i < 7; i += 1) p = passarDealer(p)
  assert.equal(p.placar.rodadaVento, 'sul')
  assert.equal(p.placar.rodadaNumero, 4)
  assert.equal(p.fim, undefined)
  assert.equal(passarDealer(p).fim, 'ultimaMao')
})

teste('tobi encerra; sem a regra, segue com negativo', () => {
  const ron = { pagador: 2 as const, vencedores: [{ cadeira: 1 as const, pontos: 32000 }] }
  assert.equal(registrarRon(nova(), ron, CTX).fim, 'tobi')
  const semTobi = nova(alterarConfig(configDoPreset('padrao'), { tobi: false }))
  assert.equal(registrarRon(semTobi, ron, CTX).fim, undefined)
})

teste('agari-yame: dealer em 1º na última mão pode encerrar, ou seguir', () => {
  const config = alterarConfig(configDoPreset('padrao'), { tipoPartida: 'leste' })
  let p = nova(config)
  for (let i = 0; i < 3; i += 1) p = passarDealer(p)
  p = registrarRon(p, { pagador: 0, vencedores: [{ cadeira: 3, pontos: 12000 }] }, CTX)
  assert.equal(p.agariYameDisponivel, true)
  assert.equal(p.fim, undefined)
  assert.equal(encerrarPorAgariYame(p).fim, 'agariYame')
  // Sem encerrar, o dealer repete a mão.
  assert.equal(p.placar.honba, 1)
  assert.equal(p.placar.rodadaNumero, 4)
})

teste('agari-yame desligado: dealer repete sem oferecer o fim', () => {
  const config = alterarConfig(configDoPreset('padrao'), { tipoPartida: 'leste', agariYame: false })
  let p = nova(config)
  for (let i = 0; i < 3; i += 1) p = passarDealer(p)
  p = registrarRon(p, { pagador: 0, vencedores: [{ cadeira: 3, pontos: 12000 }] }, CTX)
  assert.equal(p.agariYameDisponivel, undefined)
})

teste('prorrogação: sem ninguém no retorno, entra na rodada seguinte e acaba ao chegar', () => {
  const config = alterarConfig(configDoPreset('padrao'), { tipoPartida: 'leste', prorrogacao: true, agariYame: false })
  let p = nova(config)
  for (let i = 0; i < 4; i += 1) p = passarDealer(p)
  assert.equal(p.fim, undefined)
  assert.equal(p.placar.rodadaVento, 'sul')
  assert.equal(p.placar.rodadaNumero, 1)
  p = registrarRon(p, { pagador: 2, vencedores: [{ cadeira: 3, pontos: 8000 }] }, CTX)
  assert.equal(p.fim, 'retorno')
})

teste('prorrogação: alguém já no retorno encerra na última mão', () => {
  const config = alterarConfig(configDoPreset('padrao'), { tipoPartida: 'leste', prorrogacao: true, agariYame: false })
  let p = registrarRon(nova(config), { pagador: 2, vencedores: [{ cadeira: 1, pontos: 12000 }] }, CTX)
  for (let i = 0; i < 2; i += 1) p = passarDealer(p)
  assert.equal(passarDealer(p).fim, 'ultimaMao')
})

teste('desfazer volta o placar e limpa o fim', () => {
  const inicial = nova()
  const p = registrarRon(inicial, { pagador: 2, vencedores: [{ cadeira: 1, pontos: 32000 }] }, CTX)
  const desfeita = desfazer(p)
  assert.deepEqual(desfeita.placar, inicial.placar)
  assert.equal(desfeita.fim, undefined)
  assert.equal(desfeita.eventos.length, 0)
  assert.equal(desfazer(inicial), inicial)
})

teste('resultado com uma e oka: soma das finais fecha em zero', () => {
  let p = nova()
  p = registrarRon(p, { pagador: 2, vencedores: [{ cadeira: 1, pontos: 12000 }] }, CTX)
  const r = calcularResultado(p)
  assert.deepEqual(r.map((l) => l.cadeira), [1, 0, 3, 2])
  assert.equal(r[0].colocacao, 1)
  assert.equal(r[0].uma, 15)
  assert.equal(r[0].oka, 20)
  assert.equal(r[0].final, 42)
  assert.equal(r.reduce((total, l) => total + l.final, 0), 0)
})

teste('empate divide a uma e a oka e dá a mesma colocação', () => {
  const r = calcularResultado(nova())
  assert.deepEqual(r.map((l) => l.colocacao), [1, 1, 1, 1])
  assert.ok(r.every((l) => l.uma === 0 && l.oka === 5 && l.final === 0))
})

teste('palitos que sobram: 1º leva ou se perdem', () => {
  const p = declararRiichi(nova(), 1, CTX)
  const r = calcularResultado(p)
  // Três empatados em 1º dividem o palito, arredondado para baixo em centenas.
  assert.equal(r.filter((l) => l.pontosBrutos === 25300).length, 3)
  const wrc = calcularResultado(declararRiichi(nova(configDoPreset('wrc')), 1, CTX))
  assert.deepEqual(wrc.map((l) => l.pontosBrutos).sort((a, b) => a - b), [29000, 30000, 30000, 30000])
  const unico = registrarRon(nova(), { pagador: 2, vencedores: [{ cadeira: 1, pontos: 1000 }] }, CTX)
  const comPalito = calcularResultado(declararRiichi(unico, 3, CTX))
  assert.equal(comPalito[0].pontosBrutos, 27000)
})

teste('diferença de pontos em relação a cada um', () => {
  const p = registrarRon(nova(), { pagador: 2, vencedores: [{ cadeira: 1, pontos: 1000 }] }, CTX)
  assert.deepEqual(diferencasDePontos(p.placar, 2), [
    { cadeira: 0, diferenca: -1000 },
    { cadeira: 1, diferenca: -2000 },
    { cadeira: 3, diferenca: -1000 },
  ])
})

teste('timer: primeiro toque conta, próximo passa, zera e continua sinalizando', () => {
  let vez = vezInicial(2, 30)
  assert.equal(segundosRestantes(vez, 99999), 30)
  vez = tocarTimer(vez, 30, 1000)
  assert.equal(vez.cadeira, 2)
  assert.equal(segundosRestantes(vez, 11000), 20)
  assert.equal(tempoEsgotado(vez, 11000), false)
  assert.equal(segundosRestantes(vez, 99000), 0)
  assert.equal(tempoEsgotado(vez, 99000), true)
  const passada = tocarTimer(vez, 30, 99000)
  assert.equal(passada.cadeira, 3)
  assert.equal(segundosRestantes(passada, 99000), 30)
  assert.equal(tocarTimer(passada, 30, 100000).cadeira, 0)
})

teste('timer: pausa guarda o que faltava; "é a vez dele" pula direto', () => {
  let vez = tocarTimer(vezInicial(0, 60), 60, 0)
  vez = pausarVez(vez, 10000)
  assert.equal(segundosRestantes(vez, 500000), 50)
  vez = retomarVez(vez, 500000)
  assert.equal(segundosRestantes(vez, 505000), 45)
  assert.equal(passarVezPara(2, 60, 0).cadeira, 2)
})

teste('toda mão nova começa no dealer, parada', () => {
  const p = registrarTsumo(nova(), { vencedor: 1, pagamentoDealer: 1000, pagamentoNaoDealer: 500 }, CTX)
  assert.equal(p.vez.cadeira, 1)
  assert.equal(p.vez.comecou, false)
  assert.equal(p.vez.contandoDesde, null)
})

teste('dados: parede pela soma e valores de 1 a 6', () => {
  assert.deepEqual([1, 5, 9].map(paredeDaSoma), ['dealer', 'dealer', 'dealer'])
  assert.deepEqual([2, 6, 10].map(paredeDaSoma), ['direita', 'direita', 'direita'])
  assert.deepEqual([3, 7, 11].map(paredeDaSoma), ['frente', 'frente', 'frente'])
  assert.deepEqual([4, 8, 12].map(paredeDaSoma), ['esquerda', 'esquerda', 'esquerda'])
  const sequencia = [0.34, 0.7]
  const r = jogarDados(() => sequencia.shift() ?? 0)
  assert.deepEqual(r, { dado1: 3, dado2: 5, soma: 8, parede: 'esquerda' })
  assert.equal(jogarDados(() => 0.9999).soma, 12)
  assert.equal(jogarDados(() => 0).soma, 2)
})

teste('números de cada parede: Leste 1, 5 e 9; Norte 4, 8 e 12', () => {
  assert.deepEqual(numerosDaParede(0), [1, 5, 9])
  assert.deepEqual(numerosDaParede(1), [2, 6, 10])
  assert.deepEqual(numerosDaParede(2), [3, 7, 11])
  assert.deepEqual(numerosDaParede(3), [4, 8, 12])
})

teste('Centerpiece simples: dealer, renchan, honba e virada de rodada', () => {
  let e = repetirDealer(SIMPLES_INICIAL)
  assert.equal(e.honba, 1)
  assert.equal(e.cadeiraDealer, 0)
  e = proximoDealer(e)
  assert.deepEqual(e, { cadeiraDealer: 1, rodadaVento: 'leste', rodadaNumero: 2, honba: 0 })
  assert.equal(ajustarHonba(e, -1).honba, 0)
  for (let i = 0; i < 3; i += 1) e = proximoDealer(e)
  assert.equal(e.rodadaVento, 'sul')
  assert.equal(e.rodadaNumero, 1)
  assert.equal(e.cadeiraDealer, 0)
  assert.deepEqual(normalizarSimples({ cadeiraDealer: 9 }), SIMPLES_INICIAL)
})

const mesaAntiga = {
  iniciada: true,
  jogadores: [
    { id: '1', nome: 'Ana', pontos: 22500, vento: 'norte', riichi: false, posicao: 'direita' },
    { id: '2', nome: 'Bia', pontos: 31700, vento: 'leste', riichi: false, posicao: 'topo' },
    { id: '3', nome: 'Caio', pontos: 22900, vento: 'sul', riichi: false, posicao: 'esquerda' },
    { id: '4', nome: 'Dani', pontos: 22900, vento: 'oeste', riichi: false, posicao: 'baixo' },
  ],
  rodadaVento: 'leste',
  rodadaNumero: 2,
  honba: 0,
  riichiSticks: 0,
  pontosIniciais: 25000,
  historico: [
    {
      descricao: 'Tsumo',
      jogadores: [
        { nome: 'Ana', pontos: 26500, vento: 'leste' },
        { nome: 'Bia', pontos: 23500, vento: 'sul' },
        { nome: 'Caio', pontos: 25000, vento: 'oeste' },
        { nome: 'Dani', pontos: 25000, vento: 'norte' },
      ],
      rodadaVento: 'leste',
      rodadaNumero: 1,
      honba: 1,
      riichiSticks: 0,
    },
  ],
}

function migrar(mesa: unknown) {
  let n = 0
  return migrarMesaAntiga(
    JSON.stringify(mesa),
    (nomes) => nomes.map((nome) => `id-${nome}`),
    { gerarId: () => `g${(n += 1)}`, agora: CTX.agora },
  )
}

teste('migração: mesa antiga vira partida sem perder pontos, e o Desfazer funciona', () => {
  const p = migrar(mesaAntiga)
  assert.ok(p)
  assert.equal(p.assentos[0].jogadorId, 'id-Bia')
  assert.equal(p.assentos[1].jogadorId, 'id-Caio')
  assert.equal(p.placar.cadeiraDealer, 0)
  assert.equal(p.placar.pontos[0], 31700)
  assert.equal(somaPontos(p.placar), 100000)
  assert.equal(p.eventos.length, 1)
  assert.equal(p.eventos[0].tipo, 'legado')
  assert.equal(p.eventos[0].variacao[0], 8200)
  const desfeita = desfazer(p)
  assert.equal(desfeita.placar.pontos[3], 26500)
  assert.equal(desfeita.placar.cadeiraDealer, 3)
  assert.equal(desfeita.placar.honba, 1)
})

teste('migração: mesa não iniciada, inválida ou ilegível não vira partida', () => {
  assert.equal(migrar({ iniciada: false }), null)
  assert.equal(migrar({ iniciada: true, jogadores: [] }), null)
  assert.equal(migrarMesaAntiga('{quebrado', () => [], { gerarId: () => '', agora: '' }), null)
  assert.equal(migrarMesaAntiga(null, () => [], { gerarId: () => '', agora: '' }), null)
})

teste('migração: pontos iniciais diferentes viram Personalizado', () => {
  assert.equal(migrar({ ...mesaAntiga, pontosIniciais: 30000 })?.config.preset, 'personalizado')
  assert.equal(migrar(mesaAntiga)?.config.preset, 'padrao')
})

console.log(`Partida ok: ${testes} testes.`)
