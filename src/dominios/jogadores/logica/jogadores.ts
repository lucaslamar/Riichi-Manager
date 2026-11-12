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
  clube?: string
  criadoEm: string
  arquivado: boolean
  /** Estrela no seletor: aparece no grupo Favoritos, para achar mais rápido. */
  favorito?: boolean
  /** Pré-cadastrado de fábrica: sai sozinho quando a pessoa cadastra o primeiro jogador real. */
  isSeed?: boolean
}

const CRIADOS_EM = '2026-11-01T00:00:00.000Z'

const semente = (id: string, nome: string, apelido: string): Jogador => ({
  id: `seed-${id}`,
  nome,
  apelido,
  criadoEm: CRIADOS_EM,
  arquivado: false,
  isSeed: true,
})

/**
 * Cadastro de fábrica (o Clube do Tarot de Lord of the Mysteries), para a primeira
 * partida já ter com quem jogar. Some quando entra o primeiro jogador real.
 */
export const JOGADORES_PADRAO: readonly Jogador[] = [
  semente('klein', 'Klein Moretti', 'The Fool'),
  semente('audrey', 'Audrey Hall', 'Justice'),
  semente('alger', 'Alger Wilson', 'The Hanged Man'),
  semente('derrick', 'Derrick Berg', 'The Sun'),
  semente('fors', 'Fors Wall', 'The Magician'),
  semente('gehrman', 'Gehrman Sparrow', 'The World'),
  semente('xio', 'Xio Derecha', 'Judgment'),
  semente('cattleya', 'Cattleya', 'The Hermit'),
  semente('emlyn', 'Emlyn White', 'The Moon'),
  semente('leonard', 'Leonard Mitchell', 'The Star'),
]

/**
 * Primeiro jogador real cadastrado: os pré-cadastrados saem. Quem já jogou alguma
 * partida (ou está num torneio) fica, como jogador comum, para o histórico não perder ninguém.
 */
export function tirarPreCadastrados(jogadores: Jogador[], idsEmUso: ReadonlySet<string>): Jogador[] {
  if (!jogadores.some((jogador) => jogador.isSeed)) return jogadores
  return jogadores
    .filter((jogador) => !jogador.isSeed || idsEmUso.has(jogador.id))
    .map((jogador) => (jogador.isSeed ? { ...jogador, isSeed: undefined } : jogador))
}

export type ErroJogador = 'nomeVazio' | 'nomeDuplicado'

export type ResultadoJogador =
  | { ok: true; jogadores: Jogador[]; jogador: Jogador }
  | { ok: false; erro: ErroJogador }

