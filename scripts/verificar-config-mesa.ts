/**
 * Testes de ConfigMesa: presets, troca para Personalizado, Reiniciar, oka, uma e
 * leitura de dados salvos.
 *
 * Uso: npm run test:config-mesa
 */
import assert from 'node:assert/strict'
import type { ArmazenamentoChaveValor } from '../src/compartilhado/persistencia/armazenamento'
import {
  alterarConfig,
  calcularOka,
  configDoPreset,
  configSoPontuacao,
  escolherPreset,
  IDS_PRESET,
  normalizarConfig,
  reiniciarConfig,
  retornoComOka,
  somaUma,
} from '../src/dominios/centerpiece/logica/configMesa'
import { calcularPontuacaoHanFu } from '../src/dominios/calculadora-han-fu/logica/calcularPontuacaoHanFu'
import { exemploPontuacao } from '../src/dominios/centerpiece/logica/exemploPontuacao'
import {
  calcularUma,
  linhaDaContagem,
  linhaUmaValida,
  TABELA_FLUTUANTE_EXEMPLO,
  umaFixa,
  umaSimetrica,
  umaValida,
  type ValoresUma,
} from '../src/dominios/centerpiece/logica/uma'
import {
  carregarUltimaConfig,
  salvarUltimaConfig,
} from '../src/dominios/centerpiece/persistencia/repositorioConfigMesa'

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

teste('Clube (padrão do app): Leste, sem oka, uma flutuante, kiriage, prorrogação, timer de 30 s', () => {
  const config = configDoPreset('padrao')
  assert.equal(config.pontosPartida, 25000)
  assert.equal(config.pontosRetorno, 25000)
  assert.equal(calcularOka(config), 0)
  assert.deepEqual(config.uma, { tipo: 'flutuante', tabela: TABELA_FLUTUANTE_EXEMPLO })
  assert.equal(config.regrasCalculo.kiriageMangan, true)
  assert.equal(config.timerVez, 30)
  assert.equal(config.tipoPartida, 'leste')
  assert.equal(config.prorrogacao, true)
  assert.ok(Object.values(config.abortivos).every((ligado) => !ligado))
})

teste('meta da prorrogação: 30.000 nos presets e, em config antiga, o retorno salvo', () => {
  for (const preset of IDS_PRESET) assert.equal(configDoPreset(preset).metaProrrogacao, 30000, preset)
  assert.equal(normalizarConfig({ pontosRetorno: 35000 }).metaProrrogacao, 35000)
  assert.equal(normalizarConfig({ pontosRetorno: 35000, metaProrrogacao: 32000 }).metaProrrogacao, 32000)
  assert.equal(normalizarConfig(undefined).metaProrrogacao, 30000)
  assert.equal(alterarConfig(configDoPreset('padrao'), { metaProrrogacao: 28000 }).preset, 'personalizado')
})

teste('toda uma de preset fecha em zero', () => {
  for (const preset of IDS_PRESET) assert.ok(umaValida(configDoPreset(preset).uma), preset)
})

teste('WRC 2025: 30.000 sem oka, 15/5, um vencedor, palitos perdidos, sem abortivos', () => {
  const config = configDoPreset('wrc')
  assert.equal(calcularOka(config), 0)
  assert.deepEqual(config.uma, umaFixa([15, 5, -5, -15]))
  assert.equal(config.ronMultiplo, 'atamaHane')
  assert.equal(config.palitosRestantes, 'perdidos')
  assert.equal(config.tobi, false)
  assert.equal(config.agariYame, false)
  assert.equal(config.nagashiMangan, false)
  assert.deepEqual(config.chombo, { tipo: 'fixo', valor: 30000 })
  assert.ok(Object.values(config.abortivos).every((ligado) => !ligado))
})

