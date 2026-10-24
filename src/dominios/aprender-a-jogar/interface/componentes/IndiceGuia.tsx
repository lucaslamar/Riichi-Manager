import { useEffect, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ConteudoTutorial, ReferenceTopic } from '../../conteudo/tipos'
import { ID_CREDITOS, type PaginaLivro } from '../../logica/livro'

/**
 * Índice do guia: Módulos (com as páginas de cada um), Regras à parte,
 * Glossário e Créditos. No celular abre como painel de baixo; no tablet, como
 * um painel preso ao botão do índice (só CSS).
 */
export default function IndiceGuia({
  conteudo,
  livro,
  indiceAtual,
  concluidos,
  aoIrPara,
  aoAbrirRegra,
  aoAbrirGlossario,
  aoFechar,
}: {
  conteudo: ConteudoTutorial
  livro: PaginaLivro[]
  indiceAtual: number
  concluidos: string[]
  aoIrPara: (indice: number) => void
  aoAbrirRegra: (topico: ReferenceTopic) => void
  aoAbrirGlossario: () => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const painelRef = useRef<HTMLDivElement>(null)
  const atual = livro[indiceAtual]
  const moduloAtual = atual && 'modulo' in atual ? atual.modulo.id : undefined

  useEffect(() => {
    painelRef.current?.focus()
  }, [])

  const indiceDe = (id: string) => livro.findIndex((pagina) => pagina.id === id)

  return (
    <div className="guia-indice-fundo" role="presentation" onClick={aoFechar}>
      <div
        ref={painelRef}
        className="guia-indice"
        role="dialog"
        aria-label={t('learn.indexTitle')}
        tabIndex={-1}
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="guia-indice__cabecalho">
          <h2>{t('learn.index')}</h2>
          <button
            type="button"
            className="guia-botao-icone"
            aria-label={t('learn.closeIndex')}
            title={t('learn.closeIndex')}
            onClick={aoFechar}
          >
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="guia-indice__corpo">
          <section aria-labelledby="guia-indice-modulos">
            <h3 id="guia-indice-modulos" className="guia-indice__secao">
              {t('learn.modules')}
            </h3>
            {conteudo.tutorialModules.map((modulo) => {
              const concluido = concluidos.includes(modulo.id)
              return (
                <details
                  key={modulo.id}
                  className="guia-indice__modulo"
                  open={modulo.id === moduloAtual}
                >
                  <summary>
                    <span className="guia-indice__numero">{modulo.number}</span>
                    <span className="guia-indice__titulo">{modulo.title}</span>
                    {concluido && (
                      <i
                        className="fas fa-check guia-indice__concluido"
                        role="img"
                        aria-label={t('learn.done')}
                      />
                    )}
                  </summary>
                  <ul>
                    {modulo.pages.map((pagina) => {
                      const indice = indiceDe(pagina.id)
                      return (
                        <li key={pagina.id}>
                          <button
                            type="button"
                            aria-current={indice === indiceAtual ? 'page' : undefined}
                            onClick={() => aoIrPara(indice)}
                          >
                            <span className="guia-indice__numero">{pagina.number}</span>
                            {pagina.title}
                          </button>
                        </li>
                      )
                    })}
                    {modulo.quiz && (
                      <li>
                        <button
                          type="button"
                          aria-current={
                            livro[indiceAtual]?.id === `${modulo.id}-quiz` ? 'page' : undefined
                          }
                          onClick={() => aoIrPara(indiceDe(`${modulo.id}-quiz`))}
                        >
                          <span className="guia-indice__numero">
                            <i className="fas fa-question" aria-hidden="true" />
                          </span>
                          {t('learn.quiz')}
                        </button>
                      </li>
                    )}
                  </ul>
                </details>
              )
            })}
          </section>

          <section aria-labelledby="guia-indice-regras">
            <h3 id="guia-indice-regras" className="guia-indice__secao">
              {t('learn.reference')}
            </h3>
            {conteudo.referenceSections.map((secao) => (
              <details key={secao.id} className="guia-indice__modulo">
                <summary>
                  <span className="guia-indice__titulo">{secao.title}</span>
                </summary>
                <ul>
                  {conteudo.referenceTopics
                    .filter((topico) => topico.section === secao.id)
                    .map((topico) => (
                      <li key={topico.id}>
                        <button type="button" onClick={() => aoAbrirRegra(topico)}>
                          {topico.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </details>
            ))}
          </section>

          <section aria-labelledby="guia-indice-outros">
            <h3 id="guia-indice-outros" className="sr-only">
              {t('learn.glossary')}
            </h3>
            <ul className="guia-indice__lista guia-indice__lista--destaque">
              <li>
                <button type="button" onClick={aoAbrirGlossario}>
                  <i className="fas fa-book" aria-hidden="true" />
                  {t('learn.glossary')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => aoIrPara(indiceDe(ID_CREDITOS))}>
                  <i className="fas fa-heart" aria-hidden="true" />
                  {t('learn.credits')}
                </button>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
