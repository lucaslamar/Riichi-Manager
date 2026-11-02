/**
 * Id único para registros salvos. `randomUUID` só existe em contexto seguro, e o
 * servidor de desenvolvimento aberto no celular pela rede local não é um.
 */
export function gerarId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}
