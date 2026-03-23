const DATA = window.HDM_DATA;
const BOOK_MODULES = window.HDM_BOOK_MODULES;
const pageType = document.body?.dataset?.page || "people";
const STORAGE_KEY = "hdm_alethiometer_atlas_state_v2";
const GUIDE = window.HDM_READING_GUIDE || {
  progress: {},
  world_appearances: {},
  characters: {},
  relation_timelines: [],
  world_routes: {},
  locations: [],
  concepts: [],
  tools: [],
  themes: [],
};

const bookMap = new Map(DATA.books.map((book) => [book.id, book]));
const worldMap = new Map(DATA.worlds.map((world) => [world.id, world]));
const daemonMap = new Map(DATA.daemons.map((daemon) => [daemon.id, daemon]));
const characterMap = new Map(DATA.characters.map((character) => [character.id, character]));
const locationMap = new Map((GUIDE.locations || []).map((location) => [location.id, location]));
const conceptMap = new Map((GUIDE.concepts || []).map((concept) => [concept.id, concept]));
const toolMap = new Map((GUIDE.tools || []).map((tool) => [tool.id, tool]));
const themeMap = new Map((GUIDE.themes || []).map((theme) => [theme.id, theme]));
const bookIds = DATA.books.map((book) => book.id);
const bookOrder = new Map(bookIds.map((bookId, index) => [bookId, index]));

function withAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((part) => `${part}${part}`).join("")
    : value;
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const relationStyles = {
  family: { label: "家庭", color: "#c59b43" },
  love: { label: "情感", color: "#c96a6a" },
  ally: { label: "盟友", color: "#5e9887" },
  mentor: { label: "引导", color: "#6c8fba" },
  enemy: { label: "敌对", color: "#b54d43" },
  fate: { label: "命运", color: "#8d7e98" },
  daemon: { label: "Daemon", color: "#d2a84f" },
};

const relationOrder = ["family", "love", "ally", "mentor", "enemy", "fate", "daemon"];

const genderStyles = {
  female: { symbol: "♀", label: "Female" },
  male: { symbol: "♂", label: "Male" },
  unknown: { symbol: "◌", label: "Unknown" },
};

const ageStyles = {
  adult: { symbol: "◆", label: "Adult" },
  child: { symbol: "◇", label: "Child" },
};

const worldLayout = {
  lyra_world: { x: 176, y: 184 },
  our_world: { x: 434, y: 124 },
  cittagazze: { x: 664, y: 280 },
  mulefa_world: { x: 924, y: 186 },
  land_of_dead: { x: 682, y: 584 },
  clouded_mountain: { x: 344, y: 586 },
  gallivespian_world: { x: 930, y: 500 },
  ogunwe_world: { x: 170, y: 512 },
};

const graphCanvas = document.querySelector("#network-canvas");
const graphContext = graphCanvas ? graphCanvas.getContext("2d") : null;

const searchInput = document.querySelector("#search-input");
const entityFilter = document.querySelector("#entity-filter");
const genderFilter = document.querySelector("#gender-filter");
const ageFilter = document.querySelector("#age-filter");
const factionFilter = document.querySelector("#faction-filter");
const worldFilter = document.querySelector("#world-filter");
const modulePicker = document.querySelector("#module-picker");
const resetFiltersButton = document.querySelector("#reset-filters");
const randomCharacterButton = document.querySelector("#random-character");
const clearWorldFocusButton = document.querySelector("#clear-world-focus");

const heroStats = document.querySelector("#hero-stats");
const bookLegend = document.querySelector("#book-legend");
const relationLegend = document.querySelector("#relation-legend");
const relationFilters = document.querySelector("#relation-filters");
const characterGrid = document.querySelector("#character-grid");
const catalogCount = document.querySelector("#catalog-count");
const detailContent = document.querySelector("#detail-content");
const worldMapElement = document.querySelector("#world-map");
const worldPanel = document.querySelector("#world-panel");
const readingSummary = document.querySelector("#reading-summary");
const aliasIndex = document.querySelector("#alias-index");
const locationGrid = document.querySelector("#location-grid");
const locationCount = document.querySelector("#location-count");
const conceptGrid = document.querySelector("#concept-grid");
const conceptCount = document.querySelector("#concept-count");
const toolGrid = document.querySelector("#tool-grid");
const toolCount = document.querySelector("#tool-count");
const toolLineagePanel = document.querySelector("#tool-lineage-panel");
const themeGrid = document.querySelector("#theme-grid");
const themeCount = document.querySelector("#theme-count");

function defaultSelectedForPage() {
  if (pageType === "places" && GUIDE.locations?.length) {
    return { kind: "location", id: GUIDE.locations[0].id };
  }
  if (pageType === "concepts" && GUIDE.concepts?.length) {
    return { kind: "concept", id: GUIDE.concepts[0].id };
  }
  if (pageType === "tools" && GUIDE.tools?.length) {
    return { kind: "tool", id: GUIDE.tools[0].id };
  }
  if (pageType === "worlds" && DATA.worlds?.length) {
    return { kind: "world", id: DATA.worlds[0].id };
  }
  if (pageType === "themes" && GUIDE.themes?.length) {
    return { kind: "theme", id: GUIDE.themes[0].id };
  }
  return { kind: "character", id: "lyra" };
}

function getPageFallbackSelection(activeWorldIds, visibleCharacters) {
  const visibleLocations = getLocationsForSelectedBooks();
  const visibleConcepts = getConceptsForSelectedBooks();
  const visibleTools = getToolsForSelectedBooks();
  const visibleThemes = getThemesForSelectedBooks();
  const firstWorldId = [...activeWorldIds][0];

  if (pageType === "places" && visibleLocations.length) {
    return { kind: "location", id: visibleLocations[0].id };
  }

  if (pageType === "concepts" && visibleConcepts.length) {
    return { kind: "concept", id: visibleConcepts[0].id };
  }

  if (pageType === "tools" && visibleTools.length) {
    return { kind: "tool", id: visibleTools[0].id };
  }

  if (pageType === "worlds" && firstWorldId) {
    return { kind: "world", id: firstWorldId };
  }

  if (pageType === "themes" && visibleThemes.length) {
    return { kind: "theme", id: visibleThemes[0].id };
  }

  if (visibleCharacters.length) {
    return { kind: "character", id: visibleCharacters[0].id };
  }

  if (visibleLocations.length) {
    return { kind: "location", id: visibleLocations[0].id };
  }

  if (visibleConcepts.length) {
    return { kind: "concept", id: visibleConcepts[0].id };
  }

  if (visibleTools.length) {
    return { kind: "tool", id: visibleTools[0].id };
  }

  if (visibleThemes.length) {
    return { kind: "theme", id: visibleThemes[0].id };
  }

  if (firstWorldId) {
    return { kind: "world", id: firstWorldId };
  }

  return null;
}

function setFallbackSelected(activeWorldIds, visibleCharacters) {
  const fallback = getPageFallbackSelection(activeWorldIds, visibleCharacters);
  if (fallback) {
    state.selected = fallback;
  }
}

const state = {
  search: "",
  entityType: "all",
  gender: "all",
  ageGroup: "all",
  faction: "all",
  world: "all",
  selectedBooks: new Set(bookIds),
  focusedWorldId: null,
  relationTypes: new Set(relationOrder),
  selected: defaultSelectedForPage(),
};

let graphState = {
  nodes: [],
  links: [],
  byId: new Map(),
  hoveredNodeId: null,
  draggedNodeId: null,
  pointerOffset: { x: 0, y: 0 },
  width: 1200,
  height: 860,
  dpr: window.devicePixelRatio || 1,
  animationHandle: null,
};

function loadPersistedState() {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.selectedBooks) && saved.selectedBooks.length) {
      state.selectedBooks = new Set(saved.selectedBooks.filter((bookId) => bookMap.has(bookId)));
    }
  } catch {
    // Ignore storage failures and fall back to defaults.
  }
}

function savePersistedState() {
  try {
    window.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedBooks: [...state.selectedBooks],
      })
    );
  } catch {
    // Ignore storage failures.
  }
}

function getWorld(worldId) {
  return worldMap.get(worldId);
}

function getWorldName(worldId) {
  return getWorld(worldId)?.name || worldId;
}

function getEntityName(entity) {
  return entity?.name || entity?.label || "";
}

function getBook(bookId) {
  return bookMap.get(bookId);
}

function getBookTitle(bookId) {
  return getBook(bookId)?.title || bookId;
}

function getActiveBookIds() {
  return bookIds.filter((bookId) => state.selectedBooks.has(bookId));
}

function getActiveWorldIds() {
  const worldIds = new Set();
  getActiveBookIds().forEach((bookId) => {
    const module = BOOK_MODULES[bookId];
    if (!module) {
      return;
    }
    module.world_ids.forEach((worldId) => worldIds.add(worldId));
  });
  return worldIds;
}

function getActiveConnectionIds() {
  const activeWorldIds = getActiveWorldIds();
  const connectionIds = new Set();
  getActiveBookIds().forEach((bookId) => {
    const module = BOOK_MODULES[bookId];
    if (!module) {
      return;
    }
    module.connection_ids.forEach((connectionId) => {
      const [source, target] = connectionId.split("->");
      if (activeWorldIds.has(source) && activeWorldIds.has(target)) {
        connectionIds.add(connectionId);
      }
    });
  });
  return connectionIds;
}

function getCharactersForActiveBooks() {
  return DATA.characters.filter((character) => character.books.some((bookId) => state.selectedBooks.has(bookId)));
}

function getCharacterBooksInSelection(character) {
  return character.books.filter((bookId) => state.selectedBooks.has(bookId));
}

function getCharacterWorldsInSelection(character) {
  const activeWorldIds = getActiveWorldIds();
  return character.entered_worlds.filter((worldId) => activeWorldIds.has(worldId));
}

function characterTouchesWorldInSelection(character, worldId) {
  return (
    character.origin_world === worldId ||
    getCharacterWorldsInSelection(character).includes(worldId)
  );
}

