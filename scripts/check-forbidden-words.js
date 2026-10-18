#!/usr/bin/env node
'use strict';
// Forbidden-words gate for the public page (personal issue 1, EPU ADR-002).
//
// Scans the files under content/ that a pull request adds or modifies — never
// the whole tree; older posts are not its business — for whole-word,
// case-insensitive matches against
//   (a) the public list scripts/forbidden-words.txt   → prints file, line, word
//   (b) the private list in $POST_FORBIDDEN_WORDS       → prints file and line only
//       (household, family and client names; one entry per line; may be unset
//       or empty; its entries are never printed).
// List syntax, both lists: one entry per line, `#` starts a comment, blank
// lines are ignored; an entry starting with `re:` is a JavaScript regular
// expression (flags g i u), anything else a literal matched as a whole word.
//
//   node scripts/check-forbidden-words.js --base origin/master   # PR: files changed since the merge-base
//   node scripts/check-forbidden-words.js --range BEFORE..AFTER   # push: files changed by the pushed commits
//   node scripts/check-forbidden-words.js FILE...                 # exactly these files (tests)
// Options: --root DIR (git root, default cwd), --list FILE (default scripts/forbidden-words.txt).
//
// Exit 1 on any hit.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const CONTENT_DIR = 'content/';

function parseArgs(argv) {
  const opts = { root: process.cwd(), list: path.join(__dirname, 'forbidden-words.txt'), files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opts.root = path.resolve(argv[++i]);
    else if (a === '--list') opts.list = path.resolve(argv[++i]);
    else if (a === '--base') opts.base = argv[++i];
    else if (a === '--range') opts.range = argv[++i];
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else opts.files.push(a);
  }
  if ([opts.base, opts.range, opts.files.length || undefined].filter(Boolean).length !== 1) {
    throw new Error('give exactly one of --base REF, --range BEFORE..AFTER or FILE...');
  }
  return opts;
}

function parseList(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

function compile(entry) {
  if (entry.startsWith('re:')) return new RegExp(entry.slice(3), 'giu');
  const escaped = entry.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'giu');
}

// Files under content/ changed on the PR side (--base, three-dot) or by the
// pushed commits (--range). Deleted files are skipped.
function changedFiles(opts) {
  let args;
  if (opts.base) {
    args = ['diff', '--name-only', '--diff-filter=d', `${opts.base}...HEAD`, '--', CONTENT_DIR];
  } else {
    const [from, to] = opts.range.split(/\.{2,3}/);
    if (!to) throw new Error(`--range needs BEFORE..AFTER, got "${opts.range}"`);
    args = /^0+$/.test(from)
      ? ['diff-tree', '--no-commit-id', '--name-only', '-r', '--diff-filter=d', to, '--', CONTENT_DIR]
      : ['diff', '--name-only', '--diff-filter=d', from, to, '--', CONTENT_DIR];
  }
  return execFileSync('git', ['-C', opts.root, ...args], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

function isBinary(buf) {
  return buf.subarray(0, 8000).includes(0);
}

// Returns [{file, line, word}] — word is undefined for private hits.
function scan(file, text, publicPatterns, privatePatterns) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const re of publicPatterns) {
      re.lastIndex = 0;
      const m = re.exec(line);
      if (m) hits.push({ file, line: i + 1, word: m[0] });
    }
    for (const re of privatePatterns) {
      re.lastIndex = 0;
      if (re.test(line)) {
        hits.push({ file, line: i + 1 });
        break;
      }
    }
  });
  return hits;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const publicPatterns = parseList(fs.readFileSync(opts.list, 'utf8')).map(compile);
  const privateEnv = process.env.POST_FORBIDDEN_WORDS;
  const privatePatterns = parseList(privateEnv || '').map(compile);
  const files = opts.files.length ? opts.files : changedFiles(opts);

  console.log(
    `forbidden words: public list ${publicPatterns.length} entries, private list ` +
      (privateEnv === undefined ? 'unset' : `${privatePatterns.length} entries`) +
      `, ${files.length} file(s) to check`,
  );
  const hits = [];
  for (const file of files) {
    const buf = fs.readFileSync(path.resolve(opts.root, file));
    if (isBinary(buf)) continue;
    hits.push(...scan(file, buf.toString('utf8'), publicPatterns, privatePatterns));
  }
  for (const h of hits) {
    console.log(`${h.file}:${h.line}: ` + (h.word === undefined ? 'forbidden word (private list)' : `forbidden word "${h.word}"`));
  }
  if (hits.length) {
    console.log(`❌ forbidden words: ${hits.length} hit(s) in ${new Set(hits.map((h) => h.file)).size} file(s)`);
    process.exit(1);
  }
  console.log(`✔ forbidden words: no hits in ${files.length} file(s) under ${CONTENT_DIR}`);
}

if (require.main === module) main();

module.exports = { parseList, compile, scan };
