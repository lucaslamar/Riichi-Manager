/**
 * Partida e motor de regras, em TypeScript puro: id e horário vêm de quem chama.
 *
 * A cadeira é o lugar físico e nunca muda; o vento sai de `cadeiraDealer`. Assim
 * o card não troca de lugar ao passar o dealer, só o kanji, a cor e o destaque.
 * Cadeiras em ordem de turno: 0 embaixo, 1 à direita, 2 em cima, 3 à esquerda.
 */
import type { EntradaHistorico } from './historicoAcoes'
import { pagamentosChombo } from './aplicarChombo'
import { calcularOka, type ConfigMesa } from './configMesa'
import { desmarcarRiichi, type Lance, type RegistroMao } from './descartes'
import { calcularUma } from './uma'
import type { MaoMontada } from './tipos-integracao'
import { vezInicial, type EstadoVez } from './vez'
import {
  calcularNoten,
  calcularPagamentos,
  calcularResultadoFinal,
  REGRAS_SANMA_PADRAO,
  type RegrasSanma,
  type Variante,
} from '@/compartilhado/mahjong/variante'

export type Cadeira = 0 | 1 | 2 | 3
export type Vento = 'leste' | 'sul' | 'oeste' | 'norte'

export const CADEIRAS: readonly Cadeira[] = [0, 1, 2, 3]
/** Sanma: 3 cadeiras (embaixo, direita, em cima). A da esquerda fica vazia. */
export const CADEIRAS_SANMA: readonly Cadeira[] = [0, 1, 2]
export const ORDEM_VENTOS: readonly Vento[] = ['leste', 'sul', 'oeste', 'norte']
export const KANJI_VENTO: Record<Vento, string> = { leste: '東', sul: '南', oeste: '西', norte: '北' }
export const CHAVE_VENTO: Record<Vento, string> = {
  leste: 'winds.east',
  sul: 'winds.south',
  oeste: 'winds.west',
  norte: 'winds.north',
}

export type PorCadeira<T> = Record<Cadeira, T>

export interface Placar {
  pontos: PorCadeira<number>
  cadeiraDealer: Cadeira
  rodadaVento: Vento
  rodadaNumero: 1 | 2 | 3 | 4
  honba: number
  palitos: number
  riichi: Cadeira[]
}

export type TipoEvento = 'ron' | 'tsumo' | 'ryukyoku' | 'chombo' | 'abortivo' | 'riichi' | 'legado'
export type TipoAbortivo =
  | 'kyuushuKyuuhai'
  | 'quatroVentos'
  | 'quatroKans'
  | 'quatroRiichis'
  | 'ronTriplo'

export interface DetalheEvento {
  vencedores?: Cadeira[]
  pagador?: Cadeira
  han?: number
  fu?: number
  yakuman?: number
  tenpai?: Cadeira[]
  nagashi?: Cadeira[]
  abortivo?: TipoAbortivo
  cadeira?: Cadeira
  /** Mãos vindas de "Montar mão", como foram salvas na hora da batida. */
  maosMontadas?: { cadeira: Cadeira; montada: MaoMontada }[]
  /** Chombo de valor fixo: sai da pontuação final, depois da uma. */
  multa?: { cadeira: Cadeira; valor: number }
}

export interface EventoPartida {
  id: string
  em: string
  tipo: TipoEvento
  rodada: { vento: Vento; numero: number; honba: number }
  variacao: PorCadeira<number>
  /** Volta exatamente para cá ao desfazer. */
  placarAntes: Placar
  detalhe?: DetalheEvento
  /** Descartes da mão que terminou, quando o registro está ligado. */
  lances?: Lance[]
}

export type MotivoFim = 'ultimaMao' | 'tobi' | 'retorno' | 'agariYame'

export interface ResultadoFinal {
  cadeira: Cadeira
  jogadorId: string
  colocacao: number
  pontosBrutos: number
  uma: number
  oka: number
  multa: number
  final: number
}

