import { idiomaGlobal } from '@/compartilhado/i18n/tradutorGlobal'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'

/*
 * Tudo o que o app fala passa por aqui:
 * - `anunciar()`: avisos curtos (troca de tela, mão apagada, timer). Com a
 *   Narração ligada na voz do app, são falados; senão, vão para o leitor de tela.
 * - `narrar()`: o que só sai com a Narração ligada (as pedras da mão).
 * - `falar()`: voz do app sempre, mesmo sem Narração (o resultado da mão).
 */

export type NomesPedrasNarracao = 'pt' | 'ja'
export type SaidaNarracao = 'voz' | 'leitor'

export interface ConfigNarracao {
  ativa: boolean
  velocidade: number
  idiomaPedras: NomesPedrasNarracao
  saida: SaidaNarracao
}

const CHAVE_NARRACAO = 'riichi-manager-narracao'
export const VELOCIDADE_MINIMA = 0.5
export const VELOCIDADE_MAXIMA = 2
const VELOCIDADE_PADRAO = 1.2
const PADRAO: ConfigNarracao = { ativa: false, velocidade: VELOCIDADE_PADRAO, idiomaPedras: 'pt', saida: 'voz' }

const limitarVelocidade = (valor: number) => Math.min(VELOCIDADE_MAXIMA, Math.max(VELOCIDADE_MINIMA, valor))

function lerConfig(): ConfigNarracao {
  try {
    const salvo = JSON.parse(armazenamentoLocal.ler(CHAVE_NARRACAO) ?? '{}')
    return {
      ativa: salvo.ativa === true,
      velocidade: limitarVelocidade(Number(salvo.velocidade) || VELOCIDADE_PADRAO),
      idiomaPedras: salvo.idiomaPedras === 'ja' ? 'ja' : 'pt',
      saida: salvo.saida === 'leitor' ? 'leitor' : 'voz',
    }
  } catch {
    return PADRAO
  }
}

let config: ConfigNarracao = typeof window === 'undefined' ? PADRAO : lerConfig()
const ouvintes = new Set<() => void>()

export const lerNarracao = () => config

export function assinarNarracao(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

export function alterarNarracao(mudanca: Partial<ConfigNarracao>) {
  config = { ...config, ...mudanca, velocidade: limitarVelocidade(mudanca.velocidade ?? config.velocidade) }
  if (!config.ativa || config.saida === 'leitor') pararFala()
  armazenamentoLocal.gravar(CHAVE_NARRACAO, JSON.stringify(config))
  ouvintes.forEach((ouvinte) => ouvinte())
}

export const vozDisponivel = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

const falaPelaVoz = () => config.ativa && config.saida === 'voz' && vozDisponivel()

// ─── Leitor de tela ──────────────────────────────────────────────────────────
let regiao: HTMLElement | null = null

/** Região escondida que o leitor de tela lê sozinho (TalkBack, VoiceOver, NVDA). */
function regiaoAnuncios() {
  if (regiao?.isConnected) return regiao
  regiao = document.createElement('div')
  regiao.className = 'sr-only'
  regiao.setAttribute('aria-live', 'assertive')
  regiao.setAttribute('aria-atomic', 'true')
  document.body.appendChild(regiao)
  return regiao
}

function escreverNoLeitor(frase: string) {
  const alvo = regiaoAnuncios()
  // Esvazia antes: a mesma frase de novo também precisa ser lida.
  alvo.textContent = ''
  window.setTimeout(() => {
    alvo.textContent = frase
  }, 50)
}

// ─── Anúncios ────────────────────────────────────────────────────────────────
let pendentes: string[] = []
let agendado: number | undefined
let ultimo = ''

/**
 * Aviso curto. Os do mesmo instante (ex.: o nome da tela e o top 3 do ranking)
 * saem juntos, na ordem em que chegaram.
 */
export function anunciar(texto: string) {
  if (!texto) return
  pendentes.push(texto.replace(/\.$/, ''))
  window.clearTimeout(agendado)
  agendado = window.setTimeout(() => {
    ultimo = `${pendentes.join('. ')}.`
    pendentes = []
    if (falaPelaVoz()) falar(ultimo)
    else escreverNoLeitor(ultimo)
  }, 100)
}

/** Só com a Narração ligada. */
export function narrar(texto: string) {
  if (config.ativa) anunciar(texto)
}

export function repetirUltimo() {
  if (config.ativa && ultimo) anunciar(ultimo)
}

/** Leituras sob demanda dos atalhos (Alt+M lê a mão): cada tela registra a sua. */
const leituras = new Map<string, () => string>()

export function registrarLeitura(chave: string, ler: () => string) {
  leituras.set(chave, ler)
  return () => {
    if (leituras.get(chave) === ler) leituras.delete(chave)
  }
}

export function lerSobDemanda(chave: string, semLeitura: string) {
  const ler = leituras.get(chave)
  narrar(ler ? ler() : semLeitura)
}

// ─── Voz do app ──────────────────────────────────────────────────────────────
/** Vozes neurais (Edge, Chrome, iPhone): bem menos robóticas que as do sistema. */
const VOZES_NATURAIS = /natural|neural|online|premium|enhanced|aprimorad|google/i
const NOMES_FEMININOS = /female|feminina|mulher|francisca|thalita|luciana|maria|helena|joana|camila|vitoria|monica|paulina|elvira|kyoko|nanami|sunhi|heami|xiaoxiao|tingting|ona|samantha|aria|jenny|ava/i

function vozMaisNatural(idioma: string) {
  const vozes = window.speechSynthesis.getVoices()
  const base = idioma.split('-')[0]
  const doIdioma = vozes.filter((voz) => voz.lang.replace('_', '-').startsWith(base))
  const exato = (voz: SpeechSynthesisVoice) => voz.lang.replace('_', '-') === idioma
  // A preferida em português: Microsoft Francisca Online (Natural), do Edge.
  const pontos = (voz: SpeechSynthesisVoice) =>
    (/francisca/i.test(voz.name) ? 8 : 0) +
    (VOZES_NATURAIS.test(voz.name) ? 4 : 0) +
    (NOMES_FEMININOS.test(voz.name) ? 2 : 0) +
    (exato(voz) ? 1 : 0)
  return [...doIdioma].sort((a, b) => pontos(b) - pontos(a))[0]
}

// As vozes chegam depois da abertura no Chrome: pedir já deixa a lista pronta.
if (vozDisponivel()) window.speechSynthesis.getVoices()

/**
 * Fala em voz alta, mesmo sem leitor de tela: a voz mais natural do idioma do app
 * (de preferência a Francisca), no tom dela e na velocidade escolhida na Narração.
 */
export function falar(texto: string) {
  if (!texto || !vozDisponivel()) return
  const idioma = idiomaGlobal()
  const fala = new SpeechSynthesisUtterance(texto)
  fala.lang = idioma
  fala.rate = config.velocidade
  const voz = vozMaisNatural(idioma)
  if (voz) fala.voice = voz
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(fala)
}

export function pararFala() {
  if (vozDisponivel()) window.speechSynthesis.cancel()
}
