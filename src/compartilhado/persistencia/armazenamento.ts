/**
 * Onde o app guarda dados entre aberturas. A lógica e os repositórios dependem
 * só desta interface: no React Native basta trocar a implementação (SQLite para
 * os dados, MMKV para as preferências), síncrona como esta.
 */
export interface ArmazenamentoChaveValor {
  ler(chave: string): string | null
  gravar(chave: string, valor: string): void
  remover?(chave: string): void
}

/** localStorage puro. Janela anônima ou cota cheia não derrubam a tela. */
export const localStorageDireto: ArmazenamentoChaveValor = {
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
  remover(chave) {
    try {
      window.localStorage.removeItem(chave)
    } catch {
      // Sem acesso ao armazenamento não há o que limpar.
    }
  },
}

/**
 * Os dados (jogadores, partidas, torneios...) vão para o banco local quando ele
 * abre (`services/storage`); as preferências seguem no localStorage, que o
 * index.html lê antes do app para não piscar o tema.
 */
let dados: { armazenamento: ArmazenamentoChaveValor; chaves: ReadonlySet<string> } | null = null

export function definirArmazenamentoDeDados(armazenamento: ArmazenamentoChaveValor, chaves: ReadonlySet<string>) {
  dados = { armazenamento, chaves }
}

const destino = (chave: string) => (dados?.chaves.has(chave) ? dados.armazenamento : localStorageDireto)

/** O que o app usa: cada chave no lugar certo (banco local ou localStorage). */
export const armazenamentoLocal: ArmazenamentoChaveValor = {
  ler: (chave) => destino(chave).ler(chave),
  gravar: (chave, valor) => destino(chave).gravar(chave, valor),
  remover: (chave) => destino(chave).remover?.(chave),
}
