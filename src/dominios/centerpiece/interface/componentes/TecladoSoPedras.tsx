import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ConfiguracaoCalculo } from '@/compartilhado/mahjong/pontuacao/configuracao'
import { cabeMaisUmaPedra } from '@/dominios/calculadora-mao/interface/constantes'
import { TecladoPedras } from '@/dominios/calculadora-mao/interface/montagem-mao/componentes/TecladoPedras'
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { descreverPedra } from '../../logica/descreverPedras'

const SEM_ESPERA = new Map()
const SEM_DORA = new Set<string>()

/**
 * Só as pedras da Calculadora de Mão: sem esperas, batida ou finalização. As
 * pedras já à vista (`vistas`) contam no limite de cópias, como na calculadora:
 * 4 de cada e um só 5 vermelho por naipe, que sai segurando o 5 no celular.
 */
export default function TecladoSoPedras({
  regras,
  vistas,
  aoEscolher,
}: {
  regras: ConfiguracaoCalculo
  vistas: readonly CodigoPedra[]
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
        podeSelecionarPedra={(pedra) => cabeMaisUmaPedra(vistas, pedra, regras.akadora)}
        rotuloEsperaTeclado={() => ''}
        classeEsperaTeclado={() => ''}
        rotuloPedra={(pedra) => descreverPedra(pedra, t)}
        contexto="montagem"
        aoAdicionarPedra={aoEscolher}
      />
    </div>
  )
}
