import { SECOES_GLOSSARIO } from '../../../logica/glossario'
import BlocoGlossario from '../glossario/BlocoGlossario'

/**
 * Glossário por assunto (pedras, formação da mão, chamadas, vitória, dora,
 * pontuação, mesa), um bloco por assunto. Os textos vêm de
 * `logica/glossario.ts`, a mesma fonte da tela de termo.
 */
export default function AbaGlossario() {
  return SECOES_GLOSSARIO.map((secao) => <BlocoGlossario key={secao.id} secao={secao} />)
}
