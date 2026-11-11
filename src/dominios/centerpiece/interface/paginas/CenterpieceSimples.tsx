import { useCallback, useState } from 'react'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import BotaoTelaCheia from '@/compartilhado/interface/componentes/BotaoTelaCheia'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import {
  ajustarHonba,
  mudarJogadores,
  proximoDealer,
  repetirDealer,
  SIMPLES_INICIAL,
  type EstadoSimples,
} from '../../logica/centerpieceSimples'
import { numerosDaParede } from '../../logica/dados'
import {
  CADEIRAS,
  CADEIRAS_SANMA,
  CHAVE_VENTO,
  KANJI_VENTO,
  ventoDaCadeira,
  type Cadeira,
} from '../../logica/partida'
import {
  carregarSimples,
  dicaSimplesFoiVista,
  marcarDicaSimples,
  salvarSimples,
} from '../../persistencia/repositorioPartidas'
import { OPCOES_TIMER_VEZ } from '../../logica/configMesa'
import { vezInicial, type EstadoVez } from '../../logica/vez'
import AnelTimer from '../componentes/AnelTimer'
import BotoesOpcao from '../componentes/BotoesOpcao'
import CenaMesa from '../componentes/CenaMesa'
import JogarDados from '../componentes/JogarDados'
import { useRelogioVez } from '../hooks/useTimerVez'
import { useGiroDaMesa } from '../hooks/useGiroDaMesa'
import MesaQuadrada from '../componentes/MesaQuadrada'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import RecursosDaMesa from '../componentes/RecursosDaMesa'

/**
 * Só o centro da mesa, para deixar no meio da mesa e ir girando o celular: tocar
 * nela abre as ações. Abre direto, sem jogadores, e lembra o estado se o app fechar.
 * É a tela do botão Centerpiece da barra, então não tem seta de voltar.
 */
