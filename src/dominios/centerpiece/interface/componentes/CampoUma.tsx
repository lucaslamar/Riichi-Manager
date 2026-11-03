import { useEffect, useState } from 'react'
import { ehIos } from '@/compartilhado/adaptadores/instalacao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import BotoesOpcao from './BotoesOpcao'
import {
  ehSimetrica,
  linhaDaContagem,
  LINHAS_FLUTUANTE,
  linhaUmaValida,
  TABELA_FLUTUANTE_EXEMPLO,
  umaSimetrica,
  umaValida,
  type LinhaUmaFlutuante,
  type UmaMesa,
  type ValoresUma,
} from '../../logica/uma'

const CHAVE_LUGAR = ['tableConfig.uma1', 'tableConfig.uma2', 'tableConfig.uma3', 'tableConfig.uma4']
const CHAVE_LINHA: Record<LinhaUmaFlutuante, string> = {
  nenhum: 'tableConfig.umaFloatNone',
  um: 'tableConfig.umaFloatOne',
  dois: 'tableConfig.umaFloatTwo',
  tres: 'tableConfig.umaFloatThree',
}

/**
 * Teclado de campo que aceita negativo. No iPhone, `decimal` abre um teclado sem a
 * tecla de menos; `numeric` sem `pattern` abre o de números e pontuação, que tem.
 */
export const TECLADO_COM_SINAL = ehIos() ? 'numeric' : 'decimal'

