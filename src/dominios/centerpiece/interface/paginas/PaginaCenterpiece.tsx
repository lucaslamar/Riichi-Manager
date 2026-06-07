import { useState } from 'react'
import { useCenterpiece } from '../hooks/useCenterpiece'
import SetupCenterpiece from '../componentes/SetupCenterpiece'
import MesaCenterpiece from '../componentes/MesaCenterpiece'
import PaginaCalculadoraMao from '@/dominios/calculadora-mao/interface/paginas/PaginaCalculadoraMao'
import type { ContextoCalcMao } from '../componentes/ModalRegistrarBatida'
import type { ResultadoCalculoParaCenterpiece } from '../../logica/tipos-integracao'

interface CalcMaoAberta {
  contexto: ContextoCalcMao
  aoReceberResultado: (r: ResultadoCalculoParaCenterpiece) => void
}

export default function PaginaCenterpiece() {
  const {
    estado,
    modalAberto,
    setModalAberto,
    mensagemDesfazer,
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

  const [calcMaoAberta, setCalcMaoAberta] = useState<CalcMaoAberta | null>(null)

  const aoAbrirCalculadoraMao = (
    contexto: ContextoCalcMao,
    aoReceberResultado: (r: ResultadoCalculoParaCenterpiece) => void,
  ) => {
    setCalcMaoAberta({ contexto, aoReceberResultado })
  }

  const aoUsarResultadoCalc = (resultado: ResultadoCalculoParaCenterpiece) => {
    const contexto = calcMaoAberta?.contexto
    if (contexto) {
      if (resultado.tipoVitoria === 'ron') {
        const pontos = resultado.pontosRon
        if (pontos != null && contexto.vencedorId && contexto.pagadorId) {
          registrarRon({ vencedorId: contexto.vencedorId, pagadorId: contexto.pagadorId, pontos })
          setModalAberto(null)
        }
      } else {
        const { pagamentoDealer, pagamentoNaoDealer } = resultado
        if (pagamentoDealer != null && pagamentoNaoDealer != null && contexto.vencedorId) {
          registrarTsumo({ vencedorId: contexto.vencedorId, pagamentoDealer, pagamentoNaoDealer })
          setModalAberto(null)
        }
      }
    }
    setCalcMaoAberta(null)
  }

  if (!estado.iniciada) {
    return (
      <SetupCenterpiece
        pontosIniciaisExistentes={undefined}
        aoIniciar={iniciarMesa}
      />
    )
  }

  return (
    <>
      {/* MesaCenterpiece fica montado (estado preservado) mesmo durante a calculadora */}
      <div style={calcMaoAberta ? { display: 'none' } : undefined}>
        <MesaCenterpiece
          estado={estado}
          modalAberto={modalAberto}
          mensagemDesfazer={mensagemDesfazer}
          aoAbrirModal={setModalAberto}
          aoRegistrarRon={registrarRon}
          aoRegistrarTsumo={registrarTsumo}
          aoDeclararRiichi={declararRiichi}
          aoRegistrarRyukyoku={registrarRyukyoku}
          aoRegistrarChomboPadrao={registrarChomboPadrao}
          aoRegistrarChomboManual={registrarChomboManual}
          aoDesfazer={desfazer}
          aoReiniciar={reiniciarMesa}
          aoAbrirCalculadoraMao={aoAbrirCalculadoraMao}
        />
      </div>

      {calcMaoAberta && (
        <PaginaCalculadoraMao
          aoUsarResultado={aoUsarResultadoCalc}
          contextoCenterpiece={calcMaoAberta.contexto}
          aoVoltar={() => setCalcMaoAberta(null)}
        />
      )}
    </>
  )
}
