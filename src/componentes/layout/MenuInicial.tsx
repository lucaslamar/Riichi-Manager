/**
 * @fileoverview Menu inicial da aplicação.
 *
 * Conceitos React demonstrados aqui:
 * - Props: dados passados do componente pai para o filho (como parâmetros de função).
 * - Tipagem de props com TypeScript: garante que o pai passe os dados corretos.
 */

import type { TelaPrincipal } from '../../App'

/**
 * Props (propriedades) do MenuInicial.
 * O TypeScript verifica que quem usar este componente passe exatamente esses dados.
 */
interface PropsMenuInicial {
  /** Chamada quando o usuário clica em "Torneio Fast". */
  aoClicarTorneioFast: () => void
  /** Chamada para navegar para outras telas. */
  aoNavegar: (tela: TelaPrincipal) => void
}

/**
 * Menu inicial com os quatro módulos do app.
 * Recebe callbacks do App.tsx para navegar entre telas.
 *
 * @param props - aoClicarTorneioFast e aoNavegar.
 * @returns JSX do card de menu.
 */
export default function MenuInicial({ aoClicarTorneioFast, aoNavegar }: PropsMenuInicial) {
  return (
    <section className="card menu-inicial" aria-label="Menu principal">
      <div className="menu-inicial-hero">
        <h2>Um ecossistema para clubes de Riichi Mahjong</h2>
        <p>
          Organize torneios fast, acompanhe partidas em tempo real e use a
          calculadora de pontos integrada — tudo em um só lugar.
        </p>
      </div>

      <div className="menu-inicial-acoes">
        {/* onClick recebe uma função anônima (arrow function) */}
        <button
          className="btn-primario botao-menu"
          type="button"
          onClick={aoClicarTorneioFast}
        >
          <i className="fas fa-bolt" aria-hidden="true" /> Torneio fast
        </button>

        <button
          className="btn-contorno botao-menu"
          type="button"
          onClick={() => aoNavegar('suico')}
        >
          <i className="fas fa-trophy" aria-hidden="true" /> Sistema suíço
        </button>

        <button
          className="btn-contorno botao-menu"
          type="button"
          onClick={() => aoNavegar('calculadora')}
        >
          <i className="fas fa-calculator" aria-hidden="true" /> Calculadora de mão
        </button>

        <button
          className="btn-contorno botao-menu"
          type="button"
          onClick={() => aoNavegar('referenciaYaku')}
        >
          <i className="fas fa-book" aria-hidden="true" /> Referência de yaku
        </button>
      </div>
    </section>
  )
}
