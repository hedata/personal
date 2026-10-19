'use strict';
// Shared by the gates that run on what a pull request adds or changes — never
// the whole tree (personal issues 1 and 7, EPU ADR-002). No dependencies.
//
// Selection, the same for every gate:
//   --base REF             PR: files changed since the merge-base (REF...HEAD)
//   --range BEFORE..AFTER  push: files changed by the pushed commits
//   FILE...                exactly these files (tests)
//   --root DIR             git root (default: cwd)

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const POST_DIR_RE = /^content\/post\/[^/]+\//;

// Parses the selection above. `valueOptions` maps extra `--flag` names to the
// key they set (always with a value); anything else starting with `-` throws.
function parseSelection(argv, valueOptions = {}) {
  const opts = { root: process.cwd(), files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opts.root = path.resolve(argv[++i]);
    else if (a === '--base') opts.base = argv[++i];
    else if (a === '--range') opts.range = argv[++i];
    else if (a in valueOptions) opts[valueOptions[a]] = argv[++i];
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else opts.files.push(a);
  }
  if ([opts.base, opts.range, opts.files.length || undefined].filter(Boolean).length !== 1) {
    throw new Error('give exactly one of --base REF, --range BEFORE..AFTER or FILE...');
  }
  return opts;
}

// Files under `pathspec` (repo-relative) changed on the PR side (--base,
// three-dot) or by the pushed commits (--range). Deleted files are skipped.
function changedFiles(opts, pathspec) {
  let args;
  if (opts.base) {
    args = ['diff', '--name-only', '--diff-filter=d', `${opts.base}...HEAD`, '--', pathspec];
  } else {
    const [from, to] = opts.range.split(/\.{2,3}/);
    if (!to) throw new Error(`--range needs BEFORE..AFTER, got "${opts.range}"`);
    args = /^0+$/.test(from)
      ? ['diff-tree', '--no-commit-id', '--name-only', '-r', '--diff-filter=d', to, '--', pathspec]
      : ['diff', '--name-only', '--diff-filter=d', from, to, '--', pathspec];
  }
  return execFileSync('git', ['-C', opts.root, ...args], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

// The posts a change touches: every content/post/<slug>/ that has a changed
// file in it and still has an index.md. Returned as repo-relative index.md
// paths, sorted, no duplicates.
function changedPosts(opts) {
  const dirs = new Set(
    changedFiles(opts, 'content/post/')
      .map((f) => POST_DIR_RE.exec(f))
      .filter(Boolean)
      .map((m) => m[0]),
  );
  return [...dirs]
    .map((d) => `${d}index.md`)
    .filter((f) => fs.existsSync(path.resolve(opts.root, f)))
    .sort();
}

// The index.md files a gate looks at: the given FILEs, else the changed posts.
function selectedPosts(opts) {
  return opts.files.length ? opts.files : changedPosts(opts);
}

// The text after the YAML front matter (or the whole text without one).
function body(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return text;
  const end = lines.indexOf('---', 1);
  return end === -1 ? text : lines.slice(end + 1).join('\n');
}

// A Mermaid block as Wowchemy renders it: a ```mermaid (or ~~~mermaid) fence.
const MERMAID_RE = /^[ \t]*(`{3,}|~{3,})[ \t]*\{?\.?mermaid\b/m;

function hasMermaid(text) {
  return MERMAID_RE.test(body(text));
}

module.exports = { parseSelection, changedFiles, changedPosts, selectedPosts, body, hasMermaid };
