/**
 * @fileoverview Página da calculadora de pontos de mão.
 *
 * A página apenas compõe os modos e o modal. Estado e handlers ficam no hook
 * do domínio de interface para facilitar leitura e manutenção.
 */

import BarraCalculadora from '@/compartilhado/interface/componentes/BarraCalculadora'
import ModalRegras from '../componentes/ModalRegras'
import ModoCompletoCalculadora from '../compartilhado/componentes/ModoCompletoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'
import type { ResultadoCalculoParaCenterpiece } from '@/dominios/centerpiece/logica/tipos-integracao'
import { converterMaoParaCenterpiece } from '@/dominios/centerpiece/logica/tipos-integracao'

interface PropsPaginaCalculadoraMao {
  aoUsarResultado?: (resultado: ResultadoCalculoParaCenterpiece) => void
}

export default function PaginaCalculadoraMao({ aoUsarResultado }: PropsPaginaCalculadoraMao = {}) {
  const calculadora = useCalculadoraMao()

  const cabecalho = (
    <BarraCalculadora modo="completo" />
  )

  const handleUsarResultado = () => {
    if (!aoUsarResultado || !calculadora.resultado) return
    const convertido = converterMaoParaCenterpiece(calculadora.resultado)
    if (convertido) aoUsarResultado(convertido)
  }

  return (
    <div>
      <ModoCompletoCalculadora
        estado={calculadora}
        cabecalho={cabecalho}
        aoAbrirRegras={() => calculadora.setModalRegrasAberto(true)}
      />

      {calculadora.modalRegrasAberto && (
        <ModalRegras
          configuracao={calculadora.configuracao}
          aoMudar={calculadora.setConfiguracao}
          aoFechar={() => calculadora.setModalRegrasAberto(false)}
        />
      )}

      {aoUsarResultado && calculadora.resultadoComYakuValido && (
        <div className="cp-barra-usar-resultado">
          <button
            type="button"
            className="btn-primario cp-btn-usar-resultado"
            onClick={handleUsarResultado}
          >
            <i className="fas fa-check" aria-hidden="true" />
            Usar resultado no Centerpiece
          </button>
        </div>
      )}
    </div>
  )
}
