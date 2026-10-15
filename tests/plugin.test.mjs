// Structural checks for the plugin. No dependencies: Node's own test runner.
// Run with `npm test`. CI also runs `claude plugin validate . --strict`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");
const readJson = (path) => JSON.parse(read(path));

const SEATS = ["backend", "frontend", "integrations", "data", "security", "qa"];
const AGENTS = [...SEATS, "skeptic"];

// Minimal frontmatter reader: `key: value` lines between the first two `---` lines.
function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "file starts with a frontmatter block");
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return fields;
}

// The text between `<!-- open -->` and the next `<!-- close -->`, markers included.
function block(text, open, close) {
  const start = text.indexOf(open);
  if (start < 0) return null;
  const end = text.indexOf(close, start);
  if (end < 0) return null;
  return text.slice(start, end + close.length);
}

// Every text file that ships in the repository, as paths relative to the root.
const TEXT = /\.(md|json|ya?ml|mjs|js|txt)$|^\.(gitignore|gitattributes|editorconfig)$/;
function shippedTextFiles(dir = root) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if ([".git", "node_modules"].includes(name)) continue;
    const full = join(dir, name);
    const rel = relative(root, full).split(sep).join("/");
    if (rel === "evals/results") continue;
    if (statSync(full).isDirectory()) out.push(...shippedTextFiles(full));
    else if (TEXT.test(name)) out.push(rel);
  }
  return out;
}

test("manifests parse and agree on name and version", () => {
  const plugin = readJson(".claude-plugin/plugin.json");
  const market = readJson(".claude-plugin/marketplace.json");
  const pkg = readJson("package.json");

  assert.equal(plugin.name, "prd-simulator");
  assert.equal(market.name, "prd-simulator");
  assert.equal(market.plugins.length, 1);
  assert.equal(market.plugins[0].name, plugin.name);
  assert.equal(market.plugins[0].source, "./");
  assert.equal(market.plugins[0].version, undefined, "version lives in plugin.json only");

  assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.version, plugin.version, "package.json version");
  const changelog = read("CHANGELOG.md").match(/^## (\d+\.\d+\.\d+)/m);
  assert.ok(changelog, "CHANGELOG.md has a version heading");
  assert.equal(changelog[1], plugin.version, "newest CHANGELOG.md entry");

  assert.equal(plugin.license, "MIT");
  assert.equal(plugin.author.name, "Arda Asaroglu");
  assert.equal(market.owner.name, "Arda Asaroglu");
  assert.doesNotThrow(() => new URL(plugin.homepage));

  // Fields Anthropic's directory shows on the listing. Claude Code ignores them at load.
  for (const key of ["documentationUrl", "supportUrl", "privacyPolicyUrl"]) {
    assert.match(plugin[key] ?? "", /^https:\/\/github\.com\/ardaasaroglu\/prd-simulator\b/, `plugin.json ${key}`);
  }
  assert.match(plugin.icon, /^\.\/.+\.png$/, "icon is a PNG inside the plugin");
  const icon = readFileSync(join(root, plugin.icon));
  assert.equal(icon.subarray(1, 4).toString("latin1"), "PNG", "icon file is a PNG");
  assert.ok(existsSync(join(root, "PRIVACY.md")), "the privacy policy the manifest links to exists");
});

test("the plugin folder meets the directory's file rules", () => {
  const all = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if ([".git", "node_modules"].includes(name)) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else all.push({ rel: relative(root, full).split(sep).join("/"), size: statSync(full).size });
    }
  };
  walk(root);
  assert.ok(all.length <= 512, "512 files or fewer");
  assert.ok(!existsSync(join(root, "bin")), "no top-level bin/, which claude.ai and Cowork refuse");
  for (const { rel, size } of all) {
    const image = /\.(png|jpe?g|gif|webp|svg)$/i.test(rel);
    assert.ok(image || TEXT.test(rel.split("/").pop()) || rel === "LICENSE", `${rel}: only text files and images`);
    assert.ok(image || size < 256 * 1024, `${rel}: under 256 KiB`);
    assert.doesNotMatch(rel, /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|__MACOSX)$/, `${rel}: no system files`);
  }
});

