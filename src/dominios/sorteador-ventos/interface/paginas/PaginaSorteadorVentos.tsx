import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { chaveNomeVento } from '../../../calculadora-mao/interface/compartilhado/componentes/PedraVento'
import GatoHelice from '../componentes/GatoHelice'
import ResultadoVentos from '../componentes/ResultadoVentos'
import TrilhasBalao from '../componentes/TrilhasBalao'
import { useSorteadorVentos } from '../hooks/useSorteadorVentos'
import '../estilos/sorteador-ventos.css'

const RESPIRO_ANTES_DE_REINICIAR_MS = 1200

export default function PaginaSorteadorVentos() {
  const { t } = useI18n()
  const { fase, reveladas, ventosRevelados, rotorRef, revelar, proximo, reiniciar } =
    useSorteadorVentos()

  const revelado = fase === 'revelado' || fase === 'concluido'
  const concluido = fase === 'concluido'
  const ultimoRevelado = ventosRevelados[ventosRevelados.length - 1] ?? null
  // O toque sorteia no giro, com o vento à mostra passa para o próximo e, no
  // fim, reinicia. Depois do 3º vento o 4º vem sozinho, sem toque.
  const podeTocar = fase === 'ciclando' || concluido || (fase === 'revelado' && reveladas < 3)

  // Tudo o que o gato "fala" vai no balão: a frase principal e uma dica menor.
  let fala = t('windDraw.bubbleTapToDraw', { player: reveladas + 1 })
  let dica = ''
  if (fase === 'desacelerando') fala = t('windDraw.drawing')
  else if (concluido) {
    fala = t('windDraw.ronRon')
    dica = t('windDraw.tapToPlayAgain')
  } else if (fase === 'revelado' && ultimoRevelado) {
    fala = t('windDraw.bubbleResult', {
      player: reveladas,
      wind: t(chaveNomeVento(ultimoRevelado)),
    })
    if (podeTocar) dica = t('windDraw.tapToContinue')
  }

  let rotuloAcessivel = t('windDraw.tapAreaLabel', { player: reveladas + 1 })
  if (fase === 'revelado') rotuloAcessivel = t('windDraw.nextPlayer')
  else if (concluido) rotuloAcessivel = t('windDraw.restartButtonLabel')

  // Logo que o 4º vento aparece, um toque de quem ainda está olhando não pode
  // apagar o resultado: o reinício só vale depois de um respiro.
  const paginaRef = useRef<HTMLElement>(null)
  const concluidoEmRef = useRef(0)
  useEffect(() => {
    if (concluido) concluidoEmRef.current = Date.now()
  }, [concluido])

  const tocar = () => {
    if (fase === 'ciclando') revelar()
    else if (concluido) {
      if (Date.now() - concluidoEmRef.current >= RESPIRO_ANTES_DE_REINICIAR_MS) reiniciar()
    } else proximo()
  }

  const teclarPalco = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (evento.key !== 'Enter' && evento.key !== ' ') return
    evento.preventDefault()
    tocar()
  }

  return (
    <section
      ref={paginaRef}
      className={`sorteador-ventos-page${podeTocar ? ' sorteador-ventos-page--tocavel' : ''}`}
      // Toda a área responde ao toque.
      onClick={tocar}
    >
      <h2 className="sr-only">{t('windDraw.title')}</h2>

      <ResultadoVentos ventosRevelados={ventosRevelados} completo={concluido} />

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
