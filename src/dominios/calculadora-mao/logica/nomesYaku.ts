import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'

/**
 * Nome exibido de cada yaku por idioma. A lógica continua usando o romaji como
 * identificador (`traduzirYaku`); só a tela troca o nome.
 *
 * - pt-BR, en e lt: romaji (com as grafias do Glossário: Tan'yao, Ura-dora…).
 * - ja: kanji/kana japoneses.
 * - zh-Hans: termos chineses do riichi; sem termo consolidado, os kanji japoneses.
 * - ko: hangul usado pela comunidade coreana de riichi (revisar: i18n/REVISAR.md).
 */
interface NomesCjk {
  ja: string
  zh: string
  ko: string
}

const NOMES: Record<string, NomesCjk> = {
  Riichi: { ja: '立直', zh: '立直', ko: '리치' },
  'Double Riichi': { ja: 'ダブル立直', zh: '两立直', ko: '더블 리치' },
  Ippatsu: { ja: '一発', zh: '一发', ko: '일발' },
  'Menzen Tsumo': { ja: '門前清自摸和', zh: '门前清自摸和', ko: '멘젠쯔모' },
  Pinfu: { ja: '平和', zh: '平和', ko: '핑후' },
  Tanyao: { ja: '断幺九', zh: '断幺九', ko: '탕야오' },
  Iipeikou: { ja: '一盃口', zh: '一杯口', ko: '이페코' },
  Ryanpeikou: { ja: '二盃口', zh: '二杯口', ko: '량페코' },
  'Sanshoku Doujun': { ja: '三色同順', zh: '三色同顺', ko: '삼색동순' },
  Ittsu: { ja: '一気通貫', zh: '一气通贯', ko: '일기통관' },
  Chanta: { ja: '混全帯幺九', zh: '混全带幺九', ko: '찬타' },
  Junchan: { ja: '純全帯幺九', zh: '纯全带幺九', ko: '준찬타' },
  Toitoi: { ja: '対々和', zh: '对对和', ko: '또이또이' },
  'San Ankou': { ja: '三暗刻', zh: '三暗刻', ko: '산안커' },
  Sankantsu: { ja: '三槓子', zh: '三杠子', ko: '산깡쯔' },
  'Sanshoku Doukou': { ja: '三色同刻', zh: '三色同刻', ko: '삼색동각' },
  Shousangen: { ja: '小三元', zh: '小三元', ko: '소삼원' },
  Honroutou: { ja: '混老頭', zh: '混老头', ko: '혼노두' },
  Honitsu: { ja: '混一色', zh: '混一色', ko: '혼일색' },
  Chinitsu: { ja: '清一色', zh: '清一色', ko: '청일색' },
  Chiitoitsu: { ja: '七対子', zh: '七对子', ko: '치또이쯔' },
  'Rinshan Kaihou': { ja: '嶺上開花', zh: '岭上开花', ko: '영상개화' },
  Chankan: { ja: '槍槓', zh: '抢杠', ko: '창깡' },
  'Haitei Raoyue': { ja: '海底摸月', zh: '海底摸月', ko: '해저로월' },
  'Houtei Raoyui': { ja: '河底撈魚', zh: '河底捞鱼', ko: '하저로어' },
  'Bakaze Ton': { ja: '場風 東', zh: '场风 东', ko: '장풍 동' },
  'Bakaze Nan': { ja: '場風 南', zh: '场风 南', ko: '장풍 남' },
  'Bakaze Sha': { ja: '場風 西', zh: '场风 西', ko: '장풍 서' },
  'Bakaze Pei': { ja: '場風 北', zh: '场风 北', ko: '장풍 북' },
  'Jikaze Ton': { ja: '自風 東', zh: '自风 东', ko: '자풍 동' },
  'Jikaze Nan': { ja: '自風 南', zh: '自风 南', ko: '자풍 남' },
  'Jikaze Sha': { ja: '自風 西', zh: '自风 西', ko: '자풍 서' },
  'Jikaze Pei': { ja: '自風 北', zh: '自风 北', ko: '자풍 북' },
  'Yakuhai Haku': { ja: '役牌 白', zh: '役牌 白', ko: '역패 백' },
  'Yakuhai Hatsu': { ja: '役牌 發', zh: '役牌 发', ko: '역패 발' },
  'Yakuhai Chun': { ja: '役牌 中', zh: '役牌 中', ko: '역패 중' },
  Haku: { ja: '白', zh: '白', ko: '백' },
  Hatsu: { ja: '發', zh: '发', ko: '발' },
  Chun: { ja: '中', zh: '中', ko: '중' },
  Dora: { ja: 'ドラ', zh: '宝牌', ko: '도라' },
  Uradora: { ja: '裏ドラ', zh: '里宝牌', ko: '뒷도라' },
  Akadora: { ja: '赤ドラ', zh: '赤宝牌', ko: '적도라' },
  'Kokushi Musou': { ja: '国士無双', zh: '国士无双', ko: '국사무쌍' },
  'Kokushi Musou 13-men machi': {
    ja: '国士無双十三面待ち',
    zh: '国士无双十三面',
    ko: '국사무쌍 13면 대기',
  },
  'Chuuren Poutou': { ja: '九蓮宝燈', zh: '九莲宝灯', ko: '구련보등' },
  'Junsei Chuuren Poutou': { ja: '純正九蓮宝燈', zh: '纯正九莲宝灯', ko: '순정구련보등' },
  Suuankou: { ja: '四暗刻', zh: '四暗刻', ko: '스안커' },
  'Suuankou Tanki': { ja: '四暗刻単騎', zh: '四暗刻单骑', ko: '스안커 단기' },
  Daisuushii: { ja: '大四喜', zh: '大四喜', ko: '대사희' },
  Shousuushii: { ja: '小四喜', zh: '小四喜', ko: '소사희' },
  Daisangen: { ja: '大三元', zh: '大三元', ko: '대삼원' },
  Tsuuiisou: { ja: '字一色', zh: '字一色', ko: '자일색' },
  Ryuuiisou: { ja: '緑一色', zh: '绿一色', ko: '녹일색' },
  Chinroutou: { ja: '清老頭', zh: '清老头', ko: '청노두' },
  Suukantsu: { ja: '四槓子', zh: '四杠子', ko: '스깡쯔' },
  Tenhou: { ja: '天和', zh: '天和', ko: '천화' },
  Chiihou: { ja: '地和', zh: '地和', ko: '지화' },
  Renhou: { ja: '人和', zh: '人和', ko: '인화' },
  Daichiishin: { ja: '大七星', zh: '大七星', ko: '대칠성' },
  'Dora manual': { ja: 'ドラ（手入力）', zh: '宝牌（手动）', ko: '도라 (수동)' },
}