teste('EMA 2025: ron múltiplo permitido e palitos para o 1º', () => {
  const config = configDoPreset('ema')
  assert.equal(config.ronMultiplo, 'duploTriploPermitidos')
  assert.equal(config.palitosRestantes, 'primeiro')
  assert.equal(calcularOka(config), 0)
})

teste('M.League: 25.000/30.000 e uma 30/10', () => {
  const config = configDoPreset('mleague')
  assert.equal(calcularOka(config), 20000)
  assert.deepEqual(config.uma, umaFixa([30, 10, -10, -30]))
})

teste('mudar qualquer campo vira Personalizado e guarda a origem', () => {
  const config = alterarConfig(configDoPreset('wrc'), { timerVez: 60 })
  assert.equal(config.preset, 'personalizado')
  assert.equal(config.presetBase, 'wrc')
  assert.equal(config.timerVez, 60)
})

teste('Reiniciar volta ao preset escolhido', () => {
  const mudada = alterarConfig(configDoPreset('ema'), { pontosPartida: 1000, tobi: true })
  assert.deepEqual(reiniciarConfig(mudada), configDoPreset('ema'))
})

teste('escolher Personalizado mantém os valores; escolher preset aplica os dele', () => {
  const wrc = configDoPreset('wrc')
  assert.deepEqual(escolherPreset(wrc, 'personalizado'), { ...wrc, preset: 'personalizado' })
  assert.deepEqual(escolherPreset(wrc, 'mleague'), configDoPreset('mleague'))
})

teste('mexer na config devolvida não altera o preset', () => {
  const alterada = configDoPreset('padrao')
  if (alterada.uma.tipo === 'flutuante') alterada.uma.tabela.nenhum[0] = 99
  configDoPreset('padrao').abortivos.quatroKans = true
  assert.deepEqual(configDoPreset('padrao').uma, { tipo: 'flutuante', tabela: TABELA_FLUTUANTE_EXEMPLO })
  assert.equal(TABELA_FLUTUANTE_EXEMPLO.nenhum[0], 8)
  assert.equal(configDoPreset('padrao').abortivos.quatroKans, false)
})

teste('Cerrado/ABM salvo vira Personalizado, com os mesmos valores', () => {
  const salva = { ...configDoPreset('padrao'), preset: 'cerrado', presetBase: 'cerrado', pontosPartida: 27000 }
  const lida = normalizarConfig(salva)
  assert.equal(lida.preset, 'personalizado')
  assert.equal(lida.presetBase, 'padrao')
  assert.equal(lida.pontosPartida, 27000)
})

teste('só restam 4 presets, e WRC, EMA e M.League usam o valor fixo oficial', () => {
  assert.deepEqual([...IDS_PRESET], ['padrao', 'wrc', 'ema', 'mleague'])
  assert.deepEqual(configDoPreset('wrc').chombo, { tipo: 'fixo', valor: 30000 })
  assert.deepEqual(configDoPreset('ema').chombo, { tipo: 'fixo', valor: 20000 })
  assert.deepEqual(configDoPreset('mleague').chombo, { tipo: 'fixo', valor: 20000 })
})

teste('exemplo de pontuação usa os valores da tela', () => {
  const com = exemploPontuacao(configDoPreset('mleague'))
  assert.equal(com[0].oka, 20)
  assert.equal(com.reduce((soma, linha) => soma + linha.final, 0), 0)
  const padrao = exemploPontuacao({ pontosPartida: 25000, pontosRetorno: 30000, uma: umaFixa([15, 5, -5, -15]) })
  assert.deepEqual(padrao.map((linha) => linha.final), [47, 3, -17, -33])
  const sem = exemploPontuacao({ pontosPartida: 30000, pontosRetorno: 30000, uma: umaFixa([15, 5, -5, -15]) })
  assert.equal(sem[0].oka, 0)
})

teste('soma da uma acusa quando não fecha', () => {
  assert.equal(somaUma([20, 5, -5, -15]), 5)
})

