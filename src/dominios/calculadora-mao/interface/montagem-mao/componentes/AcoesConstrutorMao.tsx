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
  aoAbrirCalculadoraRapida?: () => void
  compacto?: boolean
}

/**
 * Agrupa os comandos que mudam o destino do próximo clique no teclado de pedras.
 * É usado tanto na barra desktop quanto no menu compacto mobile. O último botão
 * é um atalho para a Calculadora de Han e Fu (descartes/furiten seguem na finalização).
 */
export function AcoesConstrutorMao({
  acaoPendente,
  podeChii,
  podePon,
  podeKanAberto,
  podeKanFechado,
  aoAlternarAcao,
  aoAbrirCalculadoraRapida,
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
      {aoAbrirCalculadoraRapida && (
        <button
          className="btn-acao-mao btn-acao-calculadora-rapida action-tab action-tab--quick-calc"
          type="button"
          aria-label={t('menu.quickCalculator')}
          title={t('menu.quickCalculator')}
          onClick={aoAbrirCalculadoraRapida}
        >
          <span>{t('melds.quickCalculatorAction')}</span>
        </button>
      )}
    </>
  )
}
