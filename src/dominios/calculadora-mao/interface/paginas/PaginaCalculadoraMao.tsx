import BarraCalculadora from '@/compartilhado/interface/componentes/BarraCalculadora'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import ModalRegras from '../modais/regras/ModalRegras'
import ModoCompletoCalculadora from '../compartilhado/componentes/ModoCompletoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'

interface PropsPaginaCalculadoraMao {
  aoAbrirCalculadoraRapida?: () => void
}

export default function PaginaCalculadoraMao({
  aoAbrirCalculadoraRapida,
}: PropsPaginaCalculadoraMao = {}) {
  /**
   * Em telas grandes (tablets/desktop, ≥768px) todas as opções da finalização
   * aparecem de uma vez, com os padrões já marcados — o usuário escolhe em
   * qualquer ordem e só clica em Calcular. No celular mantém-se o fluxo por
   * etapas (mais guiado no espaço estreito).
   */
  const telaGrande = useMediaQuery('(min-width: 768px)')

  const calculadora = useCalculadoraMao({ fluxoCompleto: telaGrande })

  return (
    <div>
      <ModoCompletoCalculadora
        estado={calculadora}
        cabecalho={<BarraCalculadora modo="completo" />}
        aoAbrirRegras={() => calculadora.setModalRegrasAberto(true)}
        aoAbrirCalculadoraRapida={aoAbrirCalculadoraRapida}
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
