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

export default function PaginaCalculadoraMao() {
  const calculadora = useCalculadoraMao()

  const cabecalho = (
    <BarraCalculadora modo="completo" />
  )

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
    </div>
  )
}
