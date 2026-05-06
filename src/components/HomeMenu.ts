/**
 * Renderiza o menu inicial de modulos do ecossistema Riichi Manager.
 *
 * @returns HTML do menu inicial com torneio rapido disponivel e futuros modulos sinalizados.
 */
export function renderHomeMenu(): string {
  return `
    <section class="card home-menu" aria-label="Menu inicial">
      <div class="home-menu-hero">
        <span class="home-menu-kicker">Ecossistema para clubes de mahjong</span>
        <h2>Riichi Manager</h2>
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
        <button class="btn-outline home-menu-button app-screen-button" data-screen="calculator" type="button">
          <i class="fas fa-calculator" aria-hidden="true"></i>
          Calculadora de mao
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="handValidator" type="button">
          <i class="fas fa-check-circle" aria-hidden="true"></i>
          Validador de mao
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="yakuReference" type="button">
          <i class="fas fa-book" aria-hidden="true"></i>
          Referencia de yaku
        </button>
      </div>

      <ul class="home-menu-notes">
        <li>Torneio fast: sorteia todas as rodadas antes, controla ventos e deixa a grade inteira visivel.</li>
        <li>Sistema suico: primeira rodada aleatoria; depois melhores contra melhores por ranking.</li>
        <li>Checkpoint JSON fica dentro do sistema suico, porque esse modo pode durar varios dias.</li>
      </ul>
    </section>
  `;
}
