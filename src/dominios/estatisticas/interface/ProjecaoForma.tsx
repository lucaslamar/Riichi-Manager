import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { RegrasDoModo, UnidadeDistancia } from '@/compartilhado/modo-jogo/regrasDoModo'
import { MINIMO_PARA_CHANCE, projetarPelaForma, type FormaDoJogador } from '../logica/forma'
import { necessidade } from '../logica/viradas'
import { useFormatoEstatisticas } from './useFormatoEstatisticas'

interface Lado {
  nome: string
  forma: FormaDoJogador | null
  restantes: number | null
}

/** "Se terminar como costuma, ainda faltam 6 Mangans", com a chance de virar. */
export default function ProjecaoForma({
  diferenca,
  perseguidor,
  lider,
  regras,
  unidade,
}: {
  diferenca: number
  perseguidor: Lado
  lider: Lado
  regras: RegrasDoModo
  unidade: UnidadeDistancia
}) {
  const { t, numero, idioma } = useI18n()
  const { decimal, comSinal } = useFormatoEstatisticas()
  const projecao = projetarPelaForma(diferenca, perseguidor, lider)
  if (!projecao) return null

  const { ate, falta, chance } = projecao
  const precisa = necessidade(falta, unidade, regras)
  const conclusao =
    precisa.situacao === 'precisa'
      ? t('stats.form.short', {
          name: perseguidor.nome,
          value: decimal(falta),
          hands: t('stats.turn.either', {
            hands: t(`tournament.podiumGap.hands.${unidade.id}`, { count: precisa.terceiros }),
            count: precisa.direto,
          }),
        })
      : t(`stats.form.${precisa.situacao}`, { name: perseguidor.nome, value: decimal(-falta) })

  // 0% e 100% dariam certeza, e isto é estimativa.
  const textoChance = (valor: number) => {
    const formato = new Intl.NumberFormat(idioma, { style: 'percent', maximumFractionDigits: 0 })
    if (valor < 0.01) return `<${formato.format(0.01)}`
    if (valor > 0.99) return `>${formato.format(0.99)}`
    return formato.format(valor)
  }

  return (
    <div className="est-forma">
      <strong className="est-forma-titulo">{t(`stats.form.title.${ate}`)}</strong>
      <ul>
        {[perseguidor, lider].map(({ nome, forma, restantes }) =>
          forma && restantes !== 0 ? (
            <li key={nome}>
              {t('stats.form.usual', {
                name: nome,
                points: numero(forma.pontosNaMesa),
                value: comSinal(forma.porJogo),
                count: forma.jogos,
              })}
            </li>
          ) : null,
        )}
      </ul>
      <p className="est-forma-conclusao">{conclusao}</p>
      {chance === null ? (
        <p className="est-apoio">{t('stats.form.fewGames', { count: MINIMO_PARA_CHANCE })}</p>
      ) : (
        <p className="est-forma-chance">
          {t('stats.form.chance')} <strong>{textoChance(chance)}</strong>
        </p>
      )}
      <p className="est-apoio">{t('stats.form.help')}</p>
    </div>
  )
}
