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
  escolherPreset,
  IDS_PRESET,
  normalizarConfig,
  reiniciarConfig,
  somaUma,
} from '../src/dominios/centerpiece/logica/configMesa'
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

teste('padrão do app: 25.000, retorno 30.000, oka 20.000, timer 30 s, descartes desligado', () => {
  const config = configDoPreset('padrao')
  assert.equal(config.pontosPartida, 25000)
  assert.equal(config.pontosRetorno, 30000)
  assert.equal(calcularOka(config), 20000)
  assert.equal(config.timerVez, 30)
  assert.equal(config.registrarDescartes, false)
})

teste('toda uma de preset fecha em zero', () => {
  for (const preset of IDS_PRESET) assert.equal(somaUma(configDoPreset(preset).uma), 0, preset)
})

teste('WRC 2025: 30.000 sem oka, 15/5, um vencedor, palitos perdidos, sem abortivos', () => {
  const config = configDoPreset('wrc')
  assert.equal(calcularOka(config), 0)
  assert.deepEqual(config.uma, [15, 5, -5, -15])
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
  assert.deepEqual(config.uma, [30, 10, -10, -30])
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
  configDoPreset('padrao').uma[0] = 99
  configDoPreset('padrao').abortivos.quatroKans = false
  assert.equal(configDoPreset('padrao').uma[0], 15)
  assert.equal(configDoPreset('padrao').abortivos.quatroKans, true)
  assert.equal(configDoPreset('cerrado').uma[0], 15)
})

teste('soma da uma acusa quando não fecha', () => {
  assert.equal(somaUma([20, 5, -5, -15]), 5)
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

console.log(`Config de mesa ok: ${testes} testes.`)
