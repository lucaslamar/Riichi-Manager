import type { ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'

/*
 * Diagramas do tutorial do MCR: muro de 18 pilhas, abertura e distribuição.
 * Em `currentColor` e no papel do guia, então seguem o tema.
 */

const PAPEL = 'var(--guia-papel)'
const DESTAQUE = 'var(--cor-destaque, #e06ab0)'
const PILHAS = Array.from({ length: 18 }, (_, indice) => indice)

function Quadro({ altura, alt, children }: { altura: number; alt: string; children: ReactNode }) {
  return (
    <svg
      className="guia-ilustracao__svg"
      viewBox={`0 0 320 ${altura}`}
      role="img"
      aria-label={alt}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinejoin="round"
    >
      <rect x={2} y={2} width={316} height={altura - 4} rx={6} fill={PAPEL} strokeWidth={2.4} />
      {children}
    </svg>
  )
}

function Rotulo({
  x,
  y,
  children,
  destaque = false,
}: {
  x: number
  y: number
  children: ReactNode
  destaque?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      fill={destaque ? DESTAQUE : 'currentColor'}
      stroke="none"
      fontSize={13}
      fontWeight={700}
      textAnchor="middle"
    >
      {children}
    </text>
  )
}

function Seta({ de, ate }: { de: [number, number]; ate: [number, number] }) {
  const angulo = Math.atan2(ate[1] - de[1], ate[0] - de[0])
  const ponta = (lado: number) =>
    `${ate[0] - 9 * Math.cos(angulo + lado)} ${ate[1] - 9 * Math.sin(angulo + lado)}`
  return (
    <path
      d={`M${de.join(' ')}L${ate.join(' ')}M${ponta(0.5)}L${ate.join(' ')}L${ponta(-0.5)}`}
      stroke={DESTAQUE}
      strokeWidth={2.2}
    />
  )
}

function Embaralhar({ alt }: { alt: string }) {
  const { t } = useI18n()
  return (
    <Quadro altura={160} alt={alt}>
      {Array.from({ length: 40 }, (_, indice) => {
        const x = 70 + (indice % 10) * 18 + ((indice * 7) % 5)
        const y = 22 + Math.floor(indice / 10) * 25 + ((indice * 11) % 7)
        return (
          <rect
            key={indice}
            x={x}
            y={y}
            width={14}
            height={19}
            rx={2}
            fill={PAPEL}
            transform={`rotate(${((indice * 37) % 60) - 30} ${x + 7} ${y + 9})`}
          />
        )
      })}
      <Seta de={[40, 105]} ate={[40, 45]} />
      <Seta de={[282, 45]} ate={[282, 105]} />
      <Rotulo x={160} y={148}>
        {t('tutorial.mcr.diagrama.viradas')}
      </Rotulo>
    </Quadro>
  )
}

function Pilhas({ alt }: { alt: string }) {
  const { t } = useI18n()
  return (
    <Quadro altura={118} alt={alt}>
      {PILHAS.map((indice) =>
        [0, 1].map((andar) => (
          <rect
            key={`${indice}-${andar}`}
            x={16 + indice * 16}
            y={42 + andar * 17}
            width={14}
            height={15}
            rx={2}
            fill={PAPEL}
          />
        )),
      )}
      <Rotulo x={160} y={28} destaque>
        {t('tutorial.mcr.diagrama.pilhas')}
      </Rotulo>
      <Rotulo x={160} y={101}>
        {t('tutorial.mcr.diagrama.porPilha')}
      </Rotulo>
    </Quadro>
  )
}

// Vista de cima: 18 pilhas por lado, formando um quadrado.
const INICIO = 52
const PASSO = 12

/** Pilha de um lado, contada da direita de quem montou aquele muro. */
function posicao(lado: 'leste' | 'sul' | 'oeste' | 'norte', indice: number) {
  const direto = INICIO + indice * PASSO
  const inverso = INICIO + (17 - indice) * PASSO
  if (lado === 'leste') return { x: inverso, y: 270, width: 10, height: 14 }
  if (lado === 'sul') return { x: 270, y: direto, width: 14, height: 10 }
  if (lado === 'oeste') return { x: direto, y: 36, width: 10, height: 14 }
  return { x: 36, y: inverso, width: 14, height: 10 }
}

function Muros({
  destaque = () => false,
}: {
  destaque?: (lado: string, indice: number) => boolean
}) {
  return (
    <>
      {(['leste', 'sul', 'oeste', 'norte'] as const).map((lado) =>
        PILHAS.map((indice) => (
          <rect
            key={`${lado}-${indice}`}
            {...posicao(lado, indice)}
            rx={2}
            fill={destaque(lado, indice) ? DESTAQUE : PAPEL}
          />
        )),
      )}
    </>
  )
}

function Assentos() {
  const { t } = useI18n()
  return (
    <>
      <Rotulo x={160} y={306}>
        {t('winds.east')}
      </Rotulo>
      <g transform="rotate(-90 304 160)">
        <Rotulo x={304} y={164}>
          {t('winds.south')}
        </Rotulo>
      </g>
      <Rotulo x={160} y={24}>
        {t('winds.west')}
      </Rotulo>
      <g transform="rotate(90 17 160)">
        <Rotulo x={17} y={164}>
          {t('winds.north')}
        </Rotulo>
      </g>
    </>
  )
}

function Quadrado({ alt }: { alt: string }) {
  const { t } = useI18n()
  return (
    <Quadro altura={320} alt={alt}>
      <Muros />
      <Assentos />
      <Rotulo x={160} y={154}>
        {t('tutorial.mcr.diagrama.muralha')}
      </Rotulo>
      <Rotulo x={160} y={176} destaque>
        {t('tutorial.mcr.diagrama.piso')}
      </Rotulo>
    </Quadro>
  )
}

/** Exemplo: 6 no primeiro lançamento (Sul abre) e 4 no segundo (pula 10 pilhas). */
function Abertura({ alt }: { alt: string }) {
  const { t } = useI18n()
  return (
    <Quadro altura={320} alt={alt}>
      <Muros destaque={(lado, indice) => lado === 'sul' && indice < 10} />
      <Assentos />
      <Seta de={[258, 176]} ate={[258, 246]} />
      <Seta de={[240, 258]} ate={[166, 258]} />
      <Rotulo x={160} y={108}>
        {t('tutorial.mcr.diagrama.dados')}
      </Rotulo>
      <Rotulo x={160} y={132} destaque>
        {t('tutorial.mcr.diagrama.contadas')}
      </Rotulo>
      <Rotulo x={160} y={208}>
        {t('tutorial.mcr.diagrama.compra')}
      </Rotulo>
      <Rotulo x={160} y={72}>
        {t('tutorial.mcr.diagrama.fimMuro')}
      </Rotulo>
    </Quadro>
  )
}

function Distribuicao({ alt }: { alt: string }) {
  const { t } = useI18n()
  const linhas = [
    { vento: 'winds.east', ultima: 2, total: 14 },
    { vento: 'winds.south', ultima: 1, total: 13 },
    { vento: 'winds.west', ultima: 1, total: 13 },
    { vento: 'winds.north', ultima: 1, total: 13 },
  ]
  return (
    <Quadro altura={186} alt={alt}>
      {linhas.map(({ vento, ultima, total }, linha) => {
        const y = 24 + linha * 40
        return (
          <g key={vento}>
            <Rotulo x={36} y={y + 16}>
              {t(vento)}
            </Rotulo>
            {[4, 4, 4, ultima].map((quantidade, volta) => (
              <g key={volta}>
                <rect x={70 + volta * 50} y={y} width={40} height={24} rx={4} fill={PAPEL} />
                <Rotulo x={90 + volta * 50} y={y + 17} destaque={volta === 3}>
                  {quantidade}
                </Rotulo>
              </g>
            ))}
            <Rotulo x={290} y={y + 16}>
              {total}
            </Rotulo>
          </g>
        )
      })}
    </Quadro>
  )
}

/** As pedras que cada um pega na última volta, nas três primeiras pilhas. */
function UltimaVolta({ alt }: { alt: string }) {
  const { t } = useI18n()
  const pedras = [
    ['winds.east', 'winds.west', 'winds.east'],
    ['winds.south', 'winds.north', null],
  ]
  return (
    <Quadro altura={136} alt={alt}>
      {pedras.map((andar, linha) =>
        andar.map((vento, coluna) => (
          <g key={`${linha}-${coluna}`}>
            <rect
              x={28 + coluna * 90}
              y={18 + linha * 42}
              width={84}
              height={38}
              rx={4}
              fill={PAPEL}
            />
            {vento && (
              <Rotulo x={70 + coluna * 90} y={42 + linha * 42} destaque={vento === 'winds.east'}>
                {t(vento)}
              </Rotulo>
            )}
          </g>
        )),
      )}
      <Rotulo x={160} y={121}>
        {t('tutorial.mcr.diagrama.saltada')}
      </Rotulo>
    </Quadro>
  )
}

export const ILUSTRACOES_MCR = {
  mcrEmbaralhar: Embaralhar,
  mcrPilhas: Pilhas,
  mcrQuadrado: Quadrado,
  mcrAbertura: Abertura,
  mcrDistribuicao: Distribuicao,
  mcrUltimaVolta: UltimaVolta,
}
