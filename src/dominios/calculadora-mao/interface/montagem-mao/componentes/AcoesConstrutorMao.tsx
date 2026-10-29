import type { Acao, Mao } from '../../../logica/mao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { BotaoAcao } from '../../compartilhado/componentes/Botoes'

interface PropsAcoesConstrutorMao {
  mao: Mao
  acaoPendente: Acao | null
  podeChii: boolean
  podePon: boolean
  podeKanAberto: boolean
  podeKanFechado: boolean
  aoAlternarAcao: (tipo: Acao['tipo']) => void
  /** Troca o teclado de pedras pelo campo de notação. */
  aoAbrirNotacao?: () => void
  compacto?: boolean
}

/**
 * Agrupa os comandos que mudam o destino do próximo clique no teclado de pedras.
 * É usado tanto na barra desktop quanto no menu compacto mobile. O último botão
 * abre o campo de notação (descartes/furiten seguem na finalização).
 */
export function AcoesConstrutorMao({
  acaoPendente,
  podeChii,
  podePon,
  podeKanAberto,
  podeKanFechado,
  aoAlternarAcao,
  aoAbrirNotacao,
  compacto = false,
}: PropsAcoesConstrutorMao) {
  const { t } = useI18n()

  return (
    <>
      <BotaoAcao
        tipo="chii"
        rotulo={t('melds.chii')}
        ativo={acaoPendente?.tipo === 'chii'}
        desabilitado={!podeChii}
        aoClicar={() => aoAlternarAcao('chii')}
      />
      <BotaoAcao
        tipo="pon"
        rotulo={t('melds.pon')}
        ativo={acaoPendente?.tipo === 'pon'}
        desabilitado={!podePon}
        aoClicar={() => aoAlternarAcao('pon')}
      />
      <BotaoAcao
        tipo="kanAberto"
        rotulo={compacto ? t('melds.kanCompact') : t('melds.kanAberto')}
        ativo={acaoPendente?.tipo === 'kanAberto'}
        desabilitado={!podeKanAberto}
        aoClicar={() => aoAlternarAcao('kanAberto')}
      />
      <BotaoAcao
        tipo="kanFechado"
        rotulo={compacto ? t('melds.kanClosedCompact') : t('melds.kanFechado')}
        ativo={acaoPendente?.tipo === 'kanFechado'}
        desabilitado={!podeKanFechado}
        aoClicar={() => aoAlternarAcao('kanFechado')}
      />
      {aoAbrirNotacao && (
        <BotaoAcao
          tipo="notacao"
          rotulo={t('notation.toggle')}
          ativo={false}
          desabilitado={false}
          aoClicar={aoAbrirNotacao}
        />
      )}
    </>
  )
}