export interface DadosJogador {
  nome: string
  apelido?: string
  clube?: string
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

/** Clubes já usados, sem repetir grafia e em ordem alfabética. */
export function clubesUsados(jogadores: readonly Jogador[]): string[] {
  const porForma = new Map<string, string>()
  for (const { clube } of jogadores) {
    if (clube && !porForma.has(normalizarTexto(clube))) porForma.set(normalizarTexto(clube), clube)
  }
  return [...porForma.values()].sort((a, b) => a.localeCompare(b))
}

/** "cerrado" vira "Cerrado" se esse clube já existe; não nascem dois iguais. */
function clubeComGrafiaExistente(jogadores: readonly Jogador[], texto: string): string {
  const limpo = limpar(texto)
  const forma = normalizarTexto(limpo)
  return clubesUsados(jogadores).find((clube) => normalizarTexto(clube) === forma) ?? limpo
}

/** Sugestões enquanto digita; some quando o texto já é o clube inteiro. */
export function sugerirClubes(jogadores: readonly Jogador[], texto: string): string[] {
  const forma = normalizarTexto(texto)
  if (!forma) return []
  return clubesUsados(jogadores).filter((clube) => {
    const candidato = normalizarTexto(clube)
    return candidato.includes(forma) && candidato !== forma
  })
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
  const clube = clubeComGrafiaExistente(jogadores, dados.clube ?? '')
  const jogador: Jogador = {
    id,
    nome: limpar(dados.nome),
    ...(apelido ? { apelido } : {}),
    ...(clube ? { clube } : {}),
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
  const clube = clubeComGrafiaExistente(jogadores, dados.clube ?? '')
  const jogador: Jogador = {
    id: atual.id,
    nome: limpar(dados.nome),
    ...(apelido ? { apelido } : {}),
    ...(clube ? { clube } : {}),
    criadoEm: atual.criadoEm,
    arquivado: atual.arquivado,
    ...(atual.favorito ? { favorito: true } : {}),
  }
  return {
    ok: true,
    jogadores: jogadores.map((item) => (item.id === id ? jogador : item)),
    jogador,
  }
}

export function removerJogador(jogadores: Jogador[], id: string): Jogador[] {
  return jogadores.filter((jogador) => jogador.id !== id)
}

export function definirArquivado(jogadores: Jogador[], id: string, arquivado: boolean): Jogador[] {
  return jogadores.map((jogador) => (jogador.id === id ? { ...jogador, arquivado } : jogador))
}

/** Para migrações: devolve o id de cada nome, cadastrando só quem ainda não existe. */
export function garantirPorNomes(
  jogadores: Jogador[],
  nomes: string[],
  gerarId: () => string,
  criadoEm: string,
): { jogadores: Jogador[]; ids: string[] } {
  let lista = jogadores
  const ids = nomes.map((nome) => {
    const procurado = normalizarTexto(nome)
    const existente = lista.find(
      (jogador) =>
        normalizarTexto(jogador.nome) === procurado ||
        normalizarTexto(jogador.apelido ?? '') === procurado,
    )
    if (existente) return existente.id
    const resultado = adicionarJogador(lista, { nome: nome.trim() || '?' }, gerarId(), criadoEm)
    if (!resultado.ok) return gerarId()
    lista = resultado.jogadores
    return resultado.jogador.id
  })
  return { jogadores: lista, ids }
}

/** Busca por nome, apelido ou clube, ignorando maiúsculas e acentos. */
export function buscarJogadores(jogadores: Jogador[], busca: string): Jogador[] {
  const procurado = normalizarTexto(busca)
  if (!procurado) return jogadores
  return jogadores.filter(
    (jogador) =>
      normalizarTexto(jogador.nome).includes(procurado) ||
      normalizarTexto(jogador.apelido ?? '').includes(procurado) ||
      normalizarTexto(jogador.clube ?? '').includes(procurado),
  )
}

export function ordenarJogadores(jogadores: Jogador[], idioma: string): Jogador[] {
  return [...jogadores].sort((a, b) => a.nome.localeCompare(b.nome, idioma))
}

/**
 * Duas linhas da lista: "Shigeru Akagi (Akagi)" vira o nome e, embaixo, o que está
 * entre parênteses. Sem parênteses, a linha de baixo é o apelido.
 */
export function partesDoNome(jogador: Pick<Jogador, 'nome' | 'apelido'>) {
  const partes = jogador.nome.match(/^(.+?)\s*\((.+)\)$/)
  return partes
    ? { principal: partes[1], apoio: partes[2] }
    : { principal: jogador.nome, apoio: jogador.apelido }
}

/** Segunda linha da lista: "Apelido · Clube", ou só o que existir. */
export function linhaDeApoio(jogador: Pick<Jogador, 'nome' | 'apelido' | 'clube'>) {
  return [partesDoNome(jogador).apoio, jogador.clube].filter(Boolean).join(' · ')
}

/** Como o jogador aparece na mesa: o apelido, se tiver. */
export function nomeExibido(jogador: Jogador) {
  return jogador.apelido ?? jogador.nome
}

/** Liga ou desliga a estrela de favorito. */
export function definirFavorito(jogadores: Jogador[], id: string, favorito: boolean): Jogador[] {
  return jogadores.map((jogador) => {
    if (jogador.id !== id) return jogador
    const resto = { ...jogador }
    delete resto.favorito
    return favorito ? { ...resto, favorito: true } : resto
  })
}

/**
 * Quem jogou por último: os ids das partidas mais recentes (pela data de fim
 * ou de início), sem repetir, até `limite`. Convidados (sem cadastro) ficam de fora.
 */
export function jogadoresRecentes(
  partidas: readonly {
    assentos: Record<0 | 1 | 2 | 3, { jogadorId: string }> | Partial<Record<number, { jogadorId: string }>>
    criadaEm: string
    finalizadaEm?: string
  }[],
  existe: (id: string) => boolean,
  limite = 5,
): string[] {
  const ordenadas = [...partidas].sort((uma, outra) =>
    (outra.finalizadaEm ?? outra.criadaEm).localeCompare(uma.finalizadaEm ?? uma.criadaEm),
  )
  const ids: string[] = []
  for (const partida of ordenadas) {
    for (const assento of Object.values(partida.assentos)) {
      const id = assento?.jogadorId
      if (id && !ids.includes(id) && existe(id)) ids.push(id)
      if (ids.length >= limite) return ids
    }
  }
  return ids
}
