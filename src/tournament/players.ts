export function normalizePlayerName(player: string): string {
  // Padroniza nomes como no projeto original: "lucas lamar" vira "Lucas Lamar".
  return player
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parsePlayers(rawPlayers: string): string[] {
  return rawPlayers
    .split(/\n|,/)
    .map(normalizePlayerName)
    .filter(Boolean);
}

export function validatePlayers(players: string[]): string | null {
  const uniquePlayers = new Set(players.map((player) => player.toLowerCase()));

  // O tamanho vem da lista digitada; mesas continuam sempre completas com 4 jogadores.
  if (players.length < 8 || players.length % 4 !== 0) {
    return `Erro: minimo 8 jogadores e o total deve ser multiplo de 4.\nQuantidade: ${players.length}`;
  }

  if (uniquePlayers.size !== players.length) {
    return "Existem nomes repetidos na lista de jogadores.";
  }

  return null;
}
