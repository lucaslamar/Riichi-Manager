import { useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import BotoesOpcao from '@/dominios/centerpiece/interface/componentes/BotoesOpcao'
import ConfigMesaSheet from '@/dominios/centerpiece/interface/componentes/ConfigMesaSheet'
import { formatoValido, lerCortes, OPCOES_TIMER_RODADA } from '../../logica/configuracao'
import { formatoPadrao } from '../../logica/torneio'
import type { ConfigFormato, FormatoTorneio, Torneio } from '../../logica/tipos'
import '../torneio.css'

const FORMATOS: readonly FormatoTorneio[] = ['rodizio', 'suico', 'eliminatorio', 'corridos', 'temporada']
const RODADAS: readonly number[] = [2, 3, 4, 5, 6, 8]

/**
 * Engrenagem da Lista do torneio: a folha das Configurações de mesa com a aba
 * Torneio na frente (nome, formato e tempo). Nada muda no torneio até Salvar.
 */
export default function ConfigTorneioSheet({
  torneio,
  jogadores,
  aoSalvar,
  aoFechar,
}: {
  torneio: Torneio
  /** Quantos estão na lista agora, para conferir os cortes. */
  jogadores: number
  aoSalvar: (torneio: Torneio) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [nome, setNome] = useState(torneio.nome)
  const [formato, setFormato] = useState<ConfigFormato>(torneio.formato)
  const [timers, setTimers] = useState(torneio.timers)
  const minutos = Math.round(timers.rodadaSegundos / 60)
  const personalizado = !OPCOES_TIMER_RODADA.some((segundos) => segundos === timers.rodadaSegundos)

  const abaTorneio = (
    <>
      <Campo rotulo={t('tournament.settings.name')}>
        <input
          className="trn-campo"
          value={nome}
          maxLength={60}
          onChange={(evento) => setNome(evento.target.value)}
        />
      </Campo>

      <Grupo rotulo={t('tournament.settings.format')}>
        <div className="trn-formatos" role="radiogroup" aria-label={t('tournament.settings.format')}>
          {FORMATOS.map((tipo) => (
            <button
              key={tipo}
              type="button"
              role="radio"
              aria-checked={formato.tipo === tipo}
              className={`trn-formato${formato.tipo === tipo ? ' ativo' : ''}`}
              onClick={() => formato.tipo !== tipo && setFormato(formatoPadrao(tipo))}
            >
              <strong>{t(`tournament.formats.${tipo}`)}</strong>
              <span>{t(`tournament.formatHelp.${tipo}`)}</span>
            </button>
          ))}
        </div>
      </Grupo>

      <OpcoesFormato key={formato.tipo} formato={formato} jogadores={jogadores} aoMudar={setFormato} />

      <p className="cfg-ajuda">{t('tournament.settings.multipleOfFour')}</p>
    </>
  )

  const secaoTempo = (
    <>
      <h3 className="cfg-grupo">{t('tournament.settings.tabTime')}</h3>
      <Grupo rotulo={t('tournament.settings.roundTimer')}>
        <BotoesOpcao<number>
          rotulo={t('tournament.settings.roundTimer')}
          valor={personalizado ? -1 : timers.rodadaSegundos}
          aoEscolher={(valor) =>
            setTimers({ ...timers, rodadaSegundos: valor === -1 ? timers.rodadaSegundos + 15 * 60 : valor })
          }
          opcoes={[
            ...OPCOES_TIMER_RODADA.map((segundos) => ({
              valor: segundos,
              rotulo: t(`tournament.settings.timer${segundos / 60}`),
            })),
            { valor: -1, rotulo: t('tournament.settings.custom') },
          ]}
        />
      </Grupo>
      {personalizado && (
        <Campo rotulo={t('tournament.settings.minutes')}>
          <input
            className="trn-campo"
            type="number"
            inputMode="numeric"
            min={10}
            max={600}
            step={5}
            value={minutos}
            onChange={(evento) => {
              const valor = Number(evento.target.value)
              if (valor > 0) setTimers({ ...timers, rodadaSegundos: valor * 60 })
            }}
          />
        </Campo>
      )}

      <Grupo rotulo={t('tournament.settings.tableTimer')}>
        <BotoesOpcao<'sim' | 'nao'>
          rotulo={t('tournament.settings.tableTimer')}
          valor={timers.porMesa ? 'sim' : 'nao'}
          aoEscolher={(valor) => setTimers({ ...timers, porMesa: valor === 'sim' })}
          opcoes={[
            { valor: 'nao', rotulo: t('tournament.settings.off') },
            { valor: 'sim', rotulo: t('tournament.settings.on') },
          ]}
        />
      </Grupo>
      <p className="cfg-ajuda">{t('tournament.settings.tableTimerHelp')}</p>
      <p className="cfg-ajuda">{t('tournament.settings.timeUpHelp')}</p>
      <p className="cfg-ajuda">{t('tournament.settings.turnTimerHelp')}</p>
    </>
  )

  const cortesValidos = formatoValido(formato, jogadores >= 8 ? jogadores : undefined)

  return (
    <ConfigMesaSheet
      titulo={t('tournament.settings.title')}
      inicial={torneio.config}
      rodapeSalvar
      podeConcluir={cortesValidos}
      abasExtras={[
        {
          id: 'torneio',
          rotulo: t('tournament.settings.tabTournament'),
          conteudo: (
            <>
              {abaTorneio}
              {secaoTempo}
            </>
          ),
        },
      ]}
      aoFechar={aoFechar}
      aoConcluir={(config) => {
        if (!cortesValidos) return
        aoSalvar({ ...torneio, nome: nome.trim() || torneio.nome, formato, timers, config })
      }}
    />
  )
}

/** As opções do formato escolhido, logo abaixo dele. */
function OpcoesFormato({
  formato,
  jogadores,
  aoMudar,
}: {
  formato: ConfigFormato
  jogadores: number
  aoMudar: (formato: ConfigFormato) => void
}) {
  const { t } = useI18n()
  const [textoCortes, setTextoCortes] = useState(
    formato.tipo === 'eliminatorio' ? formato.cortes.join(', ') : '',
  )
  const opcoesRodadas = RODADAS.map((numero) => ({ valor: numero, rotulo: String(numero) }))

  if (formato.tipo === 'rodizio') {
    return <p className="cfg-ajuda">{t('tournament.settings.rotationRounds', { count: formato.rodadas })}</p>
  }
  if (formato.tipo === 'suico') {
    return (
      <Grupo rotulo={t('tournament.settings.rounds')}>
        <BotoesOpcao<number>
          rotulo={t('tournament.settings.rounds')}
          valor={formato.rodadas}
          aoEscolher={(rodadas) => aoMudar({ ...formato, rodadas })}
          opcoes={opcoesRodadas}
        />
      </Grupo>
    )
  }
  if (formato.tipo === 'eliminatorio') {
    const cortes = lerCortes(textoCortes, jogadores >= 8 ? jogadores : undefined)
    return (
      <>
        <Grupo rotulo={t('tournament.settings.qualifier')}>
          <BotoesOpcao<'rodizio' | 'suico'>
            rotulo={t('tournament.settings.qualifier')}
            valor={formato.classificatoria}
            aoEscolher={(classificatoria) => aoMudar({ ...formato, classificatoria })}
            opcoes={[
              { valor: 'rodizio', rotulo: t('tournament.formats.rodizio') },
              { valor: 'suico', rotulo: t('tournament.formats.suico') },
            ]}
          />
        </Grupo>
        <Grupo rotulo={t('tournament.settings.qualifierRounds')}>
          <BotoesOpcao<number>
            rotulo={t('tournament.settings.qualifierRounds')}
            valor={formato.rodadasClassificatoria}
            aoEscolher={(rodadasClassificatoria) => aoMudar({ ...formato, rodadasClassificatoria })}
            opcoes={opcoesRodadas}
          />
        </Grupo>
        <Campo rotulo={t('tournament.settings.cuts')}>
          <input
            className={`trn-campo${cortes ? '' : ' trn-campo--erro'}`}
            value={textoCortes}
            inputMode="numeric"
            placeholder="8, 4"
            aria-invalid={!cortes}
            onChange={(evento) => {
              setTextoCortes(evento.target.value)
              const lidos = lerCortes(evento.target.value, jogadores >= 8 ? jogadores : undefined)
              aoMudar({ ...formato, cortes: lidos ?? [] })
            }}
          />
        </Campo>
        <p className={`cfg-ajuda${cortes ? '' : ' trn-erro'}`}>{t('tournament.settings.cutsHelp')}</p>
        <Grupo rotulo={t('tournament.settings.roundsPerPhase')}>
          <BotoesOpcao<number>
            rotulo={t('tournament.settings.roundsPerPhase')}
            valor={formato.rodadasPorFase}
            aoEscolher={(rodadasPorFase) => aoMudar({ ...formato, rodadasPorFase })}
            opcoes={[1, 2, 3].map((numero) => ({ valor: numero, rotulo: String(numero) }))}
          />
        </Grupo>
        <Grupo rotulo={t('tournament.settings.carryPoints')}>
          <BotoesOpcao<'sim' | 'nao'>
            rotulo={t('tournament.settings.carryPoints')}
            valor={formato.pontosCarregados ? 'sim' : 'nao'}
            aoEscolher={(valor) => aoMudar({ ...formato, pontosCarregados: valor === 'sim' })}
            opcoes={[
              { valor: 'sim', rotulo: t('tournament.settings.carry') },
              { valor: 'nao', rotulo: t('tournament.settings.reset') },
            ]}
          />
        </Grupo>
      </>
    )
  }
  return null
}

function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <label className="cfg-campo">
      <span className="cfg-campo-rotulo">{rotulo}</span>
      {children}
    </label>
  )
}

function Grupo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="cfg-campo">
      <span className="cfg-campo-rotulo">{rotulo}</span>
      {children}
    </div>
  )
}
