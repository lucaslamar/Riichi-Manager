import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { BotaoAcao } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/Botoes'
import { TecladoPedras } from '@/dominios/calculadora-mao/interface/montagem-mao/componentes/TecladoPedras'
import {
  configuracaoPadrao,
  type Acao,
  type CodigoPedra,
} from '@/dominios/calculadora-mao/logica/mao'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import { maoCompleta, pedrasContadas, type TipoChamada, type TipoFlor } from '../logica/montagem'
import '../estilos/calculadora-mao-chinesa.css'
import ControlesCondicoes from './ControlesCondicoes'
import MaoChinesaAtual from './MaoChinesaAtual'
import { codigoPedra, idDaPedra, nomePedra } from './pedras'
import ResultadoFan from './ResultadoFan'
import { useCalculadoraMaoChinesa } from './useCalculadoraMaoChinesa'

/** O MCR não usa aka dora: o teclado da calculadora japonesa fica sem o 5 vermelho. */
const CONFIGURACAO_TECLADO = { ...configuracaoPadrao, akadora: false }
const SEM_DORAS = new Set<string>()
const SEM_ESPERAS = new Map()

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
const FLORES: { tipo: TipoFlor; chave: string }[] = [
  { tipo: 'flor', chave: 'mcr.entrada.flor' },
  { tipo: 'estacao', chave: 'mcr.entrada.estacao' },
]

const paraAcao = (tipo: TipoChamada): Acao =>
  tipo === 'chi' ? { tipo: 'chii', pedras: [] } : ({ tipo: tipo === 'pon' ? 'pon' : tipo } as Acao)

/**
 * Calculadora de Mão Chinesa (MCR / Guobiao), com o mesmo layout da japonesa:
 * montar a mão no teclado e, com 14 pedras, finalizar com as condições e calcular.
 */
export default function CalculadoraMaoChinesa({ visivel }: { visivel: boolean }) {
  const { t } = useI18n()
  const calc = useCalculadoraMaoChinesa()
  const { mao } = calc
  const completa = maoCompleta(mao)

  // Escondida, a mão continua no estado (como na japonesa), mas nada vai para a tela.
  if (!visivel) return null

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
      {FLORES.map(({ tipo, chave }) => (
        <BotaoAcao
          key={tipo}
          tipo={tipo}
          rotulo={t(chave)}
          ativo={false}
          desabilitado={calc.proximaFlor(tipo) === null}
          aoClicar={() => calc.adicionarFlor(tipo)}
        />
      ))}
    </>
  )

  return (
    <div className="mcr-calculadora">
      <TituloTela titulo={t('menu.handCalculatorChinese')} acoes={<BotaoConfiguracoes />} />

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
              <div className="construtor-mao construtor-mao-montagem">
                <MaoChinesaAtual
                  mao={mao}
                  contexto="montagem"
                  aoTocarPedra={calc.removerPedra}
                  aoRemoverChamada={calc.removerChamada}
                  aoRemoverFlor={calc.removerFlor}
                  aoLimpar={calc.limpar}
                />
                <div className="acoes-construtor-mao mcr-acoes-construtor">{botoesAcao(false)}</div>
                <div className="painel-teclado-calculadora">
                  <div
                    className="menu-acoes-teclado-mobile"
                    aria-label={t('calculator.actionsMenu')}
                  >
                    <div className="opcoes-acoes-mao-mobile opcoes-acoes-mao-mobile--mcr">
                      {botoesAcao(true)}
                    </div>
                  </div>
                  <TecladoPedras
                    acaoPendente={calc.acao ? paraAcao(calc.acao) : null}
                    configuracao={CONFIGURACAO_TECLADO}
                    dorasReais={SEM_DORAS}
                    esperasPorPedra={SEM_ESPERAS}
                    filtrarTecladoPorEspera={false}
                    furitenBloqueiaRon={false}
                    maoCompleta={completa}
                    podeSelecionarPedra={(codigo: CodigoPedra) =>
                      calc.podeTocarPedra(idDaPedra(codigo))
                    }
                    rotuloEsperaTeclado={() => ''}
                    classeEsperaTeclado={() => ''}
                    contexto="montagem"
                    rotuloPedra={(codigo) =>
                      calc.acao
                        ? t('calculator.chooseMeldTile', {
                            tile: nomePedra(idDaPedra(codigo)),
                            meld: t(`melds.${paraAcao(calc.acao).tipo}`),
                          })
                        : t('calculator.addTileToHand', { tile: nomePedra(idDaPedra(codigo)) })
                    }
                    maoProntaParaFinalizar={completa && !calc.acao}
                    batidaDefinida
                    escolhaChiiPendente={
                      calc.chiPendente && {
                        chamada: codigoPedra(calc.chiPendente.chamada),
                        opcoes: calc.chiPendente.meios.map((meio) =>
                          [meio - 1, meio, meio + 1].map(codigoPedra),
                        ),
                      }
                    }
                    aoAdicionarPedra={(codigo) => calc.tocarPedra(idDaPedra(codigo))}
                    aoFinalizarMao={calc.finalizar}
                    aoEscolherChiiPendente={(_chamada, sequencia) =>
                      calc.escolherChi(idDaPedra(sequencia[1]))
                    }
                  />
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
                  <ControlesCondicoes condicoes={calc.condicoes} aoMudar={calc.alterarCondicao} />
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
        <Modal
          titulo={t('mcr.resultado.titulo')}
          aoFechar={calc.fecharResultado}
          rotuloFechar={t('actions.close')}
        >
          <ResultadoFan resultado={calc.resultado} />
        </Modal>
      )}
    </div>
  )
}
