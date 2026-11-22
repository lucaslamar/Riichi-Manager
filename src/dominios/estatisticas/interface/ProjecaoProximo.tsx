import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useEu } from '@/dominios/jogadores/interface/hooks/useEu'
import {
  MINIMO_PARA_PROJETAR,
  projetarUltrapassagem,
  proximoAcima,
  type LinhaProjetavel,
} from '../logica/projecao'
import { useFormatoEstatisticas } from './useFormatoEstatisticas'

/** Sem fim definido: a distância para o próximo e em quantos jogos passa pela média. */
export default function ProjecaoProximo({
  linhas,
  jogadorId,
  nome,
}: {
  linhas: readonly LinhaProjetavel[]
  jogadorId: string
  nome: (jogadorId: string) => string
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
    <p className="est-projecao">
      {atras}{' '}
      {projecao.resultado !== 'poucosJogos' &&
        `${t(`stats.projection.averages.${pessoa}`, {
          ...nomes,
          mine: comSinal(projecao.minhaMedia),
          theirs: comSinal(projecao.mediaDele),
        })} `}
      <strong>{conclusao}</strong>
    </p>
  )
}
