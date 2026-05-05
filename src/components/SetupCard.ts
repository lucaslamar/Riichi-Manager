import { DEFAULT_PLAYERS } from "../tournament/constants";

export function renderSetupCard(active: boolean): string {
  return `
    <section id="setupContainer" class="card ${active ? "hidden" : ""}" aria-label="Configuracao do torneio">
      <div class="section-title-container">
        <i class="fas fa-cog section-icon" aria-hidden="true"></i>
        <h2>Configuracao do Torneio</h2>
      </div>

      <div class="alert-info">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        Regra: minimo de 8 jogadores e sempre multiplo de 4 para mesas completas.
      </div>

      <textarea
        id="playerList"
        spellcheck="false"
        placeholder="Digite os nomes dos jogadores, um por linha ou separados por virgula..."
      >${DEFAULT_PLAYERS.join("\n")}</textarea>

      <div class="actions">
        <button class="btn-primary" id="startButton" type="button">
          <i class="fas fa-dice" aria-hidden="true"></i>
          Iniciar torneio
        </button>
      </div>
    </section>
  `;
}
