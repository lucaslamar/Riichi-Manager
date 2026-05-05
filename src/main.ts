import { bindEvents } from "./app/events";
import { renderApp } from "./app/render";

const appEl = document.querySelector<HTMLDivElement>("#app");

if (!appEl) {
  throw new Error("Elemento #app nao encontrado.");
}

const app: HTMLDivElement = appEl;

function render(): void {
  renderApp(app);
  bindEvents(render);
}

render();