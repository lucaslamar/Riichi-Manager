/**
 * Pontos corridos: liga em um encontro. Cada rodada é sorteada na hora (botão Nova
 * rodada), tentando várias ordens e ficando com a que menos repete adversários.
 * Não há número de rodadas: o organizador encerra quando quiser.
 */
import { embaralhar, inteiroAleatorioSeguro, type InteiroAleatorio } from '@/dominios/centerpiece/logica/sorteioClube'
import type { RodadaTorneio } from '../tipos'
import { contarPares, custoDaMesa, mesasPelaOrdem } from './comum'

const TENTATIVAS = 300

export function rodadaCorridos(
  jogadorIds: readonly string[],
  anteriores: readonly RodadaTorneio[],
  numero: number,
  agora: string,
  aleatorio: InteiroAleatorio = inteiroAleatorioSeguro,
): RodadaTorneio {
  const pares = contarPares(anteriores)
  let melhor = mesasPelaOrdem(embaralhar(jogadorIds, aleatorio), anteriores)
  let melhorCusto = Infinity
  for (let tentativa = 0; tentativa < TENTATIVAS && melhorCusto > 0; tentativa++) {
    const mesas = tentativa === 0 ? melhor : mesasPelaOrdem(embaralhar(jogadorIds, aleatorio), anteriores)
    const custo = mesas.reduce((soma, mesa) => soma + custoDaMesa(mesa.assentos, pares), 0)
    if (custo < melhorCusto) {
      melhorCusto = custo
      melhor = mesas
    }
  }
  return { numero, geradaEm: agora, mesas: melhor }
}
