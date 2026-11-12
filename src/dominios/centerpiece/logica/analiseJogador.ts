/**
 * Análise de um jogador: tudo do ponto de vista dele, a partir das partidas que
 * já passaram pelos filtros (período, duração, origem). Puro e só com o resumo
 * das partidas (resultado, regras, assentos), sem o mão a mão.
 */
import { ORDEM_VENTOS, type Partida, type ResultadoFinal, type Vento } from './partida'
import { confrontosDoJogador, type Confronto } from './filtrosRanking'

const arredondar = (valor: number) => Math.round(valor * 100) / 100
const media = (valores: readonly number[]) =>
  valores.length ? arredondar(valores.reduce((soma, valor) => soma + valor, 0) / valores.length) : null

function linhaDe(partida: Partida, jogadorId: string): ResultadoFinal | undefined {
  return partida.resultado?.find((linha) => linha.jogadorId === jogadorId)
}

/** Partidas do jogador, da mais antiga para a mais recente. */
export function partidasDoJogador(partidas: readonly Partida[], jogadorId: string) {
  return partidas
    .filter((partida) => linhaDe(partida, jogadorId))
    .sort((uma, outra) => (uma.finalizadaEm ?? '').localeCompare(outra.finalizadaEm ?? ''))
}

/** "23 partidas · média 2,3 · +41,8". */
export function resumoDoJogador(partidas: readonly Partida[], jogadorId: string) {
  const linhas = partidasDoJogador(partidas, jogadorId).map((partida) => linhaDe(partida, jogadorId)!)
  return {
    partidas: linhas.length,
    mediaColocacao: media(linhas.map((linha) => linha.colocacao)),
    pontuacaoTotal: arredondar(linhas.reduce((soma, linha) => soma + linha.final, 0)),
  }
}

/** Pontuação acumulada partida a partida. */
export function evolucaoDaPontuacao(partidas: readonly Partida[], jogadorId: string) {
  let acumulado = 0
  return partidasDoJogador(partidas, jogadorId).map((partida, indice) => {
    acumulado = arredondar(acumulado + linhaDe(partida, jogadorId)!.final)
    return { indice: indice + 1, data: partida.finalizadaEm ?? '', acumulado }
  })
}

/** Quantas vezes terminou em 1º, 2º, 3º e 4º. */
export function distribuicaoDeColocacoes(partidas: readonly Partida[], jogadorId: string): [number, number, number, number] {
  const contagem: [number, number, number, number] = [0, 0, 0, 0]
  for (const partida of partidasDoJogador(partidas, jogadorId)) {
    const colocacao = linhaDe(partida, jogadorId)!.colocacao
    if (colocacao >= 1 && colocacao <= 4) contagem[colocacao - 1] += 1
  }
  return contagem
}

/** Média de colocação por mês (`AAAA-MM`, hora local), em ordem. */
export function mediaPorMes(partidas: readonly Partida[], jogadorId: string) {
  const porMes = new Map<string, number[]>()
  for (const partida of partidasDoJogador(partidas, jogadorId)) {
    const data = new Date(partida.finalizadaEm ?? '')
    const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    porMes.set(mes, [...(porMes.get(mes) ?? []), linhaDe(partida, jogadorId)!.colocacao])
  }
  return [...porMes.entries()].map(([mes, colocacoes]) => ({ mes, media: media(colocacoes)!, partidas: colocacoes.length }))
}

/** Média de colocação pelo vento em que começou. */
export function mediaPorVento(partidas: readonly Partida[], jogadorId: string) {
  const porVento = new Map<Vento, number[]>(ORDEM_VENTOS.map((vento) => [vento, []]))
  for (const partida of partidasDoJogador(partidas, jogadorId)) {
    // Registrada à mão sem a ordem dos ventos: o vento de cada um não é conhecido.
    if (partida.registradaManual && !partida.ordemDosVentos) continue
    const linha = linhaDe(partida, jogadorId)!
    porVento.get(partida.assentos[linha.cadeira].ventoInicial)?.push(linha.colocacao)
  }
  return ORDEM_VENTOS.map((vento) => ({ vento, media: media(porVento.get(vento)!), partidas: porVento.get(vento)!.length }))
}

