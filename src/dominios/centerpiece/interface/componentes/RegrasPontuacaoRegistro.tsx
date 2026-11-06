import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  CONJUNTOS_REGISTRO,
  conjuntoDasRegras,
  PRESETS_REGISTRO,
  regrasDoPreset,
  umaResumida,
  type ConjuntoRegistro,
  type RegrasPontuacao,
} from '../../logica/regrasPontuacao'
import { umaValida } from '../../logica/uma'
import BotoesOpcao from './BotoesOpcao'
import CampoUma, { CampoInteiro } from './CampoUma'
import EscolhaOka from './EscolhaOka'

/** "25.000 pontos · retorno 30.000 · uma 15/5", igual ao resumo da criação de mesa. */
function useResumo() {
  const { t, numero, idioma } = useI18n()
  return (regras: RegrasPontuacao) =>
    t('match.setup.rulesSummary', {
      start: numero(regras.pontosPartida),
      target: numero(regras.pontosRetorno),
      // No meio da frase: "uma flutuante".
      uma: umaResumida(regras.uma) ?? t('tableConfig.umaFloating').toLocaleLowerCase(idioma),
    })
}

/**
 * Regras de pontuação de "Registrar partida finalizada": só um card de resumo na
 * tela. Tocar abre a folha com o conjunto (Clube · EMA · WRC) e os campos. Mudou
 * qualquer valor, vira Personalizado. Só o que muda a pontuação final aparece aqui.
 */
export default function RegrasPontuacaoRegistro({
  conjunto,
  regras,
  aoSalvar,
  pontosAtuais,
}: {
  conjunto: ConjuntoRegistro
  regras: RegrasPontuacao
  aoSalvar: (conjunto: ConjuntoRegistro, regras: RegrasPontuacao) => void
  pontosAtuais?: readonly number[]
}) {
  const { t } = useI18n()
  const resumo = useResumo()
  const [editando, setEditando] = useState(false)
  const comOka = regras.pontosRetorno > regras.pontosPartida
  const nome = t(`match.manual.rulesets.${conjunto}`)

  return (
    <div className="cfg-campo reg-regras">
      <button
        type="button"
        className="ptd-resumo-regras reg-resumo"
        aria-label={`${t('match.manual.editRules')}: ${nome}, ${resumo(regras)}`}
        onClick={() => setEditando(true)}
      >
        <span>
          <strong>{nome}</strong>
          <span className="ptd-apoio">{resumo(regras)}</span>
          <span className="ptd-apoio">
            {t(comOka ? 'tableConfig.okaWith' : 'tableConfig.okaWithout')} ·{' '}
            {t(regras.uma.tipo === 'fixa' ? 'match.manual.umaFixedLine' : 'match.manual.umaFloatingLine')}
          </span>
        </span>
        <i className="fas fa-wrench" aria-hidden="true" />
      </button>

      {editando && (
        <FolhaRegras
          conjuntoInicial={conjunto}
          inicial={regras}
          pontosAtuais={pontosAtuais}
          aoFechar={() => setEditando(false)}
          aoSalvar={(novoConjunto, novas) => {
            aoSalvar(novoConjunto, novas)
            setEditando(false)
          }}
        />
      )}
    </div>
  )
}

/** Uma linha por conjunto, com os números lidos dos presets, e o que são oka e uma. */
function AjudaConjuntos() {
  const { t } = useI18n()
  const resumo = useResumo()
  return (
    <>
      <ul className="reg-ajuda-lista">
        {CONJUNTOS_REGISTRO.map((id) => (
          <li key={id}>
            <strong>{t(`match.manual.rulesets.${id}`)}:</strong> {t(`match.manual.rulesetsHelp.${id}`)}
            {id !== 'personalizado' && <span className="ptd-apoio"> ({resumo(regrasDoPreset(id))})</span>}
          </li>
        ))}
      </ul>
      <p>
        <strong>{t('tableConfig.okaLabel')}:</strong> {t('tableConfig.okaHelp')}
      </p>
      <p>
        <strong>{t('tableConfig.umaLabel')}:</strong> {t('tableConfig.umaHelp')}
      </p>
    </>
  )
}

