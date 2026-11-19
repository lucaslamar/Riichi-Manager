/**
 * Contagem de fan MCR. Porte em TypeScript de `fan.cpp` do GB-Mahjong
 * (MIT © 2019-2020 Zheng Fan). A estrutura segue o original para facilitar a
 * conferência: os fan são guardados com os índices dos grupos que os formam,
 * e as exclusões removem a mesma combinação.
 */
import {
  bit,
  contarBits,
  contarNaMao,
  ehDragao,
  ehFechado,
  ehHonra,
  ehMaoFechada,
  ehNumerica,
  ehTrincaOuKan,
  ehVento,
  ehYaojiu,
  FIM_PEDRAS,
  grupo,
  MAPA,
  mapaChamados,
  mapaPedras,
  MAPAS_DRAGAO_COMBINADO,
  mesmoGrupo,
  naipe,
  numero,
  pedraDaBatida,
  semChamados,
  temPedraDaBatida,
  TIPO_GRUPO,
  todaChamada,
  type Grupo,
  type MaoGb,
  type Pedra,
} from './pedras'

/** Os 81 fan na ordem do original, com o nome chinês e o valor. Índice 0 é inválido. */
export const FANS = [
  ['invalido', '', 0],
  ['dasixi', '大四喜', 88], ['dasanyuan', '大三元', 88], ['lvyise', '绿一色', 88], ['jiulianbaodeng', '九莲宝灯', 88],
  ['sigang', '四杠', 88], ['lianqidui', '连七对', 88], ['shisanyao', '十三幺', 88],
  ['qingyaojiu', '清幺九', 64], ['xiaosixi', '小四喜', 64], ['xiaosanyuan', '小三元', 64], ['ziyise', '字一色', 64],
  ['sianke', '四暗刻', 64], ['yiseshuanglonghui', '一色双龙会', 64],
  ['yisesitongshun', '一色四同顺', 48], ['yisesijiegao', '一色四节高', 48],
  ['yisesibugao', '一色四步高', 32], ['sangang', '三杠', 32], ['hunyaojiu', '混幺九', 32],
  ['qidui', '七对', 24], ['qixingbukao', '七星不靠', 24], ['quanshuangke', '全双刻', 24], ['qingyise', '清一色', 24],
  ['yisesantongshun', '一色三同顺', 24], ['yisesanjiegao', '一色三节高', 24], ['quanda', '全大', 24],
  ['quanzhong', '全中', 24], ['quanxiao', '全小', 24],
  ['qinglong', '清龙', 16], ['sanseshuanglonghui', '三色双龙会', 16], ['yisesanbugao', '一色三步高', 16],
  ['quandaiwu', '全带五', 16], ['santongke', '三同刻', 16], ['sananke', '三暗刻', 16],
  ['quanbukao', '全不靠', 12], ['zuhelong', '组合龙', 12], ['dayuwu', '大于五', 12], ['xiaoyuwu', '小于五', 12],
  ['sanfengke', '三风刻', 12],
  ['hualong', '花龙', 8], ['tuibudao', '推不倒', 8], ['sansesantongshun', '三色三同顺', 8],
  ['sansesanjiegao', '三色三节高', 8], ['wufanhu', '无番和', 8], ['miaoshouhuichun', '妙手回春', 8],
  ['haidilaoyue', '海底捞月', 8], ['gangshangkaihua', '杠上开花', 8], ['qiangganghu', '抢杠和', 8],
  ['pengpenghu', '碰碰和', 6], ['hunyise', '混一色', 6], ['sansesanbugao', '三色三步高', 6], ['wumenqi', '五门齐', 6],
  ['quanqiuren', '全求人', 6], ['shuangangang', '双暗杠', 6], ['shuangjianke', '双箭刻', 6],
  ['quandaiyao', '全带幺', 4], ['buqiuren', '不求人', 4], ['shuangminggang', '双明杠', 4], ['hujuezhang', '和绝张', 4],
  ['jianke', '箭刻', 2], ['quanfengke', '圈风刻', 2], ['menfengke', '门风刻', 2], ['menqianqing', '门前清', 2],
  ['pinghu', '平和', 2], ['siguiyi', '四归一', 2], ['shuangtongke', '双同刻', 2], ['shuanganke', '双暗刻', 2],
  ['angang', '暗杠', 2], ['duanyao', '断幺', 2],
  ['yibangao', '一般高', 1], ['xixiangfeng', '喜相逢', 1], ['lianliu', '连六', 1], ['laoshaofu', '老少副', 1],
  ['yaojiuke', '幺九刻', 1], ['minggang', '明杠', 1], ['queyimen', '缺一门', 1], ['wuzi', '无字', 1],
  ['bianzhang', '边张', 1], ['kanzhang', '坎张', 1], ['dandiaojiang', '单钓将', 1], ['zimo', '自摸', 1],
  ['huapai', '花牌', 1],
  ['mingangang', '明暗杠', 5],
] as const

export type ChaveFan = (typeof FANS)[number][0]
const F = Object.fromEntries(FANS.map(([chave], i) => [chave, i])) as Record<ChaveFan, number>
const TOTAL_FANS = FANS.length
const valor = (f: number) => FANS[f][2]

type Tabela = number[][][]
const tabelaVazia = (): Tabela => Array.from({ length: TOTAL_FANS }, () => [])
const igual = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i])

export interface ResultadoMotor {
  /** Quantas vezes cada fan conta (sem flores). */
  fans: { chave: ChaveFan; vezes: number }[]
  total: number
}