export interface Partida {
  id: string
  config: ConfigMesa
  /** `nome`: como o jogador se chamava, para o histórico sobreviver à exclusão. */
  assentos: PorCadeira<{ jogadorId: string; ventoInicial: Vento; nome?: string }>
  placar: Placar
  eventos: EventoPartida[]
  vez: EstadoVez
  /** Linha do tempo da mão atual; só existe com "Registrar descartes" em uso. */
  registro?: RegistroMao
  status: 'em_andamento' | 'finalizada'
  criadaEm: string
  finalizadaEm?: string
  /** A regra pede o fim: a tela mostra o resultado até "Finalizar" ou "Voltar e corrigir". */
  fim?: MotivoFim
  /** Dealer em 1º na última mão: a pessoa escolhe encerrar ou seguir. */
  agariYameDisponivel?: boolean
  resultado?: ResultadoFinal[]
  /** Jogada fora do app: só tem o resultado, sem mãos. */
  registradaManual?: boolean
  /** Registrada à mão: os jogadores foram listados na ordem dos ventos (Leste, Sul, Oeste, Norte). */
  ordemDosVentos?: boolean
  /** Índices base zero na grade. `guardada`: o organizador conferiu e confirmou. */
  vinculoTorneio?: { torneioId: string; rodada: number; mesa: number; guardada?: boolean }
  /** Mesa que saiu do sorteio de um encontro do clube. `mesa` começa em 1. */
  encontro?: { id: string; mesa: number }
  /** Sanma (3 jogadores). Ausente = yonma, como toda partida antiga. */
  variante?: Variante
  /** Regras de Sanma copiadas na criação: mudar os Ajustes depois não altera a partida. */
  regrasSanma?: RegrasSanma
  /** Linha do tempo das ações, inclusive as desfeitas. Ausente em partidas antigas. */
  historico?: EntradaHistorico[]
}

/** Cadeiras com jogador: as 4 no yonma, as 3 de baixo, da direita e de cima no Sanma. */
export function cadeirasDaPartida(partida: Pick<Partida, 'variante'>): readonly Cadeira[] {
  return partida.variante === 'sanma' ? CADEIRAS_SANMA : CADEIRAS
}

export function jogadoresNaMesa(partida: Pick<Partida, 'variante'>): 3 | 4 {
  return partida.variante === 'sanma' ? 3 : 4
}

function regrasSanmaDa(partida: Pick<Partida, 'regrasSanma'>): RegrasSanma {
  return partida.regrasSanma ?? REGRAS_SANMA_PADRAO
}

export interface Contexto {
  id: string
  agora: string
}

export function porCadeira<T>(valor: (cadeira: Cadeira) => T): PorCadeira<T> {
  return { 0: valor(0), 1: valor(1), 2: valor(2), 3: valor(3) }
}

/** `jogadores`: 3 no Sanma (só Leste, Sul e Oeste giram). */
export function ventoDaCadeira(cadeira: Cadeira, dealer: Cadeira, jogadores: 3 | 4 = 4): Vento {
  return ORDEM_VENTOS[(cadeira - dealer + jogadores) % jogadores]
}

export function criarPartida(
  id: string,
  config: ConfigMesa,
  jogadorIds: readonly [string, string, string, string],
  agora: string,
  nomes?: readonly string[],
  /** Sanma: a 4ª cadeira fica vazia (sem jogador e com 0 pontos). */
  sanma?: { regras: RegrasSanma },
): Partida {
  const vazia = (cadeira: Cadeira) => !!sanma && cadeira === 3
  return {
    id,
    config,
    ...(sanma ? { variante: 'sanma' as const, regrasSanma: sanma.regras } : {}),
    assentos: porCadeira((cadeira) => ({
      jogadorId: vazia(cadeira) ? '' : jogadorIds[cadeira],
      ventoInicial: ORDEM_VENTOS[cadeira],
      ...(nomes?.[cadeira] && !vazia(cadeira) ? { nome: nomes[cadeira] } : {}),
    })),
    placar: {
      pontos: porCadeira((cadeira) => (vazia(cadeira) ? 0 : config.pontosPartida)),
      cadeiraDealer: 0,
      rodadaVento: 'leste',
      rodadaNumero: 1,
      honba: 0,
      palitos: 0,
      riichi: [],
    },
    eventos: [],
    vez: vezInicial(0, config.timerVez),
    status: 'em_andamento',
    criadaEm: agora,
  }
}

function somar(pontos: PorCadeira<number>, variacao: PorCadeira<number>) {
  return porCadeira((cadeira) => pontos[cadeira] + variacao[cadeira])
}

