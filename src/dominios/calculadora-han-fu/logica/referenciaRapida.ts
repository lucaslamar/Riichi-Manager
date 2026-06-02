import { calcularPontuacaoHanFu } from './calcularPontuacaoHanFu'
import { FU_REFERENCIA, HAN_REFERENCIA, obterFuValidos } from './tabelaPontuacao'
import type { EntradaPontuacaoHanFu, LinhaReferenciaHanFu } from './tipos'

export function montarReferenciaRapida(entrada: EntradaPontuacaoHanFu): LinhaReferenciaHanFu[] {
  return HAN_REFERENCIA.map((han) => {
    const fuValidos = obterFuValidos(han)
    return {
      han,
      celulas: FU_REFERENCIA.map((fu) => {
        if (han < 5 && !fuValidos.includes(fu)) {
          return {
            han,
            fu,
            rotulo: '-',
            categoria: 'normal',
            ativa: entrada.han === han && entrada.fu === fu,
          }
        }

        const resultado = calcularPontuacaoHanFu({
          ...entrada,
          han,
          fu: han >= 5 ? entrada.fu : fu,
          honba: 0,
        })

        return {
          han,
          fu,
          rotulo: resultado.nomeCategoria ?? resultado.totalFormatado,
          categoria: resultado.categoria,
          ativa: (han >= 5 ? entrada.han >= 5 && entrada.fu === fu : entrada.han === han && entrada.fu === fu),
        }
      }),
    }
  })
}