/** Com os índices do original: `Pack()` vazio quando não há Knitted Straight. */
const SEM_DRAGAO_COMBINADO = grupo(TIPO_GRUPO.invalido, 0)

class ContadorFan {
  tabela: Tabela = tabelaVazia()
  excluidos: Tabela = tabelaVazia()
  total = 0
  tabelaMax: Tabela = tabelaVazia()
  totalMax = 0

  private somar(f: number, v: number[]) {
    this.tabela[f].push(v)
  }
  private excluir(f: number, v: number[]) {
    this.excluidos[f].push(v)
  }
  private tem(f: number) {
    return this.tabela[f].length > 0
  }

  private guardarMaior() {
    this.aplicarExclusoes()
    this.contarTabela()
    if (this.total > this.totalMax) {
      this.totalMax = this.total
      this.tabelaMax = this.tabela.map((linha) => [...linha])
    }
    this.tabela = tabelaVazia()
    this.excluidos = tabelaVazia()
  }

  private aplicarExclusoes() {
    for (let i = 1; i < TOTAL_FANS; i++) {
      if (!this.tabela[i].length || !this.excluidos[i].length) continue
      const removido = this.tabela[i].map(() => false)
      for (const exc of this.excluidos[i]) {
        const k = this.tabela[i].findIndex((v, idx) => !removido[idx] && igual(v, exc))
        if (k >= 0) removido[k] = true
      }
      this.tabela[i] = this.tabela[i].filter((_, idx) => !removido[idx])
    }
  }

  private contarTabela() {
    let soma = 0
    for (let i = 1; i < TOTAL_FANS; i++) soma += this.tabela[i].length * valor(i)
    if (soma === 0) {
      this.somar(F.wufanhu, [])
      soma = valor(F.wufanhu)
    }
    this.total = soma
  }

  contar(mao: MaoGb) {
    let quanbukao = false
    let especial = julgarEspecialCompleta(mao)
    if (especial) {
      quanbukao = true
      this.somar(especial, [])
      this.contarModoBatida(mao, [], SEM_DRAGAO_COMBINADO, [])
      if (julgarDragaoCombinado(mapaPedras(mao))) this.somar(F.zuhelong, [0])
      this.excluir(F.buqiuren, [])
      this.excluir(F.menqianqing, [])
      this.soZimoNaMaoFechada(mao)
      this.guardarMaior()
    }

    especial = this.julgarSetePares(mao)
    if (especial) {
      this.somar(especial, [])
      this.contarAtributosGerais(mao, [], SEM_DRAGAO_COMBINADO)
      this.contarModoBatida(mao, [], SEM_DRAGAO_COMBINADO, [])
      this.excluir(F.buqiuren, [])
      this.excluir(F.menqianqing, [])
      if (especial === F.lianqidui) {
        this.excluir(F.qingyise, [])
        this.excluir(F.wuzi, [])
      }
      this.soZimoNaMaoFechada(mao)
      this.guardarMaior()
    }

    const tipoDragao = julgarDragaoCombinado(mapaPedras(mao))
    const pedras = tipoDragao ? semDragaoCombinado(mao.pedras, tipoDragao) : [...mao.pedras]
    pedras.sort((a, b) => a.id - b.id)
    const grupos = [...mao.chamados]

    if (tipoDragao && !quanbukao) {
      const dragao = grupo(TIPO_GRUPO.dragaoCombinado, 0, 0, tipoDragao)
      this.buscar(mao, pedras, 1 - mao.chamados.length, 1, grupos, true, dragao)
      // O Knitted Straight entra depois: um "sem fan" contado sem ele deixa de valer.
      if (this.totalMax === valor(F.wufanhu) && this.tabelaMax[F.wufanhu].length === 1) {
        this.tabelaMax[F.wufanhu] = []
        this.totalMax = 0
      }
      this.tabelaMax[F.zuhelong].push([grupos.length])
      this.totalMax += valor(F.zuhelong)
    } else {
      this.buscar(mao, pedras, 4 - mao.chamados.length, 1, grupos, true)
    }
  }

  /** Mãos sempre fechadas: no tsumo conta só Self-Drawn, não Fully Concealed. */
  private soZimoNaMaoFechada(mao: MaoGb) {
    if (!mao.tsumo) return
    this.tabela[F.zimo] = [[]]
    this.excluidos[F.zimo] = []
  }

  private excluirYaojiuke(grupos: Grupo[]) {
    grupos.forEach((g, i) => {
      if (ehTrincaOuKan(g) && (numero(g.meio) === 1 || numero(g.meio) === 9 || ehHonra(g.meio))) {
        this.excluir(F.yaojiuke, [i])
      }
    })
  }

