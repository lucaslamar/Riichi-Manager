/**
 * Sorteio das mesas de um encontro do clube, em TypeScript puro.
 *
 * Embaralha com Fisher-Yates e corta em grupos de 4 na ordem embaralhada. Dentro
 * de cada mesa, a própria ordem já é o sorteio dos ventos: 1º Leste, 2º Sul,
 * 3º Oeste e 4º Norte. O número aleatório vem de quem chama, para dar para testar.
 */
import { embaralhar, inteiroAleatorioSeguro, type InteiroAleatorio } from '@/compartilhado/sorteio/aleatorio'
import { ORDEM_VENTOS, type Vento } from './partida'

export { embaralhar, inteiroAleatorioSeguro, type InteiroAleatorio }

export interface MesaSorteada<T> {
  /** A partir de 1, como aparece na tela. */
  numero: number
  /** Sempre 4, na ordem Leste, Sul, Oeste, Norte. */
  assentos: { vento: Vento; jogador: T }[]
}

type ErroSorteio = 'poucos' | 'naoMultiplo'

type ResultadoSorteio<T> = { ok: true; mesas: MesaSorteada<T>[] } | { ok: false; erro: ErroSorteio }

/** Quantas mesas fecham e quanto falta ou sobra para fechar a próxima. */
export function contagemDeMesas(total: number) {
  const resto = total % 4
  return {
    mesas: Math.floor(total / 4),
    /** Jogadores que faltam para fechar a mesa incompleta (0 se fecha certinho). */
    faltam: resto === 0 ? (total === 0 ? 4 : 0) : 4 - resto,
    /** Jogadores sobrando além das mesas completas. */
    sobram: resto,
    podeSortear: total >= 4 && resto === 0,
  }
}

export function sortearMesas<T>(
  jogadores: readonly T[],
  aleatorio: InteiroAleatorio = inteiroAleatorioSeguro,
): ResultadoSorteio<T> {
  if (jogadores.length < 4) return { ok: false, erro: 'poucos' }
  if (jogadores.length % 4 !== 0) return { ok: false, erro: 'naoMultiplo' }

  const ordem = embaralhar(jogadores, aleatorio)
  const mesas: MesaSorteada<T>[] = []
  for (let inicio = 0; inicio < ordem.length; inicio += 4) {
    mesas.push({
      numero: mesas.length + 1,
      assentos: ORDEM_VENTOS.map((vento, indice) => ({ vento, jogador: ordem[inicio + indice] })),
    })
  }
  return { ok: true, mesas }
}
