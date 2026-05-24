import { useAcoesMelds } from './useAcoesMelds'
import { useAcoesPedras } from './useAcoesPedras'
import { useEsperasMao } from './useEsperasMao'
import { useEstadoMao } from './useEstadoMao'
import { useResultadoMao } from './useResultadoMao'

/**
 * Orquestra estado, ações e resultados da calculadora de mão.
 * Componentes devem depender deste hook público, enquanto regras internas ficam nos hooks especializados.
 *
 * Como ler este módulo:
 * 1. `useEstadoMao` guarda a mão e opções editáveis.
 * 2. `useAcoesMelds` responde se uma pedra ou meld pode ser selecionado.
 * 3. `useEsperasMao` e `useResultadoMao` calculam dados derivados.
 * 4. `useAcoesPedras` junta validações e mutações disparadas por clique.
 *
 * A API retornada aqui é a superfície pública da interface da calculadora.
 * Evite mudar nomes sem revisar todos os componentes consumidores.
 */
export function useCalculadoraMao() {
  const estado = useEstadoMao()
  const {
    mao,
    atualizarMao,
    acaoPendente,
    setAcaoPendente,
    configuracao,
    han,
    fu,
    slotsUsados,
    maoCompleta,
  } = estado

  const acoesMelds = useAcoesMelds({ mao, acaoPendente, slotsUsados })

  /*
   * Esperas precisam estar disponíveis antes das ações de clique:
   * ao clicar uma espera em furiten, a ação força `agari = ron` para exibir a penalidade correta.
   */
  const { esperasPossiveis, calculandoEsperas } = useEsperasMao({
    mao,
    configuracao,
    slotsUsados,
  })
  const resultados = useResultadoMao({ mao, configuracao, han, fu, maoCompleta })
  const acoesPedras = useAcoesPedras({
    estado: {
      mao,
      atualizarMao,
      acaoPendente,
      setAcaoPendente,
      slotsUsados,
      maoCompleta,
    },
    esperasPossiveis,
    podeAdicionarPedras: acoesMelds.podeAdicionarPedras,
    podeFormarMeldComMao: acoesMelds.podeFormarMeldComMao,
    indicesPedrasNaMaoPara: acoesMelds.indicesPedrasNaMaoPara,
    sequenciasChiiPossiveis: acoesMelds.sequenciasChiiPossiveis,
    escolherSequenciaChii: acoesMelds.escolherSequenciaChii,
  })

  const podeMeld = mao.riichi === null && !mao.bencao && slotsUsados < 14
  const podeKanFechado = !mao.bencao
  const maoAberta = mao.melds.some((meld) => meld.tipo !== 'kanFechado')

  return {
    ...estado,
    contarCodigo: acoesMelds.contarCodigo,
    contarAka: acoesMelds.contarAka,
    podeSelecionarPedra: acoesMelds.podeSelecionarPedra,
    ...resultados,
    esperasPossiveis,
    calculandoEsperas,
    ...acoesPedras,
    podeMeld,
    podeKanFechado,
    maoAberta,
  }
}

export type EstadoCalculadoraMao = ReturnType<typeof useCalculadoraMao>
