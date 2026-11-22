import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { RegrasDoModo } from '@/compartilhado/modo-jogo/regrasDoModo'
import { useEu } from '@/dominios/jogadores/interface/hooks/useEu'
import {
  MINIMO_PARA_PROJETAR,
  projetarUltrapassagem,
  proximoAcima,
  type LinhaProjetavel,
} from '../logica/projecao'
import MaosSemMedia from './MaosSemMedia'
import { useFormatoEstatisticas } from './useFormatoEstatisticas'

/** Sem fim definido: a distância para o próximo em mãos e em jogos pela média. */
export default function ProjecaoProximo({
  linhas,
  jogadorId,
  nome,
  regras,
}: {
  linhas: readonly LinhaProjetavel[]
  jogadorId: string
  nome: (jogadorId: string) => string
  regras: RegrasDoModo
}) {
  const { t } = useI18n()
  const { euId } = useEu()
  const { decimal, comSinal } = useFormatoEstatisticas()

  const linha = linhas.find((item) => item.jogadorId === jogadorId)
  if (!linha) return <p className="est-apoio">{t('stats.projection.outside')}</p>
  const proximo = proximoAcima(linhas, jogadorId)
  if (!proximo) return <p className="est-projecao">{t('stats.projection.first')}</p>

  const projecao = projetarUltrapassagem(linha, proximo)
  const pessoa = jogadorId === euId ? 'you' : 'player'
  const nomes = { name: nome(jogadorId), other: nome(proximo.jogadorId) }
  const atras = t(`stats.projection.behind.${pessoa}`, {
    ...nomes,
    value: decimal(projecao.diferenca),
  })
  const conclusao =
    projecao.resultado === 'passa'
      ? t('stats.projection.passes', { count: projecao.jogos })
      : t(`stats.projection.${projecao.resultado}`, { count: MINIMO_PARA_PROJETAR })

  return (
    <div className="est-proximo">
      <p className="est-projecao">{atras}</p>
      {/* No Chinês os pontos do ranking não se convertem em mãos. */}
      {regras.modo === 'riichi' && projecao.diferenca > 0 && (
        <MaosSemMedia
          diferenca={projecao.diferenca}
          lider={nomes.other}
          regras={regras}
          unidades={regras.unidadesDistancia.filter((unidade) => unidade.resumida)}
        />
      )}
      <div className="est-bloco">
        <strong className="est-bloco-titulo">{t('stats.projection.withAverage')}</strong>
        <p>
          {projecao.resultado !== 'poucosJogos' &&
            `${t(`stats.projection.averages.${pessoa}`, {
              ...nomes,
              mine: comSinal(projecao.minhaMedia),
              theirs: comSinal(projecao.mediaDele),
            })} `}
          <strong>{conclusao}</strong>
        </p>
      </div>
    </div>
  )
}
