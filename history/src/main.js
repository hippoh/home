const {
  overviewConfig,
  overviewDynasties,
  shangDynasty,
  westernZhouDynasty,
  easternZhouDynasty,
  qinDynasty,
  xinDynasty,
  threeKingdomsDynasty,
  westernHanDynasty,
  easternHanDynasty,
  westernJinDynasty,
  easternJinDynasty,
  liuSongDynasty,
  southernQiDynasty,
  liangDynasty,
  chenDynasty,
  northernWeiDynasty,
  easternWeiDynasty,
  westernWeiDynasty,
  northernQiDynasty,
  northernZhouDynasty,
  suiDynasty,
  tangDynasty,
  fiveDynastiesDynasty,
  laterLiangDynasty,
  laterTangDynasty,
  laterJinDynasty,
  laterHanDynasty,
  laterZhouDynasty,
  liaoDynasty,
  jinDynasty,
  northernSongDynasty,
  southernSongDynasty,
  joseonDynasty,
  qingDynasty,
  mingDynasty,
  yuanDynasty,
} = window.HistoryTimelineData || {};

if (
  !overviewConfig ||
  !overviewDynasties ||
  !shangDynasty ||
  !westernZhouDynasty ||
  !easternZhouDynasty ||
  !qinDynasty ||
  !xinDynasty ||
  !threeKingdomsDynasty ||
  !westernHanDynasty ||
  !easternHanDynasty ||
  !westernJinDynasty ||
  !easternJinDynasty ||
  !liuSongDynasty ||
  !southernQiDynasty ||
  !liangDynasty ||
  !chenDynasty ||
  !northernWeiDynasty ||
  !easternWeiDynasty ||
  !westernWeiDynasty ||
  !northernQiDynasty ||
  !northernZhouDynasty ||
  !suiDynasty ||
  !tangDynasty ||
  !fiveDynastiesDynasty ||
  !laterLiangDynasty ||
  !laterTangDynasty ||
  !laterJinDynasty ||
  !laterHanDynasty ||
  !laterZhouDynasty ||
  !liaoDynasty ||
  !jinDynasty ||
  !northernSongDynasty ||
  !southernSongDynasty ||
  !joseonDynasty ||
  !qingDynasty ||
  !mingDynasty ||
  !yuanDynasty
) {
  throw new Error("History timeline data failed to load.");
}

const detailRegistry = {
  shang: shangDynasty,
  "western-zhou": westernZhouDynasty,
  "eastern-zhou": easternZhouDynasty,
  qin: qinDynasty,
  xin: xinDynasty,
  "three-kingdoms": threeKingdomsDynasty,
  "western-han": westernHanDynasty,
  "eastern-han": easternHanDynasty,
  "western-jin": westernJinDynasty,
  "eastern-jin": easternJinDynasty,
  "liu-song": liuSongDynasty,
  "southern-qi": southernQiDynasty,
  liang: liangDynasty,
  chen: chenDynasty,
  "northern-wei": northernWeiDynasty,
  "eastern-wei": easternWeiDynasty,
  "western-wei": westernWeiDynasty,
  "northern-qi": northernQiDynasty,
  "northern-zhou": northernZhouDynasty,
  sui: suiDynasty,
  tang: tangDynasty,
  "five-dynasties": fiveDynastiesDynasty,
  liao: liaoDynasty,
  jin: jinDynasty,
  "northern-song": northernSongDynasty,
  "southern-song": southernSongDynasty,
  joseon: joseonDynasty,
  qing: qingDynasty,
  ming: mingDynasty,
  yuan: yuanDynasty,
};

const state = {
  selectedDynastyId: null,
  selectedRulerId: null,
  searchQuery: "",
  searchResults: [],
  shouldScrollToSelectedRuler: false,
};

