import { calcularPontuacaoHanFu } from './calcularPontuacaoHanFu'
import type { CategoriaPontuacaoHanFu, EntradaPontuacaoHanFu } from './tipos'

interface CasoTestePontuacaoHanFu {
  nome: string
  entrada: EntradaPontuacaoHanFu
  esperado: {
    principal: number
    categoria: CategoriaPontuacaoHanFu
    ron?: number
    tsumoDealer?: number
    tsumoNonDealer?: number
    tsumoAll?: number
  }
}

export const casosTestePontuacaoHanFu: CasoTestePontuacaoHanFu[] = [
  { nome: 'Nao leste ron 1 han 30 fu', entrada: { han: 1, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 1000, categoria: 'normal', ron: 1000 } },
  { nome: 'Nao leste ron 2 han 30 fu', entrada: { han: 2, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 2000, categoria: 'normal', ron: 2000 } },
  { nome: 'Nao leste ron 3 han 30 fu', entrada: { han: 3, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 3900, categoria: 'normal', ron: 3900 } },
  { nome: 'Nao leste ron 4 han 30 fu', entrada: { han: 4, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 7700, categoria: 'normal', ron: 7700 } },
  { nome: 'Nao leste ron 4 han 40 fu mangan', entrada: { han: 4, fu: 40, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 8000, categoria: 'mangan', ron: 8000 } },
  { nome: 'Nao leste tsumo 1 han 30 fu', entrada: { han: 1, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 1100, categoria: 'normal', tsumoDealer: 500, tsumoNonDealer: 300 } },
  { nome: 'Nao leste tsumo 2 han 30 fu', entrada: { han: 2, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 2000, categoria: 'normal', tsumoDealer: 1000, tsumoNonDealer: 500 } },
  { nome: 'Nao leste tsumo 3 han 30 fu', entrada: { han: 3, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 4000, categoria: 'normal', tsumoDealer: 2000, tsumoNonDealer: 1000 } },
  { nome: 'Nao leste tsumo 4 han 30 fu', entrada: { han: 4, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 7900, categoria: 'normal', tsumoDealer: 3900, tsumoNonDealer: 2000 } },
  { nome: 'Leste ron 1 han 30 fu', entrada: { han: 1, fu: 30, ehDealer: true, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 1500, categoria: 'normal', ron: 1500 } },
  { nome: 'Leste ron 2 han 30 fu', entrada: { han: 2, fu: 30, ehDealer: true, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 2900, categoria: 'normal', ron: 2900 } },
  { nome: 'Leste ron 3 han 30 fu', entrada: { han: 3, fu: 30, ehDealer: true, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 5800, categoria: 'normal', ron: 5800 } },
  { nome: 'Leste ron 4 han 30 fu', entrada: { han: 4, fu: 30, ehDealer: true, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 11600, categoria: 'normal', ron: 11600 } },
  { nome: 'Leste ron 4 han 40 fu mangan', entrada: { han: 4, fu: 40, ehDealer: true, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 12000, categoria: 'mangan', ron: 12000 } },
  { nome: 'Leste tsumo 1 han 30 fu', entrada: { han: 1, fu: 30, ehDealer: true, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 1500, categoria: 'normal', tsumoAll: 500 } },
  { nome: 'Leste tsumo 2 han 30 fu', entrada: { han: 2, fu: 30, ehDealer: true, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 3000, categoria: 'normal', tsumoAll: 1000 } },
  { nome: 'Leste tsumo 3 han 30 fu', entrada: { han: 3, fu: 30, ehDealer: true, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 6000, categoria: 'normal', tsumoAll: 2000 } },
  { nome: 'Leste tsumo 4 han 30 fu', entrada: { han: 4, fu: 30, ehDealer: true, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 11700, categoria: 'normal', tsumoAll: 3900 } },
  { nome: 'Chiitoitsu 25 fu', entrada: { han: 2, fu: 25, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 1600, categoria: 'normal', ron: 1600 } },
  { nome: 'Pinfu tsumo 20 fu', entrada: { han: 2, fu: 20, ehDealer: false, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 1500, categoria: 'normal', tsumoDealer: 700, tsumoNonDealer: 400 } },
  { nome: '5 han mangan', entrada: { han: 5, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 8000, categoria: 'mangan', ron: 8000 } },
  { nome: '6 han haneman', entrada: { han: 6, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 12000, categoria: 'haneman', ron: 12000 } },
  { nome: '8 han baiman', entrada: { han: 8, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 16000, categoria: 'baiman', ron: 16000 } },
  { nome: '11 han sanbaiman', entrada: { han: 11, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 24000, categoria: 'sanbaiman', ron: 24000 } },
  { nome: '13 han yakuman', entrada: { han: 13, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 32000, categoria: 'yakuman', ron: 32000 } },
  { nome: '2Y nao leste ron', entrada: { han: 14, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 64000, categoria: 'yakuman', ron: 64000 } },
  { nome: '3Y nao leste ron', entrada: { han: 15, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 96000, categoria: 'yakuman', ron: 96000 } },
  { nome: '6Y leste ron', entrada: { han: 18, fu: 30, ehDealer: true, tipoVitoria: 'ron', honba: 0 }, esperado: { principal: 288000, categoria: 'yakuman', ron: 288000 } },
  { nome: '2Y nao leste tsumo', entrada: { han: 14, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 64000, categoria: 'yakuman', tsumoDealer: 32000, tsumoNonDealer: 16000 } },
  { nome: '4Y leste tsumo', entrada: { han: 16, fu: 30, ehDealer: true, tipoVitoria: 'tsumo', honba: 0 }, esperado: { principal: 192000, categoria: 'yakuman', tsumoAll: 64000 } },
  { nome: 'Honba ron', entrada: { han: 3, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 2 }, esperado: { principal: 4500, categoria: 'normal', ron: 4500 } },
  { nome: 'Honba tsumo nao leste', entrada: { han: 4, fu: 30, ehDealer: false, tipoVitoria: 'tsumo', honba: 1 }, esperado: { principal: 8200, categoria: 'normal', tsumoDealer: 4000, tsumoNonDealer: 2100 } },
  { nome: 'Honba tsumo leste', entrada: { han: 3, fu: 30, ehDealer: true, tipoVitoria: 'tsumo', honba: 1 }, esperado: { principal: 6300, categoria: 'normal', tsumoAll: 2100 } },
]

