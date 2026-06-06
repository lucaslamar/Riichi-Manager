import { useCenterpiece } from '../hooks/useCenterpiece'
import SetupCenterpiece from '../componentes/SetupCenterpiece'
import MesaCenterpiece from '../componentes/MesaCenterpiece'

export default function PaginaCenterpiece() {
  const {
    estado,
    modalAberto,
    setModalAberto,
    iniciarMesa,
    registrarRon,
    registrarTsumo,
    declararRiichi,
    registrarRyukyoku,
    registrarChomboPadrao,
    registrarChomboManual,
    desfazer,
    reiniciarMesa,
  } = useCenterpiece()

  if (!estado.iniciada) {
    return (
      <SetupCenterpiece
        pontosIniciaisExistentes={undefined}
        aoIniciar={iniciarMesa}
      />
    )
  }

  return (
    <MesaCenterpiece
      estado={estado}
      modalAberto={modalAberto}
      aoAbrirModal={setModalAberto}
      aoRegistrarRon={registrarRon}
      aoRegistrarTsumo={registrarTsumo}
      aoDeclararRiichi={declararRiichi}
      aoRegistrarRyukyoku={registrarRyukyoku}
      aoRegistrarChomboPadrao={registrarChomboPadrao}
      aoRegistrarChomboManual={registrarChomboManual}
      aoDesfazer={desfazer}
      aoReiniciar={reiniciarMesa}
    />
  )
}
