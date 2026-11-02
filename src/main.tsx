/**
 * @fileoverview Ponto de entrada da aplicação.
 *
 * O React precisa de um elemento HTML raiz para "montar" (renderizar) a árvore
 * de componentes. Aqui selecionamos a `<div id="app">` do index.html e
 * passamos o componente raiz `<App />` para dentro dela.
 *
 * `StrictMode` ativa avisos extras durante o desenvolvimento — não afeta produção.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './compartilhado/interface/estilos/index.css'
import App from './app/App'
import { iniciarInstalacao } from './compartilhado/adaptadores/instalacao'
import { I18nProvider } from './compartilhado/i18n/I18nProvider'
import { PreferenciasProvider } from './compartilhado/preferencias/PreferenciasProvider'

// O service worker só existe no build; no dev ele ia guardar arquivos velhos.
iniciarInstalacao(import.meta.env.PROD ? `${import.meta.env.BASE_URL}sw.js` : '')

// Seleciona o elemento raiz. O `!` diz ao TypeScript que temos certeza que ele existe.
const elementoRaiz = document.getElementById('app')!

// createRoot é a API moderna do React 18 para iniciar a renderização.
createRoot(elementoRaiz).render(
  <StrictMode>
    <PreferenciasProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </PreferenciasProvider>
  </StrictMode>,
)

