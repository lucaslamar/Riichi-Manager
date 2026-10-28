import type { ConteudoGuiaBolso } from './tipos'

// Termos de mesa em coreano sem revisão nativa: ver src/compartilhado/i18n/REVISAR.md.

const IPPATSU = '리치 후 한 바퀴 안에 화료하는 것. 그 사이에 아무도 울지 않아야 합니다.'

export const conteudo: ConteudoGuiaBolso = {
  categorias: {
    sequencias: '슌쯔로 만드는 역',
    'terminais-honras': '요구패 / 자패로 만드는 역',
    'trincas-pares': '또이쯔 / 커쯔 / 깡쯔로 만드는 역',
    naipes: '패 종류로 만드는 역',
    outros: '기타 역',
  },

  yakus: {
    iipeikou: { titulo: '이페코', descricao: '같은 종류의 똑같은 슌쯔 2개. 멘젠 한정.' },
    ryanpeikou: {
      titulo: '량페코',
      descricao: '한 손패에 이페코가 2개. 멘젠 한정. 치또이쯔와 복합되지 않습니다.',
    },
    pinfu: {
      titulo: '핑후',
      descricao:
        '슌쯔 4개 + 머리. 머리는 삼원패, 장풍, 자풍이 아니어야 하고, 양면 대기로 화료해야 합니다. 다른 풍패 머리는 괜찮습니다. 멘젠 한정.',
    },
    'sanshoku-doujun': {
      titulo: '삼색동순',
      descricao: '만수, 통수, 삭수에 같은 숫자의 슌쯔 (예: 세 종류의 234).',
      apelidos: ['삼색'],
    },
    ittsuu: { titulo: '일기통관', descricao: '같은 종류의 123, 456, 789.', apelidos: ['일통'] },
    tanyao: {
      titulo: '탕야오',
      descricao: '2~8 수패만 사용. 요구패와 자패 없음. EMA에서는 울어도 인정 (쿠이탕).',
    },
    yakuhai: {
      titulo: '역패',
      descricao: '삼원패, 장풍, 자풍의 커쯔 또는 깡쯔. 1개당 1판. 연풍패(더블 풍)는 2판.',
    },
    shousangen: {
      titulo: '소삼원',
      descricao: '삼원패 커쯔 2개 + 나머지 삼원패 머리 (역패도 따로 계산).',
    },
    daisangen: { titulo: '대삼원', descricao: '삼원패 3종류 모두 커쯔.' },
    shousuushii: { titulo: '소사희', descricao: '풍패 커쯔 3개 + 네 번째 풍패 머리.' },
    daisuushii: { titulo: '대사희', descricao: '풍패 4종류 모두 커쯔.' },
    chanta: {
      titulo: '찬타',
      descricao: '모든 몸통과 머리에 요구패나 자패가 들어갑니다. 슌쯔가 1개 이상 필요합니다.',
    },
    junchan: {
      titulo: '준찬타',
      descricao: '모든 몸통과 머리에 1 또는 9가 들어갑니다. 자패 없음.',
      apelidos: ['준찬'],
    },
    honroutou: {
      titulo: '혼노두',
      descricao: '요구패와 자패만 사용 (항상 또이또이나 치또이쯔와 복합).',
    },
    chinroutou: { titulo: '청노두', descricao: '1과 9만으로 만든 손패.' },
    tsuuiisou: { titulo: '자일색', descricao: '풍패와 삼원패만으로 만든 손패.' },
    kokushi: {
      titulo: '국사무쌍',
      descricao: '요구패와 자패 13종류 각 1장 + 그중 1장 더. 멘젠 한정.',
    },
    chiitoitsu: {
      titulo: '치또이쯔',
      descricao: '정확히 또이쯔 7개. 멘젠일 때만 인정. 같은 또이쯔 2개는 인정되지 않습니다.',
      dica: '배패에 또이쯔가 이미 4개 있으면 노려볼 만합니다. 5개로 시작하면 이상적. 손패에 따라 또이또이가 더 나을 수도 있습니다.',
      apelidos: ['치또이'],
    },
    toitoi: { titulo: '또이또이', descricao: '커쯔(또는 깡쯔) 4개 + 머리 1개.' },
    sanankou: {
      titulo: '산안커',
      descricao: '울지 않고 만든 커쯔 3개 (나머지는 울어도 됩니다).',
    },
    suuankou: { titulo: '스안커', descricao: '울지 않고 만든 커쯔 4개. 멘젠 한정.' },
    'sanshoku-doukou': { titulo: '삼색동각', descricao: '세 종류에 같은 숫자의 커쯔.' },
    sankantsu: { titulo: '산깡쯔', descricao: '깡쯔 3개 (밍깡, 안깡 모두 가능).' },
    suukantsu: { titulo: '스깡쯔', descricao: '깡쯔 4개.' },
    honitsu: { titulo: '혼일색', descricao: '한 종류의 수패와 자패만 사용.' },
    chinitsu: { titulo: '청일색', descricao: '한 종류의 수패만 사용. 자패 없음.' },
    ryuuiisou: { titulo: '녹일색', descricao: '삭수 2, 3, 4, 6, 8과 발만 사용.' },
    chuuren: {
      titulo: '구련보등',
      descricao: '한 종류로 1112345678999 + 같은 종류 아무 1장. 멘젠 한정.',
    },
    riichi: {
      titulo: '리치',
      descricao: '멘젠으로 텐파이일 때 1,000점을 걸고 선언합니다. 일발과 뒷도라가 생깁니다.',
    },
    'double-riichi': {
      titulo: '더블 리치',
      descricao: '아무도 울기 전, 첫 번째 타패에서 리치를 선언하는 것.',
      apelidos: ['더블리치', '다부리'],
    },
    ippatsu: { titulo: '일발', descricao: IPPATSU },
    'menzen-tsumo': {
      titulo: '멘젠쯔모',
      descricao: '완전한 멘젠 상태에서 직접 뽑은 패로 화료 (쯔모).',
      apelidos: ['멘젠 쯔모', '멘쯔모'],
    },
    haitei: {
      titulo: '해저로월',
      descricao: '패산의 마지막 패를 쯔모해서 화료.',
      apelidos: ['하이테이'],
    },
    houtei: {
      titulo: '하저로어',
      descricao: '그 국의 마지막 버림패로 론 화료.',
      apelidos: ['호우테이'],
    },
    rinshan: {
      titulo: '영상개화',
      descricao: '깡을 선언한 뒤 보충한 영상패로 화료.',
      apelidos: ['린샨'],
    },
    chankan: {
      titulo: '창깡',
      descricao:
        '다른 플레이어가 퐁에 패를 더해 깡을 만들 때(가깡) 그 패로 론 화료. 안깡은 국사무쌍으로만 뺏을 수 있습니다.',
    },
    tenhou: { titulo: '천화', descricao: '친이 배패 그대로 화료.' },
    chiihou: { titulo: '지화', descricao: '아무도 울기 전, 자가 첫 쯔모로 화료.' },
    renhou: {
      titulo: '인화',
      descricao:
        '아무도 울기 전, 자기 첫 쯔모 전에 론 화료. 다른 역이나 도라는 더하지 않습니다 (EMA).',
    },
  },

  notaDora:
    '도라는 역이 아닙니다. 손패에 역이 1개 이상 있을 때만 판을 더합니다. 표시패의 다음 패가 도라입니다 (9→1, 북→동, 중→백).',
  notaKazoe:
    '**헤아림 역만**은 역이 아닙니다. 역과 도라를 합쳐 13판 이상인 손패를 역만으로 칩니다. 쓰지 않는 테이블도 있으며, 그 경우 삼배만에서 멈춥니다.',

  iniciante: [
    { titulo: '꼭 알아야 할 1판 역', subtitulo: '여기서 시작하세요' },
    { titulo: '쉬운 2판 이상 역', subtitulo: '다음 단계' },
  ],

  ciclosDora: {
    numeros: { titulo: '수패', detalhe: '하나 위. 9 다음은 1.' },
    ventos: { titulo: '풍패', detalhe: '동 → 남 → 서 → 북 → 동' },
    dragoes: { titulo: '삼원패', detalhe: '백 → 발 → 중 → 백' },
  },

  nomesHonras: {
    '1z': '동',
    '2z': '남',
    '3z': '서',
    '4z': '북',
    '5z': '백',
    '6z': '발',
    '7z': '중',
  },

  yakuhai: {
    ventos: { Ton: '동', Nan: '남', Sha: '서', Pei: '북' },
    dragoes: { Haku: '백', Hatsu: '발', Chun: '중' },
    tituloRodada: '장풍',
    tituloAssento: '자풍',
    textoDragao: '{{dragao}}의 커쯔 또는 깡쯔. 1판.',
    textoVentoRodada: '{{vento}}(지금 장풍)의 커쯔 또는 깡쯔. 1판.',
    textoVentoAssento: '{{vento}}(내 자풍)의 커쯔 또는 깡쯔. 1판.',
    dicaVentoDuploRodada:
      '이 바람은 내 자풍이기도 해서, 같은 커쯔가 두 번 계산되어(연풍패) 합계 2판입니다.',
    dicaVentoDuploAssento:
      '이 바람은 장풍이기도 해서, 같은 커쯔가 두 번 계산되어(연풍패) 합계 2판입니다.',
  },

  secoes: {
    naipes: {
      titulo: '수패',
      intro: '1부터 9까지 숫자가 있는 패. 세 종류가 있습니다.',
      aliases: ['수패'],
      itens: {
        man: { nome: '만수', apelido: '만자', aliases: ['만수', '만자', '만즈'] },
        pin: { nome: '통수', apelido: '통자', aliases: ['통수', '통자', '핀즈'] },
        sou: { nome: '삭수', apelido: '삭자', aliases: ['삭수', '삭자', '삭즈', '소우즈'] },
        terminais: {
          nome: '요구패와 중장패',
          topicos: ['1과 9는 **노두패**(요구패)입니다.', '2~8은 **중장패**입니다.'],
          aliases: ['요구패', '노두패', '중장패'],
        },
      },
    },
    honras: {
      titulo: '자패',
      intro: '숫자가 없는 패: 풍패와 삼원패.',
      aliases: ['자패'],
      itens: {
        ventos: {
          nome: '풍패',
          texto: '동(東), 남(南), 서(西), 북(北)',
          aliases: ['풍패'],
        },
        dragoes: {
          nome: '삼원패',
          texto: '백(白), 발(發), 중(中)',
          aliases: ['삼원패'],
        },
      },
    },
    mao: {
      titulo: '손패 구성',
      intro: '기본 화료형은 몸통 4개(슌쯔 또는 커쯔) + 머리 1개입니다.',
      rotulosExemplo: ['슌쯔', '슌쯔', '커쯔', '커쯔', '머리'],
      itens: {
        sequencia: {
          nome: '슌쯔',
          texto: '같은 종류의 연속된 숫자 3개 (예: 통수 3-4-5). 치로 만들 수도 있습니다.',
          aliases: ['슌쯔', '순쯔'],
        },
        trinca: {
          nome: '커쯔',
          texto: '같은 패 3장. 퐁으로 만들 수도 있습니다.',
          aliases: ['커쯔', '안커', '밍커'],
        },
        par: {
          nome: '머리',
          texto: '같은 패 2장 (또이쯔).',
          aliases: ['머리', '또이쯔', '작두'],
        },
      },
    },
    chamadas: {
      titulo: '울기',
      itens: {
        chamada: {
          nome: '울기',
          leitura: '나키',
          texto:
            '다른 플레이어의 버림패를 가져와 치, 퐁, 깡으로 몸통을 만드는 것. 안깡을 빼고 모든 울기는 손패를 엽니다.',
          aliases: ['울기', '울어', '울지', '울면', '나키', '후로'],
        },
        chi: {
          nome: '치',
          texto: '왼쪽 플레이어(상가)의 버림패를 가져와 슌쯔를 만듭니다.',
          aliases: ['치'],
        },
        pon: {
          nome: '퐁',
          texto: '누구의 버림패든 가져와 커쯔를 만듭니다.',
          aliases: ['퐁'],
        },
        kan: {
          nome: '깡',
          texto:
            '같은 패 4장 (깡쯔). 영상패를 1장 보충하고 도라 표시패를 1장 더 엽니다. 안깡(4장 모두 내 패)은 손패를 열지 않습니다.',
          aliases: ['깡', '깡쯔', '안깡', '밍깡', '가깡'],
        },
        kuitan: {
          nome: '쿠이탕',
          texto:
            '손패를 연 탕야오. EMA 규칙에서는 인정되지만, 쓰지 않는 테이블도 있습니다 (쿠이탕 없음).',
          aliases: ['쿠이탕'],
        },
      },
    },
    vitoria: {
      titulo: '대기와 화료',
      itens: {
        tenpai: {
          nome: '텐파이',
          texto: '1장만 더 있으면 손패가 완성되는 상태.',
          aliases: ['텐파이', '청패'],
        },
        ryanmen: {
          nome: '양면',
          texto: '양면 대기: 연속된 숫자 2개로, 양쪽 어느 패로도 완성됩니다 (3-4는 2나 5 대기).',
          aliases: ['양면', '량멘'],
        },
        riichi: {
          nome: '리치',
          texto: '멘젠으로 텐파이를 선언하고 1,000점을 겁니다. 1판.',
          aliases: ['리치'],
        },
        ippatsu: { nome: '일발', aliases: ['일발', '잇파츠'] },
        tsumo: { nome: '쯔모', texto: '직접 뽑은 패로 화료하는 것.', aliases: ['쯔모', '츠모'] },
        ron: { nome: '론', texto: '다른 플레이어의 버림패로 화료하는 것.', aliases: ['론'] },
        'ron-duplo': {
          nome: '더블 론',
          texto:
            '두 플레이어가 같은 버림패로 론을 해서 둘 다 화료합니다. 버린 사람이 각각 지불합니다.',
          topicos: [
            '**선취(아타마하네)**: 더블 론을 인정하지 않는 테이블에서는 한 명만 화료합니다. 버린 사람 다음 순서로 가장 먼저인 사람이 이깁니다.',
            '세 명이 같은 버림패로 론을 하면, 많은 테이블에서 그 국을 무효로 합니다 (삼가화).',
          ],
          aliases: ['더블 론', '다브론', '아타마하네', '선취'],
        },
        furiten: {
          nome: '후리텐',
          texto: '자기 대기패를 이미 버렸다면 론은 할 수 없고 쯔모로만 화료할 수 있습니다.',
          topicos: [
            '**버림패 후리텐**: 손패를 완성할 패가 내 버림패 안에 있습니다.',
            '**동순 후리텐**: 손패를 완성할 패를 그냥 보냈습니다. 내 다음 타패까지 이어집니다.',
            '**리치 후 후리텐**: 리치 후 손패를 완성할 패를 그냥 보냈습니다. 그 국이 끝날 때까지 이어집니다.',
          ],
          aliases: ['후리텐'],
        },
      },
    },
    dora: {
      titulo: '도라',
      itens: {
        dora: {
          nome: '도라',
          texto: '표시패가 가리키는 보너스 패. 1장당 1판이지만 역은 아닙니다.',
          topicos: [
            '**표시패**는 왕패에서 뒤집힌 패입니다.',
            '도라는 아래 순서에서 다음 패입니다 (표시패 통수 7 → 도라 통수 8).',
          ],
          aliases: ['도라', '도라 표시패', '표시패'],
        },
        'kan-dora': {
          nome: '깡도라',
          texto: '깡을 할 때마다 표시패가 1장 더 열립니다.',
          aliases: ['깡도라', '깡 도라'],
        },
        'ura-dora': {
          nome: '뒷도라',
          texto: '각 표시패 아래의 패. 리치를 하고 화료한 사람만 엽니다.',
          aliases: ['뒷도라', '우라도라'],
        },
        'aka-dora': {
          nome: '적도라',
          apelido: '빨간 5',
          texto: '빨간 5는 1장당 도라 1. 적도라 규칙이 켜져 있을 때만 계산합니다.',
          aliases: ['적도라', '아카도라', '빨간 5'],
        },
      },
    },
    pontuacao: {
      titulo: '점수',
      itens: {
        yaku: {
          nome: '역',
          texto: '점수가 되는 조건. 화료하려면 역이 1개 이상 있어야 합니다.',
          aliases: ['역', '야쿠'],
        },
        han: {
          nome: '판',
          texto: '역과 도라 각각의 가치. 판이 많을수록 점수가 높습니다.',
          aliases: ['판'],
        },
        fu: {
          nome: '부',
          texto: '손패 모양(커쯔, 대기, 화료 방식)에 따른 점수. 4판까지의 점수를 조정합니다.',
          aliases: ['부'],
        },
      },
    },
    patamares: {
      titulo: '만관 이상 구간',
      aliases: ['만관 이상'],
      itens: {
        mangan: {
          nome: '만관',
          texto: '5판, 또는 4판 40부 이상, 또는 3판 70부 이상. {{ko}}점 (친은 {{oya}}점).',
          aliases: ['만관'],
        },
        haneman: {
          nome: '하네만',
          texto: '6~7판. {{ko}}점 (친은 {{oya}}점).',
          aliases: ['하네만'],
        },
        baiman: {
          nome: '배만',
          texto: '8~10판. {{ko}}점 (친은 {{oya}}점).',
          aliases: ['배만'],
        },
        sanbaiman: {
          nome: '삼배만',
          texto: '11~12판. {{ko}}점 (친은 {{oya}}점).',
          aliases: ['삼배만'],
        },
        yakuman: {
          nome: '역만',
          texto: '최고 점수 손패. {{ko}}점 (친은 {{oya}}점).',
          aliases: ['역만', '헤아림 역만'],
        },
      },
    },
    mesa: {
      titulo: '테이블',
      itens: {
        oya: {
          nome: '친',
          texto:
            '딜러이며 항상 동가입니다. 화료하면 1.5배. 화료하거나 유국 때 텐파이면 연장합니다.',
          aliases: ['친', '동가'],
        },
        renchan: {
          nome: '연장',
          texto:
            '친이 다음 국에도 친을 계속하는 것. 친이 화료하거나 유국 때 텐파이면 일어납니다. 자리 바람은 돌지 않고 본장이 올라갑니다.',
          aliases: ['연장', '렌짱'],
        },
        ko: {
          nome: '자',
          texto: '친이 아닌 나머지 세 플레이어.',
          aliases: [],
        },
        honba: {
          nome: '본장',
          texto:
            '추가 국 카운터. 연장이나 유국 때마다 올라가고, 자가 화료하면 0이 됩니다. 본장 1개당 다음 화료자에게 300점 (쯔모면 각자 100점).',
          aliases: ['본장'],
        },
        empate: {
          nome: '유국',
          texto: '패산이 다 떨어져 아무도 화료하지 못하고 국이 끝나는 것.',
          aliases: ['유국', '황패유국'],
        },
        'empate-abortivo': {
          nome: '도중유국',
          texto:
            '패산이 다 떨어지기 전에 국이 무효가 되는 것. 친은 그대로이고 본장이 올라갑니다. EMA 규칙에는 없지만 쓰는 테이블이 많습니다. 흔한 경우:',
          topicos: [
            '**구종구패**: 배패에 서로 다른 요구패·자패가 9종류 이상. 그 플레이어는 국을 무효로 할 수 있습니다.',
            '**사풍연타**: 첫 순에 네 명이 같은 풍패를 버립니다.',
            '**사가리치**: 네 명 모두 리치.',
            '**사개깡**: 서로 다른 플레이어가 합쳐서 깡 4번.',
            '**삼가화**: 세 명이 같은 버림패로 론.',
          ],
          aliases: ['도중유국', '구종구패', '사풍연타', '사가리치', '사개깡', '삼가화'],
        },
        chombo: {
          nome: '촌보',
          texto: '역 없이 화료하거나 후리텐으로 론을 하는 등, 큰 실수에 대한 벌칙.',
          aliases: ['촌보', '착화'],
        },
      },
    },
    regras: {
      titulo: '규칙과 단체',
      itens: {
        ema: {
          nome: 'EMA',
          texto:
            '유럽 마작 협회(European Mahjong Association). 유럽의 경기 마작을 운영하는 단체입니다. RCR(Riichi Competition Rules)을 발표하며, 일본 밖의 많은 클럽이 이 리치 마작 규칙을 기준으로 씁니다.',
          aliases: ['EMA', 'RCR', '유럽 마작 협회'],
        },
        'm-league': {
          nome: 'M리그',
          texto:
            '2018년에 시작된 일본의 프로 리치 마작 리그. 기업이 후원하는 팀에 여러 단체의 프로 선수가 모이고, 해설과 각 선수의 손패를 보여 주는 카메라와 함께 생중계됩니다. 높은 수준의 대국을 보기에 가장 좋은 곳입니다.',
          aliases: ['M리그', 'M.League'],
        },
      },
    },
  },
}
