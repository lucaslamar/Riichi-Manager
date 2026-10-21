import { useMemo } from 'react'
import type { Acao, CodigoPedra, ConfiguracaoCalculo, EsperaPossivel } from '../../../logica/mao'
import { TecladoPedras } from '../../montagem-mao/componentes/TecladoPedras'
import './teclado-contextual.css'

const semRotuloEspera = () => ''
const semClasseEspera = () => ''

/**
 * Teclado de pedras para escolher uma pedra dentro de um painel (indicadores de
 * Dora, descartes...). Segue o padrão do teclado da montagem em cada aparelho:
 * linhas na largura do painel, Honras centralizadas e pedras na proporção
 * certa. Sem esperas, furiten nem rodapé: só seleciona pedras.
 */
export function TecladoContextual({
  acaoPendente,
  configuracao,
  dorasReais,
  podeSelecionarPedra,
  aoAdicionarPedra,
}: {
  acaoPendente: Acao | null
  configuracao: ConfiguracaoCalculo
  dorasReais: Set<string>
  podeSelecionarPedra: (pedra: CodigoPedra) => boolean
  aoAdicionarPedra: (pedra: CodigoPedra) => void
}) {
  const semEsperas = useMemo(() => new Map<string, EsperaPossivel>(), [])

  return (
    <div className="painel-teclado-calculadora painel-teclado-contextual-finalizacao teclado-contextual">
      <TecladoPedras
        acaoPendente={acaoPendente}
        configuracao={configuracao}
        dorasReais={dorasReais}
        esperasPorPedra={semEsperas}
        filtrarTecladoPorEspera={false}
        furitenBloqueiaRon={false}
        maoCompleta={false}
        podeSelecionarPedra={podeSelecionarPedra}
        rotuloEsperaTeclado={semRotuloEspera}
        classeEsperaTeclado={semClasseEspera}
        contexto="finalizacao"
        aoAdicionarPedra={aoAdicionarPedra}
      />
    </div>
  )
}
