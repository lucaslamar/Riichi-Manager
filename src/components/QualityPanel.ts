import { qualityLabel } from "../pairing/quality";
import type { QualityReport } from "../tournament/types";
import { escapeHtml } from "../utils/format";

// Painel de auditoria do chaveamento: mostra por que uma grade e boa ou suspeita.
export function renderQualityPanel(quality: QualityReport): string {
  const repeatedPairs = quality.repeatedPairs ?? [];

  return `
    <section class="card quality-panel" aria-label="Diagnostico da grade">
      <div class="section-title-container">
        <i class="fas fa-clipboard-check section-icon" aria-hidden="true"></i>
        <h2>Diagnostico da Grade</h2>
        <span class="status-pill">${qualityLabel(quality)}</span>
      </div>
      <dl class="metrics">
        <div>
          <dt>Leste exato</dt>
          <dd>${quality.exactEast ? "Sim" : "Nao"}</dd>
        </div>
        <div>
          <dt>Max. encontros por par</dt>
          <dd>${quality.maxPairRepeats}</dd>
        </div>
        <div>
          <dt>Pares 2x</dt>
          <dd>${quality.twicePairCount}/${quality.idealRepeatedPairCount}</dd>
        </div>
        <div>
          <dt>Pares 3x+</dt>
          <dd>${quality.triplePairCount}</dd>
        </div>
        <div>
          <dt>Mesas iguais</dt>
          <dd>${quality.fullTableRepeats}</dd>
        </div>
      </dl>
      ${renderRepeatedPairs(repeatedPairs)}
    </section>
  `;
}

function renderRepeatedPairs(repeatedPairs: QualityReport["repeatedPairs"]): string {
  if (repeatedPairs.length === 0) {
    return `
      <div class="pair-details">
        <h3>Quem se repetiu</h3>
        <p>Nenhum par repetiu. Grade excelente nesse criterio.</p>
      </div>
    `;
  }

  return `
    <div class="pair-details">
      <h3>Quem se viu mais</h3>
      <div class="pair-list">
        ${repeatedPairs
          .map(
            (pair) => `
              <span class="pair-chip ${pair.count >= 3 ? "danger" : ""}">
                ${escapeHtml(pair.players[0])} + ${escapeHtml(pair.players[1])}
                <strong>${pair.count}x</strong>
              </span>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}