  private contarAtributosGerais(mao: MaoGb, grupos: Grupo[], dragao: Grupo) {
    const mapa = mapaPedras(mao) | mapaChamados(mao)
    const so = (conjunto: bigint) => (mapa & conjunto) === mapa
    const cinco = grupos.length === 5

    if (dragao.dragaoCombinado === 0) {
      if (so(MAPA.verdes)) {
        this.somar(F.lvyise, [])
        this.excluir(F.hunyise, [])
      }
      if (semChamados(mao)) {
        const contagem = new Map<number, number>()
        mao.pedras.forEach((p) => contagem.set(p.id, (contagem.get(p.id) ?? 0) + 1))
        const batida = pedraDaBatida(mao).id
        contagem.set(batida, (contagem.get(batida) ?? 0) - 1)
        const qtd = (id: number) => contagem.get(id) ?? 0
        const inicio = qtd(1) ? 1 : qtd(10) ? 10 : 19
        let noveLanternas = qtd(inicio) === 3 && qtd(inicio + 8) === 3
        for (let i = 2; i <= 8; i++) if (qtd(inicio - 1 + i) !== 1) noveLanternas = false
        if (noveLanternas) {
          this.somar(F.jiulianbaodeng, [])
          this.excluir(F.qingyise, [])
          this.excluir(F.buqiuren, [])
          this.excluir(F.menqianqing, [])
          this.excluir(F.wuzi, [])
          const idx = grupos.findIndex((g) => g.tipo === TIPO_GRUPO.trinca && ehYaojiu(g.meio))
          this.excluir(F.yaojiuke, [idx < 0 ? grupos.length : idx])
        }
      }
      if (so(MAPA.yaojiu & ~MAPA.honras)) {
        this.somar(F.qingyaojiu, [])
        this.excluir(F.pengpenghu, [])
        this.excluir(F.quandaiyao, [])
        this.excluir(F.wuzi, [])
        for (let i = 0; i < grupos.length; i++) {
          for (let j = i + 1; j < grupos.length; j++) {
            if (ehTrincaOuKan(grupos[i]) && ehTrincaOuKan(grupos[j]) && numero(grupos[i].meio) === numero(grupos[j].meio)) {
              this.excluir(F.shuangtongke, [i, j])
            }
          }
        }
        this.excluirYaojiuke(grupos)
      }
      if (so(MAPA.honras)) {
        this.somar(F.ziyise, [])
        this.excluir(F.pengpenghu, [])
        this.excluir(F.quandaiyao, [])
        this.excluirYaojiuke(grupos)
      }
      if (mapa & MAPA.yaojiu & ~MAPA.honras && mapa & MAPA.honras && so(MAPA.yaojiu)) {
        this.somar(F.hunyaojiu, [])
        this.excluir(F.pengpenghu, [])
        this.excluir(F.quandaiyao, [])
        this.excluirYaojiuke(grupos)
      }
      if (
        cinco &&
        grupos.every((g) => (ehTrincaOuKan(g) || g.tipo === TIPO_GRUPO.par) && ehNumerica(g.meio) && numero(g.meio) % 2 === 0)
      ) {
        this.somar(F.quanshuangke, [])
        this.excluir(F.pengpenghu, [])
        this.excluir(F.duanyao, [])
        this.excluir(F.wuzi, [])
      }
      if (so(MAPA.caracteres) || so(MAPA.bambus) || so(MAPA.circulos)) {
        this.somar(F.qingyise, [])
        this.excluir(F.wuzi, [])
      }
      if (so(MAPA.quanda)) {
        this.somar(F.quanda, [])
        this.excluir(F.dayuwu, [])
        this.excluir(F.wuzi, [])
      }
      if (so(MAPA.quanzhong)) {
        this.somar(F.quanzhong, [])
        this.excluir(F.duanyao, [])
        this.excluir(F.wuzi, [])
      }
      if (so(MAPA.quanxiao)) {
        this.somar(F.quanxiao, [])
        this.excluir(F.xiaoyuwu, [])
        this.excluir(F.wuzi, [])
      }
      if (
        cinco &&
        grupos.every((g) => {
          const n = numero(g.meio)
          return (g.tipo === TIPO_GRUPO.sequencia && n >= 4 && n <= 6) || ((ehTrincaOuKan(g) || g.tipo === TIPO_GRUPO.par) && n === 5)
        })
      ) {
        this.somar(F.quandaiwu, [])
        this.excluir(F.duanyao, [])
        this.excluir(F.wuzi, [])
      }
      if (so(MAPA.dayuwu)) {
        this.somar(F.dayuwu, [])
        this.excluir(F.wuzi, [])
      }
      if (so(MAPA.xiaoyuwu)) {
        this.somar(F.xiaoyuwu, [])
        this.excluir(F.wuzi, [])
      }
      if (so(MAPA.tuibudao)) {
        this.somar(F.tuibudao, [])
        this.excluir(F.queyimen, [])
      }
      if (cinco && grupos.every((g) => ehTrincaOuKan(g) || g.tipo === TIPO_GRUPO.par)) {
        this.somar(F.pengpenghu, [])
      }
      const semHonras = mapa & ~MAPA.honras
      const soDe = (conjunto: bigint) => (semHonras & conjunto) === semHonras
      if (mapa & MAPA.honras && mapa & MAPA.numericas && (soDe(MAPA.caracteres) || soDe(MAPA.bambus) || soDe(MAPA.circulos))) {
        this.somar(F.hunyise, [])
      }
      if (
        cinco &&
        grupos.every((g) => {
          const n = numero(g.meio)
          return (g.tipo === TIPO_GRUPO.sequencia && (n === 2 || n === 8)) || ((ehTrincaOuKan(g) || g.tipo === TIPO_GRUPO.par) && ehYaojiu(g.meio))
        })
      ) {
        this.somar(F.quandaiyao, [])
      }
      if (so(~MAPA.yaojiu)) {
        this.somar(F.duanyao, [])
        this.excluir(F.wuzi, [])
      }
      if (contarNaipes(mapa) === 2) this.somar(F.queyimen, [])
    }

    if (contarNaipes(mapa) + Number((mapa & MAPA.ventos) !== 0n) + Number((mapa & MAPA.dragoes) !== 0n) === 5) {
      this.somar(F.wumenqi, [])
    }
    if (
      grupos.length !== 7 &&
      grupos.length > 0 &&
      grupos.every((g) => g.tipo === TIPO_GRUPO.sequencia || (g.tipo === TIPO_GRUPO.par && ehNumerica(g.meio)))
    ) {
      this.somar(F.pinghu, [])
      this.excluir(F.wuzi, [])
    }
    for (let id = 1; id < FIM_PEDRAS; id++) {
      if (grupos.some((g) => g.tipo === TIPO_GRUPO.kan && g.meio === id)) continue
      if (contarNaMao(mao, id) === 4) this.somar(F.siguiyi, [])
    }
    if (so(~MAPA.honras)) this.somar(F.wuzi, [])
  }

