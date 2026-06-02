import { calcularPontuacaoHanFu } from './calcularPontuacaoHanFu'
import { formatarPontos } from './formatarResultadoHanFu'
import { FU_REFERENCIA, HAN_REFERENCIA, obterFuValidos } from './tabelaPontuacao'
import type { EntradaPontuacaoHanFu, PagamentosReferenciaHanFu, ReferenciaRapidaHanFu } from './tipos'

const LIMITES_REFERENCIA = [
  { han: 5, faixa: '5 Han' },
  { han: 6, faixa: '6-7 Han' },
  { han: 8, faixa: '8-10 Han' },
  { han: 11, faixa: '11-12 Han' },
  { han: 13, faixa: '13 Han' },
  { han: 14, faixa: '2Y' },
  { han: 15, faixa: '3Y' },
  { han: 16, faixa: '4Y' },
  { han: 17, faixa: '5Y' },
  { han: 18, faixa: '6Y' },
] as const

export function montarReferenciaRapida(entrada: Pick<EntradaPontuacaoHanFu, 'han' | 'fu'>): ReferenciaRapidaHanFu {
  const linhas = HAN_REFERENCIA.filter((han) => han < 5).map((han) => {
    const fuValidos = obterFuValidos(han)
    return {
      han,
      celulas: FU_REFERENCIA.map((fu) => {
        if (!fuValidos.includes(fu)) {
          return {
            han,
            fu,
            categoria: 'normal' as const,
            ativa: entrada.han === han && entrada.fu === fu,
            disponivel: false,
            pagamentos: null,
          }
        }

        const pagamentos = calcularPagamentosBase(han, fu)

        return {
          han,
          fu,
          categoria: calcularPontuacaoHanFu({ han, fu, ehDealer: false, tipoVitoria: 'ron', honba: 0 }).categoria,
          ativa: entrada.han === han && entrada.fu === fu,
          disponivel: true,
          pagamentos,
        }
      }),
    }
  })

  return {
    linhas,
    limites: LIMITES_REFERENCIA.map(({ han, faixa }) => ({
      han,
      faixa,
      categoria: calcularPontuacaoHanFu({ han, fu: 30, ehDealer: false, tipoVitoria: 'ron', honba: 0 }).categoria,
      pagamentos: calcularPagamentosBase(han, 30),
      ativo: limiteEstaAtivo(entrada.han, han),
    })),
  }
}

function calcularPagamentosBase(han: number, fu: number): PagamentosReferenciaHanFu {
  const ronNaoLeste = calcularPontuacaoHanFu({ han, fu, ehDealer: false, tipoVitoria: 'ron', honba: 0 })
  const ronLeste = calcularPontuacaoHanFu({ han, fu, ehDealer: true, tipoVitoria: 'ron', honba: 0 })
  const tsumoNaoLeste = calcularPontuacaoHanFu({ han, fu, ehDealer: false, tipoVitoria: 'tsumo', honba: 0 })
  const tsumoLeste = calcularPontuacaoHanFu({ han, fu, ehDealer: true, tipoVitoria: 'tsumo', honba: 0 })

  return {
    ronNaoLeste: formatarPontos(ronNaoLeste.ron ?? ronNaoLeste.principal),
    ronLeste: formatarPontos(ronLeste.ron ?? ronLeste.principal),
    tsumoNaoLeste: `${formatarPontos(tsumoNaoLeste.tsumo?.nonDealer ?? 0)}-${formatarPontos(
      tsumoNaoLeste.tsumo?.dealer ?? 0,
    )}`,
    tsumoLeste: `${formatarPontos(tsumoLeste.tsumo?.all ?? 0)} all`,
  }
}

function limiteEstaAtivo(hanSelecionado: number, hanLimite: number): boolean {
  if (hanLimite === 6) return hanSelecionado >= 6 && hanSelecionado <= 7
  if (hanLimite === 8) return hanSelecionado >= 8 && hanSelecionado <= 10
  if (hanLimite === 11) return hanSelecionado >= 11 && hanSelecionado <= 12
  return hanSelecionado === hanLimite
}
