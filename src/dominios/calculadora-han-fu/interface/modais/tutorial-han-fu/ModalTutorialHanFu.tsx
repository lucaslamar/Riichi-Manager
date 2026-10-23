import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import CaixaFormula, {
  ContaPassos,
} from '@/compartilhado/interface/componentes/formula/CaixaFormula'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import { correspondeBusca } from '@/dominios/calculadora-mao/logica/glossario'
import { parseMpszGrupos } from '@/dominios/calculadora-mao/logica/yakus'
import TextoGlossario from '@/dominios/calculadora-mao/interface/modais/glossario/TextoGlossario'
import { MaoRotulada } from '@/dominios/calculadora-mao/interface/modais/yakus/PedrasExemplo'
import MultiplicacaoLinhas from './MultiplicacaoLinhas'
import {
  PAGINAS_TUTORIAL_HAN_FU,
  TERMOS_PROPRIOS_TUTORIAL,
  type BlocoTutorial,
  type SecaoTutorial,
} from './conteudoTutorialHanFu'
// Mesmo visual das ajudas "?" e do Guia de bolso: bloco do Glossário, dica
// cinza, ajustes da ajuda e o sumário da aba Glossário.
import '@/dominios/calculadora-mao/interface/modais/yakus/aba-glossario.css'
import '@/dominios/calculadora-mao/interface/modais/glossario/bloco-dica.css'
import '@/dominios/calculadora-mao/interface/modais/glossario/bloco-glossario.css'
import '@/dominios/calculadora-mao/interface/modais/ajuda-secoes/ajuda-secoes.css'
import './tutorial-han-fu.css'

const URL_CREDITO = 'https://en.wikipedia.org/wiki/Japanese_mahjong_scoring_rules'

/** Leva o tutorial para uma página (índice a partir de 0). */
const ContextoIrParaPagina = createContext<(indice: number) => void>(() => {})

/** Link para outra página nos textos: `[[pagina:4|calcule você mesmo]]` (número a partir de 1). */
const LINK_PAGINA = /\[\[pagina:(\d+)\|([^\]]+)\]\]/

function Texto({ chave }: { chave: string }) {
  const { t } = useI18n()
  const irParaPagina = useContext(ContextoIrParaPagina)
  // split com grupos: [texto, número, rótulo, texto, …]
  const partes = t(chave).split(new RegExp(LINK_PAGINA, 'g'))
  return partes.map((parte, indice) => {
    const posicao = indice % 3
    if (posicao === 1) return null
    if (posicao === 2) {
      const numero = Number(partes[indice - 1])
      return (
        <button
          // biome-ignore lint/suspicious/noArrayIndexKey: partes fixas de um texto
          key={indice}
          type="button"
          className="tutorial-link-pagina"
          onClick={() => irParaPagina(numero - 1)}
        >
          {parte}
        </button>
      )
    }
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: partes fixas de um texto
      <TextoGlossario key={indice} texto={parte} ignorar={TERMOS_PROPRIOS_TUTORIAL} />
    )
  })
}