function syncStateToModules() {
  const activeBookIds = getActiveBookIds();
  if (!activeBookIds.length) {
    state.selectedBooks = new Set([bookIds[0]]);
  }

  const activeWorldIds = getActiveWorldIds();
  const activeCharacters = getCharactersForActiveBooks();
  const activeEntityTypes = new Set(activeCharacters.map((character) => character.entity_type));
  const activeGenders = new Set(activeCharacters.map((character) => character.gender));
  const activeAgeGroups = new Set(activeCharacters.map((character) => getAgeGroup(character)));
  const activeFactions = new Set(activeCharacters.map((character) => character.faction));

  if (state.entityType !== "all" && !activeEntityTypes.has(state.entityType)) {
    state.entityType = "all";
  }
  if (state.gender !== "all" && !activeGenders.has(state.gender)) {
    state.gender = "all";
  }
  if (state.ageGroup !== "all" && !activeAgeGroups.has(state.ageGroup)) {
    state.ageGroup = "all";
  }
  if (state.faction !== "all" && !activeFactions.has(state.faction)) {
    state.faction = "all";
  }
  if (state.world !== "all" && !activeWorldIds.has(state.world)) {
    state.world = "all";
  }
  if (state.focusedWorldId && !activeWorldIds.has(state.focusedWorldId)) {
    state.focusedWorldId = null;
  }

  const visibleCharacters = getVisibleCharacters();
  const visibleIds = new Set(visibleCharacters.map((character) => character.id));

  if (state.selected.kind === "character" && !visibleIds.has(state.selected.id)) {
    setFallbackSelected(activeWorldIds, visibleCharacters);
  }

  if (state.selected.kind === "daemon") {
    const daemon = daemonMap.get(state.selected.id);
    const guardianVisible = daemon && visibleIds.has(daemon.guardian);
    if (!guardianVisible) {
      setFallbackSelected(activeWorldIds, visibleCharacters);
    }
  }

  if (state.selected.kind === "world" && !activeWorldIds.has(state.selected.id)) {
    setFallbackSelected(activeWorldIds, visibleCharacters);
  }

  if (state.selected.kind === "location" && !getLocationsForSelectedBooks().some((location) => location.id === state.selected.id)) {
    setFallbackSelected(activeWorldIds, visibleCharacters);
  }

  if (state.selected.kind === "concept" && !getConceptsForSelectedBooks().some((concept) => concept.id === state.selected.id)) {
    setFallbackSelected(activeWorldIds, visibleCharacters);
  }

  if (state.selected.kind === "tool" && !getToolsForSelectedBooks().some((tool) => tool.id === state.selected.id)) {
    setFallbackSelected(activeWorldIds, visibleCharacters);
  }

  if (state.selected.kind === "theme" && !getThemesForSelectedBooks().some((theme) => theme.id === state.selected.id)) {
    setFallbackSelected(activeWorldIds, visibleCharacters);
  }
}

function getShortName(name) {
  return name.split(" / ")[0].trim();
}

function appearanceRank(appearance) {
  if (!appearance?.book) {
    return Number.POSITIVE_INFINITY;
  }
  const bookRank = bookOrder.get(appearance.book) ?? Number.POSITIVE_INFINITY;
  const chapterRank = appearance.chapter == null ? 0 : appearance.chapter;
  return bookRank * 1000 + chapterRank;
}

function formatAppearance(appearance) {
  if (!appearance?.book) {
    return "未补充";
  }
  const bookTitle = getBookTitle(appearance.book);
  const chapterLabel = appearance.chapter ? `第 ${appearance.chapter} 章` : "卷册内首次现身";
  const location = appearance.location_id ? locationMap.get(appearance.location_id)?.name : "";
  return [bookTitle, chapterLabel, location].filter(Boolean).join(" · ");
}

function isAppearanceInSelectedBooks(appearance) {
  if (!appearance?.book) {
    return true;
  }
  return state.selectedBooks.has(appearance.book);
}

function isAppearanceRevealed(appearance) {
  return true;
}

function makeKeywordChips(keywords = []) {
  if (!keywords.length) {
    return '<span class="chip">暂无关键词</span>';
  }
  return keywords.map((keyword) => `<span class="chip keyword-chip">${keyword}</span>`).join("");
}

function makeSelectChip(kind, id, label) {
  if (!id || !label) {
    return "";
  }
  return `<button type="button" class="chip select-chip" data-select-kind="${kind}" data-select-id="${id}">${label}</button>`;
}

