import { useEffect, useState } from 'react'
import { useDeslizeHorizontal } from '@/compartilhado/interface/hooks/useDeslizeHorizontal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { BotaoAcao } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/Botoes'
import { CampoNotacaoMao } from '@/dominios/calculadora-mao/interface/montagem-mao/componentes/CampoNotacaoMao'
import {
  lerPendentes,
  separarPendentes,
  tipoDoGrupoPendente,
  type Acao,
  type Meld,
} from '@/dominios/calculadora-mao/logica/mao'
import type { ErroNotacao } from '@/dominios/calculadora-mao/logica/notacao'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import {
  maoCompleta,
  pedrasContadas,
  type CondicoesMcr,
  type TipoChamada,
} from '../logica/montagem'
import { maoDoMpsz, mpszDaMao } from '../logica/mpsz'
import '../estilos/calculadora-mao-chinesa.css'
import ControlesCondicoes from './ControlesCondicoes'
import MaoChinesaAtual from './MaoChinesaAtual'
import ModalResultadoMcr from './ModalResultadoMcr'
import TecladoChines from './TecladoChines'
import { useCalculadoraMaoChinesa } from './useCalculadoraMaoChinesa'

const TIPO_DO_MELD: Record<Meld['tipo'], TipoChamada> = {
  chii: 'chi',
  pon: 'pon',
  kanAberto: 'kanAberto',
  kanFechado: 'kanFechado',
}
const CHAMADAS: { tipo: TipoChamada; acao: Acao['tipo']; chave: string; chaveCompacta: string }[] =
  [
    { tipo: 'chi', acao: 'chii', chave: 'melds.chii', chaveCompacta: 'melds.chii' },
    { tipo: 'pon', acao: 'pon', chave: 'melds.pon', chaveCompacta: 'melds.pon' },
    {
      tipo: 'kanAberto',
      acao: 'kanAberto',
      chave: 'melds.kanAberto',
      chaveCompacta: 'melds.kanCompact',
    },
    {
      tipo: 'kanFechado',
      acao: 'kanFechado',
      chave: 'melds.kanFechado',
      chaveCompacta: 'melds.kanClosedCompact',
    },
  ]
/**
 * Calculadora de Mão Chinesa (MCR / Guobiao), com o mesmo layout da japonesa:
 * montar a mão no teclado e, com 14 pedras, finalizar com as condições e calcular.
 */
