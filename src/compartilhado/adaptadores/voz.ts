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

const NOMES_FEMININOS = /female|feminina|mulher|maria|luciana|francisca|helena|joana|camila|vitoria|monica|paulina|kyoko|haruka|ayumi|nanami|sayaka|yuna|heami|tingting|xiaoxiao|samantha|zira|aria|jenny|google/i

function vozFeminina(idioma: string) {
  const vozes = window.speechSynthesis.getVoices()
  const base = idioma.split('-')[0]
  const doIdioma = vozes.filter((voz) => voz.lang.replace('_', '-').startsWith(base))
  return doIdioma.find((voz) => NOMES_FEMININOS.test(voz.name)) ?? doIdioma[0]
}

/**
 * Fala em voz alta, mesmo sem leitor de tela: voz feminina do idioma do app, aguda
 * e um pouco rápida. Sem `speechSynthesis` (alguns navegadores), não fala.
 */
export function falar(texto: string) {
  if (!texto || !('speechSynthesis' in window)) return
  const idioma = idiomaGlobal()
  const fala = new SpeechSynthesisUtterance(texto)
  fala.lang = idioma
  fala.pitch = 1.8
  fala.rate = 1.1
  const voz = vozFeminina(idioma)
  if (voz) fala.voice = voz
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(fala)
}

export function pararFala() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
