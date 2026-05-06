import type { AppScreen } from "../app/state";

type PlaceholderContent = {
  title: string;
  icon: string;
  description: string;
  bullets: string[];
};

const PLACEHOLDER_BY_SCREEN: Partial<Record<AppScreen, PlaceholderContent>> = {
  swiss: {
    title: "Sistema suico",
    icon: "fa-trophy",
    description:
      "Modo competitivo por rodadas progressivas: primeira rodada aleatoria e proximas por ranking, sem mostrar confrontos futuros antes dos resultados.",
    bullets: [
      "Configurar nomes e quantidade de rodadas.",
      "Gerar apenas a rodada atual e parear melhores contra melhores.",
      "Exportar/importar checkpoint JSON para torneios de varios dias.",
    ],
  },
  calculator: {
    title: "Calculadora de mao",
    icon: "fa-calculator",
    description:
      "Ferramenta para contar han/fu e ajudar jogadores do clube a conferirem pontuacao.",
    bullets: [
      "Entrada rapida por han e fu.",
      "Atalho para ron/tsumo e dealer/non-dealer.",
      "Base para evoluir para calculo guiado por yaku.",
    ],
  },
  handValidator: {
    title: "Validador de mao",
    icon: "fa-check-circle",
    description:
      "Espaco para montar uma mao e ver possibilidades de agari/yaku, focado em aprendizado.",
    bullets: [
      "Selecionar tiles da mao e chamada aberta/fechada.",
      "Listar esperas e yakus possiveis.",
      "Ajudar iniciantes a aprender leitura de mao.",
    ],
  },
  yakuReference: {
    title: "Referencia de yaku",
    icon: "fa-book",
    description:
      "Biblioteca de consulta para yaku, exemplos e regras usadas nos encontros do clube.",
    bullets: [
      "Lista de yaku por categoria e dificuldade.",
      "Exemplos visuais de maos validas.",
      "Links entre referencia, validador e calculadora.",
    ],
  },
};

/**
 * Renderiza uma tela padrao para modulos ainda em construcao.
 *
 * @param screen - Identificador do modulo selecionado no menu inicial.
 * @returns HTML da tela placeholder reutilizavel.
 */
export function renderFeaturePlaceholder(screen: AppScreen): string {
  const content = PLACEHOLDER_BY_SCREEN[screen];

  if (!content) {
    return "";
  }

  return `
    <section class="card feature-placeholder" aria-label="${content.title}">
      <div class="feature-placeholder-icon" aria-hidden="true">
        <i class="fas ${content.icon}"></i>
      </div>
      <div class="feature-placeholder-copy">
        <span class="home-menu-kicker">Modulo em desenho</span>
        <h2>${content.title}</h2>
        <p>${content.description}</p>
      </div>
      <ul class="home-menu-notes feature-placeholder-list">
        ${content.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
      </ul>
      <div class="actions feature-placeholder-actions">
        <button class="btn-outline home-back-button" type="button">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar ao menu
        </button>
      </div>
    </section>
  `;
}
