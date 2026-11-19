import { useEffect, useState } from 'react'
import { marcarMaoEmAndamento } from '@/compartilhado/modo-jogo/maoEmAndamento'
import { calcularFanMcr } from '../logica/fan-mcr'
import {
  adicionar,
  CONDICOES_PADRAO,
  MAO_CHINESA_VAZIA,
  maoVazia,
  paraMotor,
  podeAdicionar,
  removerChamada,
  removerPedra,
  validarMao,
  type CondicoesMcr,
  type MaoChinesa,
  type ModoEntrada,
} from '../logica/montagem'
import { calcularPagamentoMcr } from '../logica/pontuacao-mcr'
import type { ResultadoFanMcr, ResultadoPagamentoMcr } from '../logica/tipos'

export interface ResultadoCalculoMcr {
  fan: ResultadoFanMcr
  pagamento: ResultadoPagamentoMcr | null
}

/** Estado da Calculadora de Mão Chinesa. Não compartilha nada com a japonesa. */
export function useCalculadoraMaoChinesa() {
  const [mao, setMao] = useState<MaoChinesa>(MAO_CHINESA_VAZIA)
  const [modo, setModo] = useState<ModoEntrada>('mao')
  const [condicoes, setCondicoes] = useState<CondicoesMcr>(CONDICOES_PADRAO)
  const [resultado, setResultado] = useState<ResultadoCalculoMcr | null>(null)

  useEffect(() => marcarMaoEmAndamento(!maoVazia(mao)), [mao])
  useEffect(() => () => marcarMaoEmAndamento(false), [])

  // Mudar a mão ou as condições tira o resultado antigo da tela.
  const mudarMao = (mudanca: (atual: MaoChinesa) => MaoChinesa) => {
    setMao(mudanca)
    setResultado(null)
  }
  const alterarCondicao = <Chave extends keyof CondicoesMcr>(chave: Chave, valor: CondicoesMcr[Chave]) => {
    setCondicoes((atuais) => ({ ...atuais, [chave]: valor }))
    setResultado(null)
  }

  const erro = validarMao(mao, condicoes)

  const calcular = () => {
    if (erro) return
    const fan = calcularFanMcr(paraMotor(mao, condicoes), condicoes.flores)
    setResultado({ fan, pagamento: fan.valido ? calcularPagamentoMcr(fan.fanTotal, condicoes.forma) : null })
  }

  return {
    mao,
    modo,
    condicoes,
    resultado,
    erro,
    setModo,
    alterarCondicao,
    calcular,
    podeAdicionar: (id: number) => podeAdicionar(mao, modo, id),
    adicionarPedra: (id: number) => mudarMao((atual) => adicionar(atual, modo, id)),
    removerPedra: (indice: number) => mudarMao((atual) => removerPedra(atual, indice)),
    removerChamada: (indice: number) => mudarMao((atual) => removerChamada(atual, indice)),
    limpar: () => mudarMao(() => MAO_CHINESA_VAZIA),
  }
}
