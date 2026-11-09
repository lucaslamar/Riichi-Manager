import { useEffect, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import BarraCalculadora from '@/compartilhado/interface/componentes/BarraCalculadora'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import FolhaConfiguracoes from '@/dominios/configuracoes/interface/FolhaConfiguracoes'
import { RodapeRegras, ListaRegrasCalculo } from '../modais/regras/ModalRegras'
import ModoCompletoCalculadora from '../compartilhado/componentes/ModoCompletoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'
import {
  converterMaoParaCenterpiece,
  montarMaoParaHistorico,
  type ContextoCenterpieceMao,
  type ResultadoCalculoParaCenterpiece,
} from '@/dominios/centerpiece/logica/tipos-integracao'

interface PropsPaginaCalculadoraMao {
  /** Aberta pelo modal de batida do Centerpiece: vitória e ventos vêm da mesa. */
  aoUsarResultado?: (resultado: ResultadoCalculoParaCenterpiece) => void
  contextoCenterpiece?: ContextoCenterpieceMao
  /** Entrada escolhida no registro de batida: só pedras ou só notação MPSZ, sem trocar. */
  entradaFixa?: 'pedras' | 'notacao'
  /** Tela seguinte na ordem da barra inferior (Han e Fu). */
  aoIrParaProximaTela?: () => void
  /**
   * Falso quando outra tela está aberta. A página continua montada (a mão em
   * andamento fica guardada), mas não desenha nada nem escuta gestos.
   */
  visivel?: boolean
  /** Aberta pelo Centerpiece simples: deslizar para qualquer lado volta para lá. */
  aoVoltar?: () => void
}

export default function PaginaCalculadoraMao({
  aoUsarResultado,
  contextoCenterpiece,
  entradaFixa,
  aoIrParaProximaTela,
  visivel = true,
  aoVoltar,
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
  const { t } = useI18n()
  const telaGrande = useMediaQuery('(min-width: 768px), (min-width: 640px) and (min-height: 600px)')

  const calculadora = useCalculadoraMao(
    contextoCenterpiece
      ? {
          initialMao: {
            agari: contextoCenterpiece.tipoVitoria,
            ventoRodada: contextoCenterpiece.ventoRodada,
            ventoAssento: contextoCenterpiece.ventoAssento,
            honba: contextoCenterpiece.honba,
            riichi: contextoCenterpiece.dados
              ? contextoCenterpiece.dados.riichi
              : contextoCenterpiece.jogadorRiichi
                ? { duplo: false, ippatsu: false }
                : null,
            // Riichi e benção não andam juntos: a opção de Riichi some com a benção.
            ...(contextoCenterpiece.dados && {
              ultimaPedra: contextoCenterpiece.dados.ultimaPedra,
              kan: contextoCenterpiece.dados.kan,
              bencao: contextoCenterpiece.dados.primeiraCompra && !contextoCenterpiece.dados.riichi,
              descartes: contextoCenterpiece.dados.descartes,
            }),
          },
          pedrasDaMesa: contextoCenterpiece.dados?.pedrasDaMesa,
          pedraBatidaFixa: contextoCenterpiece.pedraBatida,
          fluxoCompleto: true,
          configuracaoInicial: contextoCenterpiece.regras,
        }
      : { fluxoCompleto: telaGrande },
  )
  const finalizandoMao = calculadora.etapaFinalizacaoAtiva && calculadora.maoProntaParaFinalizar
  /** Teclado de notação no lugar do de pedras. */
  const [entradaNotacao, setEntradaNotacao] = useState(entradaFixa === 'notacao')

  // Ao sair da Calculadora a notação fecha: ao voltar, o campo não abre o
  // teclado do celular sozinho.
  useEffect(() => {
    if (!visivel && !entradaFixa) setEntradaNotacao(false)
  }, [visivel, entradaFixa])

  // A entrada fixa pode mudar com a página montada (atalhos do Centerpiece simples).
  useEffect(() => {
    setEntradaNotacao(entradaFixa === 'notacao')
  }, [entradaFixa])

  // Dedo para a esquerda segue a barra inferior (próxima tela). Dedo para a direita,
  // que nas outras telas volta à anterior, aqui é a primeira aba: na montagem alterna
  // entre pedras e notação; na finalização volta para a edição da mão (o mesmo do
  // botão "Editar mão").
  useDeslizeHorizontal({
    ativo: visivel,
    aoDeslizarDireita: finalizandoMao
      ? calculadora.voltarParaMontagem
      : (aoVoltar ??
        (entradaFixa ? undefined : () => setEntradaNotacao((ativa) => !ativa))),
    aoDeslizarEsquerda: aoVoltar ?? aoIrParaProximaTela,
  })

  // Escondida: nada no DOM, para os estilos `body:has(.card-mao-completa…)`
  // não alcançarem a tela aberta.
  if (!visivel) return null

  const aoUsarMao = aoUsarResultado
    ? () => {
        if (!calculadora.resultado) return
        const convertido = converterMaoParaCenterpiece(calculadora.resultado, {
          vencedorId: contextoCenterpiece?.vencedorId,
          pagadorId: contextoCenterpiece?.pagadorId,
          vencedorEhLeste: contextoCenterpiece?.vencedorEhLeste,
          honbaUsado: contextoCenterpiece?.honba,
        })
        if (convertido) {
          aoUsarResultado({
            ...convertido,
            maoMontada: montarMaoParaHistorico(calculadora.mao, calculadora.resultado, contextoCenterpiece?.regras),
          })
        }
      }
    : undefined

  return (
    <div>
      <ModoCompletoCalculadora
        estado={calculadora}
        cabecalho={contextoCenterpiece ? null : <BarraCalculadora modo="completo" />}
        // Na partida as regras são as da mesa, decididas ao criá-la.
        aoAbrirRegras={contextoCenterpiece?.regras ? undefined : () => calculadora.setModalRegrasAberto(true)}
        aoUsarMao={aoUsarMao}
        contextoCenterpiece={contextoCenterpiece}
        entradaNotacao={entradaNotacao}
        aoMudarEntradaNotacao={setEntradaNotacao}
        entradaFixa={!!entradaFixa}
      />

      {/* Engrenagem: Configurações com Regras de cálculo e Ajustes do app. */}
      {calculadora.modalRegrasAberto && (
        <FolhaConfiguracoes
          className="modal-regras"
          aoFechar={() => calculadora.setModalRegrasAberto(false)}
          abas={[
            {
              id: 'regras',
              rotulo: t('rulesModal.title'),
              subtitulo: t('rulesModal.help'),
              conteudo: (
                <ListaRegrasCalculo configuracao={calculadora.configuracao} aoMudar={calculadora.setConfiguracao} />
              ),
              rodape: (
                <RodapeRegras
                  aoMudar={calculadora.setConfiguracao}
                  aoFechar={() => calculadora.setModalRegrasAberto(false)}
                />
              ),
            },
          ]}
        />
      )}
    </div>
  )
}
