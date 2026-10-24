/**
 * Página do guia que explica, por extenso, cada ajuda curta do app. É o que o
 * link "Ver em Aprender a jogar" abre. As chaves:
 *
 * - `ajuda:<tópico>`: botões "?" da finalização (TOPICOS_AJUDA);
 * - `<id do verbete>`: Glossário do Guia de bolso (SECOES_GLOSSARIO);
 * - `yaku:<id>`: cartões de yaku (os mesmos ids de termo do glossário).
 *
 * O valor é o id de uma página dos módulos ou de um tópico de Regras à parte;
 * com `#cartão` no fim, a página já abre com aquele cartão aberto (ex.: o
 * Tan'yao entre os yakus para iniciantes).
 */
export const DESTINO_GUIA: Record<string, string> = {
  'ajuda:vitoria': 'tsumo-ron',
  'ajuda:honbaDoras': 'indicador',
  // Segunda aba (Honba) da mesma ajuda.
  'ajuda:honbaDoras:1': 'honba-empate',
  'ajuda:ventos': 'ventos-de-valor',
  'ajuda:riichi': 'yakus-iniciantes#riichi',
  'ajuda:furiten': 'furiten',
  'ajuda:condicoesEspeciais': 'yakus-situacao',

  naipes: 'naipes',
  man: 'naipes',
  pin: 'naipes',
  sou: 'naipes',
  terminais: 'nomes',
  honras: 'honras',
  ventos: 'honras',
  dragoes: 'honras',
  sequencia: 'grupos',
  trinca: 'grupos',
  par: 'grupos',
  chamada: 'chi',
  chi: 'chi',
  pon: 'pon',
  kan: 'kan',
  kuitan: 'yakus-iniciantes#tanyao',
  tenpai: 'tenpai',
  ryanmen: 'yakus-iniciantes#pinfu',
  riichi: 'yakus-iniciantes#riichi',
  ippatsu: 'yakus-situacao',
  tsumo: 'tsumo-ron',
  ron: 'tsumo-ron',
  furiten: 'furiten',
  dora: 'indicador',
  'kan-dora': 'kan',
  'ura-dora': 'ura-dora',
  'aka-dora': 'aka-dora',
  yaku: 'sem-yaku',
  han: 'han-fu',
  fu: 'han-fu',
  patamares: 'patamares',
  mangan: 'patamares',
  haneman: 'patamares',
  baiman: 'patamares',
  sanbaiman: 'patamares',
  yakuman: 'patamares',
  oya: 'sorteio',
  renchan: 'proxima-mao',
  ko: 'patamares',
  honba: 'honba-empate',
  empate: 'honba-empate',
  chombo: 'chombo',

  'yaku:riichi': 'yakus-iniciantes#riichi',
  'yaku:menzen-tsumo': 'yakus-iniciantes#menzen-tsumo',
  'yaku:tanyao': 'yakus-iniciantes#tanyao',
  'yaku:yakuhai': 'yakus-iniciantes#yakuhai',
  'yaku:pinfu': 'yakus-iniciantes#pinfu',
  'yaku:ippatsu': 'yakus-situacao',
  'yaku:haitei': 'yakus-situacao',
  'yaku:houtei': 'yakus-situacao',
  'yaku:rinshan': 'yakus-situacao',
  'yaku:chankan': 'yakus-situacao',
  'yaku:iipeikou': 'mais-yakus',
  'yaku:chiitoitsu': 'mais-yakus',
  'yaku:toitoi': 'mais-yakus',
  'yaku:sanshoku-doujun': 'mais-yakus',
  'yaku:ittsuu': 'mais-yakus',
  'yaku:chanta': 'mais-yakus',
  'yaku:honitsu': 'mais-yakus',
  'yaku:chinitsu': 'mais-yakus',
  'yaku:kokushi': 'yakuman',
  'yaku:suuankou': 'yakuman',
  'yaku:daisangen': 'yakuman',
}
