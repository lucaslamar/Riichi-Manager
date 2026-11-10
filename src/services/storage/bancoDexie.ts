/** Banco local da web: IndexedDB pelo Dexie. */
import Dexie, { type Table } from 'dexie'
import type { BancoDados, ConteudoBanco, MudancasPartidas } from './banco'
import type { DetalhesPartida, ResumoPartida } from './partidaArmazenada'

class BancoMojoca extends Dexie {
  chaves!: Table<{ chave: string; valor: string }, string>
  resumos!: Table<ResumoPartida, string>
  detalhes!: Table<DetalhesPartida, string>

  constructor(nome: string) {
    super(nome)
    // Índices: só o que se busca. `finalizadaEm` ordena o histórico e a poda.
    this.version(1).stores({
      chaves: 'chave',
      resumos: 'id, finalizadaEm, status',
      detalhes: 'id',
    })
  }
}

export function criarBancoDexie(nome = 'mojoca'): BancoDados {
  const banco = new BancoMojoca(nome)
  return {
    async lerTudo(): Promise<ConteudoBanco> {
      const [chaves, resumos, detalhes] = await Promise.all([
        banco.chaves.toArray(),
        banco.resumos.toArray(),
        banco.detalhes.toArray(),
      ])
      return { chaves: Object.fromEntries(chaves.map(({ chave, valor }) => [chave, valor])), resumos, detalhes }
    },
    async gravarChave(chave, valor) {
      await banco.chaves.put({ chave, valor })
    },
    async removerChave(chave) {
      await banco.chaves.delete(chave)
    },
    async gravarPartidas({ resumos, detalhes, remover, podar }: MudancasPartidas) {
      await banco.transaction('rw', banco.resumos, banco.detalhes, async () => {
        if (remover.length) {
          await banco.resumos.bulkDelete(remover)
          await banco.detalhes.bulkDelete(remover)
        }
        if (podar.length) await banco.detalhes.bulkDelete(podar)
        if (resumos.length) await banco.resumos.bulkPut(resumos)
        if (detalhes.length) await banco.detalhes.bulkPut(detalhes)
      })
    },
    async substituirTudo({ chaves, resumos, detalhes }) {
      await banco.transaction('rw', banco.chaves, banco.resumos, banco.detalhes, async () => {
        await Promise.all([banco.chaves.clear(), banco.resumos.clear(), banco.detalhes.clear()])
        await banco.chaves.bulkPut(Object.entries(chaves).map(([chave, valor]) => ({ chave, valor })))
        await banco.resumos.bulkPut(resumos)
        await banco.detalhes.bulkPut(detalhes)
      })
    },
  }
}
