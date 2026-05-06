/**
 * Renderiza o menu inicial de modos do app.
 *
 * @returns HTML do menu inicial com o fluxo rapido disponivel e os proximos modos sinalizados.
 */
export function renderHomeMenu(): string {
  return `
    <section class="card home-menu" aria-label="Menu inicial">
      <div class="home-menu-hero">
        <span class="home-menu-kicker">Riichi Manager</span>
        <h2>Escolha o tipo de torneio</h2>
        <p>
          Comece pelo torneio rapido atual ou prepare o caminho para o sistema suico competitivo.
        </p>
      </div>

      <div class="home-menu-actions">
        <button class="btn-primary home-menu-button" id="quickTournamentButton" type="button">
          <i class="fas fa-bolt" aria-hidden="true"></i>
          Torneio rapido
        </button>
        <button class="btn-outline home-menu-button" type="button" disabled>
          <i class="fas fa-trophy" aria-hidden="true"></i>
          Sistema suico em breve
        </button>
        <button class="btn-outline home-menu-button" type="button" disabled>
          <i class="fas fa-upload" aria-hidden="true"></i>
          Importar checkpoint em breve
        </button>
      </div>

      <ul class="home-menu-notes">
        <li>Torneio rapido: sorteia todas as rodadas antes e controla ventos.</li>
        <li>Sistema suico: primeira rodada aleatoria; depois melhores contra melhores por ranking.</li>
        <li>Checkpoint JSON: exportar/importar o andamento para continuar em outro computador.</li>
      </ul>
    </section>
  `;
}
