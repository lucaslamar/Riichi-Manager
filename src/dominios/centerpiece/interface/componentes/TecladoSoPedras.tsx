import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ConfiguracaoCalculo } from '@/compartilhado/mahjong/pontuacao/configuracao'
import { TecladoPedras } from '@/dominios/calculadora-mao/interface/montagem-mao/componentes/TecladoPedras'
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { descreverPedra } from '../../logica/descreverPedras'

const SEM_ESPERA = new Map()
const SEM_DORA = new Set<string>()

/** Só as pedras da Calculadora de Mão: sem esperas, batida ou finalização. */
export default function TecladoSoPedras({
  regras,
  aoEscolher,
}: {
  regras: ConfiguracaoCalculo
  aoEscolher: (pedra: CodigoPedra) => void
}) {
  const { t } = useI18n()
  return (
    <div className="dsc-teclado">
      <TecladoPedras
        acaoPendente={null}
        configuracao={regras}
        dorasReais={SEM_DORA}
        esperasPorPedra={SEM_ESPERA}
        filtrarTecladoPorEspera={false}
        furitenBloqueiaRon={false}
        maoCompleta={false}
        podeSelecionarPedra={() => true}
        rotuloEsperaTeclado={() => ''}
        classeEsperaTeclado={() => ''}
        rotuloPedra={(pedra) => descreverPedra(pedra, t)}
        contexto="finalizacao"
        aoAdicionarPedra={aoEscolher}
      />
    </div>
  )
}