  private contarTrincasEKans(grupos: Grupo[]) {
    const angang: number[] = []
    const minggang: number[] = []
    const anke: number[] = []
    grupos.forEach((g, i) => {
      if (g.tipo === TIPO_GRUPO.kan) (ehFechado(g) ? angang : minggang).push(i)
      else if (g.tipo === TIPO_GRUPO.trinca && ehFechado(g)) anke.push(i)
    })
    const [a, m, k] = [angang, minggang, anke]
    switch (a.length * 100 + m.length * 10 + k.length) {
      case 400:
        this.somar(F.sigang, a)
        this.somar(F.sianke, a)
        break
      case 310:
        this.somar(F.sigang, [a[0], a[1], a[2], m[0]])
        this.somar(F.sananke, a)
        break
      case 220:
        this.somar(F.sigang, [a[0], a[1], m[0], m[1]])
        this.somar(F.shuanganke, a)
        break
      case 130:
        this.somar(F.sigang, [a[0], m[0], m[1], m[2]])
        break
      case 301:
        this.somar(F.sangang, a)
        this.somar(F.sianke, [a[0], a[1], a[2], k[0]])
        break
      case 300:
        this.somar(F.sangang, a)
        this.somar(F.sananke, a)
        break
      case 211:
        this.somar(F.sangang, [a[0], a[1], m[0]])
        this.somar(F.sananke, [a[0], a[1], k[0]])
        break
      case 210:
        this.somar(F.sangang, [a[0], a[1], m[0]])
        this.somar(F.shuanganke, [a[0], a[1]])
        break
      case 121:
        this.somar(F.sangang, [a[0], m[0], m[1]])
        this.somar(F.shuanganke, [a[0], k[0]])
        break
      case 120:
        this.somar(F.sangang, [a[0], m[0], m[1]])
        break
      case 202:
        this.somar(F.shuangangang, a)
        this.somar(F.sianke, [a[0], a[1], k[0], k[1]])
        break
      case 201:
        this.somar(F.shuangangang, a)
        this.somar(F.sananke, [a[0], a[1], k[0]])
        break
      case 112:
        this.somar(F.mingangang, [a[0], m[0]])
        this.somar(F.sananke, [a[0], k[0], k[1]])
        break
      case 111:
        this.somar(F.mingangang, [a[0], m[0]])
        this.somar(F.shuanganke, [a[0], k[0]])
        break
      case 22:
        this.somar(F.shuangminggang, m)
        this.somar(F.shuanganke, k)
        break
      case 103:
        this.somar(F.angang, a)
        this.somar(F.sianke, [a[0], k[0], k[1], k[2]])
        break
      case 102:
        this.somar(F.angang, a)
        this.somar(F.sananke, [a[0], k[0], k[1]])
        break
      case 101:
        this.somar(F.angang, a)
        this.somar(F.shuanganke, [a[0], k[0]])
        break
      case 13:
        this.somar(F.minggang, m)
        this.somar(F.sananke, k)
        break
      case 12:
        this.somar(F.minggang, m)
        this.somar(F.shuanganke, k)
        break
      default:
        if (m.length === 4) this.somar(F.sigang, m)
        else if (k.length === 4) this.somar(F.sianke, k)
        else if (m.length === 3) this.somar(F.sangang, m)
        else if (k.length === 3) this.somar(F.sananke, k)
        else if (a.length === 2) this.somar(F.shuangangang, a)
        else if (m.length === 2) this.somar(F.shuangminggang, m)
        else if (k.length === 2) this.somar(F.shuanganke, k)
        else if (m.length === 1 && a.length === 1) this.somar(F.mingangang, [a[0], m[0]])
        else if (a.length === 1) this.somar(F.angang, a)
        else if (m.length === 1) this.somar(F.minggang, m)
    }

    if (this.tem(F.sigang)) {
      this.excluir(F.pengpenghu, [])
      const par = grupos.findIndex((g) => g.tipo === TIPO_GRUPO.par)
      if (par >= 0) this.excluir(F.dandiaojiang, [par])
    }
    if (this.tem(F.shuangangang)) this.excluir(F.shuanganke, this.tabela[F.shuangangang][0])
    if (this.tem(F.sianke)) {
      this.excluir(F.pengpenghu, [])
      this.excluir(F.buqiuren, [])
      this.excluir(F.menqianqing, [])
    }
  }

