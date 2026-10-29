# Revisão por falante nativo: coreano (ko) e lituano (lt)

Traduções feitas sem revisão nativa. Esta lista reúne as chaves com termo técnico de
mahjong (yaku, han, fu, ventos, chamadas, pontuação) para conferência.

Como revisar:

- Corrija direto em `public/locales/ko.json` ou `public/locales/lt.json` (a chave está na
  primeira coluna) e marque a linha aqui com ✅.
- Rode `npm run test:i18n` depois: ele falha se faltar chave, forma de plural ou parâmetro `{{…}}`.
- Plural em lituano: `one` (1, 21, 31…), `few` (2–9, 22–29…), `many` (frações) e `other`
  (0, 10–20, 30…). Em coreano só existe `other`.

## Pontos de atenção

- **ko, nomes de yaku:** mistura de leitura sino-coreana (일발, 청일색, 국사무쌍) e transliteração do
  japonês usada nos clientes coreanos de riichi (리치, 쯔모, 핑후, 탕야오, 산안커, 치또이쯔). Confirmar
  qual forma a comunidade usa em cada caso, e a grafia 쯔/츠 (쯔모 × 츠모).
- **ko, termos de mesa:** 친/자 (oya/ko), 본장 (honba), 방총 (quem dá ron), 부저 (fūtei), 요구패 e
  중장패, 밍커/안커/밍깡/안깡, 바센고 (basengo), 절상 만관 (kiriage), 헤아림 역만 (kazoe).
- **lt, termos de mesa:** "akmuo" para pedra (tile), "trejetas" (trinca), "seka" (sequência),
  "pora" (par), "laukimas" (espera), "dalintojas" (dealer/oya), "išmesti akmenys" (descartes),
  "garbės akmenys" (honras), "kraštiniai" (terminais). Os nomes de yaku ficam em romaji.
- **lt, ventos:** Rytai, Pietūs, Vakarai, Šiaurė (e "Rytų vėjas" etc. nos nomes de pedras).

## Nomes de yaku em coreano

Ficam em `src/dominios/calculadora-mao/logica/nomesYaku.ts` (o japonês ao lado, como referência).

| Romaji | ja | ko |
| --- | --- | --- |
| Riichi | 立直 | 리치 |
| Double Riichi | ダブル立直 | 더블 리치 |
| Ippatsu | 一発 | 일발 |
| Menzen Tsumo | 門前清自摸和 | 멘젠쯔모 |
| Pinfu | 平和 | 핑후 |
| Tanyao | 断幺九 | 탕야오 |
| Iipeikou | 一盃口 | 이페코 |
| Ryanpeikou | 二盃口 | 량페코 |
| Sanshoku Doujun | 三色同順 | 삼색동순 |
| Ittsu | 一気通貫 | 일기통관 |
| Chanta | 混全帯幺九 | 찬타 |
| Junchan | 純全帯幺九 | 준찬타 |
| Toitoi | 対々和 | 또이또이 |
| San Ankou | 三暗刻 | 산안커 |
| Sankantsu | 三槓子 | 산깡쯔 |
| Sanshoku Doukou | 三色同刻 | 삼색동각 |
| Shousangen | 小三元 | 소삼원 |
| Honroutou | 混老頭 | 혼노두 |
| Honitsu | 混一色 | 혼일색 |
| Chinitsu | 清一色 | 청일색 |
| Chiitoitsu | 七対子 | 치또이쯔 |
| Rinshan Kaihou | 嶺上開花 | 영상개화 |
| Chankan | 槍槓 | 창깡 |
| Haitei Raoyue | 海底摸月 | 해저로월 |
| Houtei Raoyui | 河底撈魚 | 하저로어 |
| Bakaze Ton | 場風 東 | 장풍 동 |
| Bakaze Nan | 場風 南 | 장풍 남 |
| Bakaze Sha | 場風 西 | 장풍 서 |
| Bakaze Pei | 場風 北 | 장풍 북 |
| Jikaze Ton | 自風 東 | 자풍 동 |
| Jikaze Nan | 自風 南 | 자풍 남 |
| Jikaze Sha | 自風 西 | 자풍 서 |
| Jikaze Pei | 自風 北 | 자풍 북 |
| Yakuhai Haku | 役牌 白 | 역패 백 |
| Yakuhai Hatsu | 役牌 發 | 역패 발 |
| Yakuhai Chun | 役牌 中 | 역패 중 |
| Haku | 白 | 백 |
| Hatsu | 發 | 발 |
| Chun | 中 | 중 |
| Dora | ドラ | 도라 |
| Uradora | 裏ドラ | 뒷도라 |
| Akadora | 赤ドラ | 적도라 |
| Kokushi Musou | 国士無双 | 국사무쌍 |
| Kokushi Musou 13-men machi | 国士無双十三面待ち | 국사무쌍 13면 대기 |
| Chuuren Poutou | 九蓮宝燈 | 구련보등 |
| Junsei Chuuren Poutou | 純正九蓮宝燈 | 순정구련보등 |
| Suuankou | 四暗刻 | 스안커 |
| Suuankou Tanki | 四暗刻単騎 | 스안커 단기 |
| Daisuushii | 大四喜 | 대사희 |
| Shousuushii | 小四喜 | 소사희 |
| Daisangen | 大三元 | 대삼원 |
| Tsuuiisou | 字一色 | 자일색 |
| Ryuuiisou | 緑一色 | 녹일색 |
| Chinroutou | 清老頭 | 청노두 |
| Suukantsu | 四槓子 | 스깡쯔 |
| Tenhou | 天和 | 천화 |
| Chiihou | 地和 | 지화 |
| Renhou | 人和 | 인화 |
| Daichiishin | 大七星 | 대칠성 |
| Dora manual | ドラ（手入力） | 도라 (수동) |

## Chaves com termo técnico

