import { idiomaGlobal } from '@/compartilhado/i18n/tradutorGlobal'

let regiao: HTMLElement | null = null
let pendentes: string[] = []
let agendado: number | undefined

/** Região escondida que o leitor de tela lê sozinho (TalkBack, VoiceOver). */
function regiaoAnuncios() {
  if (regiao?.isConnected) return regiao
  regiao = document.createElement('div')
  regiao.className = 'sr-only'
  regiao.setAttribute('aria-live', 'assertive')
  regiao.setAttribute('aria-atomic', 'true')
  document.body.appendChild(regiao)
  return regiao
}

/**
 * Frase para o leitor de tela. Anúncios do mesmo instante (ex.: o nome da tela e o
 * top 3 do ranking) saem juntos, na ordem em que chegaram.
 */
export function anunciar(texto: string) {
  if (!texto) return
  pendentes.push(texto)
  window.clearTimeout(agendado)
  agendado = window.setTimeout(() => {
    const alvo = regiaoAnuncios()
    const frase = pendentes.join('. ')
    pendentes = []
    // Esvazia antes: a mesma frase de novo também precisa ser lida.
    alvo.textContent = ''
    window.setTimeout(() => {
      alvo.textContent = frase
    }, 50)
  }, 100)
}

/** Vozes neurais (Edge, Chrome, iPhone): bem menos robóticas que as do sistema. */
const VOZES_NATURAIS = /natural|neural|online|premium|enhanced|aprimorad|google/i
const NOMES_FEMININOS = /female|feminina|mulher|francisca|thalita|luciana|maria|helena|joana|camila|vitoria|monica|paulina|elvira|kyoko|nanami|sunhi|heami|xiaoxiao|tingting|ona|samantha|aria|jenny|ava/i

function vozMaisNatural(idioma: string) {
  const vozes = window.speechSynthesis.getVoices()
  const base = idioma.split('-')[0]
  const doIdioma = vozes.filter((voz) => voz.lang.replace('_', '-').startsWith(base))
  const exato = (voz: SpeechSynthesisVoice) => voz.lang.replace('_', '-') === idioma
  const pontos = (voz: SpeechSynthesisVoice) =>
    (VOZES_NATURAIS.test(voz.name) ? 4 : 0) + (NOMES_FEMININOS.test(voz.name) ? 2 : 0) + (exato(voz) ? 1 : 0)
  return [...doIdioma].sort((a, b) => pontos(b) - pontos(a))[0]
}

// As vozes chegam depois da abertura no Chrome: pedir já deixa a lista pronta.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.getVoices()

/**
 * Fala em voz alta, mesmo sem leitor de tela: a voz mais natural do idioma do app
 * (de preferência feminina), no tom normal e com calma. Sem `speechSynthesis`, não fala.
 */
export function falar(texto: string) {
  if (!texto || !('speechSynthesis' in window)) return
  const idioma = idiomaGlobal()
  const fala = new SpeechSynthesisUtterance(texto)
  fala.lang = idioma
  fala.pitch = 1.05
  fala.rate = 0.95
  const voz = vozMaisNatural(idioma)
  if (voz) fala.voice = voz
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(fala)
}

export function pararFala() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