function BlocoPagina({ bloco, aoVerTabela }: { bloco: BlocoTutorial; aoVerTabela?: () => void }) {
  const { t } = useI18n()

  switch (bloco.tipo) {
    case 'grupo':
      return <h3 className="glossario-bloco__titulo tutorial-grupo">{t(bloco.texto)}</h3>
    case 'intro':
      return (
        <p className="glossario-bloco__intro">
          <Texto chave={bloco.texto} />
        </p>
      )
    case 'subtitulo':
      return <h4 className="glossario-item__nome tutorial-subtitulo">{t(bloco.texto)}</h4>
    case 'paragrafo':
      return (
        <p className="glossario-item__texto">
          <Texto chave={bloco.texto} />
        </p>
      )
    case 'topicos': {
      const Lista = bloco.numerados ? 'ol' : 'ul'
      return (
        <Lista className="glossario-item__topicos tutorial-topicos">
          {bloco.textos.map((chave) => (
            <li key={chave}>
              <Texto chave={chave} />
            </li>
          ))}
        </Lista>
      )
    }
    case 'tabela': {
      const [cabecalho, ...linhas] = bloco.linhas.map((chave) => t(chave).split('|'))
      // Coluna só de números alinha à direita, cabeçalho incluído.
      const numerica = cabecalho.map((_, coluna) =>
        linhas.every((linha) => /^[\d.,\s]+$/.test(linha[coluna] ?? '')),
      )
      const classe = (coluna: number) => (numerica[coluna] ? 'numero' : undefined)
      return (
        <div className="tutorial-tabela">
          <table>
            <thead>
              <tr>
                {cabecalho.map((celula, coluna) => (
                  <th key={celula} scope="col" className={classe(coluna)}>
                    {celula}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map(([nome, ...valores]) => (
                <tr key={nome}>
                  <th scope="row">{nome}</th>
                  {valores.map((valor, indice) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: colunas fixas da tabela
                    <td key={indice} className={classe(indice + 1)}>
                      {valor}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'formula':
      return (
        <CaixaFormula>
          <ContaPassos texto={t(bloco.texto)} alinhar="equacao" />
        </CaixaFormula>
      )
    case 'conta':
      return (
        <div className="tutorial-conta">
          <ContaPassos texto={t(bloco.texto)} alinhar={bloco.alinhar} />
        </div>
      )
    case 'dica':
      return (
        <p className="bloco-dica ajuda-dica">
          <i className="fas fa-circle-info" aria-hidden="true" /> <Texto chave={bloco.texto} />
        </p>
      )
    case 'curiosidade':
      return (
        <p className="bloco-dica tutorial-curiosidade">
          <i className="fas fa-lightbulb" aria-hidden="true" /> <strong>{t(bloco.titulo)}: </strong>
          <Texto chave={bloco.texto} />
        </p>
      )
    case 'multiplicacaoLinhas':
      return <MultiplicacaoLinhas />
    case 'mao':
      return (
        <MaoRotulada
          grupos={parseMpszGrupos(bloco.mpsz)}
          rotulos={bloco.rotulos.map((chave) => t(chave))}
        />
      )
    case 'verTabela':
      // Aberto de fora da calculadora (ex.: Guia de bolso), não há tabela para ver.
      if (!aoVerTabela) return null
      return (
        <button type="button" className="btn-primario tutorial-botao" onClick={aoVerTabela}>
          <i className="fas fa-table" aria-hidden="true" />
          {t('hanFuTutorial.seeTable')}
        </button>
      )
  }
}

/** Textos de um bloco, sem marcação, para a busca da página de consulta. */
function textosDoBloco(bloco: BlocoTutorial, traduzir: (chave: string) => string): string[] {
  const chaves =
    'texto' in bloco
      ? [bloco.texto, ...('titulo' in bloco ? [bloco.titulo] : [])]
      : 'textos' in bloco
        ? bloco.textos
        : 'linhas' in bloco
          ? bloco.linhas
          : 'rotulos' in bloco
            ? bloco.rotulos
            : []
  // Só letras e números: "**Han:**" e "(fūtei)" viram palavras soltas.
  return chaves.map((chave) => traduzir(chave).replace(/[^\p{L}\p{N}]+/gu, ' '))
}

/** Divide os blocos de uma seção em itens: cada `subtitulo` abre um novo. */
function itensDaSecao(blocos: BlocoTutorial[]): BlocoTutorial[][] {
  const itens: BlocoTutorial[][] = []
  for (const bloco of blocos) {
    if (bloco.tipo === 'subtitulo' || itens.length === 0) itens.push([])
    itens[itens.length - 1].push(bloco)
  }
  return itens
}

/** Respiro entre o topo do corpo da modal e o título do assunto ao rolar. */
const RESPIRO_ROLAGEM = 8

/**
 * Página de consulta: busca e sumário no topo (os mesmos do Guia de bolso) e
 * um assunto por seção. Com busca, ficam só os itens que batem (o assunto
 * inteiro, se o título bateu).
 */
function PaginaConsulta({
  secoes,
  renderizarBloco,
}: {
  secoes: SecaoTutorial[]
  renderizarBloco: (bloco: BlocoTutorial, chave: number) => ReactNode
}) {
  const { t } = useI18n()
  const [busca, setBusca] = useState('')
  const raizRef = useRef<HTMLDivElement>(null)
  const buscando = busca.trim() !== ''

  const encontradas = useMemo(() => {
    if (!buscando) return secoes
    return secoes.flatMap((secao) => {
      if (correspondeBusca(busca, [t(secao.titulo)])) return [secao]
      const itens = itensDaSecao(secao.blocos).filter((item) =>
        correspondeBusca(
          busca,
          item.flatMap((bloco) => textosDoBloco(bloco, t)),
        ),
      )
      return itens.length > 0 ? [{ ...secao, blocos: itens.flat() }] : []
    })
  }, [busca, buscando, secoes, t])

  const irPara = (id: string) => {
    const raiz = raizRef.current
    const corpo = raiz?.closest('.modal-corpo')
    const secao = raiz?.querySelector(`[data-secao="${id}"]`)
    if (!raiz || !corpo || !secao) return
    // A busca fica presa no topo: o assunto para logo abaixo dela.
    const busca =
      raiz.querySelector('.tutorial-consulta__busca')?.getBoundingClientRect().height ?? 0
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    corpo.scrollTo({
      top:
        corpo.scrollTop +
        secao.getBoundingClientRect().top -
        corpo.getBoundingClientRect().top -
        busca -
        RESPIRO_ROLAGEM,
      behavior: reduzir ? 'auto' : 'smooth',
    })
  }

  return (
    <div ref={raizRef} className="tutorial-consulta">
      {/* Presa no topo ao rolar, como a busca do Guia de bolso. */}
      <div className="tutorial-consulta__busca">
        <CampoBusca
          valor={busca}
          aoMudar={setBusca}
          rotulo={t('hanFuTutorial.reference.searchLabel')}
          placeholder={t('hanFuTutorial.reference.searchPlaceholder')}
          rotuloLimpar={t('hanFuTutorial.reference.clearSearch')}
        />
      </div>
      {!buscando && (
        <nav
          className="aba-glossario__sumario"
          aria-label={t('hanFuTutorial.reference.summaryLabel')}
        >
          <span className="aba-glossario__sumario-rotulo" aria-hidden="true">
            {t('hanFuTutorial.reference.summary')}
          </span>
          {secoes.map((secao) => (
            <button key={secao.id} type="button" onClick={() => irPara(secao.id)}>
              {t(secao.titulo)}
            </button>
          ))}
        </nav>
      )}
      <div aria-live={buscando ? 'polite' : undefined}>
        {encontradas.length === 0 && (
          <p className="tutorial-consulta__vazio">
            {t('hanFuTutorial.reference.noResults', { search: busca.trim() })}
          </p>
        )}
        {encontradas.map((secao) => (
          <section key={secao.id} data-secao={secao.id} className="tutorial-consulta__secao">
            <h3 className="glossario-bloco__titulo tutorial-grupo">{t(secao.titulo)}</h3>
            {secao.blocos.map(renderizarBloco)}
          </section>
        ))}
      </div>
    </div>
  )
}

/**
 * Tutorial "Como contar Han e Fu", aberto pelo chapéu de formatura da Tabela
 * rápida ou pelo verbete Fu do Guia de bolso. Mesma Modal e mesmo visual das
 * ajudas "?", em páginas.
 */
export default function ModalTutorialHanFu({
  aoFechar,
  aoVerTabela,
}: {
  aoFechar: () => void
  /** Fecha o tutorial e leva até a Tabela rápida (sem ele, o botão some). */
  aoVerTabela?: () => void
}) {
  const { t } = useI18n()
  const [indice, setIndice] = useState(0)
  const pagina = PAGINAS_TUTORIAL_HAN_FU[indice]
  const total = PAGINAS_TUTORIAL_HAN_FU.length
  const ultima = indice === total - 1
  const renderizarBloco = (bloco: BlocoTutorial, posicao: number) => (
    <BlocoPagina
      // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos, nunca reordenados
      key={posicao}
      bloco={bloco}
      aoVerTabela={aoVerTabela}
    />
  )

  return (
    <Modal
      titulo={t('hanFuTutorial.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      estiloTitulo="rotulo"
      className="modal-ajuda-secao modal-tutorial-han-fu"
      paginacao={{
        total,
        atual: indice,
        aoMudar: setIndice,
        rotuloAnterior: t('hanFuTutorial.previous'),
        rotuloProximo: t('hanFuTutorial.next'),
        rotuloPagina: (numero) => t('hanFuTutorial.page', { page: numero + 1, total }),
      }}
    >
      <section className="glossario-bloco">
        <h3 className="glossario-bloco__titulo">
          {indice + 1}. {t(pagina.titulo)}
        </h3>
        <ContextoIrParaPagina.Provider value={setIndice}>
          {pagina.secoes ? (
            <PaginaConsulta secoes={pagina.secoes} renderizarBloco={renderizarBloco} />
          ) : (
            pagina.blocos.map(renderizarBloco)
          )}
        </ContextoIrParaPagina.Provider>
        {ultima && (
          <p className="tutorial-credito">
            {t('hanFuTutorial.creditPrefix')}{' '}
            <a href={URL_CREDITO} target="_blank" rel="noopener noreferrer">
              {t('hanFuTutorial.creditLink')}
            </a>{' '}
            {t('hanFuTutorial.creditLicense')}
          </p>
        )}
      </section>
    </Modal>
  )
}
