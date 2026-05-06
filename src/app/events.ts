import { exportRankingPdf } from "../tournament/pdf";
import { defaultScoreText } from "../utils/format";
import {
  adicionarCincoMinutosGlobais,
  adicionarCincoMinutosParaMesa,
  alterarDuracaoTimerRodada,
  alternarTimerRodada,
  refazerSorteio,
  resetTournament,
  reiniciarTimerRodada,
  saveTableScores,
  selecionarRodadaDoTimer,
  startTournament,
} from "./actions";
import { getTournament, hideQuickSetup, showQuickSetup } from "./state";

/**
 * Conecta os eventos do DOM ao codigo de regra do torneio.
 *
 * @param renderizar - Funcao que redesenha a tela depois de cada alteracao de estado.
 */
export function bindEvents(renderizar: () => void): void {
  document.querySelector<HTMLButtonElement>("#quickTournamentButton")?.addEventListener(
    "click",
    () => {
      showQuickSetup();
      renderizar();
    },
  );
  document.querySelector<HTMLButtonElement>("#backToHomeButton")?.addEventListener(
    "click",
    () => {
      hideQuickSetup();
      renderizar();
    },
  );
  document.querySelector<HTMLButtonElement>("#startButton")?.addEventListener(
    "click",
    () => {
      const campoJogadores = document.querySelector<HTMLTextAreaElement>("#playerList");
      const erroValidacao = startTournament(campoJogadores?.value ?? "");

      if (erroValidacao) {
        window.alert(erroValidacao);
        return;
      }

      hideQuickSetup();
      renderizar();
    },
  );
  document.querySelector<HTMLButtonElement>("#resetButton")?.addEventListener(
    "click",
    () => {
      resetTournament();
      hideQuickSetup();
      renderizar();
    },
  );
  document.querySelector<HTMLButtonElement>("#exportPdfButton")?.addEventListener(
    "click",
    () => exportRankingPdf(getTournament()),
  );
  document.querySelector<HTMLButtonElement>("#rerollScheduleButton")?.addEventListener(
    "click",
    () => {
      const confirmou = window.confirm(
        "Refazer o sorteio mantendo os mesmos nomes?\n" +
          "Isso apaga resultados, ranking e acrescimos da grade atual.",
      );

      if (!confirmou) {
        return;
      }

      refazerSorteio();
      renderizar();
    },
  );
  document.querySelector<HTMLButtonElement>("#toggleRoundTimerButton")?.addEventListener(
    "click",
    () => {
      alternarTimerRodada();
      renderizar();
    },
  );
  document.querySelector<HTMLButtonElement>("#addGlobalTimeButton")?.addEventListener(
    "click",
    () => {
      adicionarCincoMinutosGlobais();
      renderizar();
    },
  );
  document.querySelector<HTMLButtonElement>("#resetRoundTimerButton")?.addEventListener(
    "click",
    () => {
      reiniciarTimerRodada();
      renderizar();
    },
  );
  document.querySelector<HTMLSelectElement>("#roundTimerSelect")?.addEventListener(
    "change",
    (evento) => {
      const seletorRodada = evento.currentTarget as HTMLSelectElement;

      selecionarRodadaDoTimer(Number(seletorRodada.value));
      renderizar();
    },
  );
  document.querySelector<HTMLSelectElement>("#roundTimerDurationSelect")?.addEventListener(
    "change",
    (evento) => {
      const seletorDuracao = evento.currentTarget as HTMLSelectElement;

      alterarDuracaoTimerRodada(Number(seletorDuracao.value));
      renderizar();
    },
  );
  document.querySelectorAll<HTMLButtonElement>(".table-time-button").forEach((botao) => {
    botao.addEventListener("click", () => {
      const indiceRodada = Number(botao.dataset.round);
      const indiceMesa = Number(botao.dataset.table);

      adicionarCincoMinutosParaMesa(indiceRodada, indiceMesa);
      renderizar();
    });
  });
  document.querySelectorAll<HTMLButtonElement>(".save-button").forEach((botao) => {
    botao.addEventListener("click", () => {
      const indiceRodada = Number(botao.dataset.round);
      const indiceMesa = Number(botao.dataset.table);

      saveTableScores(
        indiceRodada,
        indiceMesa,
        (indiceAssento) =>
          document.querySelector<HTMLInputElement>(
            `#score_${indiceRodada}_${indiceMesa}_${indiceAssento}`,
          )?.value ?? defaultScoreText(),
        (resumo) =>
          window.confirm(`Confirmar resultados da Mesa ${indiceMesa + 1}?\n${resumo}`),
      );
      renderizar();
    });
  });
  document.querySelectorAll<HTMLInputElement>(".player-row input").forEach((campoPontuacao) => {
    campoPontuacao.addEventListener("focus", () => {
      if (campoPontuacao.value === defaultScoreText()) {
        campoPontuacao.value = "";
      }
    });
    campoPontuacao.addEventListener("blur", () => {
      if (campoPontuacao.value.trim() === "") {
        campoPontuacao.value = defaultScoreText();
      }
    });
    campoPontuacao.addEventListener("input", () => {
      campoPontuacao.value = campoPontuacao.value.replace(/[^-0-9.,]/g, "");
    });
  });
}
