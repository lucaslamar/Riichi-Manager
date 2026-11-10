import { partesDoNome, type Jogador } from '@/dominios/jogadores/logica/jogadores'

/**
 * Apelido em destaque e o nome completo embaixo. Sem apelido, ou quando os dois
 * são iguais, só o nome (sem a segunda linha).
 */
export function nomesNoRanking(jogador: Pick<Jogador, 'nome' | 'apelido'> | undefined) {
  if (!jogador) return { principal: '—', apoio: undefined }
  const partes = partesDoNome(jogador)
  const apelido = jogador.apelido ?? partes.apoio
  const nome = partes.principal
  return apelido && apelido !== nome ? { principal: apelido, apoio: nome } : { principal: nome, apoio: undefined }
}
