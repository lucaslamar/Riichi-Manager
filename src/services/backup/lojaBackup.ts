/**
 * Ponte entre o backup e o que o app guarda: lê tudo pelos repositórios e grava
 * pelos mesmos repositórios. No React Native, trocar o `armazenamento` (e os
 * repositórios, quando forem para SQLite) sem mexer em `backup.ts`.
 */
import type { ArmazenamentoChaveValor } from '@/compartilhado/persistencia/armazenamento'
import { carregarJogadores, salvarJogadores } from '@/dominios/jogadores/persistencia/repositorioJogadores'
import { salvarPartidas } from '@/dominios/centerpiece/persistencia/repositorioPartidas'
import { carregarClube, salvarClube } from '@/dominios/centerpiece/persistencia/repositorioClube'
import { carregarUltimaConfig, salvarUltimaConfig } from '@/dominios/centerpiece/persistencia/repositorioConfigMesa'
import {
  carregarRegrasRegistro,
  salvarRegrasRegistro,
  type RegrasRegistroSalvas,
} from '@/dominios/centerpiece/persistencia/repositorioRegrasRegistro'
import { salvarTorneios } from '@/dominios/torneio/persistencia/repositorioTorneios'
import { lerPartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import { lerTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import type { DadosBackup } from './backup'

/** Tudo o que vai no backup, como está agora neste aparelho. */
export function lerDadosLocais(armazenamento: ArmazenamentoChaveValor): DadosBackup {
  // Partidas e torneios pelas stores: elas já fizeram as migrações antigas.
  const torneios = lerTorneios()
  return {
    jogadores: carregarJogadores(armazenamento),
    partidas: [...lerPartidas()],
    torneios: torneios.torneios,
    temporadas: torneios.temporadas,
    listasTorneio: torneios.listas,
    clube: carregarClube(armazenamento),
    configMesa: carregarUltimaConfig(armazenamento),
    regrasRegistro: carregarRegrasRegistro(armazenamento),
  }
}

/**
 * Grava os dados no lugar dos atuais. As telas guardam cópias em memória, por
 * isso quem chama recarrega o app logo depois.
 */
export function gravarDados(armazenamento: ArmazenamentoChaveValor, dados: DadosBackup) {
  salvarJogadores(armazenamento, dados.jogadores)
  salvarPartidas(armazenamento, dados.partidas)
  salvarTorneios(armazenamento, {
    torneios: dados.torneios,
    temporadas: dados.temporadas,
    listas: dados.listasTorneio,
  })
  salvarClube(armazenamento, dados.clube)
  if (dados.configMesa) salvarUltimaConfig(armazenamento, dados.configMesa)
  if (dados.regrasRegistro) salvarRegrasRegistro(armazenamento, dados.regrasRegistro as RegrasRegistroSalvas)
}