/** Nomes com português no id que mudam também em inglês e lituano. */
const NOMES_LATINOS: Record<string, { en: string; lt: string }> = {
  'Dora manual': { en: 'Dora (manual)', lt: 'Dora (rankinė)' },
}

/** Ids antigos (com português no nome) → id canônico em romaji. */
const SINONIMOS: Record<string, string> = {
  Iipeiko: 'Iipeikou',
  Ryanpeiko: 'Ryanpeikou',
  Toitoihou: 'Toitoi',
  'Ittsu (Sequência Pura)': 'Ittsu',
  'Yakuhai (Dragão)': 'Yakuhai Haku',
  'Vento da Rodada (Leste)': 'Bakaze Ton',
  'Vento da Rodada (Sul)': 'Bakaze Nan',
  'Vento da Rodada (Oeste)': 'Bakaze Sha',
  'Vento da Rodada (Norte)': 'Bakaze Pei',
  'Vento do Assento (Leste)': 'Jikaze Ton',
  'Vento do Assento (Sul)': 'Jikaze Nan',
  'Vento do Assento (Oeste)': 'Jikaze Sha',
  'Vento do Assento (Norte)': 'Jikaze Pei',
  'Kokushi (13 esperas)': 'Kokushi Musou 13-men machi',
  'Chuuren (9 esperas)': 'Junsei Chuuren Poutou',
  'Suuankou (espera tanki)': 'Suuankou Tanki',
}

/** Grafias do Glossário para os idiomas em romaji. */
const GRAFIA_ROMAJI: Record<string, string> = {
  Tanyao: "Tan'yao",
  Uradora: 'Ura-dora',
  Akadora: 'Aka dora',
}

/** Nome do yaku para exibir no idioma ativo. */
export function nomeYakuExibido(id: string, idioma: IdiomaSuportado): string {
  const canonico = SINONIMOS[id] ?? id
  const cjk = NOMES[canonico]
  if (cjk && idioma === 'ja') return cjk.ja
  if (cjk && idioma === 'zh-Hans') return cjk.zh
  if (cjk && idioma === 'ko') return cjk.ko
  // Em pt-BR os ids antigos já são o nome exibido.
  if (idioma === 'pt-BR') return GRAFIA_ROMAJI[id] ?? id
  const latino = NOMES_LATINOS[canonico]
  if (latino && (idioma === 'en' || idioma === 'lt')) return latino[idioma]
  return GRAFIA_ROMAJI[canonico] ?? canonico
}

/** Chave i18n de cada patamar (o resultado guarda o nome em romaji). */
const CHAVE_PATAMAR: Record<string, string> = {
  Mangan: 'hanFu.limitMangan',
  Haneman: 'hanFu.limitHaneman',
  Baiman: 'hanFu.limitBaiman',
  Sanbaiman: 'hanFu.limitSanbaiman',
  Yakuman: 'hanFu.limitYakuman',
  'Kazoe Yakuman': 'hanFu.limitKazoe',
  'Yakuman Contado': 'hanFu.limitKazoe',
}

/**
 * Patamar no idioma ativo: chave i18n e parâmetros. `null` quando o nome não é
 * um patamar conhecido (fica como veio).
 */
export function chavePatamar(
  nome: string,
): { chave: string; parametros?: { count: number } } | null {
  const multiplo = nome.match(/^(\d+)\s*[x×]\s*Yakuman$/)
  if (multiplo)
    return { chave: 'hanFu.limitYakumanTimes', parametros: { count: Number(multiplo[1]) } }
  const chave = CHAVE_PATAMAR[nome]
  return chave ? { chave } : null
}