export function validarCasosTestePontuacaoHanFu(): string[] {
  const falhasTabela = casosTestePontuacaoHanFu.flatMap((caso) => {
    const resultado = calcularPontuacaoHanFu(caso.entrada)
    const falhas = [
      resultado.principal === caso.esperado.principal
        ? null
        : `${caso.nome}: principal ${resultado.principal} != ${caso.esperado.principal}`,
      resultado.categoria === caso.esperado.categoria
        ? null
        : `${caso.nome}: categoria ${resultado.categoria} != ${caso.esperado.categoria}`,
      caso.esperado.ron === undefined || resultado.ron === caso.esperado.ron
        ? null
        : `${caso.nome}: ron ${resultado.ron} != ${caso.esperado.ron}`,
      caso.esperado.tsumoDealer === undefined || resultado.tsumo?.dealer === caso.esperado.tsumoDealer
        ? null
        : `${caso.nome}: tsumo dealer ${resultado.tsumo?.dealer} != ${caso.esperado.tsumoDealer}`,
      caso.esperado.tsumoNonDealer === undefined || resultado.tsumo?.nonDealer === caso.esperado.tsumoNonDealer
        ? null
        : `${caso.nome}: tsumo nao dealer ${resultado.tsumo?.nonDealer} != ${caso.esperado.tsumoNonDealer}`,
      caso.esperado.tsumoAll === undefined || resultado.tsumo?.all === caso.esperado.tsumoAll
        ? null
        : `${caso.nome}: tsumo all ${resultado.tsumo?.all} != ${caso.esperado.tsumoAll}`,
    ]

    return falhas.filter((falha): falha is string => falha !== null)
  })

  const falhasTransicao = [
    calcularPontuacaoHanFu({ han: 13, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }).yakumanMultiplo === 1
      ? null
      : '13 Han deve representar Yakuman simples',
    calcularPontuacaoHanFu({ han: 14, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }).yakumanMultiplo === 2
      ? null
      : 'Depois de 13 Han, o proximo estado deve ser 2Y',
    calcularPontuacaoHanFu({ han: 18, fu: 30, ehDealer: true, tipoVitoria: 'ron', honba: 0 }).yakumanMultiplo === 6
      ? null
      : 'O limite superior deve ser 6Y',
  ].filter((falha): falha is string => falha !== null)

  return [...falhasTabela, ...falhasTransicao]
}