/** Próxima mão depois de passar o dealer. No Sanma, 3 dealers por vento (E→S→W→E). */
function rodadaSeguinte(
  placar: Placar,
  jogadores: 3 | 4 = 4,
): Pick<Placar, 'cadeiraDealer' | 'rodadaVento' | 'rodadaNumero'> {
  const cadeiraDealer = ((placar.cadeiraDealer + 1) % jogadores) as Cadeira
  if (placar.rodadaNumero < jogadores) {
    return {
      cadeiraDealer,
      rodadaVento: placar.rodadaVento,
      rodadaNumero: (placar.rodadaNumero + 1) as Placar['rodadaNumero'],
    }
  }
  const indice = ORDEM_VENTOS.indexOf(placar.rodadaVento)
  return { cadeiraDealer, rodadaVento: ORDEM_VENTOS[(indice + 1) % 4], rodadaNumero: 1 }
}

interface AnaliseFim {
  fim?: MotivoFim
  agariYameDisponivel?: boolean
}

/** O que a regra manda depois de uma mão terminada. */
export function analisarFim(
  antes: Placar,
  pontos: PorCadeira<number>,
  config: ConfigMesa,
  dealerManteve: boolean,
  cadeiras: readonly Cadeira[] = CADEIRAS,
): AnaliseFim {
  const valores = cadeiras.map((cadeira) => pontos[cadeira])
  const maior = Math.max(...valores)
  if (config.tobi && valores.some((valor) => valor < 0)) return { fim: 'tobi' }

  const ultimaOficial = ORDEM_VENTOS.indexOf(config.tipoPartida === 'leste' ? 'leste' : 'sul')
  const rodada = ORDEM_VENTOS.indexOf(antes.rodadaVento)
  const ultimaDaRodada = antes.rodadaNumero === cadeiras.length

  // Na prorrogação, acaba assim que alguém chega à meta ou no fim da rodada extra.
  if (rodada > ultimaOficial) {
    if (maior >= config.metaProrrogacao) return { fim: 'retorno' }
    return ultimaDaRodada && !dealerManteve ? { fim: 'ultimaMao' } : {}
  }

  if (rodada !== ultimaOficial || !ultimaDaRodada) return {}

  if (dealerManteve) {
    const dealer = pontos[antes.cadeiraDealer]
    const sozinhoEm1 = valores.filter((valor) => valor === maior).length === 1 && dealer === maior
    return config.agariYame && sozinhoEm1 ? { agariYameDisponivel: true } : {}
  }
  if (config.prorrogacao && maior < config.metaProrrogacao) return {}
  return { fim: 'ultimaMao' }
}

function fecharMao(
  partida: Partida,
  evento: Pick<EventoPartida, 'tipo' | 'variacao' | 'detalhe'>,
  contexto: Contexto,
  regras: { dealerManteve: boolean; honba: number; palitos: number; analisar?: boolean },
): Partida {
  const antes = partida.placar
  const pontos = somar(antes.pontos, evento.variacao)
  const analise: AnaliseFim =
    regras.analisar === false
      ? {}
      : analisarFim(antes, pontos, partida.config, regras.dealerManteve, cadeirasDaPartida(partida))

  // Fim de partida não vira a rodada: o placar fica na mão que terminou.
  const rodada =
    regras.dealerManteve || analise.fim
      ? {
          cadeiraDealer: antes.cadeiraDealer,
          rodadaVento: antes.rodadaVento,
          rodadaNumero: antes.rodadaNumero,
        }
      : rodadaSeguinte(antes, jogadoresNaMesa(partida))

  const placar: Placar = { ...antes, ...rodada, pontos, honba: regras.honba, palitos: regras.palitos, riichi: [] }
  const lances = partida.registro?.lances ?? []

  return {
    ...partida,
    placar,
    eventos: [
      ...partida.eventos,
      registrarEvento(lances.length > 0 ? { ...evento, lances } : evento, antes, contexto),
    ],
    vez: vezInicial(placar.cadeiraDealer, partida.config.timerVez),
    // O rio é limpo e a mão informada some; os descartes ficam no histórico da mão.
    registro: undefined,
    fim: analise.fim,
    agariYameDisponivel: analise.agariYameDisponivel,
  }
}

function registrarEvento(
  evento: Pick<EventoPartida, 'tipo' | 'variacao' | 'detalhe' | 'lances'>,
  antes: Placar,
  contexto: Contexto,
): EventoPartida {
  return {
    ...evento,
    id: contexto.id,
    em: contexto.agora,
    rodada: { vento: antes.rodadaVento, numero: antes.rodadaNumero, honba: antes.honba },
    placarAntes: antes,
  }
}

