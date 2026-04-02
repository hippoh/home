const DATA = window.PHILOSOPHY_DATA;
const CORE_IDEAS = window.PHILOSOPHY_CORE_IDEAS || {};

if (!DATA) {
  throw new Error("未找到哲学数据，请先运行 scripts/build-data.mjs。");
}

const ERA_BUCKETS = [
  {
    id: "ancient",
    label: "古希腊与古典",
    color: "#2c6db0",
    eras: ["古希腊早期", "古希腊", "古典时代"],
  },
  {
    id: "hellenistic",
    label: "希腊化与罗马",
    color: "#1e8b8a",
    eras: ["希腊化时代", "罗马共和国末期", "罗马时期"],
  },
  {
    id: "medieval",
    label: "晚期古代与中世纪",
    color: "#7b628f",
    eras: ["晚期古代", "早期基督教", "早期中世纪", "中世纪", "中世纪末", "古代晚期至中世纪"],
  },
  {
    id: "early-modern",
    label: "文艺复兴与近代",
    color: "#d57a1d",
    eras: ["文艺复兴", "宗教改革", "近代早期", "近代", "17世纪", "17至18世纪", "近代以来"],
  },
  {
    id: "enlightenment",
    label: "启蒙与德国古典",
    color: "#bf5817",
    eras: ["启蒙", "18世纪", "18世纪末", "18至19世纪", "德国古典"],
  },
  {
    id: "nineteenth",
    label: "19世纪",
    color: "#b9453e",
    eras: ["19世纪"],
  },
  {
    id: "twentieth",
    label: "20世纪",
    color: "#2d7d5a",
    eras: ["19至20世纪", "20世纪", "20世纪后半叶", "20至21世纪"],
  },
  {
    id: "contemporary",
    label: "当代",
    color: "#bb8a18",
    eras: ["当代"],
  },
];

const RELATION_FAMILIES = [
  {
    id: "constructive",
    label: "建构",
    summary: "奠基、系统化",
    color: "#356d5a",
    types: ["foundation", "systematization"],
  },
  {
    id: "transform",
    label: "转化",
    summary: "修正、整合、调和、转向",
    color: "#c6821f",
    types: ["revision", "integration", "mediation", "reordering", "turn"],
  },
  {
    id: "conflict",
    label: "冲突",
    summary: "反驳、批判",
    color: "#b8443d",
    types: ["rebuttal", "critique"],
  },
  {
    id: "translation",
    label: "转译",
    summary: "转译、神学化、政治化",
    color: "#7a4f8d",
    types: ["translation", "theologization", "politicization"],
  },
  {
    id: "deepening",
    label: "深化",
    summary: "历史化、物质化、谱系化、激化",
    color: "#243749",
    types: [
      "historicization",
      "materialization",
      "genealogization",
      "radicalization",
      "institutionalization",
      "phenomenologization",
      "existentialization",
      "virtue_return",
      "capability_turn",
    ],
  },
];

const RELATION_META = new Map(
  RELATION_FAMILIES.flatMap((family) =>
    family.types.map((type) => [
      type,
      {
        familyId: family.id,
        familyLabel: family.label,
        color: family.color,
        summary: family.summary,
      },
    ]),
  ),
);

const ROLE_LABELS = {
  core: "课程主角",
  bridge: "桥梁人物",
  secondary: "支流人物",
};

