/**
 * O "por quê" de cada yaku local: de onde vem o nome ou a ideia, e o que faz a
 * mão ser difícil. Texto próprio, resumido a partir da Riichi Wiki (Local yaku).
 */
export const PORQUE_YAKUS_LOCAIS: Record<string, { pt: string; en: string }> = {
  tsubameGaeshi: {
    pt: 'O nome vem de um golpe de espada que volta no ar, como a andorinha. Você "devolve" o Riichi do oponente na hora em que ele declara.',
    en: 'Named after a sword move that turns back mid-air like a swallow: you strike back at the very Riichi declaration.',
  },
  shiiaruRaotai: {
    pt: 'Doze pedras já caíram na mesa em quatro chamadas, e você fica com uma só na mão. É a mão mais exposta possível, e por isso vale yaku.',
    en: 'Twelve tiles are already down in four calls and you hold just one. The most exposed hand possible, so it earns a yaku.',
  },
  kanburi: {
    pt: 'Quem acabou de fazer kan compra a reposição e descarta. Esse descarte é arriscado, e a casa premia quem pega ele.',
    en: 'After a kan the player draws a replacement and discards. That discard is risky, and the house rewards whoever takes it.',
  },
  sangenChiitoitsu: {
    pt: 'Pares dos três dragões no Chiitoitsu lembram o Daisangen, mas em pares. A casa dá 1 han a mais pela coincidência.',
    en: 'All three dragon pairs in Chiitoitsu echo Daisangen in pair form. The house adds 1 han for it.',
  },
  suushiChiitoitsu: {
    pt: 'É a versão em pares dos quatro ventos, como um Daisuushii de sete pares.',
    en: 'The seven-pairs version of having all four winds, like a paired Daisuushii.',
  },
  uushinTsuukan: {
    pt: '"Cinco no coração": o Ittsuu fecha justamente no 5 do meio, a espera mais apertada da reta.',
    en: '"Five through the heart": the straight closes on the middle 5, its tightest wait.',
  },
  ketsupaihou: {
    pt: 'Com três das quatro pedras esperadas já à vista, sobra só uma. Vencer assim é sorte grande, e a casa premia.',
    en: 'With three of the four waited tiles already visible, only one is left. Winning on it is pure luck, and the house rewards it.',
  },
  toipuutao: {
    pt: '"Não tomba": as pedras são iguais de cabeça para baixo. Mesmo virando a mão, ela continua a mesma.',
    en: '"Won’t topple": these tiles look the same upside down, so the hand reads the same either way.',
  },
  sanrenkou: {
    pt: 'Três trincas em escada parecem três sequências iguais, mas formar trincas é bem mais difícil.',
    en: 'Three stepped triplets look like three identical runs, but triplets are much harder to build.',
  },
  sanshokuTsuukan: {
    pt: 'Mistura Sanshoku e Ittsuu: a reta de 1 a 9 completa, mas cada pedaço num naipe.',
    en: 'A cross of Sanshoku and Ittsuu: the full 1–9 straight, each third in a different suit.',
  },
  kyandonhou: {
    pt: '"Espelho": dois naipes com as mesmas sequências, como se um refletisse o outro.',
    en: '"Mirror": two suits holding the same runs, one reflecting the other.',
  },
  ryandoukou: {
    pt: 'Duas vezes o mesmo número em trinca em dois naipes. É um Sanshoku doukou pela metade, repetido.',
    en: 'The same-number triplet twice in two suits, a half Sanshoku doukou done twice.',
  },
  shoutate: {
    pt: '"Pequena coluna": quase um Sanshoku doukou, só que o terceiro naipe vem em par.',
    en: '"Little column": almost a Sanshoku doukou, with the third suit as the pair.',
  },
  choupaikou: {
    pt: 'Trincas em salto no mesmo naipe. O intervalo fixo deixa a mão bonita e difícil de montar.',
    en: 'Skipping triplets in one suit. The fixed gap makes it pretty and hard to build.',
  },
  suuzuukou: {
    pt: 'Quatro trincas de honra quase sempre já são Tsuuiisou ou Daisuushii. Aqui a casa dá valor mesmo quando não chega lá.',
    en: 'Four honour triplets usually means Tsuuiisou or Daisuushii. Here the house pays even when it falls short.',
  },
  akadoraSanshoku: {
    pt: 'Juntar os três cincos vermelhos, um de cada naipe, é raro. A casa dá um bônus além das doras.',
    en: 'Collecting all three red fives, one per suit, is rare. The house adds a bonus on top of the dora.',
  },
  openRiichi: {
    pt: 'Você mostra a mão a todos ao declarar. Ninguém vai descartar a sua espera, então o risco maior vale 1 han a mais.',
    en: 'You show your hand when declaring. Nobody will feed your wait, so the extra risk is worth 1 more han.',
  },
  isshokuSanjun: {
    pt: 'Três sequências idênticas são mais raras que o Iipeikou, então valem mais e tomam o lugar dele.',
    en: 'Three identical runs are rarer than Iipeikou, so they score more and replace it.',
  },
  sanpuukou: {
    pt: 'Três trincas de vento sem a quarta. Fica entre o Shousuushii e uma mão comum, e a casa premia.',
    en: 'Three wind triplets without the fourth. It sits between Shousuushii and a normal hand, and the house rewards it.',
  },
  uumensai: {
    pt: '"Cinco portas": a mão passa por todos os tipos de pedra, o oposto de uma mão de um naipe só.',
    en: '"Five gates": the hand touches every tile type, the opposite of a one-suit hand.',
  },
  renkaihou: {
    pt: '"Flor dupla": o Rinshan já é raro, e vencer depois de dois kans seguidos é ainda mais.',
    en: '"Double flower": Rinshan is rare already, and winning after two kans in a row even more.',
  },
  ittsuuChanta: {
    pt: 'O Ittsuu tem o 456 no meio, que não tem terminal, então não dá Chanta normal. A casa premia quando o resto da mão tem terminal ou honra.',
    en: 'Ittsuu has the 456 in the middle, so normal Chanta is impossible. The house rewards it when the rest holds terminals or honours.',
  },
  tanfonhou: {
    pt: 'Ao contrário do Ryuuiisou, aqui são proibidas as pedras que têm algum vermelho pintado. Sobram poucas.',
    en: 'The reverse of Ryuuiisou: every tile with any red paint is banned, which leaves few to use.',
  },
  chinpeikou: {
    pt: 'É um Ryanpeikou em que os dois pares de sequências são iguais, ou seja, a mesma sequência quatro vezes.',
    en: 'A Ryanpeikou where both pairs of runs are the same, so one run four times.',
  },
  kinkeiDokuritsu: {
    pt: '"Galo dourado em uma perna": o 1 sou tem um pássaro desenhado, e ele fica sozinho na mão depois de quatro chamadas.',
    en: '"Golden rooster on one leg": the 1 sou shows a bird, left alone in the hand after four calls.',
  },
  touchaoHanchanshue: {
    pt: 'Vem de um poema chinês sobre pescar sozinho na neve. O Haku branco é a neve, e você espera por ele sozinho.',
    en: 'From a Chinese poem about fishing alone in the snow. White Haku is the snow, and you wait on it alone.',
  },
  uupinKaihou: {
    pt: 'O 5 pin parece uma flor, e o Rinshan se chama "flor no topo da montanha". Vencer o Rinshan com a flor fecha a piada.',
    en: 'The 5 pin looks like a flower, and Rinshan means "flower on the mountain". Winning Rinshan on the flower completes the joke.',
  },
  ryanzouChankan: {
    pt: 'O 2 sou lembra hastes de bambu cruzadas, como lanças. Chankan é "roubar com a lança", daí o par.',
    en: 'The 2 sou looks like crossed bamboo spears. Chankan means "robbing with a spear", hence the match.',
  },
  iipinMouyue: {
    pt: 'Haitei é "lua no fundo do mar", e o 1 pin é redondo como a lua. Pegar a lua com a lua.',
    en: 'Haitei is "moon from the bottom of the sea", and the round 1 pin is the moon. Catching the moon with the moon.',
  },
  chuupinRaoyui: {
    pt: 'Houtei é "peixe do fundo do rio", e o 9 pin lembra escamas. Pescar o peixe com o peixe.',
    en: 'Houtei is "fish from the bottom of the river", and the 9 pin looks like scales. Fishing the fish with the fish.',
  },
  akaSanshokuDoujun: {
    pt: 'Sanshoku doujun em que cada naipe usa o seu 5 vermelho. Pede as três pedras vermelhas e a mesma sequência nos três.',
    en: 'Sanshoku doujun where each suit uses its red 5. It needs all three red tiles and the same run in each.',
  },
  shanronChonchu: {
    pt: 'Dois dragões (man e sou espelhados) disputam a pérola, que é o par redondo de pin no meio.',
    en: 'Two dragons (mirrored man and sou) fight over the pearl, the round pin pair between them.',
  },
  chiishinUushii: {
    pt: '"Sete estrelas sem apoio": as sete honras são as estrelas, e nenhuma pedra se liga a outra.',
    en: '"Seven stars with no support": the seven honours are the stars, and no tile connects to another.',
  },
  renhou: {
    pt: 'Completa a trinca Tenhou (céu) e Chiihou (terra) com o "homem": vencer antes da sua primeira compra.',
    en: 'Completes the trio of Tenhou (heaven) and Chiihou (earth) with "man": winning before your first draw.',
  },
  maneman: {
    pt: '"Mangan da imitação": copiar os descartes de alguém e ainda vencer é tão difícil que quem foi copiado paga.',
    en: '"Imitation mangan": copying someone’s discards and still winning is so hard that the copied player pays.',
  },
  paarenchan: {
    pt: 'Oito vitórias seguidas quase nunca acontecem. A casa premia a sequência como se fosse um Yakuman.',
    en: 'Eight wins in a row almost never happen. The house pays the streak like a Yakuman.',
  },
  ishiNoUe: {
    pt: 'O ditado "três anos sobre a pedra" fala de paciência. Você declara Riichi no primeiro descarte e espera até a última pedra.',
    en: 'The saying "three years on a rock" is about patience. You Riichi on the first discard and wait to the very last tile.',
  },
  toukanhou: {
    pt: 'Fazer kan já no primeiro turno e vencer com a reposição é uma das aberturas mais raras do jogo.',
    en: 'A kan on the first turn and a win on the replacement is one of the rarest openings in the game.',
  },
  shiisanpuutaa: {
    pt: 'A pior mão inicial possível, sem nenhum par nem vizinho. A casa transforma o azar em Yakuman.',
    en: 'The worst possible starting hand, with no pair and no neighbours. The house turns that bad luck into a Yakuman.',
  },
  suurenkou: {
    pt: 'Quatro trincas em escada são também quatro trincas fechadas ou quase, perto do Suuankou.',
    en: 'Four stepped triplets are close to Suuankou, since they are all triplets.',
  },
  daisharin: {
    pt: '"Grande roda": as pedras de pin parecem rodas, e 2 a 8 em pares formam uma roda cheia. Em sou é bambu, em man são números.',
    en: '"Big wheel": pin tiles look like wheels, and 2 to 8 in pairs make a full one. In sou it is bamboo, in man numbers.',
  },
  shousharin: {
    pt: 'É a versão menor da Grande roda: sete pares seguidos, mas de 1 a 7 ou de 3 a 9.',
    en: 'The smaller Big wheel: seven pairs in a row, but 1 to 7 or 3 to 9.',
  },
  isshokuYonjun: {
    pt: 'Quatro sequências iguais usam as quatro cópias de três pedras. É o limite do Iipeikou.',
    en: 'Four identical runs use all four copies of three tiles. It is Iipeikou taken to the limit.',
  },
  hyakumanGoku: {
    pt: '"Um milhão de koku" era a riqueza de um grande feudo. Os números do man somando 100 ou mais lembram essa fortuna.',
    en: '"One million koku" was the wealth of a great domain. Man numbers adding to 100 or more echo that fortune.',
  },
  kachoufuugetsu: {
    pt: 'É a expressão japonesa para a beleza da natureza: flor (5 pin), pássaro (1 sou), vento e lua (1 pin).',
    en: 'The Japanese phrase for nature’s beauty: flower (5 pin), bird (1 sou), wind and moon (1 pin).',
  },
  kouitten: {
    pt: '"Um ponto vermelho no meio do verde": é o Ryuuiisou trocando o Hatsu pelo Chun vermelho.',
    en: '"One red dot among the green": Ryuuiisou with red Chun replacing Hatsu.',
  },
  benikujaku: {
    pt: 'Usa justamente as pedras de sou que o Ryuuiisou deixa de fora, as que têm vermelho, mais o Chun. Com só cinco tipos de pedra e nenhuma sequência possível, é mais difícil que o Ryuuiisou.',
    en: 'It uses exactly the sou tiles Ryuuiisou leaves out, the ones with red, plus Chun. With only five tile types and no runs possible, it is harder than Ryuuiisou.',
  },
  kokuiisou: {
    pt: '"Tudo preto": só pedras pintadas apenas de preto. Sobram 2, 4 e 8 pin e os ventos.',
    en: '"All black": only tiles painted in black alone. That leaves 2, 4 and 8 pin and the winds.',
  },
  ryuuiisourin: {
    pt: 'O 5 sou tem um ponto vermelho no meio, como um anel. Pôr esse par num Ryuuiisou fecha o "anel".',
    en: 'The 5 sou has a red dot in the centre, like a ring. Using it as the pair in Ryuuiisou closes the "ring".',
  },
  goldenGateBridge: {
    pt: 'As sequências encadeadas 123, 345, 567 e 789 desenham os arcos de uma ponte.',
    en: 'The linked runs 123, 345, 567 and 789 draw the arches of a bridge.',
  },
  americanCivilWar: {
    pt: 'Sul e Norte são os lados da guerra, e 1861 e 1865 são o ano de início e de fim.',
    en: 'South and North are the sides of the war, and 1861 and 1865 are the years it began and ended.',
  },
  touhokuExpressway: {
    pt: 'Leste e Norte formam "Touhoku", a região do nordeste do Japão. As pedras pares de pin são a estrada.',
    en: 'East and North spell "Touhoku", Japan’s northeast region. The even pin tiles are the road.',
  },
  touhokuShinkansen: {
    pt: 'O Ittsuu de 1 a 9 é o trem-bala correndo direto, e Leste e Norte marcam a linha Touhoku.',
    en: 'The 1–9 Ittsuu is the bullet train running straight through, and East and North mark the Touhoku line.',
  },
  blueTunnel: {
    pt: 'Vem de um túnel famoso no Japão. As pedras azuis e verdes lembram a passagem escavada na rocha.',
    en: 'Named after a famous tunnel in Japan. The blue and green tiles evoke the passage cut through rock.',
  },
  daichisei: {
    pt: '"Sete grandes estrelas": as sete honras em pares. Já é Tsuuiisou, e a casa dobra.',
    en: '"Seven big stars": all seven honours as pairs. It is already Tsuuiisou, and the house doubles it.',
  },
  junseiRyuuiisou: {
    pt: 'O Ryuuiisou sem o Hatsu só usa sou verdes, o que é bem mais difícil. Por isso vale dobrado.',
    en: 'Ryuuiisou without Hatsu uses only green sou, which is much harder. That is why it counts double.',
  },
}
