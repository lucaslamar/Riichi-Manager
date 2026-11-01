import { useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  carregarUltimaConfig,
  salvarUltimaConfig,
} from '../../persistencia/repositorioConfigMesa'
import ConfigMesaSheet from '../componentes/ConfigMesaSheet'

/** TEMPORÁRIO: só para testar a folha. Sai quando o setup da Fase 3 usar a folha. */
export default function DemoConfigMesa() {
  const { t } = useI18n()
  const [config, setConfig] = useState(() => carregarUltimaConfig(armazenamentoLocal))
  const [aberta, setAberta] = useState(true)

  return (
    <section className="card">
      <button type="button" className="btn-primario" onClick={() => setAberta(true)}>
        {t('tableConfig.title')}
      </button>
      <pre>{JSON.stringify(config, null, 2)}</pre>
      {aberta && (
        <ConfigMesaSheet
          inicial={config}
          aoFechar={() => setAberta(false)}
          aoConcluir={(nova) => {
            setConfig(nova)
            salvarUltimaConfig(armazenamentoLocal, nova)
            setAberta(false)
          }}
        />
      )}
    </section>
  )
}
