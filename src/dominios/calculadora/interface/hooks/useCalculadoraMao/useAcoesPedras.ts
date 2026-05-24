import {
  criarAcao,
  ordenarMelds,
  ordenarPedras,
  type Acao,
  type CodigoPedra,
  type EsperaPossivel,
  type Mao,
} from '../../../logica/mao'
import {
  MAO_VAZIA,
  codigoBase,
  expandirGrupoMesmoValor,
  podeAdicionarAoChii,
} from '../../constantes'
import type { EstadoMaoCalculadora, TipoMeldCalculadora } from './tipos'

interface ParametrosAcoesPedras {
  estado: Pick<
    EstadoMaoCalculadora,
    'mao' | 'atualizarMao' | 'acaoPendente' | 'setAcaoPendente' | 'slotsUsados' | 'maoCompleta'
  >
  esperasPossiveis: EsperaPossivel[]
  podeAdicionarPedras: (pedras: CodigoPedra[]) => boolean
  podeFormarMeldComMao: (pedras: CodigoPedra[], slotsMeld?: number) => boolean
  indicesPedrasNaMaoPara: (pedras: CodigoPedra[]) => number[]
  sequenciasChiiPossiveis: (pedras: CodigoPedra[]) => CodigoPedra[][]
  escolherSequenciaChii: (
    pedrasSelecionadas: CodigoPedra[],
    sequencias: CodigoPedra[][],
  ) => CodigoPedra[] | null
}

/**
 * Centraliza as ações de edição da mão fechada, indicadores, descartes e melds.
 * Mantém a regra de limite de pedras e limpa estados derivados quando a mão muda.
 *
 * Como ler este arquivo:
 * - `adicionarPedra` é a porta de entrada de quase todo clique no teclado.
 * - quando não há `acaoPendente`, o clique adiciona uma pedra à mão fechada.
 * - quando há `acaoPendente`, o mesmo clique passa a significar dora, descarte ou meld.
 * - funções de remoção sempre cancelam a ação pendente para evitar estados ambíguos.
 */
