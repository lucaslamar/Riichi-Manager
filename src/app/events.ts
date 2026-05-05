import { exportRankingPdf } from "../tournament/pdf";
import { defaultScoreText } from "../utils/format";
import { resetTournament, saveTableScores, startTournament } from "./actions";
import { getTournament } from "./state";

// Este arquivo conhece o DOM. A regra de torneio fica em actions/tournament/pairing.
export function bindEvents(render: () => void): void {
  document.querySelector<HTMLButtonElement>("#startButton")?.addEventListener(
    "click",
    () => {
      const input = document.querySelector<HTMLTextAreaElement>("#playerList");
      const validationError = startTournament(input?.value ?? "");

      if (validationError) {
        window.alert(validationError);
        return;
      }

      render();
    },
  );
  document.querySelector<HTMLButtonElement>("#resetButton")?.addEventListener(
    "click",
    () => {
      resetTournament();
      render();
    },
  );
  document.querySelector<HTMLButtonElement>("#exportPdfButton")?.addEventListener(
    "click",
    () => exportRankingPdf(getTournament()),
  );
  document.querySelectorAll<HTMLButtonElement>(".save-button").forEach((button) => {
    button.addEventListener("click", () => {
      const roundIndex = Number(button.dataset.round);
      const tableIndex = Number(button.dataset.table);

      // Injeta funcoes de leitura/confirmacao para a action nao depender de seletores.
      saveTableScores(
        roundIndex,
        tableIndex,
        (seatIndex) =>
          document.querySelector<HTMLInputElement>(
            `#score_${roundIndex}_${tableIndex}_${seatIndex}`,
          )?.value ?? defaultScoreText(),
        (summary) =>
          window.confirm(`Confirmar resultados da Mesa ${tableIndex + 1}?\n${summary}`),
      );
      render();
    });
  });
  document.querySelectorAll<HTMLInputElement>(".player-row input").forEach((input) => {
    // Mantem o comportamento do projeto original: 30.000 some ao focar e volta se vazio.
    input.addEventListener("focus", () => {
      if (input.value === defaultScoreText()) {
        input.value = "";
      }
    });
    input.addEventListener("blur", () => {
      if (input.value.trim() === "") {
        input.value = defaultScoreText();
      }
    });
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^-0-9.,]/g, "");
    });
  });
}
