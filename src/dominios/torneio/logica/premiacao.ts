/** Inscrição e premiação do torneio e da temporada. Sem tela. */
import type { LinhaRankingTorneio } from './ranking'
import type { ConfigPremiacao, LinhaTemporada } from './tipos'

/** Cada prêmio desce para o múltiplo de 5 e a sobra fica com o clube. */
const MULTIPLO_DO_PREMIO = 5

const MOEDA_DO_IDIOMA: Record<string, string> = {
  'pt-BR': 'BRL',
  en: 'USD',
  es: 'EUR',
  ja: 'JPY',
  ko: 'KRW',
  lt: 'EUR',
  'zh-Hans': 'CNY',
}

export function premiacaoPadrao(idioma: string): ConfigPremiacao {
  return {
    ativa: false,
    moeda: MOEDA_DO_IDIOMA[idioma] ?? 'BRL',
    inscricao: 100,
    parcelas: 5,
    parteClube: 0.25,
    divisao: 'automatica',
    minimoJogadores: 16,
  }
}

const centavos = (valor: number) => Math.round(valor * 100) / 100

/** Até 19 paga até o 3º, também abaixo do mínimo de 16. */
export function divisaoAutomatica(jogadores: number): number[] {
  if (jogadores >= 28) return [40, 25, 17, 11, 7]
  if (jogadores >= 20) return [45, 27, 18, 10]
  return [50, 30, 20]
}

function divisaoDa(config: ConfigPremiacao, jogadores: number): number[] {
  if (config.divisao === 'automatica') return divisaoAutomatica(jogadores)
  if (config.divisao === 'so-primeiro') return [100]
  return config.divisao.personalizada
}

export function premiacaoValida(config: ConfigPremiacao): boolean {
  if (!config.ativa) return true
  const { antecipada, divisao } = config
  if (!(config.inscricao > 0) || !Number.isInteger(config.parcelas) || config.parcelas < 1) return false
  if (!(config.parteClube >= 0 && config.parteClube <= 1)) return false
  if (!Number.isInteger(config.minimoJogadores) || config.minimoJogadores < 1) return false
  if (antecipada) {
    const { valor, quantidade, ate } = antecipada
    if (!ate || !(valor > 0 && valor <= config.inscricao)) return false
    if (!Number.isInteger(quantidade) || quantidade < 0) return false
  }
  if (typeof divisao === 'string') return true
  const { personalizada } = divisao
  return personalizada.every((parte) => parte > 0) && Math.abs(somaDe(personalizada) - 100) < 0.001
}

export const somaDe = (valores: readonly number[]) => centavos(valores.reduce((soma, valor) => soma + valor, 0))

/** "50, 30, 20" → [50, 30, 20]. */
export function lerDivisao(texto: string): number[] {
  return texto
    .split(/[,;/\s]+/)
    .filter(Boolean)
    .map(Number)
    .map((valor) => (Number.isFinite(valor) ? valor : 0))
}

/** O que cada um pagou: os antecipados e o resto com a inscrição cheia. */
export function pagamentosDe(config: ConfigPremiacao, jogadores: number): number[] {
  const { antecipada } = config
  return Array.from({ length: jogadores }, (_, indice) =>
    antecipada && indice < antecipada.quantidade ? antecipada.valor : config.inscricao,
  )
}

export interface ResultadoPremiacao {
  jogadores: number
  total: number
  /** A parte do clube, sem o arredondamento. */
  clube: number
  premio: number
  arredondamento: number
  posicoes: { posicao: number; percentual: number; valor: number }[]
  parcela: number
  faltamJogadores: number
}

export function calcularPremiacao(config: ConfigPremiacao, pagamentos: readonly number[]): ResultadoPremiacao {
  const total = somaDe(pagamentos)
  const clube = centavos(total * config.parteClube)
  const premio = centavos(total - clube)
  const posicoes = divisaoDa(config, pagamentos.length).map((percentual, indice) => ({
    posicao: indice + 1,
    percentual,
    // Arredonda aos centavos antes de descer: 359,99999 não pode virar 355.
    valor: Math.floor(centavos((premio * percentual) / 100) / MULTIPLO_DO_PREMIO) * MULTIPLO_DO_PREMIO,
  }))
  return {
    jogadores: pagamentos.length,
    total,
    clube,
    premio,
    arredondamento: centavos(premio - somaDe(posicoes.map((posicao) => posicao.valor))),
    posicoes,
    parcela: centavos(config.inscricao / config.parcelas),
    faltamJogadores: Math.max(0, config.minimoJogadores - pagamentos.length),
  }
}

/** null com a premiação desligada. */
export function premiacaoDe(config: ConfigPremiacao | undefined, jogadores: number): ResultadoPremiacao | null {
  return config?.ativa ? calcularPremiacao(config, pagamentosDe(config, jogadores)) : null
}

/** Empatados dividem a soma das posições que ocupam juntos. */
function dividirPremios<Linha extends { jogadorId: string }>(
  resultado: ResultadoPremiacao,
  linhas: readonly Linha[],
  empatados: (uma: Linha, outra: Linha) => boolean,
): Map<string, number> {
  const premios = new Map<string, number>()
  let inicio = 0
  while (inicio < linhas.length) {
    let fim = inicio + 1
    while (fim < linhas.length && empatados(linhas[inicio], linhas[fim])) fim++
    const juntos = somaDe(resultado.posicoes.slice(inicio, fim).map((posicao) => posicao.valor))
    const cada = Math.floor((juntos * 100) / (fim - inicio)) / 100
    if (cada > 0) linhas.slice(inicio, fim).forEach((linha) => premios.set(linha.jogadorId, cada))
    inicio = fim
  }
  return premios
}

export function premioDaPosicao(
  resultado: ResultadoPremiacao,
  linhas: readonly LinhaRankingTorneio[],
): Map<string, number> {
  const jogaram = linhas.filter((linha) => linha.partidas > 0)
  return dividirPremios(resultado, jogaram, (uma, outra) => uma.posicao === outra.posicao)
}

/** Na temporada, empate é o mesmo valor com as mesmas partidas (o desempate da tabela). */
export function premioDaTemporada(
  resultado: ResultadoPremiacao,
  linhas: readonly LinhaTemporada[],
): Map<string, number> {
  const concorrem = linhas.filter((linha) => linha.partidas > 0 && !linha.abaixoDoMinimo)
  return dividirPremios(
    resultado,
    concorrem,
    (uma, outra) => uma.valor === outra.valor && uma.partidas === outra.partidas,
  )
}
