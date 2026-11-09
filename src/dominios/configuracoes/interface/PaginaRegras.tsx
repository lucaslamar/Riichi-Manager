import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useInstalacao } from '@/compartilhado/interface/hooks/useInstalacao'
import packageJson from '../../../../package.json'
import ListaAjustesApp, { CartaoAcao } from './ListaAjustesApp'
import './pagina-regras.css'

/**
 * Tela Ajustes: os ajustes do app em cartões (os mesmos da aba "Ajustes do app"
 * das Configurações), mais instalar o app e o Sobre o Mojoca, que ficam só aqui.
 */
export default function PaginaRegras() {
  const { t } = useI18n()
  const { modo: modoInstalacao, instalar } = useInstalacao()
  const [instrucaoAberta, setInstrucaoAberta] = useState(false)

  return (
    <section className="pagina-regras" aria-label={t('menu.rulesShort')}>
      <h2 className="sr-only">{t('menu.rules')}</h2>

      <ListaAjustesApp
        antesDaTela={
          modoInstalacao && (
            <CartaoAcao
              icone="fa-download"
              titulo={t('pages.installTitle')}
              descricao={t('pages.installHelp')}
              aoTocar={modoInstalacao === 'botao' ? () => void instalar() : () => setInstrucaoAberta(true)}
            />
          )
        }
      />

      <div className="sobre-mojoca">
        <h3>{t('pages.aboutTitle')}</h3>
        <p>{t('pages.aboutText')}</p>
        <p className="sobre-mojoca__versao">
          {t('pages.versionLine', { version: packageJson.version })}
        </p>
        <a href="https://github.com/lucaslamar/Riichi-Manager" target="_blank" rel="noreferrer">
          <i className="fab fa-github" aria-hidden="true" /> GitHub
        </a>
        <a href="https://github.com/lucaslamar/Riichi-Manager/issues/new" target="_blank" rel="noreferrer">
          <i className="fas fa-bug" aria-hidden="true" /> {t('pages.reportIssue')}
        </a>
      </div>

      {instrucaoAberta && (
        <Modal
          titulo={t('pages.installTitle')}
          aoFechar={() => setInstrucaoAberta(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <p>{t('pages.installIosSteps')}</p>
        </Modal>
      )}
    </section>
  )
}
