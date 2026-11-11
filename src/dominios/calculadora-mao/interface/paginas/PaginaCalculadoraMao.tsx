import { useEffect, useState } from 'react'
import BarraCalculadora from '@/compartilhado/interface/componentes/BarraCalculadora'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useConfigSanma } from '@/compartilhado/configuracoes/useConfigSanma'
import { useVarianteModulo } from '@/compartilhado/configuracoes/useVarianteModulo'
import { tileExisteNaVariante, type Variante } from '@/compartilhado/mahjong/variante'
import type { Mao } from '../../logica/mao'
import { ContextoSanmaMao } from '../compartilhado/contextoSanma'
import '../compartilhado/sanma-calculadora.css'
import ModalRegras from '../modais/regras/ModalRegras'
import ModoCompletoCalculadora from '../compartilhado/componentes/ModoCompletoCalculadora'
import { useCalculadoraMao } from '../hooks/useCalculadoraMao'
import {
  converterMaoParaCenterpiece,
  montarMaoParaHistorico,
  type ContextoCenterpieceMao,
  type ResultadoCalculoParaCenterpiece,
} from '@/dominios/centerpiece/logica/tipos-integracao'

/** Pedras (ou Chi) que não existem com 3 jogadores: trocar para o Sanma pede para limpar a mão. */
function maoForaDoSanma(mao: Mao): boolean {
  const pedras = [
    ...mao.pedras,
    ...mao.melds.flatMap((meld) => meld.pedras),
    ...mao.dora,
    ...mao.uradora,
    ...mao.descartes,
  ]
  return (
    pedras.some((pedra) => !tileExisteNaVariante(pedra, 'sanma')) || mao.melds.some((meld) => meld.tipo === 'chii')
  )
}

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
  const { regrasSanma } = useConfigSanma()
  const [varianteEscolhida, setVarianteEscolhida] = useVarianteModulo('calculadora-mao')
  // Aberta pela partida, vale a variante da mesa; sozinha, a do seletor.
  const variante: Variante = contextoCenterpiece ? (contextoCenterpiece.variante ?? 'yonma') : varianteEscolhida
  const regrasDaMao = variante === 'sanma' ? regrasSanma : null
  const [confirmandoLimpeza, setConfirmandoLimpeza] = useState(false)

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
          regrasSanma: regrasDaMao,
        }
      : { fluxoCompleto: telaGrande, regrasSanma: regrasDaMao },
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

  // Para o Sanma com pedras que não existem nele, pergunta antes: nunca some pedra calada.
  const trocarVariante = (nova: Variante) => {
    if (nova === 'sanma' && maoForaDoSanma(calculadora.mao)) setConfirmandoLimpeza(true)
    else setVarianteEscolhida(nova)
  }

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
      {/* Engrenagem do app no cabeçalho, ao lado da marca (aberta pelo Centerpiece, a tela é da mesa). */}
      {visivel && !contextoCenterpiece && <TituloTela titulo={t('menu.handCalculator')} acoes={<BotaoConfiguracoes />} />}
      <ContextoSanmaMao.Provider value={calculadora.mao.sanma ?? null}>
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
      </ContextoSanmaMao.Provider>

      {confirmandoLimpeza && (
        <Modal
          titulo={t('sanma.variante3')}
          aoFechar={() => setConfirmandoLimpeza(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          rodape={
            <div className="acoes-confirmacao-sanma">
              <button type="button" className="btn-contorno" onClick={() => setConfirmandoLimpeza(false)}>
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                className="btn-primario"
                onClick={() => {
                  calculadora.limpar()
                  setVarianteEscolhida('sanma')
                  setConfirmandoLimpeza(false)
                }}
              >
                {t('sanma.limparMao')}
              </button>
            </div>
          }
        >
          <p>{t('sanma.limparMaoConfirmacao')}</p>
        </Modal>
      )}

      {/* Controles deslizantes da mão: só as Regras de cálculo (as do app ficam na engrenagem). */}
      {calculadora.modalRegrasAberto && (
        <ModalRegras
          configuracao={calculadora.configuracao}
          aoMudar={calculadora.setConfiguracao}
          aoFechar={() => calculadora.setModalRegrasAberto(false)}
          variante={variante}
          aoMudarVariante={trocarVariante}
        />
      )}
    </div>
  )
}