export default function CalculadoraMaoChinesa({
  visivel,
  aoIrParaProximaTela,
  condicoesIniciais,
  entradaInicial,
  titulo,
  aoVoltar,
  aoUsarFan,
}: {
  visivel: boolean
  aoIrParaProximaTela?: () => void
  /** Aberta pelo Placar: batida e ventos já vêm da mesa. */
  condicoesIniciais?: Partial<CondicoesMcr>
  entradaInicial?: 'pedras' | 'notacao'
  titulo?: string
  aoVoltar?: () => void
  /** Aberta pelo Placar: o resultado ganha o botão que leva o fan total para a mesa. */
  aoUsarFan?: (fan: number) => void
}) {
  const { t } = useI18n()
  const calc = useCalculadoraMaoChinesa(condicoesIniciais)
  const { mao } = calc
  const completa = maoCompleta(mao)
  const [entradaNotacao, setEntradaNotacao] = useState(entradaInicial === 'notacao')
  const [textoNotacao, setTextoNotacao] = useState('')
  const [erroNotacao, setErroNotacao] = useState<ErroNotacao | null>(null)
  // Como no Riichi: o que espera o naipe aparece na mão, tracejado.
  const { completo: notacaoCompleta, pendentes: textoPendente } = separarPendentes(textoNotacao)
  const gruposPendentes = lerPendentes(textoPendente).map((grupo) => ({
    ...grupo,
    tipo: tipoDoGrupoPendente(grupo),
  }))
  // A mão mudou fora do campo (toque numa pedra, lixeira): o texto acompanha.
  const assinatura = (alvo: typeof mao) =>
    JSON.stringify([[...alvo.pedras].sort(), alvo.chamadas.map((c) => c.tipo + c.meio).sort()])
  useEffect(() => {
    if (!entradaNotacao) return
    const lida = maoDoMpsz(notacaoCompleta, mao.flores).mao
    if (lida && assinatura(lida) === assinatura(mao)) return
    setTextoNotacao(mpszDaMao(mao) + textoPendente)
    // Só reage à mão; reagir ao texto desfaria a digitação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mao, entradaNotacao])
  const reescreverPendentes = (grupos: string[]) => mudarNotacao(notacaoCompleta + grupos.join(''))
  const pendentes = entradaNotacao
    ? {
        pedras: gruposPendentes
          .filter((grupo) => !grupo.tipo)
          .flatMap((grupo) => [...grupo.digitos]),
        melds: gruposPendentes.flatMap((grupo, indice) =>
          grupo.tipo ? [{ indice, tipo: grupo.tipo, pedras: [...grupo.digitos] }] : [],
        ),
        aoRemoverMeld: (indice: number) =>
          reescreverPendentes(
            gruposPendentes
              .filter((_grupo, posicao) => posicao !== indice)
              .map((grupo) => grupo.digitos + grupo.marca),
          ),
        aoRemoverPedra: (posicao: number) => {
          let restante = posicao
          reescreverPendentes(
            gruposPendentes.map((grupo) => {
              if (grupo.tipo || restante < 0) return grupo.digitos + grupo.marca
              if (restante >= grupo.digitos.length) {
                restante -= grupo.digitos.length
                return grupo.digitos + grupo.marca
              }
              const digitos = grupo.digitos.slice(0, restante) + grupo.digitos.slice(restante + 1)
              restante = -1
              return digitos && digitos + grupo.marca
            }),
          )
        },
      }
    : undefined

  const abrirNotacao = () => {
    setTextoNotacao(mao.pedras.length || mao.chamadas.length ? mpszDaMao(mao) : '')
    setErroNotacao(null)
    setEntradaNotacao(true)
  }
  // Mesmos gestos da japonesa: direita volta da finalização ou alterna o MPSZ, esquerda vai para a próxima tela.
  useDeslizeHorizontal({
    ativo: visivel,
    aoDeslizarDireita: calc.finalizando
      ? calc.voltarParaMontagem
      : () => (entradaNotacao ? setEntradaNotacao(false) : abrirNotacao()),
    aoDeslizarEsquerda: aoIrParaProximaTela,
  })

  // Escondida, a mão continua no estado (como na japonesa), mas nada vai para a tela.
  if (!visivel) return null

  // Entrada inválida é recusada, como no Riichi: a mão não muda e o erro aparece até o próximo toque.
  const mudarNotacao = (texto: string) => {
    const lida = maoDoMpsz(texto, mao.flores)
    if (lida.erro) {
      setErroNotacao(lida.erro)
      return
    }
    setErroNotacao(null)
    setTextoNotacao(texto)
    calc.substituirMao(lida.mao)
  }
  const TIPO_MELD: Record<TipoChamada, Meld['tipo']> = {
    chi: 'chii',
    pon: 'pon',
    kanAberto: 'kanAberto',
    kanFechado: 'kanFechado',
  }

  const botoesAcao = (compacto: boolean) => (
    <>
      {CHAMADAS.map(({ tipo, acao, chave, chaveCompacta }) => (
        <BotaoAcao
          key={tipo}
          tipo={acao}
          rotulo={t(compacto ? chaveCompacta : chave)}
          ativo={calc.acao === tipo}
          desabilitado={calc.acao !== tipo && !calc.podeChamarAlguma(tipo)}
          aoClicar={() => calc.alternarAcao(tipo)}
        />
      ))}
      <BotaoAcao
        tipo="notacao"
        rotulo={t('notation.toggle')}
        ativo={false}
        desabilitado={false}
        aoClicar={abrirNotacao}
      />
    </>
  )

  return (
    <div className="mcr-calculadora">
      <TituloTela
        titulo={titulo ?? t('menu.handCalculatorChinese')}
        aoVoltar={aoVoltar}
        acoes={aoVoltar ? undefined : <BotaoConfiguracoes />}
      />

      <div
        className={`card card-mao-completa fluxo-calculadora ${calc.finalizando ? 'etapa-finalizacao' : 'etapa-montagem'}`}
      >
        {!calc.finalizando ? (
          <section
            className="calculadora-etapa calculadora-etapa-montagem"
            aria-labelledby="mcr-etapa-montagem"
          >
            <h3 id="mcr-etapa-montagem" className="sr-only">
              {t('calculator.stepBuild')}
            </h3>
            <div className="layout-montagem-calculadora sem-esperas">
              <div
                className={`construtor-mao construtor-mao-montagem${entradaNotacao ? ' com-notacao' : ''}`}
              >
                <MaoChinesaAtual
                  mao={mao}
                  contexto="montagem"
                  aoTocarPedra={calc.selecionandoBatida ? calc.escolherBatida : calc.removerPedra}
                  selecionandoBatida={calc.selecionandoBatida}
                  aoRemoverChamada={calc.removerChamada}
                  aoRemoverFlor={calc.removerFlor}
                  aoLimpar={calc.limpar}
                  pendentes={pendentes}
                />
                {!entradaNotacao && (
                  <div className="acoes-construtor-mao mcr-acoes-construtor">
                    {botoesAcao(false)}
                  </div>
                )}
                <div className="painel-teclado-calculadora">
                  {!entradaNotacao && (
                    <div
                      className="menu-acoes-teclado-mobile"
                      aria-label={t('calculator.actionsMenu')}
                    >
                      <div className="opcoes-acoes-mao-mobile opcoes-acoes-mao-mobile--mcr">
                        {botoesAcao(true)}
                      </div>
                    </div>
                  )}
                  {entradaNotacao && !calc.selecionandoBatida && (
                    <CampoNotacaoMao
                      valor={textoNotacao}
                      akadora={false}
                      aoMudar={mudarNotacao}
                      aoVoltar={() => setEntradaNotacao(false)}
                      aoLimpar={() => {
                        setTextoNotacao('')
                        setErroNotacao(null)
                        calc.limpar()
                      }}
                      slotsMao={pedrasContadas(mao)}
                      erro={erroNotacao ? t(erroNotacao.chave, erroNotacao.parametros) : null}
                      chamadaArmada={calc.acao ? TIPO_MELD[calc.acao] : null}
                      aoArmarChamada={(tipo) =>
                        tipo
                          ? calc.alternarAcao(TIPO_DO_MELD[tipo])
                          : calc.acao && calc.alternarAcao(calc.acao)
                      }
                      esperas={[]}
                      rotuloEspera={() => ''}
                      aoEscolherEspera={() => undefined}
                    />
                  )}
                  {(!entradaNotacao || completa || calc.selecionandoBatida) && (
                    <TecladoChines
                      mostrarGrade={!entradaNotacao || calc.selecionandoBatida}
                      acao={calc.acao}
                      podeTocarPedra={calc.podeTocarPedra}
                      chiPendente={calc.chiPendente}
                      maoPronta={completa && !calc.acao}
                      aoTocarPedra={calc.tocarPedra}
                      aoEscolherChi={calc.escolherChi}
                      aoFinalizar={calc.finalizar}
                      selecionandoBatida={calc.selecionandoBatida}
                      aoAlternarSelecaoBatida={calc.alternarSelecaoBatida}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section
            className="calculadora-etapa calculadora-etapa-finalizacao"
            aria-labelledby="mcr-etapa-finalizacao"
          >
            <h3 id="mcr-etapa-finalizacao" className="sr-only">
              {`${t('calculator.completeHand')} ${pedrasContadas(mao)}/14`}
            </h3>
            <div className="pagina-finalizacao-mao">
              <div className="layout-finalizacao-calculadora">
                <div className="coluna-finalizacao-mao">
                  <div className="construtor-mao construtor-mao-finalizacao">
                    <MaoChinesaAtual
                      mao={mao}
                      contexto="finalizacao"
                      acoesCabecalho={
                        <div
                          className="acoes-finalizacao-calculadora"
                          aria-label={t('calculator.actionsMenu')}
                        >
                          <button
                            className="acao-finalizacao destaque"
                            type="button"
                            title={t('actions.editHand')}
                            aria-label={t('actions.editHand')}
                            onClick={calc.voltarParaMontagem}
                          >
                            <i className="fas fa-pen" aria-hidden="true" />
                          </button>
                        </div>
                      }
                      aoTocarPedra={calc.escolherBatida}
                      aoRemoverChamada={() => undefined}
                      aoRemoverFlor={calc.removerFlor}
                      aoLimpar={calc.limpar}
                    />
                  </div>
                </div>
                <div className="coluna-finalizacao-opcoes">
                  <ControlesCondicoes
                    condicoes={calc.condicoes}
                    aoMudar={calc.alterarCondicao}
                    flores={mao.flores}
                    aoAlternarFlor={(flor) =>
                      mao.flores.includes(flor) ? calc.removerFlor(flor) : calc.adicionarFlor(flor)
                    }
                    aoMudarFlores={calc.mudarFlores}
                  />
                  <div className="acao-calcular-mao acao-calcular-mao-ativa rodape-finalizacao-mao">
                    <button
                      className="btn-calcular-mao botao-calcular-finalizacao"
                      type="button"
                      disabled={calc.erro !== null}
                      onClick={calc.calcular}
                    >
                      {t('actions.calculate')}
                    </button>
                    {calc.erro && (
                      <span className="status-finalizacao-mao">{t(`mcr.erros.${calc.erro}`)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {calc.resultado && (
        <ModalResultadoMcr
          mao={mao}
          condicoes={calc.condicoes}
          resultado={calc.resultado}
          aoFechar={calc.fecharResultado}
          aoNovaMao={calc.limpar}
          aoUsarResultado={
            aoUsarFan && calc.resultado.fan.valido
              ? () => aoUsarFan(calc.resultado!.fan.fanTotal)
              : undefined
          }
        />
      )}
    </div>
  )
}
