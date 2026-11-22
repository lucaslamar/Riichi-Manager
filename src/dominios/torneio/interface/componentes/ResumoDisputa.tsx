import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Candidato, DistanciasDoPodio } from '../../logica/distanciaPodio'
import type { TextosDistancia } from '../hooks/useTextosDistancia'

/** Topo da Disputa do pódio: a faixa entre as posições e os candidatos ao 1º. */
export default function ResumoDisputa({
  distancias,
  candidatos,
  acompanhadoId,
  textos,
  nome,
  pontos,
  premioEmJogo,
}: {
  distancias: DistanciasDoPodio
  candidatos: readonly Candidato[]
  acompanhadoId: string | null
  textos: TextosDistancia
  nome: (jogadorId: string) => string
  pontos: (valor: number) => string
  /** A diferença de prêmio entre as duas posições, já escrita. */
  premioEmJogo: (acima: number, abaixo: number) => string | null
}) {
  const { t } = useI18n()
  const acompanhado = acompanhadoId ? distancias.porJogador.get(acompanhadoId)?.paraTerceiro : null

  return (
    <>
      <ul className="trn-disputa-lista trn-disputa-faixa" aria-label={t('tournament.podiumGap.podium')}>
        {distancias.faixa.map(({ acima, abaixo, distancia }) => (
          <li key={acima}>
            <span>
              {t('tournament.podiumGap.versus', { a: textos.lugar(acima), b: textos.lugar(abaixo) })}
              {premioEmJogo(acima, abaixo) && <small>{premioEmJogo(acima, abaixo)}</small>}
            </span>
            <strong>{textos.resumo(distancia)}</strong>
          </li>
        ))}
        {acompanhadoId && acompanhado && (
          <li className="trn-disputa-seguido">
            <span>{t('tournament.podiumGap.versus', { a: nome(acompanhadoId), b: textos.lugar(3) })}</span>
            <strong>{textos.resumo(acompanhado)}</strong>
          </li>
        )}
      </ul>

      <h3 className="rkf-titulo trn-disputa-titulo">{t('tournament.podiumGap.contenders')}</h3>
      <ul className="trn-disputa-lista">
        {candidatos.map(({ linha, paraOLider, alcanca }) => (
          <li key={linha.jogadorId} className={alcanca === false ? 'trn-fora-de-alcance' : undefined}>
            <span>
              {textos.lugar(linha.posicao)} {nome(linha.jogadorId)}
              {alcanca !== null && (
                <small className={alcanca ? 'trn-positivo' : undefined}>
                  {t(alcanca ? 'tournament.podiumGap.canReach' : 'tournament.podiumGap.needsHelp')}
                </small>
              )}
            </span>
            <strong>{paraOLider ? textos.resumo(paraOLider) : pontos(linha.pontos)}</strong>
          </li>
        ))}
      </ul>
      {candidatos.some((candidato) => candidato.alcanca !== null) && (
        <p className="cfg-ajuda trn-disputa-aviso">{t('tournament.podiumGap.reachEstimate')}</p>
      )}
    </>
  )
}
