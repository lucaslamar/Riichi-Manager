import type { EstadoCenterpiece, ResultadoRon, ResultadoTsumo } from '../../logica/tipos'
import type { ModalCenterpiece } from '../hooks/useCenterpiece'
import CardJogadorMesa from './CardJogadorMesa'
import PainelCentralMesa from './PainelCentralMesa'
import ModalRegistrarBatida from './ModalRegistrarBatida'
import ModalRiichi from './ModalRiichi'
import ModalRyukyoku from './ModalRyukyoku'
import ModalChombo from './ModalChombo'

interface PropsMesaCenterpiece {
  estado: EstadoCenterpiece
  modalAberto: ModalCenterpiece
  aoAbrirModal: (modal: ModalCenterpiece) => void
  aoRegistrarRon: (r: ResultadoRon) => void
  aoRegistrarTsumo: (r: ResultadoTsumo) => void
  aoDeclararRiichi: (jogadorId: string) => void
  aoRegistrarRyukyoku: (tenpaiIds: string[]) => void
  aoRegistrarChomboPadrao: (jogadorId: string) => void
  aoRegistrarChomboManual: (jogadorId: string, valorPorJogador: number) => void
  aoDesfazer: () => void
  aoReiniciar: () => void
}

export default function MesaCenterpiece({
  estado,
  modalAberto,
  aoAbrirModal,
  aoRegistrarRon,
  aoRegistrarTsumo,
  aoDeclararRiichi,
  aoRegistrarRyukyoku,
  aoRegistrarChomboPadrao,
  aoRegistrarChomboManual,
  aoDesfazer,
  aoReiniciar,
}: PropsMesaCenterpiece) {
  const norte = estado.jogadores.find((j) => j.vento === 'norte')
  const sul = estado.jogadores.find((j) => j.vento === 'sul')
  const oeste = estado.jogadores.find((j) => j.vento === 'oeste')
  const leste = estado.jogadores.find((j) => j.vento === 'leste')

  return (
    <div className="centerpiece-mesa">
      <div className="cp-compass">
        <div className="cp-area-norte">
          {norte && <CardJogadorMesa jogador={norte} />}
        </div>
        <div className="cp-area-oeste">
          {oeste && <CardJogadorMesa jogador={oeste} />}
        </div>
        <div className="cp-area-centro">
          <PainelCentralMesa
            estado={estado}
            podDesfazer={estado.historico.length > 0}
            aoAbrirModal={aoAbrirModal}
            aoDesfazer={aoDesfazer}
            aoReiniciar={aoReiniciar}
          />
        </div>
        <div className="cp-area-leste">
          {leste && <CardJogadorMesa jogador={leste} />}
        </div>
        <div className="cp-area-sul">
          {sul && <CardJogadorMesa jogador={sul} />}
        </div>
      </div>

      {modalAberto === 'batida' && (
        <ModalRegistrarBatida
          estado={estado}
          aoRegistrarRon={aoRegistrarRon}
          aoRegistrarTsumo={aoRegistrarTsumo}
          aoFechar={() => aoAbrirModal(null)}
        />
      )}
      {modalAberto === 'riichi' && (
        <ModalRiichi
          estado={estado}
          aoConfirmar={aoDeclararRiichi}
          aoFechar={() => aoAbrirModal(null)}
        />
      )}
      {modalAberto === 'ryukyoku' && (
        <ModalRyukyoku
          estado={estado}
          aoConfirmar={aoRegistrarRyukyoku}
          aoFechar={() => aoAbrirModal(null)}
        />
      )}
      {modalAberto === 'chombo' && (
        <ModalChombo
          estado={estado}
          aoConfirmarPadrao={aoRegistrarChomboPadrao}
          aoConfirmarManual={aoRegistrarChomboManual}
          aoFechar={() => aoAbrirModal(null)}
        />
      )}
    </div>
  )
}