export function useAcoesPedras({
  estado,
  esperasPossiveis,
  podeAdicionarPedras,
  podeFormarMeldComMao,
  indicesPedrasNaMaoPara,
  sequenciasChiiPossiveis,
  escolherSequenciaChii,
}: ParametrosAcoesPedras) {
  const { mao, atualizarMao, acaoPendente, setAcaoPendente, slotsUsados, maoCompleta } = estado

  /**
   * Recebe uma pedra clicada no teclado e interpreta o clique conforme a ação ativa.
   * O contrato é nunca ultrapassar limite físico de pedras nem completar além de 14 slots.
   */
  const adicionarPedra = (pedra: CodigoPedra) => {
    const montagemDiretaDeMeld = mao.pedras.length === 0
    const manterAcaoMeld = () =>
      setAcaoPendente(slotsUsados <= 11 ? criarAcao(acaoPendente!.tipo) : null)

    /**
     * Move da mão fechada as pedras que já estavam disponíveis e registra o meld final.
     * Para meld aberto, remove riichi porque a mão deixou de ser fechada.
     */
    const aplicarMeld = (
      tipo: TipoMeldCalculadora,
      pedras: CodigoPedra[],
      abrirMao: boolean,
    ) => {
      if (!podeFormarMeldComMao(pedras)) return false
      const indicesRemovidos = indicesPedrasNaMaoPara(pedras)
      const pedrasMeld = [...pedras]
      const posicoesAtualizadas = new Set<number>()

      for (const indiceRemovido of indicesRemovidos) {
        const pedraReal = mao.pedras[indiceRemovido]
        const posicao = pedrasMeld.findIndex(
          (pedraMeld, indicePedraMeld) =>
            !posicoesAtualizadas.has(indicePedraMeld) &&
            codigoBase(pedraMeld) === codigoBase(pedraReal),
        )
        if (posicao >= 0) {
          pedrasMeld[posicao] = pedraReal
          posicoesAtualizadas.add(posicao)
        }
      }

      atualizarMao((rascunho: Mao) => {
        for (const indice of [...indicesRemovidos].sort((a, b) => b - a)) {
          rascunho.pedras.splice(indice, 1)
          if (rascunho.indiceAgari >= indice) rascunho.indiceAgari--
        }
        if (rascunho.indiceAgari >= rascunho.pedras.length) {
          rascunho.indiceAgari = rascunho.pedras.length - 1
        }
        rascunho.melds.push({ tipo, pedras: pedrasMeld })
        ordenarMelds(rascunho.melds)
        if (abrirMao) rascunho.riichi = null
      })
      return true
    }

    if (!acaoPendente) {
      /*
       * Caso base: clique normal no teclado.
       * Se a mão estava em tenpai e a espera clicada é furiten, já marcamos Ron para exibir chombo.
       */
      if (maoCompleta) return
      if (!podeAdicionarPedras([pedra])) return
      const esperaClicada =
        slotsUsados === 13
          ? esperasPossiveis.find((espera) => codigoBase(espera.pedra) === codigoBase(pedra))
          : null
      atualizarMao((rascunho) => {
        rascunho.pedras.push(pedra)
        ordenarPedras(rascunho.pedras)
        rascunho.indiceAgari = rascunho.pedras.lastIndexOf(pedra)
        if (esperaClicada?.furiten) rascunho.agari = 'ron'
      })
      return
    }

    switch (acaoPendente.tipo) {
      case 'dora':
        // Indicadores de dora deixam de ser editáveis quando o usuário usa dora manual.
        if (mao.doraManual > 0) return
        if (mao.dora.length >= 5) return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.dora.push(pedra)
        })
        if (mao.dora.length + 1 >= 5) setAcaoPendente(null)
        return
      case 'uradora':
        if (mao.doraManual > 0) return
        if (mao.uradora.length >= 5) return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.uradora.push(pedra)
        })
        if (mao.uradora.length + 1 >= 5) setAcaoPendente(null)
        return
      case 'descarte':
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.descartes.push(pedra)
          ordenarPedras(rascunho.descartes)
        })
        return
      case 'pon': {
        const pedras = expandirGrupoMesmoValor(pedra, 3)
        if (!montagemDiretaDeMeld && indicesPedrasNaMaoPara(pedras).length < 3) return
        if (!aplicarMeld('pon', pedras, true)) return
        manterAcaoMeld()
        return
      }
      case 'kanAberto': {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!montagemDiretaDeMeld && indicesPedrasNaMaoPara(pedras).length < 4) return
        if (!aplicarMeld('kanAberto', pedras, true)) return
        manterAcaoMeld()
        return
      }
      case 'kanFechado': {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!montagemDiretaDeMeld && indicesPedrasNaMaoPara(pedras).length < 4) return
        if (!aplicarMeld('kanFechado', pedras, false)) return
        manterAcaoMeld()
        return
      }
      case 'chii': {
        /*
         * Chii é a única ação em etapas: o usuário pode clicar uma ou duas pedras
         * e a sequência final é inferida quando existir uma única opção natural.
         */
        if (!podeAdicionarAoChii(acaoPendente.pedras, pedra)) return
        const novasPedras = [...acaoPendente.pedras, pedra]
        const sequenciasPossiveis = sequenciasChiiPossiveis(novasPedras)
        const sequenciaEscolhida = escolherSequenciaChii(novasPedras, sequenciasPossiveis)
        if (sequenciaEscolhida) {
          if (!aplicarMeld('chii', [...sequenciaEscolhida], true)) return
          setAcaoPendente(slotsUsados <= 11 ? criarAcao('chii') : null)
        } else if (novasPedras.length < 3) {
          setAcaoPendente({ tipo: 'chii', pedras: novasPedras })
        } else {
          const pedrasChii = ordenarPedras([...novasPedras])
          if (!aplicarMeld('chii', [...pedrasChii], true)) return
          setAcaoPendente(slotsUsados <= 11 ? criarAcao('chii') : null)
        }
        return
      }
    }
  }

  /** Remove uma pedra da mão fechada e ajusta o índice da pedra de agari quando necessário. */
  const removerPedra = (indicePedra: number) => {
    atualizarMao((rascunho) => {
      rascunho.pedras.splice(indicePedra, 1)
      if (rascunho.indiceAgari >= indicePedra) rascunho.indiceAgari--
    })
    setAcaoPendente(null)
  }

  /** Remove um meld pronto sem devolver pedras para a mão fechada. */
  const removerMeld = (indiceMeld: number) => {
    atualizarMao((rascunho) => {
      rascunho.melds.splice(indiceMeld, 1)
    })
    setAcaoPendente(null)
  }

  /** Remove um descarte próprio usado apenas para análise de furiten. */
  const removerDescarte = (indiceDescarte: number) => {
    atualizarMao((rascunho) => {
      rascunho.descartes.splice(indiceDescarte, 1)
    })
    setAcaoPendente(null)
  }

  /** Restaura a mão vazia padrão e cancela qualquer modo de clique em andamento. */
  const limpar = () => {
    atualizarMao(MAO_VAZIA)
    setAcaoPendente(null)
  }

  /** Liga/desliga o significado especial do próximo clique no teclado. */
  const alternarAcao = (tipo: Acao['tipo']) =>
    setAcaoPendente(acaoPendente?.tipo === tipo ? null : criarAcao(tipo))

  return {
    adicionarPedra,
    removerPedra,
    removerMeld,
    removerDescarte,
    limpar,
    alternarAcao,
  }
}