export function podeDeclararRiichi(placar: Placar, cadeira: Cadeira) {
  return !placar.riichi.includes(cadeira) && placar.pontos[cadeira] >= 1000
}

export function declararRiichi(partida: Partida, cadeira: Cadeira, contexto: Contexto): Partida {
  const antes = partida.placar
  if (!podeDeclararRiichi(antes, cadeira)) return partida
  const variacao = porCadeira((outra) => (outra === cadeira ? -1000 : 0))
  return {
    ...partida,
    placar: {
      ...antes,
      pontos: somar(antes.pontos, variacao),
      palitos: antes.palitos + 1,
      riichi: [...antes.riichi, cadeira],
    },
    eventos: [
      ...partida.eventos,
      registrarEvento({ tipo: 'riichi', variacao, detalhe: { cadeira } }, antes, contexto),
    ],
  }
}

export interface VencedorRon {
  cadeira: Cadeira
  /** Valor pago pelo descarte, já com o honba: vem assim das calculadoras. */
  pontos: number
  han?: number
  fu?: number
  yakuman?: number
  montada?: MaoMontada
}

/**
 * Ron, com um ou mais vencedores. Quem bateu em Riichi recebe o próprio palito
 * de volta; os outros palitos vão para o primeiro vencedor depois do descarte.
 */
export function registrarRon(
  partida: Partida,
  dados: { pagador: Cadeira; vencedores: VencedorRon[] },
  contexto: Contexto,
): Partida {
  const antes = partida.placar
  const { pagador, vencedores } = dados
  if (vencedores.length === 0) return partida

  const variacao = porCadeira(() => 0)
  for (const { cadeira, pontos } of vencedores) {
    variacao[cadeira] += pontos
    variacao[pagador] -= pontos
  }

  const cadeiras = vencedores.map((vencedor) => vencedor.cadeira)
  const proprios = cadeiras.filter((cadeira) => antes.riichi.includes(cadeira))
  for (const cadeira of proprios) variacao[cadeira] += 1000
  const jogadores = jogadoresNaMesa(partida)
  const maisProximo = Array.from({ length: jogadores - 1 }, (_vazio, indice) => indice + 1)
    .map((passo) => ((pagador + passo) % jogadores) as Cadeira)
    .find((cadeira) => cadeiras.includes(cadeira))
  if (maisProximo !== undefined) variacao[maisProximo] += (antes.palitos - proprios.length) * 1000

  const dealerVenceu = cadeiras.includes(antes.cadeiraDealer)
  const unico = vencedores.length === 1 ? vencedores[0] : undefined
  return fecharMao(
    partida,
    {
      tipo: 'ron',
      variacao,
      detalhe: {
        vencedores: cadeiras,
        pagador,
        ...(unico ? { han: unico.han, fu: unico.fu, yakuman: unico.yakuman } : {}),
        ...maosDosVencedores(vencedores),
      },
    },
    contexto,
    { dealerManteve: dealerVenceu, honba: dealerVenceu ? antes.honba + 1 : 0, palitos: 0 },
  )
}

function maosDosVencedores(vencedores: readonly { cadeira: Cadeira; montada?: MaoMontada }[]) {
  const maosMontadas = vencedores.flatMap(({ cadeira, montada }) =>
    montada ? [{ cadeira, montada }] : [],
  )
  return maosMontadas.length > 0 ? { maosMontadas } : {}
}

export function registrarTsumo(
  partida: Partida,
  dados: {
    vencedor: Cadeira
    /** Já com o honba. Com o dealer vencendo, todos pagam `pagamentoNaoDealer`. */
    pagamentoDealer: number
    pagamentoNaoDealer: number
    han?: number
    fu?: number
    yakuman?: number
    montada?: MaoMontada
  },
  contexto: Contexto,
): Partida {
  const antes = partida.placar
  const { vencedor } = dados
  const cadeiras = cadeirasDaPartida(partida)
  // Sanma: só as 3 cadeiras pagam; o valor de cada uma já vem das calculadoras de Sanma.
  const variacao = porCadeira((cadeira) => {
    if (cadeira === vencedor || !cadeiras.includes(cadeira)) return 0
    return -(cadeira === antes.cadeiraDealer ? dados.pagamentoDealer : dados.pagamentoNaoDealer)
  })
  variacao[vencedor] =
    -CADEIRAS.reduce<number>((soma, cadeira) => soma + variacao[cadeira], 0) + antes.palitos * 1000

  const dealerVenceu = vencedor === antes.cadeiraDealer
  return fecharMao(
    partida,
    {
      tipo: 'tsumo',
      variacao,
      detalhe: {
        vencedores: [vencedor],
        han: dados.han,
        fu: dados.fu,
        yakuman: dados.yakuman,
        ...maosDosVencedores([{ cadeira: vencedor, montada: dados.montada }]),
      },
    },
    contexto,
    { dealerManteve: dealerVenceu, honba: dealerVenceu ? antes.honba + 1 : 0, palitos: 0 },
  )
}

