import { useCallback, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { DadosHistoria } from './comporHistoria'
import FluxoHistoriaMao from './FluxoHistoriaMao'

/** Ícone do cabeçalho do Resultado (Riichi e MCR) que abre a câmera para compartilhar a mão. */
export default function BotaoCompartilharMao({ dados }: { dados: () => DadosHistoria }) {
  const { t } = useI18n()
  const [aberto, setAberto] = useState<DadosHistoria | null>(null)
  const fechar = useCallback(() => setAberto(null), [])
  return (
    <>
      <button
        type="button"
        className="modal-acao"
        aria-label={t('historiaMao.botao')}
        title={t('historiaMao.botao')}
        onClick={() => setAberto(dados())}
      >
        <i className="fas fa-share-nodes" aria-hidden="true" />
      </button>
      {aberto && <FluxoHistoriaMao dados={aberto} aoFechar={fechar} />}
    </>
  )
}
