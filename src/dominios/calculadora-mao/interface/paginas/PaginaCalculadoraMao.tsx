import { useEffect, useState } from 'react'
import BarraCalculadora from '@/compartilhado/interface/componentes/BarraCalculadora'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import ModalRegras from '../modais/regras/ModalRegras'
import ModoCompletoCalculadora from '../compartilhado/componentes/ModoCompletoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'

interface PropsPaginaCalculadoraMao {
  /** Tela seguinte na ordem da barra inferior (Han e Fu). */
  aoIrParaProximaTela?: () => void
  /**
   * Falso quando outra tela está aberta. A página continua montada (a mão em
   * andamento fica guardada), mas não desenha nada nem escuta gestos.
   */
  visivel?: boolean
}

export default function PaginaCalculadoraMao({
  aoIrParaProximaTela,
  visivel = true,
}: PropsPaginaCalculadoraMao = {}) {
  /**
   * Em telas grandes (tablets/desktop) todas as opções da finalização
   * aparecem de uma vez, com os padrões já marcados — o usuário escolhe em
   * qualquer ordem e só clica em Calcular. No celular mantém-se o fluxo por
   * etapas (mais guiado no espaço estreito).
   *
   * Vale a partir de 768px e também de 640px, onde o layout de tablet já começa
   * em responsivo.css (o iPad mini tem 744px). Nessa faixa menor, a altura
   * mínima deixa de fora o celular deitado.
   */
  const telaGrande = useMediaQuery('(min-width: 768px), (min-width: 640px) and (min-height: 600px)')

  const calculadora = useCalculadoraMao({ fluxoCompleto: telaGrande })
  const finalizandoMao = calculadora.etapaFinalizacaoAtiva && calculadora.maoProntaParaFinalizar
  /** Campo de notação no lugar do teclado de pedras (fica "à esquerda" dele). */
  const [entradaNotacao, setEntradaNotacao] = useState(false)

  // Ao sair da Calculadora a notação fecha: ao voltar, o campo não abre o
  // teclado do celular sozinho.
  useEffect(() => {
    if (!visivel) setEntradaNotacao(false)
  }, [visivel])

  // Na montagem, a notação fica à esquerda do teclado de pedras: dedo para a
  // direita abre a notação e, nela, dedo para a esquerda volta às pedras. Das
  // pedras, dedo para a esquerda vai para a Han e Fu, a próxima aba da barra.
  // Na finalização, dedo para a direita volta para a edição da mão (o mesmo do
  // botão "Editar mão").
  useDeslizeHorizontal({
    ativo: visivel,
    aoDeslizarDireita: finalizandoMao
      ? calculadora.voltarParaMontagem
      : entradaNotacao
        ? undefined
        : () => setEntradaNotacao(true),
    aoDeslizarEsquerda:
      !finalizandoMao && entradaNotacao ? () => setEntradaNotacao(false) : aoIrParaProximaTela,
  })

  // Escondida: nada no DOM, para os estilos `body:has(.card-mao-completa…)`
  // não alcançarem a tela aberta.
  if (!visivel) return null

  return (
    <div>
      <ModoCompletoCalculadora
        estado={calculadora}
        cabecalho={<BarraCalculadora modo="completo" />}
        aoAbrirRegras={() => calculadora.setModalRegrasAberto(true)}
        entradaNotacao={entradaNotacao}
        aoMudarEntradaNotacao={setEntradaNotacao}
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