/**
 * Noten do Sanma: o total das Regras de Sanma (regra compartilhada), só entre as 3
 * cadeiras. O yonma segue com `pagamentosNoten`.
 */
export function pagamentosNotenSanma(tenpai: readonly Cadeira[], regras: RegrasSanma): PorCadeira<number> {
  const porJogador = calcularNoten(tenpai, CADEIRAS_SANMA, 'sanma', regras)
  return porCadeira((cadeira) => porJogador.get(cadeira) ?? 0)
}

/** Nagashi Mangan no Sanma: um tsumo de Mangan pago pelos outros 2, sem honba. */
export function pagamentosNagashiSanma(
  nagashi: readonly Cadeira[],
  dealer: Cadeira,
  regras: RegrasSanma,
): PorCadeira<number> {
  const variacao = porCadeira(() => 0)
  for (const ganhador of nagashi) {
    const { tsumo } = calcularPagamentos({
      han: 5,
      fu: 30,
      dealer: ganhador === dealer,
      tipo: 'tsumo',
      honba: 0,
      variante: 'sanma',
      regras,
    })
    for (const cadeira of CADEIRAS_SANMA) {
      if (cadeira === ganhador || !tsumo) continue
      const valor = cadeira === dealer ? tsumo.dealer : tsumo.naoDealer
      variacao[ganhador] += valor
      variacao[cadeira] -= valor
    }
  }
  return variacao
}

/** Pagamento de noten: 3.000 divididos entre quem estava tenpai. */
export function pagamentosNoten(tenpai: readonly Cadeira[]): PorCadeira<number> {
  if (tenpai.length === 0 || tenpai.length === 4) return porCadeira(() => 0)
  const ganho = 3000 / tenpai.length
  const perda = 3000 / (4 - tenpai.length)
  return porCadeira((cadeira) => (tenpai.includes(cadeira) ? ganho : -perda))
}

/** Nagashi Mangan: paga como um tsumo de Mangan, sem honba, e substitui o noten. */
export function pagamentosNagashi(nagashi: readonly Cadeira[], dealer: Cadeira): PorCadeira<number> {
  const variacao = porCadeira(() => 0)
  for (const ganhador of nagashi) {
    for (const cadeira of CADEIRAS) {
      if (cadeira === ganhador) continue
      const valor = ganhador === dealer || cadeira === dealer ? 4000 : 2000
      variacao[ganhador] += valor
      variacao[cadeira] -= valor
    }
  }
  return variacao
}

/** Pagamentos do ryukyoku (Nagashi Mangan ou noten), conforme a variante da partida. */
export function variacaoDoRyukyoku(
  partida: Pick<Partida, 'placar' | 'variante' | 'regrasSanma'>,
  tenpai: readonly Cadeira[],
  nagashi: readonly Cadeira[] = [],
): PorCadeira<number> {
  const dealer = partida.placar.cadeiraDealer
  if (partida.variante === 'sanma') {
    const regras = regrasSanmaDa(partida)
    return nagashi.length > 0 ? pagamentosNagashiSanma(nagashi, dealer, regras) : pagamentosNotenSanma(tenpai, regras)
  }
  return nagashi.length > 0 ? pagamentosNagashi(nagashi, dealer) : pagamentosNoten(tenpai)
}

export function registrarRyukyoku(
  partida: Partida,
  dados: { tenpai: Cadeira[]; nagashi?: Cadeira[] },
  contexto: Contexto,
): Partida {
  const antes = partida.placar
  const nagashi = dados.nagashi ?? []
  const variacao = variacaoDoRyukyoku(partida, dados.tenpai, nagashi)
  return fecharMao(
    partida,
    { tipo: 'ryukyoku', variacao, detalhe: { tenpai: dados.tenpai, nagashi } },
    contexto,
    {
      dealerManteve: dados.tenpai.includes(antes.cadeiraDealer),
      honba: antes.honba + 1,
      palitos: antes.palitos,
    },
  )
}

