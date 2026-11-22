/** Contagens do sorteio: quem já jogou com quem e em que vento. */

/** Assentos na ordem 東 南 西 北. No Sanma, o 北 fica `''`. */
export type Assentos = [string, string, string, string]

/** Só o que o sorteio lê de uma rodada. */
export interface RodadaDoSorteio {
  mesas: readonly { assentos: readonly string[] }[]
}

export interface MesaDaRodada {
  numero: number
  assentos: Assentos
}

/** Jogadores por mesa: 4 no yonma, 3 no Sanma (a 4ª cadeira da mesa fica vazia, `''`). */
export type JogadoresPorMesa = 3 | 4

/** Ids de quem senta na mesa, sem a cadeira vazia do Sanma. */
export const ocupantes = (assentos: readonly string[]) => assentos.filter((jogador) => jogador !== '')

/** Não aparece em id nem em nome, ao contrário de `|`. */
const SEPARADOR = '\u0000'

export const chaveDoGrupo = (jogadores: readonly string[]) => [...jogadores].sort().join(SEPARADOR)
export const jogadoresDaChave = (chave: string) => chave.split(SEPARADOR)

export function chaveDoPar(um: string, outro: string) {
  return um < outro ? `${um}${SEPARADOR}${outro}` : `${outro}${SEPARADOR}${um}`
}

export function paresDaMesa(jogadores: readonly string[]): [string, string][] {
  return jogadores.flatMap((um, indice) => jogadores.slice(indice + 1).map((outro): [string, string] => [um, outro]))
}

export function triosDaMesa(jogadores: readonly string[]): string[][] {
  return jogadores.flatMap((um, indice) =>
    paresDaMesa(jogadores.slice(indice + 1)).map(([dois, tres]) => [um, dois, tres]),
  )
}

/** Quantas vezes cada dupla já se enfrentou. */
export function contarPares(rodadas: readonly RodadaDoSorteio[]): Map<string, number> {
  const contagem = new Map<string, number>()
  for (const { mesas } of rodadas) {
    for (const mesa of mesas) {
      for (const [um, outro] of paresDaMesa(ocupantes(mesa.assentos))) {
        const chave = chaveDoPar(um, outro)
        contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
      }
    }
  }
  return contagem
}

/** Quantas vezes cada trio já dividiu mesa. No Sanma, o trio é a mesa inteira. */
export function contarTrios(rodadas: readonly RodadaDoSorteio[]): Map<string, number> {
  const contagem = new Map<string, number>()
  for (const { mesas } of rodadas) {
    for (const mesa of mesas) {
      for (const trio of triosDaMesa(ocupantes(mesa.assentos))) {
        const chave = chaveDoGrupo(trio)
        contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
      }
    }
  }
  return contagem
}

/** Vezes em cada vento (東 南 西 北) por jogador. */
export function contarVentos(rodadas: readonly RodadaDoSorteio[]): Map<string, [number, number, number, number]> {
  const contagem = new Map<string, [number, number, number, number]>()
  for (const { mesas } of rodadas) {
    for (const mesa of mesas) {
      mesa.assentos.forEach((jogador, vento) => {
        if (jogador === '') return
        const linha = contagem.get(jogador) ?? [0, 0, 0, 0]
        linha[vento] += 1
        contagem.set(jogador, linha)
      })
    }
  }
  return contagem
}

/** Mesmas pessoas juntas, sem olhar número de mesa nem vento. */
export function mesmasMesas(uma: RodadaDoSorteio['mesas'], outra: RodadaDoSorteio['mesas']): boolean {
  const composicao = (mesas: RodadaDoSorteio['mesas']) =>
    mesas
      .map((mesa) => chaveDoGrupo(ocupantes(mesa.assentos)))
      .sort()
      .join('\n')
  return composicao(uma) === composicao(outra)
}
