import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ConfiguracaoCalculo } from '@/compartilhado/mahjong/pontuacao/configuracao'
import { cabeMaisUmaPedra } from '@/dominios/calculadora-mao/interface/constantes'
import { TecladoPedras } from '@/dominios/calculadora-mao/interface/montagem-mao/componentes/TecladoPedras'
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { descreverPedra } from '../../logica/descreverPedras'
import { ContextoSanmaMao } from '@/dominios/calculadora-mao/interface/compartilhado/contextoSanma'
import { REGRAS_SANMA_PADRAO } from '@/compartilhado/mahjong/variante'

/** Sanma: o teclado só precisa saber que é Sanma (some 2m–8m e o 5m vermelho). */
const SANMA_TECLADO = { regras: REGRAS_SANMA_PADRAO, kita: 0 }

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
  sanma = false,
}: {
  regras: ConfiguracaoCalculo
  vistas: readonly CodigoPedra[]
  aoEscolher: (pedra: CodigoPedra) => void
  /** Partida de Sanma: sem 2m–8m. */
  sanma?: boolean
}) {
  const { t } = useI18n()
  return (
    <ContextoSanmaMao.Provider value={sanma ? SANMA_TECLADO : null}>
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
    </ContextoSanmaMao.Provider>
  )
}
