import { useCallback, useEffect, useRef, useState } from 'react'
import type { VentoMao } from '../../../calculadora-mao/logica/mao'
import { VENTOS_MESA, embaralharVentos } from '../../logica/sortearVento'
import type { EstadoSorteadorVentos } from '../../logica/tipos'

/** Giro da hélice enquanto espera o toque, em graus por segundo. */
const VELOCIDADE_GIRO = 720
/** Retomada do giro depois de uma revelação (chega no giro cheio em 0,4 s). */
const ACELERACAO_GIRO = 1800
/** O freio dá ao menos 1,5 volta antes de parar no vento sorteado. */
const GIRO_MINIMO_FREIO = 540
const DELAY_ULTIMO_VENTO_MS = 900

interface Freio {
  inicio: number
  de: number
  delta: number
  duracao: number
}

/** Sanma: só Leste, Sul e Oeste entram no sorteio. */
function novoSorteio(jogadores: 3 | 4 = 4): EstadoSorteadorVentos {
  return { ordem: embaralharVentos(VENTOS_MESA.slice(0, jogadores)), reveladas: 0, fase: 'ciclando' }
}

function modulo(valor: number, divisor: number) {
  return ((valor % divisor) + divisor) % divisor
}

/**
 * Cada vento fica numa pá na ordem da mesa, como nos jogos: com o Leste embaixo,
 * Sul à direita, Oeste em cima e Norte à esquerda (anti-horário, a ordem dos
 * turnos). Pedido de jogador: antes Leste e Oeste estavam trocados.
 */
export function anguloPa(vento: VentoMao) {
  return modulo(180 - VENTOS_MESA.indexOf(vento) * 90, 360)
}

/** Giro da hélice que deixa a pá deste vento apontando para cima. */
function giroParaCima(vento: VentoMao) {
  return modulo(-anguloPa(vento), 360)
}

