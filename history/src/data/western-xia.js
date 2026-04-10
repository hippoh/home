window.HistoryTimelineData = window.HistoryTimelineData || {};

(() => {
  const buildChainRows = (prefix, rulers, column = 12, span = 5) =>
    rulers.map((ruler, index) => ({
      id: `${prefix}-gene-${index + 1}`,
      label: index === 0 ? "开基" : `第${index + 1}序`,
      nodes: [
        {
          id: ruler.id,
          type: "emperor",
          rulerId: ruler.id,
          parentId: index > 0 ? rulers[index - 1].id : undefined,
          colStart: column,
          colSpan: span,
        },
      ],
    }));

  const withDisplayEdges = (rulers) =>
    rulers.map((ruler, index) => {
      const previous = rulers[index - 1];
      const next = rulers[index + 1];
      let displayStartEdge = ruler.timelineStartYear;
      let displayEndEdge = ruler.timelineEndYear + 1;

      if (previous && ruler.timelineStartYear <= previous.timelineEndYear) {
        displayStartEdge =
          (previous.timelineEndYear + 1 + ruler.timelineStartYear) / 2;
      }

      if (next && next.timelineStartYear <= ruler.timelineEndYear) {
        displayEndEdge = (ruler.timelineEndYear + 1 + next.timelineStartYear) / 2;
      }

      return {
        ...ruler,
        displayStartEdge,
        displayEndEdge,
      };
    });

  const westernXiaRulers = withDisplayEdges([
    {
      id: "jingzong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 1,
      commonTitle: "景宗",
      personalName: "李元昊",
      templeName: "景宗",
      posthumousName: "武烈皇帝",
      reignRange: "1038年 - 1048年",
      timelineStartYear: 1038,
      timelineEndYear: 1048,
      successionType: "称帝建国",
      relationToPrevious: "西夏开国皇帝",
      eraNames: [{ name: "天授礼法延祚", startYear: 1038, endYear: 1048 }],
    },
    {
      id: "yizong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 2,
      commonTitle: "毅宗",
      personalName: "李谅祚",
      templeName: "毅宗",
      posthumousName: "昭英皇帝",
      reignRange: "1048年 - 1067年",
      timelineStartYear: 1048,
      timelineEndYear: 1067,
      successionType: "父子相承",
      relationToPrevious: "景宗之子",
      eraNames: [
        { name: "天授礼法延祚", startYear: 1048, endYear: 1048 },
        { name: "延嗣宁国", startYear: 1049, endYear: 1049 },
        { name: "天祐垂圣", startYear: 1050, endYear: 1052 },
        { name: "福圣承道", startYear: 1053, endYear: 1056 },
        { name: "奲都", startYear: 1057, endYear: 1062 },
        { name: "拱化", startYear: 1063, endYear: 1067 },
      ],
    },
    {
      id: "huizong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 3,
      commonTitle: "惠宗",
      personalName: "李秉常",
      templeName: "惠宗",
      posthumousName: "康靖皇帝",
      reignRange: "1067年 - 1086年",
      timelineStartYear: 1067,
      timelineEndYear: 1086,
      successionType: "父子相承",
      relationToPrevious: "毅宗之子",
      eraNames: [
        { name: "拱化", startYear: 1067, endYear: 1067 },
        { name: "乾道", startYear: 1068, endYear: 1068 },
        { name: "天赐礼盛国庆", startYear: 1069, endYear: 1073 },
        { name: "大安", startYear: 1074, endYear: 1084 },
        { name: "天安礼定", startYear: 1085, endYear: 1086 },
      ],
    },
    {
      id: "chongzong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 4,
      commonTitle: "崇宗",
      personalName: "李乾顺",
      templeName: "崇宗",
      posthumousName: "圣文皇帝",
      reignRange: "1086年 - 1139年",
      timelineStartYear: 1086,
      timelineEndYear: 1139,
      successionType: "父子相承",
      relationToPrevious: "惠宗之子",
      eraNames: [
        { name: "天安礼定", startYear: 1086, endYear: 1086 },
        { name: "天仪治平", startYear: 1087, endYear: 1089 },
        { name: "天祐民安", startYear: 1090, endYear: 1097 },
        { name: "永安", startYear: 1098, endYear: 1100 },
        { name: "贞观", startYear: 1101, endYear: 1113 },
        { name: "雍宁", startYear: 1114, endYear: 1118 },
        { name: "元德", startYear: 1119, endYear: 1127 },
        { name: "正德", startYear: 1127, endYear: 1134 },
        { name: "大德", startYear: 1135, endYear: 1139 },
      ],
    },
    {
      id: "renzong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 5,
      commonTitle: "仁宗",
      personalName: "李仁孝",
      templeName: "仁宗",
      posthumousName: "圣德皇帝",
      reignRange: "1139年 - 1193年",
      timelineStartYear: 1139,
      timelineEndYear: 1193,
      successionType: "父子相承",
      relationToPrevious: "崇宗之子",
      eraNames: [
        { name: "大德", startYear: 1139, endYear: 1139 },
        { name: "大庆", startYear: 1140, endYear: 1143 },
        { name: "人庆", startYear: 1144, endYear: 1148 },
        { name: "天盛", startYear: 1149, endYear: 1169 },
        { name: "乾祐", startYear: 1170, endYear: 1193 },
      ],
    },
    {
      id: "huanzong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 6,
      commonTitle: "桓宗",
      personalName: "李纯祐",
      templeName: "桓宗",
      posthumousName: "昭简皇帝",
      reignRange: "1193年 - 1206年",
      timelineStartYear: 1193,
      timelineEndYear: 1206,
      successionType: "父子相承",
      relationToPrevious: "仁宗长子",
      eraNames: [
        { name: "乾祐", startYear: 1193, endYear: 1193 },
        { name: "天庆", startYear: 1194, endYear: 1206 },
      ],
    },
    {
      id: "xiangzong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 7,
      commonTitle: "襄宗",
      personalName: "李安全",
      templeName: "襄宗",
      posthumousName: "敬穆皇帝",
      reignRange: "1206年 - 1211年",
      timelineStartYear: 1206,
      timelineEndYear: 1211,
      successionType: "宗室入继",
      relationToPrevious: "仁宗支系入继",
      eraNames: [
        { name: "天庆", startYear: 1206, endYear: 1206 },
        { name: "应天", startYear: 1206, endYear: 1209 },
        { name: "皇建", startYear: 1210, endYear: 1211 },
      ],
    },
    {
      id: "shenzong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 8,
      commonTitle: "神宗",
      personalName: "李遵顼",
      templeName: "神宗",
      posthumousName: "英文皇帝",
      reignRange: "1211年 - 1223年",
      timelineStartYear: 1211,
      timelineEndYear: 1223,
      successionType: "宗室夺位",
      relationToPrevious: "废襄宗自立",
      eraNames: [
        { name: "皇建", startYear: 1211, endYear: 1211 },
        { name: "光定", startYear: 1211, endYear: 1223 },
      ],
    },
    {
      id: "xianzong",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 9,
      commonTitle: "献宗",
      personalName: "李德旺",
      templeName: "献宗",
      posthumousName: "",
      reignRange: "1223年 - 1226年",
      timelineStartYear: 1223,
      timelineEndYear: 1226,
      successionType: "父子相承",
      relationToPrevious: "神宗之子",
      eraNames: [
        { name: "光定", startYear: 1223, endYear: 1223 },
        { name: "乾定", startYear: 1223, endYear: 1226 },
      ],
    },
    {
      id: "modi",
      overviewId: "western-xia",
      searchDynastyName: "西夏",
      order: 10,
      commonTitle: "末帝",
      personalName: "李睍",
      templeName: "",
      posthumousName: "",
      reignRange: "1226年 - 1227年",
      timelineStartYear: 1226,
      timelineEndYear: 1227,
      successionType: "父子相承",
      relationToPrevious: "献宗之子",
      eraNames: [
        { name: "乾定", startYear: 1226, endYear: 1226 },
        { name: "宝义", startYear: 1226, endYear: 1227 },
      ],
    },
  ]);

  window.HistoryTimelineData.westernXiaDynasty = {
    id: "western-xia",
    name: "西夏",
    formalName: "西夏",
    dynastyStartYear: 1038,
    dynastyEndYear: 1227,
    lineageStartYear: 1038,
    lineageEndYear: 1227,
    genealogyColumns: 28,
    timelineRows: [
      {
        id: "western-xia-main",
        label: "西夏皇帝",
        rulerIds: westernXiaRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: buildChainRows("western-xia", westernXiaRulers),
    rulers: westernXiaRulers,
  };
})();