test("the README works as the directory listing", () => {
  const readme = read("README.md");
  const prose = readme.replace(/```[\s\S]*?```/g, " ");
  assert.ok(prose.split(/\s+/).filter(Boolean).length >= 40, "40 words or more outside code blocks");
  assert.doesNotMatch(readme, /<img\b/i, "bundled images use Markdown image syntax");
  const prompts = readme.split("## Example prompts")[1]?.split("\n## ")[0] ?? "";
  assert.ok(prompts.split("\n").filter((l) => /^\* /.test(l)).length >= 3, "at least three example prompts");
  for (const heading of ["## What it reads, writes and sends", "## Troubleshooting"]) assert.ok(readme.includes(heading), heading);
  assert.doesNotMatch(read("skills/simulate/SKILL.md"), /\$ARGUMENTS/, "no placeholder that chat would show literally");
});

test("the skill has valid frontmatter and stays short", () => {
  const text = read("skills/simulate/SKILL.md");
  const fm = frontmatter(text);
  assert.equal(fm.name, "simulate");
  assert.match(fm.description, /Use when/);
  assert.ok(fm["argument-hint"], "argument-hint is set");
  assert.deepEqual(fm["allowed-tools"].split(/[\s,]+/).sort(), ["Agent", "Glob", "Grep", "Read", "Write"]);
  assert.equal(fm.model, undefined, "the skill never pins a model");
  assert.ok(text.split("\n").length <= 250, "SKILL.md is 250 lines or fewer");
});

test("every agent the skill launches exists with valid frontmatter", () => {
  const skill = read("skills/simulate/SKILL.md");
  const referenced = new Set([...skill.matchAll(/prd-simulator:([a-z-]+)/g)].map((m) => m[1]));
  referenced.delete("simulate");
  assert.deepEqual([...referenced].sort(), [...AGENTS].sort(), "the skill names every seat and the skeptic");

  const files = readdirSync(join(root, "agents")).filter((f) => f.endsWith(".md"));
  assert.deepEqual(files.map((f) => f.replace(/\.md$/, "")).sort(), [...AGENTS].sort(), "no stray agent files");

  for (const name of AGENTS) {
    const fm = frontmatter(read(`agents/${name}.md`));
    assert.equal(fm.name, name, `${name}: name matches the file`);
    assert.ok(fm.description && fm.description.length > 40, `${name}: has a description`);
    assert.equal(fm.tools, "Read, Grep, Glob", `${name}: read-only tools`);
    assert.equal(fm.model, "inherit", `${name}: model inherits`);
  }
});

