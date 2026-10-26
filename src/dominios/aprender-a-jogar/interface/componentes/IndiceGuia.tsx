import { useEffect, useRef } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { ConteudoTutorial, TutorialModule } from '../../conteudo/tipos'
import { idCapaParte, idQuizModulo, type PaginaLivro } from '../../logica/livro'

/**
 * Índice do guia: as partes do livro (cada uma com os seus módulos e as
 * páginas de cada um), e Glossário. No celular abre como painel de baixo; no tablet, como
 * um painel preso ao botão do índice (só CSS).
 */
export default function IndiceGuia({
  conteudo,
  livro,
  indiceAtual,
  concluidos,
  rotuloRank,
  aoIrPara,
  aoAbrirGlossario,
  aoFechar,
}: {
  conteudo: ConteudoTutorial
  livro: PaginaLivro[]
  indiceAtual: number
  concluidos: string[]
  /** "Seu rank: 6º kyu", embaixo do título. */
  rotuloRank: string
  aoIrPara: (indice: number) => void
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

  const moduloNoIndice = (modulo: TutorialModule) => {
    const concluido = concluidos.includes(modulo.id)
    return (
      <details key={modulo.id} className="guia-indice__modulo" open={modulo.id === moduloAtual}>
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
                // Qualquer pergunta do quiz marca a linha; tocar leva à primeira.
                aria-current={
                  atual?.tipo === 'quiz' && atual.modulo.id === modulo.id ? 'page' : undefined
                }
                onClick={() => aoIrPara(indiceDe(idQuizModulo(modulo)))}
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
  }

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
          <div>
            <h2>{t('learn.index')}</h2>
            <p className="guia-indice__rank">
              <i className="fas fa-medal" aria-hidden="true" />
              {rotuloRank}
            </p>
          </div>
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
          {conteudo.tutorialParts.map((parte) => (
            <section key={parte.id} aria-labelledby={`guia-indice-${parte.id}`}>
              <h3 id={`guia-indice-${parte.id}`} className="guia-indice__secao">
                <button
                  type="button"
                  className="guia-indice__parte"
                  onClick={() => aoIrPara(indiceDe(idCapaParte(parte)))}
                >
                  {t('learn.part', { number: parte.number })} · {parte.title}
                </button>
              </h3>
              {parte.modules.map(moduloNoIndice)}
            </section>
          ))}

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
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
