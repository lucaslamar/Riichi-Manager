/**
 * Onde o app guarda dados entre aberturas. A lógica e os repositórios dependem
 * só desta interface: no React Native basta trocar `armazenamentoLocal` por uma
 * implementação com MMKV (síncrona, como esta).
 */
export interface ArmazenamentoChaveValor {
  ler(chave: string): string | null
  gravar(chave: string, valor: string): void
}

/** localStorage. Janela anônima ou cota cheia não derrubam a tela. */
export const armazenamentoLocal: ArmazenamentoChaveValor = {
  ler(chave) {
    try {
      return window.localStorage.getItem(chave)
    } catch {
      return null
    }
  },
  gravar(chave, valor) {
    try {
      window.localStorage.setItem(chave, valor)
    } catch (erro) {
      console.error(`Não foi possível salvar ${chave}`, erro)
    }
  },
}
