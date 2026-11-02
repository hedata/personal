#!/usr/bin/env node
'use strict';
// The architecture page keeps its shape (personal issue 40, core ADR-008 —
// a fitness function for docs). The same check as the template repo's
// test_architecture_page.py:
//
//   - docs/architecture.md has arc42's twelve sections as `##` headings, in
//     arc42's order and with its names (SECTIONS);
//   - section 2 opens with the stage line (`Stage: dev` or `Stage: production`);
//   - sections 3 and 5 each carry a Mermaid block (the C4 Context and
//     Container diagrams), and every Mermaid block of the page starts with the
//     design skill's theme line (hedata-epu design skill,
//     mermaid/init-directive.txt);
//   - every relative link of every page under docs/ points at a file that
//     exists.
//
// Runs on the whole tree. No dependencies, node >= 18.
//
//   node scripts/check-architecture-page.js             # docs/ of the cwd
//   node scripts/check-architecture-page.js --root DIR  # repo root (tests)
//
// Exit 1 and one line per problem when anything is off.

const fs = require('node:fs');
const path = require('node:path');

// arc42's sections, in its order, with its English names (template 9.x).
const SECTIONS = [
  '1. Introduction and Goals',
  '2. Architecture Constraints',
  '3. Context and Scope',
  '4. Solution Strategy',
  '5. Building Block View',
  '6. Runtime View',
  '7. Deployment View',
  '8. Cross-cutting Concepts',
  '9. Architecture Decisions',
  '10. Quality Requirements',
  '11. Risks and Technical Debts',
  '12. Glossary',
];
const STAGES = ['dev', 'production'];
// The first part of the design skill's theme line is enough to recognise it.
const THEME_LINE = '%%{init: {"theme": "base", "themeVariables": {';
const MERMAID_BLOCK = /^```mermaid\n([\s\S]*?)^```/gm;
const LINK = /\]\(([^)\s]+)\)/g;
const PAGE = path.join('docs', 'architecture.md');

function headings(text) {
  return [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
}

// The page's `##` sections by heading, each with its body.
function sections(text) {
  const parts = text.split(/^## (.+)$/m);
  const out = {};
  for (let i = 1; i < parts.length; i += 2) out[parts[i].trim()] = parts[i + 1];
  return out;
}

function mermaidBlocks(text) {
  return [...text.matchAll(MERMAID_BLOCK)].map((m) => m[1]);
}

// What the page lacks of core ADR-008's shape; empty when it has it all.
function shapeProblems(text) {
  const problems = [];
  const found = headings(text);
  if (JSON.stringify(found) !== JSON.stringify(SECTIONS)) {
    problems.push(`## headings are ${JSON.stringify(found)}, not arc42's ${JSON.stringify(SECTIONS)}`);
  }
  const body = sections(text);
  const lines = (body[SECTIONS[1]] || '').trim().split(/\r?\n/);
  const first = lines[0].trim();
  if (!STAGES.map((s) => `Stage: ${s}`).includes(first)) {
    problems.push(`section 2 starts with ${JSON.stringify(first)}, not the stage line (Stage: ${STAGES.join(' | ')})`);
  }
  for (const name of [SECTIONS[2], SECTIONS[4]]) {
    if (!mermaidBlocks(body[name] || '').length) problems.push(`section "${name}" has no Mermaid block`);
  }
  for (const block of mermaidBlocks(text)) {
    if (!block.startsWith(THEME_LINE)) {
      problems.push(`a Mermaid block lacks the theme line: ${JSON.stringify(block.slice(0, 60))}`);
    }
  }
  return problems;
}

// Relative links of a page whose file does not exist.
function brokenLinks(root, file) {
  const broken = [];
  for (const m of fs.readFileSync(file, 'utf8').matchAll(LINK)) {
    const target = m[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target.split('#')[0]));
    if (!fs.existsSync(resolved)) broken.push(`${path.relative(root, file)}: ${target}`);
  }
  return broken;
}

function docsPages(root) {
  const dir = path.join(root, 'docs');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f))
    .sort();
}

function parseArgs(argv) {
  const opts = { root: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') opts.root = path.resolve(argv[++i]);
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  return opts;
}

function check(root) {
  const page = path.join(root, PAGE);
  if (!fs.existsSync(page)) return [`${PAGE}: missing (core ADR-008: one architecture page per repo)`];
  const problems = shapeProblems(fs.readFileSync(page, 'utf8')).map((p) => `${PAGE}: ${p}`);
  for (const file of docsPages(root)) {
    for (const link of brokenLinks(root, file)) problems.push(`${link}: relative link to a file that does not exist`);
  }
  return problems;
}

function main() {
  const { root } = parseArgs(process.argv.slice(2));
  const problems = check(root);
  for (const p of problems) console.log(p);
  if (problems.length) {
    console.log(`❌ architecture page: ${problems.length} problem(s)`);
    process.exit(1);
  }
  console.log(`✔ architecture page: arc42's twelve sections, the stage line, C4 diagrams in sections 3 and 5 with the theme line, relative links of ${docsPages(root).length} page(s) resolve`);
}

if (require.main === module) main();

module.exports = { SECTIONS, THEME_LINE, sections, shapeProblems, brokenLinks, check };