const CANONICAL_OVERRIDES = {
  socrates: { fame: 100, thought: 98 },
  plato: { fame: 100, thought: 100 },
  aristotle: { fame: 100, thought: 100 },
  epicurus: { fame: 82, thought: 80 },
  seneca: { fame: 74, thought: 72 },
  epictetus: { fame: 80, thought: 77 },
  marcus_aurelius: { fame: 82, thought: 70 },
  plotinus: { fame: 72, thought: 79 },
  augustine: { fame: 90, thought: 94 },
  aquinas: { fame: 86, thought: 92 },
  ockham: { fame: 72, thought: 76 },
  machiavelli: { fame: 84, thought: 81 },
  montaigne: { fame: 80, thought: 76 },
  pascal: { fame: 80, thought: 76 },
  bacon: { fame: 80, thought: 75 },
  descartes: { fame: 96, thought: 94 },
  hobbes: { fame: 82, thought: 81 },
  locke: { fame: 90, thought: 85 },
  spinoza: { fame: 88, thought: 90 },
  leibniz: { fame: 86, thought: 88 },
  hume: { fame: 92, thought: 92 },
  rousseau: { fame: 88, thought: 87 },
  smith: { fame: 78, thought: 74 },
  kant: { fame: 98, thought: 99 },
  hegel: { fame: 96, thought: 97 },
  schopenhauer: { fame: 84, thought: 82 },
  kierkegaard: { fame: 82, thought: 85 },
  marx: { fame: 98, thought: 95 },
  nietzsche: { fame: 98, thought: 94 },
  james: { fame: 76, thought: 76 },
  dewey: { fame: 72, thought: 75 },
  freud: { fame: 95, thought: 88 },
  russell: { fame: 84, thought: 84 },
  wittgenstein: { fame: 94, thought: 92 },
  husserl: { fame: 76, thought: 85 },
  heidegger: { fame: 93, thought: 95 },
  sartre: { fame: 89, thought: 84 },
  beauvoir: { fame: 88, thought: 83 },
  camus: { fame: 86, thought: 74 },
  arendt: { fame: 86, thought: 84 },
  buber: { fame: 70, thought: 72 },
  levinas: { fame: 68, thought: 76 },
  foucault: { fame: 92, thought: 90 },
  derrida: { fame: 82, thought: 80 },
  habermas: { fame: 70, thought: 76 },
  rawls: { fame: 78, thought: 82 },
  macintyre: { fame: 70, thought: 78 },
  nussbaum: { fame: 74, thought: 80 },
  sen: { fame: 70, thought: 76 },
};

const TYPE_DEFAULTS = {
  core: { fame: 64, thought: 76 },
  bridge: { fame: 50, thought: 61 },
  secondary: { fame: 38, thought: 46 },
};

const dom = {
  stage: document.querySelector(".stage"),
  uiRail: document.querySelector("#ui-rail"),
  svg: document.querySelector("#graph-svg"),
  searchInput: document.querySelector("#search-input"),
  resetView: document.querySelector("#reset-view"),
  detailPanel: document.querySelector("#detail-panel"),
  legendCard: document.querySelector("#legend-card"),
  hoverCard: document.querySelector("#hover-card"),
};

const allNodes = DATA.nodes;
const nodeById = new Map(allNodes.map((node) => [node.id, node]));
const philosophers = allNodes
  .filter((node) => node.type === "philosopher")
  .map((node) => ({
    ...node,
    bucket: inferBucket(node.era),
    fameScore: 0,
    thoughtScore: 0,
    connectionScore: 0,
    importanceScore: 0,
    radius: 0,
    labelRank: 0,
    searchText: [node.label, node.era, node.region, ...(node.tags || [])].join(" ").toLowerCase(),
  }));

const philosopherById = new Map(philosophers.map((node) => [node.id, node]));
const philosopherEdges = DATA.edges
  .map((edge, index) => ({
    ...edge,
    id: `edge-${index}`,
    sourceNode: philosopherById.get(edge.source),
    targetNode: philosopherById.get(edge.target),
  }))
  .filter((edge) => edge.sourceNode && edge.targetNode);

const visualEdges = philosopherEdges.filter((edge) => edge.source !== edge.target);
const outgoing = new Map(philosophers.map((node) => [node.id, []]));
const incoming = new Map(philosophers.map((node) => [node.id, []]));

for (const edge of philosopherEdges) {
  outgoing.get(edge.source).push(edge);
  incoming.get(edge.target).push(edge);
}

const state = {
  selectedNodeId: null,
  hoveredNodeId: null,
  search: "",
  searchMatches: [],
  layout: null,
};