function getToolIllustrationMarkup(toolId) {
  if (toolId === "alethiometer") {
    return '<img src="./pic/Alethiometer.webp" alt="Alethiometer reference image" class="tool-illustration-image" />';
  }

  if (toolId === "subtle_knife") {
    return `
      <svg viewBox="0 0 420 280" aria-hidden="true">
        <defs>
          <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f9fbff" />
            <stop offset="55%" stop-color="#bdc7d4" />
            <stop offset="100%" stop-color="#73879f" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="404" height="264" rx="28" fill="rgba(247,249,253,0.82)" stroke="rgba(111,138,165,0.26)" />
        <path d="M82 196 C138 164, 190 132, 258 84 C280 68, 323 66, 344 86 C318 106, 289 124, 256 149 C210 182, 154 207, 98 224 Z" fill="url(#blade)" stroke="#5b718b" stroke-width="4" />
        <path d="M94 212 C136 192, 184 164, 241 125" stroke="rgba(255,255,255,0.9)" stroke-width="3" fill="none" />
        <rect x="52" y="174" width="58" height="22" rx="11" fill="#6f4b2d" stroke="#d0a85a" stroke-width="3" />
        <path d="M46 176 C40 194, 40 207, 46 226 C64 224, 82 220, 98 212 C96 196, 92 183, 86 170 Z" fill="#3e2a19" stroke="#8e6330" stroke-width="3" />
        <path d="M288 54 L330 32" stroke="rgba(111,138,165,0.7)" stroke-width="2.5" stroke-dasharray="8 8" />
        <path d="M304 94 L370 58" stroke="rgba(111,138,165,0.35)" stroke-width="2.5" stroke-dasharray="8 8" />
        <text x="210" y="44" text-anchor="middle" class="tool-figure__label">Subtle Knife</text>
        <text x="210" y="246" text-anchor="middle" class="tool-figure__caption">cuts windows between worlds</text>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 420 280" aria-hidden="true">
      <defs>
        <linearGradient id="amberBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7d080" />
          <stop offset="52%" stop-color="#d8973d" />
          <stop offset="100%" stop-color="#7f5b2b" />
        </linearGradient>
        <radialGradient id="amberLens" cx="48%" cy="44%" r="58%">
          <stop offset="0%" stop-color="#fff6cf" />
          <stop offset="65%" stop-color="#f0b24f" />
          <stop offset="100%" stop-color="#8b5c22" />
        </radialGradient>
      </defs>
      <rect x="8" y="8" width="404" height="264" rx="28" fill="rgba(255,248,238,0.82)" stroke="rgba(180,135,56,0.2)" />
      <path d="M84 174 C144 150, 201 133, 274 110 C298 102, 327 118, 333 143 C271 166, 208 187, 124 216 C111 203, 101 189, 84 174 Z" fill="url(#amberBody)" stroke="#7b5625" stroke-width="4" />
      <ellipse cx="308" cy="138" rx="38" ry="32" fill="url(#amberLens)" stroke="#7b5625" stroke-width="5" />
      <ellipse cx="308" cy="138" rx="21" ry="17" fill="rgba(255,248,214,0.7)" />
      ${Array.from({ length: 9 }, (_, index) => {
        const x = 130 + index * 23;
        const y = 92 + ((index * 19) % 84);
        const r = index % 3 === 0 ? 5 : 3.5;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(222,174,77,0.68)" />`;
      }).join("")}
      <text x="210" y="44" text-anchor="middle" class="tool-figure__label">Amber Spyglass</text>
      <text x="210" y="246" text-anchor="middle" class="tool-figure__caption">learned sight of Dust</text>
    </svg>
  `;
}

function getCharacterGuide(character) {
  const guide = GUIDE.characters?.[character.id] || {};
  const splitAliases = character.name.includes(" / ")
    ? character.name
        .split(" / ")
        .slice(1)
        .map((alias) => alias.trim())
        .filter(Boolean)
    : [];
  const aliases = [...new Set([...(guide.aliases || []), ...splitAliases])];
  return {
    aliases,
    firstAppearance: guide.first_appearance || { book: character.books[0] },
    keywords: guide.keywords || [],
    conceptIds: guide.concept_ids || [],
    themeIds: guide.theme_ids || [],
    locationIds: guide.location_ids || [],
  };
}

function getWorldAppearance(worldId) {
  return GUIDE.world_appearances?.[worldId] || { book: worldId === "lyra_world" ? "nl" : bookIds[0] };
}

function getCharacterFirstAppearance(character) {
  return getCharacterGuide(character).firstAppearance;
}

function getBookIdList(items = []) {
  return [...new Set(items.flatMap((item) => item.books || []))];
}

function getLocationsForSelectedBooks() {
  return (GUIDE.locations || []).filter((location) =>
    location.books.some((bookId) => state.selectedBooks.has(bookId))
  );
}

function getConceptsForSelectedBooks() {
  return (GUIDE.concepts || []).filter((concept) =>
    concept.books.some((bookId) => state.selectedBooks.has(bookId))
  );
}

function getToolsForSelectedBooks() {
  return (GUIDE.tools || []).filter((tool) =>
    tool.books.some((bookId) => state.selectedBooks.has(bookId))
  );
}

function getThemesForSelectedBooks() {
  return (GUIDE.themes || []).filter((theme) =>
    theme.books.some((bookId) => state.selectedBooks.has(bookId))
  );
}

function getRelationTimelinesForCharacter(characterId) {
  return (GUIDE.relation_timelines || [])
    .filter((timeline) => timeline.characters.includes(characterId))
    .map((timeline) => ({
      ...timeline,
      stages: timeline.stages.filter((stage) => isAppearanceInSelectedBooks(stage)),
    }))
    .filter((timeline) => timeline.stages.length)
    .sort((a, b) => appearanceRank(a.stages[0]) - appearanceRank(b.stages[0]));
}

function getWorldRouteForCharacter(characterId) {
  return (GUIDE.world_routes?.[characterId] || [])
    .filter((step) => isAppearanceInSelectedBooks(step))
    .sort((a, b) => appearanceRank(a) - appearanceRank(b));
}

function getLinkedLocations(ids = []) {
  return ids.map((id) => locationMap.get(id)).filter(Boolean);
}

function getLinkedConcepts(ids = []) {
  return ids.map((id) => conceptMap.get(id)).filter(Boolean);
}

function getLinkedTools(ids = []) {
  return ids.map((id) => toolMap.get(id)).filter(Boolean);
}

function getLinkedThemes(ids = []) {
  return ids.map((id) => themeMap.get(id)).filter(Boolean);
}

function renderTimeline(entries, formatter) {
  if (!entries.length) {
    return '<div class="timeline-empty">当前卷册选择下还没有可显示的条目。</div>';
  }
  return `<div class="timeline">${entries.map((entry) => formatter(entry)).join("")}</div>`;
}

function titleCaseEntity(entityType) {
  const labels = {
    human: "人类",
    witch: "女巫",
    angel: "天使",
    gallivespian: "Gallivespian",
    mulefa: "Mulefa",
    panserbjorne: "Panserbjorne",
    harpy: "Harpy",
  };
  return labels[entityType] || entityType;
}

function relationLabel(type) {
  return relationStyles[type]?.label || type;
}

function isFilterActive(filterType, value) {
  if (filterType === "entity") {
    return state.entityType === value;
  }
  if (filterType === "gender") {
    return state.gender === value;
  }
  if (filterType === "age") {
    return state.ageGroup === value;
  }
  if (filterType === "faction") {
    return state.faction === value;
  }
  if (filterType === "origin-world") {
    return state.world === value;
  }
  if (filterType === "world") {
    return state.focusedWorldId === value || state.world === value;
  }
  if (filterType === "book") {
    return state.selectedBooks.size === 1 && state.selectedBooks.has(value);
  }
  return false;
}

function makeInteractiveChip({ label, filterType, value, style = "" }) {
  const activeClass = isFilterActive(filterType, value) ? " is-active" : "";
  const styleAttr = style ? ` style="${style}"` : "";
  return `
    <span class="chip filter-chip${activeClass}" data-filter-type="${filterType}" data-filter-value="${value}"${styleAttr}>
      ${label}
    </span>
  `;
}

function factionColor(faction) {
  const palette = [
    "#c6a25f",
    "#79a398",
    "#78a1c5",
    "#9f7ab8",
    "#bf6e58",
    "#8fb08a",
    "#d2c69c",
    "#d7868f",
  ];
  const factions = [...new Set(DATA.characters.map((character) => character.faction))];
  const index = Math.max(0, factions.indexOf(faction));
  return palette[index % palette.length];
}

function getGenderMeta(character) {
  return genderStyles[character.gender] || genderStyles.unknown;
}

function getAgeMeta(character) {
  return character.is_adult ? ageStyles.adult : ageStyles.child;
}

function getAgeGroup(character) {
  return character.is_adult ? "adult" : "child";
}

function getDaemon(character) {
  return character.daemon_id ? daemonMap.get(character.daemon_id) : null;
}

function getDaemonName(character) {
  const daemon = getDaemon(character);
  return daemon ? daemon.name : character.daemon;
}

function getDaemonFormText(character) {
  const daemon = getDaemon(character);
  if (daemon) {
    return daemon.display_form;
  }
  if (!character.daemon || character.daemon === "None") {
    return "No visible daemon in the narrative.";
  }
  return character.daemon;
}

function makeBookChips(bookIds) {
  return bookIds
    .map((bookId) => {
      const book = getBook(bookId);
      if (!book) {
        return "";
      }
      return makeInteractiveChip({
        label: `<span class="book-swatch"></span>${book.title}`,
        filterType: "book",
        value: book.id,
        style: `--book-color:${book.color}; --book-soft:${withAlpha(book.color, 0.12)}; --book-line:${withAlpha(book.color, 0.34)}`,
      }).replace('class="chip filter-chip', 'class="book-chip chip filter-chip');
    })
    .join("");
}

function makeWorldChip(worldId) {
  const world = getWorld(worldId);
  if (!world) {
    return "";
  }
  return makeInteractiveChip({
    label: `<span class="world-chip__icon">${world.icon}</span>${world.name}`,
    filterType: "world",
    value: world.id,
    style: `--world-accent:${world.accent}; --world-soft:${withAlpha(world.accent, 0.12)}; --world-line:${withAlpha(world.accent, 0.34)}`,
  }).replace('class="chip filter-chip', 'class="chip world-chip filter-chip');
}

function makeOriginWorldChip(worldId) {
  const world = getWorld(worldId);
  if (!world) {
    return "";
  }
  return makeInteractiveChip({
    label: `<span class="world-chip__icon">${world.icon}</span>${world.name}`,
    filterType: "origin-world",
    value: world.id,
    style: `--world-accent:${world.accent}; --world-soft:${withAlpha(world.accent, 0.12)}; --world-line:${withAlpha(world.accent, 0.34)}`,
  }).replace('class="chip filter-chip', 'class="chip world-chip filter-chip');
}

function makeWorldChips(worldIds, emptyLabel) {
  if (!worldIds.length) {
    return `<span class="chip">${emptyLabel}</span>`;
  }
  return worldIds.map((worldId) => makeWorldChip(worldId)).join("");
}

function makeSigilChips(character) {
  const gender = getGenderMeta(character);
  const age = getAgeMeta(character);
  return `
    ${makeInteractiveChip({
      label: `<span class="sigil">${gender.symbol}</span>${gender.label}`,
      filterType: "gender",
      value: character.gender,
    }).replace('class="chip filter-chip', 'class="sigil-chip chip filter-chip')}
    ${makeInteractiveChip({
      label: `<span class="sigil">${age.symbol}</span>${age.label}`,
      filterType: "age",
      value: getAgeGroup(character),
    }).replace('class="chip filter-chip', 'class="sigil-chip chip filter-chip')}
  `;
}

function getRelatedCharacters(characterId) {
  const activeCharacterIds = new Set(getCharactersForActiveBooks().map((character) => character.id));
  const deduped = new Map();

  DATA.relationships
    .filter((edge) => edge.source === characterId || edge.target === characterId)
    .filter((edge) => activeCharacterIds.has(edge.source) && activeCharacterIds.has(edge.target))
    .forEach((edge) => {
      const otherId = edge.source === characterId ? edge.target : edge.source;
      const key = `${edge.type}|${otherId}`;
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, {
          type: edge.type,
          other: characterMap.get(otherId) || daemonMap.get(otherId),
          notes: edge.note ? [edge.note] : [],
        });
        return;
      }
      if (edge.note && !existing.notes.includes(edge.note)) {
        existing.notes.push(edge.note);
      }
    });

  return [...deduped.values()].map((entry) => ({
    type: entry.type,
    other: entry.other,
    note: entry.notes.join(" · "),
  }));
}

function getActiveRelationships() {
  const activeCharacterIds = new Set(getCharactersForActiveBooks().map((character) => character.id));
  const deduped = new Map();

  DATA.relationships
    .filter((edge) => activeCharacterIds.has(edge.source) && activeCharacterIds.has(edge.target))
    .forEach((edge) => {
      const pair = [edge.source, edge.target].sort();
      const key = `${edge.type}|${pair[0]}|${pair[1]}`;
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, {
          source: pair[0],
          target: pair[1],
          type: edge.type,
          notes: edge.note ? [edge.note] : [],
        });
        return;
      }
      if (edge.note && !existing.notes.includes(edge.note)) {
        existing.notes.push(edge.note);
      }
    });

  return [...deduped.values()].map((entry) => ({
    source: entry.source,
    target: entry.target,
    type: entry.type,
    note: entry.notes.join(" · "),
  }));
}

function getSelectedEntity() {
  const { kind, id } = state.selected;
  if (kind === "character") {
    return { kind, value: characterMap.get(id) };
  }
  if (kind === "daemon") {
    return { kind, value: daemonMap.get(id) };
  }
  if (kind === "world") {
    return { kind, value: worldMap.get(id) };
  }
  if (kind === "location") {
    return { kind, value: locationMap.get(id) };
  }
  if (kind === "concept") {
    return { kind, value: conceptMap.get(id) };
  }
  if (kind === "tool") {
    return { kind, value: toolMap.get(id) };
  }
  if (kind === "theme") {
    return { kind, value: themeMap.get(id) };
  }
  return null;
}

function getVisibleCharacters() {
  const term = state.search.trim().toLowerCase();
  const activeWorldIds = getActiveWorldIds();

  return getCharactersForActiveBooks().filter((character) => {
    const guide = getCharacterGuide(character);
    if (state.entityType !== "all" && character.entity_type !== state.entityType) {
      return false;
    }

    if (state.gender !== "all" && character.gender !== state.gender) {
      return false;
    }

    if (state.ageGroup !== "all" && getAgeGroup(character) !== state.ageGroup) {
      return false;
    }

    if (state.faction !== "all" && character.faction !== state.faction) {
      return false;
    }

    if (state.world !== "all" && character.origin_world !== state.world) {
      return false;
    }

    if (state.focusedWorldId) {
      if (!characterTouchesWorldInSelection(character, state.focusedWorldId)) {
        return false;
      }
    }

    if (!activeWorldIds.has(character.origin_world)) {
      return false;
    }

    if (!term) {
      return true;
    }

    const haystack = [
      character.name,
      character.identity,
      character.summary,
      character.faction,
      getDaemonName(character),
      getDaemonFormText(character),
      getWorldName(character.origin_world),
      ...guide.aliases,
      ...guide.keywords,
      ...getCharacterWorldsInSelection(character).map((worldId) => getWorldName(worldId)),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}

function renderHeroStats() {
  if (!heroStats) {
    return;
  }
  const activeCharacters = getCharactersForActiveBooks();
  const visibleDaemons = activeCharacters.filter((character) => character.daemon_id).length;
  const activeWorldIds = getActiveWorldIds();
  const crossWorldTravelers = activeCharacters.filter(
    (character) => getCharacterWorldsInSelection(character).length > 0
  ).length;
  const locationTotal = getLocationsForSelectedBooks().length;
  const conceptTotal = getConceptsForSelectedBooks().length;
  const toolTotal = getToolsForSelectedBooks().length;
  const themeTotal = getThemesForSelectedBooks().length;
  const pageStats = {
    people: [
      { label: "当前角色", value: activeCharacters.length },
      { label: "当前 Daemon", value: visibleDaemons },
      { label: "当前世界", value: activeWorldIds.size },
      { label: "地点条目", value: locationTotal || 0 },
      { label: "跨界旅行者", value: crossWorldTravelers },
    ],
    places: [
      { label: "地点条目", value: locationTotal || 0 },
      { label: "覆盖世界", value: [...new Set(getLocationsForSelectedBooks().map((location) => location.world_id))].length },
      { label: "关联角色", value: activeCharacters.length },
      { label: "概念条目", value: conceptTotal },
      { label: "主题条目", value: themeTotal },
    ],
    concepts: [
      { label: "概念条目", value: conceptTotal },
      { label: "相关工具", value: toolTotal },
      { label: "地点条目", value: locationTotal || 0 },
      { label: "关联角色", value: activeCharacters.length },
      { label: "主题条目", value: themeTotal },
    ],
    tools: [
      { label: "工具条目", value: toolTotal },
      { label: "关联角色", value: activeCharacters.length },
      { label: "覆盖世界", value: activeWorldIds.size },
      { label: "地点条目", value: locationTotal || 0 },
      { label: "主题条目", value: themeTotal },
    ],
    worlds: [
      { label: "当前世界", value: activeWorldIds.size },
      { label: "世界连线", value: getActiveConnectionIds().size },
      { label: "跨界旅行者", value: crossWorldTravelers },
      { label: "地点条目", value: locationTotal || 0 },
      { label: "工具条目", value: toolTotal },
    ],
    themes: [
      { label: "主题条目", value: themeTotal },
      { label: "概念条目", value: conceptTotal },
      { label: "工具条目", value: toolTotal },
      { label: "地点条目", value: locationTotal || 0 },
      { label: "关联角色", value: activeCharacters.length },
    ],
  };
  heroStats.innerHTML = (pageStats[pageType] || pageStats.people)
    .map(
      (item, index) => `
        <div class="stat-card" style="animation-delay:${index * 60}ms">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </div>
      `
    )
    .join("");
}

function renderModulePicker() {
  if (!modulePicker) {
    return;
  }
  modulePicker.innerHTML = DATA.books
    .map((book) => {
      const checked = state.selectedBooks.has(book.id) ? "checked" : "";
      const characterCount = DATA.characters.filter((character) => character.books.includes(book.id)).length;
      return `
        <label class="module-pill" style="--module-color:${book.color}; --module-soft:${withAlpha(book.color, 0.12)}; --module-line:${withAlpha(book.color, 0.34)}">
          <input type="checkbox" data-book-module="${book.id}" ${checked} />
          <span class="module-pill__swatch"></span>
          <span class="module-pill__body">
            <strong>${book.title}</strong>
            <small>${characterCount} characters</small>
          </span>
        </label>
      `;
    })
    .join("");
}

function renderReadingProgressControls() {
  if (!readingSummary) {
    return;
  }
  const activeBookIds = getActiveBookIds();
  const bookLabels = activeBookIds.map((bookId) => getBookTitle(bookId));
  readingSummary.innerHTML = `
    <strong>当前档案范围</strong>
    <p>正在查看 ${bookLabels.join(" / ")} 的完整条目。页面不再使用防剧透模式，所有已勾选卷册的角色、地点、概念、工具、世界与主题都会直接显示。</p>
    <p>当前共收纳角色 ${getCharactersForActiveBooks().length} 位、地点 ${getLocationsForSelectedBooks().length} 处、概念 ${getConceptsForSelectedBooks().length} 条、工具 ${getToolsForSelectedBooks().length} 件、主题 ${getThemesForSelectedBooks().length} 个。</p>
  `;
}

function renderAliasIndex() {
  if (!aliasIndex) {
    return;
  }
  const aliasCharacters = getCharactersForActiveBooks()
    .map((character) => ({ character, guide: getCharacterGuide(character) }))
    .filter((entry) => entry.guide.aliases.length || entry.guide.firstAppearance)
    .sort((a, b) => appearanceRank(a.guide.firstAppearance) - appearanceRank(b.guide.firstAppearance));

  aliasIndex.innerHTML = aliasCharacters
    .slice(0, 12)
    .map(
      ({ character, guide }) => `
        <article class="guide-card guide-card--compact" data-select-kind="character" data-select-id="${character.id}">
          <span class="guide-card__eyebrow">First Appearance</span>
          <h3>${getShortName(character.name)}</h3>
          <p>${formatAppearance(guide.firstAppearance)}</p>
          <div class="guide-chip-row">
            ${
              guide.aliases.length
                ? guide.aliases.map((alias) => `<span class="chip keyword-chip">${alias}</span>`).join("")
                : '<span class="chip">无别名</span>'
            }
          </div>
        </article>
      `
    )
    .join("");
}

function renderLocationGrid() {
  if (!locationGrid || !locationCount) {
    return;
  }
  const visibleLocations = getLocationsForSelectedBooks().filter((location) => {
    if (state.focusedWorldId && location.world_id !== state.focusedWorldId) {
      return false;
    }
    return true;
  });
  locationCount.textContent = `当前可查看 ${visibleLocations.length} 处地点`;
  locationGrid.innerHTML = visibleLocations.length
    ? visibleLocations
        .map(
          (location) => `
            <article class="guide-card" data-select-kind="location" data-select-id="${location.id}">
              <span class="guide-card__eyebrow">${getWorldName(location.world_id)}</span>
              <h3>${location.name}</h3>
              <p>${location.summary}</p>
              <div class="guide-chip-row">${makeKeywordChips(location.keywords)}</div>
              <div class="guide-meta-line">${formatAppearance(location.first_appearance)}</div>
            </article>
          `
        )
        .join("")
    : '<div class="card-empty">当前卷册选择下没有更多地点条目。</div>';
}

function renderConceptGrid() {
  if (!conceptGrid || !conceptCount) {
    return;
  }
  const visibleConcepts = getConceptsForSelectedBooks();
  conceptCount.textContent = `当前可查看 ${visibleConcepts.length} 条概念`;
  conceptGrid.innerHTML = visibleConcepts.length
    ? visibleConcepts
        .map(
          (concept) => `
            <article class="guide-card" data-select-kind="concept" data-select-id="${concept.id}">
              <span class="guide-card__eyebrow">Glossary</span>
              <h3>${concept.name}</h3>
              <p>${concept.summary}</p>
              <div class="guide-chip-row">${makeKeywordChips(concept.keywords)}</div>
              <div class="guide-meta-line">${formatAppearance(concept.first_appearance)}</div>
            </article>
          `
        )
        .join("")
    : '<div class="card-empty">当前卷册选择下没有更多概念条目。</div>';
}

function renderToolGrid() {
  if (!toolGrid || !toolCount) {
    return;
  }
  const visibleTools = getToolsForSelectedBooks();
  toolCount.textContent = `当前可查看 ${visibleTools.length} 件工具`;
  toolGrid.innerHTML = visibleTools.length
    ? visibleTools
        .map(
          (tool) => `
            <article class="guide-card tool-card ${state.selected.kind === "tool" && state.selected.id === tool.id ? "is-selected" : ""}" data-select-kind="tool" data-select-id="${tool.id}">
              <div class="tool-visual tool-visual--card">${getToolIllustrationMarkup(tool.id)}</div>
              <span class="guide-card__eyebrow">Instrument</span>
              <h3>${tool.name}</h3>
              <p>${tool.summary}</p>
              <div class="guide-chip-row">${makeKeywordChips(tool.keywords)}</div>
              <div class="guide-meta-line">${formatAppearance(tool.first_appearance)}</div>
            </article>
          `
        )
        .join("")
    : '<div class="card-empty">当前卷册选择下没有更多工具条目。</div>';
}

function renderThemeGrid() {
  if (!themeGrid || !themeCount) {
    return;
  }
  const visibleThemes = getThemesForSelectedBooks();
  themeCount.textContent = `当前可查看 ${visibleThemes.length} 个主题`;
  themeGrid.innerHTML = visibleThemes.length
    ? visibleThemes
        .map(
          (theme) => `
            <article class="guide-card" data-select-kind="theme" data-select-id="${theme.id}">
              <span class="guide-card__eyebrow">Theme</span>
              <h3>${theme.name}</h3>
              <p>${theme.summary}</p>
              <div class="guide-chip-row">${makeKeywordChips(theme.keywords)}</div>
              <div class="guide-meta-line">${formatAppearance(theme.first_appearance)}</div>
            </article>
          `
        )
        .join("")
    : '<div class="card-empty">当前卷册选择下没有更多主题条目。</div>';
}

function renderBookLegend() {
  if (!bookLegend) {
    return;
  }
  bookLegend.innerHTML = DATA.books
    .map(
      (book) => `
        <span class="book-chip chip" style="--book-color:${book.color}; --book-soft:${withAlpha(book.color, 0.12)}; --book-line:${withAlpha(book.color, 0.34)}">
          <span class="book-swatch"></span>
          ${book.title}
        </span>
      `
    )
    .join("");
}

function renderRelationLegend() {
  if (!relationLegend) {
    return;
  }
  relationLegend.innerHTML = relationOrder
    .map(
      (type) => `
        <span class="legend-pill">
          <span class="legend-swatch" style="background:${relationStyles[type].color}"></span>
          ${relationStyles[type].label}
        </span>
      `
    )
    .join("");
}

function renderFilterOptions() {
  if (!entityFilter || !genderFilter || !ageFilter || !factionFilter || !worldFilter) {
    return;
  }
  const moduleCharacters = getCharactersForActiveBooks();
  const activeWorldIds = getActiveWorldIds();
  const entityTypes = [...new Set(moduleCharacters.map((character) => character.entity_type))].sort((a, b) =>
    a.localeCompare(b, "en")
  );
  const genders = [...new Set(moduleCharacters.map((character) => character.gender))].sort((a, b) =>
    a.localeCompare(b, "en")
  );
  const ageGroups = ["adult", "child"].filter((ageGroup) =>
    moduleCharacters.some((character) => getAgeGroup(character) === ageGroup)
  );
  const factions = [...new Set(moduleCharacters.map((character) => character.faction))].sort((a, b) =>
    a.localeCompare(b, "en")
  );

  entityFilter.innerHTML = ['<option value="all">全部角色类型</option>']
    .concat(entityTypes.map((entityType) => `<option value="${entityType}">${titleCaseEntity(entityType)}</option>`))
    .join("");
  if (state.entityType !== "all" && !entityTypes.includes(state.entityType)) {
    state.entityType = "all";
  }
  entityFilter.value = state.entityType;

  genderFilter.innerHTML = ['<option value="all">全部性别</option>']
    .concat(genders.map((gender) => `<option value="${gender}">${genderStyles[gender]?.label || gender}</option>`))
    .join("");
  if (state.gender !== "all" && !genders.includes(state.gender)) {
    state.gender = "all";
  }
  genderFilter.value = state.gender;

  ageFilter.innerHTML = ['<option value="all">全部年龄阶段</option>']
    .concat(ageGroups.map((ageGroup) => `<option value="${ageGroup}">${ageStyles[ageGroup]?.label || ageGroup}</option>`))
    .join("");
  if (state.ageGroup !== "all" && !ageGroups.includes(state.ageGroup)) {
    state.ageGroup = "all";
  }
  ageFilter.value = state.ageGroup;

  factionFilter.innerHTML = ['<option value="all">全部阵营</option>']
    .concat(factions.map((faction) => `<option value="${faction}">${faction}</option>`))
    .join("");
  if (state.faction !== "all" && !factions.includes(state.faction)) {
    state.faction = "all";
  }
  factionFilter.value = state.faction;

  worldFilter.innerHTML = ['<option value="all">全部原生世界</option>']
    .concat(
      DATA.worlds
        .filter((world) => activeWorldIds.has(world.id))
        .map((world) => `<option value="${world.id}">${world.name}</option>`)
    )
    .join("");
  worldFilter.value = state.world;
}

function renderCharacterGrid() {
  if (!characterGrid || !catalogCount) {
    if (graphCanvas) {
      rebuildGraph();
      drawGraph();
    }
    return;
  }
  const visibleCharacters = getVisibleCharacters();
  const activeCharacters = getCharactersForActiveBooks();
  catalogCount.textContent = `当前显示 ${visibleCharacters.length} / ${activeCharacters.length} 位角色`;

  if (!visibleCharacters.length) {
    characterGrid.innerHTML = '<div class="card-empty">当前筛选条件下没有匹配的角色。试试放宽阵营或世界条件，或勾选更多卷册模块。</div>';
    rebuildGraph();
    drawGraph();
    return;
  }

  characterGrid.innerHTML = visibleCharacters
    .map((character) => {
      const isSelected = state.selected.kind === "character" && state.selected.id === character.id;
      const selectedBooks = getCharacterBooksInSelection(character);
      const experiencedWorlds = getCharacterWorldsInSelection(character);
      const guide = getCharacterGuide(character);
      return `
        <article class="character-card ${isSelected ? "is-selected" : ""}" data-character-id="${character.id}">
          <div class="card-topline">
            ${makeInteractiveChip({ label: titleCaseEntity(character.entity_type), filterType: "entity", value: character.entity_type })}
            ${makeInteractiveChip({ label: character.faction, filterType: "faction", value: character.faction })}
          </div>
          <div class="identity-badges">
            ${makeSigilChips(character)}
          </div>
          <h3>${character.name}</h3>
          <p class="guide-meta-line">${formatAppearance(guide.firstAppearance)}</p>
          <p class="card-summary">${character.summary}</p>
          <div class="daemon-panel">
            <div class="meta-label">Daemon</div>
            <div class="daemon-name">${getDaemonName(character)}</div>
            <p class="daemon-form">${getDaemonFormText(character)}</p>
          </div>
          <div class="card-section card-section--worlds">
            <span class="section-label">World Trace</span>
            <div class="meta-block">
              <span class="meta-label">原生世界</span>
              <div class="meta-row">${makeOriginWorldChip(character.origin_world)}</div>
            </div>
            <div class="meta-block">
              <span class="meta-label">经历过的世界</span>
              <div class="meta-row">${makeWorldChips(experiencedWorlds, "Only native world")}</div>
            </div>
          </div>
          <div class="card-divider"></div>
          <div class="card-section card-section--books">
            <span class="section-label">Book Presence</span>
            <div class="card-meta book-strip">
              ${makeBookChips(selectedBooks)}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  rebuildGraph();
}

