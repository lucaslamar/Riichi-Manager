/**
 * @fileoverview Componente de cabeçalho da aplicação.
 *
 * No React, componentes são funções que retornam JSX.
 * JSX parece HTML mas é JavaScript — `className` no lugar de `class`,
 * expressões entre `{}`, atributos camelCase, etc.
 */

/**
 * Cabeçalho fixo exibido no topo de todas as telas.
 * Stateless (sem estado): sempre renderiza a mesma coisa.
 *
 * @returns JSX do cabeçalho com logo e título.
 */
export default function Cabecalho() {
  return (
    <header className="cabecalho-principal">
      <div className="conteudo-cabecalho">
        {/* O kanji 中 (Chun) funciona como logo */}
        <div className="pedra-mahjong" aria-hidden="true">
          中
        </div>

        <div className="container-titulo">
          <span className="tag-versao">v2.5.3</span>
          {/* clamp() no CSS faz a fonte se adaptar ao tamanho da tela */}
          <h1 className="titulo-principal">Riichi Manager</h1>
        </div>
      </div>
    </header>
  )
}
