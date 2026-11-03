/**
 * O que a linha do tempo da mão já diz sobre a batida, para a Calculadora de Mão vir
 * preenchida. É só o ponto de partida: quem registra pode mudar qualquer opção.
 */
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { descartesDe, pedrasNoMuro, ultimoDescarteDaMao, type Lance } from './descartes'
import type { Cadeira } from './partida'

export interface DadosDaPartida {
  riichi: { duplo: boolean; ippatsu: boolean } | null
  /** Haitei no tsumo, Houtei no ron. */
  ultimaPedra: boolean
  /** Rinshan no tsumo, Chankan no ron. */
  kan: boolean
  /** Tenhou ou Chiihou: venceu na primeira compra, sem nenhuma chamada antes. */
  primeiraCompra: boolean
  descartes: CodigoPedra[]
  /** Kans da mão: cada um vira mais um indicador de dora. */
  kans: number
}

/** Chamada que interrompe a volta: Ron não conta, porque é a própria batida. */
function interrompe(lance: Lance) {
  if (lance.tipo === 'kakan') return true
  return !!lance.chamadaPor && lance.chamadaPor.tipo !== 'ron'
}

function dadosDoRiichi(lances: readonly Lance[], cadeira: Cadeira, emRiichi: boolean) {
  if (!emRiichi) return null
  const proprios = descartesDe(lances, cadeira)
  const indice = proprios.findIndex((descarte) => descarte.riichi)
  // Declarado pelo menu, sem o descarte marcado: a linha do tempo não diz mais nada.
  if (indice < 0) return { duplo: false, ippatsu: false }

  const descarte = proprios[indice]
  const antes = lances.filter((lance) => lance.ordem < descarte.ordem)
  const depois = lances.filter((lance) => lance.ordem >= descarte.ordem)
  return {
    duplo: indice === 0 && !antes.some(interrompe),
    // Sem novo descarte de quem declarou e sem chamada de ninguém no caminho.
    ippatsu: indice === proprios.length - 1 && !depois.some(interrompe),
  }
}

export function dadosDaPartidaParaMao({
  lances,
  cadeira,
  tipo,
  emRiichi,
}: {
  lances: readonly Lance[]
  cadeira: Cadeira
  tipo: 'ron' | 'tsumo'
  emRiichi: boolean
}): DadosDaPartida {
  const ultimo = lances[lances.length - 1]
  const proprios = descartesDe(lances, cadeira)

  const kanProprio =
    ultimo?.cadeira === cadeira
      ? ultimo.tipo === 'kakan'
      : ultimo?.tipo === 'descarte' &&
        ultimo.chamadaPor?.tipo === 'kan' &&
        ultimo.chamadaPor.cadeira === cadeira
  const rinshan = tipo === 'tsumo' && !!kanProprio
  const chankan =
    tipo === 'ron' && ultimo?.tipo === 'kakan' && !ultimo.fechado && ultimo.cadeira !== cadeira

  return {
    riichi: dadosDoRiichi(lances, cadeira, emRiichi),
    ultimaPedra:
      !rinshan && (tipo === 'tsumo' ? pedrasNoMuro(lances) === 0 : ultimoDescarteDaMao(lances)),
    kan: rinshan || chankan,
    // Sem nenhum lance a mão pode só não ter sido registrada: Yakuman não vem marcado no escuro.
    primeiraCompra:
      tipo === 'tsumo' && lances.length > 0 && proprios.length === 0 && !lances.some(interrompe),
    descartes: proprios.map((descarte) => descarte.pedra),
    kans: lances.filter(
      (lance) => lance.tipo === 'kakan' || (lance.tipo === 'descarte' && lance.chamadaPor?.tipo === 'kan'),
    ).length,
  }
}
