window.HistoryTimelineData = window.HistoryTimelineData || {};

(() => {
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

  const qinRulers = withDisplayEdges([
    {
      id: "shihuang",
      overviewId: "qin",
      searchDynastyName: "秦",
      order: 1,
      commonTitle: "始皇帝",
      personalName: "嬴政",
      templeName: "",
      posthumousName: "",
      reignRange: "前221年 - 前210年",
      timelineStartYear: -221,
      timelineEndYear: -210,
      successionType: "称皇帝建制",
      relationToPrevious: "秦朝首位皇帝",
      eraNames: [],
    },
    {
      id: "ershi",
      overviewId: "qin",
      searchDynastyName: "秦",
      order: 2,
      commonTitle: "二世皇帝",
      personalName: "胡亥",
      templeName: "",
      posthumousName: "",
      reignRange: "前210年 - 前207年",
      timelineStartYear: -210,
      timelineEndYear: -207,
      successionType: "父子相承",
      relationToPrevious: "始皇帝少子",
      eraNames: [],
    },
    {
      id: "ziying",
      overviewId: "qin",
      searchDynastyName: "秦",
      order: 3,
      commonTitle: "子婴",
      personalName: "子婴",
      templeName: "",
      posthumousName: "",
      reignRange: "前207年 - 前206年",
      timelineStartYear: -207,
      timelineEndYear: -206,
      successionType: "宗室近支入继",
      relationToPrevious: "秦宗室近支，具体世系存争议",
      eraNames: [],
    },
  ]);

  const xinRulers = withDisplayEdges([
    {
      id: "wangmang",
      overviewId: "xin",
      searchDynastyName: "新",
      order: 1,
      commonTitle: "王莽",
      personalName: "王莽",
      templeName: "",
      posthumousName: "",
      reignRange: "9年 - 23年",
      timelineStartYear: 9,
      timelineEndYear: 23,
      successionType: "篡汉建国",
      relationToPrevious: "新朝唯一皇帝",
      eraNames: [
        { name: "始建国", startYear: 9, endYear: 13 },
        { name: "天凤", startYear: 14, endYear: 19 },
        { name: "地皇", startYear: 20, endYear: 23 },
      ],
    },
  ]);

  window.HistoryTimelineData.qinDynasty = {
    id: "qin",
    name: "秦",
    formalName: "秦",
    dynastyStartYear: -221,
    dynastyEndYear: -206,
    lineageStartYear: -221,
    lineageEndYear: -206,
    genealogyColumns: 40,
    timelineRows: [
      {
        id: "qin-main",
        label: "秦朝皇帝",
        rulerIds: qinRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: [
      {
        id: "qin-gene-1",
        label: "开基",
        nodes: [
          {
            id: "qin-zhuangxiang",
            type: "relative",
            label: "庄襄王",
            subtitle: "始皇帝之父",
            colStart: 18,
            colSpan: 5,
          },
        ],
      },
      {
        id: "qin-gene-2",
        label: "始皇一代",
        nodes: [
          {
            id: "qin-shihuang-main",
            type: "emperor",
            rulerId: "shihuang",
            parentId: "qin-zhuangxiang",
            colStart: 18,
            colSpan: 5,
          },
        ],
      },
      {
        id: "qin-gene-3",
        label: "始皇后裔与宗室",
        nodes: [
          {
            id: "qin-ershi-main",
            type: "emperor",
            rulerId: "ershi",
            parentId: "qin-shihuang-main",
            colStart: 10,
            colSpan: 5,
          },
          {
            id: "qin-royal-branch",
            type: "relative",
            label: "秦宗室近支",
            subtitle: "子婴所出支系存争议",
            parentId: "qin-shihuang-main",
            colStart: 24,
            colSpan: 5,
          },
        ],
      },
      {
        id: "qin-gene-4",
        label: "秦亡前夕",
        nodes: [
          {
            id: "qin-ziying-main",
            type: "emperor",
            rulerId: "ziying",
            parentId: "qin-royal-branch",
            colStart: 24,
            colSpan: 5,
          },
        ],
      },
    ],
    rulers: qinRulers,
  };

  window.HistoryTimelineData.xinDynasty = {
    id: "xin",
    name: "新",
    formalName: "新",
    dynastyStartYear: 9,
    dynastyEndYear: 23,
    lineageStartYear: 9,
    lineageEndYear: 23,
    genealogyColumns: 28,
    timelineRows: [
      {
        id: "xin-main",
        label: "新朝皇帝",
        rulerIds: xinRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: [
      {
        id: "xin-gene-1",
        label: "唯一皇帝",
        nodes: [
          {
            id: "xin-wangmang-main",
            type: "emperor",
            rulerId: "wangmang",
            colStart: 12,
            colSpan: 5,
          },
        ],
      },
    ],
    rulers: xinRulers,
  };
})();
