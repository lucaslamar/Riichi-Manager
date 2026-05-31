import type { Acao, Mao } from '../../../logica/mao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { BotaoAcao } from '../Botoes'

interface PropsAcoesConstrutorMao {
  mao: Mao
  acaoPendente: Acao | null
  podeChii: boolean
  podePon: boolean
  podeKanAberto: boolean
  podeKanFechado: boolean
  aoAlternarAcao: (tipo: Acao['tipo']) => void
  compacto?: boolean
}

/**
 * Agrupa os comandos que mudam o destino do próximo clique no teclado de pedras.
 * É usado tanto na barra desktop quanto no menu compacto mobile.
 */
export function AcoesConstrutorMao({
  mao,
  acaoPendente,
  podeChii,
  podePon,
  podeKanAberto,
  podeKanFechado,
  aoAlternarAcao,
  compacto = false,
}: PropsAcoesConstrutorMao) {
  const { t } = useI18n()

  return (
    <>
      <BotaoAcao
        tipo="chii"
        rotulo={t('melds.chii')}
        cor="#4caf50"
        ativo={acaoPendente?.tipo === 'chii'}
        desabilitado={!podeChii}
        aoClicar={() => aoAlternarAcao('chii')}
      />
      <BotaoAcao
        tipo="pon"
        rotulo={t('melds.pon')}
        cor="#2196f3"
        ativo={acaoPendente?.tipo === 'pon'}
        desabilitado={!podePon}
        aoClicar={() => aoAlternarAcao('pon')}
      />
      <BotaoAcao
        tipo="kanAberto"
        rotulo={compacto ? t('melds.kanCompact') : t('melds.kanAberto')}
        cor="#ba68c8"
        ativo={acaoPendente?.tipo === 'kanAberto'}
        desabilitado={!podeKanAberto}
        aoClicar={() => aoAlternarAcao('kanAberto')}
      />
      <BotaoAcao
        tipo="kanFechado"
        rotulo={compacto ? t('melds.kanClosedCompact') : t('melds.kanFechado')}
        cor="#9c27b0"
        ativo={acaoPendente?.tipo === 'kanFechado'}
        desabilitado={!podeKanFechado}
        aoClicar={() => aoAlternarAcao('kanFechado')}
      />
      <BotaoAcao
        tipo="descarte"
        rotulo={compacto ? t('melds.discardsCompact') : t('melds.discards')}
        cor="#111827"
        ativo={acaoPendente?.tipo === 'descarte'}
        desabilitado={false}
        aoClicar={() => aoAlternarAcao('descarte')}
      />
      <BotaoAcao
        tipo="dora"
        rotulo={compacto ? t('melds.doraCompact') : t('melds.dora')}
        cor="#d97706"
        ativo={acaoPendente?.tipo === 'dora'}
        desabilitado={mao.doraManual > 0 || mao.dora.length >= 5}
        aoClicar={() => aoAlternarAcao('dora')}
      />
      {mao.riichi && (
        <BotaoAcao
          tipo="uradora"
          rotulo={compacto ? 'Ura' : t('melds.uradora')}
          cor="#d97706"
          ativo={acaoPendente?.tipo === 'uradora'}
          desabilitado={mao.doraManual > 0 || mao.uradora.length >= 5}
          aoClicar={() => aoAlternarAcao('uradora')}
        />
      )}
    </>
  )
}