/** Folha com o conjunto e os campos; nada muda até tocar em Salvar. */
function FolhaRegras({
  conjuntoInicial,
  inicial,
  pontosAtuais,
  aoFechar,
  aoSalvar,
}: {
  conjuntoInicial: ConjuntoRegistro
  inicial: RegrasPontuacao
  pontosAtuais?: readonly number[]
  aoFechar: () => void
  aoSalvar: (conjunto: ConjuntoRegistro, regras: RegrasPontuacao) => void
}) {
  const { t } = useI18n()
  const [rascunho, setRascunho] = useState(inicial)
  // O preset tocado por último: EMA e WRC têm os mesmos números, e um não vira o outro.
  const [tocado, setTocado] = useState<ConjuntoRegistro>(conjuntoInicial)
  const conjunto = conjuntoDasRegras(rascunho, tocado)
  const { pontosPartida, pontosRetorno, uma } = rascunho
  const mudar = (mudanca: Partial<RegrasPontuacao>) => setRascunho((atual) => ({ ...atual, ...mudanca }))

  return (
    <Modal
      titulo={t('match.manual.rulesTitle')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      className="reg-folha"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            className="btn-primario"
            disabled={!umaValida(uma)}
            onClick={() => aoSalvar(conjunto, rascunho)}
          >
            {t('players.save')}
          </button>
        </div>
      }
    >
      <div className="cfg-campo reg-regras">
        <span className="cfg-campo-rotulo">
          {t('tableConfig.preset')}
          <AjudaCampo rotulo={t('tableConfig.preset')}>
            <AjudaConjuntos />
          </AjudaCampo>
        </span>
        {/* Personalizado não é botão: nenhum fica marcado quando os valores são outros. */}
        <BotoesOpcao<ConjuntoRegistro>
          rotulo={t('tableConfig.preset')}
          valor={conjunto}
          aoEscolher={(id) => {
            setTocado(id)
            if (id !== 'personalizado') setRascunho(regrasDoPreset(id))
          }}
          className="reg-conjuntos"
          opcoes={PRESETS_REGISTRO.map((id) => ({ valor: id, rotulo: t(`match.manual.rulesets.${id}`) }))}
        />
        {conjunto === 'personalizado' && (
          <p className="cfg-ajuda reg-personalizado">{t('match.manual.customNote')}</p>
        )}
      </div>

      <div className="cfg-duas-colunas">
        <label className="cfg-campo">
          <span>{t('tableConfig.startPoints')}</span>
          <CampoInteiro
            rotulo={t('tableConfig.startPoints')}
            valor={pontosPartida}
            negativo={false}
            // Sem oka, o retorno acompanha a partida.
            aoMudar={(novo) =>
              mudar({ pontosPartida: novo, ...(pontosRetorno <= pontosPartida ? { pontosRetorno: novo } : {}) })
            }
          />
        </label>
        {pontosRetorno > pontosPartida && (
          <label className="cfg-campo">
            <span>{t('tableConfig.returnPoints')}</span>
            <CampoInteiro
              rotulo={t('tableConfig.returnPoints')}
              valor={pontosRetorno}
              negativo={false}
              aoMudar={(novo) => mudar({ pontosRetorno: novo })}
            />
          </label>
        )}
      </div>
      <EscolhaOka
        pontosPartida={pontosPartida}
        pontosRetorno={pontosRetorno}
        aoMudarRetorno={(novo) => mudar({ pontosRetorno: novo })}
      />
      <CampoUma
        // Trocar de preset troca a uma por fora: o campo recomeça com ela.
        key={tocado}
        valor={uma}
        aoMudar={(novo) => mudar({ uma: novo })}
        pontosRetorno={pontosRetorno}
        pontosAtuais={pontosAtuais}
      />
    </Modal>
  )
}
