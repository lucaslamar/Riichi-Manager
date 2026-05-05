import "./styles.css";
import { bindEvents } from "./app/events";
import { renderApp } from "./app/render";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Elemento #app nao encontrado.");
}

// Ponto de entrada do app: renderiza HTML e religamos eventos a cada re-render.
function render(): void {
  renderApp(app);
  bindEvents(render);
}

render();
