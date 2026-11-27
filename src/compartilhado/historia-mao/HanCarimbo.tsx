import { useEffect, useState, type CSSProperties } from 'react'
import {
  carregarFonteCarimbo,
  enderecoDoSvg,
  rotuloDoCarimbo,
  svgDoCarimbo,
  type DadosCarimbo,
} from './carimbo'

/**
 * Carimbo de borracha da mão grande, como imagem (o mesmo SVG da imagem
 * exportada). A posição e o tamanho vêm de fora (`posicao`); sem posição, não
 * aparece. Não recebe toques.
 */
export default function HanCarimbo({
  dados,
  tinta,
  fundo,
  posicao,
}: {
  dados: DadosCarimbo
  tinta: string
  fundo: string
  posicao: { x: number; y: number; lado: number } | null
}) {
  const [endereco, setEndereco] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    void carregarFonteCarimbo().then((fonteDados) => {
      if (ativo)
        setEndereco(enderecoDoSvg(svgDoCarimbo(dados, { tinta, fundo, fonteDados, lado: 200 })))
    })
    return () => {
      ativo = false
    }
  }, [dados, tinta, fundo])

  if (!endereco || !posicao) return null
  const estilo = {
    left: posicao.x,
    top: posicao.y,
    width: posicao.lado,
    height: posicao.lado,
  } satisfies CSSProperties
  return (
    <img
      className="historia-mao-carimbo"
      src={endereco}
      role="img"
      alt={rotuloDoCarimbo(dados)}
      draggable={false}
      style={estilo}
    />
  )
}
