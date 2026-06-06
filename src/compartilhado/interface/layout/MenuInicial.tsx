import type { TelaPrincipal } from '@/app/App'

interface PropsMenuInicial {
  aoClicarTorneioFast: () => void
  aoNavegar: (tela: TelaPrincipal) => void
}

/**
 * Menu legado mantido para reuso eventual.
 *
 * O app agora abre direto na calculadora; este componente mostra apenas modulos
 * prontos e nao expoe Sistema Suico ou Referencia de Yaku.
 */
export default function MenuInicial({ aoClicarTorneioFast, aoNavegar }: PropsMenuInicial) {
  return (
    <section className="card menu-inicial" aria-label="Menu principal">
      <div className="menu-inicial-hero">
        <h2>Riichi Manager</h2>
        <p>Escolha um modulo pronto do ecossistema.</p>
      </div>

      <div className="menu-inicial-acoes">
        <button
          className="btn-primario botao-menu"
          type="button"
          onClick={() => aoNavegar('calculadora')}
        >
          <i className="fas fa-calculator" aria-hidden="true" /> Calculadora de mao
        </button>

        <button
          className="btn-contorno botao-menu"
          type="button"
          onClick={() => aoNavegar('calculadoraRapida')}
        >
          <i className="fas fa-bolt" aria-hidden="true" /> Calculadora de Han e Fu
        </button>

        <button className="btn-contorno botao-menu" type="button" onClick={aoClicarTorneioFast}>
          <i className="fas fa-table" aria-hidden="true" /> Torneio
        </button>
      </div>
    </section>
  )
}
