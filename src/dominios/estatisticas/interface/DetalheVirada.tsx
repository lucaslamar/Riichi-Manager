import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { RegrasDoModo, UnidadeDistancia } from '@/compartilhado/modo-jogo/regrasDoModo'
import type { ValoresUma } from '@/dominios/centerpiece/logica/uma'
import { cenariosComUma, cenariosDoLider, necessidade, situacaoDaVirada } from '../logica/viradas'
import type { FormaDoJogador } from '../logica/forma'
import ProjecaoForma from './ProjecaoForma'
import { useFormatoEstatisticas } from './useFormatoEstatisticas'

/** O que abre ao tocar numa distância: terceiros, direto, o líder e a uma. */
export default function DetalheVirada({
  diferenca,
  perseguidor,
  lider,
  bonus,
  regras,
  unidade,
  restantes,
  restantesLider,
  formaPerseguidor,
  formaLider,
}: {
  diferenca: number
  perseguidor: string
  lider: string
  bonus: ValoresUma
  regras: RegrasDoModo
  /** A unidade escolhida no filtro. Sem ela, as resumidas, com a primeira nas tabelas. */
  unidade?: UnidadeDistancia
  /** Jogos que faltam para quem persegue. null: sem número definido. */
  restantes: number | null
  restantesLider: number | null
  formaPerseguidor: FormaDoJogador | null
  formaLider: FormaDoJogador | null
}) {
  const { t } = useI18n()
  const { decimal, comSinal } = useFormatoEstatisticas()

  const situacao = situacaoDaVirada(restantes, restantesLider)
  if (situacao === 'final') return <p className="est-apoio">{t('stats.turn.noGamesLeft')}</p>
  const unidades = unidade ? [unidade] : regras.unidadesDistancia.filter((item) => item.resumida)
  const referencia = unidades[0]
  const projecao = (
    <ProjecaoForma
      diferenca={diferenca}
      perseguidor={{ nome: perseguidor, forma: formaPerseguidor, restantes }}
      lider={{ nome: lider, forma: formaLider, restantes: restantesLider }}
      regras={regras}
      unidade={referencia}
    />
  )
  if (situacao === 'soLiderJoga') {
    return (
      <div className="est-virada">
        <p className="est-apoio">
          {t('stats.turn.onlyLeader', {
            name: perseguidor,
            leader: lider,
            value: decimal(diferenca),
          })}
        </p>
        {projecao}
      </div>
    )
  }
  const maos = (quantas: number, item: UnidadeDistancia) =>
    t(`tournament.podiumGap.hands.${item.id}`, { count: quantas })
  const porCaminho = (caminho: 'terceiros' | 'direto') =>
    unidades
      .map((item) => {
        const precisa = necessidade(diferenca, item, regras)
        return precisa.situacao === 'precisa' ? maos(precisa[caminho], item) : ''
      })
      .join(' · ')
  const oQuePrecisa = (alvo: number) => {
    const precisa = necessidade(alvo, referencia, regras)
    return precisa.situacao === 'precisa'
      ? t('stats.turn.either', {
          hands: maos(precisa.terceiros, referencia),
          count: precisa.direto,
        })
      : t(`stats.turn.${precisa.situacao}`)
  }

  return (
    <div className="est-virada">
      {projecao}
      {restantes !== null && restantes > 1 && (
        <p className="est-apoio">
          {t('stats.turn.perGame', { games: restantes, value: decimal(diferenca / restantes) })}
        </p>
      )}
      <dl className="est-caminhos">
        <dt>{t('stats.turn.thirdParty')}</dt>
        <dd>{porCaminho('terceiros')}</dd>
        <dt>{t('stats.turn.direct', { name: lider })}</dt>
        <dd>{porCaminho('direto')}</dd>
      </dl>
      <p className="est-apoio">{t('stats.turn.directHelp')}</p>
      <table className="est-cenarios">
        <thead>
          <tr>
            <th scope="col">{t('stats.turn.ifLeader', { name: lider })}</th>
            <th scope="col">{t('stats.turn.needs', { name: perseguidor })}</th>
          </tr>
        </thead>
        <tbody>
          {cenariosDoLider(diferenca, bonus).map(({ final, variacao, alvo }) => (
            <tr key={final}>
              <th scope="row">{t(`stats.turn.finish.${final}`, { value: comSinal(variacao) })}</th>
              <td>{oQuePrecisa(alvo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="est-cenarios">
        <thead>
          <tr>
            <th scope="col">{t('stats.turn.withUma', { name: perseguidor })}</th>
            <th scope="col">{t('stats.turn.needsToo')}</th>
          </tr>
        </thead>
        <tbody>
          {cenariosComUma(diferenca, bonus).map(({ colocacao, bonus: ganho, alvo }) => (
            <tr key={colocacao}>
              <th scope="row">
                {t('stats.turn.inPlace', { place: colocacao, value: comSinal(ganho) })}
              </th>
              <td>{oQuePrecisa(alvo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="est-apoio">{t('stats.turn.umaHelp', { name: lider })}</p>
    </div>
  )
}