  private contarCombinacoes(grupos: Grupo[]) {
    const opcoes: [number, number[]][] = []
    const guardar = (f: number, v: number[]) => opcoes.push([f, v])
    const ids = (tipo: (g: Grupo) => boolean) => grupos.flatMap((g, i) => (tipo(g) ? [i] : []))
    const seqs = ids((g) => g.tipo === TIPO_GRUPO.sequencia)
    const trincas = ids(ehTrincaOuKan)
    const pares = ids((g) => g.tipo === TIPO_GRUPO.par)
    const n = (i: number) => numero(grupos[i].meio)
    const s = (i: number) => naipe(grupos[i].meio)

    {
      const fk = trincas.filter((i) => ehVento(grupos[i].meio))
      const fp = pares.filter((i) => ehVento(grupos[i].meio))
      if (fk.length === 4) guardar(F.dasixi, fk)
      if (fk.length === 3 && fp.length === 1) guardar(F.xiaosixi, [...fk, fp[0]])
      if (fk.length === 3) guardar(F.sanfengke, fk)
    }
    {
      const dk = trincas.filter((i) => ehDragao(grupos[i].meio))
      const dp = pares.filter((i) => ehDragao(grupos[i].meio))
      if (dk.length === 3) guardar(F.dasanyuan, dk)
      if (dk.length === 2 && dp.length === 1) guardar(F.xiaosanyuan, [...dk, dp[0]])
      if (dk.length === 2) guardar(F.shuangjianke, dk)
    }
    {
      const s123 = seqs.filter((i) => n(i) === 2)
      const s789 = seqs.filter((i) => n(i) === 8)
      const par = pares[0]
      if (s123.length === 2 && s789.length === 2 && par !== undefined && numero(grupos[par].meio) === 5) {
        const [a1, a2, b1, b2, sp] = [s(s123[0]), s(s123[1]), s(s789[0]), s(s789[1]), s(par)]
        const todos = [s123[0], s123[1], s789[0], s789[1], par]
        if (a1 === a2 && a1 === b1 && a1 === b2 && a1 === sp) guardar(F.yiseshuanglonghui, todos)
        else if (((a1 === b1 && a2 === b2) || (a1 === b2 && a2 === b1)) && a1 !== a2 && a1 !== sp && a2 !== sp) {
          guardar(F.sanseshuanglonghui, todos)
        }
      }
    }
    for (let i = 0; i < seqs.length; i++) {
      for (let j = i + 1; j < seqs.length; j++) {
        if (!mesmoGrupo(grupos[seqs[i]], grupos[seqs[j]])) continue
        guardar(F.yibangao, [seqs[i], seqs[j]])
        for (let k = j + 1; k < seqs.length; k++) {
          if (!mesmoGrupo(grupos[seqs[j]], grupos[seqs[k]])) continue
          guardar(F.yisesantongshun, [seqs[i], seqs[j], seqs[k]])
          for (let l = k + 1; l < seqs.length; l++) {
            if (mesmoGrupo(grupos[seqs[k]], grupos[seqs[l]])) guardar(F.yisesitongshun, [seqs[i], seqs[j], seqs[k], seqs[l]])
          }
        }
      }
    }
    {
      const ord = trincas.filter((i) => ehNumerica(grupos[i].meio)).sort((x, y) => n(x) - n(y) || x - y)
      for (let i = 0; i < ord.length; i++) {
        for (let j = i + 1; j < ord.length; j++) {
          if (n(ord[i]) !== n(ord[j]) - 1) continue
          for (let k = j + 1; k < ord.length; k++) {
            if (n(ord[j]) !== n(ord[k]) - 1) continue
            const [si, sj, sk] = [s(ord[i]), s(ord[j]), s(ord[k])]
            if (si !== sj && si !== sk && sj !== sk) guardar(F.sansesanjiegao, [ord[i], ord[j], ord[k]])
            else if (si === sj && si === sk) guardar(F.yisesanjiegao, [ord[i], ord[j], ord[k]])
            else continue
            for (let l = k + 1; l < ord.length; l++) {
              if (si === sj && si === sk && si === s(ord[l])) guardar(F.yisesijiegao, [ord[i], ord[j], ord[k], ord[l]])
            }
          }
        }
      }
    }
    {
      const ord = [...seqs].sort((x, y) => n(x) - n(y) || x - y)
      for (let i = 0; i < ord.length; i++) {
        for (let j = i + 1; j < ord.length; j++) {
          const p1 = n(ord[j]) - n(ord[i])
          if ((p1 !== 1 && p1 !== 2) || s(ord[i]) !== s(ord[j])) continue
          for (let k = j + 1; k < ord.length; k++) {
            const p2 = n(ord[k]) - n(ord[j])
            if ((p2 !== 1 && p2 !== 2) || s(ord[j]) !== s(ord[k])) continue
            if (p1 === p2) guardar(F.yisesanbugao, [ord[i], ord[j], ord[k]])
            for (let l = k + 1; l < ord.length; l++) {
              const p3 = n(ord[l]) - n(ord[k])
              if ((p3 !== 1 && p3 !== 2) || s(ord[k]) !== s(ord[l])) continue
              if (p1 === p2 && p1 === p3) guardar(F.yisesibugao, [ord[i], ord[j], ord[k], ord[l]])
            }
          }
        }
      }
      for (let i = 0; i < ord.length; i++) {
        for (let j = i + 1; j < ord.length; j++) {
          if (n(ord[j]) - n(ord[i]) !== 1 || s(ord[i]) === s(ord[j])) continue
          for (let k = j + 1; k < ord.length; k++) {
            if (n(ord[k]) - n(ord[j]) !== 1 || s(ord[i]) === s(ord[k]) || s(ord[j]) === s(ord[k])) continue
            guardar(F.sansesanbugao, [ord[i], ord[j], ord[k]])
          }
        }
      }
    }
    {
      const porNumero = (v: number) => seqs.filter((i) => n(i) === v)
      for (const a of porNumero(2)) {
        for (const b of porNumero(5)) {
          for (const c of porNumero(8)) {
            if (s(a) === s(b) && s(a) === s(c)) guardar(F.qinglong, [a, b, c])
            if (s(a) !== s(b) && s(a) !== s(c) && s(b) !== s(c)) guardar(F.hualong, [a, b, c])
          }
        }
      }
    }
    for (let i = 0; i < trincas.length; i++) {
      for (let j = i + 1; j < trincas.length; j++) {
        if (!(ehNumerica(grupos[trincas[i]].meio) && n(trincas[i]) === n(trincas[j]))) continue
        guardar(F.shuangtongke, [trincas[i], trincas[j]])
        for (let k = j + 1; k < trincas.length; k++) {
          if (n(trincas[j]) === n(trincas[k])) guardar(F.santongke, [trincas[i], trincas[j], trincas[k]])
        }
      }
    }
    for (let i = 0; i < seqs.length; i++) {
      for (let j = i + 1; j < seqs.length; j++) {
        if (n(seqs[i]) !== n(seqs[j]) || s(seqs[i]) === s(seqs[j])) continue
        for (let k = j + 1; k < seqs.length; k++) {
          if (n(seqs[j]) === n(seqs[k]) && s(seqs[i]) !== s(seqs[k]) && s(seqs[j]) !== s(seqs[k])) {
            guardar(F.sansesantongshun, [seqs[i], seqs[j], seqs[k]])
          }
        }
      }
    }
    for (let i = 0; i < seqs.length; i++) {
      for (let j = i + 1; j < seqs.length; j++) {
        const [a, b] = [seqs[i], seqs[j]]
        if (s(a) !== s(b)) {
          if (n(a) === n(b)) guardar(F.xixiangfeng, [a, b])
        } else if (Math.abs(n(a) - n(b)) === 3) guardar(F.lianliu, [a, b])
        else if (Math.abs(n(a) - n(b)) === 6) guardar(F.laoshaofu, [a, b])
      }
    }

    // Princípios de não repetição: as combinações não podem formar ciclo entre os grupos.
    // Busca em largura com union-find, como no original.
    const melhor = melhoresCombinacoes(opcoes)
    for (const id of melhor) {
      const [f, v] = opcoes[id]
      this.somar(f, v)
      if (f === F.dasixi) {
        this.excluir(F.pengpenghu, [])
        for (const i of v) {
          if (!ehVento(grupos[i].meio)) continue
          this.excluir(F.quanfengke, [i])
          this.excluir(F.menfengke, [i])
          this.excluir(F.yaojiuke, [i])
        }
      } else if (f === F.dasanyuan || f === F.xiaosanyuan || f === F.shuangjianke) {
        for (const i of v) {
          if (!ehDragao(grupos[i].meio)) continue
          this.excluir(F.jianke, [i])
          this.excluir(F.yaojiuke, [i])
        }
      } else if (f === F.xiaosixi || f === F.sanfengke) {
        for (const i of v) if (ehVento(grupos[i].meio)) this.excluir(F.yaojiuke, [i])
      } else if (f === F.yiseshuanglonghui) {
        this.excluir(F.qingyise, [])
        this.excluir(F.pinghu, [])
        this.excluir(F.wuzi, [])
      } else if (f === F.yisesitongshun) {
        this.excluir(F.siguiyi, [])
        this.excluir(F.siguiyi, [])
        this.excluir(F.siguiyi, [])
      } else if (f === F.yisesijiegao) {
        this.excluir(F.pengpenghu, [])
      } else if (f === F.sanseshuanglonghui) {
        this.excluir(F.pinghu, [])
      }
    }
  }