function inferBucket(era) {
  for (const bucket of ERA_BUCKETS) {
    if (bucket.eras.includes(era)) {
      return bucket;
    }
  }

  for (const bucket of ERA_BUCKETS) {
    if (bucket.eras.some((item) => era.includes(item) || item.includes(era))) {
      return bucket;
    }
  }

  return ERA_BUCKETS.at(-1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function relationMeta(type) {
  return (
    RELATION_META.get(type) || {
      familyId: "other",
      familyLabel: "其他",
      color: "rgba(63, 83, 97, 0.44)",
      summary: "",
    }
  );
}

function scaleLinear(value, domainMin, domainMax, rangeMin, rangeMax) {
  if (domainMax === domainMin) {
    return (rangeMin + rangeMax) / 2;
  }

  const t = (value - domainMin) / (domainMax - domainMin);
  return rangeMin + t * (rangeMax - rangeMin);
}

function coreIdeaFor(node) {
  const explicit = CORE_IDEAS[node.id];

  if (explicit) {
    return explicit;
  }

  const tags = (node.tags || []).slice(0, 3);

  if (tags.length) {
    return `${node.label}的核心问题常围绕${tags.join("、")}展开。`;
  }

  return `${node.label}在这张思想地图中代表了一条具有独特方向的哲学路径。`;
}

function scoreNodes() {
  const weightedConnections = philosophers.map((node) => {
    const totalWeight = [...incoming.get(node.id), ...outgoing.get(node.id)].reduce(
      (sum, edge) => sum + edge.weight,
      0,
    );
    return totalWeight;
  });

  const minConnections = Math.min(...weightedConnections);
  const maxConnections = Math.max(...weightedConnections);

  for (const node of philosophers) {
    const canonical = CANONICAL_OVERRIDES[node.id];
    const defaults = TYPE_DEFAULTS[node.course_role] || TYPE_DEFAULTS.secondary;
    const weightedDegree = [...incoming.get(node.id), ...outgoing.get(node.id)].reduce(
      (sum, edge) => sum + edge.weight,
      0,
    );

    node.weightedDegree = weightedDegree;
    node.connectionCount = incoming.get(node.id).length + outgoing.get(node.id).length;
    node.fameScore = canonical?.fame ?? defaults.fame;
    node.thoughtScore = canonical?.thought ?? defaults.thought;
    node.connectionScore = Number(
      scaleLinear(weightedDegree, minConnections, maxConnections, 28, 100).toFixed(1),
    );
    node.importanceScore = Number(
      (
        node.fameScore * 0.42 +
        node.thoughtScore * 0.33 +
        node.connectionScore * 0.25
      ).toFixed(1),
    );
  }

  const sorted = [...philosophers].sort(
    (a, b) => b.importanceScore - a.importanceScore || b.weightedDegree - a.weightedDegree,
  );
  sorted.forEach((node, index) => {
    node.labelRank = index + 1;
  });

  const minImportance = Math.min(...philosophers.map((node) => node.importanceScore));
  const maxImportance = Math.max(...philosophers.map((node) => node.importanceScore));

  for (const node of philosophers) {
    node.radius = Number(scaleLinear(node.importanceScore, minImportance, maxImportance, 5.5, 27).toFixed(2));
  }
}

function renderMeta() {
  if (!dom.legendCard) {
    return;
  }

  dom.legendCard.innerHTML = RELATION_FAMILIES.map(
    (family) => `
      <div class="legend-line-item">
        <i class="legend-line-swatch" style="background:${family.color}"></i>
        <div class="legend-copy">
          <strong>${escapeHtml(family.label)}</strong>
          <span>${escapeHtml(family.summary)}</span>
        </div>
      </div>
    `,
  ).join("");
}

function computeLayout() {
  const width = dom.svg.clientWidth || window.innerWidth;
  const railWidth = width > 980 ? dom.uiRail.getBoundingClientRect().width + 42 : 0;
  const sidePadding = Math.max(54, width * 0.05);
  const topPadding = 56;
  const bottomPadding = 80;
  const graphWidth = Math.max(640, width - sidePadding - railWidth - 20);
  const positions = new Map();
  const bands = [];
  let cursorY = topPadding;

  ERA_BUCKETS.forEach((bucket, bucketIndex) => {
    const bucketNodes = philosophers
      .filter((node) => node.bucket.id === bucket.id)
      .sort(
        (a, b) =>
          b.importanceScore - a.importanceScore ||
          b.weightedDegree - a.weightedDegree ||
          a.label.localeCompare(b.label, "zh-Hans-CN"),
      );

    if (!bucketNodes.length) {
      return;
    }

    const bandHeight = Math.max(250, Math.min(430, 160 + bucketNodes.length * 15));
    const areaX = sidePadding + 22;
    const areaY = cursorY + 24;
    const areaWidth = graphWidth - 44;
    const areaHeight = bandHeight - 48;

    const scattered = scatterBucketNodes({
      bucketNodes,
      bucketIndex,
      areaX,
      areaY,
      areaWidth,
      areaHeight,
    });

    for (const point of scattered) {
      positions.set(point.id, { x: point.x, y: point.y, bucketIndex, bandY: cursorY });
    }

    bands.push({
      id: bucket.id,
      label: bucket.label,
      color: bucket.color,
      index: bucketIndex,
      x: sidePadding,
      y: cursorY,
      width: graphWidth,
      height: bandHeight,
      count: bucketNodes.length,
    });

    cursorY += bandHeight + 28;
  });

  const height = cursorY + bottomPadding;
  state.layout = { width, height, sidePadding, topPadding, bottomPadding, positions, bands };
}

function scatterBucketNodes({
  bucketNodes,
  bucketIndex,
  areaX,
  areaY,
  areaWidth,
  areaHeight,
}) {
  const centerX = areaX + areaWidth / 2;
  const centerY = areaY + areaHeight / 2;
  const maxRadiusX = areaWidth / 2 - 24;
  const maxRadiusY = areaHeight / 2 - 18;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const seed = bucketIndex * 0.81 + 0.35;

  const points = bucketNodes.map((node, index) => {
    const radial = index === 0 ? 0 : Math.sqrt((index + 0.4) / bucketNodes.length);
    const angle = seed + index * goldenAngle;
    const x = centerX + Math.cos(angle) * maxRadiusX * radial * 0.98;
    const y = centerY + Math.sin(angle) * maxRadiusY * radial * 0.82;

    return {
      id: node.id,
      radius: node.radius,
      x,
      y,
      targetX: x,
      targetY: y,
    };
  });

  const minX = areaX + 10;
  const maxX = areaX + areaWidth - 10;
  const minY = areaY + 10;
  const maxY = areaY + areaHeight - 10;

  for (let iteration = 0; iteration < 180; iteration += 1) {
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.hypot(dx, dy);

        if (distance === 0) {
          dx = 0.01;
          dy = 0.01;
          distance = 0.014;
        }

        const minDistance = a.radius + b.radius + 7;
        if (distance < minDistance) {
          const push = (minDistance - distance) / 2;
          const nx = dx / distance;
          const ny = dy / distance;

          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }

    for (const point of points) {
      point.x += (point.targetX - point.x) * 0.032;
      point.y += (point.targetY - point.y) * 0.032;
      point.x = Math.min(maxX - point.radius, Math.max(minX + point.radius, point.x));
      point.y = Math.min(maxY - point.radius, Math.max(minY + point.radius, point.y));
    }
  }

  return points;
}

function edgeColor(edge, active) {
  const base = relationMeta(edge.relation_type).color;
  if (!active) {
    return "rgba(93, 110, 118, 0.18)";
  }
  return base;
}

function edgeOpacity(edge) {
  const selected = state.selectedNodeId;
  const hovered = state.hoveredNodeId;

  if (selected) {
    return edge.source === selected || edge.target === selected ? 0.72 : 0.04;
  }

  if (hovered) {
    return edge.source === hovered || edge.target === hovered ? 0.48 : 0.04;
  }

  if (state.search) {
    const matchSet = new Set(state.searchMatches.map((node) => node.id));
    return matchSet.has(edge.source) || matchSet.has(edge.target) ? 0.22 : 0.03;
  }

  return 0.14;
}

function nodeOpacity(node) {
  const selected = state.selectedNodeId;
  const hovered = state.hoveredNodeId;
  const matchIds = new Set(state.searchMatches.map((item) => item.id));

  if (selected) {
    if (node.id === selected) return 1;
    if (isNeighborOf(node.id, selected)) return 0.92;
    return 0.18;
  }

  if (hovered) {
    if (node.id === hovered) return 1;
    if (isNeighborOf(node.id, hovered)) return 0.82;
    return 0.28;
  }

  if (state.search) {
    return matchIds.has(node.id) ? 1 : 0.14;
  }

  return 0.96;
}

function isNeighborOf(nodeId, focusId) {
  return incoming.get(focusId).some((edge) => edge.source === nodeId) || outgoing.get(focusId).some((edge) => edge.target === nodeId);
}

function shouldShowLabel(node) {
  if (state.selectedNodeId === node.id || state.hoveredNodeId === node.id) {
    return true;
  }

  if (state.selectedNodeId && isNeighborOf(node.id, state.selectedNodeId)) {
    return true;
  }

  if (state.search && state.searchMatches.some((item) => item.id === node.id)) {
    return true;
  }

  return node.labelRank <= 18;
}

function labelClass(node) {
  if (node.labelRank > 10) {
    return "node-label secondary";
  }
  return "node-label";
}

function formatNameList(names) {
  if (!names.length) {
    return "";
  }

  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `${names[0]}和${names[1]}`;
  }

  return `${names.slice(0, -1).join("、")}和${names.at(-1)}`;
}

function uniqueRelatedNames(edgeList, direction) {
  const names = [];
  const seen = new Set();

  for (const edge of edgeList) {
    const node = direction === "incoming" ? edge.sourceNode : edge.targetNode;
    if (!node || seen.has(node.id)) {
      continue;
    }
    seen.add(node.id);
    names.push(node.label);
  }

  return names;
}

function buildBiography(node) {
  const roleText =
    node.course_role === "core"
      ? "是西方哲学史上的关键人物"
      : node.course_role === "bridge"
        ? "常被视为连接不同思想传统的桥梁人物"
        : "是西方哲学史上具有代表性的支线人物";

  const tagText = (node.tags || []).slice(0, 3).join("、");
  const predecessorNames = uniqueRelatedNames(
    [...outgoing.get(node.id)].sort((a, b) => b.weight - a.weight).slice(0, 3),
    "outgoing",
  );
  const successorNames = uniqueRelatedNames(
    [...incoming.get(node.id)].sort((a, b) => b.weight - a.weight).slice(0, 3),
    "incoming",
  );

  let biography = `${node.label}活跃于${node.era}，主要活动地区是${node.region}，${roleText}。`;

  if (tagText) {
    biography += `其思想通常与${tagText}等问题联系在一起。`;
  }

  if (predecessorNames.length) {
    biography += `在这张关系图里，其思想常被放回${formatNameList(predecessorNames)}等更早人物开启的脉络中理解。`;
  }

  if (successorNames.length) {
    biography += `后来的${formatNameList(successorNames)}等人物又继续继承、修正或批判了其思想。`;
  }

  return biography;
}

function groupEdgesByFamily(edgeList) {
  return RELATION_FAMILIES.map((family) => ({
    family,
    edges: edgeList
      .filter((edge) => relationMeta(edge.relation_type).familyId === family.id)
      .sort((a, b) => {
        const aLabel = a.sourceNode?.label || a.targetNode?.label || "";
        const bLabel = b.sourceNode?.label || b.targetNode?.label || "";
        return b.weight - a.weight || aLabel.localeCompare(bLabel, "zh-CN");
      }),
  })).filter((group) => group.edges.length);
}

function renderRelationGroups(edgeList, side) {
  const groups = groupEdgesByFamily(edgeList);

  if (!groups.length) {
    return `<span class="detail-text">当前文档没有给出更${side === "predecessor" ? "早" : "晚"}的直接关系。</span>`;
  }

  return groups
    .map(
      ({ family, edges }) => `
        <div class="relation-group">
          <div class="relation-group-title">
            <i class="relation-family-swatch" style="background:${family.color}"></i>
            <span>${escapeHtml(family.label)}</span>
          </div>
          <div class="relation-group-list">
            ${edges
              .map((edge) => {
                const related = side === "predecessor" ? edge.targetNode : edge.sourceNode;
                const typeLabel = DATA.relationTypeLabels[edge.relation_type] || edge.relation_type;
                return `
                  <button
                    class="relation-link"
                    data-focus-node="${related.id}"
                    title="${escapeHtml(edge.statement)}"
                  >
                    <span class="relation-link-name">${escapeHtml(related.label)}</span>
                    <span class="relation-link-meta">${escapeHtml(typeLabel)} · ${escapeHtml(edge.relation_verb)}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");
}

function renderGraph() {
  computeLayout();
  const { width, height, positions, bands } = state.layout;

  dom.stage.style.height = `${height}px`;

  const bandsMarkup = bands
    .map(
      (band) => `
        <rect class="graph-band" x="${band.x}" y="${band.y}" width="${band.width}" height="${band.height}" rx="34"></rect>
        <text class="graph-band-label" x="${band.x + 22}" y="${band.y + 34}" text-anchor="start">${escapeHtml(band.label)}</text>
        <text class="graph-band-count" x="${band.x + band.width - 22}" y="${band.y + 34}" text-anchor="end">${band.count} 人</text>
      `,
    )
    .join("");

  const edgesMarkup = visualEdges
    .map((edge) => {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) return "";

      const opacity = edgeOpacity(edge);
      const active = opacity > 0.12;
      const stroke = edgeColor(edge, active);
      const widthValue = active ? 1.1 + edge.weight * 0.45 : 1;
      return `
        <path
          class="edge ${opacity < 0.05 ? "dimmed" : ""}"
          d="${edgePath(source, target)}"
          stroke="${stroke}"
          stroke-width="${widthValue}"
          opacity="${opacity}"
        ></path>
      `;
    })
    .join("");

  const selfEdgesMarkup = philosopherEdges
    .filter((edge) => edge.source === edge.target)
    .map((edge) => {
      const point = positions.get(edge.source);
      const node = philosopherById.get(edge.source);
      if (!point || !node) return "";
      const opacity = state.selectedNodeId === node.id ? 0.5 : 0.03;
      const r = node.radius + 8;
      return `
        <path
          class="edge self ${opacity < 0.05 ? "dimmed" : ""}"
          d="M ${point.x + r} ${point.y} A ${r} ${r} 0 1 1 ${point.x - r * 0.1} ${point.y - r}"
          stroke="${edgeColor(edge, state.selectedNodeId === node.id)}"
          stroke-width="1.4"
          opacity="${opacity}"
        ></path>
      `;
    })
    .join("");

  const nodesMarkup = philosophers
    .map((node) => {
      const point = positions.get(node.id);
      const opacity = nodeOpacity(node);
      const isSelected = state.selectedNodeId === node.id;
      return `
        <g data-node-group="${node.id}">
          <circle
            class="node-halo"
            cx="${point.x}"
            cy="${point.y}"
            r="${(node.radius + 5).toFixed(2)}"
            opacity="${isSelected ? 0.92 : 0.45}"
          ></circle>
          <circle
            class="node-circle ${opacity < 0.22 ? "dimmed" : ""} ${isSelected ? "selected" : ""}"
            data-node-id="${node.id}"
            cx="${point.x}"
            cy="${point.y}"
            r="${node.radius}"
            fill="${node.bucket.color}"
            opacity="${opacity}"
            stroke="rgba(22, 36, 46, 0.15)"
            stroke-width="${isSelected ? 2.8 : 1.2}"
          ></circle>
        </g>
      `;
    })
    .join("");

  const labelsMarkup = philosophers
    .filter((node) => shouldShowLabel(node))
    .map((node) => {
      const point = positions.get(node.id);
      const alignRight = point.x < width / 2;
      const x = alignRight ? point.x + node.radius + 8 : point.x - node.radius - 8;
      const anchor = alignRight ? "start" : "end";
      const labelOpacity = nodeOpacity(node);
      return `
        <text
          class="${labelClass(node)} ${labelOpacity < 0.2 ? "dimmed" : ""}"
          x="${x}"
          y="${point.y + 4}"
          text-anchor="${anchor}"
          opacity="${labelOpacity}"
        >${escapeHtml(node.label)}</text>
      `;
    })
    .join("");

  dom.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  dom.svg.innerHTML = `${bandsMarkup}${edgesMarkup}${selfEdgesMarkup}${nodesMarkup}${labelsMarkup}`;
}

function edgePath(source, target) {
  if (source.bucketIndex === target.bucketIndex) {
    const forward = source.x < target.x;
    const curve = Math.max(34, Math.abs(target.x - source.x) * 0.28);
    const c1 = source.x + (forward ? curve : -curve);
    const c2 = target.x - (forward ? curve : -curve);
    return `M ${source.x} ${source.y} C ${c1} ${source.y}, ${c2} ${target.y}, ${target.x} ${target.y}`;
  }

  const forward = source.y < target.y;
  const curve = Math.max(60, Math.abs(target.y - source.y) * 0.36);
  const c1y = source.y + (forward ? curve : -curve);
  const c2y = target.y - (forward ? curve : -curve);
  return `M ${source.x} ${source.y} C ${source.x} ${c1y}, ${target.x} ${c2y}, ${target.x} ${target.y}`;
}

function renderDetailPanel() {
  const selected = state.selectedNodeId ? philosopherById.get(state.selectedNodeId) : null;

  if (!selected) {
    dom.detailPanel.hidden = true;
    dom.detailPanel.innerHTML = "";
    return;
  }

  dom.detailPanel.hidden = false;

  const predecessors = renderRelationGroups(outgoing.get(selected.id), "predecessor");
  const successors = renderRelationGroups(incoming.get(selected.id), "successor");

  dom.detailPanel.innerHTML = `
    <div class="detail-section">
      <h2 class="detail-title">${escapeHtml(selected.label)}</h2>
      <p class="detail-subtitle">
        ${escapeHtml(selected.era)} · ${escapeHtml(selected.region)} · ${escapeHtml(ROLE_LABELS[selected.course_role])}
      </p>
    </div>

    <div class="detail-section">
      <div class="section-title">核心观点</div>
      <p class="detail-text">
        ${escapeHtml(coreIdeaFor(selected))}
      </p>
    </div>

    <div class="detail-section">
      <p class="detail-text">
        ${escapeHtml(buildBiography(selected))}
      </p>
    </div>

    <div class="detail-section">
      <div class="section-title">关键词</div>
      <div class="tag-list">
        ${(selected.tags || []).map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </div>

    <div class="detail-section">
      <div class="section-title">思想前驱</div>
      <div class="relation-stack">
        ${predecessors}
      </div>
    </div>

    <div class="detail-section">
      <div class="section-title">影响后继</div>
      <div class="relation-stack">
        ${successors}
      </div>
    </div>
  `;
}

function updateHoverCard(clientX, clientY) {
  const hovered = state.hoveredNodeId ? philosopherById.get(state.hoveredNodeId) : null;

  if (!hovered) {
    dom.hoverCard.hidden = true;
    return;
  }

  dom.hoverCard.hidden = false;
  dom.hoverCard.innerHTML = `
    <strong>${escapeHtml(hovered.label)}</strong>
    <span>${escapeHtml(hovered.era)}</span>
  `;

  const stageRect = dom.svg.getBoundingClientRect();
  const cardRect = dom.hoverCard.getBoundingClientRect();
  const x = Math.min(stageRect.width - cardRect.width - 16, Math.max(16, clientX - stageRect.left + 16));
  const y = Math.min(stageRect.height - cardRect.height - 16, Math.max(16, clientY - stageRect.top + 16));

  dom.hoverCard.style.left = `${x}px`;
  dom.hoverCard.style.top = `${y}px`;
}

function applySearch(value) {
  state.search = value.trim().toLowerCase();
  state.searchMatches = state.search
    ? philosophers
        .filter((node) => node.searchText.includes(state.search))
        .sort((a, b) => b.importanceScore - a.importanceScore)
    : [];

  renderGraph();
  renderDetailPanel();
}

function focusNode(nodeId) {
  if (!philosopherById.has(nodeId)) {
    return;
  }

  state.selectedNodeId = nodeId;
  renderGraph();
  renderDetailPanel();
}

function clearView() {
  state.selectedNodeId = null;
  state.hoveredNodeId = null;
  state.search = "";
  state.searchMatches = [];
  dom.searchInput.value = "";
  renderGraph();
  renderDetailPanel();
  updateHoverCard(0, 0);
}

function bindEvents() {
  dom.searchInput.addEventListener("input", (event) => {
    applySearch(event.target.value);
  });

  dom.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && state.searchMatches.length) {
      focusNode(state.searchMatches[0].id);
    }
  });

  dom.resetView.addEventListener("click", clearView);

  dom.svg.addEventListener("mousemove", (event) => {
    const node = event.target.closest("[data-node-id]");
    const nextHoveredId = node ? node.dataset.nodeId : null;

    if (state.hoveredNodeId !== nextHoveredId) {
      state.hoveredNodeId = nextHoveredId;
      renderGraph();
    }

    updateHoverCard(event.clientX, event.clientY);
  });

  dom.svg.addEventListener("mouseleave", () => {
    if (state.hoveredNodeId !== null) {
      state.hoveredNodeId = null;
      renderGraph();
    }
    updateHoverCard(0, 0);
  });

  dom.svg.addEventListener("click", (event) => {
    const node = event.target.closest("[data-node-id]");
    if (node) {
      focusNode(node.dataset.nodeId);
      return;
    }

    state.selectedNodeId = null;
    renderGraph();
    renderDetailPanel();
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("[data-focus-node]");
    if (target) {
      focusNode(target.dataset.focusNode);
    }
  });

  window.addEventListener("resize", () => {
    renderGraph();
  });

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      renderGraph();
    }).observe(dom.svg);
  }
}

scoreNodes();
renderMeta();
bindEvents();
renderGraph();
renderDetailPanel();