test("every reference file the skill names exists", () => {
  const skill = read("skills/simulate/SKILL.md");
  // Bare file names and references/ paths. Agent files under agents/ are checked by the test above.
  const named = new Set([...skill.matchAll(/(?<![a-z-]|agents\/)([a-z-]+\.md)`/g)].map((m) => m[1]));
  for (const file of ["seat-cards.md", "finding-schema.md", "report-template.md"]) {
    assert.ok(named.has(file), `SKILL.md names ${file}`);
  }
  for (const file of named) {
    assert.ok(existsSync(join(root, "skills/simulate/references", file)), `references/${file} exists`);
  }
});

test("every seat has a card, and its agent carries the card word for word", () => {
  const cards = read("skills/simulate/references/seat-cards.md");
  for (const seat of SEATS) {
    const card = block(cards, `<!-- seat-card:${seat} -->`, "<!-- /seat-card -->");
    assert.ok(card, `seat-cards.md has a card for ${seat}`);
    for (const part of ["**Owns:**", "**Asks:**", "**Ignores:**"]) assert.ok(card.includes(part), `${seat} card has ${part}`);
    assert.equal(block(read(`agents/${seat}.md`), `<!-- seat-card:${seat} -->`, "<!-- /seat-card -->"), card, `agents/${seat}.md card matches`);
  }
});

test("shared rules are identical in the reference file and every agent", () => {
  const schema = read("skills/simulate/references/finding-schema.md");
  const shared = (name) => block(schema, `<!-- shared:${name} -->`, `<!-- /shared:${name} -->`);
  for (const name of ["hard-rules", "finding-schema", "skeptic-rules", "verdict-schema"]) {
    assert.ok(shared(name), `finding-schema.md has the ${name} block`);
  }
  for (const seat of SEATS) {
    const text = read(`agents/${seat}.md`);
    for (const name of ["hard-rules", "finding-schema"]) {
      assert.equal(block(text, `<!-- shared:${name} -->`, `<!-- /shared:${name} -->`), shared(name), `agents/${seat}.md ${name}`);
    }
  }
  const skeptic = read("agents/skeptic.md");
  for (const name of ["skeptic-rules", "verdict-schema"]) {
    assert.equal(block(skeptic, `<!-- shared:${name} -->`, `<!-- /shared:${name} -->`), shared(name), `agents/skeptic.md ${name}`);
  }
});

test("example reports quote their specs word for word", () => {
  const squash = (s) => s.replace(/\s+/g, " ").trim();
  const reports = readdirSync(join(root, "examples")).filter((f) => f.endsWith(".simulation.md"));
  assert.ok(reports.length >= 2, "at least two example reports");
  for (const report of reports) {
    const specFile = `examples/${report.replace(".simulation.md", ".md")}`;
    assert.ok(existsSync(join(root, specFile)), `${report} has its spec at ${specFile}`);
    const spec = squash(read(specFile));
    const quotes = [...read(`examples/${report}`).matchAll(/^> "(.+)"$/gm)].map((m) => m[1]);
    assert.ok(quotes.length > 0, `${report} quotes its spec`);
    for (const quote of quotes) assert.ok(spec.includes(squash(quote)), `${report}: quote found in spec: ${quote}`);
  }
});

test("every eval case has a prompt and well-formed graders", () => {
  const types = new Set(["regex", "tool_used", "tool_order", "file_exists", "llm", "baseline"]);
  const cases = readdirSync(join(root, "evals")).filter((d) => d !== "results" && statSync(join(root, "evals", d)).isDirectory());
  assert.ok(cases.length >= 3, "at least three eval cases");
  for (const name of cases) {
    const prompt = read(`evals/${name}/prompt.md`);
    const fm = frontmatter(prompt);
    assert.ok(Number(fm.max_turns) > 0, `${name}: max_turns`);
    assert.ok(prompt.split("---\n")[2].trim().length > 0, `${name}: prompt body`);
    const graders = readdirSync(join(root, "evals", name, "graders"));
    assert.ok(graders.length > 0, `${name}: has graders`);
    for (const g of graders) assert.ok(types.has(frontmatter(read(`evals/${name}/graders/${g}`)).type), `${name}/${g}: known grader type`);
  }
});

test("shipped text has no em or en dashes", () => {
  const offenders = shippedTextFiles().filter((f) => /[\u2013\u2014]/.test(read(f)));
  assert.deepEqual(offenders, []);
});

test("shipped text keeps local paths, emails and keys out", () => {
  const patterns = [
    [/[A-Za-z]:[\\/]Users[\\/]/, "a local Windows user path"],
    [/\/(?:Users|home)\/[a-z][\w.-]*\//, "a local home path"],
    [/[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}\b/i, "an email address"],
    [/sk-ant-[\w-]{8,}|ghp_\w{20,}|github_pat_\w{20,}|xox[bp]-\w+|AKIA[0-9A-Z]{16}/, "something shaped like a real key"],
    // Built from code points so this file stays ASCII: G, S and I with breve, cedilla or dot.
    [new RegExp(`[${String.fromCharCode(0x11e, 0x11f, 0x15e, 0x15f, 0x130, 0x131)}]`), "letters from a non-English alphabet"],
  ];
  const problems = [];
  for (const file of shippedTextFiles()) {
    const text = read(file);
    for (const [re, what] of patterns) if (re.test(text)) problems.push(`${file}: ${what}`);
  }
  assert.deepEqual(problems, []);
});