  private contarGrupoIsolado(mao: MaoGb, grupos: Grupo[]) {
    grupos.forEach((g, i) => {
      if (!ehTrincaOuKan(g)) return
      if (ehDragao(g.meio)) {
        this.somar(F.jianke, [i])
        this.excluir(F.yaojiuke, [i])
      }
      if (g.meio === mao.ventoRodada) {
        this.somar(F.quanfengke, [i])
        this.excluir(F.yaojiuke, [i])
      }
      if (g.meio === mao.ventoAssento) {
        this.somar(F.menfengke, [i])
        this.excluir(F.yaojiuke, [i])
      }
      if (ehYaojiu(g.meio)) this.somar(F.yaojiuke, [i])
    })
  }

  private contarModoBatida(mao: MaoGb, grupos: Grupo[], dragao: Grupo, espera: number[]) {
    const indicePar = () => {
      const i = grupos.findIndex((g) => g.tipo === TIPO_GRUPO.par)
      return i < 0 ? grupos.length : i
    }
    if (mao.ultimaDaParede && mao.tsumo) {
      this.somar(F.miaoshouhuichun, [])
      this.excluir(F.zimo, [])
    }
    if (mao.ultimaDaParede && !mao.tsumo) this.somar(F.haidilaoyue, [])
    if (mao.kan && mao.tsumo) {
      this.somar(F.gangshangkaihua, [])
      this.excluir(F.zimo, [])
    }
    if (mao.kan && !mao.tsumo) {
      this.somar(F.qiangganghu, [])
      this.excluir(F.hujuezhang, [])
    }
    if (todaChamada(mao) && !mao.tsumo) {
      this.somar(F.quanqiuren, [])
      this.excluir(F.dandiaojiang, [indicePar()])
    }
    if (ehMaoFechada(mao) && mao.tsumo) {
      this.somar(F.buqiuren, [])
      this.excluir(F.menqianqing, [])
      this.excluir(F.zimo, [])
    }
    if (mao.ultimaDoTipo) {
      this.somar(F.hujuezhang, [])
      this.excluir(F.dandiaojiang, [indicePar()])
    }
    if (ehMaoFechada(mao)) this.somar(F.menqianqing, [])

    const batida = pedraDaBatida(mao).id
    const mapaDragao = MAPAS_DRAGAO_COMBINADO[dragao.dragaoCombinado]
    if (espera.length === 1 && (mapaDragao & bit(batida)) === 0n) {
      for (let i = 0; i < grupos.length; i++) {
        const g = grupos[i]
        if (!temPedraDaBatida(g)) continue
        if (g.tipo === TIPO_GRUPO.par) this.somar(F.dandiaojiang, [i])
        else if (g.tipo === TIPO_GRUPO.sequencia) {
          const nb = numero(batida)
          if ((numero(g.meio) === 2 && nb === 3) || (numero(g.meio) === 8 && nb === 7)) this.somar(F.bianzhang, [i])
          else if (numero(g.meio) === nb) this.somar(F.kanzhang, [i])
        }
        break
      }
    }
    if (mao.tsumo) {
      this.somar(F.zimo, [])
      if ((this.tem(F.jiulianbaodeng) || this.tem(F.sianke)) && !this.tem(F.miaoshouhuichun) && !this.tem(F.gangshangkaihua)) {
        this.excluidos[F.zimo] = []
      }
    }
  }

