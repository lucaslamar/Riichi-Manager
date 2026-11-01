/**
 * Regras do cadastro de jogadores, em TypeScript puro. Id e data vêm de quem
 * chama, para o código servir à web e ao React Native e dar para testar.
 *
 * Partidas e torneios guardam só o `id`: renomear aqui atualiza tudo, e arquivar
 * (em vez de apagar) mantém histórico e ranking inteiros.
 */
export interface Jogador {
  id: string
  nome: string
  apelido?: string
  criadoEm: string
  arquivado: boolean
}

export type ErroJogador = 'nomeVazio' | 'nomeDuplicado'

export type ResultadoJogador =
  | { ok: true; jogadores: Jogador[]; jogador: Jogador }
  | { ok: false; erro: ErroJogador }

export interface DadosJogador {
  nome: string
  apelido?: string
}

/** Tira espaços sobrando; o texto continua como a pessoa escreveu. */
function limpar(texto: string) {
  return texto.trim().replace(/\s+/g, ' ')
}

/** Forma de comparar: "José  Silva" e "jose silva" são o mesmo nome. */
export function normalizarTexto(texto: string) {
  return limpar(texto)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

/** Nome em uso por outro jogador, arquivado ou não: arquivado ainda aparece no histórico. */
function nomeEmUso(jogadores: Jogador[], nome: string, ignorarId?: string) {
  const procurado = normalizarTexto(nome)
  return jogadores.some(
    (jogador) => jogador.id !== ignorarId && normalizarTexto(jogador.nome) === procurado,
  )
}

function validar(jogadores: Jogador[], nome: string, ignorarId?: string): ErroJogador | null {
  if (!limpar(nome)) return 'nomeVazio'
  return nomeEmUso(jogadores, nome, ignorarId) ? 'nomeDuplicado' : null
}

export function adicionarJogador(
  jogadores: Jogador[],
  dados: DadosJogador,
  id: string,
  criadoEm: string,
): ResultadoJogador {
  const erro = validar(jogadores, dados.nome)
  if (erro) return { ok: false, erro }

  const apelido = limpar(dados.apelido ?? '')
  const jogador: Jogador = {
    id,
    nome: limpar(dados.nome),
    ...(apelido ? { apelido } : {}),
    criadoEm,
    arquivado: false,
  }
  return { ok: true, jogadores: [...jogadores, jogador], jogador }
}

export function editarJogador(
  jogadores: Jogador[],
  id: string,
  dados: DadosJogador,
): ResultadoJogador {
  const erro = validar(jogadores, dados.nome, id)
  if (erro) return { ok: false, erro }

  const atual = jogadores.find((jogador) => jogador.id === id)
  if (!atual) return { ok: false, erro: 'nomeVazio' }

  const apelido = limpar(dados.apelido ?? '')
  const jogador: Jogador = {
    id: atual.id,
    nome: limpar(dados.nome),
    ...(apelido ? { apelido } : {}),
    criadoEm: atual.criadoEm,
    arquivado: atual.arquivado,
  }
  return {
    ok: true,
    jogadores: jogadores.map((item) => (item.id === id ? jogador : item)),
    jogador,
  }
}

export function definirArquivado(jogadores: Jogador[], id: string, arquivado: boolean): Jogador[] {
  return jogadores.map((jogador) => (jogador.id === id ? { ...jogador, arquivado } : jogador))
}

/** Busca por nome ou apelido, ignorando maiúsculas e acentos. */
export function buscarJogadores(jogadores: Jogador[], busca: string): Jogador[] {
  const procurado = normalizarTexto(busca)
  if (!procurado) return jogadores
  return jogadores.filter(
    (jogador) =>
      normalizarTexto(jogador.nome).includes(procurado) ||
      normalizarTexto(jogador.apelido ?? '').includes(procurado),
  )
}

export function ordenarJogadores(jogadores: Jogador[], idioma: string): Jogador[] {
  return [...jogadores].sort((a, b) => a.nome.localeCompare(b.nome, idioma))
}

/** Como o jogador aparece na mesa: o apelido, se tiver. */
export function nomeExibido(jogador: Jogador) {
  return jogador.apelido ?? jogador.nome
}
