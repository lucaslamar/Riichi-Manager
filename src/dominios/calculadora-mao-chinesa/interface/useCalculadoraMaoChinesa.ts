import { useEffect, useState } from 'react'
import { marcarMaoEmAndamento } from '@/compartilhado/modo-jogo/maoEmAndamento'
import { calcularFanMcr } from '../logica/fan-mcr'
import {
  adicionarChamada,
  adicionarFlor,
  adicionarPedra,
  CONDICOES_PADRAO,
  escolherBatida,
  MAO_CHINESA_VAZIA,
  maoCompleta,
  maoVazia,
  paraMotor,
  podeAdicionarPedra,
  podeChamar,
  proximaFlor,
  removerChamada,
  removerFlor,
  removerPedra,
  sequenciasDoChi,
  validarMao,
  type CondicoesMcr,
  type Flor,
  type MaoChinesa,
  type TipoChamada,
  type TipoFlor,
} from '../logica/montagem'
import { calcularPagamentoMcr } from '../logica/pontuacao-mcr'
import type { ResultadoFanMcr, ResultadoPagamentoMcr } from '../logica/tipos'

export interface ResultadoCalculoMcr {
  fan: ResultadoFanMcr
  pagamento: ResultadoPagamentoMcr | null
}

/** Chi com mais de uma sequência possível: o teclado mostra as opções. */
export interface ChiPendente {
  chamada: number
  meios: number[]
}

/**
 * Estado da Calculadora de Mão Chinesa: montar a mão e, com 14 pedras, finalizar
 * (condições e cálculo). Não compartilha estado nem hooks com a japonesa.
 */
export function useCalculadoraMaoChinesa() {
  const [mao, setMao] = useState<MaoChinesa>(MAO_CHINESA_VAZIA)
  const [acao, setAcao] = useState<TipoChamada | null>(null)
  const [chiPendente, setChiPendente] = useState<ChiPendente | null>(null)
  const [finalizando, setFinalizando] = useState(false)
  const [condicoes, setCondicoes] = useState<CondicoesMcr>(CONDICOES_PADRAO)
  const [resultado, setResultado] = useState<ResultadoCalculoMcr | null>(null)

  useEffect(() => marcarMaoEmAndamento(!maoVazia(mao)), [mao])
  useEffect(() => () => marcarMaoEmAndamento(false), [])

  // Mudar a mão ou as condições tira o resultado antigo; calcular de novo é pelo botão.
  const mudarMao = (mudanca: (atual: MaoChinesa) => MaoChinesa) => {
    setMao(mudanca)
    setResultado(null)
  }
  const alterarCondicao = <Chave extends keyof CondicoesMcr>(
    chave: Chave,
    valor: CondicoesMcr[Chave],
  ) => {
    setCondicoes((atuais) => ({ ...atuais, [chave]: valor }))
    setResultado(null)
  }

  const tocarPedra = (id: number) => {
    if (!acao) {
      mudarMao((atual) => adicionarPedra(atual, id))
      return
    }
    if (acao === 'chi') {
      const meios = sequenciasDoChi(mao, id)
      if (meios.length > 1) {
        setChiPendente({ chamada: id, meios })
        return
      }
      if (meios.length === 1)
        mudarMao((atual) => adicionarChamada(atual, { tipo: 'chi', meio: meios[0] }))
    } else {
      mudarMao((atual) => adicionarChamada(atual, { tipo: acao, meio: id }))
    }
    setAcao(null)
  }

  const escolherChi = (meio: number) => {
    mudarMao((atual) => adicionarChamada(atual, { tipo: 'chi', meio }))
    setChiPendente(null)
    setAcao(null)
  }

  const erro = validarMao(mao, condicoes)

  const calcular = () => {
    if (erro) return
    const fan = calcularFanMcr(paraMotor(mao, condicoes), mao.flores.length)
    setResultado({
      fan,
      pagamento: fan.valido ? calcularPagamentoMcr(fan.fanTotal, condicoes.forma) : null,
    })
  }

  return {
    mao,
    acao,
    chiPendente,
    finalizando: finalizando && maoCompleta(mao),
    condicoes,
    resultado,
    erro,
    alterarCondicao,
    calcular,
    fecharResultado: () => setResultado(null),
    alternarAcao: (tipo: TipoChamada) => {
      setChiPendente(null)
      setAcao((atual) => (atual === tipo ? null : tipo))
    },
    podeTocarPedra: (id: number) =>
      acao ? podeChamar(mao, acao, id) : podeAdicionarPedra(mao, id),
    podeChamarAlguma: (tipo: TipoChamada) =>
      Array.from({ length: 34 }, (_, i) => i + 1).some((id) => podeChamar(mao, tipo, id)),
    tocarPedra,
    escolherChi,
    removerPedra: (indice: number) => mudarMao((atual) => removerPedra(atual, indice)),
    removerChamada: (indice: number) => mudarMao((atual) => removerChamada(atual, indice)),
    escolherBatida: (indice: number) => mudarMao((atual) => escolherBatida(atual, indice)),
    proximaFlor: (tipo: TipoFlor) => proximaFlor(mao, tipo),
    adicionarFlor: (tipo: TipoFlor) => mudarMao((atual) => adicionarFlor(atual, tipo)),
    removerFlor: (flor: Flor) => mudarMao((atual) => removerFlor(atual, flor)),
    finalizar: () => {
      setAcao(null)
      setChiPendente(null)
      setFinalizando(true)
    },
    voltarParaMontagem: () => {
      setFinalizando(false)
      setResultado(null)
    },
    limpar: () => {
      mudarMao(() => MAO_CHINESA_VAZIA)
      setAcao(null)
      setChiPendente(null)
      setFinalizando(false)
    },
  }
}