/** Número com texto próprio: dá para apagar tudo ou começar pelo sinal de menos. */
export function CampoInteiro({
  rotulo,
  valor,
  aoMudar,
  negativo = true,
  invalido = false,
}: {
  rotulo: string
  valor: number
  aoMudar: (valor: number) => void
  negativo?: boolean
  invalido?: boolean
}) {
  const [texto, setTexto] = useState(String(valor))

  useEffect(() => {
    if (Number(texto) !== valor || texto.trim() === '') setTexto(String(valor))
    // Só reage ao valor vindo de fora; o texto em edição é da pessoa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  const mudar = (digitado: string) => {
    const limpo = digitado.replace(',', '.').replace(negativo ? /[^\d.-]/g : /[^\d.]/g, '')
    setTexto(limpo)
    const novo = Number(limpo)
    if (limpo !== '' && limpo !== '-' && Number.isFinite(novo) && novo !== valor) aoMudar(novo)
  }

  return (
    <div className="fin-campo">
      <input
        className="cfg-entrada"
        type="text"
        inputMode={TECLADO_COM_SINAL}
        aria-label={rotulo}
        aria-invalid={invalido || undefined}
        autoComplete="off"
        value={texto}
        onChange={(evento) => mudar(evento.target.value)}
        onBlur={() => setTexto(String(valor))}
      />
    </div>
  )
}

/**
 * A uma da mesa, igual nas Configurações de mesa e em Registrar partida: fixa em
 * dois campos ("5-15"), fixa em quatro (Personalizar) ou tabela flutuante.
 */
export default function CampoUma({
  valor,
  aoMudar,
  pontosRetorno,
  pontosAtuais,
}: {
  valor: UmaMesa
  aoMudar: (uma: UmaMesa) => void
  pontosRetorno: number
  /** Com os 4 pontos já digitados, a ajuda diz qual linha da flutuante vale. */
  pontosAtuais?: readonly number[]
}) {
  const { t, numero } = useI18n()
  const [personalizar, setPersonalizar] = useState(
    () => valor.tipo === 'fixa' && !ehSimetrica(valor.valores),
  )
  // Última de cada tipo: alternar entre elas não perde o que foi digitado.
  const [ultimaFixa, setUltimaFixa] = useState<ValoresUma>(
    valor.tipo === 'fixa' ? valor.valores : [15, 5, -5, -15],
  )
  const [ultimaTabela, setUltimaTabela] = useState(
    valor.tipo === 'flutuante' ? valor.tabela : TABELA_FLUTUANTE_EXEMPLO,
  )
  const comSinal = (numeroUma: number) => (numeroUma > 0 ? `+${numero(numeroUma)}` : numero(numeroUma))

  const mudarFixa = (valores: ValoresUma) => {
    setUltimaFixa(valores)
    aoMudar({ tipo: 'fixa', valores })
  }

  // Preset trocado por fora: uma assimétrica precisa dos 4 campos.
  const assimetrica = valor.tipo === 'fixa' && !ehSimetrica(valor.valores)
  const quatroCampos = personalizar || assimetrica

  return (
    <fieldset className="cfg-conjunto">
      <legend className="cfg-legenda-com-botao">
        {t('tableConfig.uma')}
        <AjudaCampo rotulo={t('tableConfig.umaLabel')}>
          <p>{t('tableConfig.umaHelp')}</p>
          <p>{t('tableConfig.umaFloatHelp')}</p>
          {valor.tipo === 'flutuante' && pontosAtuais && (
            <p>
              {t('tableConfig.umaFloatCurrent', {
                line: t(CHAVE_LINHA[linhaDaContagem(pontosAtuais, pontosRetorno)]),
              })}
            </p>
          )}
        </AjudaCampo>
      </legend>

      <BotoesOpcao
        rotulo={t('tableConfig.umaLabel')}
        valor={valor.tipo}
        aoEscolher={(tipo) =>
          aoMudar(
            tipo === 'fixa' ? { tipo: 'fixa', valores: ultimaFixa } : { tipo: 'flutuante', tabela: ultimaTabela },
          )
        }
        opcoes={[
          { valor: 'fixa', rotulo: t('tableConfig.umaFixed') },
          { valor: 'flutuante', rotulo: t('tableConfig.umaFloating') },
        ]}
      />

      {valor.tipo === 'fixa' && !quatroCampos && (
        <div className="cfg-duas-colunas">
          <label className="cfg-campo">
            <span>{t('tableConfig.uma23')}</span>
            <CampoInteiro
              rotulo={t('tableConfig.uma23')}
              valor={valor.valores[1]}
              negativo={false}
              aoMudar={(novo) => mudarFixa(umaSimetrica(novo, valor.valores[0]))}
            />
          </label>
          <label className="cfg-campo">
            <span>{t('tableConfig.uma14')}</span>
            <CampoInteiro
              rotulo={t('tableConfig.uma14')}
              valor={valor.valores[0]}
              negativo={false}
              aoMudar={(novo) => mudarFixa(umaSimetrica(valor.valores[1], novo))}
            />
          </label>
        </div>
      )}

      {valor.tipo === 'fixa' && quatroCampos && (
        <div className="cfg-uma">
          {valor.valores.map((numeroUma, indice) => (
            <label key={CHAVE_LUGAR[indice]} className="cfg-campo">
              <span>{t(CHAVE_LUGAR[indice])}</span>
              <CampoInteiro
                rotulo={`${t('tableConfig.umaLabel')} ${t(CHAVE_LUGAR[indice])}`}
                valor={numeroUma}
                aoMudar={(novo) => {
                  const valores = [...valor.valores] as ValoresUma
                  valores[indice] = novo
                  mudarFixa(valores)
                }}
              />
            </label>
          ))}
        </div>
      )}

      {valor.tipo === 'fixa' && (
        <>
          <p className="cfg-ajuda cfg-uma-resumo">
            {valor.valores
              .map((numeroUma, indice) => `${t(CHAVE_LUGAR[indice])} ${comSinal(numeroUma)}`)
              .join(' · ')}
          </p>
          {!assimetrica && (
            <button
              type="button"
              className="cfg-link"
              aria-pressed={personalizar}
              onClick={() => setPersonalizar((atual) => !atual)}
            >
              {t(personalizar ? 'tableConfig.umaSimple' : 'tableConfig.umaCustomize')}
            </button>
          )}
        </>
      )}

      {valor.tipo === 'flutuante' && (
        <>
          <div className="cfg-uma-tabela">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">{t('tableConfig.umaFloatCondition')}</span>
                  </th>
                  {CHAVE_LUGAR.map((chave) => (
                    <th key={chave} scope="col">
                      {t(chave)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LINHAS_FLUTUANTE.map((linha) => {
                  const invalida = !linhaUmaValida(valor.tabela[linha])
                  return (
                    <tr key={linha} className={invalida ? 'cfg-uma-linha-invalida' : undefined}>
                      <th scope="row">{t(CHAVE_LINHA[linha])}</th>
                      {valor.tabela[linha].map((numeroUma, indice) => (
                        <td key={CHAVE_LUGAR[indice]}>
                          <CampoInteiro
                            rotulo={`${t(CHAVE_LINHA[linha])}, ${t(CHAVE_LUGAR[indice])}`}
                            valor={numeroUma}
                            invalido={invalida}
                            aoMudar={(novo) => {
                              const valores = [...valor.tabela[linha]] as ValoresUma
                              valores[indice] = novo
                              const tabela = { ...valor.tabela, [linha]: valores }
                              setUltimaTabela(tabela)
                              aoMudar({ tipo: 'flutuante', tabela })
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="cfg-ajuda">{t('tableConfig.umaFloatNote')}</p>
        </>
      )}

      {!umaValida(valor) && (
        <p className="cfg-aviso" role="status">
          <i className="fas fa-triangle-exclamation" aria-hidden="true" />
          {t('tableConfig.umaInvalid')}
        </p>
      )}
    </fieldset>
  )
}