/** Empate abortivo: sem pagamentos, dealer fica, honba sobe e os palitos seguem na mesa. */
export function registrarAbortivo(partida: Partida, abortivo: TipoAbortivo, contexto: Contexto): Partida {
  const antes = partida.placar
  return fecharMao(
    partida,
    { tipo: 'abortivo', variacao: porCadeira(() => 0), detalhe: { abortivo } },
    contexto,
    { dealerManteve: true, honba: antes.honba + 1, palitos: antes.palitos, analisar: false },
  )
}

/**
 * Chombo: a mão é repetida, sem honba nem troca de dealer, e os palitos desta mão
 * voltam para quem declarou Riichi. Mangan e Yakuman reverso pagam na hora; o valor fixo só
 * sai da pontuação final.
 */
export function registrarChombo(partida: Partida, cadeira: Cadeira, contexto: Contexto): Partida {
  const antes = partida.placar
  const { chombo } = partida.config
  const variacao =
    chombo.tipo === 'fixo'
      ? porCadeira(() => 0)
      : pagamentosChombo(chombo.tipo, cadeira, antes.cadeiraDealer, cadeirasDaPartida(partida))
  for (const quem of antes.riichi) variacao[quem] += 1000

  return fecharMao(
    partida,
    {
      tipo: 'chombo',
      variacao,
      detalhe: {
        cadeira,
        ...(chombo.tipo === 'fixo' ? { multa: { cadeira, valor: chombo.valor } } : {}),
      },
    },
    contexto,
    {
      dealerManteve: true,
      honba: antes.honba,
      palitos: antes.palitos - antes.riichi.length,
      analisar: false,
    },
  )
}

export function encerrarPorAgariYame(partida: Partida): Partida {
  return partida.agariYameDisponivel
    ? { ...partida, fim: 'agariYame', agariYameDisponivel: false }
    : partida
}

/** Desfaz o último evento; também é o "Voltar e corrigir" do resultado final. */
export function desfazer(partida: Partida): Partida {
  const ultimo = partida.eventos[partida.eventos.length - 1]
  if (!ultimo) return partida
  const manterVez = ultimo.tipo === 'riichi'
  const { cadeira } = ultimo.detalhe ?? {}
  // Riichi desfeito: o descarte não fica deitado. Mão desfeita: o rio volta, sem as mãos.
  const registro = manterVez
    ? partida.registro && cadeira !== undefined
      ? desmarcarRiichi(partida.registro, cadeira)
      : partida.registro
    : ultimo.lances
      ? { lances: ultimo.lances, maos: {} }
      : undefined
  return {
    ...partida,
    registro,
    placar: ultimo.placarAntes,
    eventos: partida.eventos.slice(0, -1),
    vez: manterVez
      ? partida.vez
      : vezInicial(ultimo.placarAntes.cadeiraDealer, partida.config.timerVez),
    fim: undefined,
    agariYameDisponivel: undefined,
  }
}

/** "Voltar e corrigir": agari-yame só reabre a escolha; o resto desfaz a última mão. */
export function voltarDoResultado(partida: Partida): Partida {
  return partida.fim === 'agariYame'
    ? { ...partida, fim: undefined, agariYameDisponivel: true }
    : desfazer(partida)
}

/** Embaralha os assentos, para o atalho "Assentos aleatórios". */
export function sortearAssentos<T>(itens: readonly T[], aleatorio: () => number): T[] {
  const lista = [...itens]
  for (let atual = lista.length - 1; atual > 0; atual -= 1) {
    const sorteado = Math.floor(aleatorio() * (atual + 1))
    ;[lista[atual], lista[sorteado]] = [lista[sorteado], lista[atual]]
  }
  return lista
}

const arredondar = (valor: number) => Math.round(valor * 100) / 100

/**
 * Pontuação final. Empate de pontos divide a uma (e a oka) entre os empatados e
 * eles ficam com a mesma colocação; palitos que sobram vão para o 1º conforme a regra.
 */