function renderCharacterDetail(character) {
  const relationships = getRelatedCharacters(character.id);
  const selectedBooks = getCharacterBooksInSelection(character);
  const experiencedWorlds = getCharacterWorldsInSelection(character);
  const guide = getCharacterGuide(character);
  const relationTimelines = getRelationTimelinesForCharacter(character.id);
  const route = getWorldRouteForCharacter(character.id);
  const linkedLocations = getLinkedLocations(guide.locationIds);
  const linkedConcepts = getLinkedConcepts(guide.conceptIds);
  const linkedTools = getLinkedTools(guide.conceptIds);
  const linkedThemes = getLinkedThemes(guide.themeIds);
  const relationStages = relationTimelines.flatMap((timeline) =>
    timeline.stages.map((stage) => ({
      ...stage,
      counterpartId: timeline.characters.find((id) => id !== character.id),
    }))
  ).sort((a, b) => appearanceRank(a) - appearanceRank(b));
  detailContent.innerHTML = `
    <h3 class="detail-title">${character.name}</h3>
    <p class="detail-subtitle">${titleCaseEntity(character.entity_type)} · ${character.faction}</p>
    <div class="detail-grid">
      ${makeInteractiveChip({ label: titleCaseEntity(character.entity_type), filterType: "entity", value: character.entity_type })}
      ${makeInteractiveChip({ label: character.faction, filterType: "faction", value: character.faction })}
      ${makeSigilChips(character)}
    </div>
    <p class="detail-copy">${character.identity}</p>
    <div class="detail-block">
      <h4>人物概览</h4>
      <p class="detail-copy">${character.summary}</p>
    </div>
    <div class="detail-block">
      <h4>别名与首次出场</h4>
      <div class="detail-grid">
        ${
          guide.aliases.length
            ? guide.aliases.map((alias) => `<span class="chip keyword-chip">${alias}</span>`).join("")
            : '<span class="chip">无别名</span>'
        }
      </div>
      <p class="detail-copy detail-copy--minor">${formatAppearance(guide.firstAppearance)}</p>
    </div>
    <div class="detail-block">
      <h4>英文关键词</h4>
      <div class="detail-grid">${makeKeywordChips(guide.keywords)}</div>
    </div>
    <div class="detail-block">
      <h4>Daemon</h4>
      <div class="daemon-panel detail-daemon">
        <div class="daemon-name">${getDaemonName(character)}</div>
        <p class="daemon-form">${getDaemonFormText(character)}</p>
      </div>
    </div>
    <div class="detail-block">
      <h4>卷册分布</h4>
      <div class="detail-grid">${makeBookChips(selectedBooks)}</div>
    </div>
    <div class="detail-block">
      <h4>原生世界</h4>
      <div class="detail-grid">${makeOriginWorldChip(character.origin_world)}</div>
    </div>
    <div class="detail-block">
      <h4>经历过的世界</h4>
      <div class="detail-grid">${makeWorldChips(experiencedWorlds, "Only native world")}</div>
    </div>
    <div class="detail-block">
      <h4>世界路线</h4>
      ${renderTimeline(route, (step) => `
        <article class="timeline__item">
          <div class="timeline__meta">${formatAppearance(step)}</div>
          <strong>${getWorld(step.world_id)?.name || step.world_id}</strong>
          <span>${step.note}</span>
        </article>
      `)}
    </div>
    <div class="detail-block">
      <h4>关系变化时间线</h4>
      ${renderTimeline(relationStages, (stage) => `
        <article class="timeline__item">
          <div class="timeline__meta">${formatAppearance(stage)} · ${relationLabel(stage.type)}</div>
          <strong>${getEntityName(characterMap.get(stage.counterpartId))}</strong>
          <span>${stage.label}：${stage.note}</span>
        </article>
      `)}
    </div>
    <div class="detail-block">
      <h4>相关地点</h4>
      <div class="detail-grid">
        ${linkedLocations.map((location) => makeSelectChip("location", location.id, location.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关概念</h4>
      <div class="detail-grid">
        ${linkedConcepts.map((concept) => makeSelectChip("concept", concept.id, concept.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关工具</h4>
      <div class="detail-grid">
        ${linkedTools.map((tool) => makeSelectChip("tool", tool.id, tool.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关主题</h4>
      <div class="detail-grid">
        ${linkedThemes.map((theme) => makeSelectChip("theme", theme.id, theme.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>关系网络</h4>
      <div class="detail-relations">
        ${
          relationships.length
            ? relationships
                .map((entry) => {
                  const otherLabel = getEntityName(entry.other) || entry.target;
                  const style = relationStyles[entry.type] || relationStyles.ally;
                  return `
                    <div class="relation-entry" style="--relation-color:${style.color}; --relation-soft:${withAlpha(style.color, 0.12)}">
                      <span class="relation-badge">${style.label}</span>
                      <strong>${otherLabel}</strong>
                      <span>${entry.note}</span>
                    </div>
                  `;
                })
                .join("")
            : '<span class="chip">暂无补充关系</span>'
        }
      </div>
    </div>
  `;
}

