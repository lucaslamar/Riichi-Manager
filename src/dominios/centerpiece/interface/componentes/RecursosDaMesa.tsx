import { useEffect, useState } from 'react'
import { manterTelaAcesa } from '@/compartilhado/adaptadores/telaAcesa'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useInstalacao } from '@/compartilhado/interface/hooks/useInstalacao'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'

const CHAVE_SUGESTAO_VISTA = 'riichi-manager-sugestao-instalar-vista'

/**
 * O que a mesa pede do aparelho enquanto está aberta: tela acesa, se a preferência
 * estiver ligada, e a sugestão de instalar, uma vez só e dispensável.
 */
export default function RecursosDaMesa() {
  const { t } = useI18n()
  const { telaAcesaMesa } = usePreferencias()
  const { modo, instalar } = useInstalacao()
  const [vista, setVista] = useState(() => armazenamentoLocal.ler(CHAVE_SUGESTAO_VISTA) === 'true')

  useEffect(() => (telaAcesaMesa ? manterTelaAcesa() : undefined), [telaAcesaMesa])

  if (vista || modo === null) return null

  const dispensar = () => {
    armazenamentoLocal.gravar(CHAVE_SUGESTAO_VISTA, 'true')
    setVista(true)
  }

  return (
    <div className="mesa-sugestao-instalar" role="status">
      <span>{t(modo === 'botao' ? 'pages.installSuggestion' : 'pages.installIosSteps')}</span>
      {modo === 'botao' && (
        <button
          type="button"
          className="btn-primario"
          onClick={() => {
            dispensar()
            void instalar()
          }}
        >
          {t('pages.installAction')}
        </button>
      )}
      <button
        type="button"
        className="ptd-btn-icone"
        aria-label={t('pages.installDismiss')}
        onClick={dispensar}
      >
        <i className="fas fa-xmark" aria-hidden="true" />
      </button>
    </div>
  )
}