export function calcularResultado(partida: Partida): ResultadoFinal[] {
  if (partida.variante === 'sanma') return calcularResultadoSanma(partida)
  const { placar, config, assentos, eventos } = partida
  const pontos = { ...placar.pontos }

  const maiorAntes = Math.max(...CADEIRAS.map((cadeira) => pontos[cadeira]))
  if (config.palitosRestantes === 'primeiro' && placar.palitos > 0) {
    const primeiros = CADEIRAS.filter((cadeira) => pontos[cadeira] === maiorAntes)
    const parte = Math.floor((placar.palitos * 1000) / primeiros.length / 100) * 100
    for (const cadeira of primeiros) pontos[cadeira] += parte
  }

  const ordenadas = [...CADEIRAS].sort((uma, outra) => pontos[outra] - pontos[uma] || uma - outra)
  const oka = calcularOka(config) / 1000
  const umas = calcularUma(config, CADEIRAS.map((cadeira) => pontos[cadeira]))
  const multas = porCadeira(() => 0)
  for (const evento of eventos) {
    const multa = evento.detalhe?.multa
    if (multa) multas[multa.cadeira] += multa.valor
  }

  return ordenadas.map((cadeira) => {
    const empatadas = ordenadas.filter((outra) => pontos[outra] === pontos[cadeira])
    const inicio = ordenadas.indexOf(empatadas[0])
    const uma = umas[cadeira]
    const okaAqui = inicio === 0 ? oka / empatadas.length : 0
    const multa = multas[cadeira] / 1000
    return {
      cadeira,
      jogadorId: assentos[cadeira].jogadorId,
      colocacao: inicio + 1,
      pontosBrutos: pontos[cadeira],
      uma: arredondar(uma),
      oka: arredondar(okaAqui),
      multa: arredondar(multa),
      final: arredondar((pontos[cadeira] - config.pontosRetorno) / 1000 + uma + okaAqui - multa),
    }
  })
}

/**
 * Resultado do Sanma: oka e uma das Regras de Sanma (`calcularResultadoFinal`), só
 * entre as 3 cadeiras. Palitos e chombo de valor fixo seguem a regra da mesa.
 */
function calcularResultadoSanma(partida: Partida): ResultadoFinal[] {
  const { placar, config, assentos, eventos } = partida
  const regras = regrasSanmaDa(partida)
  const pontos = { ...placar.pontos }

  const maiorAntes = Math.max(...CADEIRAS_SANMA.map((cadeira) => pontos[cadeira]))
  if (config.palitosRestantes === 'primeiro' && placar.palitos > 0) {
    const primeiros = CADEIRAS_SANMA.filter((cadeira) => pontos[cadeira] === maiorAntes)
    const parte = Math.floor((placar.palitos * 1000) / primeiros.length / 100) * 100
    for (const cadeira of primeiros) pontos[cadeira] += parte
  }

  const multas = porCadeira(() => 0)
  for (const evento of eventos) {
    const multa = evento.detalhe?.multa
    if (multa) multas[multa.cadeira] += multa.valor
  }

  const finais = calcularResultadoFinal(
    CADEIRAS_SANMA.map((cadeira) => pontos[cadeira]),
    regras,
  )
  return CADEIRAS_SANMA.map((cadeira, indice) => {
    const linha = finais[indice]
    const multa = multas[cadeira] / 1000
    return {
      cadeira,
      jogadorId: assentos[cadeira].jogadorId,
      colocacao: linha.colocacao,
      pontosBrutos: pontos[cadeira],
      uma: linha.uma,
      oka: linha.oka,
      multa: arredondar(multa),
      final: arredondar(linha.final - multa),
    }
  }).sort((uma, outra) => uma.colocacao - outra.colocacao || outra.pontosBrutos - uma.pontosBrutos || uma.cadeira - outra.cadeira)
}

export function finalizarPartida(partida: Partida, agora: string): Partida {
  return {
    ...partida,
    status: 'finalizada',
    finalizadaEm: agora,
    resultado: calcularResultado(partida),
    fim: partida.fim,
  }
}

/** Quanto falta (negativo) ou sobra em relação a cada outro jogador. */
export function diferencasDePontos(placar: Placar, cadeira: Cadeira, cadeiras: readonly Cadeira[] = CADEIRAS) {
  return cadeiras.filter((outra) => outra !== cadeira).map((outra) => ({
    cadeira: outra,
    diferenca: placar.pontos[cadeira] - placar.pontos[outra],
  }))
}