function renderDaemonDetail(daemon) {
  const guardian = characterMap.get(daemon.guardian);
  detailContent.innerHTML = `
    <h3 class="detail-title">${daemon.name}</h3>
    <p class="detail-subtitle">${daemon.settled ? "Settled daemon" : "Unsettled daemon"}</p>
    <div class="detail-grid">
      <span class="chip">Daemon</span>
      <span class="chip">${daemon.settled ? "◆ Settled" : "◇ Unsettled"}</span>
      ${makeWorldChip(daemon.origin_world)}
    </div>
    <div class="detail-block">
      <h4>Form</h4>
      <p class="detail-copy">${daemon.display_form}</p>
    </div>
    <div class="detail-block">
      <h4>Guardian</h4>
      <div class="detail-relations">
        <div class="relation-entry" style="--relation-color:${relationStyles.daemon.color}; --relation-soft:${withAlpha(relationStyles.daemon.color, 0.12)}">
          <span class="relation-badge">Daemon bond</span>
          <strong>${guardian ? guardian.name : daemon.guardian}</strong>
          <span>与其生命、情绪和意志直接相连。</span>
        </div>
      </div>
      <div class="detail-grid">
        ${guardian ? makeSelectChip("character", guardian.id, guardian.name) : '<span class="chip">暂无</span>'}
      </div>
    </div>
  `;
}

function renderWorldDetail(world) {
  const activeCharacters = getCharactersForActiveBooks();
  const natives = activeCharacters.filter((character) => character.origin_world === world.id);
  const visitors = activeCharacters.filter((character) => character.entered_worlds.includes(world.id));
  const locations = getLocationsForSelectedBooks().filter((location) => location.world_id === world.id);
  detailContent.innerHTML = `
    <h3 class="detail-title">${world.name}</h3>
    <p class="detail-subtitle">${world.vibe}</p>
    <div class="detail-grid">
      <span class="chip world-chip" style="--world-accent:${world.accent}; --world-soft:${withAlpha(world.accent, 0.12)}; --world-line:${withAlpha(world.accent, 0.34)}">
        <span class="world-chip__icon">${world.icon}</span>
        ${world.name}
      </span>
      <span class="chip">本地角色: ${natives.length}</span>
      <span class="chip">进入者: ${visitors.length}</span>
    </div>
    <div class="detail-block">
      <h4>世界概况</h4>
      <p class="detail-copy">${world.summary}</p>
    </div>
    <div class="detail-block">
      <h4>首次在阅读中出现</h4>
      <p class="detail-copy detail-copy--minor">${formatAppearance(getWorldAppearance(world.id))}</p>
    </div>
    <div class="detail-block">
      <h4>原生角色</h4>
      <div class="detail-grid">
        ${natives.slice(0, 12).map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>经历过此界的角色</h4>
      <div class="detail-grid">
        ${visitors.slice(0, 14).map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关地点</h4>
      <div class="detail-grid">
        ${locations.map((location) => makeSelectChip("location", location.id, location.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
  `;
}

function renderLocationDetail(location) {
  const relatedCharacters = location.character_ids
    .map((characterId) => characterMap.get(characterId))
    .filter(Boolean)
    .filter((character) => getCharactersForActiveBooks().some((entry) => entry.id === character.id));
  const relatedConcepts = getLinkedConcepts(location.concept_ids || []);
  const relatedTools = getLinkedTools(location.concept_ids || []);
  const relatedThemes = getLinkedThemes(location.theme_ids || []);
  detailContent.innerHTML = `
    <h3 class="detail-title">${location.name}</h3>
    <p class="detail-subtitle">${getWorldName(location.world_id)}</p>
    <div class="detail-grid">
      ${makeWorldChip(location.world_id)}
      ${makeBookChips(location.books)}
    </div>
    <div class="detail-block">
      <h4>地点概览</h4>
      <p class="detail-copy">${location.summary}</p>
    </div>
    <div class="detail-block">
      <h4>首次出场</h4>
      <p class="detail-copy detail-copy--minor">${formatAppearance(location.first_appearance)}</p>
    </div>
    <div class="detail-block">
      <h4>英文关键词</h4>
      <div class="detail-grid">${makeKeywordChips(location.keywords)}</div>
    </div>
    <div class="detail-block">
      <h4>关键场景</h4>
      ${renderTimeline(location.scene_notes || [], (note) => `
        <article class="timeline__item">
          <span>${note}</span>
        </article>
      `)}
    </div>
    <div class="detail-block">
      <h4>相关角色</h4>
      <div class="detail-grid">
        ${relatedCharacters.map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关概念</h4>
      <div class="detail-grid">
        ${relatedConcepts.map((concept) => makeSelectChip("concept", concept.id, concept.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关工具</h4>
      <div class="detail-grid">
        ${relatedTools.map((tool) => makeSelectChip("tool", tool.id, tool.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关主题</h4>
      <div class="detail-grid">
        ${relatedThemes.map((theme) => makeSelectChip("theme", theme.id, theme.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
  `;
}

function renderConceptDetail(concept) {
  const relatedThemes = getLinkedThemes(concept.theme_ids || []);
  const relatedLocations = getLocationsForSelectedBooks().filter((location) =>
    (location.concept_ids || []).includes(concept.id)
  );
  detailContent.innerHTML = `
    <h3 class="detail-title">${concept.name}</h3>
    <p class="detail-subtitle">Concept Glossary</p>
    <div class="detail-grid">${makeBookChips(concept.books)}</div>
    <div class="detail-block">
      <h4>概念解释</h4>
      <p class="detail-copy">${concept.summary}</p>
    </div>
    <div class="detail-block">
      <h4>首次出现</h4>
      <p class="detail-copy detail-copy--minor">${formatAppearance(concept.first_appearance)}</p>
    </div>
    <div class="detail-block">
      <h4>英文关键词</h4>
      <div class="detail-grid">${makeKeywordChips(concept.keywords)}</div>
    </div>
    <div class="detail-block">
      <h4>阅读提示</h4>
      <p class="detail-copy">${concept.reading_note}</p>
    </div>
    <div class="detail-block">
      <h4>相关主题</h4>
      <div class="detail-grid">
        ${relatedThemes.map((theme) => makeSelectChip("theme", theme.id, theme.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关地点</h4>
      <div class="detail-grid">
        ${relatedLocations.map((location) => makeSelectChip("location", location.id, location.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
  `;
}

