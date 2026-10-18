#!/usr/bin/env node
'use strict';
// Front-matter check for posts (personal issue 1, EPU ADR-002).
//
// Every content/post/*/index.md must have `title`, `date`, `summary` and
// `draft` in its YAML front matter, and `date` must parse the way Hugo reads
// it: a YAML timestamp (YYYY-M-D, optional time, fraction and zone; month and
// day may have one digit, as goyaml allows). No dependencies, node >= 18.
//
//   node scripts/check-front-matter.js             # all posts under content/post
//   node scripts/check-front-matter.js FILE...     # only these files (tests)
//   node scripts/check-front-matter.js --root DIR  # repo root (default: cwd)
//
// Exit 1 and one line per problem (`file: problem`) when anything is missing.

const fs = require('node:fs');
const path = require('node:path');

const REQUIRED = ['title', 'date', 'summary', 'draft'];

// YAML 1.1 timestamp as goyaml (and therefore Hugo) accepts it.
const DATE_RE =
  /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[Tt ]\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?\s*(Z|[+-]\d{1,2}(?::?\d{2})?)?)?$/;

function parseArgs(argv) {
  const opts = { root: process.cwd(), files: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') opts.root = path.resolve(argv[++i]);
    else if (argv[i].startsWith('-')) throw new Error(`unknown option ${argv[i]}`);
    else opts.files.push(path.resolve(argv[i]));
  }
  return opts;
}

function listPosts(root) {
  const dir = path.join(root, 'content', 'post');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(dir, e.name, 'index.md'))
    .filter((f) => fs.existsSync(f))
    .sort();
}

function unquote(value) {
  const m = /^(["'])(.*)\1$/.exec(value);
  return m ? m[2] : value;
}

// Top-level keys only; a value may continue on indented lines or be a block
// scalar (`|`, `>`). Nested keys (indented) are ignored.
function parseFrontMatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  const body = lines.slice(1, end);
  const fields = {};
  for (let i = 0; i < body.length; i++) {
    const m = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(body[i]);
    if (!m) continue;
    let value = (m[2] || '').replace(/\s+#.*$/, '').trim();
    if (value === '' || /^[|>][-+]?$/.test(value)) {
      const parts = [];
      for (let j = i + 1; j < body.length && /^\s+\S/.test(body[j]); j++) parts.push(body[j].trim());
      value = parts.join(' ');
    }
    fields[m[1]] = unquote(value);
  }
  return fields;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function dateProblem(value) {
  const m = DATE_RE.exec(value);
  if (!m) return `date "${value}" is not a YAML timestamp (YYYY-MM-DD[THH:MM:SS[.fff]][Z|+HH:MM])`;
  const [, y, mo, d, h = '0', mi = '0', s = '0', frac = '0', zone = 'Z'] = m;
  const daysInMonth = new Date(Date.UTC(Number(y), Number(mo), 0)).getUTCDate();
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth || h > 23 || mi > 59 || s > 59) {
    return `date "${value}" is out of range`;
  }
  let z = zone;
  if (z !== 'Z') {
    const zm = /^([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(z);
    z = `${zm[1]}${pad(zm[2])}:${zm[3] || '00'}`;
  }
  const iso = `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}.${frac.slice(0, 3).padEnd(3, '0')}${z}`;
  return Number.isNaN(Date.parse(iso)) ? `date "${value}" does not parse` : null;
}

function checkFile(file) {
  const fields = parseFrontMatter(fs.readFileSync(file, 'utf8'));
  if (!fields) return ['no YAML front matter (--- block at the top)'];
  const problems = [];
  for (const key of REQUIRED) {
    if (!(key in fields)) problems.push(`missing ${key}`);
    else if (fields[key] === '') problems.push(`empty ${key}`);
  }
  if (fields.date) {
    const p = dateProblem(fields.date);
    if (p) problems.push(p);
  }
  if (fields.draft && !/^(true|false)$/.test(fields.draft)) {
    problems.push(`draft "${fields.draft}" is not true or false`);
  }
  return problems;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const files = opts.files.length ? opts.files : listPosts(opts.root);
  let bad = 0;
  for (const file of files) {
    const problems = checkFile(file);
    if (problems.length) bad++;
    for (const p of problems) console.log(`${path.relative(opts.root, file)}: ${p}`);
  }
  if (bad) {
    console.log(`❌ front matter: ${bad} of ${files.length} posts have problems`);
    process.exit(1);
  }
  console.log(`✔ front matter: ${files.length} posts checked, all have title, date, summary and draft`);
}

if (require.main === module) main();

module.exports = { parseFrontMatter, dateProblem, checkFile };
