/**
 * O que os arquivos de idioma do guia têm em comum: os dados que vêm do app
 * (han dos yakus, verbetes do glossário, valores dos patamares) e a montagem da
 * módulos feitos de tópicos e das referências `{{onde:<id>}}`. Assim cada idioma
 * só traz os textos.
 */
import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { formatarNumero } from '@/compartilhado/i18n/traduzir'
import { secoesGlossario } from '@/dominios/calculadora-mao/logica/glossario'
import { YAKU, yakusDoIdioma } from '@/dominios/calculadora-mao/logica/yakus'
import {
  CATEGORIAS_LOCAIS_EM_ORDEM,
  textoYakuLocal,
  YAKUS_LOCAIS,
} from '@/dominios/calculadora-mao/logica/yakusLocais'
import type { TutorialBlock, TutorialModule, TutorialPart } from './tipos'

/** Títulos dos grupos de yakus locais na tabela do guia. */
const TITULOS_LOCAIS: Record<'pt' | 'en', Record<string, string>> = {
  pt: {
    han1: '1 han',
    han2: '2 han',
    han2mais: '2 han ou mais',
    han3mais: '3 han ou mais',
    manganPedra: 'Mangan por pedra específica',
    mangan: 'Mangan ou mais',
    yakuman: 'Yakuman',
    duplo: 'Yakuman duplo',
  },
  en: {
    han1: '1 han',
    han2: '2 han',
    han2mais: '2 han or more',
    han3mais: '3 han or more',
    manganPedra: 'Mangan for a specific tile',
    mangan: 'Mangan or more',
    yakuman: 'Yakuman',
    duplo: 'Double Yakuman',
  },
}

/** Artigo de suji indicado no fim da defesa (matagi suji). */
export const ARTIGO_SUJI = 'https://npmahjong.com/blog/suji'

/** Han de um yaku na referência do app (mão fechada). */
export const hanYaku = (id: string) => String(YAKU.find((item) => item.id === id)?.hanClosed ?? '')

/** Yakuman que só vale com a mão fechada: na tabela, "—" na coluna da aberta. */
const YAKUMAN_SO_FECHADA = new Set(['kokushi', 'suuankou', 'chuuren', 'tenhou', 'chiihou'])

/**
 * Linha da Lista de yakus: nome no idioma, a frase e o han da referência do app.
 * "—" = só fechada; "Y" = yakuman; "+1" = soma ao Riichi (Daburu Riichi).
 */
const linhaYaku = (idioma: IdiomaSuportado, id: string, frase: string) => {
  const yaku = yakusDoIdioma(idioma).find((item) => item.id === id)
  if (yaku?.yakuman) return [yaku.titulo, frase, 'Y', YAKUMAN_SO_FECHADA.has(id) ? '—' : 'Y']
  const han = (valor: number | null | undefined) =>
    valor == null ? '—' : yaku?.bonus ? `+${valor}` : String(valor)
  return [yaku?.titulo ?? id, frase, han(yaku?.hanClosed), han(yaku?.hanOpen)]
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
        rows: linhas.map(([id, frase]) => linhaYaku(idioma, id, frase)),
        compact: true,
        links: linhas.map(([id]) => `yaku:${id}`),
      },
    ],
    /**
     * Todos os yakus locais, um grupo por valor, no formato da Lista de yakus:
     * M = Mangan, Y = Yakuman, YY = Yakuman duplo. Tocar abre o card com as pedras.
     */
    tabelaYakusLocais: (): TutorialBlock[] =>
      CATEGORIAS_LOCAIS_EM_ORDEM.flatMap(({ categoria }) => {
        const lista = YAKUS_LOCAIS.filter((yaku) => yaku.categoria === categoria)
        const celula = (valor: number | null) => (valor === null ? '—' : String(valor))
        return [
          { type: 'heading', text: TITULOS_LOCAIS[idioma === 'pt-BR' ? 'pt' : 'en'][categoria] },
          {
            type: 'table',
            headers: textos.cabecalhoYakus,
            compact: true,
            rows: lista.map((yaku) => {
              const { valor } = yaku
              const frase = textoYakuLocal(yaku, idioma).descricao
              if (valor.tipo === 'han') return [yaku.nome, frase, celula(valor.fechada), celula(valor.aberta)]
              const marca = valor.tipo === 'mangan' ? 'M' : categoria === 'duplo' ? 'YY' : 'Y'
              return [yaku.nome, frase, marca, marca]
            }),
            links: lista.map((yaku) => `local:${yaku.id}`),
          },
        ] satisfies TutorialBlock[]
      }),
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

/** Um assunto avulso (chombo, furiten…); vira uma página do módulo da sua seção. */
export interface TopicoRegras {
  id: string
  section: 'chombo-honba' | 'regras' | 'estrategia'
  title: string
  termos?: string[]
  blocks: TutorialBlock[]
}

/** Um módulo feito dos tópicos de uma seção, um por página (Chombo e honba, Mais regras, Estratégia). */
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
  lugar = (parte: number, modulo: number, titulo: string) =>
    `Parte ${parte}, Módulo ${modulo} (${titulo})`,
) {
  const ondeEsta = new Map(
    partes.flatMap((parte) =>
      parte.modules.map((item) => [item.id, lugar(parte.number, item.number, item.title)]),
    ),
  )
  const percorrer = (valor: unknown) => {
    if (!valor || typeof valor !== 'object') return
    const campos = valor as Record<string, unknown>
    for (const chave of Object.keys(campos)) {
      const campo = campos[chave]
      if (typeof campo === 'string' && campo.includes('{{onde:')) {
        campos[chave] = campo.replace(/\{\{onde:([\w-]+)\}\}/g, (_, id: string) => {
          const achado = ondeEsta.get(id)
          if (!achado) throw new Error(`Referência do guia para módulo inexistente: ${id}`)
          return achado
        })
      } else percorrer(campo)
    }
  }
  percorrer(partes)
}
