import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_FILE = resolve(ROOT, "西方哲学人物关系语法表.md");
const OUTPUT_DIR = resolve(ROOT, "data");
const OUTPUT_FILE = resolve(OUTPUT_DIR, "philosophy-data.js");

const markdown = readFileSync(SOURCE_FILE, "utf8");

function sectionBetween(startHeading, endHeadings) {
  const startIndex = markdown.indexOf(startHeading);

  if (startIndex === -1) {
    throw new Error(`无法找到章节：${startHeading}`);
  }

  const from = startIndex + startHeading.length;
  const possibleEnds = endHeadings
    .map((heading) => markdown.indexOf(heading, from))
    .filter((index) => index !== -1);

  const endIndex = possibleEnds.length ? Math.min(...possibleEnds) : markdown.length;
  return markdown.slice(from, endIndex).trim();
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseMarkdownTables(sectionText) {
  const lines = sectionText.split(/\r?\n/);
  const blocks = [];
  let current = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("|")) {
      current.push(line);
      continue;
    }

    if (current.length) {
      blocks.push(current);
      current = [];
    }
  }

  if (current.length) {
    blocks.push(current);
  }

  let lastHeader = null;

  return blocks.map((block) => {
    const firstRow = splitRow(block[0]);
    const secondRow = block[1] ? splitRow(block[1]) : [];
    const hasSeparator = secondRow.length && secondRow.every((cell) => /^:?-{3,}:?$/.test(cell));
    const header = hasSeparator ? firstRow : lastHeader;
    const dataStart = hasSeparator ? 2 : 0;

    if (!header) {
      throw new Error("发现没有表头的 Markdown 表格，且无法继承上一张表的表头。");
    }

    if (hasSeparator) {
      lastHeader = header;
    }

    return block.slice(dataStart).map((line) => {
      const cells = splitRow(line);
      return Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ""]));
    });
  });
}

function splitTags(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

const relationTypeSection = sectionBetween("## 关系类型建议", ["## 节点清单"]);
const nodeSection = sectionBetween("## 节点清单", ["## 边清单"]);
const edgeSection = sectionBetween("## 边清单", ["## 可视化建议"]);

const relationTypeTable = parseMarkdownTables(relationTypeSection)[0] ?? [];
const nodeTables = parseMarkdownTables(nodeSection);
const edgeTables = parseMarkdownTables(edgeSection);

const relationTypeLabels = Object.fromEntries(
  relationTypeTable.map((row) => [row.relation_type, row["含义"]]),
);

const nodes = nodeTables
  .flat()
  .filter((row) => row.id)
  .map((row) => ({
    id: row.id,
    label: row.label,
    type: row.type,
    era: row.era,
    region: row.region,
    course_role: row.course_role,
    tags: splitTags(row.tags),
  }));

const edges = edgeTables
  .flat()
  .filter((row) => row.source)
  .map((row) => ({
    source: row.source,
    target: row.target,
    relation_type: row.relation_type,
    relation_verb: row.relation_verb,
    weight: Number(row.weight) || 1,
    period: row.period,
    statement: row.statement,
  }));

const payload = {
  sourceFile: "西方哲学人物关系语法表.md",
  generatedAt: new Date().toISOString(),
  counts: {
    nodes: nodes.length,
    edges: edges.length,
    philosophers: nodes.filter((node) => node.type === "philosopher").length,
    coreFigures: nodes.filter((node) => node.course_role === "core").length,
  },
  relationTypeLabels,
  nodes,
  edges,
};

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(
  OUTPUT_FILE,
  `window.PHILOSOPHY_DATA = ${JSON.stringify(payload, null, 2)};\n`,
  "utf8",
);

console.log(`生成完成：${OUTPUT_FILE}`);
console.log(`节点 ${nodes.length} 个，关系 ${edges.length} 条。`);