teste('regras de cálculo dos presets e de partidas antigas', () => {
  assert.equal(configDoPreset('wrc').regrasCalculo.akadora, false)
  assert.equal(configDoPreset('ema').regrasCalculo.akadora, false)
  assert.equal(configDoPreset('mleague').regrasCalculo.akadora, true)
  for (const preset of IDS_PRESET) {
    const { regrasCalculo } = configDoPreset(preset)
    assert.equal(regrasCalculo.tanyaoAberto, true, preset)
    assert.equal(regrasCalculo.doraFlamejante, false, preset)
    assert.equal(regrasCalculo.basengo, false, preset)
  }
  const mudada = alterarConfig(configDoPreset('wrc'), {
    regrasCalculo: { ...configDoPreset('wrc').regrasCalculo, akadora: true },
  })
  assert.equal(mudada.preset, 'personalizado')
  assert.equal(normalizarConfig({ preset: 'padrao' }).regrasCalculo.akadora, true)
  assert.equal(normalizarConfig({ regrasCalculo: { basengo: true } }).regrasCalculo.basengo, true)
})

teste('basengo: honba vale 1500 no ron e 500 por jogador no tsumo', () => {
  const base = { han: 1, fu: 30, ehDealer: false, honba: 1, basengo: true }
  assert.equal(calcularPontuacaoHanFu({ ...base, tipoVitoria: 'ron' }).ron, 1000 + 1500)
  const tsumo = calcularPontuacaoHanFu({ ...base, tipoVitoria: 'tsumo' }).tsumo
  assert.deepEqual([tsumo?.dealer, tsumo?.nonDealer], [500 + 500, 300 + 500])
  assert.equal(calcularPontuacaoHanFu({ ...base, basengo: false, tipoVitoria: 'ron' }).ron, 1300)
})

teste('sem oka, o retorno é a partida; com oka, 5.000 acima', () => {
  assert.equal(retornoComOka(25000, false), 25000)
  assert.equal(retornoComOka(25000, true), 30000)
  assert.equal(calcularOka({ pontosPartida: 25000, pontosRetorno: retornoComOka(25000, false) }), 0)
  const sem = exemploPontuacao({ pontosPartida: 25000, pontosRetorno: 25000, uma: umaFixa([15, 5, -5, -15]) })
  assert.equal(sem.reduce((soma, linha) => soma + linha.final, 0), 0)
})

teste('uma 5-15 e 10-30 viram os 4 valores', () => {
  assert.deepEqual(umaSimetrica(5, 15), [15, 5, -5, -15])
  assert.deepEqual(umaSimetrica(10, 30), [30, 10, -10, -30])
})

teste('uma com 3º maior que o 2º ou soma diferente de zero é inválida', () => {
  assert.equal(linhaUmaValida([15, -5, 5, -15]), false)
  assert.equal(linhaUmaValida([20, 5, -5, -15]), false)
  assert.equal(linhaUmaValida([12, -1, -3, -8]), true)
})

const flutuante = { uma: { tipo: 'flutuante', tabela: TABELA_FLUTUANTE_EXEMPLO } as const, pontosRetorno: 30000 }

teste('uma flutuante: a linha sai de quantos terminaram no retorno ou acima', () => {
  assert.equal(linhaDaContagem([25000, 25000, 25000, 25000], 30000), 'nenhum')
  assert.equal(linhaDaContagem([45000, 25000, 20000, 10000], 30000), 'um')
  assert.equal(linhaDaContagem([40000, 30000, 20000, 10000], 30000), 'dois')
  assert.equal(linhaDaContagem([35000, 33000, 31000, 1000], 30000), 'tres')
  assert.equal(linhaDaContagem([30000, 30000, 30000, 30000], 30000), 'nenhum')
})

