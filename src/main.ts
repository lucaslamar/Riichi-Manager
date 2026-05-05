import "./styles.css";
import { calcularSegundosRestantes, isTournamentActive, sincronizarTimerExpirado } from "./app/actions";
import { bindEvents } from "./app/events";
import { renderApp } from "./app/render";
import { getTournament } from "./app/state";

const elementoApp = document.querySelector<HTMLDivElement>("#app");

if (!elementoApp) {
  throw new Error("Elemento #app nao encontrado.");
}

const app: HTMLDivElement = elementoApp;

/** Redesenha o aplicativo inteiro e reconecta os eventos do DOM recriado. */
function renderizar(): void {
  renderApp(app);
  bindEvents(renderizar);
}

/** Mantem o cronometro visual atualizado enquanto ele estiver rodando. */
function atualizarTimerRodando(): void {
  const torneio = getTournament();

  if (!isTournamentActive(torneio) || !torneio.roundTimer.isRunning) {
    return;
  }

  if (calcularSegundosRestantes(torneio.roundTimer) <= 0) {
    sincronizarTimerExpirado();
  }

  renderizar();
}

renderizar();
window.setInterval(atualizarTimerRodando, 1000);
