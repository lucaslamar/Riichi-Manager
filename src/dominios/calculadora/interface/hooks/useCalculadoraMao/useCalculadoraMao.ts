import { useEffect, useMemo, useState } from 'react'
import { useAcoesMelds } from './useAcoesMelds'
import { useAcoesPedras } from './useAcoesPedras'
import { useEsperasMao } from './useEsperasMao'
import { useEstadoMao } from './useEstadoMao'
import { useResultadoMao } from './useResultadoMao'

const YAKU_APENAS_BONUS = new Set(['Dora', 'Uradora', 'Akadora', 'Dora manual'])

function resultadoTemYakuValido(resultado: ReturnType<typeof useResultadoMao>['resultado']) {
  if (!resultado || resultado.agari == null || resultado.semYaku) return false
  if (resultado.yakuman > 0) return true
  return resultado.yaku.some(([nome, _han, yakuman]) => yakuman || !YAKU_APENAS_BONUS.has(nome))
}

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
  const [assinaturaCalculo, setAssinaturaCalculo] = useState<string | null>(null)
  const assinaturaMaoAtual = useMemo(
    () =>
      JSON.stringify({
        mao,
        configuracao,
      }),
    [mao, configuracao],
  )
  const deveCalcularMao = maoCompleta && assinaturaCalculo === assinaturaMaoAtual

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
  const resultados = useResultadoMao({
    mao,
    configuracao,
    han,
    fu,
    maoCompleta,
    deveCalcularMao,
  })
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

  const podeMeld = mao.riichi === null && !mao.bencao
  const podeChii = podeMeld && acoesMelds.podeChii
  const podePon = podeMeld && acoesMelds.podePon
  const podeKanAberto = podeMeld && acoesMelds.podeKanAberto
  const podeKanFechado = !mao.bencao && acoesMelds.podeKanFechado
  const maoAberta = mao.melds.some((meld) => meld.tipo !== 'kanFechado')
  const resultadoComYakuValido = resultadoTemYakuValido(resultados.resultado)
  const resultadoMaoInvalida =
    deveCalcularMao &&
    maoCompleta &&
    (!!resultados.resultado || resultados.resultado === null) &&
    !resultados.furitenRonCompleto &&
    !resultadoComYakuValido
  const podeCalcularMao = slotsUsados >= 14
  const calcularMaoAtual = () => {
    if (!podeCalcularMao) return
    setAssinaturaCalculo(assinaturaMaoAtual)
  }

  useEffect(() => {
    if (!acaoPendente) return

    const acaoAindaPodeContinuar =
      (acaoPendente.tipo === 'chii' && podeChii) ||
      (acaoPendente.tipo === 'pon' && podePon) ||
      (acaoPendente.tipo === 'kanAberto' && podeKanAberto) ||
      (acaoPendente.tipo === 'kanFechado' && podeKanFechado) ||
      acaoPendente.tipo === 'dora' ||
      acaoPendente.tipo === 'uradora' ||
      acaoPendente.tipo === 'descarte'

    if (!acaoAindaPodeContinuar) setAcaoPendente(null)
  }, [
    acaoPendente,
    podeChii,
    podeKanAberto,
    podeKanFechado,
    podePon,
    setAcaoPendente,
  ])

  return {
    ...estado,
    contarCodigo: acoesMelds.contarCodigo,
    contarAka: acoesMelds.contarAka,
    podeSelecionarPedra: acoesMelds.podeSelecionarPedra,
    ...resultados,
    deveCalcularMao,
    podeCalcularMao,
    calcularMaoAtual,
    resultadoComYakuValido,
    resultadoMaoInvalida,
    esperasPossiveis,
    calculandoEsperas,
    ...acoesPedras,
    podeMeld,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    maoAberta,
  }
}

export type EstadoCalculadoraMao = ReturnType<typeof useCalculadoraMao>
