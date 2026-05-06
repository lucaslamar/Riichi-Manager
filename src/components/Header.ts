export function renderHeader(): string {
  return `
    <header class="main-header">
      <div class="header-content">
        <div class="mahjong-tile" aria-hidden="true">&#20013;</div>
        <div class="title-container">
          <span class="version-tag">v5.0.0</span>
          <h1 class="main-title">Riichi Manager</h1>
        </div>
      </div>
    </header>
  `;
}