function renderToolLineageMarkup(tool) {
  const steps = tool.lineage_steps || [];
  if (!steps.length) {
    return '<div class="timeline-empty">暂无工具传承脉络。</div>';
  }
  return `
    <div class="lineage-flow">
      ${steps
        .map((step, index) => `
          <div class="lineage-step">
            <div class="lineage-node">
              <div class="lineage-node__title">${step.title}</div>
              <div class="lineage-node__note">${step.note}</div>
              <div class="lineage-node__meta">
                ${
                  step.character_ids?.length
                    ? step.character_ids
                        .map((characterId) => makeSelectChip("character", characterId, getEntityName(characterMap.get(characterId)) || characterId))
                        .join("")
                    : step.character_id
                      ? makeSelectChip("character", step.character_id, getEntityName(characterMap.get(step.character_id)) || step.title)
                      : '<span class="chip">Context</span>'
                }
              </div>
            </div>
            ${index < steps.length - 1 ? '<div class="lineage-arrow" aria-hidden="true">→</div>' : ""}
          </div>
        `)
        .join("")}
    </div>
  `;
}

function renderToolDetail(tool) {
  const relatedThemes = getLinkedThemes(tool.theme_ids || []);
  const relatedLocations = getLinkedLocations(tool.location_ids || []);
  const relatedCharacters = (tool.character_ids || [])
    .map((characterId) => characterMap.get(characterId))
    .filter(Boolean)
    .filter((character) => getCharactersForActiveBooks().some((entry) => entry.id === character.id));

  detailContent.innerHTML = `
    <h3 class="detail-title">${tool.name}</h3>
    <p class="detail-subtitle">Instrument Archive</p>
    <div class="detail-grid">${makeBookChips(tool.books)}</div>
    <div class="tool-visual tool-visual--detail">${getToolIllustrationMarkup(tool.id)}</div>
    <p class="detail-copy detail-copy--minor">${tool.figure_caption || ""}</p>
    <div class="detail-block">
      <h4>工具概览</h4>
      <p class="detail-copy">${tool.summary}</p>
    </div>
    <div class="detail-block">
      <h4>首次出现</h4>
      <p class="detail-copy detail-copy--minor">${formatAppearance(tool.first_appearance)}</p>
    </div>
    <div class="detail-block">
      <h4>英文关键词</h4>
      <div class="detail-grid">${makeKeywordChips(tool.keywords)}</div>
    </div>
    <div class="detail-block">
      <h4>阅读提示</h4>
      <p class="detail-copy">${tool.reading_note}</p>
    </div>
    <div class="detail-block">
      <h4>${tool.lineage_title || "传承脉络"}</h4>
      ${renderToolLineageMarkup(tool)}
    </div>
    <div class="detail-block">
      <h4>相关角色</h4>
      <div class="detail-grid">
        ${relatedCharacters.map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关地点</h4>
      <div class="detail-grid">
        ${relatedLocations.map((location) => makeSelectChip("location", location.id, location.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关主题</h4>
      <div class="detail-grid">
        ${relatedThemes.map((theme) => makeSelectChip("theme", theme.id, theme.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
  `;
}

function renderThemeDetail(theme) {
  const relatedCharacters = (theme.character_ids || [])
    .map((characterId) => characterMap.get(characterId))
    .filter(Boolean)
    .filter((character) => getCharactersForActiveBooks().some((entry) => entry.id === character.id));
  const relatedConcepts = getLinkedConcepts(theme.concept_ids || []);
  const relatedTools = getLinkedTools(theme.concept_ids || []);
  const relatedLocations = getLinkedLocations(theme.location_ids || []);
  detailContent.innerHTML = `
    <h3 class="detail-title">${theme.name}</h3>
    <p class="detail-subtitle">Theme Index</p>
    <div class="detail-grid">${makeBookChips(theme.books)}</div>
    <div class="detail-block">
      <h4>主题说明</h4>
      <p class="detail-copy">${theme.summary}</p>
    </div>
    <div class="detail-block">
      <h4>首次形成阅读重心</h4>
      <p class="detail-copy detail-copy--minor">${formatAppearance(theme.first_appearance)}</p>
    </div>
    <div class="detail-block">
      <h4>英文关键词</h4>
      <div class="detail-grid">${makeKeywordChips(theme.keywords)}</div>
    </div>
    <div class="detail-block">
      <h4>阅读问题</h4>
      <p class="detail-copy">${theme.reading_question}</p>
    </div>
    <div class="detail-block">
      <h4>相关角色</h4>
      <div class="detail-grid">
        ${relatedCharacters.map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关概念</h4>
      <div class="detail-grid">
        ${relatedConcepts.map((concept) => makeSelectChip("concept", concept.id, concept.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关工具</h4>
      <div class="detail-grid">
        ${relatedTools.map((tool) => makeSelectChip("tool", tool.id, tool.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
    <div class="detail-block">
      <h4>相关地点</h4>
      <div class="detail-grid">
        ${relatedLocations.map((location) => makeSelectChip("location", location.id, location.name)).join("") || '<span class="chip">暂无</span>'}
      </div>
    </div>
  `;
}

function renderDetailPanel() {
  if (!detailContent) {
    return;
  }
  const selected = getSelectedEntity();
  if (!selected || !selected.value) {
    detailContent.innerHTML = "<p>点击人物卡、地点卡、概念卡、工具卡、主题卡、星图节点或世界节点来查看详情。</p>";
    return;
  }

  if (selected.kind === "character") {
    renderCharacterDetail(selected.value);
    return;
  }

  if (selected.kind === "daemon") {
    renderDaemonDetail(selected.value);
    return;
  }

  if (selected.kind === "location") {
    renderLocationDetail(selected.value);
    return;
  }

  if (selected.kind === "concept") {
    renderConceptDetail(selected.value);
    return;
  }

  if (selected.kind === "tool") {
    renderToolDetail(selected.value);
    return;
  }

  if (selected.kind === "theme") {
    renderThemeDetail(selected.value);
    return;
  }

  renderWorldDetail(selected.value);
}

function renderRelationFilters() {
  if (!relationFilters) {
    return;
  }
  relationFilters.innerHTML = relationOrder
    .map((type) => {
      const style = relationStyles[type];
      const checked = state.relationTypes.has(type) ? "checked" : "";
      return `
        <label class="toggle-chip">
          <input type="checkbox" data-relation-type="${type}" ${checked} />
          <span class="legend-swatch" style="background:${style.color}"></span>
          ${style.label}
        </label>
      `;
    })
    .join("");
}

function renderToolLineagePanel() {
  if (!toolLineagePanel) {
    return;
  }
  const selectedTool =
    (state.selected.kind === "tool" && toolMap.get(state.selected.id)) ||
    getToolsForSelectedBooks()[0];

  if (!selectedTool) {
    toolLineagePanel.innerHTML = '<div class="card-empty">当前卷册选择下没有更多工具条目。</div>';
    return;
  }

  const relatedCharacters = (selectedTool.character_ids || [])
    .map((characterId) => characterMap.get(characterId))
    .filter(Boolean)
    .filter((character) => getCharactersForActiveBooks().some((entry) => entry.id === character.id));

  toolLineagePanel.innerHTML = `
    <div class="tool-lineage-board">
      <div class="tool-lineage-board__hero">
        <div class="tool-visual tool-visual--board">${getToolIllustrationMarkup(selectedTool.id)}</div>
        <div class="tool-lineage-board__copy">
          <p class="panel__eyebrow">Inheritance Board</p>
          <h3>${selectedTool.name}</h3>
          <p>${selectedTool.summary}</p>
          <div class="detail-grid">${makeBookChips(selectedTool.books)}</div>
          <div class="detail-grid">
            ${relatedCharacters.map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无相关角色</span>'}
          </div>
        </div>
      </div>
      <div class="detail-block">
        <h4>${selectedTool.lineage_title || "传承脉络"}</h4>
        ${renderToolLineageMarkup(selectedTool)}
      </div>
    </div>
  `;
}

function setSelected(kind, id) {
  state.selected = { kind, id };
  renderAll();
}

function clearSelected() {
  state.selected = { kind: "none", id: null };
  renderAll();
}

function buildGraphData() {
  const visibleCharacters = getVisibleCharacters();
  const visibleIds = new Set(visibleCharacters.map((character) => character.id));
  const nodes = [];
  const links = [];

  visibleCharacters.forEach((character) => {
    nodes.push({
      id: character.id,
      label: character.name,
      shortLabel: getShortName(character.name),
      type: "character",
      faction: character.faction,
      color: factionColor(character.faction),
      radius: 12,
    });
  });

  const daemonIds = new Set();
  if (state.relationTypes.has("daemon")) {
    visibleCharacters.forEach((character) => {
      if (!character.daemon_id || !daemonMap.has(character.daemon_id)) {
        return;
      }
      daemonIds.add(character.daemon_id);
      links.push({
        source: character.id,
        target: character.daemon_id,
        type: "daemon",
        color: relationStyles.daemon.color,
        note: "人和 daemon 之间的绑定关系",
      });
    });
  }

  daemonIds.forEach((daemonId) => {
    const daemon = daemonMap.get(daemonId);
    nodes.push({
      id: daemon.id,
      label: daemon.name,
      shortLabel: daemon.name,
      type: "daemon",
      faction: "Daemon",
      color: "#e1b85e",
      radius: 8,
    });
  });

  getActiveRelationships().forEach((relation) => {
    if (!state.relationTypes.has(relation.type)) {
      return;
    }
    if (!visibleIds.has(relation.source) || !visibleIds.has(relation.target)) {
      return;
    }
    links.push({
      source: relation.source,
      target: relation.target,
      type: relation.type,
      color: relationStyles[relation.type]?.color || "#ffffff",
      note: relation.note,
    });
  });

  return { nodes, links };
}

function rebuildGraph() {
  if (!graphCanvas) {
    return;
  }
  const graphData = buildGraphData();
  const previous = graphState.byId;
  const factions = [...new Set(graphData.nodes.map((node) => node.faction))];
  const centerX = graphState.width / 2;
  const centerY = graphState.height / 2;
  const radius = Math.min(graphState.width, graphState.height) * 0.25;
  const groupedNodes = new Map();
  graphData.nodes.forEach((node) => {
    if (!groupedNodes.has(node.faction)) {
      groupedNodes.set(node.faction, []);
    }
    groupedNodes.get(node.faction).push(node);
  });

  graphState.nodes = graphData.nodes.map((node) => {
    const existing = previous.get(node.id);
    const clusterIndex = Math.max(0, factions.indexOf(node.faction));
    const theta = (clusterIndex / Math.max(factions.length, 1)) * Math.PI * 2;
    const clusterX = centerX + Math.cos(theta) * radius;
    const clusterY = centerY + Math.sin(theta) * radius;
    const factionNodes = groupedNodes.get(node.faction) || [];
    const localIndex = factionNodes.findIndex((entry) => entry.id === node.id);
    const ringSize = node.type === "daemon" ? 4 : 6;
    const ring = Math.floor(localIndex / ringSize);
    const slot = localIndex % ringSize;
    const slotsInRing = Math.min(ringSize, Math.max(1, factionNodes.length - ring * ringSize));
    const baseAngle = (slot / slotsInRing) * Math.PI * 2 + (ring % 2 ? Math.PI / slotsInRing : 0);
    const spread = node.type === "daemon" ? 34 + ring * 24 : 44 + ring * 30;
    const defaultX = clusterX + Math.cos(baseAngle) * spread;
    const defaultY = clusterY + Math.sin(baseAngle) * spread;
    const x = existing?.x ?? defaultX;
    const y = existing?.y ?? defaultY;
    return {
      ...node,
      x,
      y,
      vx: existing?.vx ?? 0,
      vy: existing?.vy ?? 0,
      anchorX: defaultX,
      anchorY: defaultY,
      clusterX,
      clusterY,
    };
  });

  graphState.nodes.forEach((node) => clampGraphNode(node));

  graphState.byId = new Map(graphState.nodes.map((node) => [node.id, node]));
  graphState.links = graphData.links.map((link) => ({
    ...link,
    sourceNode: graphState.byId.get(link.source),
    targetNode: graphState.byId.get(link.target),
  }));
}