| Chave | ko | lt |
| --- | --- | --- |
| `menu.quickCalculator` | 판·부 계산기 | Han ir Fu skaičiuoklė |
| `actions.quickMode` | 판·부 | Han ir Fu |
| `calculator.quickTitle` | 판·부 계산기 | Han ir Fu skaičiuoklė |
| `calculator.subtitleQuick` | 판, 부, 화료 방식, 본장으로 점수를 바로 계산합니다. | Apskaičiuokite taškus tiesiai pagal han, fu, laimėjimo būdą ir honba. |
| `calculator.waitsValid` | 현재 설정에서 이 패들로 역이 있는 화료가 됩니다. | Su dabartinėmis parinktimis šie akmenys užbaigia galiojančią ranką su yaku. |
| `calculator.waitsNoYaku` | 이 패들로 모양은 완성되지만, 화료하려면 역이 필요합니다. | Šie akmenys užbaigia formą, bet laimėti dar trūksta yaku. |
| `calculator.furitenWarning` | 후리텐: 자신의 버림패에 있는 대기패로는 론할 수 없습니다. | Furiten: laukimai, kurie jau yra jūsų išmestuose akmenyse, negali laimėti ron būdu. |
| `calculator.invalidNoYakuReview` | 화료할 수 없는 손패입니다. 역을 확인하세요. | Negaliojanti ranka. Prieš laimėdami patikrinkite yaku. |
| `calculator.missingRoundWind` | 장풍 | raundo vėjo |
| `calculator.missingSeatWind` | 자풍 | jūsų vėjo |
| `calculator.doraAndHonba` | 도라와 본장 | Dora ir honba |
| `calculator.honba` | 본장 | Honba |
| `calculator.roundWind` | 장풍 | Raundo vėjas |
| `calculator.seatWind` | 자풍 | Jūsų vėjas |
| `calculator.riichi` | 리치 | Riichi |
| `calculator.ippatsu` | 일발 | Ippatsu |
| `calculator.doubleRiichi` | 더블 리치 | Double Riichi |
| `calculator.riichiClosedHandOnly` | 멘젠만 가능 (치, 퐁, 명깡 없음). | Tik su uždara ranka (be atviro chi, pon ar kan). |
| `calculator.tenhouChiihou` | 천화 / 지화 | Tenhou / Chiihou |
| `calculator.chankan` | 창깡 | Chankan |
| `calculator.rinshan` | 영상개화 | Rinshan |
| `calculator.houtei` | 하저로어 | Houtei |
| `calculator.haitei` | 해저로월 | Haitei |
| `calculator.tsumo` | 쯔모 | Tsumo |
| `calculator.ron` | 론 | Ron |
| `calculator.tenpai` | 텐파이 | Tenpai |
| `calculator.furiten` | 후리텐 | Furiten |
| `calculator.noYaku` | 역 없음 | Be yaku |
| `calculator.doraIndicators` | 도라 표시패 | Dora indikatoriai |
| `calculator.doraUraIndicators` | 도라 / 뒷도라 표시패 | Dora / ura-dora indikatoriai |
| `calculator.doraUraIndicatorsHint` | 도라와 뒷도라를 나타냅니다. 표시패는 최대 10장, 손패의 도라는 최대 13장. | Žymi dora ir ura-dora. Iki 10 indikatorių ir iki 13 dora rankoje. |
| `calculator.noDoraIndicatorSelected` | 선택한 표시패가 없습니다 | Nepasirinktas joks indikatorius |
| `calculator.uraDoraIndicators` | 뒷도라 표시패 | Ura-dora indikatoriai |
| `calculator.manualDoraShort` | 수동 도라 | Rankinė dora |
| `calculator.discardsFuriten` | 버림패 / 후리텐 | Išmesti akmenys / Furiten |
| `calculator.suitMan` | 만 | Man |
| `calculator.suitPin` | 통 | Pin |
| `calculator.suitSou` | 삭 | Sou |
| `calculator.honors` | 자패 | Garbės akmenys |
| `calculator.akaDora` | 빨간 5 (적도라) | Raudonas 5 (aka dora) |
| `calculator.addTileToDiscards` | 후리텐 확인용으로 {{tile}}을(를) 버림패에 추가 | Pridėti {{tile}} prie išmestų akmenų furiten patikrai |
| `calculator.selectDoraIndicator` | {{tile}}을(를) 도라 / 뒷도라 표시패로 선택 | Pasirinkti {{tile}} kaip dora / ura-dora indikatorių |
| `calculator.selectUraDoraIndicator` | {{tile}}을(를) 뒷도라 표시패로 선택 | Pasirinkti {{tile}} kaip ura-dora indikatorių |
| `calculator.chooseChiiSequence` | 치 선택 | Pasirinkite Chi |
| `calculator.chooseChiiSequenceOption` | 치 선택: {{sequence}} | Pasirinkti Chi: {{sequence}} |
| `calculator.removeDoraIndicator` | 도라 / 뒷도라 표시패 {{tile}} 빼기 | Pašalinti dora / ura-dora indikatorių {{tile}} |
| `calculator.removeUraDoraIndicator` | 뒷도라 표시패 {{tile}} 빼기 | Pašalinti ura-dora indikatorių {{tile}} |
| `calculator.clearDoraIndicators` | 도라와 뒷도라 표시패 지우기 | Išvalyti dora ir ura-dora indikatorius |
| `calculator.chooseRon` | 론으로 화료 선택 | Pasirinkti laimėjimą ron būdu |
| `calculator.chooseTsumo` | 쯔모로 화료 선택 | Pasirinkti laimėjimą tsumo būdu |
| `calculator.chooseRoundWind` | 장풍 선택: {{wind}} | Pasirinkti raundo vėją: {{wind}} |
| `calculator.chooseSeatWind` | 자풍 선택: {{wind}} | Pasirinkti žaidėjo vėją: {{wind}} |
| `calculator.furitenChomboTitle` | 후리텐 론에 의한 촌보 | Chombo už ron esant furiten |
| `calculator.furitenChomboTextDealer` | 후리텐 론으로는 화료할 수 없습니다. 벌점: 각 플레이어에게 4,000점. | Ron esant furiten rankos nelaimi. Bauda: po 4 000 kiekvienam žaidėjui. |
| `calculator.furitenChomboTextNonDealer` | 후리텐 론으로는 화료할 수 없습니다. 벌점: 친에게 4,000점, 다른 플레이어에게 각 2,000점. | Ron esant furiten rankos nelaimi. Bauda: 4 000 dalintojui ir po 2 000 kiekvienam kitam žaidėjui. |
| `calculator.noYakuTitle` | 역 없음 — 무효 손패 | Be yaku — negaliojanti ranka |
| `calculator.noYakuPenaltyDealer` | 촌보 벌점: 각 플레이어에게 4,000점. | Chombo bauda: po 4 000 kiekvienam žaidėjui. |
| `calculator.noYakuPenaltyNonDealer` | 촌보 벌점: 동가에게 4,000점, 다른 플레이어에게 각 2,000점. | Chombo bauda: 4 000 Rytams ir po 2 000 kiekvienam kitam žaidėjui. |
| `calculator.addYakuHint` | 역이 없는 손패: 리치, 탕야오 등 역을 추가하세요. | Ranka be yaku: pridėkite Riichi, Tanyao ar kitą yaku. |
| `calculator.resultAnnounce` | 결과: {{agari}}. {{han}}판 {{fu}}부. 점수: {{points}}점. 역: {{yaku}}. | Rezultatas: {{agari}}. {{han}} han, {{fu}} fu. Taškai: {{points}}. Yaku: {{yaku}}. |
| `calculator.invalidFuritenAnnounce` | 무효 결과: 후리텐. 대기패 중 하나를 버렸습니다. | Negaliojantis rezultatas: furiten. Išmetėte vieną iš savo laukimų. |
| `calculator.invalidNoYakuAnnounce` | 무효 결과: 역 없음. 이 손패에는 유효한 역이 없습니다. | Negaliojantis rezultatas: be yaku. Ši ranka neturi galiojančio yaku. |
| `calculator.eastPays` | 동가 지불 | Rytai moka |
| `calculator.eastReceives` | 동가 받음 | Rytai gauna |
| `calculator.chomboPenaltyRule` | 촌보 벌점: {{limit}} | Chombo bauda: {{limit}} |
| `calculator.yakuHeading` | 역 | Yaku |
| `calculator.hanFuSummary` | {{han}}판 {{fu}}부 | {{han}} Han {{fu}} Fu |
| `calculator.hanCount` | other: {{count}}판 | one: {{count}} han · few: {{count}} han · many: {{count}} han · other: {{count}} han |
| `calculator.fuCount` | other: {{count}}부 | one: {{count}} fu · few: {{count}} fu · many: {{count}} fu · other: {{count}} fu |
| `hanFu.isDealer` | 친인가요? | Ar dalintojas? |
| `hanFu.dealer` | 친 | Rytai |
| `hanFu.nonDealer` | 자 | Ne Rytai |
| `hanFu.han` | 판 | Han |
| `hanFu.fu` | 부 | Fu |
| `hanFu.honba` | 본장 | Honba |
| `hanFu.validFu` | 유효한 부 | Galiojantys fu |
| `hanFu.honbaCount` | other: {{count}}본장 | one: {{count}} honba · few: {{count}} honba · many: {{count}} honba · other: {{count}} honba |
| `hanFu.decreaseHan` | 판 줄이기 | Mažinti han |
| `hanFu.increaseHan` | 판 늘리기 | Didinti han |
| `hanFu.decreaseFu` | 부 줄이기 | Mažinti fu |
| `hanFu.increaseFu` | 부 늘리기 | Didinti fu |
| `hanFu.decreaseHonba` | 본장 줄이기 | Mažinti honba |
| `hanFu.increaseHonba` | 본장 늘리기 | Didinti honba |
| `hanFu.limitFuHint` | 만관 이상은 부와 관계없습니다. | Limito rankos nepriklauso nuo fu. |
| `hanFu.yakumanFuHint` | 역만에는 부를 쓰지 않습니다. | Yakuman rankoje fu nenaudojami. |
| `hanFu.ronDetail` | 론 {{points}} | Ron {{points}} |
| `hanFu.dealerTsumoDetail` | 친 {{points}} 올 | Rytai po {{points}} iš visų |
| `hanFu.nonDealerTsumoDetail` | 쯔모: 친 {{dealer}} / 자 {{nonDealer}} | Tsumo: Rytai {{dealer}} / ne Rytai {{nonDealer}} |
| `hanFu.quickReferenceHint` | 본장을 뺀 기본 점수. | Bazinės vertės be honba. |
| `hanFu.quickReferenceLegend` | 범례: 東 친 • 子 자 | Legenda: 東 Rytai • 子 ne Rytai |
| `hanFu.referenceCorner` | 판/부 | Han/Fu |
| `hanFu.referenceCornerTransposed` | 부/판 | Fu/Han |
| `hanFu.fivePlusHan` | 5판 이상 | 5+ Han |
| `hanFu.limitMangan` | 만관 | Mangan |
| `hanFu.limitHaneman` | 하네만 | Haneman |
| `hanFu.limitBaiman` | 배만 | Baiman |
| `hanFu.limitSanbaiman` | 삼배만 | Sanbaiman |
| `hanFu.limitYakuman` | 역만 | Yakuman |
| `hanFu.limitMultipleYakuman` | 복합 역만 | Daugkartinis Yakuman |
| `hanFu.limitDoubleYakuman` | 더블 역만 | Dvigubas Yakuman |
| `hanFu.limitTripleYakuman` | 트리플 역만 | Trigubas Yakuman |
| `hanFu.limitQuadrupleYakuman` | 4배 역만 | Keturgubas Yakuman |
| `hanFu.limitQuintupleYakuman` | 5배 역만 | Penkiagubas Yakuman |
| `hanFu.limitSextupleYakuman` | 6배 역만 | Šešiagubas Yakuman |
| `hanFu.limitKazoe` | 헤아림 역만 | Kazoe Yakuman |
| `hanFu.limitYakumanTimes` | other: {{count}}배 역만 | one: Yakuman · few: {{count}}× Yakuman · many: {{count}}× Yakuman · other: {{count}}× Yakuman |
| `hanFuTutorial.title` | 판과 부 세는 법 | Kaip skaičiuoti Han ir Fu |
| `hanFuTutorial.reference.searchPlaceholder` | 커쯔, 대기, 만관… 검색 | Ieškoti trejeto, laukimo, Mangan… |
| `hanFuTutorial.overview.intro` | 손패의 가치는 두 숫자로 정해집니다. 역과 도라의 세기를 나타내는 판, 그리고 손패를 만들고 화료한 방식의 세부를 세는 부입니다. | Rankos vertė priklauso nuo dviejų skaičių: han, kuris matuoja yaku ir dora stiprumą, ir fu, kuris skaičiuoja, kaip ranka buvo surinkta ir užbaigta. |
| `hanFuTutorial.overview.step1` | 손패의 **판을 센다**. | **Suskaičiuokite rankos han**. |
| `hanFuTutorial.overview.step2` | **5판 이상**이면 만관 이상이라 부를 셀 필요가 없다. | Gavote **5 ar daugiau**? Tai limito ranka, fu skaičiuoti nereikia. |
| `hanFuTutorial.overview.step3` | 그렇지 않으면 **부를 센다**. | Kitu atveju **suskaičiuokite fu**. |
| `hanFuTutorial.overview.step4` | 판과 부를 알면 **표를 본다**. | Turėdami han ir fu, **pažiūrėkite į lentelę**. |
| `hanFuTutorial.han.title` | 판 세기 | Han skaičiavimas |
| `hanFuTutorial.han.sum` | 손패에 있는 모든 역의 판을 더합니다. | Sudėkite visų rankos yaku han. |
| `hanFuTutorial.han.dora` | 도라는 장당 1판이지만 역이 아닙니다. 역이 없으면 화료할 수 없습니다. | Kiekviena dora prideda 1 han, bet dora nėra yaku: be yaku laimėti negalima. |
| `hanFuTutorial.han.open` | 울면 1판이 줄어드는 역이 있습니다. | Kai kurie yaku atviroje rankoje verti 1 han mažiau. |
| `hanFuTutorial.han.reading` | 손패를 여러 방식으로 나눌 수 있으면 판이 가장 많은 쪽을 택합니다. | Jei ranką galima išskaidyti keliais būdais, galioja tas, kuris duoda daugiau han. |
| `hanFuTutorial.baseFu.title` | 기본 부 | Baziniai fu |
| `hanFuTutorial.baseFu.futei` | 역과 상관없이 모든 손패는 **20부**(부저)에서 시작합니다. | Kiekviena ranka prasideda nuo **20 fu** (fūtei), nepriklausomai nuo yaku. |
| `hanFuTutorial.baseFu.ron` | 멘젠 론: **+10**. | Ron su uždara ranka: **+10**. |
| `hanFuTutorial.baseFu.tsumo` | 쯔모: **+2** (핑후 제외). | Tsumo: **+2** (išskyrus Pinfu). |
| `hanFuTutorial.baseFu.chiitoitsu` | 치또이쯔: 항상 **25부** 고정, 더하지도 올림하지도 않습니다. | Chiitoitsu (septynios poros): visada fiksuoti **25 fu**, nieko nepridedama ir neapvalinama. |
| `hanFuTutorial.sets.title` | 몸통의 부 | Derinių fu |
| `hanFuTutorial.sets.intro` | 커쯔와 깡쯔는 부가 붙고, 슌쯔는 붙지 않습니다. | Kiekvienas trejetas ir kiekvienas kan prideda fu; sekos neprideda nieko. |
| `hanFuTutorial.sets.header` | 몸통|중장패 (2–8)|요구패 | Derinys|Paprasti (2–8)|Kraštiniai/Garbės |
| `hanFuTutorial.sets.sequence` | 슌쯔|0|0 | Seka|0|0 |
| `hanFuTutorial.sets.openTriplet` | 밍커|2|4 | Atviras trejetas|2|4 |
| `hanFuTutorial.sets.closedTriplet` | 안커|4|8 | Uždaras trejetas|4|8 |
| `hanFuTutorial.sets.openKan` | 밍깡|8|16 | Atviras kan|8|16 |
| `hanFuTutorial.sets.closedKan` | 안깡|16|32 | Uždaras kan|16|32 |
| `hanFuTutorial.sets.tip` | 안커면 두 배, 요구패면 다시 두 배, 깡은 커쯔의 4배입니다. | Uždaras padvigubina, kraštinis ar garbės akmuo padvigubina dar kartą, o kan vertas 4 trejetų. |
| `hanFuTutorial.pairWait.title` | 머리, 대기, 올림 | Pora, laukimas ir apvalinimas |
| `hanFuTutorial.pairWait.pairTitle` | 머리 | Pora |
| `hanFuTutorial.pairWait.pair` | 머리는 커쯔로 만들면 판이 붙는 패일 때만 부가 붙습니다. 아무 바람이나 되는 게 아니라 자풍과 장풍만입니다. | Pora prideda fu tik tada, kai ji iš akmens, kuris trejete duotų han. Ne bet kuris vėjas: tik jūsų ir raundo. |
| `hanFuTutorial.pairWait.pairDragon` | 삼원패 (백, 발, 중): **+2**. | Bet kuris drakonas (Baltasis, Žaliasis ar Raudonasis): **+2**. |
| `hanFuTutorial.pairWait.pairSeat` | **자풍** (내 자리의 바람): **+2**. | **Jūsų** vėjas, jūsų vietos vėjas: **+2**. |
| `hanFuTutorial.pairWait.pairRound` | **장풍**: **+2**. | **Raundo** vėjas: **+2**. |
| `hanFuTutorial.pairWait.pairDouble` | 자풍이 장풍과 같을 때 (예: 동장의 동가): **+4**. | Kai jūsų vėjas yra ir raundo vėjas (pvz., esate Rytai Rytų raunde): **+4**. |
| `hanFuTutorial.pairWait.waitTitle` | 외길 대기 | Vieno akmens laukimas |
| `hanFuTutorial.pairWait.wait` | 패 한 종류만 기다릴 때: **+2**. 단기, 간짱 (4-6으로 5 대기), 변짱 (1-2로 3 대기)에 해당합니다. | Laukiant vieno akmens: **+2**. Galioja laukiant poros, vidurio (4-6 laukia 5) ar krašto (1-2 laukia 3). |
| `hanFuTutorial.pairWait.openHand` | 운 손패가 기본 20부만 있으면 **30부**가 됩니다. | Atvira ranka, likusi tik su 20 bazinių fu, tampa **30**. |
| `hanFuTutorial.points.title` | 판·부에서 점수로 | Nuo Han/Fu iki taškų |
| `hanFuTutorial.points.formula` | 기본점 = *부* × 2^{2 + *판*} | Baziniai taškai = *Fu* × 2^{2 + *Han*} |
| `hanFuTutorial.points.ron` | **론:** 자는 기본점의 4배, 친은 6배를 방총한 사람에게서 받습니다. | **Ron:** ne dalintojas gauna 4× bazinius taškus, dalintojas 6×, viską iš išmetusio žaidėjo. |
| `hanFuTutorial.points.tsumo` | **쯔모:** 친은 각자에게서 2배씩 받습니다. 자는 친에게서 2배, 다른 자에게서 1배씩 받습니다. | **Tsumo:** dalintojas gauna 2× iš kiekvieno. Ne dalintojas gauna 2× iš dalintojo ir 1× iš kiekvieno kito. |
| `hanFuTutorial.points.cap` | 기본점이 2,000을 넘으면 2,000으로 고정됩니다 (만관). | Jei baziniai taškai viršija 2 000, jie apribojami iki 2 000 (Mangan). |
| `hanFuTutorial.points.exampleTitle` | 예: 4판 110부 | Pavyzdys: 4 Han ir 110 Fu |
| `hanFuTutorial.points.exampleCap` | 2,000을 넘었으니 2,000으로 고정됩니다. 만관입니다. | Viršijo 2 000, todėl apribojama iki 2 000. Tai Mangan. |
| `hanFuTutorial.points.exampleResult` | 자 론 = 2,000 × 4 = 8,000 ⏎ 친 론 = 2,000 × 6 = 12,000 | Ron ne dalintojui = 2 000 × 4 = 8 000 ⏎ Ron dalintojui = 2 000 × 6 = 12 000 |
| `hanFuTutorial.points.finalTip` | 기본점이 2,000을 넘었나요? 계산을 멈춰도 됩니다. 만관입니다. | Baziniai taškai viršijo 2 000? Galite nebeskaičiuoti. Tai Mangan. |
| `hanFuTutorial.limits.header` | 이름|조건|자 子|친 親 | Pavadinimas|Sąlyga|Ko 子|Oya 親 |
| `hanFuTutorial.limits.mangan` | 만관|5판, 또는 4판 40부 이상, 또는 3판 70부 이상|8,000|12,000 | Mangan|5 han, arba 4 han 40+ fu, arba 3 han 70+ fu|8 000|12 000 |
| `hanFuTutorial.limits.haneman` | 하네만|6–7판|12,000|18,000 | Haneman|6–7 han|12 000|18 000 |
| `hanFuTutorial.limits.baiman` | 배만|8–10판|16,000|24,000 | Baiman|8–10 han|16 000|24 000 |
| `hanFuTutorial.limits.sanbaiman` | 삼배만|11–12판|24,000|36,000 | Sanbaiman|11–12 han|24 000|36 000 |
| `hanFuTutorial.limits.kazoe` | 헤아림 역만|13판 이상|32,000|48,000 | Kazoe Yakuman|13+ han|32 000|48 000 |
| `hanFuTutorial.limits.yakuman` | 역만|특수한 손패|32,000|48,000 | Yakuman|specialios rankos|32 000|48 000 |
| `hanFuTutorial.limits.kiriage` | 4판 30부와 3판 60부를 만관으로 올리는 규칙도 있습니다 (절상 만관). 앱에서는 손패 계산기의 계산 규칙에서 설정하며, 빠른 점수표는 이 규칙 없이 점수를 보여 줍니다. | Kai kurios taisyklės 4 han 30 fu ir 3 han 60 fu apvalina iki Mangan (Kiriage Mangan). Programėlėje ši parinktis yra Rankos skaičiuoklės skaičiavimo taisyklėse; greita lentelė rodo vertes be jos. |
| `hanFuTutorial.honba.title` | 본장 | Honba |
| `hanFuTutorial.honba.text` | 본장마다 화료한 사람에게 300점이 더해집니다. 론이면 방총한 사람이 300점을, 쯔모면 각 플레이어가 100점씩 냅니다. | Kiekviena honba laimėtojui prideda 300 taškų. Ron atveju 300 moka išmetęs žaidėjas. Tsumo atveju kiekvienas žaidėjas moka po 100. |
| `hanFuTutorial.examples.sequence` | 슌쯔 | Seka |
| `hanFuTutorial.examples.closedTriplet` | 안커 | Uždaras trejetas |
| `hanFuTutorial.examples.pair` | 머리 | Pora |
| `hanFuTutorial.examples.aTitle` | 예시 A — 쯔모 | Pavyzdys A — tsumo |
| `hanFuTutorial.examples.aSituation` | 자, 남가, 쯔모, 멘젠: 남 안커, 백 머리, 머리를 완성하며 화료. | Ne dalintojas, Pietų vieta, tsumo, uždara ranka: uždaras Pietų trejetas, Baltojo drakono pora, o laimėta užbaigus porą. |
| `hanFuTutorial.examples.aHan` | **판:** 멘젠쯔모 + 역패 = 2 | **Han:** Menzen Tsumo + Yakuhai = 2 |
| `hanFuTutorial.examples.aFu` | 부저 20 ⏎ 남 안커 8 ⏎ 백 머리 2 ⏎ 단기 대기 2 ⏎ 쯔모 2 ⏎ _합계 34 → 40 | Fūtei 20 ⏎ Uždaras Pietų trejetas 8 ⏎ Baltojo drakono pora 2 ⏎ Poros laukimas 2 ⏎ Tsumo 2 ⏎ _Iš viso 34 → 40 |
| `hanFuTutorial.examples.aResult` | **결과:** 700 / 1,300 (자는 700씩, 친은 1,300) | **Rezultatas:** 700 / 1 300 (po 700 iš ne dalintojų, 1 300 iš dalintojo) |
| `hanFuTutorial.examples.bTitle` | 예시 B — 같은 손패를 론으로 | Pavyzdys B — ta pati ranka, ron būdu |
| `hanFuTutorial.examples.bHan` | **판:** 역패 = 1 (쯔모가 아니라 멘젠쯔모 없음) | **Han:** Yakuhai = 1 (be tsumo, todėl nėra Menzen Tsumo) |
| `hanFuTutorial.examples.bFu` | 부저 20 ⏎ 멘젠 론 10 ⏎ 남 안커 8 ⏎ 백 머리 2 ⏎ 단기 대기 2 ⏎ _합계 42 → 50 | Fūtei 20 ⏎ Ron su uždara ranka 10 ⏎ Uždaras Pietų trejetas 8 ⏎ Baltojo drakono pora 2 ⏎ Poros laukimas 2 ⏎ _Iš viso 42 → 50 |
| `melds.chii` | 치 | Chi |
| `melds.pon` | 퐁 | Pon |
| `melds.kanAberto` | 명깡 | Atviras kan |
| `melds.kanFechado` | 암깡 | Uždaras kan |
| `melds.kanCompact` | 깡 | Kan |
| `melds.kanClosedCompact` | 암깡 | Uždaras kan |
| `melds.discards` | 버림패 / 후리텐 | Išmesti / Furiten |
| `menu.quickCalculatorShort` | 판·부 | Han ir Fu |
| `melds.dora` | 도라 / 뒷도라 표시 | Dora / ura ind. |
| `melds.doraCompact` | 도라/뒷 | Dora/Ura |
| `melds.uradora` | 뒷도라 | Ura-dora |
| `tiles.man` | {{number}}만 | {{number}} Man |
| `tiles.pin` | {{number}}통 | {{number}} Pin |
| `tiles.sou` | {{number}}삭 | {{number}} Sou |
| `tiles.redMan` | 빨간 5만 | Raudonas 5 Man |
| `tiles.redPin` | 빨간 5통 | Raudonas 5 Pin |
| `tiles.redSou` | 빨간 5삭 | Raudonas 5 Sou |
| `tiles.east` | 동풍 | Rytų vėjas |
| `tiles.south` | 남풍 | Pietų vėjas |
| `tiles.west` | 서풍 | Vakarų vėjas |
| `tiles.north` | 북풍 | Šiaurės vėjas |
| `tiles.white` | 백 | Baltasis drakonas |
| `tiles.green` | 발 | Žaliasis drakonas |
| `tiles.red` | 중 | Raudonasis drakonas |
| `winds.east` | 동 | Rytai |
| `winds.south` | 남 | Pietūs |
| `winds.west` | 서 | Vakarai |
| `winds.north` | 북 | Šiaurė |
| `sectionHelp.victory.menzen` | 멘젠이면 쯔모는 1판(멘젠쯔모)이고 역이므로, 그것만으로 화료할 수 있습니다. | Su uždara ranka tsumo vertas 1 han (Menzen Tsumo) ir yra yaku, todėl vien jis jau padaro ranką galiojančią. |
| `sectionHelp.victory.yakuTitle` | 역 | Yaku |
| `sectionHelp.honba.points` | 본장마다 화료한 사람에게 300점이 더해집니다. 쯔모면 각자 100점, 론이면 버린 사람이 300점을 냅니다. | Kiekviena honba laimėtojui prideda 300 taškų. Tsumo atveju kiekvienas moka po 100. Ron atveju išmetęs moka 300. |
| `sectionHelp.honba.basengoTitle` | 바센고 (큰 본장) | Basengo (didžioji honba) |
| `sectionHelp.honba.basengo` | 어떤 테이블에서는 본장이 300점이 아니라 1,500점입니다. 쯔모면 각자 본장당 500점을 냅니다. 사용하려면 손패 계산기의 톱니바퀴 아이콘([[engrenagem]])에서 계산 규칙의 바센고를 켜세요. | Prie kai kurių stalų kiekviena honba verta 1 500 taškų vietoj 300. Tsumo atveju kiekvienas žaidėjas moka po 500 už honba. Norėdami naudoti, įjunkite Basengo skaičiavimo taisyklėse, Rankos skaičiuoklės krumpliaračio piktogramoje ([[engrenagem]]). |
| `sectionHelp.dora.title` | 도라는 어떤 패? | Kuris akmuo yra Dora? |
| `sectionHelp.dora.indicatorsTitle` | 도라 표시패 | Dora indikatoriai |
| `sectionHelp.dora.indicators` | 도라 표시패를 선택하세요. 표시패 자체는 도라가 아닙니다. 어떤 패가 도라가 될지 정합니다. | Pasirinkite dora indikatorius. Indikatorius nėra dora. Jis nurodo, kuris akmuo bus skaičiuojamas kaip dora. |
| `sectionHelp.dora.uraDora` | 왕패에서 각 도라 표시패 아래에 있는 패입니다. 도라 표시패가 하나 더 있는 것처럼 작동하지만, 리치 후 화료한 사람에게만 공개됩니다. | Akmuo po kiekvienu dora indikatoriumi mirusioje sienoje. Veikia kaip dar vienas dora indikatorius, bet atskleidžiamas tik tam, kuris laimi paskelbęs Riichi. |
| `sectionHelp.dora.akaTitle` | 적도라 | Aka dora |
| `sectionHelp.dora.aka` | 빨간 5는 도라로 장당 1판입니다. 사용하려면 손패 계산기의 톱니바퀴 아이콘([[engrenagem]])에서 계산 규칙의 적도라를 켜세요. | Raudoni penketai skaičiuojami kaip dora, po 1 han. Norėdami naudoti, įjunkite Aka dora skaičiavimo taisyklėse, Rankos skaičiuoklės krumpliaračio piktogramoje ([[engrenagem]]). |
| `sectionHelp.dora.flamingTitle` | 불꽃 도라 | Liepsnojanti dora |
| `sectionHelp.dora.flaming` | 도라 표시패가 빨간 5이면 그 표시패의 도라는 장당 2판입니다. 사용하려면 손패 계산기의 톱니바퀴 아이콘([[engrenagem]])에서 계산 규칙의 적도라와 불꽃 도라를 켜세요. | Kai dora indikatorius yra raudonas 5, kiekviena to indikatoriaus dora verta 2 han. Norėdami naudoti, įjunkite Aka dora ir Liepsnojančią dora skaičiavimo taisyklėse, Rankos skaičiuoklės krumpliaračio piktogramoje ([[engrenagem]]). |
| `sectionHelp.dora.curiosity` | 리치 마작의 도라(ドラ)는 영어 “dragon”(용)의 줄임말로, 일본어로는 도라곤(ドラゴン)이라고 읽습니다. | Riichi Mahjong žaidime žodis dora (ドラ) yra angliško „dragon“ (drakonas) santrumpa, japoniškai tariama doragon (ドラゴン). |
| `sectionHelp.uraDora.term` | 뒷도라 | Ura-dora |
| `sectionHelp.furiten.rule` | 후리텐 상태에서는 론할 수 없고 쯔모로만 화료할 수 있습니다. 후리텐에서 론을 선언하면 촌보입니다. | Esant furiten negalima laimėti ron būdu, tik tsumo. Paskelbti ron esant furiten yra chombo. |
| `sectionHelp.furiten.typesTitle` | 후리텐의 종류 | Furiten rūšys |
| `sectionHelp.furiten.discards` | 손패를 완성할 패가 자신의 버림패에 있습니다. 대기에 그 패가 포함되는 동안 계속됩니다. | Akmuo, kuris užbaigtų jūsų ranką, yra tarp jūsų išmestų akmenų. Trunka tol, kol jūsų laukimas apima tą akmenį. |
| `sectionHelp.furiten.temporary` | 손패를 완성할 패를 론하지 않고 넘겼습니다. 자신의 다음 타패까지 계속됩니다. | Praleidote akmenį, kuris užbaigtų ranką, nepaskelbę ron. Trunka iki kito jūsų išmetimo. |
| `sectionHelp.furiten.riichiTitle` | 리치 후리텐 | Riichi furiten |
| `sectionHelp.furiten.riichi` | 리치 후 손패를 완성할 패를 넘겼습니다. 손패를 바꿀 수 없으므로 그 국이 끝날 때까지 계속됩니다. | Paskelbę Riichi praleidote akmenį, kuris užbaigtų ranką. Trunka iki raundo pabaigos, nes ranka nebegali keistis. |
| `sectionHelp.furiten.register` | 앱은 버림패로 후리텐을 확인하므로 여기에 버림패를 기록하세요. 동순 후리텐과 리치 후리텐은 테이블에서 일어난 일에 달려 있어 확인하지 않습니다. | Čia užregistruokite savo išmestus akmenis, nes pagal juos programėlė tikrina furiten. Laikinas ir Riichi furiten priklauso nuo to, kas vyko prie stalo, ir nėra tikrinami. |
| `sectionHelp.seatWind.seat` | 이번 국의 내 자리 바람입니다. 자풍 커쯔는 1판이며 역이므로, 그것만으로 화료할 수 있습니다. | Jūsų vietos vėjas šiame raunde. Jūsų vėjo trejetas vertas 1 han ir yra yaku, todėl vien jis jau padaro ranką galiojančią. |
| `sectionHelp.seatWind.dealer` | 동가에 앉은 사람이 친이며, 화료하면 1.5배의 점수를 받습니다. | Tas, kuris sėdi Rytuose, yra dalintojas (oya) ir laimėjęs gauna 1,5× taškų. |
| `sectionHelp.roundWind.round` | 현재 국의 바람입니다. 반장의 전반은 동, 후반은 남입니다. 장풍 커쯔도 1판이며 역입니다. | Dabartinio raundo vėjas. Pirmoje partijos pusėje tai Rytai, antroje – Pietūs. Raundo vėjo trejetas taip pat vertas 1 han ir yra yaku. |
| `sectionHelp.roundWind.double` | 장풍이 자풍과 같으면 그 커쯔는 2판입니다. | Jei raundo vėjas yra ir jūsų vėjas, trejetas vertas 2 han. |
| `sectionHelp.riichi.declaration` | 멘젠으로 텐파이일 때 하는 선언입니다. 1,000점을 공탁해야 합니다. | Pareiškimas, daromas su uždara ranka, kuriai iki užbaigimo trūksta vieno žingsnio (tenpai). Kainuoja 1 000 taškų statymą. |
| `sectionHelp.riichi.value` | 1판이며 역이므로, 그것만으로 화료할 수 있습니다. 뒷도라도 열립니다. 선언 후에는 손패를 바꿀 수 없습니다. | Vertas 1 han ir yra yaku, todėl vien jis jau padaro ranką galiojančią. Taip pat atveria ura-dora. Paskelbus ranka nebegali būti keičiama. |
| `sectionHelp.riichi.doubleRiichi` | 울기 없이 첫 타패에서 하는 리치입니다. 1판이 아니라 2판이며 역입니다. | Riichi, paskelbtas per pirmąjį išmetimą, be ankstesnių iškvietimų. Vertas 2 han vietoj 1 ir taip pat yra yaku. |
| `sectionHelp.riichi.ippatsu` | 리치 후 울기 없이 한 바퀴 안에 화료하는 것. +1판. 역이지만 리치와 함께만 성립합니다. | Laimėjimas per vieną ratą po Riichi, be iškvietimų tarpe. Vertas +1 han. Tai yaku, bet egzistuoja tik kartu su Riichi. |
| `sectionHelp.riichi.uraDora` | 왕패에서 각 도라 표시패 아래에 있는 패입니다. 도라 표시패가 하나 더 있는 것처럼 작동하지만, 리치 후 화료한 사람에게만 공개됩니다. | Akmuo po kiekvienu dora indikatoriumi mirusioje sienoje. Veikia kaip dar vienas dora indikatorius, bet atskleidžiamas tik tam, kuris laimi paskelbęs Riichi. |
| `sectionHelp.specialConditions.allYaku` | 모두 역이므로, 다른 역이 없어도 어느 하나만으로 화료할 수 있습니다. | Visos jos yra yaku, todėl bet kuri iš jų jau padaro ranką galiojančią, net be kito yaku. |
| `sectionHelp.specialConditions.tenhouChiihouTitle` | 천화와 지화 | Tenhou ir Chiihou |
| `sectionHelp.specialConditions.tenhouChiihou` | 배패 그대로 화료하는 것. 친이면 천화, 자면 지화. 역만입니다. | Laimėjimas su pradine ranka. Tenhou – dalintojo, Chiihou – kitų žaidėjų. Verti Yakuman. |
| `sectionHelp.specialConditions.rinshan` | 깡 후에 뽑은 패로 화료하는 것. +1판. | Laimėjimas akmeniu, paimtu po kan. Vertas +1 han. |
| `sectionHelp.specialConditions.chankan` | 다른 플레이어가 퐁에 더해 깡으로 만든 패를 론하는 것. +1판. | Ron ant akmens, kurį kitas žaidėjas pridėjo prie pon, kad sudarytų kan. Vertas +1 han. |
| `sectionHelp.specialConditions.haitei` | 패산의 마지막 패로 쯔모 화료하는 것. +1판. | Laimėjimas tsumo būdu su paskutiniu sienos akmeniu. Vertas +1 han. |
| `sectionHelp.specialConditions.houtei` | 그 국의 마지막 버림패로 론 화료하는 것. +1판. | Laimėjimas ron būdu su paskutiniu partijos išmestu akmeniu. Vertas +1 han. |
| `rulesModal.akadora.title` | 적도라 | Aka dora |
| `rulesModal.akadora.help` | 빨간 5를 도라로 셉니다. 켜면 키보드에 수패마다 빨간 5가 나타납니다. | Leidžia raudonus penketus skaičiuoti kaip dora. Įjungus klaviatūroje rodomas raudonas 5 kiekvienai rūšiai. |
| `rulesModal.doraFlamejante.title` | 불꽃 도라 | Liepsnojanti dora |
| `rulesModal.doraFlamejante.help` | 도라 표시패가 빨간 5이면 도라는 장당 2판입니다. 적도라가 켜져 있어야 합니다. | Kai dora indikatorius yra raudonas 5, kiekviena dora verta 2 han. Reikia įjungtos Aka dora. |
| `rulesModal.tanyaoAberto.title` | 쿠이탕 | Atviras Tanyao |
| `rulesModal.tanyaoAberto.help` | 운 손패에서 탕야오를 인정할지 정합니다. 현대 일본 규칙에서는 흔하지만, 쿠이탕 없음으로 하는 모임도 있습니다. | Nustato, ar Tanyao galioja su atvirais iškvietimais. Įprasta šiuolaikinėse japoniškose taisyklėse, bet kai kurios grupės žaidžia kuitan nashi. |
| `rulesModal.fuVentosDuplo.title` | 연풍패 머리 | Dvigubo vėjo pora |
| `rulesModal.fuVentosDuplo.help` | 머리가 장풍이자 자풍일 때 4부로 치는 규칙이 있습니다. 현대 경기 규칙에서는 보통 2부입니다. | Kai pora yra ir raundo, ir vietos vėjas, kai kurios taisyklės prideda 4 fu. Šiuolaikinėse varžybų taisyklėse paprastai 2 fu. |
| `rulesModal.fuVentosDuplo.on` | 4부 | 4 fu |
| `rulesModal.fuVentosDuplo.off` | 2부 | 2 fu |
| `rulesModal.fuRinshan.title` | 영상개화의 부 | Fu už Rinshan |
| `rulesModal.fuRinshan.help` | 영상개화 화료에 쯔모 2부도 붙일지 정합니다. | Nustato, ar laimėjimas Rinshan Kaihou būdu gauna ir 2 tsumo fu. |
| `rulesModal.fuRinshan.on` | +2부 | +2 fu |
| `rulesModal.fuRinshan.off` | +2부 없음 | Be +2 fu |
| `rulesModal.kiriageMangan.title` | 절상 만관 | Kiriage Mangan |
| `rulesModal.kiriageMangan.help` | 절상을 쓰는 테이블에서 4판 30부와 3판 60부를 만관으로 올립니다. | Apvalina 4 han 30 fu ir 3 han 60 fu iki Mangan, kai prie stalo naudojamas kiriage. |
| `rulesModal.kazoeYakuman.title` | 헤아림 역만 | Kazoe Yakuman |
| `rulesModal.kazoeYakuman.help` | 역만 없이 13판 이상이면 헤아림 역만으로 칠지, 삼배만에서 멈출지 정합니다. | Nustato, ar 13 ir daugiau han be natūralaus Yakuman skaičiuojami kaip suskaičiuotas Yakuman, ar sustoja ties Sanbaiman. |
| `rulesModal.kazoeYakuman.on` | 역만 | Yakuman |
| `rulesModal.kazoeYakuman.off` | 삼배만 | Sanbaiman |
| `rulesModal.yakumanDuplo.title` | 더블 역만 | Dvigubas Yakuman |
| `rulesModal.yakumanDuplo.help` | 스안커 단기나 국사무쌍 13면 대기 같은 특별한 형태를 더블 역만으로 칩니다. | Leidžia specialioms formoms, pvz., Suuankou tanki ar 13 laukimų Kokushi, būti dvigubu Yakuman. |
| `rulesModal.multiYakuman.title` | 역만 복합 | Sumuojami Yakuman |
| `rulesModal.multiYakuman.help` | 대사희와 자일색처럼 한 손패에서 여러 역만을 합산할 수 있게 합니다. | Leidžia sumuoti kelis Yakuman toje pačioje rankoje, pvz., Daisuushii kartu su Tsuuiisou. |
| `rulesModal.basengo.title` | 바센고 | Basengo |
| `rulesModal.basengo.help` | 본장이 300점이 아니라 1,500점입니다. 쯔모면 각자 본장당 500점을 냅니다. | Kiekviena honba verta 1 500 taškų vietoj 300. Tsumo atveju kiekvienas žaidėjas moka po 500 už honba. |
| `rulesModal.chomboMangan.title` | 촌보 벌점 | Chombo bauda |
| `rulesModal.chomboMangan.help` | 촌보(역 없음, 후리텐 론)를 한 사람이 내는 점수. 만관: 8,000 (동가면 12,000). 역만: 32,000 (동가면 48,000). | Kiek moka padaręs chombo (be yaku, ron esant furiten). Mangan: 8 000 (12 000 būnant Rytais). Yakuman: 32 000 (48 000 būnant Rytais). |
| `rulesModal.chomboMangan.on` | 만관 | Mangan |
| `rulesModal.chomboMangan.off` | 역만 | Yakuman |
| `pages.aboutText` | 리치 마작 플레이어와 클럽이 손패를 계산하고, 대국을 관리하고, 대회 아이디어를 시험해 볼 수 있도록 만든 앱입니다. 모두를 위한 리치 마작. | Programėlė, sukurta padėti Riichi Mahjong žaidėjams ir klubams skaičiuoti rankas, organizuoti partijas ir išbandyti turnyrų idėjas – Riichi Mahjong visiems. |
| `windDraw.tapAreaLabel` | 플레이어 {{player}}의 바람 뽑기 | Burti vėją {{player}} žaidėjui |
| `windDraw.howItWorksText` | 바람의 순서는 첫 터치 전에 암호학적 난수 생성기로 섞입니다. 터치는 다음 바람을 보여 줄 뿐이며, 언제 누르는지와 몇 번째로 뽑는지는 결과를 바꾸지 않습니다. 각 플레이어가 각 바람을 뽑을 확률은 정확히 25%입니다. | Vėjų tvarka sumaišoma kriptografiniu atsitiktinių skaičių generatoriumi prieš pirmąjį palietimą. Palietimas tik atskleidžia kitą vėją — kada paliečiate ir kelintas traukiate, nieko nekeičia. Kiekvienas žaidėjas turi lygiai 25 % tikimybę ištraukti kiekvieną vėją. |
| `windDraw.ronRon` | 론론! | Ron ron! |
| `learn.tagline` | other: 리치 마작을 처음부터 끝까지. {{count}}개 모듈이면 첫 대국을 할 수 있습니다. | one: Riichi Mahjong nuo pradžios iki galo. Per {{count}} modulį jau žaisite pirmąją partiją. · few: Riichi Mahjong nuo pradžios iki galo. Per {{count}} modulius jau žaisite pirmąją partiją. · many: Riichi Mahjong nuo pradžios iki galo. Per {{count}} modulio jau žaisite pirmąją partiją. · other: Riichi Mahjong nuo pradžios iki galo. Per {{count}} modulių jau žaisite pirmąją partiją. |
| `learn.conclusionSecret` | 초단에 오른 사람만을 위한 비밀 메시지: M리그에서 아직 연락은 없지만 시간문제입니다. 그때까지 후리텐 론은 금지. | Slapta žinutė tik pasiekusiems 1-ąjį dan: M.League dar neskambino, bet tai tik laiko klausimas. O kol kas – jokio ron esant furiten. |
| `fuDetails.baseDesc` | 모든 화료에 붙는 기본 부 | Baziniai fu kiekvienai laiminčiai rankai |
| `fuDetails.chiitoi` | 치또이쯔 | Chiitoitsu |
| `fuDetails.chiitoiDesc` | 치또이쯔는 25부 고정 | Septynios poros turi fiksuotus 25 fu |
| `fuDetails.pinfuTsumo` | 핑후 쯔모 | Pinfu tsumo |
| `fuDetails.pinfuTsumoDesc` | 멘젠 핑후를 쯔모로 화료 | Uždara Pinfu ranka, laimėta tsumo būdu |
| `fuDetails.closedRon` | 멘젠 론 | Uždaras ron |
| `fuDetails.rinshan` | 영상개화 | Rinshan |
| `fuDetails.rinshanDesc` | 깡 후 쯔모, 선택한 규칙에 따름 | Tsumo po kan, pagal pasirinktą taisyklę |
| `fuDetails.tsumo` | 쯔모 | Tsumo |
| `fuDetails.openPinfu` | 운 손패 부 없음 | Atvira ranka be fu |
| `fuDetails.openPinfuDesc` | 다른 부가 없는 운 손패의 최소 올림 | Minimalus apvalinimas atvirai rankai be kitų fu |
| `fuDetails.yakuhaiPair` | 역패 머리 | Yakuhai pora |
| `fuDetails.yakuhaiPairDoubleDesc` | {{tiles}} (장풍이자 자풍) | {{tiles}} kaip raundo ir vietos vėjas |
| `fuDetails.valuePair` | 역패 머리 | Vertinga pora |
| `fuDetails.openTriplet` | 밍커 | Atviras trejetas |
| `fuDetails.closedTriplet` | 안커 | Uždaras trejetas |
| `fuDetails.openKan` | 밍깡 | Atviras kan |
| `fuDetails.closedKan` | 안깡 | Uždaras kan |
| `fuDetails.triplet` | 커쯔 | Trejetas |
| `fuDetails.kan` | 깡쯔 | Kan |
| `fuDetails.terminalHonorDesc` | {{tiles}} (요구패) | {{tiles}}, kraštinis/garbės |
| `fuDetails.wait` | 대기 | Laukimas |
| `fuDetails.waits.ryanmen` | 양면 대기 | atviras dvipusis laukimas |
| `fuDetails.waits.shanpon` | 샤보 대기 | poros laukimas trejetui sudaryti |
| `fuDetails.waits.kanchan` | 간짱 대기 | uždaras vidurio laukimas |
| `fuDetails.waits.penchan` | 변짱 대기 | krašto laukimas |
| `fuDetails.waits.tanki` | 단기 대기 | poros laukimas |
| `fuDetails.waitGeneric` | 대기 종류 | Laukimo tipas |
| `fuDetails.generic` | 부 | Fu |
| `pocketGuide.tabs.sequences` | 슌쯔 역 | Sekų yaku |
| `pocketGuide.tabs.terminals` | 요구패 역 | Kraštinių yaku |
| `pocketGuide.tabs.triplets` | 커쯔 역 | Trejetų yaku |
| `pocketGuide.tabs.suits` | 패 종류 역 | Spalvų yaku |
| `pocketGuide.yakumanHeading` | 역만 (최고 점수 손패) | Yakuman (didžiausios rankos) |
| `pocketGuide.closed` | 멘젠 | Uždara |
| `pocketGuide.open` | 후로 | Atvira |
| `pocketGuide.howToCountStrong` + `howToCountRest` | 판과 부 세는 법 (단계별) | Kaip skaičiuoti han ir fu žingsnis po žingsnio |

