/**
 * O que os arquivos de idioma do guia têm em comum: os dados que vêm do app
 * (han dos yakus, verbetes do glossário, valores dos patamares) e a montagem da
 * Parte 3 e das referências `{{onde:<id>}}`. Assim cada idioma só traz os textos.
 */
import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { formatarNumero } from '@/compartilhado/i18n/traduzir'
import { secoesGlossario } from '@/dominios/calculadora-mao/logica/glossario'
import { YAKU } from '@/dominios/calculadora-mao/logica/yakus'
import type { TutorialBlock, TutorialModule, TutorialPart } from './tipos'

/** Artigo de suji indicado no fim da defesa (matagi suji). */
export const ARTIGO_SUJI = 'https://npmahjong.com/blog/suji'

/** Han de um yaku na referência do app (mão fechada). */
export const hanYaku = (id: string) => String(YAKU.find((item) => item.id === id)?.hanClosed ?? '')

/** Yakuman que só vale com a mão fechada: na tabela, "—" na coluna da aberta. */
const YAKUMAN_SO_FECHADA = new Set(['kokushi', 'suuankou', 'chuuren', 'tenhou', 'chiihou'])

/**
 * Linha da Lista de yakus: nome, a frase e o han da referência do app.
 * "—" = só fechada; "Y" = yakuman; "+1" = soma ao Riichi (Daburu Riichi).
 */
const linhaYaku = (id: string, frase: string) => {
  const yaku = YAKU.find((item) => item.id === id)
  if (yaku?.yakuman) return [yaku.romaji, frase, 'Y', YAKUMAN_SO_FECHADA.has(id) ? '—' : 'Y']
  const han = (valor: number | null | undefined) =>
    valor == null ? '—' : yaku?.bonus ? `+${valor}` : String(valor)
  return [yaku?.romaji ?? id, frase, han(yaku?.hanClosed), han(yaku?.hanOpen)]
}

/** Auxiliares que dependem do idioma do arquivo. */
export function criarAuxiliares(
  idioma: IdiomaSuportado,
  textos: { sim: string; nao: string; cabecalhoYakus: string[] },
) {
  const pontos = (valor: number) => formatarNumero(valor, idioma)
  return {
    pontos,
    /** Linha da tabela de patamares: ko recebe 4× a base e o oya 6×, como na calculadora. */
    linhaPatamar: (nome: string, han: string, base: number) => [
      nome,
      han,
      pontos(base * 4),
      pontos(base * 6),
    ],
    /** Um grupo da Lista de yakus: subtítulo e tabela; tocar num yaku abre o cartão dele. */
    grupoYakus: (titulo: string, linhas: [id: string, frase: string][]): TutorialBlock[] => [
      { type: 'heading', text: titulo },
      {
        type: 'table',
        headers: textos.cabecalhoYakus,
        rows: linhas.map(([id, frase]) => linhaYaku(id, frase)),
        compact: true,
        links: linhas.map(([id]) => `yaku:${id}`),
      },
    ],
    /** Definição de um verbete do Glossário do app (fonte única). */
    doGlossario: (id: string) => {
      for (const secao of secoesGlossario(idioma)) {
        const item = secao.itens.find((verbete) => verbete.id === id)
        if (item?.texto) return item.texto
      }
      return ''
    },
    simNao: (sim: boolean) => [
      { label: textos.sim, correct: sim },
      { label: textos.nao, correct: !sim },
    ],
  }
}

/** Um assunto da Parte 3 (Aprofundando); vira uma página do módulo da sua seção. */
export interface TopicoRegras {
  id: string
  section: 'regras' | 'estrategia'
  title: string
  termos?: string[]
  blocks: TutorialBlock[]
}

/** Um módulo da Parte 3 (Aprofundando), com as páginas dos tópicos da seção. */
export const criarModuloRegras =
  (topicos: TopicoRegras[]) =>
  (
    id: TopicoRegras['section'],
    number: number,
    title: string,
    cover: string,
    quiz?: TutorialModule['quiz'],
  ): TutorialModule => ({
    id,
    number,
    title,
    cover,
    quiz,
    pages: topicos
      .filter((topico) => topico.section === id)
      .map(({ id: idTopico, title: titulo, termos, blocks }, indice) => ({
        id: idTopico,
        number: `${number}.${indice + 1}`,
        title: titulo,
        termos,
        blocks,
      })),
  })

export const criarBuscaModulo = (modulos: TutorialModule[]) => (id: string) => {
  const encontrado = modulos.find((item) => item.id === id)
  if (!encontrado) throw new Error(`Módulo do guia não encontrado: ${id}`)
  return encontrado
}

/** Troca `{{onde:<id>}}` em todos os textos do livro pelo lugar do módulo. */
export function trocarReferencias(
  partes: TutorialPart[],
  // "Parte" e "Módulo" se escrevem igual em português e espanhol.
  rotulos = { parte: 'Parte', modulo: 'Módulo' },
) {
  const ondeEsta = new Map(
    partes.flatMap((parte) =>
      parte.modules.map((item) => [
        item.id,
        `${rotulos.parte} ${parte.number}, ${rotulos.modulo} ${item.number} (${item.title})`,
      ]),
    ),
  )
  const percorrer = (valor: unknown) => {
    if (!valor || typeof valor !== 'object') return
    const campos = valor as Record<string, unknown>
    for (const chave of Object.keys(campos)) {
      const campo = campos[chave]
      if (typeof campo === 'string' && campo.includes('{{onde:')) {
        campos[chave] = campo.replace(/\{\{onde:([\w-]+)\}\}/g, (_, id: string) => {
          const lugar = ondeEsta.get(id)
          if (!lugar) throw new Error(`Referência do guia para módulo inexistente: ${id}`)
          return lugar
        })
      } else percorrer(campo)
    }
  }
  percorrer(partes)
}