  julgarSetePares(mao: MaoGb): number {
    if (!semChamados(mao)) return 0
    const pedras = [...mao.pedras].sort((a, b) => a.id - b.id)
    const grupos: Grupo[] = []
    if (!this.buscar(mao, pedras, 0, 7, grupos, false)) return 0
    const seguidos = grupos.every(
      (g, i) => i === 0 || (grupos[i - 1].meio + 1 === g.meio && naipe(grupos[i - 1].meio) === naipe(g.meio)),
    )
    return seguidos ? F.lianqidui : F.qidui
  }

  buscar(
    mao: MaoGb,
    pedras: Pedra[],
    faltamGrupos: number,
    faltamPares: number,
    grupos: Grupo[],
    contar: boolean,
    dragao: Grupo = SEM_DRAGAO_COMBINADO,
  ): boolean {
    const vistos = new Set<string>()
    const usadas = pedras.map(() => false)
    const chamados = mao.chamados.length

    const chave = () =>
      grupos
        .slice(chamados)
        .map((g) => `${g.meio}.${g.tipo}.${temPedraDaBatida(g) ? 1 : 0}`)
        .join('|')

    const recursivo = (faltamG: number, faltamP: number): boolean => {
      if (faltamG === 0 && faltamP === 0) {
        if (contar) {
          this.contarAtributosGerais(mao, grupos, dragao)
          this.contarTrincasEKans(grupos)
          this.contarCombinacoes(grupos)
          this.contarGrupoIsolado(mao, grupos)
          // Edge, Closed e Single Wait seguem a espera formal: espera múltipla não conta.
          this.contarModoBatida(mao, grupos, dragao, calcularEspera(mao, true))
          this.guardarMaior()
        }
        return true
      }
      const inicio = usadas.indexOf(false)
      if (inicio < 0) return false
      let achou = false
      const tentar = (indices: number[], novo: Grupo, g: number, p: number): boolean => {
        indices.forEach((i) => (usadas[i] = true))
        grupos.push(novo)
        const h = chave()
        if (!vistos.has(h)) {
          vistos.add(h)
          achou = recursivo(g, p) || achou
          if (!contar && achou) return true
        }
        grupos.pop()
        indices.forEach((i) => (usadas[i] = false))
        return false
      }
      const a = pedras[inicio]
      for (let i = inicio + 1; i < pedras.length; i++) {
        if (usadas[i]) continue
        if (!mesmaOuVizinha(a.id, pedras[i].id)) break
        if (faltamP && a.id === pedras[i].id) {
          const oferta = -(a.marca + pedras[i].marca)
          if (tentar([inicio, i], grupo(TIPO_GRUPO.par, pedras[i].id, oferta), faltamG, faltamP - 1)) return true
        }
        if (!faltamG) continue
        for (let j = i + 1; j < pedras.length; j++) {
          if (usadas[j]) continue
          if (!mesmaOuVizinha(pedras[i].id, pedras[j].id)) break
          const tipo = formaGrupo(a.id, pedras[i].id, pedras[j].id)
          if (!tipo) continue
          const oferta = -(a.marca + pedras[i].marca + pedras[j].marca)
          if (tentar([inicio, i, j], grupo(tipo, pedras[i].id, oferta), faltamG - 1, faltamP)) return true
        }
      }
      return achou
    }
    return recursivo(faltamGrupos, faltamPares)
  }
}

function contarNaipes(mapa: bigint): number {
  return [MAPA.caracteres, MAPA.bambus, MAPA.circulos].filter((n) => (mapa & n) !== 0n).length
}

function mesmaOuVizinha(a: number, b: number): boolean {
  if (ehNumerica(a) && naipe(a) === naipe(b)) return a === b - 1 || a === b
  if (ehHonra(a)) return a === b
  return false
}

