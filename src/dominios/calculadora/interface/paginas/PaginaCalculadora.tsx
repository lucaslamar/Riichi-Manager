/**
 * @fileoverview Página da calculadora de pontos de mão.
 *
 * A página apenas compõe os modos e o modal. Estado e handlers ficam no hook
 * do domínio de interface para facilitar leitura e manutenção.
 */

import { useEffect } from 'react'
import BarraCalculadora from '../componentes/BarraCalculadora'
import ModalRegras from '../componentes/ModalRegras'
import ModoCompletoCalculadora from '../componentes/ModoCompletoCalculadora'
import ModoRapidoCalculadora from '../componentes/ModoRapidoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'
import type { ModoCalculadora } from '../hooks/useCalculadoraMao/tipos'

interface PropsPagina {
  modoInicial: ModoCalculadora
}

export default function PaginaCalculadora({ modoInicial }: PropsPagina) {
  const calculadora = useCalculadoraMao()
  const { setModo } = calculadora

  useEffect(() => {
    setModo(modoInicial)
  }, [modoInicial, setModo])

  const cabecalho = (
    <BarraCalculadora modo={calculadora.modo} />
  )

  return (
    <div>
      {calculadora.modo === 'rapido' ? (
        <ModoRapidoCalculadora
          estado={calculadora}
          cabecalho={cabecalho}
        />
      ) : (
        <ModoCompletoCalculadora
          estado={calculadora}
          cabecalho={cabecalho}
          aoAbrirRegras={() => calculadora.setModalRegrasAberto(true)}
        />
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
