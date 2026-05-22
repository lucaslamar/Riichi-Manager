/**
 * @fileoverview Página da calculadora de pontos de mão.
 *
 * A página apenas compõe os modos e o modal. Estado e handlers ficam no hook
 * do domínio de interface para facilitar leitura e manutenção.
 */

import BarraCalculadora from '../componentes/BarraCalculadora'
import ModalRegras from '../componentes/ModalRegras'
import ModoCompletoCalculadora from '../componentes/ModoCompletoCalculadora'
import ModoRapidoCalculadora from '../componentes/ModoRapidoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'

interface PropsPagina {
  aoVoltar: () => void
}

export default function PaginaCalculadora({ aoVoltar }: PropsPagina) {
  const calculadora = useCalculadoraMao()
  const cabecalho = (
    <BarraCalculadora
      modo={calculadora.modo}
      aoVoltar={aoVoltar}
      aoAbrirRegras={() => calculadora.setModalRegrasAberto(true)}
      aoAlternarModo={() =>
        calculadora.setModo(calculadora.modo === 'completo' ? 'rapido' : 'completo')
      }
    />
  )

  return (
    <div>
      {calculadora.modo === 'rapido' ? (
        <ModoRapidoCalculadora estado={calculadora} cabecalho={cabecalho} />
      ) : (
        <ModoCompletoCalculadora estado={calculadora} cabecalho={cabecalho} />
      )}

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
