/**
 * Renderiza o menu inicial de modulos do ecossistema Riichi Manager.
 *
 * @returns HTML do menu inicial com torneio rapido disponivel e futuros modulos sinalizados.
 */
export function renderHomeMenu(): string {
  return `
    <section class="card home-menu" aria-label="Menu inicial">
      <div class="home-menu-hero">
        <h2>Um ecossistema para clubes de Riichi Mahjong</h2>
        <p>
          Organize torneios, acompanhe partidas e evolua para ferramentas de estudo,
          calculadora e referencia de yaku no mesmo lugar.
        </p>
      </div>

      <div class="home-menu-actions">
        <button class="btn-primary home-menu-button" id="quickTournamentButton" type="button">
          <i class="fas fa-bolt" aria-hidden="true"></i>
          Torneio fast
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="swiss" type="button">
          <i class="fas fa-trophy" aria-hidden="true"></i>
          Sistema suico
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="handTools" type="button">
          <i class="fas fa-calculator" aria-hidden="true"></i>
          Calculadora e validador de mao
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="yakuReference" type="button">
          <i class="fas fa-book" aria-hidden="true"></i>
          Referencia de yaku
        </button>
      </div>
    </section>
  `;
}
