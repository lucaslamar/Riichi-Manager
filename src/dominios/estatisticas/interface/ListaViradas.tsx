import { useId, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { RegrasDoModo } from '@/compartilhado/modo-jogo/regrasDoModo'
import type { ValoresUma } from '@/dominios/centerpiece/logica/uma'
import type { TextosDistancia } from '@/dominios/torneio/interface/hooks/useTextosDistancia'
import type { DistanciaAlvo } from '@/dominios/torneio/logica/distanciaPodio'
import type { FiltrosRankingTorneio } from '@/dominios/torneio/logica/filtrosRankingTorneio'
import type { FormaDoJogador } from '../logica/forma'
import DetalheVirada from './DetalheVirada'
import '@/dominios/torneio/interface/torneio.css'
import './estatisticas.css'

/** As distâncias de um jogador. Tocar numa linha abre os cenários de virada dela. */
export default function ListaViradas({
  secoes,
  jogadorId,
  regras,
  bonus,
  unidade,
  textos,
  nome,
  restantesDe,
  formaDe,
}: {
  secoes: readonly { id: string; alvos: readonly DistanciaAlvo[] }[]
  jogadorId: string
  regras: RegrasDoModo
  /** null: sem cenários (MCR ou critério que não é soma de pontos). */
  bonus: ValoresUma | null
  unidade: FiltrosRankingTorneio['unidade']
  textos: TextosDistancia
  nome: (jogadorId: string) => string
  restantesDe: (jogadorId: string) => number | null
  formaDe: (jogadorId: string) => FormaDoJogador | null
}) {
  const { t } = useI18n()
  const base = useId()
  const [aberta, setAberta] = useState<string | null>(null)

  const item = (secao: string, alvo: DistanciaAlvo) => {
    // A chave leva o jogador: ao trocar de jogador, a linha aberta fecha.
    const chave = `${secao}-${jogadorId}-${alvo.relacao}-${alvo.jogadorId}`
    const naFrente = alvo.relacao === 'vantagem' || alvo.relacao === 'sobreOUltimo'
    const perseguidorId = naFrente ? alvo.jogadorId : jogadorId
    const liderId = naFrente ? jogadorId : alvo.jogadorId
    const expande = !!bonus && alvo.diferenca > 0
    const expandida = expande && aberta === chave
    const conteudo = (
      <>
        {alvo.posicao <= 3 && (
          <span className="trn-medalha" aria-hidden="true">
            {alvo.posicao}
          </span>
        )}
        <span className="trn-distancia-rotulo">{textos.rotulo(alvo)}</span>
        <strong className={naFrente ? 'trn-positivo' : undefined}>
          {textos.valor(alvo)}
          {alvo.diferenca > 0 && <span className="sr-only"> {t(regras.rotuloPontos)}</span>}
          {expande && <i className="fas fa-chevron-down est-chevron" aria-hidden="true" />}
        </strong>
        <small>
          {textos.detalhe(alvo)}
          {textos.detalheOculto(alvo) && (
            <span className="sr-only"> · {textos.detalheOculto(alvo)}</span>
          )}
        </small>
      </>
    )

    return (
      <li key={chave} className={alvo.posicao <= 3 ? `trn-podio--${alvo.posicao}` : undefined}>
        {expande ? (
          <button
            type="button"
            className="est-linha"
            aria-expanded={expandida}
            aria-controls={expandida ? `${base}-${chave}` : undefined}
            onClick={() => setAberta(expandida ? null : chave)}
          >
            {conteudo}
          </button>
        ) : (
          <div className="est-linha">{conteudo}</div>
        )}
        {expandida && (
          <div id={`${base}-${chave}`}>
            <DetalheVirada
              diferenca={alvo.diferenca}
              perseguidor={nome(perseguidorId)}
              lider={nome(liderId)}
              bonus={bonus}
              regras={regras}
              unidade={regras.unidadesDistancia.find((opcao) => opcao.id === unidade)}
              restantes={restantesDe(perseguidorId)}
              restantesLider={restantesDe(liderId)}
              formaPerseguidor={formaDe(perseguidorId)}
              formaLider={formaDe(liderId)}
            />
          </div>
        )}
      </li>
    )
  }

  return secoes.map((secao) => (
    <ul key={secao.id} className="trn-distancia-lista">
      {secao.alvos.map((alvo) => item(secao.id, alvo))}
    </ul>
  ))
}
