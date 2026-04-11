window.HistoryTimelineData = window.HistoryTimelineData || {};

(() => {
  const withDisplayEdgesByRows = (rulers, timelineRows) => {
    const rulerMap = new Map(
      rulers.map((ruler) => [
        ruler.id,
        {
          ...ruler,
          displayStartEdge: ruler.displayStartEdge ?? ruler.timelineStartYear,
          displayEndEdge: ruler.displayEndEdge ?? ruler.timelineEndYear + 1,
        },
      ]),
    );

    timelineRows.forEach((row) => {
      row.rulerIds.forEach((rulerId, index) => {
        const ruler = rulerMap.get(rulerId);
        if (!ruler || ruler.timelineSegments?.length) {
          return;
        }

        const previous = index > 0 ? rulerMap.get(row.rulerIds[index - 1]) : null;
        const next =
          index < row.rulerIds.length - 1 ? rulerMap.get(row.rulerIds[index + 1]) : null;

        let displayStartEdge = ruler.timelineStartYear;
        let displayEndEdge = ruler.timelineEndYear + 1;

        if (previous && ruler.timelineStartYear <= previous.timelineEndYear) {
          displayStartEdge =
            (previous.timelineEndYear + 1 + ruler.timelineStartYear) / 2;
        }

        if (next && next.timelineStartYear <= ruler.timelineEndYear) {
          displayEndEdge = (ruler.timelineEndYear + 1 + next.timelineStartYear) / 2;
        }

        ruler.displayStartEdge = displayStartEdge;
        ruler.displayEndEdge = displayEndEdge;
      });
    });

    return Array.from(rulerMap.values());
  };

  const threeKingdomsTimelineRows = [
    {
      id: "three-kingdoms-wei",
      label: "曹魏",
      rulerIds: [
        "wei-caopi",
        "wei-caorui",
        "wei-caofang",
        "wei-caomao",
        "wei-caohuan",
      ],
    },
    {
      id: "three-kingdoms-shu",
      label: "蜀汉",
      rulerIds: ["shu-liubei", "shu-liushan"],
    },
    {
      id: "three-kingdoms-wu",
      label: "孙吴",
      rulerIds: ["wu-sunquan", "wu-sunliang", "wu-sunxiu", "wu-sunhao"],
    },
  ];

  const threeKingdomsRulers = withDisplayEdgesByRows(
    [
      {
        id: "wei-caopi",
        overviewId: "three-kingdoms",
        searchDynastyName: "曹魏",
        order: 1,
        displayOrder: 1,
        commonTitle: "文帝",
        personalName: "曹丕",
        templeName: "高祖",
        posthumousName: "文皇帝",
        reignRange: "220年 - 226年",
        timelineStartYear: 220,
        timelineEndYear: 226,
        successionType: "受禅建国",
        relationToPrevious: "曹魏开国皇帝，曹操嫡长子",
        eraNames: [{ name: "黄初", startYear: 220, endYear: 226 }],
      },
      {
        id: "wei-caorui",
        overviewId: "three-kingdoms",
        searchDynastyName: "曹魏",
        order: 2,
        displayOrder: 2,
        commonTitle: "明帝",
        personalName: "曹叡",
        templeName: "烈祖",
        posthumousName: "明皇帝",
        reignRange: "226年 - 239年",
        timelineStartYear: 226,
        timelineEndYear: 239,
        successionType: "父子相承",
        relationToPrevious: "文帝之子",
        eraNames: [
          { name: "黄初", startYear: 226, endYear: 226 },
          { name: "太和", startYear: 227, endYear: 233 },
          { name: "青龙", startYear: 233, endYear: 237 },
          { name: "景初", startYear: 237, endYear: 239 },
        ],
      },
      {
        id: "wei-caofang",
        overviewId: "three-kingdoms",
        searchDynastyName: "曹魏",
        order: 3,
        displayOrder: 3,
        commonTitle: "齐王",
        personalName: "曹芳",
        templeName: "",
        posthumousName: "邵陵厉公",
        reignRange: "239年 - 254年",
        timelineStartYear: 239,
        timelineEndYear: 254,
        successionType: "养子入继",
        relationToPrevious: "明帝养子，生父未详，《魏氏春秋》作曹楷之子",
        eraNames: [
          { name: "景初", startYear: 239, endYear: 239 },
          { name: "正始", startYear: 240, endYear: 249 },
          { name: "嘉平", startYear: 249, endYear: 254 },
        ],
      },
      {
        id: "wei-caomao",
        overviewId: "three-kingdoms",
        searchDynastyName: "曹魏",
        order: 4,
        displayOrder: 4,
        commonTitle: "高贵乡公",
        personalName: "曹髦",
        templeName: "",
        posthumousName: "",
        reignRange: "254年 - 260年",
        timelineStartYear: 254,
        timelineEndYear: 260,
        successionType: "宗室入继",
        relationToPrevious: "文帝之孙，东海定王曹霖之子",
        eraNames: [
          { name: "正元", startYear: 254, endYear: 256 },
          { name: "甘露", startYear: 256, endYear: 260 },
        ],
      },
      {
        id: "wei-caohuan",
        overviewId: "three-kingdoms",
        searchDynastyName: "曹魏",
        order: 5,
        displayOrder: 5,
        commonTitle: "元帝",
        personalName: "曹奂",
        templeName: "",
        posthumousName: "元皇帝",
        reignRange: "260年 - 265年",
        timelineStartYear: 260,
        timelineEndYear: 265,
        successionType: "宗室入继",
        relationToPrevious: "燕王曹宇之子，魏宗室近支入继",
        eraNames: [
          { name: "景元", startYear: 260, endYear: 264 },
          { name: "咸熙", startYear: 264, endYear: 265 },
        ],
      },
      {
        id: "shu-liubei",
        overviewId: "three-kingdoms",
        searchDynastyName: "蜀汉",
        order: 6,
        displayOrder: 1,
        commonTitle: "昭烈帝",
        personalName: "刘备",
        templeName: "烈祖",
        posthumousName: "昭烈皇帝",
        reignRange: "221年 - 223年",
        timelineStartYear: 221,
        timelineEndYear: 223,
        successionType: "称帝建国",
        relationToPrevious: "蜀汉开国皇帝",
        eraNames: [{ name: "章武", startYear: 221, endYear: 223 }],
      },
      {
        id: "shu-liushan",
        overviewId: "three-kingdoms",
        searchDynastyName: "蜀汉",
        order: 7,
        displayOrder: 2,
        commonTitle: "后主",
        personalName: "刘禅",
        templeName: "",
        posthumousName: "孝怀皇帝",
        reignRange: "223年 - 263年",
        timelineStartYear: 223,
        timelineEndYear: 263,
        successionType: "父子相承",
        relationToPrevious: "昭烈帝之子",
        eraNames: [
          { name: "章武", startYear: 223, endYear: 223 },
          { name: "建兴", startYear: 223, endYear: 237 },
          { name: "延熙", startYear: 238, endYear: 257 },
          { name: "景耀", startYear: 258, endYear: 263 },
          { name: "炎兴", startYear: 263, endYear: 263 },
        ],
      },
      {
        id: "wu-sunquan",
        overviewId: "three-kingdoms",
        searchDynastyName: "孙吴",
        order: 8,
        displayOrder: 1,
        commonTitle: "大帝",
        personalName: "孙权",
        templeName: "太祖",
        posthumousName: "大皇帝",
        reignRange: "229年 - 252年",
        timelineStartYear: 229,
        timelineEndYear: 252,
        successionType: "称帝建国",
        relationToPrevious: "孙吴开国皇帝",
        eraNames: [
          { name: "黄龙", startYear: 229, endYear: 231 },
          { name: "嘉禾", startYear: 232, endYear: 238 },
          { name: "赤乌", startYear: 238, endYear: 251 },
          { name: "太元", startYear: 251, endYear: 252 },
          { name: "神凤", startYear: 252, endYear: 252 },
        ],
      },
      {
        id: "wu-sunliang",
        overviewId: "three-kingdoms",
        searchDynastyName: "孙吴",
        order: 9,
        displayOrder: 2,
        commonTitle: "会稽王",
        personalName: "孙亮",
        templeName: "",
        posthumousName: "",
        reignRange: "252年 - 258年",
        timelineStartYear: 252,
        timelineEndYear: 258,
        successionType: "父子相承",
        relationToPrevious: "孙权少子",
        eraNames: [
          { name: "建兴", startYear: 252, endYear: 253 },
          { name: "五凤", startYear: 254, endYear: 256 },
          { name: "太平", startYear: 256, endYear: 258 },
        ],
      },
      {
        id: "wu-sunxiu",
        overviewId: "three-kingdoms",
        searchDynastyName: "孙吴",
        order: 10,
        displayOrder: 3,
        commonTitle: "景帝",
        personalName: "孙休",
        templeName: "",
        posthumousName: "景皇帝",
        reignRange: "258年 - 264年",
        timelineStartYear: 258,
        timelineEndYear: 264,
        successionType: "兄弟承统",
        relationToPrevious: "孙权第六子，会稽王之兄",
        eraNames: [{ name: "永安", startYear: 258, endYear: 264 }],
      },
      {
        id: "wu-sunhao",
        overviewId: "three-kingdoms",
        searchDynastyName: "孙吴",
        order: 11,
        displayOrder: 4,
        commonTitle: "末帝",
        personalName: "孙皓",
        templeName: "",
        posthumousName: "",
        reignRange: "264年 - 280年",
        timelineStartYear: 264,
        timelineEndYear: 280,
        successionType: "叔侄承统",
        relationToPrevious: "文太子孙和之子，景帝侄",
        eraNames: [
          { name: "元兴", startYear: 264, endYear: 265 },
          { name: "甘露", startYear: 265, endYear: 266 },
          { name: "宝鼎", startYear: 266, endYear: 269 },
          { name: "建衡", startYear: 269, endYear: 271 },
          { name: "凤凰", startYear: 272, endYear: 274 },
          { name: "天册", startYear: 275, endYear: 276 },
          { name: "天玺", startYear: 276, endYear: 276 },
          { name: "天纪", startYear: 277, endYear: 280 },
        ],
      },
    ],
    threeKingdomsTimelineRows,
  );

  window.HistoryTimelineData.threeKingdomsDynasty = {
    id: "three-kingdoms",
    name: "三国",
    formalName: "三国（魏蜀吴）",
    dynastyStartYear: 220,
    dynastyEndYear: 280,
    lineageStartYear: 220,
    lineageEndYear: 280,
    extraBoundaryYears: [221, 229, 263, 265],
    genealogyColumns: 84,
    timelineRows: threeKingdomsTimelineRows,
    genealogyRows: [
      {
        id: "three-kingdoms-gene-1",
        label: "开国一代",
        nodes: [
          {
            id: "three-kingdoms-caocao",
            type: "relative",
            label: "曹操",
            subtitle: "文帝之父，追尊魏武帝",
            colStart: 14,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-shu-liubei-main",
            type: "emperor",
            rulerId: "shu-liubei",
            colStart: 38,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wu-sunquan-main",
            type: "emperor",
            rulerId: "wu-sunquan",
            colStart: 66,
            colSpan: 5,
          },
        ],
      },
      {
        id: "three-kingdoms-gene-2",
        label: "第二代",
        nodes: [
          {
            id: "three-kingdoms-caozhang",
            type: "relative",
            label: "曹彰",
            subtitle: "任城威王，曹芳一支所出多系于此",
            parentId: "three-kingdoms-caocao",
            colStart: 4,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wei-caopi-main",
            type: "emperor",
            rulerId: "wei-caopi",
            parentId: "three-kingdoms-caocao",
            colStart: 14,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-caoyu",
            type: "relative",
            label: "曹宇",
            subtitle: "燕王，元帝之父",
            parentId: "three-kingdoms-caocao",
            colStart: 24,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-shu-liushan-main",
            type: "emperor",
            rulerId: "shu-liushan",
            parentId: "three-kingdoms-shu-liubei-main",
            colStart: 38,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wu-sunliang-main",
            type: "emperor",
            rulerId: "wu-sunliang",
            parentId: "three-kingdoms-wu-sunquan-main",
            colStart: 56,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wu-sunxiu-main",
            type: "emperor",
            rulerId: "wu-sunxiu",
            parentId: "three-kingdoms-wu-sunquan-main",
            colStart: 66,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-sunhe",
            type: "relative",
            label: "孙和",
            subtitle: "文太子，孙皓之父",
            parentId: "three-kingdoms-wu-sunquan-main",
            colStart: 76,
            colSpan: 5,
          },
        ],
      },
      {
        id: "three-kingdoms-gene-3",
        label: "第三代",
        nodes: [
          {
            id: "three-kingdoms-caokai",
            type: "relative",
            label: "曹楷？",
            subtitle: "《魏氏春秋》作曹芳生父，系曹彰之子",
            parentId: "three-kingdoms-caozhang",
            colStart: 4,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wei-caorui-main",
            type: "emperor",
            rulerId: "wei-caorui",
            parentId: "three-kingdoms-wei-caopi-main",
            colStart: 10,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-caolin",
            type: "relative",
            label: "曹霖",
            subtitle: "东海定王，曹髦之父",
            parentId: "three-kingdoms-wei-caopi-main",
            colStart: 18,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wei-caohuan-main",
            type: "emperor",
            rulerId: "wei-caohuan",
            parentId: "three-kingdoms-caoyu",
            colStart: 24,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wu-sunhao-main",
            type: "emperor",
            rulerId: "wu-sunhao",
            parentId: "three-kingdoms-sunhe",
            colStart: 76,
            colSpan: 5,
          },
        ],
      },
      {
        id: "three-kingdoms-gene-4",
        label: "魏宗室入继",
        nodes: [
          {
            id: "three-kingdoms-wei-caofang-main",
            type: "emperor",
            rulerId: "wei-caofang",
            parentId: "three-kingdoms-caokai",
            colStart: 4,
            colSpan: 5,
          },
          {
            id: "three-kingdoms-wei-caomao-main",
            type: "emperor",
            rulerId: "wei-caomao",
            parentId: "three-kingdoms-caolin",
            colStart: 18,
            colSpan: 5,
          },
        ],
      },
    ],
    rulers: threeKingdomsRulers,
  };
})();