function resizeCanvas() {
  if (!graphCanvas || !graphContext) {
    return;
  }
  const rect = graphCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  graphState.width = rect.width;
  graphState.height = rect.height;
  graphState.dpr = dpr;
  graphCanvas.width = rect.width * dpr;
  graphCanvas.height = rect.height * dpr;
  graphContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  rebuildGraph();
  drawGraph();
}

function clampGraphNode(node) {
  const paddingX = node.radius + 86;
  const paddingY = node.radius + 70;
  node.x = Math.min(graphState.width - paddingX, Math.max(paddingX, node.x));
  node.y = Math.min(graphState.height - paddingY, Math.max(paddingY, node.y));
}

function simulateGraph() {
  if (!graphCanvas || !graphState.nodes.length) {
    return;
  }

  const nodes = graphState.nodes;
  const draggedId = graphState.draggedNodeId;
  const centerX = graphState.width / 2;
  const centerY = graphState.height / 2;

  for (let i = 0; i < nodes.length; i += 1) {
    const source = nodes[i];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const target = nodes[j];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distanceSq = dx * dx + dy * dy + 0.01;
      const distance = Math.sqrt(distanceSq);
      const separation = source.radius + target.radius + (source.type === "daemon" || target.type === "daemon" ? 22 : 34);
      let force = 3000 / distanceSq;
      if (distance < separation) {
        force += (separation - distance) * 0.09;
      }
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      if (source.id !== draggedId) {
        source.vx -= fx;
        source.vy -= fy;
      }
      if (target.id !== draggedId) {
        target.vx += fx;
        target.vy += fy;
      }
    }
  }

  graphState.links.forEach((link) => {
    const { sourceNode, targetNode } = link;
    if (!sourceNode || !targetNode) {
      return;
    }
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const preferredDistance = link.type === "daemon" ? 74 : 144;
    const spring = link.type === "daemon" ? 0.0034 : 0.0017;
    const stretch = distance - preferredDistance;
    const fx = (dx / distance) * stretch * spring;
    const fy = (dy / distance) * stretch * spring;

    if (sourceNode.id !== draggedId) {
      sourceNode.vx += fx;
      sourceNode.vy += fy;
    }
    if (targetNode.id !== draggedId) {
      targetNode.vx -= fx;
      targetNode.vy -= fy;
    }
  });

  nodes.forEach((node) => {
    if (node.id === draggedId) {
      node.vx = 0;
      node.vy = 0;
      clampGraphNode(node);
      return;
    }

    const anchorStrength = node.type === "daemon" ? 0.018 : 0.012;
    node.vx += (node.anchorX - node.x) * anchorStrength;
    node.vy += (node.anchorY - node.y) * anchorStrength;
    node.vx += (centerX - node.x) * 0.0006;
    node.vy += (centerY - node.y) * 0.0006;

    const edgePaddingX = node.radius + 86;
    const edgePaddingY = node.radius + 70;
    if (node.x < edgePaddingX) {
      node.vx += (edgePaddingX - node.x) * 0.03;
    }
    if (node.x > graphState.width - edgePaddingX) {
      node.vx -= (node.x - (graphState.width - edgePaddingX)) * 0.03;
    }
    if (node.y < edgePaddingY) {
      node.vy += (edgePaddingY - node.y) * 0.03;
    }
    if (node.y > graphState.height - edgePaddingY) {
      node.vy -= (node.y - (graphState.height - edgePaddingY)) * 0.03;
    }

    node.vx *= 0.88;
    node.vy *= 0.88;
    node.x += node.vx;
    node.y += node.vy;
    clampGraphNode(node);
  });
}

function startGraphAnimation() {
  if (!graphCanvas || graphState.animationHandle || typeof window.requestAnimationFrame !== "function") {
    return;
  }

  const tick = () => {
    simulateGraph();
    drawGraph();
    graphState.animationHandle = window.requestAnimationFrame(tick);
  };

  graphState.animationHandle = window.requestAnimationFrame(tick);
}

function relationNeighbors(nodeId) {
  const neighbors = new Set([nodeId]);
  graphState.links.forEach((link) => {
    if (link.source === nodeId) {
      neighbors.add(link.target);
    }
    if (link.target === nodeId) {
      neighbors.add(link.source);
    }
  });
  return neighbors;
}

