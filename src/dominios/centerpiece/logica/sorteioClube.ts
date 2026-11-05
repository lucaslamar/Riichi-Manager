/**
 * Sorteio das mesas de um encontro do clube, em TypeScript puro.
 *
 * Embaralha com Fisher-Yates e corta em grupos de 4 na ordem embaralhada. Dentro
 * de cada mesa, a própria ordem já é o sorteio dos ventos: 1º Leste, 2º Sul,
 * 3º Oeste e 4º Norte. O número aleatório vem de quem chama, para dar para testar.
 */
import { ORDEM_VENTOS, type Vento } from './partida'

/** Inteiro em [0, limite). */
export type InteiroAleatorio = (limite: number) => number

export interface MesaSorteada<T> {
  /** A partir de 1, como aparece na tela. */
  numero: number
  /** Sempre 4, na ordem Leste, Sul, Oeste, Norte. */
  assentos: { vento: Vento; jogador: T }[]
}

export type ErroSorteio = 'poucos' | 'naoMultiplo'

export type ResultadoSorteio<T> = { ok: true; mesas: MesaSorteada<T>[] } | { ok: false; erro: ErroSorteio }

const LIMITE_32_BITS = 0x1_0000_0000

/**
 * `crypto.getRandomValues` sem viés: descarta os valores do fim da faixa que não
 * fecham um múltiplo do limite (rejeição), em vez de usar o resto puro.
 */
export const inteiroAleatorioSeguro: InteiroAleatorio = (limite) => {
  if (limite <= 1) return 0
  const teto = LIMITE_32_BITS - (LIMITE_32_BITS % limite)
  const valor = new Uint32Array(1)
  do {
    crypto.getRandomValues(valor)
  } while (valor[0] >= teto)
  return valor[0] % limite
}

/** Fisher-Yates: cada ordem tem a mesma chance. Não mexe na lista recebida. */
export function embaralhar<T>(itens: readonly T[], aleatorio: InteiroAleatorio = inteiroAleatorioSeguro): T[] {
  const lista = [...itens]
  for (let atual = lista.length - 1; atual > 0; atual -= 1) {
    const sorteado = aleatorio(atual + 1)
    ;[lista[atual], lista[sorteado]] = [lista[sorteado], lista[atual]]
  }
  return lista
}

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
