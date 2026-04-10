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

  const laterLiangRulers = withDisplayEdges([
    {
      id: "taizu",
      overviewId: "later-liang",
      searchDynastyName: "后梁",
      order: 1,
      commonTitle: "太祖",
      personalName: "朱温",
      templeName: "太祖",
      posthumousName: "神武元圣孝皇帝",
      reignRange: "907年 - 912年",
      timelineStartYear: 907,
      timelineEndYear: 912,
      successionType: "受禅建国",
      relationToPrevious: "后梁开国皇帝",
      eraNames: [
        { name: "开平", startYear: 907, endYear: 911 },
        { name: "乾化", startYear: 911, endYear: 912 },
      ],
    },
    {
      id: "yingwang",
      overviewId: "later-liang",
      searchDynastyName: "后梁",
      order: 2,
      commonTitle: "郢王",
      personalName: "朱友珪",
      templeName: "",
      posthumousName: "",
      reignRange: "912年 - 913年",
      timelineStartYear: 912,
      timelineEndYear: 913,
      successionType: "宫廷政变篡位",
      relationToPrevious: "太祖第三子，弑父自立",
      eraNames: [{ name: "凤历", startYear: 913, endYear: 913 }],
    },
    {
      id: "modi",
      overviewId: "later-liang",
      searchDynastyName: "后梁",
      order: 3,
      commonTitle: "末帝",
      personalName: "朱友贞",
      templeName: "",
      posthumousName: "",
      reignRange: "913年 - 923年",
      timelineStartYear: 913,
      timelineEndYear: 923,
      successionType: "宗室入继",
      relationToPrevious: "太祖嫡子，诛异母兄友珪后继位",
      eraNames: [
        { name: "乾化", startYear: 913, endYear: 915 },
        { name: "贞明", startYear: 915, endYear: 921 },
        { name: "龙德", startYear: 921, endYear: 923 },
      ],
    },
  ]);

  const laterTangRulers = withDisplayEdges([
    {
      id: "zhuangzong",
      overviewId: "later-tang",
      searchDynastyName: "后唐",
      order: 1,
      commonTitle: "庄宗",
      personalName: "李存勖",
      templeName: "庄宗",
      posthumousName: "光圣神闵孝皇帝",
      reignRange: "923年 - 926年",
      timelineStartYear: 923,
      timelineEndYear: 926,
      successionType: "称帝建国",
      relationToPrevious: "后唐开国皇帝",
      eraNames: [{ name: "同光", startYear: 923, endYear: 926 }],
    },
    {
      id: "mingzong",
      overviewId: "later-tang",
      searchDynastyName: "后唐",
      order: 2,
      commonTitle: "明宗",
      personalName: "李嗣源",
      templeName: "明宗",
      posthumousName: "圣德和武钦孝皇帝",
      reignRange: "926年 - 933年",
      timelineStartYear: 926,
      timelineEndYear: 933,
      successionType: "兵变入继",
      relationToPrevious: "李克用养子，与庄宗同属晋王家，兵变后即位",
      eraNames: [
        { name: "同光", startYear: 926, endYear: 926 },
        { name: "天成", startYear: 926, endYear: 930 },
        { name: "长兴", startYear: 930, endYear: 933 },
      ],
    },
    {
      id: "mindi",
      overviewId: "later-tang",
      searchDynastyName: "后唐",
      order: 3,
      commonTitle: "闵帝",
      personalName: "李从厚",
      templeName: "",
      posthumousName: "闵皇帝",
      reignRange: "933年 - 934年",
      timelineStartYear: 933,
      timelineEndYear: 934,
      successionType: "父子相承",
      relationToPrevious: "明宗第三子",
      eraNames: [
        { name: "长兴", startYear: 933, endYear: 933 },
        { name: "应顺", startYear: 934, endYear: 934 },
      ],
    },
    {
      id: "modi",
      overviewId: "later-tang",
      searchDynastyName: "后唐",
      order: 4,
      commonTitle: "末帝",
      personalName: "李从珂",
      templeName: "",
      posthumousName: "",
      reignRange: "934年 - 936年",
      timelineStartYear: 934,
      timelineEndYear: 936,
      successionType: "宗室夺位",
      relationToPrevious: "明宗养子，闵帝养兄，起兵废闵帝自立",
      eraNames: [{ name: "清泰", startYear: 934, endYear: 936 }],
    },
  ]);

  const laterJinRulers = withDisplayEdges([
    {
      id: "gaozu",
      overviewId: "later-jin",
      searchDynastyName: "后晋",
      order: 1,
      commonTitle: "高祖",
      personalName: "石敬瑭",
      templeName: "高祖",
      posthumousName: "睿文圣武明德孝皇帝",
      reignRange: "936年 - 942年",
      timelineStartYear: 936,
      timelineEndYear: 942,
      successionType: "称帝建国",
      relationToPrevious: "后晋开国皇帝",
      eraNames: [{ name: "天福", startYear: 936, endYear: 942 }],
    },
    {
      id: "chudi",
      overviewId: "later-jin",
      searchDynastyName: "后晋",
      order: 2,
      commonTitle: "出帝",
      personalName: "石重贵",
      templeName: "",
      posthumousName: "出皇帝",
      reignRange: "942年 - 947年",
      timelineStartYear: 942,
      timelineEndYear: 947,
      successionType: "侄承叔统",
      relationToPrevious: "高祖兄石敬儒之子，过继为嗣",
      eraNames: [
        { name: "天福", startYear: 942, endYear: 944 },
        { name: "开运", startYear: 944, endYear: 947 },
      ],
    },
  ]);

  const laterHanRulers = withDisplayEdges([
    {
      id: "gaozu",
      overviewId: "later-han",
      searchDynastyName: "后汉",
      order: 1,
      commonTitle: "高祖",
      personalName: "刘知远",
      templeName: "高祖",
      posthumousName: "睿文圣武昭肃孝皇帝",
      reignRange: "947年 - 948年",
      timelineStartYear: 947,
      timelineEndYear: 948,
      successionType: "称帝建国",
      relationToPrevious: "后汉开国皇帝",
      eraNames: [
        { name: "天福", startYear: 947, endYear: 947 },
        { name: "乾祐", startYear: 948, endYear: 948 },
      ],
    },
    {
      id: "yindi",
      overviewId: "later-han",
      searchDynastyName: "后汉",
      order: 2,
      commonTitle: "隐帝",
      personalName: "刘承祐",
      templeName: "",
      posthumousName: "隐皇帝",
      reignRange: "948年 - 950年",
      timelineStartYear: 948,
      timelineEndYear: 950,
      successionType: "父子相承",
      relationToPrevious: "高祖次子，其兄刘承训早卒后继位",
      eraNames: [{ name: "乾祐", startYear: 948, endYear: 950 }],
    },
  ]);

  const laterZhouRulers = withDisplayEdges([
    {
      id: "taizu",
      overviewId: "later-zhou",
      searchDynastyName: "后周",
      order: 1,
      commonTitle: "太祖",
      personalName: "郭威",
      templeName: "太祖",
      posthumousName: "圣神恭肃文武孝皇帝",
      reignRange: "951年 - 954年",
      timelineStartYear: 951,
      timelineEndYear: 954,
      successionType: "受禅建国",
      relationToPrevious: "后周开国皇帝",
      eraNames: [
        { name: "广顺", startYear: 951, endYear: 953 },
        { name: "显德", startYear: 954, endYear: 954 },
      ],
    },
    {
      id: "shizong",
      overviewId: "later-zhou",
      searchDynastyName: "后周",
      order: 2,
      commonTitle: "世宗",
      personalName: "柴荣",
      templeName: "世宗",
      posthumousName: "睿武孝文皇帝",
      reignRange: "954年 - 959年",
      timelineStartYear: 954,
      timelineEndYear: 959,
      successionType: "养子入继",
      relationToPrevious: "柴守礼之子，郭威养子兼内侄",
      eraNames: [{ name: "显德", startYear: 954, endYear: 959 }],
    },
    {
      id: "gongdi",
      overviewId: "later-zhou",
      searchDynastyName: "后周",
      order: 3,
      commonTitle: "恭帝",
      personalName: "柴宗训",
      templeName: "",
      posthumousName: "恭皇帝",
      reignRange: "959年 - 960年",
      timelineStartYear: 959,
      timelineEndYear: 960,
      successionType: "父子相承",
      relationToPrevious: "世宗之子",
      eraNames: [{ name: "显德", startYear: 959, endYear: 960 }],
    },
  ]);

  const laterLiangGenealogyRows = [
    {
      id: "later-liang-gene-1",
      label: "开基",
      nodes: [
        {
          id: "later-liang-taizu-main",
          type: "emperor",
          rulerId: "taizu",
          colStart: 12,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-liang-gene-2",
      label: "太祖诸子",
      nodes: [
        {
          id: "later-liang-yingwang-main",
          type: "emperor",
          rulerId: "yingwang",
          parentId: "later-liang-taizu-main",
          colStart: 8,
          colSpan: 5,
        },
        {
          id: "later-liang-modi-main",
          type: "emperor",
          rulerId: "modi",
          parentId: "later-liang-taizu-main",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
  ];

  const laterTangGenealogyRows = [
    {
      id: "later-tang-gene-1",
      label: "晋王家",
      nodes: [
        {
          id: "li-keyong",
          type: "relative",
          label: "李克用",
          subtitle: "庄宗生父，明宗养父",
          colStart: 12,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-tang-gene-2",
      label: "庄宗与明宗",
      nodes: [
        {
          id: "later-tang-zhuangzong-main",
          type: "emperor",
          rulerId: "zhuangzong",
          parentId: "li-keyong",
          colStart: 8,
          colSpan: 5,
        },
        {
          id: "later-tang-mingzong-main",
          type: "emperor",
          rulerId: "mingzong",
          parentId: "li-keyong",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-tang-gene-3",
      label: "明宗后裔",
      nodes: [
        {
          id: "later-tang-mindi-main",
          type: "emperor",
          rulerId: "mindi",
          parentId: "later-tang-mingzong-main",
          colStart: 8,
          colSpan: 5,
        },
        {
          id: "later-tang-modi-main",
          type: "emperor",
          rulerId: "modi",
          parentId: "later-tang-mingzong-main",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
  ];

  const laterJinGenealogyRows = [
    {
      id: "later-jin-gene-1",
      label: "石氏父辈",
      nodes: [
        {
          id: "shi-shaoyong",
          type: "relative",
          label: "石绍雍",
          subtitle: "高祖、石敬儒之父",
          colStart: 12,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-jin-gene-2",
      label: "高祖与兄支",
      nodes: [
        {
          id: "later-jin-gaozu-main",
          type: "emperor",
          rulerId: "gaozu",
          parentId: "shi-shaoyong",
          colStart: 8,
          colSpan: 5,
        },
        {
          id: "shi-jingru",
          type: "relative",
          label: "石敬儒",
          subtitle: "出帝生父，高祖之兄",
          parentId: "shi-shaoyong",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-jin-gene-3",
      label: "叔侄承统",
      nodes: [
        {
          id: "later-jin-chudi-main",
          type: "emperor",
          rulerId: "chudi",
          parentId: "shi-jingru",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
  ];

  const laterHanGenealogyRows = [
    {
      id: "later-han-gene-1",
      label: "开基",
      nodes: [
        {
          id: "later-han-gaozu-main",
          type: "emperor",
          rulerId: "gaozu",
          colStart: 12,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-han-gene-2",
      label: "高祖诸子",
      nodes: [
        {
          id: "liuchengxun",
          type: "relative",
          label: "刘承训",
          subtitle: "高祖长子，隐帝之兄",
          parentId: "later-han-gaozu-main",
          colStart: 8,
          colSpan: 5,
        },
        {
          id: "later-han-yindi-main",
          type: "emperor",
          rulerId: "yindi",
          parentId: "later-han-gaozu-main",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
  ];

  const laterZhouGenealogyRows = [
    {
      id: "later-zhou-gene-1",
      label: "开基与外戚",
      nodes: [
        {
          id: "later-zhou-taizu-main",
          type: "emperor",
          rulerId: "taizu",
          colStart: 8,
          colSpan: 5,
        },
        {
          id: "chai-shouli",
          type: "relative",
          label: "柴守礼",
          subtitle: "世宗生父，太祖妻兄",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-zhou-gene-2",
      label: "世宗继位",
      nodes: [
        {
          id: "later-zhou-shizong-main",
          type: "emperor",
          rulerId: "shizong",
          parentId: "chai-shouli",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
    {
      id: "later-zhou-gene-3",
      label: "后周末帝",
      nodes: [
        {
          id: "later-zhou-gongdi-main",
          type: "emperor",
          rulerId: "gongdi",
          parentId: "later-zhou-shizong-main",
          colStart: 16,
          colSpan: 5,
        },
      ],
    },
  ];

  window.HistoryTimelineData.laterLiangDynasty = {
    id: "later-liang",
    name: "后梁",
    formalName: "后梁",
    dynastyStartYear: 907,
    dynastyEndYear: 923,
    lineageStartYear: 907,
    lineageEndYear: 923,
    genealogyColumns: 24,
    timelineRows: [
      {
        id: "later-liang-main",
        label: "后梁皇帝",
        rulerIds: laterLiangRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: laterLiangGenealogyRows,
    rulers: laterLiangRulers,
  };

  window.HistoryTimelineData.laterTangDynasty = {
    id: "later-tang",
    name: "后唐",
    formalName: "后唐",
    dynastyStartYear: 923,
    dynastyEndYear: 936,
    lineageStartYear: 923,
    lineageEndYear: 936,
    genealogyColumns: 24,
    timelineRows: [
      {
        id: "later-tang-main",
        label: "后唐皇帝",
        rulerIds: laterTangRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: laterTangGenealogyRows,
    rulers: laterTangRulers,
  };

  window.HistoryTimelineData.laterJinDynasty = {
    id: "later-jin",
    name: "后晋",
    formalName: "后晋",
    dynastyStartYear: 936,
    dynastyEndYear: 947,
    lineageStartYear: 936,
    lineageEndYear: 947,
    genealogyColumns: 24,
    timelineRows: [
      {
        id: "later-jin-main",
        label: "后晋皇帝",
        rulerIds: laterJinRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: laterJinGenealogyRows,
    rulers: laterJinRulers,
  };

  window.HistoryTimelineData.laterHanDynasty = {
    id: "later-han",
    name: "后汉",
    formalName: "后汉",
    dynastyStartYear: 947,
    dynastyEndYear: 950,
    lineageStartYear: 947,
    lineageEndYear: 950,
    genealogyColumns: 24,
    timelineRows: [
      {
        id: "later-han-main",
        label: "后汉皇帝",
        rulerIds: laterHanRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: laterHanGenealogyRows,
    rulers: laterHanRulers,
  };

  window.HistoryTimelineData.laterZhouDynasty = {
    id: "later-zhou",
    name: "后周",
    formalName: "后周",
    dynastyStartYear: 951,
    dynastyEndYear: 960,
    lineageStartYear: 951,
    lineageEndYear: 960,
    genealogyColumns: 24,
    timelineRows: [
      {
        id: "later-zhou-main",
        label: "后周皇帝",
        rulerIds: laterZhouRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: laterZhouGenealogyRows,
    rulers: laterZhouRulers,
  };

  const prefixFiveDynastiesRulers = (prefix, rulers, dynastyName) =>
    rulers.map((ruler) => ({
      ...ruler,
      id: `five-dynasties-${prefix}-${ruler.id}`,
      overviewId: "five-dynasties",
      searchDynastyName: dynastyName,
    }));

  const prefixFiveDynastiesRows = (prefix, dynastyName, rows) =>
    rows.map((row) => ({
      ...row,
      id: `five-dynasties-${prefix}-${row.id}`,
      label: `${dynastyName} · ${row.label}`,
      nodes: row.nodes.map((node) => ({
        ...node,
        id: `five-dynasties-${prefix}-${node.id}`,
        rulerId: node.rulerId ? `five-dynasties-${prefix}-${node.rulerId}` : undefined,
        parentId: node.parentId
          ? `five-dynasties-${prefix}-${node.parentId}`
          : undefined,
      })),
    }));

  const fiveDynastiesLiangRulers = prefixFiveDynastiesRulers(
    "liang",
    laterLiangRulers,
    "后梁",
  );
  const fiveDynastiesTangRulers = prefixFiveDynastiesRulers(
    "tang",
    laterTangRulers,
    "后唐",
  );
  const fiveDynastiesJinRulers = prefixFiveDynastiesRulers(
    "jin",
    laterJinRulers,
    "后晋",
  );
  const fiveDynastiesHanRulers = prefixFiveDynastiesRulers(
    "han",
    laterHanRulers,
    "后汉",
  );
  const fiveDynastiesZhouRulers = prefixFiveDynastiesRulers(
    "zhou",
    laterZhouRulers,
    "后周",
  );

  window.HistoryTimelineData.fiveDynastiesDynasty = {
    id: "five-dynasties",
    name: "五代",
    formalName: "五代（后梁、后唐、后晋、后汉、后周）",
    dynastyStartYear: 907,
    dynastyEndYear: 960,
    lineageStartYear: 907,
    lineageEndYear: 960,
    extraBoundaryYears: [923, 936, 947, 951],
    genealogyColumns: 24,
    timelineRows: [
      {
        id: "five-dynasties-liang-main",
        label: "后梁",
        rulerIds: fiveDynastiesLiangRulers.map((ruler) => ruler.id),
      },
      {
        id: "five-dynasties-tang-main",
        label: "后唐",
        rulerIds: fiveDynastiesTangRulers.map((ruler) => ruler.id),
      },
      {
        id: "five-dynasties-jin-main",
        label: "后晋",
        rulerIds: fiveDynastiesJinRulers.map((ruler) => ruler.id),
      },
      {
        id: "five-dynasties-han-main",
        label: "后汉",
        rulerIds: fiveDynastiesHanRulers.map((ruler) => ruler.id),
      },
      {
        id: "five-dynasties-zhou-main",
        label: "后周",
        rulerIds: fiveDynastiesZhouRulers.map((ruler) => ruler.id),
      },
    ],
    genealogyRows: [
      ...prefixFiveDynastiesRows("liang", "后梁", laterLiangGenealogyRows),
      ...prefixFiveDynastiesRows("tang", "后唐", laterTangGenealogyRows),
      ...prefixFiveDynastiesRows("jin", "后晋", laterJinGenealogyRows),
      ...prefixFiveDynastiesRows("han", "后汉", laterHanGenealogyRows),
      ...prefixFiveDynastiesRows("zhou", "后周", laterZhouGenealogyRows),
    ],
    rulers: [
      ...fiveDynastiesLiangRulers,
      ...fiveDynastiesTangRulers,
      ...fiveDynastiesJinRulers,
      ...fiveDynastiesHanRulers,
      ...fiveDynastiesZhouRulers,
    ],
  };
})();
