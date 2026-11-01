import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Cadeira, ResultadoFinal } from '../../logica/partida'

/** Colocação, pontos brutos, uma/oka aplicados e pontuação final. */
export default function ListaResultado({
  linhas,
  nomeDe,
}: {
  linhas: readonly ResultadoFinal[]
  nomeDe: (cadeira: Cadeira) => string
}) {
  const { t, numero } = useI18n()
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`

  return (
    <ol className="ptd-resultado-lista">
      {linhas.map((linha) => (
        <li key={linha.cadeira}>
          <span className="ptd-resultado-lugar">
            {t('match.result.place', { place: linha.colocacao })}
          </span>
          <div className="ptd-resultado-dados">
            <strong>{nomeDe(linha.cadeira)}</strong>
            <span className="ptd-apoio">
              {t('match.result.breakdown', {
                raw: numero(linha.pontosBrutos),
                uma: comSinal(linha.uma),
                oka: comSinal(linha.oka),
              })}
              {linha.multa > 0
                ? ` · ${t('match.result.penalty', { points: numero(linha.multa) })}`
                : ''}
            </span>
          </div>
          <strong className={linha.final < 0 ? 'ptd-negativo' : 'ptd-positivo'}>
            {comSinal(linha.final)}
          </strong>
        </li>
      ))}
    </ol>
  )
}
