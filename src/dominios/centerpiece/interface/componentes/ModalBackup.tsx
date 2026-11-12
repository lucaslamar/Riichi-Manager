import { useRef, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { lerArquivoTexto, salvarArquivo, type ResultadoArquivo } from '@/compartilhado/adaptadores/arquivo'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import {
  mesclarBackup,
  montarBackup,
  nomeDoBackup,
  resumoBackup,
  sugerirMesmasPessoas,
  unificarJogadores,
  validarBackup,
  type ArquivoBackup,
  type ErroBackup,
} from '@/services/backup/backup'
import { gravarDados, lerDadosLocais } from '@/services/backup/lojaBackup'
import { aguardarGravacoes } from '@/services/storage/iniciarArmazenamento'
import { partesDoNome } from '@/dominios/jogadores/logica/jogadores'
import './backup.css'

type Etapa =
  | { nome: 'inicio'; aviso?: ResultadoArquivo; erro?: ErroBackup }
  | { nome: 'resumo'; backup: ArquivoBackup }
  | { nome: 'confirmarSubstituir'; backup: ArquivoBackup }

/**
 * Importar e exportar: leva jogadores, partidas, torneios, clube e configurações
 * de mesa para outro aparelho. Depois de importar, o app recarrega.
 */
export default function ModalBackup({ aoFechar }: { aoFechar: () => void }) {
  const { t, idioma } = useI18n()
  const [etapa, setEtapa] = useState<Etapa>({ nome: 'inicio' })
  /** Pessoas do backup que parecem ser alguém daqui, e quais delas juntar (id do backup). */
  const [pares, setPares] = useState<ReturnType<typeof sugerirMesmasPessoas>>([])
  const [juntar, setJuntar] = useState<ReadonlySet<string>>(new Set())
  const seletor = useRef<HTMLInputElement>(null)

  const exportar = async () => {
    const agora = new Date()
    const backup = montarBackup(lerDadosLocais(armazenamentoLocal), __VERSAO_APP__, agora)
    const aviso = await salvarArquivo(nomeDoBackup(agora), JSON.stringify(backup))
    setEtapa({ nome: 'inicio', aviso })
  }

  const escolherArquivo = async (arquivo: File | undefined) => {
    if (!arquivo) return
    const lido = validarBackup(await lerArquivoTexto(arquivo))
    if (!lido.ok) {
      setEtapa({ nome: 'inicio', erro: lido.erro })
      return
    }
    // Quem foi cadastrado nos dois aparelhos: sugerido para virar uma pessoa só.
    const sugestoes = sugerirMesmasPessoas(lerDadosLocais(armazenamentoLocal).jogadores, lido.backup.dados.jogadores)
    setPares(sugestoes)
    setJuntar(new Set(sugestoes.map((par) => par.vindo.id)))
    setEtapa({ nome: 'resumo', backup: lido.backup })
  }

  const importar = async (backup: ArquivoBackup, modo: 'mesclar' | 'substituir') => {
    const mapa = Object.fromEntries(
      pares.filter((par) => juntar.has(par.vindo.id)).map((par) => [par.vindo.id, par.local.id]),
    )
    const dados =
      modo === 'mesclar'
        ? mesclarBackup(lerDadosLocais(armazenamentoLocal), unificarJogadores(backup.dados, mapa))
        : backup.dados
    gravarDados(armazenamentoLocal, dados)
    // Espera chegar ao banco local e recarrega: assim todas as telas leem o que chegou.
    await aguardarGravacoes()
    window.location.reload()
  }

  const resumo = etapa.nome !== 'inicio' ? resumoBackup(etapa.backup.dados) : null
  const dataDoBackup =
    etapa.nome !== 'inicio'
      ? new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
          new Date(etapa.backup.exportadoEm),
        )
      : ''

  return (
    <Modal titulo={t('backup.title')} aoFechar={aoFechar} rotuloFechar={t('actions.close')} tamanho="pequena">
      <div className="bkp-corpo">
        {etapa.nome === 'inicio' && (
          <>
            <p className="bkp-ajuda">{t('backup.help')}</p>
            <button type="button" className="bkp-acao" onClick={exportar}>
              <i className="fas fa-file-export" aria-hidden="true" />
              <span>
                <strong>{t('backup.export')}</strong>
                <small>{t('backup.exportHelp')}</small>
              </span>
            </button>
            <button type="button" className="bkp-acao" onClick={() => seletor.current?.click()}>
              <i className="fas fa-file-import" aria-hidden="true" />
              <span>
                <strong>{t('backup.import')}</strong>
                <small>{t('backup.importHelp')}</small>
              </span>
            </button>
            <input
              ref={seletor}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(evento) => {
                void escolherArquivo(evento.target.files?.[0])
                evento.target.value = ''
              }}
            />
            {etapa.aviso && etapa.aviso !== 'cancelado' && (
              <p className={etapa.aviso === 'falhou' ? 'bkp-erro' : 'bkp-ok'} role="status">
                {t(`backup.result.${etapa.aviso}`)}
              </p>
            )}
            {etapa.erro && (
              <p className="bkp-erro" role="alert">
                {t(`backup.errors.${etapa.erro}`)}
              </p>
            )}
          </>
        )}

        {etapa.nome === 'resumo' && resumo && (
          <>
            <p className="bkp-ajuda">{t('backup.summary.from', { date: dataDoBackup })}</p>
            <ul className="bkp-resumo">
              <li>{t('backup.summary.players', { count: resumo.jogadores })}</li>
              <li>{t('backup.summary.games', { count: resumo.partidas })}</li>
              <li>{t('backup.summary.tournaments', { count: resumo.torneios })}</li>
            </ul>
            {pares.length > 0 && (
              <fieldset className="bkp-pares">
                <legend>{t('backup.samePerson.title')}</legend>
                <p className="bkp-ajuda bkp-ajuda--pequena">{t('backup.samePerson.help')}</p>
                {pares.map((par) => (
                  <label key={par.vindo.id} className="bkp-par">
                    <input
                      type="checkbox"
                      checked={juntar.has(par.vindo.id)}
                      onChange={(evento) => {
                        const proximo = new Set(juntar)
                        if (evento.target.checked) proximo.add(par.vindo.id)
                        else proximo.delete(par.vindo.id)
                        setJuntar(proximo)
                      }}
                    />
                    <span>
                      {t('backup.samePerson.pair', {
                        theirs: partesDoNome(par.vindo).principal,
                        ours: partesDoNome(par.local).principal,
                      })}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <button type="button" className="btn-primario bkp-botao" onClick={() => importar(etapa.backup, 'mesclar')}>
              {t('backup.merge')}
            </button>
            <p className="bkp-ajuda bkp-ajuda--pequena">{t('backup.mergeHelp')}</p>
            <button
              type="button"
              className="btn-contorno bkp-botao bkp-perigo"
              onClick={() => setEtapa({ nome: 'confirmarSubstituir', backup: etapa.backup })}
            >
              {t('backup.replace')}
            </button>
            <p className="bkp-ajuda bkp-ajuda--pequena">{t('backup.replaceHelp')}</p>
          </>
        )}

        {etapa.nome === 'confirmarSubstituir' && (
          <>
            <p className="bkp-erro" role="alert">
              {t('backup.replaceConfirm')}
            </p>
            <button
              type="button"
              className="btn-primario bkp-botao bkp-perigo-forte"
              onClick={() => importar(etapa.backup, 'substituir')}
            >
              {t('backup.replaceYes')}
            </button>
            <button
              type="button"
              className="btn-contorno bkp-botao"
              onClick={() => setEtapa({ nome: 'resumo', backup: etapa.backup })}
            >
              {t('actions.cancel')}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