function formaGrupo(a: number, b: number, c: number): number {
  if (ehNumerica(a) && naipe(b) === naipe(a) && naipe(b) === naipe(c) && b === a + 1 && b === c - 1) return TIPO_GRUPO.sequencia
  if (b === a && b === c) return TIPO_GRUPO.trinca
  return 0
}

function julgarDragaoCombinado(mapa: bigint): number {
  for (let i = 1; i <= 6; i++) if ((MAPAS_DRAGAO_COMBINADO[i] & mapa) === MAPAS_DRAGAO_COMBINADO[i]) return i
  return 0
}

function parteDeDragaoCombinado(mapa: bigint): boolean {
  const numericas = mapa & MAPA.numericas
  return MAPAS_DRAGAO_COMBINADO.slice(1).some((d) => (d | numericas) === d)
}

function semDragaoCombinado(pedras: Pedra[], tipo: number): Pedra[] {
  let restante = MAPAS_DRAGAO_COMBINADO[tipo]
  return pedras.filter((p) => {
    if (bit(p.id) & restante) {
      restante ^= bit(p.id)
      return false
    }
    return true
  })
}

function julgarEspecialCompleta(mao: MaoGb): number {
  if (!semChamados(mao)) return 0
  const mapa = mapaPedras(mao)
  const qtd = contarBits(mapa)
  if ((mapa & MAPA.yaojiu) === mapa && qtd === 13) return F.shisanyao
  if (parteDeDragaoCombinado(mapa) && (mapa & MAPA.validas) === mapa && qtd === 14) {
    return (mapa & MAPA.honras) === MAPA.honras ? F.qixingbukao : F.quanbukao
  }
  return 0
}

function melhoresCombinacoes(opcoes: [number, number[]][]): number[] {
  interface Estado {
    pai: number[]
    ids: number[]
    soma: number
  }
  const achar = (e: Estado, x: number): number => (e.pai[x] === x ? x : (e.pai[x] = achar(e, e.pai[x])))
  const unir = (e: Estado, a: number, b: number) => {
    a = achar(e, a)
    b = achar(e, b)
    if (a === b) return
    if (a < b) e.pai[b] = a
    else e.pai[a] = b
  }
  const juntar = (e: Estado, id: number): boolean => {
    const v = opcoes[id][1]
    for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (achar(e, v[i]) === achar(e, v[j])) return false
    for (let i = 1; i < v.length; i++) unir(e, v[i], v[i - 1])
    e.ids.push(id)
    e.soma += valor(opcoes[id][0])
    return true
  }
  const hash = (e: Estado) => [0, 1, 2, 3, 4].reduce((acc, i) => acc * 5 + achar(e, i), 0)

  const melhorPorHash = new Map<number, number>()
  let melhor: Estado = { pai: [0, 1, 2, 3, 4], ids: [], soma: 0 }
  const fila: Estado[] = [melhor]
  while (fila.length) {
    const frente = fila.shift()!
    for (let i = 0; i < opcoes.length; i++) {
      const e: Estado = { pai: [...frente.pai], ids: [...frente.ids], soma: frente.soma }
      if (juntar(e, i) && e.soma > (melhorPorHash.get(hash(e)) ?? 0)) {
        fila.push(e)
        melhorPorHash.set(hash(e), e.soma)
        if (e.soma > melhor.soma) melhor = e
      }
    }
  }
  return melhor.ids
}

function julgarBasica(mao: MaoGb): boolean {
  const pedras = [...mao.pedras].sort((a, b) => a.id - b.id)
  return new ContadorFan().buscar(mao, pedras, 4 - mao.chamados.length, 1, [...mao.chamados], false)
}

function julgarBasicaComDragao(mao: MaoGb): boolean {
  const tipo = julgarDragaoCombinado(mapaPedras(mao))
  if (!tipo) return false
  const pedras = semDragaoCombinado(mao.pedras, tipo).sort((a, b) => a.id - b.id)
  return new ContadorFan().buscar(mao, pedras, 1 - mao.chamados.length, 1, [...mao.chamados], false)
}

export function ehBatida(mao: MaoGb): boolean {
  const contador = new ContadorFan()
  return (
    julgarEspecialCompleta(mao) !== 0 ||
    (semChamados(mao) && contador.julgarSetePares(mao) !== 0) ||
    julgarBasica(mao) ||
    julgarBasicaComDragao(mao)
  )
}

/** Pedras que completam a mão de 13 (a última posição é trocada por cada candidata). */
export function calcularEspera(mao: MaoGb, incluirEsgotadas = false): number[] {
  const espera: number[] = []
  const pedras = [...mao.pedras]
  for (let id = 1; id < FIM_PEDRAS; id++) {
    pedras[pedras.length - 1] = { id, marca: 2 }
    const teste = { ...mao, pedras }
    if (ehBatida(teste) && (incluirEsgotadas || contarNaMao(teste, id) !== 5)) espera.push(id)
  }
  return espera
}

/** Conta os fan da melhor decomposição. Não inclui flores; quem chama soma à parte. */
export function contarFan(mao: MaoGb): ResultadoMotor {
  const contador = new ContadorFan()
  contador.contar(mao)
  const fans = contador.tabelaMax.flatMap((linha, f) =>
    f > 0 && linha.length ? [{ chave: FANS[f][0] as ChaveFan, vezes: linha.length }] : [],
  )
  return { fans, total: contador.totalMax }
}

export const valorDoFan = (chave: ChaveFan) => FANS[F[chave]][2]
export const nomeChinesDoFan = (chave: ChaveFan) => FANS[F[chave]][1]

