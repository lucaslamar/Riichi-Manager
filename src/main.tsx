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
import './estilos/global.css'
import App from './App'

// Seleciona o elemento raiz. O `!` diz ao TypeScript que temos certeza que ele existe.
const elementoRaiz = document.getElementById('app')!

// createRoot é a API moderna do React 18 para iniciar a renderização.
createRoot(elementoRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
