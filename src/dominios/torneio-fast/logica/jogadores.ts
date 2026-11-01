/**
 * @fileoverview Parsing e validação da lista de jogadores.
 *
 * O usuário cola nomes no textarea, um por linha (ou separados por vírgula).
 * Estas funções limpam, normalizam e validam essa entrada.
 */

/**
 * Normaliza um nome de jogador: remove espaços extras e aplica Title Case.
 * Ex.: "  lucas lamar  " → "Lucas Lamar"
 *
 * @param nome - Nome bruto digitado pelo usuário.
 * @returns Nome normalizado.
 */
export function normalizarNome(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}

/**
 * Converte o texto do textarea em um array de nomes normalizados.
 * Aceita quebras de linha ou vírgulas como separadores.
 *
 * @param textoRaw - Conteúdo bruto do textarea.
 * @returns Array de nomes válidos (sem vazios).
 */
export function parsearJogadores(textoRaw: string): string[] {
  return textoRaw.split(/\n|,/).map(normalizarNome).filter(Boolean) // remove strings vazias
}

/**
 * Valida a lista de jogadores e retorna uma mensagem de erro, ou `null` se OK.
 *
 * Regras:
 * - Mínimo 8 jogadores (para ter pelo menos 2 mesas).
 * - Total deve ser múltiplo de 4 (mesas completas).
 * - Nomes não podem se repetir.
 *
 * @param jogadores - Array de nomes já parseados.
 * @returns String de erro descritiva, ou `null` se a lista for válida.
 */
export function validarJogadores(jogadores: string[]): string | null {
  if (jogadores.length < 8 || jogadores.length % 4 !== 0) {
    return `Mínimo 8 jogadores e o total deve ser múltiplo de 4. Você digitou ${jogadores.length}.`
  }

  const unicos = new Set(jogadores.map((j) => j.toLowerCase()))
  if (unicos.size !== jogadores.length) {
    return 'Existem nomes repetidos na lista de jogadores.'
  }

  return null
}
