import { CHAVE_VENTO, KANJI_VENTO, type Cadeira, type Partida } from '../logica/partida'
import { linhasDoHistorico, linhasEmAndamento } from '../logica/resumoPartida'

/** Texto simples de uma mesa, para o botão compartilhar do card. */
export function textoDaPartida(
  partida: Partida,
  cabecalho: string,
  nomeDe: (cadeira: Cadeira) => string,
  t: (chave: string, parametros?: Record<string, string | number>) => string,
  numero: (valor: number) => string,
) {
  const historico = partida.status === 'finalizada'
  const linhas = (historico ? linhasDoHistorico(partida) : linhasEmAndamento(partida)).map((linha) => {
    const posicao = historico
      ? t('match.result.place', { place: linha.colocacao ?? 0 })
      : `${KANJI_VENTO[linha.vento]} ${t(CHAVE_VENTO[linha.vento])}:`
    const delta =
      historico && linha.delta !== undefined ? ` (${linha.delta > 0 ? '+' : ''}${numero(linha.delta)})` : ''
    return `${posicao} ${nomeDe(linha.cadeira)} ${numero(linha.pontos)}${delta}`
  })
  return [`MOJOCA · ${cabecalho}`, '', ...linhas].join('\n')
}
