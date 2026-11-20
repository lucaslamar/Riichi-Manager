/**
 * Entrada MPSZ do modo Chinês: o mesmo teclado e o mesmo leitor da notação da
 * calculadora japonesa (`123m 456p 777z 123mc 1111sa`), convertidos para a mão
 * chinesa. Honras: 1z-4z ventos (E S W N), 5z branco, 6z verde e 7z vermelho.
 * Flores não se digitam: ficam as que já estão na mão.
 */
import type { CodigoPedra, Meld } from '@/dominios/calculadora-mao/logica/mao'
import {
  gerarNotacaoCompleta,
  interpretarNotacaoCompleta,
  normalizarNotacao,
  separarPendentes,
  type ErroNotacao,
} from '@/dominios/calculadora-mao/logica/notacao'
import {
  pedrasDaChamada,
  pedrasContadas,
  type Chamada,
  type MaoChinesa,
  type TipoChamada,
} from './montagem'

const HONRAS_ID: Record<string, number> = {
  '1': 28,
  '2': 29,
  '3': 30,
  '4': 31,
  '5': 34,
  '6': 33,
  '7': 32,
}
const HONRAS_CODIGO: Record<number, string> = {
  28: '1',
  29: '2',
  30: '3',
  31: '4',
  34: '5',
  33: '6',
  32: '7',
}
const TIPO_MELD: Record<Meld['tipo'], TipoChamada> = {
  chii: 'chi',
  pon: 'pon',
  kanAberto: 'kanAberto',
  kanFechado: 'kanFechado',
}
const TIPO_CHAMADA: Record<TipoChamada, Meld['tipo']> = {
  chi: 'chii',
  pon: 'pon',
  kanAberto: 'kanAberto',
  kanFechado: 'kanFechado',
}

export function idDoCodigo(codigo: CodigoPedra): number {
  const numero = Number(codigo[0] === '0' ? '5' : codigo[0])
  if (codigo[1] === 'm') return numero
  if (codigo[1] === 's') return numero + 9
  if (codigo[1] === 'p') return numero + 18
  return HONRAS_ID[codigo[0]]
}

export function codigoDoId(id: number): CodigoPedra {
  if (id <= 9) return `${id}m` as CodigoPedra
  if (id <= 18) return `${id - 9}s` as CodigoPedra
  if (id <= 27) return `${id - 18}p` as CodigoPedra
  return `${HONRAS_CODIGO[id]}z` as CodigoPedra
}

/** A mão escrita em MPSZ, com a batida por último (para abrir o campo com ela). */
export function mpszDaMao(mao: MaoChinesa): string {
  const melds = mao.chamadas.map((chamada) => ({
    tipo: TIPO_CHAMADA[chamada.tipo],
    pedras: pedrasDaChamada(chamada).map(codigoDoId),
  })) as Meld[]
  return gerarNotacaoCompleta(mao.pedras.map(codigoDoId), mao.pedras.length - 1, melds)
}

export type LeituraMpsz = { mao: MaoChinesa; erro: null } | { mao: null; erro: ErroNotacao }

/** Lê o texto completo (sem números ainda sem naipe). Mais de 4 iguais ou de 14 pedras é erro. */
export function maoDoMpsz(texto: string, flores: MaoChinesa['flores']): LeituraMpsz {
  const { completo } = separarPendentes(normalizarNotacao(texto))
  const lido = interpretarNotacaoCompleta(completo, { akadora: false })
  if (lido.erro) return { mao: null, erro: lido.erro }
  const mao: MaoChinesa = {
    pedras: lido.pedras.map(idDoCodigo),
    chamadas: lido.melds.map(
      (meld): Chamada => ({ tipo: TIPO_MELD[meld.tipo], meio: idDoCodigo(meld.pedras[1]) }),
    ),
    flores,
  }
  const todas = [...mao.pedras, ...mao.chamadas.flatMap(pedrasDaChamada)]
  if (todas.some((id) => todas.filter((outro) => outro === id).length > 4)) {
    return { mao: null, erro: { chave: 'mcr.entrada.erroQuatro' } }
  }
  if (pedrasContadas(mao) > 14)
    return { mao: null, erro: { chave: 'notation.errors.tooManyTiles' } }
  return { mao, erro: null }
}