/** Hanchan × Tonpuusen: média de colocação e % de 1º em cada formato. */
export function comparacaoDeFormatos(partidas: readonly Partida[], jogadorId: string) {
  return (['hanchan', 'leste'] as const).map((formato) => {
    const linhas = partidasDoJogador(partidas, jogadorId)
      .filter((partida) => partida.config.tipoPartida === formato)
      .map((partida) => linhaDe(partida, jogadorId)!)
    return {
      formato,
      partidas: linhas.length,
      media: media(linhas.map((linha) => linha.colocacao)),
      percentualPrimeiro: linhas.length
        ? arredondar((linhas.filter((linha) => linha.colocacao === 1).length / linhas.length) * 100)
        : null,
    }
  })
}

/** Os adversários com mais partidas juntos. */
export function maisJogouCom(partidas: readonly Partida[], jogadorId: string, quantos = 5): Confronto[] {
  return confrontosDoJogador(partidas, jogadorId)
    .sort((um, outro) => outro.partidas - um.partidas || outro.vitorias - um.vitorias)
    .slice(0, quantos)
}

export interface NoRede extends Confronto {
  /** Vitórias − derrotas no confronto direto: > 0 freguês, < 0 rival. */
  saldo: number
}

export interface RedeConfrontos {
  nos: NoRede[]
  /** Adversários que também jogaram entre si (nas mesmas partidas filtradas). */
  arestas: { de: string; para: string; partidas: number }[]
}

/**
 * Mapa de confrontos: o jogador no centro, ligado a cada adversário, e os
 * adversários ligados entre si. `minimo` é a densidade (partidas juntos).
 */
export function redeDeConfrontos(partidas: readonly Partida[], jogadorId: string, minimo = 1): RedeConfrontos {
  const nos = confrontosDoJogador(partidas, jogadorId)
    .filter((confronto) => confronto.partidas >= minimo)
    .map((confronto) => ({ ...confronto, saldo: confronto.vitorias - confronto.derrotas }))
  const ids = new Set(nos.map((no) => no.adversarioId))
  const juntos = new Map<string, number>()
  for (const partida of partidas) {
    const presentes = (partida.resultado ?? []).map((linha) => linha.jogadorId).filter((id) => ids.has(id)).sort()
    for (let um = 0; um < presentes.length; um += 1) {
      for (let outro = um + 1; outro < presentes.length; outro += 1) {
        const chave = `${presentes[um]}|${presentes[outro]}`
        juntos.set(chave, (juntos.get(chave) ?? 0) + 1)
      }
    }
  }
  const arestas = [...juntos.entries()].map(([chave, quantas]) => {
    const [de, para] = chave.split('|')
    return { de, para, partidas: quantas }
  })
  return { nos, arestas }
}

/**
 * Detalhe do confronto entre A e B nas partidas que jogaram juntos. "Mandou pro
 * tobi" usa só o resultado: o outro terminou abaixo de zero e este ficou em 1º.
 */
export function detalheDoConfronto(partidas: readonly Partida[], jogadorA: string, jogadorB: string) {
  const juntos = partidas.filter((partida) => linhaDe(partida, jogadorA) && linhaDe(partida, jogadorB))
  const lado = (eu: string, outro: string) => {
    const minhas = juntos.map((partida) => linhaDe(partida, eu)!)
    return {
      vitorias: juntos.filter((partida) => linhaDe(partida, eu)!.colocacao < linhaDe(partida, outro)!.colocacao).length,
      mediaColocacao: media(minhas.map((linha) => linha.colocacao)),
      pontuacao: arredondar(minhas.reduce((soma, linha) => soma + linha.final, 0)),
      mandouProTobi: juntos.filter(
        (partida) => linhaDe(partida, eu)!.colocacao === 1 && linhaDe(partida, outro)!.pontosBrutos < 0,
      ).length,
    }
  }
  return { partidas: juntos.length, a: lado(jogadorA, jogadorB), b: lado(jogadorB, jogadorA) }
}
