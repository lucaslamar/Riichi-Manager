/**
 * Interface do banco local. A web usa Dexie (IndexedDB, `bancoDexie.ts`); no
 * React Native, basta outra implementação com expo-sqlite, sem mexer no resto.
 */
import type { DetalhesPartida, ResumoPartida } from './partidaArmazenada'

export interface ConteudoBanco {
  /** Chaves e valores (jogadores, torneios, clube, configurações...). */
  chaves: Record<string, string>
  resumos: ResumoPartida[]
  detalhes: DetalhesPartida[]
}

export interface MudancasPartidas {
  resumos: ResumoPartida[]
  detalhes: DetalhesPartida[]
  /** Partidas apagadas: some o resumo e os detalhes. */
  remover: string[]
  /** Partidas que só perdem os detalhes. */
  podar: string[]
}

export interface BancoDados {
  lerTudo(): Promise<ConteudoBanco>
  gravarChave(chave: string, valor: string): Promise<void>
  removerChave(chave: string): Promise<void>
  gravarPartidas(mudancas: MudancasPartidas): Promise<void>
  /** Tudo de uma vez numa transação só (migração e importação). */
  substituirTudo(conteudo: ConteudoBanco): Promise<void>
}