export default function CenterpieceSimples({
  aoAbrirSorteador,
  aoAbrirCalculo,
}: {
  aoAbrirSorteador: () => void
  aoAbrirCalculo: (calculo: 'mao' | 'hanFu' | 'mpsz') => void
}) {
  const { t } = useI18n()
  const [estado, setEstado] = useState<EstadoSimples>(() => carregarSimples(armazenamentoLocal))
  const [confirmando, setConfirmando] = useState(false)
  const [acoesAbertas, setAcoesAbertas] = useState(false)
  const [dicaVisivel, setDicaVisivel] = useState(() => !dicaSimplesFoiVista(armazenamentoLocal))
  // Lado que caiu nos dados; a mão seguinte começa sem destaque.
  const [ladoSorteado, setLadoSorteado] = useState<Cadeira | null>(null)

  const giro = useGiroDaMesa()
  const jogadores = estado.jogadores ?? 4
  const sanma = jogadores === 3
  const rodada = `${KANJI_VENTO[estado.rodadaVento]}${estado.rodadaNumero} 本${estado.honba}`
  // Timer desligado: o domo mostra só a rodada, em destaque.
  const rodadaNoDomo = (
    <>
      <span className="mesa-domo-rodada" aria-live="polite">
        {KANJI_VENTO[estado.rodadaVento]}
        {estado.rodadaNumero}
      </span>
      <span className="mesa-domo-info">本{estado.honba}</span>
    </>
  )

  // A vez não é salva: ao voltar para a mesa, o timer espera o primeiro toque.
  const [vez, setVez] = useState<EstadoVez>(() => vezInicial(estado.cadeiraDealer, estado.timerVez))
  const atualizarVez = useCallback((transformar: (atual: EstadoVez) => EstadoVez) => setVez(transformar), [])
  const timer = useRelogioVez(vez, estado.timerVez, atualizarVez, confirmando)
  // As ações pausam por conta própria: o Pausar de dentro delas não pode ser desfeito ao fechar.
  const [retomarAoFechar, setRetomarAoFechar] = useState(false)

  /** `novaMao`: renchan, quando só o honba muda mas a mão recomeça. */
  const mudar = (proximo: EstadoSimples, novaMao = false) => {
    if (proximo.cadeiraDealer !== estado.cadeiraDealer || proximo.rodadaNumero !== estado.rodadaNumero) {
      setLadoSorteado(null)
    }
    // Mão nova ou outro tempo: a vez volta para o dealer, esperando o toque. Corrigir
    // o honba com − e + não mexe na vez.
    if (
      novaMao ||
      proximo.cadeiraDealer !== estado.cadeiraDealer ||
      proximo.rodadaNumero !== estado.rodadaNumero ||
      proximo.rodadaVento !== estado.rodadaVento ||
      proximo.timerVez !== estado.timerVez
    ) {
      setVez(vezInicial(proximo.cadeiraDealer, proximo.timerVez))
      setRetomarAoFechar(false)
    }
    setEstado(proximo)
    salvarSimples(armazenamentoLocal, proximo)
  }

  const fecharAcoes = (retomar = retomarAoFechar) => {
    setAcoesAbertas(false)
    setRetomarAoFechar(false)
    if (retomar) timer.alternarPausa()
  }

  const abrirAcoes = () => {
    setAcoesAbertas(true)
    if (timer.contando) {
      timer.alternarPausa()
      setRetomarAoFechar(true)
    }
    if (dicaVisivel) {
      setDicaVisivel(false)
      marcarDicaSimples(armazenamentoLocal)
    }
  }

  return (
    <section className="mesa-tela mesa-tela--simples">
      <TituloTela titulo={t('match.simple.title')} acoes={
          <>
            <BotaoTelaCheia />
            <BotaoConfiguracoes />
          </>
        }
      />
      <RecursosDaMesa />

      <div className="mesa-simples-ajuda">
        <AjudaCampo rotulo={t('match.simple.title')}>
          <div className="cfg-ajuda-texto ajuda-simples">
            <p>{t('match.simple.guide.intro')}</p>
            <h4>{t('match.simple.guide.timerTitle')}</h4>
            <p>{t('match.simple.guide.timer')}</p>
            <CenaMesa nome="timer" />
            <h4>{t('match.simple.guide.actionsTitle')}</h4>
            <p>{t('match.simple.guide.actions')}</p>
            <h4>{t('match.simple.guide.dealerTitle')}</h4>
            <p>{t('match.simple.guide.dealer')}</p>
            <CenaMesa nome="acoes" />
            <h4>{t('match.simple.guide.honbaTitle')}</h4>
            <p>{t('match.simple.guide.honba')}</p>
            <CenaMesa nome="honba" />
            <h4>{t('match.simple.guide.screenTitle')}</h4>
            <p>{t('match.simple.guide.screen')}</p>
          </div>
        </AjudaCampo>
      </div>

      <div className="mesa-centro-tela">
        <MesaQuadrada
          cadeiraDealer={estado.cadeiraDealer}
          cadeiras={sanma ? CADEIRAS_SANMA : CADEIRAS}
          ladoVazio={
            sanma ? (
              <div className="mesa-painel-sanma" aria-hidden="true">
                <strong>
                  {KANJI_VENTO[estado.rodadaVento]}
                  {estado.rodadaNumero}
                </strong>
                <span>本{estado.honba}</span>
                <span>{t('sanma.sanma')}</span>
              </div>
            ) : undefined
          }
          giro={giro}
          aoTocarMesa={abrirAcoes}
          // O timer fica no centro, sem dono: Pon, Chi e Kan pulam jogadores, então ele
          // não tenta adivinhar de quem é a vez. Quem vai jogar toca na placa à sua frente
          // e o tempo recomeça cheio; o centro e o resto da mesa abrem as ações.
          domo={
            timer.ligado ? (
              <AnelTimer
                className="mesa-timer--domo"
                segundos={timer.segundos}
                fracao={timer.fracao}
                esgotado={timer.esgotado}
              >
                <span className="mesa-domo-segundos" aria-hidden="true">
                  {timer.segundos}
                </span>
                <span className="mesa-domo-info" aria-live="polite">
                  {rodada}
                </span>
              </AnelTimer>
            ) : (
              rodadaNoDomo
            )
          }
          lado={(cadeira) => {
            const vento = ventoDaCadeira(cadeira, estado.cadeiraDealer, jogadores)
            const numeros = numerosDaParede((cadeira - estado.cadeiraDealer + 4) % 4).join(' · ')
            const classe = `mesa-placa mesa-placa--simples${vento === 'leste' ? ' mesa-placa--dealer' : ''}${
              ladoSorteado === cadeira ? ' mesa-placa--sorteada' : ''
            }`
            const descricao = `${t(CHAVE_VENTO[vento])}: ${numeros}`
            const ventoNaPlaca = (
              <span className="mesa-placa-simples-vento" aria-hidden="true">
                <strong className={`mesa-led-vento--${vento}`}>{KANJI_VENTO[vento]}</strong>
                <small>{numeros}</small>
              </span>
            )
            return {
              placa: timer.ligado ? (
                <button
                  type="button"
                  className={`${classe} mesa-placa--botao`}
                  aria-label={`${descricao}. ${t(vez.comecou ? 'match.simple.timerPass' : 'match.simple.timerStart')}`}
                  onClick={(evento) => {
                    evento.stopPropagation()
                    timer.reiniciar()
                  }}
                >
                  {ventoNaPlaca}
                </button>
              ) : (
                <div className={classe} role="img" aria-label={descricao}>
                  {ventoNaPlaca}
                </div>
              ),
            }
          }}
        />
        {dicaVisivel && <p className="mesa-simples-dica">{t('match.simple.hint')}</p>}
      </div>

      {acoesAbertas && (
        <Modal
          titulo={t('match.simple.actions')}
          aoFechar={() => fecharAcoes()}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <div className="mesa-simples-acoes">
            {timer.ligado && vez.comecou && (
              <button
                type="button"
                className="mesa-btn-secundario"
                onClick={() => fecharAcoes(!retomarAoFechar)}
              >
                <i className={`fas ${retomarAoFechar ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />{' '}
                {t(retomarAoFechar ? 'match.timer.pause' : 'match.timer.resume')}
              </button>
            )}
            <button
              type="button"
              className="mesa-btn-principal"
              onClick={() => {
                mudar(proximoDealer(estado))
                fecharAcoes(false)
              }}
            >
              <i className="fas fa-forward" aria-hidden="true" /> {t('match.simple.nextRound')}
            </button>
            {/* Um controle só: o + é o renchan (a mão recomeça) e o − corrige um toque a mais. */}
            <div className="mesa-honba mesa-honba--acoes" role="group" aria-label={t('calculator.honba')}>
              <span className="mesa-honba-rotulo">
                <i className="fas fa-repeat" aria-hidden="true" /> {t('match.simple.honba')}
              </span>
              <button
                type="button"
                className="ptd-btn-icone"
                aria-label={t('match.simple.honbaMinus')}
                disabled={estado.honba === 0}
                onClick={() => mudar(ajustarHonba(estado, -1))}
              >
                <i className="fas fa-minus" aria-hidden="true" />
              </button>
              <span aria-live="polite">本{estado.honba}</span>
              <button
                type="button"
                className="ptd-btn-icone"
                aria-label={t('match.simple.honbaPlus')}
                onClick={() => mudar(repetirDealer(estado), true)}
              >
                <i className="fas fa-plus" aria-hidden="true" />
              </button>
            </div>
            <button type="button" className="mesa-btn-secundario" onClick={() => setConfirmando(true)}>
              <i className="fas fa-rotate-left" aria-hidden="true" /> {t('match.simple.restart')}
            </button>
            <BotoesOpcao
              rotulo={t('tableConfig.turnTimer')}
              valor={estado.timerVez}
              aoEscolher={(timerVez) => mudar({ ...estado, timerVez })}
              opcoes={OPCOES_TIMER_VEZ.map((segundos) => ({
                valor: segundos,
                rotulo: t(`tableConfig.timer${segundos}`),
              }))}
            />
            {/* 4 ou 3 jogadores: trocar recomeça a mesa do 東1. */}
            <BotoesOpcao<3 | 4>
              rotulo={t('sanma.seletorAria')}
              valor={jogadores}
              aoEscolher={(quantos) => mudar(mudarJogadores(estado, quantos))}
              opcoes={[
                { valor: 4, rotulo: t('sanma.variante4') },
                { valor: 3, rotulo: t('sanma.variante3') },
              ]}
            />
          </div>

          {/* Sortear: os dados (de onde abre o muro) e o Sorteador de Ventos (os assentos). */}
          <section className="mesa-simples-acoes mesa-simples-bloco" aria-labelledby="mesa-simples-sortear">
            <h3 id="mesa-simples-sortear" className="mesa-simples-bloco-titulo">
              {t('match.simple.drawSection')}
            </h3>
            <JogarDados
              cadeiraDealer={estado.cadeiraDealer}
              className="mesa-btn-secundario"
              aoSortear={setLadoSorteado}
              jogadores={jogadores}
            />
            <button type="button" className="mesa-btn-secundario" onClick={aoAbrirSorteador}>
              <i className="fas fa-shuffle" aria-hidden="true" /> {t('match.simple.windDraw')}
            </button>
          </section>

          {/* Segundo bloco da mesma janela: atalhos para calcular a mão. */}
          <section className="mesa-simples-acoes mesa-simples-bloco" aria-labelledby="mesa-simples-calcular">
            <h3 id="mesa-simples-calcular" className="mesa-simples-bloco-titulo">
              {t('match.simple.calculate')}
            </h3>
            <button type="button" className="mesa-btn-secundario" onClick={() => aoAbrirCalculo('mao')}>
              <i className="fas fa-calculator" aria-hidden="true" /> {t('menu.handCalculator')}
            </button>
            <button type="button" className="mesa-btn-secundario" onClick={() => aoAbrirCalculo('hanFu')}>
              <i className="fas fa-table-cells" aria-hidden="true" /> {t('menu.quickCalculator')}
            </button>
            <button type="button" className="mesa-btn-secundario" onClick={() => aoAbrirCalculo('mpsz')}>
              <i className="fas fa-keyboard" aria-hidden="true" /> {t('match.simple.calcMpsz')}
            </button>
          </section>
        </Modal>
      )}


      {confirmando && (
        <ModalConfirmacao
          titulo={t('match.simple.restart')}
          texto={t('match.simple.restartHelp')}
          rotuloConfirmar={t('match.simple.restart')}
          aoFechar={() => setConfirmando(false)}
          aoConfirmar={() => {
            mudar({ ...SIMPLES_INICIAL, timerVez: estado.timerVez })
            setConfirmando(false)
            fecharAcoes(false)
          }}
        />
      )}
    </section>
  )
}