function movimentoReduzido(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function vibrar() {
  // Não existe no iOS: lá simplesmente não vibra.
  navigator.vibrate?.(40)
}

/**
 * Sorteio sequencial: a ordem dos 4 ventos é embaralhada uma única vez ao
 * iniciar/reiniciar e cada toque só revela o próximo vento dela. A hélice é
 * apenas visual: o freio é calculado para parar sempre em `ordem[reveladas]`.
 *
 * O ângulo vai direto para a variável CSS `--giro` do rotor a cada quadro, sem
 * passar pelo estado do React (nada de 60 renders por segundo).
 */
export function useSorteadorVentos(jogadores: 3 | 4 = 4) {
  const [estado, setEstado] = useState(() => novoSorteio(jogadores))
  // Lido pelos timers sem esperar o próximo render.
  const totalRef = useRef(jogadores)
  totalRef.current = jogadores
  const [reduzirMovimento] = useState(movimentoReduzido)

  // Fonte da verdade para os timers, sem esperar o próximo render.
  const estadoRef = useRef(estado)
  const timeoutRef = useRef<number | null>(null)
  const rotorRef = useRef<HTMLDivElement>(null)
  // Com movimento reduzido a hélice começa entre duas pás, sem "escolher" ninguém.
  const giroRef = useRef({ angulo: reduzirMovimento ? 45 : 0, velocidade: 0 })
  const freioRef = useRef<Freio | null>(null)

  const atualizar = useCallback((parcial: Partial<EstadoSorteadorVentos>) => {
    estadoRef.current = { ...estadoRef.current, ...parcial }
    setEstado(estadoRef.current)
  }, [])

  const aplicarGiro = useCallback(() => {
    rotorRef.current?.style.setProperty('--giro', `${giroRef.current.angulo}deg`)
  }, [])

  const limparTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => limparTimeout, [limparTimeout])

  const concluirRevelacao = useCallback(() => {
    const novasReveladas = estadoRef.current.reveladas + 1
    atualizar({
      reveladas: novasReveladas,
      fase: novasReveladas === totalRef.current ? 'concluido' : 'revelado',
    })
    vibrar()

    // Sobrou um vento: vai para o último jogador sem precisar tocar.
    if (novasReveladas === totalRef.current - 1) {
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null
        atualizar({ reveladas: totalRef.current, fase: 'concluido' })
        vibrar()
      }, DELAY_ULTIMO_VENTO_MS)
    }
  }, [atualizar])

  // Um quadro por vez: gira enquanto espera, freia até o alvo depois do toque.
  useEffect(() => {
    aplicarGiro()
    if (reduzirMovimento) return

    let anterior = performance.now()
    let quadro = 0

    const animar = (agora: number) => {
      const dt = Math.min((agora - anterior) / 1000, 0.05)
      anterior = agora
      const giro = giroRef.current
      const freio = freioRef.current

      if (freio) {
        // Ease-out cúbico: começa na velocidade do giro e para suave no alvo.
        const progresso = Math.min((agora - freio.inicio) / freio.duracao, 1)
        giro.angulo = freio.de + freio.delta * (1 - (1 - progresso) ** 3)
        if (progresso >= 1) {
          freioRef.current = null
          giro.velocidade = 0
          concluirRevelacao()
        }
      } else if (estadoRef.current.fase === 'ciclando' || estadoRef.current.fase === 'concluido') {
        // No fim a hélice volta a girar, de comemoração.
        giro.velocidade = Math.min(VELOCIDADE_GIRO, giro.velocidade + ACELERACAO_GIRO * dt)
        // Anti-horário (ângulo diminuindo), no sentido dos turnos na mesa.
        giro.angulo = modulo(giro.angulo - giro.velocidade * dt, 360)
      }

      aplicarGiro()
      quadro = requestAnimationFrame(animar)
    }

    quadro = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(quadro)
  }, [reduzirMovimento, aplicarGiro, concluirRevelacao])

  const revelar = useCallback(() => {
    const atual = estadoRef.current
    if (atual.fase !== 'ciclando' || atual.reveladas >= totalRef.current) return

    // Decidido no embaralhamento, nunca no toque.
    const alvo = atual.ordem[atual.reveladas]
    const giro = giroRef.current

    if (reduzirMovimento) {
      giro.angulo = giroParaCima(alvo)
      aplicarGiro()
      concluirRevelacao()
      return
    }

    // Freia girando para trás (anti-horário): ao menos o giro mínimo e mais o
    // que faltar para a pá do alvo chegar ao alto.
    const minimo = giro.angulo - GIRO_MINIMO_FREIO
    const recuo = GIRO_MINIMO_FREIO + modulo(minimo - giroParaCima(alvo), 360)
    freioRef.current = {
      inicio: performance.now(),
      de: giro.angulo,
      delta: -recuo,
      // Velocidade inicial do ease-out cúbico (3·recuo/duração) = giro cheio.
      duracao: ((3 * recuo) / VELOCIDADE_GIRO) * 1000,
    }
    atualizar({ fase: 'desacelerando' })
  }, [reduzirMovimento, aplicarGiro, atualizar, concluirRevelacao])

  const proximo = useCallback(() => {
    const atual = estadoRef.current
    if (atual.fase !== 'revelado' || atual.reveladas >= totalRef.current - 1) return
    if (reduzirMovimento) {
      giroRef.current.angulo += 45
      aplicarGiro()
    }
    atualizar({ fase: 'ciclando' })
  }, [reduzirMovimento, aplicarGiro, atualizar])

  const reiniciar = useCallback(() => {
    limparTimeout()
    freioRef.current = null
    if (reduzirMovimento) {
      giroRef.current.angulo = 45
      aplicarGiro()
    }
    atualizar(novoSorteio(totalRef.current))
  }, [reduzirMovimento, limparTimeout, aplicarGiro, atualizar])

  // Trocar entre 4 e 3 jogadores recomeça o sorteio.
  const primeiraVez = useRef(true)
  useEffect(() => {
    if (primeiraVez.current) {
      primeiraVez.current = false
      return
    }
    reiniciar()
  }, [jogadores, reiniciar])

  const { ordem, reveladas, fase } = estado

  return {
    total: jogadores,
    fase,
    reveladas,
    /** Só os ventos já revelados; o restante da ordem não sai do hook. */
    ventosRevelados: ordem.slice(0, reveladas),
    rotorRef,
    reduzirMovimento,
    revelar,
    proximo,
    reiniciar,
  }
}