teste('uma flutuante: cada caso da tabela, na ordem dos jogadores', () => {
  const casos: [number[], ValoresUma][] = [
    [[45000, 25000, 20000, 10000], [12, -1, -3, -8]],
    [[40000, 30000, 20000, 10000], [8, 4, -4, -8]],
    [[35000, 33000, 31000, 1000], [8, 3, 1, -12]],
    [[28000, 26000, 24000, 22000], [8, 4, -4, -8]],
  ]
  for (const [pontos, esperado] of casos) assert.deepEqual(calcularUma(flutuante, pontos), esperado)
  assert.deepEqual(calcularUma(flutuante, [10000, 45000, 25000, 20000]), [-8, 12, -1, -3])
})

teste('empate divide a uma das colocações empatadas', () => {
  assert.deepEqual(calcularUma({ uma: umaFixa([15, 5, -5, -15]), pontosRetorno: 30000 }, [40000, 20000, 20000, 20000]), [15, -5, -5, -5])
  assert.deepEqual(calcularUma(flutuante, [40000, 40000, 10000, 10000]), [6, 6, -6, -6])
})

teste('config antiga com a uma em lista vira fixa, com os mesmos valores', () => {
  assert.deepEqual(normalizarConfig({ uma: [20, 10, -10, -20] }).uma, umaFixa([20, 10, -10, -20]))
})

teste('dado salvo inválido cai no preset de origem, sem perder o que vale', () => {
  const lida = normalizarConfig({
    preset: 'personalizado',
    presetBase: 'wrc',
    pontosPartida: 'muitos',
    uma: [1, 2],
    timerVez: 45,
    tobi: true,
    chombo: { tipo: 'fixo' },
  })
  const wrc = configDoPreset('wrc')
  assert.equal(lida.preset, 'personalizado')
  assert.equal(lida.pontosPartida, wrc.pontosPartida)
  assert.deepEqual(lida.uma, wrc.uma)
  assert.equal(lida.timerVez, 30)
  assert.equal(lida.tobi, true)
  assert.deepEqual(lida.chombo, wrc.chombo)
  assert.deepEqual(normalizarConfig(undefined), configDoPreset('padrao'))
})

function memoria(inicial?: string): ArmazenamentoChaveValor & { valor: string | null } {
  return {
    valor: inicial ?? null,
    ler() {
      return this.valor
    },
    gravar(_chave, valor) {
      this.valor = valor
    },
  }
}

teste('a última config salva volta como padrão da próxima partida', () => {
  const armazenamento = memoria()
  assert.deepEqual(carregarUltimaConfig(armazenamento), configDoPreset('padrao'))
  const config = alterarConfig(configDoPreset('ema'), { timerVez: 90 })
  salvarUltimaConfig(armazenamento, config)
  assert.equal(JSON.parse(armazenamento.valor ?? '').versao, 1)
  assert.deepEqual(carregarUltimaConfig(armazenamento), config)
  assert.deepEqual(carregarUltimaConfig(memoria('{quebrado')), configDoPreset('padrao'))
})

teste('torneio: só a Pontuação vale, o resto vem do padrão do conjunto', () => {
  const mexida = alterarConfig(configDoPreset('padrao'), {
    pontosPartida: 30000,
    pontosRetorno: 30000,
    tobi: false,
    timerVez: 90,
    abortivos: { kyuushuKyuuhai: false, quatroVentos: false, quatroKans: false, quatroRiichis: false },
  })
  const usada = configSoPontuacao(mexida)
  const padrao = configDoPreset('padrao')
  assert.equal(usada.pontosPartida, 30000)
  assert.equal(usada.pontosRetorno, 30000)
  assert.deepEqual(usada.uma, mexida.uma)
  assert.equal(usada.tobi, padrao.tobi)
  assert.equal(usada.timerVez, padrao.timerVez)
  assert.deepEqual(usada.abortivos, padrao.abortivos)
  assert.deepEqual(usada.regrasCalculo, padrao.regrasCalculo)
})

console.log(`Config de mesa ok: ${testes} testes.`)
