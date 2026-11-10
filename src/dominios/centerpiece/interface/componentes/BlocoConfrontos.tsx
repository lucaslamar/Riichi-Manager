import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import type { Confronto } from '../../logica/filtrosRanking'
import { nomesNoRanking } from './nomesNoRanking'

/**
 * "Confrontos de X" no topo do ranking filtrado por jogador: maiores rivais e
 * fregueses. Tocar num adversário passa o filtro para ele.
 */
export default function BlocoConfrontos({
  jogadorId,
  confrontos,
  aoEscolher,
  aoAnalisar,
}: {
  jogadorId: string
  confrontos: { rivais: Confronto[]; fregueses: Confronto[] }
  aoEscolher: (jogadorId: string) => void
  /** Abre a tela do jogador com o mapa e os gráficos. */
  aoAnalisar?: (jogadorId: string) => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const nomesDe = (id: string) => nomesNoRanking(jogadores.find((jogador) => jogador.id === id))
  const vazio = confrontos.rivais.length === 0 && confrontos.fregueses.length === 0

  const lista = (titulo: string, icone: string, itens: Confronto[]) =>
    itens.length > 0 && (
      <div>
        <h4>
          <i className={`fas ${icone}`} aria-hidden="true" />
          {titulo}
        </h4>
        <ul>
          {itens.map((item) => {
            const nomes = nomesDe(item.adversarioId)
            return (
              <li key={item.adversarioId}>
                <button type="button" className="rkf-adversario" onClick={() => aoEscolher(item.adversarioId)}>
                  <span className="ptd-ranking-nomes">
                    <strong>{nomes.principal}</strong>
                    {nomes.apoio && <small className="ptd-ranking-nome-completo">{nomes.apoio}</small>}
                  </span>
                  <span className="rkf-placar">
                    {numero(item.vitorias)}–{numero(item.derrotas)}
                  </span>
                  <span className="rkf-juntos">{t('match.ranking.rivals.together', { count: item.partidas })}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )

  return (
    <section className="rkf-confrontos" aria-live="polite">
      <div className="rkf-confrontos-topo">
        <h3>{t('match.ranking.rivals.title', { name: nomesDe(jogadorId).principal })}</h3>
        {aoAnalisar && (
          <button type="button" className="rkf-ver-analise" onClick={() => aoAnalisar(jogadorId)}>
            {t('match.player.seeCharts')}
            <i className="fas fa-chevron-right" aria-hidden="true" />
          </button>
        )}
      </div>
      {vazio ? (
        <p className="ptd-vazio">{t('match.ranking.rivals.empty')}</p>
      ) : (
        <div className="rkf-confrontos-listas">
          {lista(t('match.ranking.rivals.rivals'), 'fa-skull', confrontos.rivais)}
          {lista(t('match.ranking.rivals.customers'), 'fa-face-smile', confrontos.fregueses)}
        </div>
      )}
    </section>
  )
}