function drawGraph() {
  if (!graphContext || !graphCanvas) {
    return;
  }
  const ctx = graphContext;
  ctx.clearRect(0, 0, graphState.width, graphState.height);

  const selectedId = state.selected.kind === "world" ? null : state.selected.id;
  const highlighted = selectedId ? relationNeighbors(selectedId) : null;

  graphState.links.forEach((link) => {
    if (!link.sourceNode || !link.targetNode) {
      return;
    }
    const isDimmed = highlighted && !(highlighted.has(link.source) && highlighted.has(link.target));
    const dx = link.targetNode.x - link.sourceNode.x;
    const dy = link.targetNode.y - link.sourceNode.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const midX = (link.sourceNode.x + link.targetNode.x) / 2;
    const midY = (link.sourceNode.y + link.targetNode.y) / 2;
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const curve = link.type === "daemon" ? 0 : Math.min(34, distance * 0.14) * (link.source < link.target ? 1 : -1);
    ctx.beginPath();
    ctx.moveTo(link.sourceNode.x, link.sourceNode.y);
    ctx.quadraticCurveTo(midX + normalX * curve, midY + normalY * curve, link.targetNode.x, link.targetNode.y);
    ctx.strokeStyle = isDimmed ? "rgba(90, 69, 44, 0.12)" : withAlpha(link.color, 0.74);
    ctx.lineWidth = link.type === "daemon" ? 2 : 2.8;
    ctx.setLineDash(link.type === "daemon" ? [5, 7] : []);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  graphState.nodes.forEach((node) => {
    const isHovered = graphState.hoveredNodeId === node.id;
    const isSelected = selectedId === node.id;
    const isDimmed = highlighted && !highlighted.has(node.id);

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius + (isSelected ? 8 : isHovered ? 6 : 0), 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? withAlpha("#d9b56d", 0.18) : "rgba(117, 87, 49, 0.04)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = isDimmed ? withAlpha(node.color, 0.28) : node.color;
    ctx.fill();

    ctx.lineWidth = isSelected ? 2.8 : 1.2;
    ctx.strokeStyle = isSelected ? "#fff9ec" : withAlpha("#8f6a32", isDimmed ? 0.18 : 0.55);
    ctx.stroke();

    ctx.font = node.type === "daemon" ? "12px Iowan Old Style, serif" : "13px Iowan Old Style, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = isDimmed ? "rgba(71, 55, 38, 0.35)" : "#43311f";
    ctx.fillText(node.shortLabel, node.x, node.y + node.radius + 10);
  });
}

function findNodeAt(x, y) {
  const reversed = [...graphState.nodes].reverse();
  return reversed.find((node) => {
    const dx = node.x - x;
    const dy = node.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= node.radius + 6;
  });
}

function pointerPosition(event) {
  if (!graphCanvas) {
    return { x: 0, y: 0 };
  }
  const rect = graphCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function attachGraphEvents() {
  if (!graphCanvas) {
    return;
  }
  graphCanvas.addEventListener("pointerdown", (event) => {
    const point = pointerPosition(event);
    const node = findNodeAt(point.x, point.y);
    if (!node) {
      return;
    }
    graphState.draggedNodeId = node.id;
    graphState.pointerOffset = {
      x: node.x - point.x,
      y: node.y - point.y,
    };
    graphCanvas.style.cursor = "grabbing";
  });

  graphCanvas.addEventListener("pointermove", (event) => {
    const point = pointerPosition(event);
    const node = findNodeAt(point.x, point.y);
    graphState.hoveredNodeId = node?.id || null;
    graphCanvas.style.cursor = node ? "grab" : "default";

    if (graphState.draggedNodeId) {
      const dragged = graphState.byId.get(graphState.draggedNodeId);
      dragged.x = point.x + graphState.pointerOffset.x;
      dragged.y = point.y + graphState.pointerOffset.y;
      dragged.vx = 0;
      dragged.vy = 0;
      clampGraphNode(dragged);
    }
    drawGraph();
  });

  function releasePointer(event) {
    if (!graphState.draggedNodeId) {
      return;
    }
    const point = pointerPosition(event);
    const node = findNodeAt(point.x, point.y);
    const draggedId = graphState.draggedNodeId;
    graphState.draggedNodeId = null;
    graphCanvas.style.cursor = node ? "grab" : "default";

    if (!node || node.id !== draggedId) {
      drawGraph();
      return;
    }

    if (characterMap.has(node.id)) {
      if (state.selected.kind === "character" && state.selected.id === node.id) {
        clearSelected();
        return;
      }
      setSelected("character", node.id);
    } else if (daemonMap.has(node.id)) {
      if (state.selected.kind === "daemon" && state.selected.id === node.id) {
        clearSelected();
        return;
      }
      setSelected("daemon", node.id);
    }
  }

  graphCanvas.addEventListener("pointerup", releasePointer);
  graphCanvas.addEventListener("pointerleave", () => {
    graphState.hoveredNodeId = null;
    graphState.draggedNodeId = null;
    graphCanvas.style.cursor = "default";
    drawGraph();
  });
}

function worldCharacterStats(worldId) {
  const activeCharacters = getCharactersForActiveBooks();
  const natives = activeCharacters.filter((character) => character.origin_world === worldId);
  const visitors = activeCharacters.filter((character) => getCharacterWorldsInSelection(character).includes(worldId));
  return { natives, visitors };
}

function buildWorldPath(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const curve = Math.abs(start.x - end.x) > Math.abs(start.y - end.y) ? 110 : 85;
  const controlY = midY - curve;
  return `M ${start.x} ${start.y} Q ${midX} ${controlY} ${end.x} ${end.y}`;
}

function renderWorldNameText(world, position) {
  const lines = world.name_lines || [world.name];
  const startY = position.y - (lines.length === 1 ? 6 : 16);
  return `
    <text class="world-node-name" x="${position.x}" y="${startY}" text-anchor="middle">
      ${lines.map((line, index) => `<tspan x="${position.x}" dy="${index === 0 ? 0 : 20}">${line}</tspan>`).join("")}
    </text>
  `;
}

function renderWorldMap() {
  if (!worldMapElement || !worldPanel) {
    return;
  }
  const selectedCharacter = state.selected.kind === "character" ? characterMap.get(state.selected.id) : null;
  const characterPathWorlds = new Set();
  const activeWorldIds = getActiveWorldIds();
  const activeConnectionIds = getActiveConnectionIds();
  if (selectedCharacter) {
    characterPathWorlds.add(selectedCharacter.origin_world);
    getCharacterWorldsInSelection(selectedCharacter).forEach((worldId) => characterPathWorlds.add(worldId));
  }

  worldMapElement.innerHTML = `
    ${DATA.world_connections
      .filter((connection) => activeConnectionIds.has(`${connection.source}->${connection.target}`))
      .map((connection) => {
        const start = worldLayout[connection.source];
        const end = worldLayout[connection.target];
        const highlighted =
          state.focusedWorldId === connection.source ||
          state.focusedWorldId === connection.target ||
          (selectedCharacter &&
            characterPathWorlds.has(connection.source) &&
            characterPathWorlds.has(connection.target));
        return `
          <path
            class="world-line"
            d="${buildWorldPath(start, end)}"
            stroke="${highlighted ? "#b48738" : "rgba(147, 112, 45, 0.32)"}"
            stroke-width="${highlighted ? 4.6 : 2.8}"
          />
        `;
      })
      .join("")}
    ${DATA.worlds
      .filter((world) => activeWorldIds.has(world.id))
      .map((world) => {
        const { natives, visitors } = worldCharacterStats(world.id);
        const isFocused = state.focusedWorldId === world.id;
        const isPath = characterPathWorlds.has(world.id);
        const position = worldLayout[world.id];
        return `
          <g class="world-node ${isFocused ? "is-focused" : ""} ${isPath ? "is-path" : ""}" data-world-id="${world.id}" style="--world-accent:${world.accent}; --world-soft:${withAlpha(world.accent, 0.16)}; --world-line:${withAlpha(world.accent, 0.72)}">
            <circle class="world-glow" cx="${position.x}" cy="${position.y}" r="110"></circle>
            <circle class="world-node-circle" cx="${position.x}" cy="${position.y}" r="86"></circle>
            <text class="world-node-icon" x="${position.x}" y="${position.y - 34}" text-anchor="middle">${world.icon}</text>
            ${renderWorldNameText(world, position)}
            <text class="world-node-count" x="${position.x}" y="${position.y + 50}" text-anchor="middle">
              ${natives.length} native · ${visitors.length} entered
            </text>
          </g>
        `;
      })
      .join("")}
  `;

  const focusedWorld = state.focusedWorldId ? worldMap.get(state.focusedWorldId) : null;
  if (focusedWorld) {
    const { natives, visitors } = worldCharacterStats(focusedWorld.id);
    const locations = getLocationsForSelectedBooks().filter((location) => location.world_id === focusedWorld.id);
    worldPanel.innerHTML = `
      <h3>${focusedWorld.name}</h3>
      <p>${focusedWorld.summary}</p>
      <div class="world-stats">
        <span class="chip world-chip" style="--world-accent:${focusedWorld.accent}; --world-soft:${withAlpha(focusedWorld.accent, 0.12)}; --world-line:${withAlpha(focusedWorld.accent, 0.34)}">
          <span class="world-chip__icon">${focusedWorld.icon}</span>
          ${focusedWorld.name}
        </span>
        <span class="chip">本地角色 ${natives.length}</span>
        <span class="chip">跨界到访 ${visitors.length}</span>
      </div>
      <div class="detail-block">
        <h4>本地角色</h4>
        <div class="detail-grid">
          ${natives.slice(0, 10).map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无</span>'}
        </div>
      </div>
      <div class="detail-block">
        <h4>经历过此界的角色</h4>
        <div class="detail-grid">
          ${visitors.slice(0, 12).map((character) => makeSelectChip("character", character.id, character.name)).join("") || '<span class="chip">暂无</span>'}
        </div>
      </div>
      <div class="detail-block">
        <h4>相关地点</h4>
        <div class="detail-grid">
          ${locations.map((location) => makeSelectChip("location", location.id, location.name)).join("") || '<span class="chip">暂无</span>'}
        </div>
      </div>
    `;
  } else if (selectedCharacter) {
    const route = getWorldRouteForCharacter(selectedCharacter.id);
    worldPanel.innerHTML = `
      <h3>${selectedCharacter.name} 的航路</h3>
      <p>${selectedCharacter.summary}</p>
      <div class="detail-block">
        <h4>原生世界</h4>
        <div class="detail-grid">${makeWorldChip(selectedCharacter.origin_world)}</div>
      </div>
      <div class="detail-block">
        <h4>经历过的世界</h4>
        <div class="detail-grid">${makeWorldChips(getCharacterWorldsInSelection(selectedCharacter), "Only native world")}</div>
      </div>
      <div class="detail-block">
        <h4>按卷册展开</h4>
        ${renderTimeline(route, (step) => `
          <article class="timeline__item">
            <div class="timeline__meta">${formatAppearance(step)}</div>
            <strong>${getWorld(step.world_id)?.name || step.world_id}</strong>
            <span>${step.note}</span>
          </article>
        `)}
      </div>
    `;
  } else {
    worldPanel.innerHTML = `
      <h3>世界说明</h3>
      <p>点击任意世界节点，可以把人物卡和关系探索聚焦到这个世界的原生角色与跨界访客。</p>
    `;
  }
}

function attachWorldEvents() {
  if (!worldMapElement) {
    return;
  }
  worldMapElement.addEventListener("click", (event) => {
    const node = event.target.closest("[data-world-id]");
    if (!node) {
      return;
    }
    const worldId = node.dataset.worldId;
    state.focusedWorldId = state.focusedWorldId === worldId ? null : worldId;
    state.selected = { kind: "world", id: worldId };
    renderAll();
  });
}

function applyFilterChip(filterType, value) {
  if (filterType === "entity") {
    state.entityType = value;
    return;
  }

  if (filterType === "gender") {
    state.gender = value;
    return;
  }

  if (filterType === "age") {
    state.ageGroup = value;
    return;
  }

  if (filterType === "faction") {
    state.faction = value;
    return;
  }

  if (filterType === "world") {
    state.world = "all";
    state.focusedWorldId = value;
    return;
  }

  if (filterType === "origin-world") {
    state.world = value;
    state.focusedWorldId = null;
    return;
  }

  if (filterType === "book") {
    state.selectedBooks = new Set([value]);
  }
}

function handleFilterChipClick(event) {
  const chip = event.target.closest("[data-filter-type]");
  if (!chip) {
    return false;
  }
  event.preventDefault();
  event.stopPropagation();
  applyFilterChip(chip.dataset.filterType, chip.dataset.filterValue);
  renderAll();
  return true;
}

function handleSelectChipClick(event) {
  const trigger = event.target.closest("[data-select-kind]");
  if (!trigger) {
    return false;
  }
  event.preventDefault();
  event.stopPropagation();
  setSelected(trigger.dataset.selectKind, trigger.dataset.selectId);
  return true;
}

function attachUIEvents() {
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderAll();
    });
  }

  if (entityFilter) {
    entityFilter.addEventListener("change", (event) => {
      state.entityType = event.target.value;
      renderAll();
    });
  }

  if (genderFilter) {
    genderFilter.addEventListener("change", (event) => {
      state.gender = event.target.value;
      renderAll();
    });
  }

  if (ageFilter) {
    ageFilter.addEventListener("change", (event) => {
      state.ageGroup = event.target.value;
      renderAll();
    });
  }

  if (factionFilter) {
    factionFilter.addEventListener("change", (event) => {
      state.faction = event.target.value;
      renderAll();
    });
  }

  if (worldFilter) {
    worldFilter.addEventListener("change", (event) => {
      state.world = event.target.value;
      renderAll();
    });
  }

  if (resetFiltersButton) {
    resetFiltersButton.addEventListener("click", () => {
      state.search = "";
      state.entityType = "all";
      state.gender = "all";
      state.ageGroup = "all";
      state.faction = "all";
      state.world = "all";
      state.focusedWorldId = null;
      if (searchInput) {
        searchInput.value = "";
      }
      renderAll();
    });
  }

  if (randomCharacterButton) {
    randomCharacterButton.addEventListener("click", () => {
      const visibleCharacters = getVisibleCharacters();
      const pick = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)];
      if (pick) {
        setSelected("character", pick.id);
      }
    });
  }

  if (clearWorldFocusButton) {
    clearWorldFocusButton.addEventListener("click", () => {
      state.focusedWorldId = null;
      renderAll();
    });
  }

  if (modulePicker) {
    modulePicker.addEventListener("change", (event) => {
      const target = event.target;
      if (!target.matches("[data-book-module]")) {
        return;
      }
      const bookId = target.dataset.bookModule;
      if (target.checked) {
        state.selectedBooks.add(bookId);
      } else {
        if (state.selectedBooks.size === 1) {
          target.checked = true;
          return;
        }
        state.selectedBooks.delete(bookId);
      }
      renderAll();
    });
  }

  if (relationFilters) {
    relationFilters.addEventListener("change", (event) => {
      const target = event.target;
      if (!target.matches("[data-relation-type]")) {
        return;
      }
      const relationType = target.dataset.relationType;
      if (target.checked) {
        state.relationTypes.add(relationType);
      } else {
        state.relationTypes.delete(relationType);
      }
      rebuildGraph();
      drawGraph();
    });
  }

  if (characterGrid) {
    characterGrid.addEventListener("click", (event) => {
      if (handleFilterChipClick(event)) {
        return;
      }
      if (handleSelectChipClick(event)) {
        return;
      }
      const card = event.target.closest("[data-character-id]");
      if (!card) {
        return;
      }
      setSelected("character", card.dataset.characterId);
    });
  }

  if (detailContent) {
    detailContent.addEventListener("click", (event) => {
      if (handleFilterChipClick(event)) {
        return;
      }
      handleSelectChipClick(event);
    });
  }

  if (aliasIndex) {
    aliasIndex.addEventListener("click", handleSelectChipClick);
  }
  if (locationGrid) {
    locationGrid.addEventListener("click", handleSelectChipClick);
  }
  if (conceptGrid) {
    conceptGrid.addEventListener("click", handleSelectChipClick);
  }
  if (toolGrid) {
    toolGrid.addEventListener("click", handleSelectChipClick);
  }
  if (themeGrid) {
    themeGrid.addEventListener("click", handleSelectChipClick);
  }
  if (toolLineagePanel) {
    toolLineagePanel.addEventListener("click", handleSelectChipClick);
  }
  if (worldPanel) {
    worldPanel.addEventListener("click", handleSelectChipClick);
  }
}

function renderAll() {
  syncStateToModules();
  renderModulePicker();
  renderReadingProgressControls();
  renderHeroStats();
  renderAliasIndex();
  renderFilterOptions();
  renderCharacterGrid();
  renderDetailPanel();
  renderWorldMap();
  renderLocationGrid();
  renderConceptGrid();
  renderToolGrid();
  renderToolLineagePanel();
  renderThemeGrid();
  drawGraph();
  savePersistedState();
}

function init() {
  loadPersistedState();
  renderModulePicker();
  renderReadingProgressControls();
  renderBookLegend();
  renderRelationLegend();
  renderRelationFilters();
  renderAll();
  resizeCanvas();
  attachUIEvents();
  attachWorldEvents();
  attachGraphEvents();
  startGraphAnimation();
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("DOMContentLoaded", init);
