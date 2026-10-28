import type { ConteudoGuiaBolso } from './tipos'

// Termos de mesa em lituano sem revisão nativa: ver src/compartilhado/i18n/REVISAR.md.

const IPPATSU = 'Laimėti per vieną ratą po Riichi, kai tarpe niekas nešaukė.'

export const conteudo: ConteudoGuiaBolso = {
  categorias: {
    sequencias: 'Pagal sekas',
    'terminais-honras': 'Pagal kraštinius / garbės akmenis',
    'trincas-pares': 'Pagal poras / trejetus / ketvertus',
    naipes: 'Pagal rūšis',
    outros: 'Kiti yaku',
  },

  yakus: {
    iipeikou: {
      nome: 'Dviguba gryna seka',
      descricao: 'Dvi vienodos sekos tos pačios rūšies. Tik uždara ranka.',
    },
    ryanpeikou: {
      nome: 'Dvi dvigubos grynos sekos',
      descricao: 'Du Iipeikou toje pačioje rankoje. Tik uždara ranka. Nesijungia su Chiitoitsu.',
    },
    pinfu: {
      nome: 'Ranka be fu',
      descricao:
        '4 sekos + pora, kuri nėra drakonas, raundo vėjas ar jūsų vėjas, laimint su ryanmen laukimu. Kitų vėjų pora tinka. Tik uždara ranka.',
    },
    'sanshoku-doujun': {
      nome: 'Trijų spalvų seka',
      descricao: 'Ta pati seka visose trijose rūšyse (pvz., 234 iš Man, Pin ir Sou).',
    },
    ittsuu: { nome: 'Gryna tiesė', descricao: '123, 456 ir 789 tos pačios rūšies.' },
    tanyao: {
      nome: 'Vien paprasti',
      descricao:
        'Tik akmenys nuo 2 iki 8. Be kraštinių ir be garbės akmenų. Pagal EMA galioja ir atvira (kuitan).',
    },
    yakuhai: {
      nome: 'Vertingas trejetas',
      descricao:
        'Drakono, raundo vėjo (bakaze) ar jūsų vėjo (jikaze) trejetas arba ketvertas. 1 han už trejetą. Dvigubas vėjas vertas 2.',
    },
    shousangen: {
      nome: 'Trys maži drakonai',
      descricao: 'Du drakonų trejetai + trečiojo drakono pora (Yakuhai skaičiuojami papildomai).',
    },
    daisangen: { nome: 'Trys dideli drakonai', descricao: 'Visų trijų drakonų trejetai.' },
    shousuushii: {
      nome: 'Keturi maži vėjai',
      descricao: 'Trys vėjų trejetai + ketvirtojo vėjo pora.',
    },
    daisuushii: { nome: 'Keturi dideli vėjai', descricao: 'Visų keturių vėjų trejetai.' },
    chanta: {
      nome: 'Kraštiniai ir garbės visur',
      descricao:
        'Kiekvienoje grupėje ir poroje yra kraštinis ar garbės akmuo. Reikia bent vienos sekos.',
    },
    junchan: {
      nome: 'Kraštiniai visur',
      descricao: 'Kiekvienoje grupėje ir poroje yra kraštinis akmuo. Be garbės akmenų.',
    },
    honroutou: {
      nome: 'Kraštiniai ir garbės',
      descricao: 'Tik kraštiniai ir garbės akmenys (visada kartu su Toitoi arba Chiitoitsu).',
    },
    chinroutou: { nome: 'Vien kraštiniai', descricao: 'Ranka tik iš 1 ir 9.' },
    tsuuiisou: { nome: 'Vien garbės', descricao: 'Ranka tik iš vėjų ir drakonų.' },
    kokushi: {
      nome: 'Trylika našlaičių',
      descricao:
        'Po vieną kiekvieno kraštinio ir garbės akmens (13 akmenų) + vienas pasikartojantis. Tik uždara.',
    },
    chiitoitsu: {
      nome: 'Septynios poros',
      descricao:
        'Lygiai 7 poros, tik su uždara ranka. Atminkite, kad dvi vienodos poros nesiskaičiuoja.',
      dica: 'Verta bandyti, kai pradinėje rankoje jau yra 4 poros. Geriausia pradėti nuo 5. Priklausomai nuo rankos, gali būti geriau siekti Toitoi.',
    },
    toitoi: { nome: 'Vien trejetai', descricao: '4 trejetai (arba ketvertai) + 1 pora.' },
    sanankou: {
      nome: 'Trys paslėpti trejetai',
      descricao: 'Trys trejetai, surinkti nešaukiant akmenų (likusi ranka gali būti atvira).',
    },
    suuankou: {
      nome: 'Keturi paslėpti trejetai',
      descricao: 'Keturi trejetai, surinkti nešaukiant akmenų. Tik uždara.',
    },
    'sanshoku-doukou': {
      nome: 'Trijų spalvų trejetas',
      descricao: 'Tas pats skaičių trejetas visose trijose rūšyse.',
    },
    sankantsu: { nome: 'Trys ketvertai', descricao: 'Trys ketvertai, atviri ar uždari.' },
    suukantsu: { nome: 'Keturi ketvertai', descricao: 'Keturi ketvertai.' },
    honitsu: { nome: 'Pusiau vienos rūšies', descricao: 'Viena rūšis kartu su garbės akmenimis.' },
    chinitsu: { nome: 'Vienos rūšies', descricao: 'Viena rūšis, be garbės akmenų.' },
    ryuuiisou: {
      nome: 'Vien žalia',
      descricao: 'Tik Sou 2, 3, 4, 6, 8 ir Žaliasis drakonas.',
    },
    chuuren: {
      nome: 'Devyneri vartai',
      descricao: 'Vienos rūšies 1112345678999 + bet kuris tos pačios rūšies akmuo. Tik uždara.',
    },
    riichi: {
      nome: 'Pasiruošimo skelbimas',
      descricao:
        'Paskelbiama esant tenpai su uždara ranka, statant 1 000 taškų. Įjungia Ippatsu ir Ura-dora.',
    },
    'double-riichi': {
      nome: 'Dvigubas Riichi',
      descricao: 'Riichi, paskelbtas su pirmuoju išmetimu, kai prieš tai niekas nešaukė.',
    },
    ippatsu: { nome: 'Vienu šūviu', descricao: IPPATSU },
    'menzen-tsumo': {
      nome: 'Uždaras tsumo',
      descricao: 'Laimėti savo paimtu akmeniu (tsumo) su visiškai uždara ranka.',
    },
    haitei: { nome: 'Jūros dugne', descricao: 'Laimėti tsumo su paskutiniu sienos akmeniu.' },
    houtei: { nome: 'Upės dugne', descricao: 'Laimėti su paskutiniu rankos išmestu akmeniu.' },
    rinshan: {
      nome: 'Gėlė ant kalno',
      descricao: 'Laimėti su pakaitiniu akmeniu, paimtu paskelbus kan.',
    },
    chankan: {
      nome: 'Pavogtas kan',
      descricao:
        'Laimėti su akmeniu, kurį kitas žaidėjas prideda prie pon, kad sudarytų kan. Uždarą kan galima pavogti tik dėl Kokushi.',
    },
    tenhou: { nome: 'Dangaus palaima', descricao: 'Dalintojas laimi su pradine ranka.' },
    chiihou: {
      nome: 'Žemės palaima',
      descricao: 'Ne dalintojas laimi tsumo pirmuoju ėmimu, kai prieš tai niekas nešaukė.',
    },
    renhou: {
      nome: 'Žmogaus palaima',
      descricao:
        'Laimėti ron prieš pirmąjį savo ėmimą, kai prieš tai niekas nešaukė. Nesumuojama su kitais yaku ar dora (EMA).',
    },
  },

  notaDora:
    'Dora nėra yaku: ji prideda han tik tada, kai ranka jau turi bent vieną yaku. Indikatorius rodo kitą akmenį (9→1, Š→R, Raudonas→Baltas).',
  notaKazoe:
    '**Kazoe yakuman** nėra yaku: tai ranka, surinkusi 13 han ar daugiau (yaku ir dora), kuri skaičiuojama kaip Yakuman. Ne prie kiekvieno stalo jis naudojamas: be jo ranka sustoja ties Sanbaiman.',

  iniciante: [
    { titulo: 'Būtiniausi 1 han yaku', subtitulo: 'Pradėkite nuo šių' },
    { titulo: 'Lengvi 2+ han yaku', subtitulo: 'Kitam žingsniui' },
  ],

  ciclosDora: {
    numeros: { titulo: 'Skaičiai', detalhe: 'Vienu daugiau, po 9 vėl 1.' },
    ventos: { titulo: 'Vėjai', detalhe: 'Rytai → Pietūs → Vakarai → Šiaurė → Rytai.' },
    dragoes: { titulo: 'Drakonai', detalhe: 'Baltas → Žalias → Raudonas → Baltas.' },
  },

  nomesHonras: {
    '1z': 'Ton',
    '2z': 'Nan',
    '3z': 'Shaa',
    '4z': 'Pei',
    '5z': 'Haku',
    '6z': 'Hatsu',
    '7z': 'Chun',
  },

  yakuhai: {
    ventos: { Ton: 'Rytų', Nan: 'Pietų', Sha: 'Vakarų', Pei: 'Šiaurės' },
    dragoes: { Haku: 'Baltasis drakonas', Hatsu: 'Žaliasis drakonas', Chun: 'Raudonasis drakonas' },
    tituloRodada: 'Raundo vėjas',
    tituloAssento: 'Jūsų vėjas',
    textoDragao: 'Trejetas arba ketvertas: {{dragao}}. Vertas 1 han.',
    textoVentoRodada:
      '{{vento}} vėjo trejetas arba ketvertas, dabartinio raundo vėjas. Vertas 1 han.',
    textoVentoAssento: '{{vento}} vėjo trejetas arba ketvertas, jūsų vėjas. Vertas 1 han.',
    dicaVentoDuploRodada:
      'Kadangi šis vėjas yra ir jūsų vėjas, tas pats trejetas skaičiuojamas du kartus (dvigubas vėjas) ir iš viso vertas 2 han.',
    dicaVentoDuploAssento:
      'Kadangi šis vėjas yra ir raundo vėjas, tas pats trejetas skaičiuojamas du kartus (dvigubas vėjas) ir iš viso vertas 2 han.',
  },

  secoes: {
    naipes: {
      titulo: 'Rūšys',
      intro: 'Akmenys su skaičiais nuo 1 iki 9, trijų rūšių.',
      aliases: ['rūšis', 'rūšies', 'rūšį', 'rūšys', 'rūšių', 'rūšyse'],
      itens: {
        man: { nome: 'Man', apelido: 'Simboliai', aliases: ['man', 'manzu'] },
        pin: { nome: 'Pin', apelido: 'Apskritimai', aliases: ['pin', 'pinzu'] },
        sou: { nome: 'Sou', apelido: 'Bambukai', aliases: ['sou', 'souzu'] },
        terminais: {
          nome: 'Kraštiniai ir paprasti',
          topicos: ['1 ir 9 yra **kraštiniai**.', 'Nuo 2 iki 8 yra **paprasti**.'],
          aliases: [
            'kraštinis',
            'kraštiniai',
            'kraštinio',
            'kraštinių',
            'kraštiniais',
            'routouhai',
            'paprasti',
            'paprastų',
            'chunchanpai',
          ],
        },
      },
    },
    honras: {
      titulo: 'Garbės akmenys',
      intro: 'Akmenys be skaičių: vėjai ir drakonai.',
      aliases: [
        'garbės akmuo',
        'garbės akmenys',
        'garbės akmenų',
        'garbės akmenimis',
        'garbės',
        'jihai',
      ],
      itens: {
        ventos: {
          nome: 'Vėjai',
          texto: 'Ton (Rytai), Nan (Pietūs), Shaa (Vakarai), Pei (Šiaurė)',
          aliases: ['vėjas', 'vėjo', 'vėją', 'vėjai', 'vėjų', 'vėjais', 'kazehai'],
        },
        dragoes: {
          nome: 'Drakonai',
          texto: 'Haku (Baltas), Hatsu (Žalias), Chun (Raudonas)',
          aliases: ['drakonas', 'drakono', 'drakoną', 'drakonai', 'drakonų', 'sangenpai'],
        },
      },
    },
    mao: {
      titulo: 'Rankos sudėtis',
      intro: 'Įprasta ranka turi 4 grupes (sekas ar trejetus) + 1 porą.',
      rotulosExemplo: ['Seka', 'Seka', 'Trejetas', 'Trejetas', 'Pora'],
      itens: {
        sequencia: {
          nome: 'Seka',
          texto:
            'Trys iš eilės einantys tos pačios rūšies skaičiai (pvz., Pin 3-4-5). Gali būti iš chi.',
          aliases: ['seka', 'sekos', 'seką', 'sekas', 'sekų', 'shuntsu'],
        },
        trinca: {
          nome: 'Trejetas',
          texto: 'Trys vienodi akmenys. Gali būti iš pon.',
          aliases: ['trejetas', 'trejeto', 'trejetą', 'trejetai', 'trejetų', 'trejetus', 'koutsu'],
        },
        par: {
          nome: 'Pora',
          texto: 'Du vienodi akmenys.',
          aliases: ['pora', 'poros', 'porą', 'poras', 'porų', 'jantou'],
        },
      },
    },
    chamadas: {
      titulo: 'Šaukimai',
      itens: {
        chamada: {
          nome: 'Šaukimas',
          leitura: 'naki',
          texto:
            'Paimti kito žaidėjo išmestą akmenį ir sudaryti derinį su chi, pon ar kan. Kiekvienas šaukimas atveria ranką, išskyrus uždarą kan.',
          aliases: ['šaukimas', 'šaukimo', 'šaukimą', 'šaukimai', 'šaukimų', 'šaukti', 'naki'],
        },
        chi: {
          nome: 'Chi',
          texto: 'Paimti kairėje sėdinčio žaidėjo išmestą akmenį ir sudaryti seką.',
          aliases: ['chi', 'chii'],
        },
        pon: {
          nome: 'Pon',
          texto: 'Paimti bet kurio žaidėjo išmestą akmenį ir sudaryti trejetą.',
          aliases: ['pon'],
        },
        kan: {
          nome: 'Kan',
          texto:
            'Keturi vienodi akmenys. Paimate pakaitinį akmenį ir atverčiate dar vieną dora indikatorių. Uždaras kan (visi keturi jūsų) ranką palieka uždarą.',
          aliases: ['kan', 'kantsu', 'ketvertas', 'ketverto', 'ketvertą', 'ketvertai', 'ketvertų'],
        },
        kuitan: {
          nome: 'Kuitan',
          texto:
            "Tan'yao su atvira ranka. Leidžiama pagal EMA taisykles, bet prie kai kurių stalų žaidžiama be jo (kuitan nashi).",
          aliases: ['kuitan'],
        },
      },
    },
    vitoria: {
      titulo: 'Laukimas ir laimėjimas',
      itens: {
        tenpai: {
          nome: 'Tenpai',
          texto: 'Iki užbaigtos rankos trūksta tik vieno akmens.',
          aliases: ['tenpai', 'tempai'],
        },
        ryanmen: {
          nome: 'Ryanmen',
          texto:
            'Dvipusis laukimas: du iš eilės einantys skaičiai, kuriuos užbaigia akmuo iš bet kurios pusės (3-4 laukia 2 arba 5).',
          aliases: ['ryanmen'],
        },
        riichi: {
          nome: 'Riichi',
          texto: 'Paskelbti tenpai su uždara ranka, statant 1 000 taškų. Vertas 1 han.',
          aliases: ['riichi'],
        },
        ippatsu: { nome: 'Ippatsu', aliases: ['ippatsu', 'ipatsu'] },
        tsumo: {
          nome: 'Tsumo',
          texto: 'Laimėti su akmeniu, kurį paėmėte patys.',
          aliases: ['tsumo'],
        },
        ron: { nome: 'Ron', texto: 'Laimėti su kito žaidėjo išmestu akmeniu.', aliases: ['ron'] },
        'ron-duplo': {
          nome: 'Dvigubas ron',
          leitura: 'daburon',
          texto:
            'Du žaidėjai skelbia ron dėl to paties išmesto akmens ir abu laimi. Išmetęs žaidėjas moka kiekvienam iš jų.',
          topicos: [
            '**Atamahane**: prie kai kurių stalų dvigubas ron negalimas ir laimi tik vienas: tas, kurio eilė pirmoji po išmetusio.',
            'Kai trys skelbia ron dėl to paties akmens, prie daugelio stalų ranka anuliuojama (sanchahou).',
          ],
          aliases: ['dvigubas ron', 'double ron', 'daburon', 'atamahane'],
        },
        furiten: {
          nome: 'Furiten',
          texto: 'Jei jau išmetėte vieną iš savo laukiamų akmenų, negalite laimėti ron, tik tsumo.',
          topicos: [
            '**Dėl išmestų akmenų**: akmuo, kuris užbaigtų jūsų ranką, yra tarp jūsų išmestų.',
            '**Laikinas**: praleidote akmenį, kuris užbaigtų jūsų ranką. Galioja iki kito jūsų išmetimo.',
            '**Po Riichi**: po Riichi praleidote akmenį, kuris užbaigtų jūsų ranką. Galioja iki rankos pabaigos.',
          ],
          aliases: ['furiten'],
        },
      },
    },
    dora: {
      titulo: 'Dora',
      itens: {
        dora: {
          nome: 'Dora',
          texto:
            'Premijinis akmuo, kurį rodo indikatorius. Kiekvienas vertas 1 han, bet tai nėra yaku.',
          topicos: [
            '**Indikatorius** yra atverstas akmuo mirusioje sienoje.',
            'Dora yra kitas akmuo pagal žemiau esančią tvarką (indikatorius Pin 7 → dora Pin 8).',
          ],
          aliases: [
            'dora',
            'indikatorius',
            'indikatoriaus',
            'indikatorių',
            'indikatoriai',
            'dora indikatorius',
          ],
        },
        'kan-dora': {
          nome: 'Kan-dora',
          texto: 'Kiekvienas kan atverčia dar vieną indikatorių.',
          aliases: ['kan-dora', 'kandora', 'kan dora'],
        },
        'ura-dora': {
          nome: 'Ura-dora',
          texto:
            'Akmuo po kiekvienu indikatoriumi. Atverčiamas tik tam, kuris laimi paskelbęs Riichi.',
          aliases: ['ura-dora', 'uradora', 'ura dora'],
        },
        'aka-dora': {
          nome: 'Aka dora',
          apelido: 'raudonas 5',
          texto:
            'Kiekvienas raudonas 5 vertas 1 dora. Skaičiuojamas tik įjungus Aka dora taisyklę.',
          aliases: ['aka dora', 'aka-dora', 'akadora', 'raudonas 5', 'raudoni 5', 'raudonų 5'],
        },
      },
    },
    pontuacao: {
      titulo: 'Taškai',
      itens: {
        yaku: {
          nome: 'Yaku',
          texto: 'Taškų sąlyga. Kiekvienai rankai laimėti reikia bent vieno yaku.',
          aliases: ['yaku'],
        },
        han: {
          nome: 'Han',
          texto: 'Kiekvieno yaku ir dora vertė. Kuo daugiau han, tuo daugiau taškų.',
          aliases: ['han'],
        },
        fu: {
          nome: 'Fu',
          texto:
            'Taškai už rankos formą (trejetus, laukimą, laimėjimo būdą). Jie koreguoja vertę iki 4 han.',
          aliases: ['fu'],
        },
      },
    },
    patamares: {
      titulo: 'Taškų ribos',
      aliases: ['taškų riba', 'taškų ribos', 'taškų ribų'],
      itens: {
        mangan: {
          nome: 'Mangan',
          texto:
            '5 han, arba 4 han su 40 fu ar daugiau, arba 3 han su 70 fu ar daugiau. Vertas {{ko}} ({{oya}} dalintojui).',
          aliases: ['mangan'],
        },
        haneman: {
          nome: 'Haneman',
          texto: '6 arba 7 han. Vertas {{ko}} ({{oya}} dalintojui).',
          aliases: ['haneman'],
        },
        baiman: {
          nome: 'Baiman',
          texto: 'Nuo 8 iki 10 han. Vertas {{ko}} ({{oya}} dalintojui).',
          aliases: ['baiman'],
        },
        sanbaiman: {
          nome: 'Sanbaiman',
          texto: '11 arba 12 han. Vertas {{ko}} ({{oya}} dalintojui).',
          aliases: ['sanbaiman'],
        },
        yakuman: {
          nome: 'Yakuman',
          texto: 'Didžiausia ranka. Vertas {{ko}} ({{oya}} dalintojui).',
          aliases: ['yakuman', 'kazoe yakuman'],
        },
      },
    },
    mesa: {
      titulo: 'Stalas',
      itens: {
        oya: {
          nome: 'Oya',
          texto:
            'Dalintojas, visada Rytai. Laimėjęs gauna 1,5×. Jei laimi ar lygiųjų metu yra tenpai, daro renchan.',
          aliases: ['oya', 'dalintojas', 'dalintojo', 'dalintoją', 'dalintojui', 'dalintojai'],
        },
        renchan: {
          nome: 'Renchan',
          texto:
            'Kai oya lieka dalintoju ir kitoje rankoje. Taip būna, jei jis laimi arba lygiųjų metu yra tenpai. Žaidėjų vėjai nesikeičia, o honba skaitiklis didėja.',
          aliases: ['renchan'],
        },
        ko: {
          nome: 'Ko',
          texto: 'Kiti trys žaidėjai, kurie nėra dalintojai.',
          aliases: ['ko'],
        },
        honba: {
          nome: 'Honba',
          texto:
            'Papildomų rankų skaitiklis. Didėja po kiekvieno renchan ar lygiųjų ir nusinulina, kai laimi ko. Kiekvienas honba prideda 300 taškų kitam laimėtojui (tsumo atveju po 100 iš kiekvieno žaidėjo).',
          aliases: ['honba'],
        },
        empate: {
          nome: 'Lygiosios / Ryuukyoku',
          texto: 'Ranka baigiasi be laimėtojo, kai baigiasi siena.',
          aliases: ['lygiosios', 'lygiųjų', 'lygiosiomis', 'ryuukyoku'],
        },
        'empate-abortivo': {
          nome: 'Nutrauktos lygiosios',
          leitura: 'tochuu ryuukyoku',
          texto:
            'Ranka anuliuojama nesibaigus sienai. Oya lieka, o honba didėja. EMA taisyklės nutrauktų lygiųjų nenaudoja, bet daugelis stalų naudoja. Dažniausi atvejai:',
          topicos: [
            '**Kyuushu kyuuhai**: pradinėje rankoje 9 skirtingi kraštiniai ar garbės akmenys. Žaidėjas gali anuliuoti ranką.',
            '**Suufon renda**: pirmajame rate visi keturi žaidėjai išmeta tą patį vėją.',
            '**Suucha riichi**: visi keturi žaidėjai paskelbia Riichi.',
            '**Suukaikan**: keturi skirtingų žaidėjų kan.',
            '**Sanchahou**: trys žaidėjai skelbia ron dėl to paties išmesto akmens.',
          ],
          aliases: [
            'nutrauktos lygiosios',
            'nutrauktų lygiųjų',
            'tochuu ryuukyoku',
            'kyuushu kyuuhai',
            'suufon renda',
            'suucha riichi',
            'suukaikan',
            'sanchahou',
          ],
        },
        chombo: {
          nome: 'Chombo',
          texto: 'Bauda už rimtą klaidą, pavyzdžiui, laimėjimą be yaku ar ron esant furiten.',
          aliases: ['chombo'],
        },
      },
    },
    regras: {
      titulo: 'Taisyklės ir organizacijos',
      itens: {
        ema: {
          nome: 'EMA',
          texto:
            'European Mahjong Association, organizacija, kuri rūpinasi varžybiniu mahjongu Europoje. Ji leidžia RCR (Riichi Competition Rules), Riichi taisyklių rinkinį, kuriuo remiasi daugelis klubų už Japonijos ribų.',
          aliases: ['ema', 'rcr'],
        },
        'm-league': {
          nome: 'M.League',
          texto:
            'Japonijos profesionalų Riichi lyga, įkurta 2018 m. Remiamos komandos suburia profesionalus iš įvairių asociacijų, o rungtynės transliuojamos tiesiogiai su komentarais ir kameromis, rodančiomis kiekvieno žaidėjo ranką. Tai geriausia vieta pamatyti aukšto lygio žaidimą.',
          aliases: ['m.league', 'm league', 'mleague'],
        },
      },
    },
  },
}