## Guia de bolso (conteúdo longo)

Os textos do Guia de bolso (glossário, descrição e dica de cada yaku, notas de dora e
kazoe) ficam em `src/dominios/calculadora-mao/conteudo/guia-bolso/ko.ts` e `lt.ts`, não nos
locales. O tipo `ConteudoGuiaBolso` faz o `npm run typecheck` falhar se faltar um texto.

Cada verbete tem `aliases`: as formas que viram link nos textos. Em coreano o termo precisa
começar a palavra, mas pode ter partícula colada no fim ("리치를"); em lituano o termo é palavra
inteira, então os aliases listam as declinações usadas (seka, sekos, seką, sekų…). Ao trocar
um termo no texto, troque também nos aliases.

| Termo | ko | lt |
| --- | --- | --- |
| Sequência / trinca / par | 슌쯔 / 커쯔 / 머리 (또이쯔) | seka / trejetas / pora |
| Quad (kan) | 깡쯔 | ketvertas |
| Naipe | 패 종류 (만수, 통수, 삭수) | rūšis (Man, Pin, Sou: Simboliai, Apskritimai, Bambukai) |
| Terminais / simples | 요구패, 노두패 / 중장패 | kraštiniai / paprasti |
| Honras / ventos / dragões | 자패 / 풍패 / 삼원패 | garbės akmenys / vėjai / drakonai |
| Chamada (naki) | 울기 (나키, 후로) | šaukimas |
| Mão aberta / fechada | 후로 / 멘젠 | atvira / uždara ranka |
| Oya / ko | 친 / 자 | dalintojas (Oya) / Ko |
| Renchan | 연장 | Renchan |
| Empate / empate abortivo | 유국 / 도중유국 | lygiosios / nutrauktos lygiosios |
| Ron duplo / atamahane | 더블 론 / 선취(아타마하네) | dvigubas ron / Atamahane |
| Furiten (tipos) | 버림패·동순·리치 후 후리텐 | dėl išmestų akmenų / laikinas / po Riichi |
| Chombo | 촌보 | Chombo |
| Patamares | 만관 이상 구간 (만관, 하네만, 배만, 삼배만, 역만) | Taškų ribos (romaji) |
| Kazoe yakuman | 헤아림 역만 | Kazoe yakuman |
| Muro / muro morto | 패산 / 왕패 | siena / mirusi siena |
| Indicador de dora | 도라 표시패 | dora indikatorius |
| Aka dora | 적도라 (빨간 5) | Aka dora (raudonas 5) |
| Nomes descritivos dos yakus (subtítulo) | — (só o nome em hangul) | ex.: "Vien paprasti", "Septynios poros", "Trylika našlaičių" |
| Yakuhai no Resultado | 장풍 / 자풍 / 연풍패 | Raundo vėjas / Jūsų vėjas / dvigubas vėjas |
