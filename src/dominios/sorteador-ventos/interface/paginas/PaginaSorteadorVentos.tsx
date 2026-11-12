import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { chaveNomeVento } from '../../../calculadora-mao/interface/compartilhado/componentes/PedraVento'
import GatoHelice from '../componentes/GatoHelice'
import ResultadoVentos from '../componentes/ResultadoVentos'
import TrilhasBalao from '../componentes/TrilhasBalao'
import { useSorteadorVentos } from '../hooks/useSorteadorVentos'
import '../estilos/sorteador-ventos.css'
import SeletorVariante from '@/compartilhado/interface/SeletorVariante'
import type { Variante } from '@/compartilhado/mahjong/variante'

const RESPIRO_ANTES_DE_REINICIAR_MS = 1200

export default function PaginaSorteadorVentos({
  aoContinuarTutorial,
  jogadores,
}: {
  /** Aberto pela mesa: sorteia só os ventos dos jogadores dela, sem trocar aqui. */
  jogadores?: 3 | 4
  /** Aberto pelo guia: no fim, o toque segue o tutorial em vez de sortear de novo. */
  aoContinuarTutorial?: () => void
} = {}) {
  const { t } = useI18n()
  // 4 jogadores por padrão. Sanma: só Leste, Sul e Oeste.
  const [variante, setVariante] = useState<Variante>(jogadores === 3 ? 'sanma' : 'yonma')
  const { fase, reveladas, ventosRevelados, rotorRef, revelar, proximo, reiniciar, total } =
    useSorteadorVentos(variante === 'sanma' ? 3 : 4)

  const revelado = fase === 'revelado' || fase === 'concluido'
  const concluido = fase === 'concluido'
  const ultimoRevelado = ventosRevelados[ventosRevelados.length - 1] ?? null
  // O toque sorteia no giro, com o vento à mostra passa para o próximo e, no
  // fim, reinicia. Depois do 3º vento o 4º vem sozinho, sem toque.
  const podeTocar = fase === 'ciclando' || concluido || (fase === 'revelado' && reveladas < total - 1)

  // Tudo o que o gato "fala" vai no balão: a frase principal e uma dica menor.
  let fala = t('windDraw.bubbleTapToDraw', { player: reveladas + 1 })
  let dica = ''
  if (fase === 'desacelerando') fala = t('windDraw.drawing')
  else if (concluido) {
    fala = t('windDraw.ronRon')
    dica = t(aoContinuarTutorial ? 'windDraw.continueTutorial' : 'windDraw.tapToPlayAgain')
  } else if (fase === 'revelado' && ultimoRevelado) {
    fala = t('windDraw.bubbleResult', {
      player: reveladas,
      wind: t(chaveNomeVento(ultimoRevelado)),
    })
    if (podeTocar) dica = t('windDraw.tapToContinue')
  }

  let rotuloAcessivel = t('windDraw.tapAreaLabel', { player: reveladas + 1 })
  if (fase === 'revelado') rotuloAcessivel = t('windDraw.nextPlayer')
  else if (concluido) {
    rotuloAcessivel = aoContinuarTutorial
      ? t('windDraw.continueTutorial')
      : t('windDraw.restartButtonLabel')
  }

  // Logo que o 4º vento aparece, um toque de quem ainda está olhando não pode
  // apagar o resultado: o reinício só vale depois de um respiro.
  const paginaRef = useRef<HTMLElement>(null)
  const [ajudaAberta, setAjudaAberta] = useState(false)
  const concluidoEmRef = useRef(0)
  useEffect(() => {
    if (concluido) concluidoEmRef.current = Date.now()
  }, [concluido])

  const tocar = () => {
    if (fase === 'ciclando') revelar()
    else if (concluido) {
      if (Date.now() - concluidoEmRef.current < RESPIRO_ANTES_DE_REINICIAR_MS) return
      if (aoContinuarTutorial) aoContinuarTutorial()
      else reiniciar()
    } else proximo()
  }

  const teclarPalco = (evento: KeyboardEvent<HTMLDivElement>) => {
    // O pirulito é um botão dentro do palco: as teclas dele são dele.
    if (evento.target !== evento.currentTarget) return
    if (evento.key !== 'Enter' && evento.key !== ' ') return
    evento.preventDefault()
    tocar()
  }

  return (
    <section
      ref={paginaRef}
      className={`sorteador-ventos-page${podeTocar ? ' sorteador-ventos-page--tocavel' : ''}`}
      // Toda a área responde ao toque. A janela do "?" é portal: os toques
      // nela sobem pela árvore do React, mas não são da página.
      onClick={(evento) => {
        if (evento.currentTarget.contains(evento.target as Node)) tocar()
      }}
    >
      {/* Engrenagem no cabeçalho do app (portal: o toque nela não sorteia). */}
      <TituloTela titulo={t('menu.windDraw')} acoes={<BotaoConfiguracoes />} />

      {/* O toque aqui escolhe 4 ou 3 jogadores, sem sortear. */}
      {!jogadores && (
        <div className="sorteio-variante" onClick={(evento) => evento.stopPropagation()}>
          <SeletorVariante valor={variante} aoMudar={setVariante} />
        </div>
      )}

      {/* "?" no canto: explica por que o sorteio é justo. */}
      <button
        type="button"
        className="sorteio-ajuda"
        aria-label={t('sectionHelp.buttonLabel', { section: t('windDraw.howItWorksTitle') })}
        aria-haspopup="dialog"
        onClick={(evento) => {
          // Não deixa o toque chegar na página (que sortearia ou passaria a vez).
          evento.stopPropagation()
          setAjudaAberta(true)
        }}
      >
        <span className="sorteio-ajuda__circulo" aria-hidden="true">
          ?
        </span>
      </button>

      <ResultadoVentos ventosRevelados={ventosRevelados} completo={concluido} total={total} />

      <div
        className="sorteio-palco"
        role="button"
        tabIndex={podeTocar ? 0 : -1}
        aria-disabled={!podeTocar}
        aria-label={rotuloAcessivel}
        onKeyDown={teclarPalco}
      >
        <GatoHelice
          rotorRef={rotorRef}
          // No fim a hélice comemora com todas as pedras acesas.
          ventosApagados={concluido ? [] : ventosRevelados}
          escolhido={fase === 'revelado' ? ultimoRevelado : null}
          linguaDeFora={concluido}
          foraDoSorteio={variante === 'sanma' ? ['4'] : []}
          textoPirulito={t('windDraw.lollipopText')}
          rotuloPirulito={t('windDraw.restartButtonLabel')}
          aoTocarPirulito={reiniciar}
        />
        {/* A chave refaz o "pop" do balão a cada fala nova. */}
        <div
          key={`${fase}-${reveladas}`}
          className={`sorteio-balao${revelado ? ' sorteio-balao--destaque' : ''}`}
          aria-hidden="true"
        >
          <p className="sorteio-balao__fala">{fala}</p>
          {dica && <p className="sorteio-balao__dica">{dica}</p>}
        </div>
      </div>

      <TrilhasBalao raizRef={paginaRef} quantidade={ventosRevelados.length} completo={concluido} />

      {ajudaAberta && (
        <Modal
          titulo={t('windDraw.howItWorksTitle')}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          aoFechar={() => setAjudaAberta(false)}
        >
          <p className="sorteio-ajuda__texto">{t('windDraw.howItWorksText')}</p>
        </Modal>
      )}

      <p className="sr-only" aria-live="polite">
        {revelado && ultimoRevelado
          ? t('windDraw.playerWind', {
              player: reveladas,
              wind: t(chaveNomeVento(ultimoRevelado)),
            })
          : ''}
      </p>
    </section>
  )
}