const elements = {
  legend: document.querySelector("#statusLegend"),
  overview: document.querySelector("#overviewTimeline"),
  detail: document.querySelector("#detailPanel"),
  selectedRulerPanel: document.querySelector("#selectedRulerPanel"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  searchResults: document.querySelector("#searchResults"),
};

const toneClassMap = {
  bronze: "tone-bronze",
  ink: "tone-ink",
  vermilion: "tone-vermilion",
  gold: "tone-gold",
  jade: "tone-jade",
  teal: "tone-teal",
  sand: "tone-sand",
  qing: "tone-qing",
  plum: "tone-plum",
};

const searchIndex = buildSearchIndex(Object.values(detailRegistry));

function normalizeYear(year) {
  return year < 1 ? year + 1 : year;
}

function yearSpan(startYear, endYear) {
  return normalizeYear(endYear) - normalizeYear(startYear) + 1;
}

function positionPercent(startYear, endYear, totalStart, totalEnd) {
  const total = yearSpan(totalStart, totalEnd);
  const offset = normalizeYear(startYear) - normalizeYear(totalStart);
  const width = yearSpan(startYear, endYear);

  return {
    left: (offset / total) * 100,
    width: (width / total) * 100,
  };
}

function normalizeContinuousYear(year) {
  return year < 1 ? year + 1 : year;
}

function positionPercentContinuous(startEdge, endEdge, totalStart, totalEnd) {
  const totalStartEdge = normalizeContinuousYear(totalStart);
  const totalEndEdge = normalizeContinuousYear(totalEnd) + 1;
  const offset = normalizeContinuousYear(startEdge) - totalStartEdge;
  const width = normalizeContinuousYear(endEdge) - normalizeContinuousYear(startEdge);

  return {
    left: (offset / (totalEndEdge - totalStartEdge)) * 100,
    width: (width / (totalEndEdge - totalStartEdge)) * 100,
  };
}

function formatYear(year) {
  if (year < 1) {
    return `前${Math.abs(year)}年`;
  }
  return `${year}年`;
}

function formatYearRange(startYear, endYear) {
  return `${formatYear(startYear)} - ${formatYear(endYear)}`;
}

function toChineseNumeral(number) {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (number <= 10) {
    return number === 10 ? "十" : digits[number];
  }
  if (number < 20) {
    return `十${digits[number % 10]}`;
  }
  if (number < 100) {
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    return `${digits[tens]}十${ones === 0 ? "" : digits[ones]}`;
  }

  const hundreds = Math.floor(number / 100);
  const remainder = number % 100;
  if (remainder === 0) {
    return `${digits[hundreds]}百`;
  }
  if (remainder < 10) {
    return `${digits[hundreds]}百零${digits[remainder]}`;
  }
  return `${digits[hundreds]}百${toChineseNumeral(remainder)}`;
}

function formatRegnalYear(yearNumber) {
  if (yearNumber <= 1) {
    return "元年";
  }
  return `${toChineseNumeral(yearNumber)}年`;
}

function buildRulerYearRows(ruler, phase = null) {
  const phaseStartYear = phase?.startYear ?? ruler.timelineStartYear;
  const phaseEndYear = phase?.endYear ?? ruler.timelineEndYear;
  const yearMap = new Map();

  if (ruler.eraNames.length > 0) {
    ruler.eraNames.forEach((era, eraIndex) => {
      const overlapStart = Math.max(era.startYear, phaseStartYear);
      const overlapEnd = Math.min(era.endYear, phaseEndYear);

      if (overlapStart > overlapEnd) {
        return;
      }

      for (let year = overlapStart; year <= overlapEnd; year += 1) {
        if (!yearMap.has(year)) {
          yearMap.set(year, []);
        }
        yearMap.get(year).push({
          eraIndex,
          name: era.name,
          yearLabel: `${era.name}${formatRegnalYear(year - era.startYear + 1)}`,
          isEraStart: year === era.startYear,
        });
      }
    });
  } else {
    const years = [];
    for (let year = phaseStartYear; year <= phaseEndYear; year += 1) {
      years.push(year);
    }

    years.forEach((year) => {
      if (!yearMap.has(year)) {
        yearMap.set(year, []);
      }
      yearMap.get(year).push({
        eraIndex: 0,
        name: "无正式年号",
        yearLabel: "无正式年号",
        isEraStart: false,
      });
    });
  }

  for (let year = phaseStartYear; year <= phaseEndYear; year += 1) {
    if (!yearMap.has(year) || yearMap.get(year).length === 0) {
      yearMap.set(year, [
        {
          eraIndex: ruler.eraNames.length,
          name: "无正式年号",
          yearLabel: "无正式年号",
          isEraStart: false,
        },
      ]);
    }
  }

  return Array.from(yearMap.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([year, eras], index) => ({
      year,
      reignYear: index + 1,
      eras,
      startsNewEra: eras.some((era) => era.isEraStart),
      primaryEraIndex: eras[eras.length - 1]?.eraIndex ?? 0,
    }));
}

function buildRulerYearPhaseSections(ruler) {
  const phases = getTimelineSegments(ruler);

  if (phases.length <= 1) {
    return [
      {
        id: `${ruler.id}-phase-1`,
        label: "",
        meta: "",
        rows: buildRulerYearRows(ruler),
      },
    ];
  }

  return phases.map((phase, index) => ({
    id: `${ruler.id}-phase-${index + 1}`,
    label: `第${toChineseNumeral(index + 1)}次在位`,
    meta: phase.meta ?? formatYearRange(phase.startYear, phase.endYear),
    rows: buildRulerYearRows(ruler, phase),
  }));
}

function renderAnnualRows(rows) {
  return rows
    .map(
      (row) => `
        <tr class="${row.startsNewEra ? "is-era-start" : ""}">
          <td class="year-col reign-col">${escapeHtml(`第${toChineseNumeral(row.reignYear)}年`)}</td>
          <td class="year-col era-col">
            <div class="era-chip-group">
              ${row.eras
                .map(
                  (era) => `
                    <span class="era-chip is-tone-${(era.eraIndex % 6) + 1}">
                      ${escapeHtml(era.yearLabel)}
                    </span>
                  `,
                )
                .join("")}
            </div>
          </td>
          <td class="year-col gregorian-col">${escapeHtml(formatYear(row.year))}</td>
        </tr>
      `,
    )
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildSearchIndex(dynasties) {
  return dynasties.flatMap((dynasty) =>
    dynasty.rulers.flatMap((ruler) => {
      const baseRecord = {
        dynastyId: ruler.overviewId ?? dynasty.id,
        dynastyName: ruler.searchDynastyName ?? dynasty.name,
        rulerId: ruler.id,
        rulerCommonTitle: ruler.commonTitle,
        rulerPersonalName: ruler.personalName,
        rulerTempleName: ruler.templeName,
        rulerPosthumousName: ruler.posthumousName,
        successionType: ruler.successionType,
      };

      if (ruler.eraNames.length === 0) {
        const phases = getTimelineSegments(ruler);

        if (phases.length > 1) {
          return phases.map((phase) => ({
            ...baseRecord,
            eraName: "无正式年号",
            startYear: phase.startYear,
            endYear: phase.endYear,
            isNoEraRecord: true,
          }));
        }

        return [
          {
            ...baseRecord,
            eraName: "无正式年号",
            startYear: ruler.timelineStartYear,
            endYear: ruler.timelineEndYear,
            isNoEraRecord: true,
          },
        ];
      }

      const coveredYears = new Set();
      const records = ruler.eraNames.map((era) => {
        for (let year = era.startYear; year <= era.endYear; year += 1) {
          if (year >= ruler.timelineStartYear && year <= ruler.timelineEndYear) {
            coveredYears.add(year);
          }
        }

        return {
          ...baseRecord,
          eraName: era.name,
          startYear: era.startYear,
          endYear: era.endYear,
        };
      });

      let gapStart = null;
      for (let year = ruler.timelineStartYear; year <= ruler.timelineEndYear; year += 1) {
        const covered = coveredYears.has(year);
        if (!covered && gapStart === null) {
          gapStart = year;
        }

        if (gapStart !== null && (covered || year === ruler.timelineEndYear)) {
          records.push({
            ...baseRecord,
            eraName: "无正式年号",
            startYear: gapStart,
            endYear: covered ? year - 1 : year,
            isNoEraRecord: true,
          });
          gapStart = null;
        }
      }

      return records;
    }),
  );
}

function getSelectedOverviewDynasty() {
  if (!state.selectedDynastyId) {
    return null;
  }

  return overviewDynasties.find((dynasty) => dynasty.id === state.selectedDynastyId) ?? null;
}

function getSelectedDynasty() {
  const overviewDynasty = getSelectedOverviewDynasty();
  const detailId = overviewDynasty?.detailId ?? overviewDynasty?.id;
  return detailRegistry[detailId] ?? null;
}

function getSelectedRuler() {
  const dynasty = getSelectedDynasty();
  if (!dynasty) {
    return null;
  }
  return (
    dynasty.rulers.find((ruler) => ruler.id === state.selectedRulerId) ??
    dynasty.rulers[0]
  );
}

function getTimelineSegments(ruler) {
  if (ruler.timelineSegments?.length) {
    return ruler.timelineSegments;
  }

  return [
    {
      startYear: ruler.timelineStartYear,
      endYear: ruler.timelineEndYear,
      displayStartEdge: ruler.displayStartEdge,
      displayEndEdge: ruler.displayEndEdge,
      label: ruler.commonTitle,
      meta: ruler.timelineLabel ?? formatYearRange(ruler.timelineStartYear, ruler.timelineEndYear),
    },
  ];
}

function getRulerTimelineLabel(ruler) {
  return ruler.timelineLabel ?? formatYearRange(ruler.timelineStartYear, ruler.timelineEndYear);
}

function buildLineageScale(detail) {
  const majorYears = [];
  const majorStart = Math.ceil(detail.lineageStartYear / 20) * 20;
  for (let year = majorStart; year < detail.lineageEndYear; year += 20) {
    majorYears.push(year);
  }

  const minorYears = [];
  const minorStart = Math.ceil(detail.lineageStartYear / 10) * 10;
  for (let year = minorStart; year < detail.lineageEndYear; year += 10) {
    if (!majorYears.includes(year)) {
      minorYears.push(year);
    }
  }

  const labeledYears = Array.from(
    new Set([
      detail.lineageStartYear,
      ...majorYears.filter(
        (year) =>
          Math.abs(year - detail.lineageStartYear) >= 8 &&
          Math.abs(detail.lineageEndYear - year) >= 8,
      ),
      detail.lineageEndYear,
    ]),
  ).sort((left, right) => left - right);

  const segmentStartYears = detail.rulers.flatMap((ruler) =>
    getTimelineSegments(ruler).map((segment) => segment.startYear),
  );
  const reignBoundaryYears = Array.from(
    new Set([
      detail.dynastyStartYear,
      ...(detail.extraBoundaryYears ?? []),
      ...segmentStartYears,
    ]),
  ).filter((year) => !labeledYears.includes(year) && !minorYears.includes(year));

  return {
    labeledYears,
    minorYears,
    reignBoundaryYears,
  };
}

function renderSelectedRulerPanel() {
  const detail = getSelectedDynasty();
  if (!detail) {
    elements.selectedRulerPanel.innerHTML = `
      <div class="inspector-card">
        <p class="eyebrow">当前君主</p>
        <h3>尚未选择朝代</h3>
        <p class="inspector-note">点击总览时间轴中的朝代后，这里再显示君主信息。</p>
      </div>
    `;
    return;
  }

  const ruler = getSelectedRuler();
  if (!ruler) {
    elements.selectedRulerPanel.innerHTML = "";
    return;
  }

  const phaseSections = buildRulerYearPhaseSections(ruler);
  const aliasSectionHtml = Array.isArray(ruler.aliasGroups) && ruler.aliasGroups.length > 0
    ? `
      <dl class="inspector-alias-list">
        ${ruler.aliasGroups
          .map(
            (group) => `
              <div>
                <dt>${escapeHtml(group.label)}</dt>
                <dd>${escapeHtml(group.value)}</dd>
              </div>
            `,
          )
          .join("")}
      </dl>
    `
    : "";
  const phaseTablesHtml = phaseSections
    .map((phase, index) => {
      const tableHtml = `
        <div class="inspector-era-table-wrap">
          <table class="inspector-era-table">
            <colgroup>
              <col class="col-reign" />
              <col class="col-era" />
              <col class="col-gregorian" />
            </colgroup>
            <thead>
              <tr>
                <th title="在位年数">在位</th>
                <th title="年号纪年">年号</th>
                <th title="公元年">公元</th>
              </tr>
            </thead>
            <tbody>${renderAnnualRows(phase.rows)}</tbody>
          </table>
        </div>
      `;

      if (phaseSections.length === 1) {
        return tableHtml;
      }

      return `
        <section class="inspector-era-period ${index > 0 ? "has-divider" : ""}">
          <div class="inspector-era-period-head">
            <strong>${escapeHtml(phase.label)}</strong>
            <span>${escapeHtml(phase.meta)}</span>
          </div>
          ${tableHtml}
        </section>
      `;
    })
    .join("");

  elements.selectedRulerPanel.innerHTML = `
    <article class="inspector-card">
      <div class="inspector-head">
        <div>
          <p class="eyebrow">当前君主</p>
          <h3>${escapeHtml(ruler.commonTitle)}</h3>
        </div>
        <span class="succession-badge">${escapeHtml(ruler.successionType)}</span>
      </div>
      <p class="inspector-name">${escapeHtml(ruler.personalName)}</p>
      ${aliasSectionHtml}
      <dl class="inspector-meta">
        <div>
          <dt>庙号</dt>
          <dd>${escapeHtml(ruler.templeName || "无")}</dd>
        </div>
        <div>
          <dt>谥号</dt>
          <dd>${escapeHtml(ruler.posthumousName || "无")}</dd>
        </div>
        <div>
          <dt>在位</dt>
          <dd>${escapeHtml(ruler.reignRange)}</dd>
        </div>
        <div>
          <dt>承袭</dt>
          <dd>${escapeHtml(ruler.relationToPrevious)}</dd>
        </div>
      </dl>
      <div class="inspector-era-block">
        <p class="subheading">逐年纪年</p>
        ${phaseTablesHtml}
      </div>
    </article>
  `;
}

function renderLegend() {
  if (elements.legend) {
    elements.legend.innerHTML = "";
  }
}

function buildOverviewLaneLayout(dynasties) {
  const items = dynasties
    .map((dynasty, index) => ({
      dynasty,
      sourceIndex: index,
      displayStartEdge: dynasty.startYear,
      displayEndEdge: dynasty.endYear + 1,
      hasTightBoundaryStart: false,
      hasTightBoundaryEnd: false,
    }))
    .sort(
      (left, right) =>
        left.dynasty.startYear - right.dynasty.startYear ||
        left.dynasty.endYear - right.dynasty.endYear ||
        left.sourceIndex - right.sourceIndex,
    );

  const hasFixedRows = items.some((item) => typeof item.dynasty.overviewRow === "number");

  for (let index = 0; index < items.length - 1; index += 1) {
    const current = items[index];
    const next = items[index + 1];

    if (next.dynasty.startYear === current.dynasty.endYear) {
      const splitEdge =
        (current.dynasty.endYear + 1 + next.dynasty.startYear) / 2;
      current.displayEndEdge = Math.min(current.displayEndEdge, splitEdge);
      next.displayStartEdge = Math.max(next.displayStartEdge, splitEdge);
      current.hasTightBoundaryEnd = true;
      next.hasTightBoundaryStart = true;
    }
  }

  if (hasFixedRows) {
    items.forEach((item) => {
      item.trackIndex =
        typeof item.dynasty.overviewRow === "number" ? item.dynasty.overviewRow : 0;
    });

    const maxTrackIndex = items.reduce(
      (max, item) => Math.max(max, item.trackIndex),
      0,
    );

    return {
      items,
      trackCount: Math.max(Math.ceil(maxTrackIndex) + 1, 1),
      maxTrackIndex,
    };
  }

  const trackEndEdges = [];
  items.forEach((item) => {
    let trackIndex = -1;
    const preferredTrackIndex = Number.isInteger(
      item.dynasty.overviewTrackPreference,
    )
      ? item.dynasty.overviewTrackPreference
      : null;

    if (preferredTrackIndex !== null) {
      while (trackEndEdges.length <= preferredTrackIndex) {
        trackEndEdges.push(Number.NEGATIVE_INFINITY);
      }

      if (item.displayStartEdge >= trackEndEdges[preferredTrackIndex]) {
        trackIndex = preferredTrackIndex;
      }
    }

    if (trackIndex === -1) {
      trackIndex = trackEndEdges.findIndex(
        (trackEndEdge) => item.displayStartEdge >= trackEndEdge,
      );
    }

    if (trackIndex === -1) {
      trackIndex = trackEndEdges.length;
      trackEndEdges.push(item.displayEndEdge);
    } else {
      trackEndEdges[trackIndex] = item.displayEndEdge;
    }

    item.trackIndex = trackIndex;
  });

  return {
    items,
    trackCount: Math.max(trackEndEdges.length, 1),
    maxTrackIndex: Math.max(trackEndEdges.length - 1, 0),
  };
}

function renderOverview() {
  const overviewTrackTopPadding = 52;
  const overviewTrackBottomPadding = 52;
  const overviewTrackHeight = 44;
  const overviewTrackGap = 18;
  const labeledTickSet = new Set(overviewConfig.ticks);
  const overviewGuideYears = [];
  const overviewGuideStart = Math.ceil(overviewConfig.startYear / 50) * 50;
  for (let year = overviewGuideStart; year <= overviewConfig.endYear; year += 50) {
    if (year === 0) {
      continue;
    }
    overviewGuideYears.push(year);
  }

  const minorTickYears = overviewGuideYears.filter((year) => !labeledTickSet.has(year));

  const minorTicksHtml = minorTickYears
    .map((tick) => {
      const { left } = positionPercent(
        tick,
        tick,
        overviewConfig.startYear,
        overviewConfig.endYear,
      );
      return `<div class="timeline-tick is-minor" style="left:${left}%;" aria-hidden="true"></div>`;
    })
    .join("");

  const majorTicksHtml = overviewConfig.ticks
    .map((tick) => {
      const { left } = positionPercent(
        tick,
        tick,
        overviewConfig.startYear,
        overviewConfig.endYear,
      );
      return `
        <div class="timeline-tick" style="left:${left}%;">
          <span>${escapeHtml(formatYear(tick))}</span>
        </div>
      `;
    })
    .join("");

  const lanesHtml = overviewConfig.lanes
    .map((lane) => {
      const laneDynasties = overviewDynasties.filter(
        (dynasty) => dynasty.lane === lane.id,
      );
      const { items, trackCount, maxTrackIndex } = buildOverviewLaneLayout(
        laneDynasties,
      );
      const useAttachedOutsideLabels = laneDynasties.some(
        (dynasty) => typeof dynasty.overviewRow === "number",
      );
      const laneTrackGap = useAttachedOutsideLabels ? 26 : overviewTrackGap;
      const labelSideByTrackAndId = new Map();

      if (useAttachedOutsideLabels) {
        const itemsByTrack = items.reduce((map, item) => {
          const trackKey = String(item.trackIndex);
          if (!map.has(trackKey)) {
            map.set(trackKey, []);
          }
          map.get(trackKey).push(item);
          return map;
        }, new Map());

        itemsByTrack.forEach((trackItems, trackKey) => {
          trackItems
            .sort((left, right) => left.displayStartEdge - right.displayStartEdge)
            .forEach((item, trackItemIndex) => {
              let side = trackItemIndex % 2 === 0 ? "is-above" : "is-below";
              if (trackItems.length === 1) {
                side = Number(trackKey) >= 2 ? "is-below" : "is-above";
              }
              labelSideByTrackAndId.set(item.dynasty.id, side);
            });
        });
      }
      const laneHeight =
        overviewTrackTopPadding +
        overviewTrackBottomPadding +
        overviewTrackHeight +
        maxTrackIndex * (overviewTrackHeight + laneTrackGap);
      const laneGuideLinesHtml = overviewGuideYears
        .map((year) => {
          const { left } = positionPercent(
            year,
            year,
            overviewConfig.startYear,
            overviewConfig.endYear,
          );
          const guideClasses = [
            "lane-track-guide",
            labeledTickSet.has(year) ? "is-major" : "is-minor",
          ]
            .filter(Boolean)
            .join(" ");

          return `<span class="${guideClasses}" style="left:${left}%"></span>`;
        })
        .join("");
      const outsideLabels = [];
      const dynasties = items
        .map((item, index) => {
          const dynasty = item.dynasty;
          const { left, width } = positionPercentContinuous(
            item.displayStartEdge,
            item.displayEndEdge,
            overviewConfig.startYear,
            overviewConfig.endYear,
          );
          const center = left + width / 2;
          const labelSide = useAttachedOutsideLabels
            ? labelSideByTrackAndId.get(dynasty.id) ?? "is-above"
            : index % 2 === 0
              ? "is-above"
              : "is-below";
          const blockTop =
            overviewTrackTopPadding +
            item.trackIndex * (overviewTrackHeight + laneTrackGap);
          const attachedLabelTop =
            labelSide === "is-above"
              ? Math.max(blockTop - 36, 8)
              : Math.min(blockTop + overviewTrackHeight + 12, laneHeight - 36);
          const labelPositionStyle = useAttachedOutsideLabels
            ? `left:${center}%; top:${attachedLabelTop}px; bottom:auto;`
            : `left:${center}%`;
          const allowBoundaryInset = dynasty.overviewFlushBoundaries !== true;
          const leftInsetPx =
            allowBoundaryInset && item.hasTightBoundaryStart && width > 0.18 ? 1 : 0;
          const rightInsetPx =
            allowBoundaryInset && item.hasTightBoundaryEnd && width > 0.18 ? 1 : 0;
          const blockLeftStyle =
            leftInsetPx > 0 ? `calc(${left}% + ${leftInsetPx}px)` : `${left}%`;
          const blockWidthStyle =
            leftInsetPx + rightInsetPx > 0
              ? `calc(${width}% - ${leftInsetPx + rightInsetPx}px)`
              : `${width}%`;
          const classes = [
            "dynasty-block",
            toneClassMap[dynasty.tone] ?? "tone-ink",
            dynasty.implemented ? "is-implemented" : "is-pending",
            state.selectedDynastyId === dynasty.id ? "is-selected" : "",
          ]
            .filter(Boolean)
            .join(" ");

          outsideLabels.push(`
            <button
              type="button"
              class="timeline-outside-label is-dynasty ${labelSide} ${state.selectedDynastyId === dynasty.id ? "is-selected" : ""}"
              style="${labelPositionStyle}"
              data-action="select-dynasty"
              data-dynasty-id="${dynasty.id}"
              aria-label="${dynasty.name}，${formatYearRange(dynasty.startYear, dynasty.endYear)}"
              title="${dynasty.name} · ${formatYearRange(dynasty.startYear, dynasty.endYear)}"
            >
              <span class="timeline-outside-name">${escapeHtml(dynasty.name)}</span>
              <span class="timeline-outside-meta">${escapeHtml(formatYearRange(dynasty.startYear, dynasty.endYear))}</span>
            </button>
          `);

          return `
            <button
              class="${classes}"
              type="button"
              style="left:${blockLeftStyle}; width:${blockWidthStyle}; top:${blockTop}px; height:${overviewTrackHeight}px; bottom:auto;"
              data-action="select-dynasty"
              data-dynasty-id="${dynasty.id}"
              aria-label="${dynasty.name}，${formatYearRange(dynasty.startYear, dynasty.endYear)}"
              title="${dynasty.name} · ${formatYearRange(dynasty.startYear, dynasty.endYear)} · ${dynasty.note}"
            ></button>
          `;
        })
        .join("");

      return `
        <div class="timeline-lane">
          <div class="lane-label">
            <strong>${escapeHtml(lane.label)}</strong>
          </div>
          <div class="lane-track" style="min-height:${laneHeight}px;">
            <div class="lane-track-guides" aria-hidden="true">${laneGuideLinesHtml}</div>
            ${outsideLabels.join("")}
            ${dynasties}
          </div>
        </div>
      `;
    })
    .join("");

  elements.overview.innerHTML = `
    <div class="timeline-axis-shell">
      <div class="timeline-axis-spacer" aria-hidden="true"></div>
      <div class="timeline-axis">${minorTicksHtml}${majorTicksHtml}</div>
    </div>
    <div class="timeline-lanes">${lanesHtml}</div>
  `;
}

function renderDetail() {
  const overviewDynasty = getSelectedOverviewDynasty();
  const detail = getSelectedDynasty();

  if (!overviewDynasty) {
    elements.detail.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">朝代详情</p>
          <h2>点击上方朝代查看详情</h2>
        </div>
      </div>
      <div class="placeholder-state">
        <p>首页默认只显示总览时间轴。请选择一个朝代后，再展开比例时间轴和帝王世系。</p>
      </div>
    `;
    delete elements.detail.dataset.dynasty;
    return;
  }

  if (!detail) {
    elements.detail.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">朝代详情</p>
          <h2>${escapeHtml(overviewDynasty.name)} · 预留结构</h2>
        </div>
      </div>
      <div class="placeholder-state">
        <p>这个朝代的详细数据还没有录入。</p>
      </div>
    `;
    return;
  }

  elements.detail.dataset.dynasty = detail.id;

  const rulerMap = new Map(detail.rulers.map((ruler) => [ruler.id, ruler]));
  const treeNodes = detail.genealogyRows.flatMap((row) => row.nodes);
  const treeNodeMap = new Map(treeNodes.map((node) => [node.id, node]));
  const childrenByParent = treeNodes.reduce((map, node) => {
    if (!node.parentId) {
      return map;
    }

    if (!map.has(node.parentId)) {
      map.set(node.parentId, []);
    }
    map.get(node.parentId).push(node.id);
    return map;
  }, new Map());
  const getNodeCenterPercent = (node) =>
    (((node.colStart - 1) + node.colSpan / 2) / detail.genealogyColumns) * 100;
  const lineageScale = buildLineageScale(detail);
  const lineageTicks = lineageScale.labeledYears
    .map((tick) => {
      const { left } = positionPercent(
        tick,
        tick,
        detail.lineageStartYear,
        detail.lineageEndYear,
      );
      return `
        <div class="timeline-tick ruler-tick" style="left:${left}%;">
          <span>${escapeHtml(formatYear(tick))}</span>
        </div>
      `;
    })
    .join("");

  const rulerGridLines = [
    ...lineageScale.minorYears.map((year) => ({ year, type: "minor" })),
    ...lineageScale.labeledYears.map((year) => ({ year, type: "major" })),
    ...lineageScale.reignBoundaryYears.map((year) => ({ year, type: "boundary" })),
  ]
    .map(({ year, type }) => {
      const { left } = positionPercent(
        year,
        year,
        detail.lineageStartYear,
        detail.lineageEndYear,
      );
      return `<span class="ruler-grid-line is-${type}" style="left:${left}%"></span>`;
    })
    .join("");

  const timelineRows =
    detail.timelineRows?.length
      ? detail.timelineRows
      : [{ id: `${detail.id}-timeline`, label: "", rulerIds: detail.rulers.map((ruler) => ruler.id) }];
  const hasMultipleTimelineRows = timelineRows.length > 1;
  const timelineRowsHtml = timelineRows
    .map((row, rowIndex) => {
      const rulerOutsideLabels = [];
      let labelIndex = 0;
      const rowBlocks = row.rulerIds
        .map((rulerId) => {
          const ruler = rulerMap.get(rulerId);
          if (!ruler) {
            return "";
          }

          const toneClass = ruler.order % 2 === 1 ? "is-tone-a" : "is-tone-b";

          return getTimelineSegments(ruler)
            .map((segment) => {
              const { left, width } = positionPercentContinuous(
                segment.displayStartEdge ?? segment.startYear,
                segment.displayEndEdge ?? segment.endYear + 1,
                detail.lineageStartYear,
                detail.lineageEndYear,
              );
              const center = left + width / 2;
              const labelSide = (labelIndex + rowIndex) % 2 === 0 ? "is-above" : "is-below";
              const segmentMeta =
                segment.meta ?? formatYearRange(segment.startYear, segment.endYear);
              labelIndex += 1;

              rulerOutsideLabels.push(`
                <button
                  type="button"
                  class="timeline-outside-label is-ruler ${toneClass} ${labelSide} ${state.selectedRulerId === ruler.id ? "is-selected" : ""}"
                  style="left:${center}%"
                  data-action="select-ruler"
                  data-ruler-id="${ruler.id}"
                  aria-label="${ruler.commonTitle}，${segmentMeta}"
                  title="${ruler.commonTitle} · ${segmentMeta}"
                >
                  <span class="timeline-outside-name">${escapeHtml(segment.label ?? ruler.commonTitle)}</span>
                  <span class="timeline-outside-meta">${escapeHtml(segmentMeta)}</span>
                </button>
              `);

              return `
                <button
                  class="ruler-block ${toneClass} ${state.selectedRulerId === ruler.id ? "is-selected" : ""}"
                  type="button"
                  style="left:${left}%; width:${width}%;"
                  data-action="select-ruler"
                  data-ruler-id="${ruler.id}"
                  aria-label="${ruler.commonTitle}，${segmentMeta}"
                  title="${ruler.commonTitle} · ${segmentMeta}"
                ></button>
              `;
            })
            .join("");
        })
        .join("");

      const rowTrack = `
        <div class="ruler-track-row-track">
          <div class="ruler-track">
            <div class="ruler-grid">${rulerGridLines}</div>
            ${rulerOutsideLabels.join("")}
            ${rowBlocks}
          </div>
        </div>
      `;

      if (!hasMultipleTimelineRows) {
        return rowTrack;
      }

      return `
        <div class="ruler-track-row">
          <div class="ruler-track-row-label">
            <strong>${escapeHtml(row.label)}</strong>
          </div>
          ${rowTrack}
        </div>
      `;
    })
    .join("");

  const timelineAxisHtml = hasMultipleTimelineRows
    ? `
      <div class="ruler-axis-shell">
        <div class="ruler-axis-spacer"></div>
        <div class="ruler-axis">${lineageTicks}</div>
      </div>
    `
    : `<div class="ruler-axis">${lineageTicks}</div>`;

  const genealogyRows = detail.genealogyRows
    .map((row, rowIndex) => {
      const genealogyColumnWidth = detail.genealogyColumnWidth ?? 28;
      const genealogyCanvasMinWidth = detail.genealogyColumns * genealogyColumnWidth;
      const genealogyRowMinWidth = 112 + 14 + genealogyCanvasMinWidth;
      const branchGroups = Object.values(
        row.nodes.reduce((groups, node) => {
          if (!node.parentId) {
            return groups;
          }

          if (!groups[node.parentId]) {
            groups[node.parentId] = [];
          }
          groups[node.parentId].push(node);
          return groups;
        }, {}),
      ).filter((group) => group.length > 1);

      const connectors = branchGroups
        .map((group) => {
          const parentNode = treeNodeMap.get(group[0].parentId);
          const parentCenter = parentNode ? getNodeCenterPercent(parentNode) : null;
          const centers = group.map((node) => getNodeCenterPercent(node));
          const childLeft = Math.min(...centers);
          const childRight = Math.max(...centers);
          const branchCenter = (childLeft + childRight) / 2;
          const hasParentOffset =
            parentCenter !== null && Math.abs(parentCenter - branchCenter) > 0.2;
          const parentLinkLeft = hasParentOffset
            ? Math.min(parentCenter, branchCenter)
            : null;
          const parentLinkWidth = hasParentOffset
            ? Math.abs(parentCenter - branchCenter)
            : 0;
          const childJoints = centers
            .map(
              (center) =>
                `<span class="genealogy-joint is-child" style="left:${center}%"></span>`,
            )
            .join("");
          const parentJoint = parentCenter === null
            ? ""
            : `<span class="genealogy-joint is-parent" style="left:${parentCenter}%"></span>`;
          const branchJoint = hasParentOffset
            ? `<span class="genealogy-joint is-branch-point" style="left:${branchCenter}%"></span>`
            : "";
          const parentLink = hasParentOffset
            ? `<span class="genealogy-branch is-parent-link" style="left:${parentLinkLeft}%; width:${parentLinkWidth}%"></span>`
            : "";

          return `
            <div class="genealogy-connector-group">
              <span class="genealogy-branch is-children" style="left:${childLeft}%; width:${childRight - childLeft}%"></span>
              ${parentLink}
              ${parentJoint}
              ${branchJoint}
              ${childJoints}
            </div>
          `;
        })
        .join("");

      const nodes = row.nodes
        .map((node) => {
          const hasChildren = childrenByParent.has(node.id);
          const hasParent = Boolean(node.parentId);
          const columnStyle = `grid-column:${node.colStart} / span ${node.colSpan};`;

          if (node.type === "relative") {
            const relativeMeta = [node.subtitle].filter(Boolean).join(" · ");
            return `
              <article
                class="genealogy-node is-relative ${hasParent ? "has-parent" : ""} ${hasChildren ? "has-children" : ""}"
                id="tree-node-${node.id}"
                style="${columnStyle}"
              >
                <span class="genealogy-node-title">${escapeHtml(node.label)}</span>
                <span class="genealogy-node-meta">${escapeHtml(relativeMeta)}</span>
              </article>
            `;
          }

          const ruler = rulerMap.get(node.rulerId);

          return `
            <button
              type="button"
              class="genealogy-node is-emperor ${ruler.order % 2 === 1 ? "is-tone-a" : "is-tone-b"} ${hasParent ? "has-parent" : ""} ${hasChildren ? "has-children" : ""} ${state.selectedRulerId === ruler.id ? "is-selected" : ""}"
              id="tree-node-${node.id}"
              style="${columnStyle}"
              data-action="select-ruler"
              data-ruler-id="${ruler.id}"
            >
              <span class="genealogy-kicker">第${escapeHtml(String(ruler.displayOrder ?? ruler.order))}位</span>
              <span class="genealogy-node-title">${escapeHtml(node.displayTitle ?? ruler.commonTitle)}</span>
              <span class="genealogy-node-years">${escapeHtml(node.displayYears ?? getRulerTimelineLabel(ruler))}</span>
            </button>
          `;
        })
        .join("");

      return `
        <div
          class="genealogy-row ${rowIndex % 2 === 0 ? "is-band-a" : "is-band-b"}"
          style="min-width:${genealogyRowMinWidth}px;"
        >
          <div class="genealogy-label">
            <strong>${escapeHtml(row.label)}</strong>
          </div>
          <div
            class="genealogy-canvas"
            style="min-width:${genealogyCanvasMinWidth}px; grid-template-columns:repeat(${detail.genealogyColumns}, ${genealogyColumnWidth}px);"
          >
            ${connectors}
            ${nodes}
          </div>
        </div>
      `;
    })
    .join("");

  const statCards = `
    <div class="detail-stats">
      <div class="metric-card">
        <span class="metric-label">正式国号阶段</span>
        <strong>${escapeHtml(formatYearRange(detail.dynastyStartYear, detail.dynastyEndYear))}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">帝系追溯范围</span>
        <strong>${escapeHtml(formatYearRange(detail.lineageStartYear, detail.lineageEndYear))}</strong>
      </div>
      <div class="metric-card">
        <span class="metric-label">已录入君主</span>
        <strong>${detail.rulers.length} 位</strong>
      </div>
    </div>
  `;

  elements.detail.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="eyebrow">朝代详情</p>
        <h2>${escapeHtml(detail.formalName)} · 帝王世系原型</h2>
      </div>
    </div>

    ${statCards}

    <section class="subpanel">
      <div class="subpanel-head">
        <div>
          <p class="eyebrow">比例时间轴</p>
          <h3>帝王在位长度</h3>
        </div>
      </div>
      ${timelineAxisHtml}
      <div class="ruler-track-stack ${hasMultipleTimelineRows ? "has-rows" : "is-single"}">
        ${timelineRowsHtml}
      </div>
    </section>

    <section class="subpanel">
      <div class="subpanel-head">
        <div>
          <p class="eyebrow">谱系树</p>
          <h3>按世代展开的竖向流程图</h3>
        </div>
      </div>
      <div class="genealogy-flow">${genealogyRows}</div>
    </section>
  `;

  const activeNode = document.querySelector(`[data-ruler-id="${state.selectedRulerId}"]`);
  if (activeNode && state.shouldScrollToSelectedRuler) {
    activeNode.scrollIntoView({ block: "nearest", behavior: "smooth" });
    state.shouldScrollToSelectedRuler = false;
  }
}

function renderSearchResults() {
  if (!state.searchQuery) {
    elements.searchResults.innerHTML = "";
    return;
  }

  if (state.searchResults.length === 0) {
    elements.searchResults.innerHTML = `
      <div class="empty-search">
        <p>没有找到与“${escapeHtml(state.searchQuery)}”对应的结果。</p>
      </div>
    `;
    return;
  }

  elements.searchResults.innerHTML = state.searchResults
    .map((result) => {
      if (result.kind === "year") {
        const resultTitle = result.isNoEraRecord
          ? `${result.query}年对应 ${result.rulerCommonTitle}（${result.eraName}）`
          : `${result.query}年对应 ${result.eraName}${result.regnalYearLabel}`;
        return `
          <button
            type="button"
            class="search-result-card"
            data-action="jump-result"
            data-dynasty-id="${result.dynastyId}"
            data-ruler-id="${result.rulerId}"
          >
            <span class="result-kind">公元年份</span>
            <h3>${escapeHtml(resultTitle)}</h3>
            <p>${escapeHtml(result.dynastyName)} · ${escapeHtml(result.rulerCommonTitle)} · ${escapeHtml(result.rulerPersonalName)}</p>
            <p>${escapeHtml(formatYearRange(result.startYear, result.endYear))}</p>
          </button>
        `;
      }

      return `
        <button
          type="button"
          class="search-result-card"
          data-action="jump-result"
          data-dynasty-id="${result.dynastyId}"
          data-ruler-id="${result.rulerId}"
        >
          <span class="result-kind">年号检索</span>
          <h3>${escapeHtml(result.eraName)}</h3>
          <p>${escapeHtml(result.dynastyName)} · ${escapeHtml(result.rulerCommonTitle)} · ${escapeHtml(result.rulerPersonalName)}</p>
          <p>${escapeHtml(formatYearRange(result.startYear, result.endYear))}</p>
        </button>
      `;
    })
    .join("");
}

function performSearch(rawQuery) {
  const query = rawQuery.trim();
  state.searchQuery = query;

  if (!query) {
    state.searchResults = [];
    renderSearchResults();
    return;
  }

  if (/^-?\d+$/.test(query)) {
    const year = Number(query);
    state.searchResults = searchIndex
      .filter((record) => year >= record.startYear && year <= record.endYear)
      .map((record) => ({
        ...record,
        kind: "year",
        query,
        regnalYearLabel: record.isNoEraRecord
          ? ""
          : formatRegnalYear(year - record.startYear + 1),
      }))
      .sort((left, right) => left.startYear - right.startYear);
  } else {
    state.searchResults = searchIndex
      .filter((record) => record.eraName.includes(query))
      .map((record) => ({
        ...record,
        kind: "era",
      }))
      .sort((left, right) => left.startYear - right.startYear);
  }

  renderSearchResults();
}

function clearSelection() {
  if (!state.selectedDynastyId && !state.selectedRulerId) {
    return;
  }

  state.selectedDynastyId = null;
  state.selectedRulerId = null;
  state.shouldScrollToSelectedRuler = false;
  renderOverview();
  renderDetail();
  renderSelectedRulerPanel();
}

function shouldClearSelectionFromClick(target) {
  if (!target || !(target instanceof Element)) {
    return false;
  }

  if (
    target.closest(
      'input, textarea, select, option, button, label, a, summary, details, [data-action], .inspector-card, .metric-card, .empty-search',
    )
  ) {
    return false;
  }

  return target.matches(
    [
      "body",
      ".page-shell",
      ".app-grid",
      ".panel",
      ".overview-panel",
      ".search-panel",
      ".detail-panel",
      "#overviewTimeline",
      ".timeline-axis",
      ".timeline-lanes",
      ".timeline-lane",
      ".lane-track",
      ".hero",
      ".hero-copy",
      ".hero-search",
      ".hero-search-body",
      "#detailPanel",
      ".placeholder-state",
      ".subpanel",
      ".subpanel-head",
      ".ruler-axis-shell",
      ".ruler-axis",
      ".ruler-track-stack",
      ".ruler-track-row",
      ".ruler-track-row-track",
      ".ruler-track",
      ".ruler-grid",
      ".selected-ruler-panel",
      "#selectedRulerPanel",
      ".genealogy-flow",
      ".genealogy-row",
      ".genealogy-canvas",
      ".genealogy-connector-group",
      ".genealogy-branch",
      ".genealogy-joint",
    ].join(", "),
  );
}

function selectDynasty(dynastyId) {
  state.selectedDynastyId = dynastyId;
  const overviewDynasty =
    overviewDynasties.find((dynasty) => dynasty.id === dynastyId) ??
    overviewDynasties[0];
  const detail = detailRegistry[overviewDynasty.detailId ?? overviewDynasty.id];
  if (detail) {
    state.selectedRulerId = overviewDynasty.defaultRulerId ?? detail.rulers[0].id;
  }
  state.shouldScrollToSelectedRuler = false;
  renderOverview();
  renderDetail();
  renderSelectedRulerPanel();
}

function selectRuler(rulerId) {
  state.selectedRulerId = rulerId;
  state.shouldScrollToSelectedRuler = false;
  renderDetail();
  renderSelectedRulerPanel();
}

function attachEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performSearch(elements.searchInput.value);
  });

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) {
      if (shouldClearSelectionFromClick(event.target)) {
        clearSelection();
      }
      return;
    }

    const action = actionTarget.dataset.action;
    if (action === "select-dynasty") {
      selectDynasty(actionTarget.dataset.dynastyId);
      return;
    }

    if (action === "select-ruler") {
      selectRuler(actionTarget.dataset.rulerId);
      return;
    }

    if (action === "jump-result") {
      const dynastyId = actionTarget.dataset.dynastyId;
      const rulerId = actionTarget.dataset.rulerId;
      if (dynastyId) {
        state.selectedDynastyId = dynastyId;
      }
      if (rulerId) {
        state.selectedRulerId = rulerId;
      }
      state.shouldScrollToSelectedRuler = true;
      renderOverview();
      renderDetail();
      renderSelectedRulerPanel();
    }
  });
}

function init() {
  renderLegend();
  renderOverview();
  renderDetail();
  renderSelectedRulerPanel();
  renderSearchResults();
  attachEvents();
}

init();
