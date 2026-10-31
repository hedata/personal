#!/usr/bin/env node
'use strict';
// Featured-image gate for posts (personal issue 7, EPU ADR-003).
//
// Every post this pull request adds or changes needs a featured image —
// featured.png / .jpg / .jpeg / .webp / .svg / .gif in the post folder, which
// Wowchemy picks up as the preview picture — and the source it was made
// from, checked in next to it: featured.mmd (Mermaid text), featured.svg
// (its own source), or featured.source.md naming where it came from (the
// design project and brief, or the template and its parameters). A picture
// alone fails: "featured image without source". Posts with `draft: true` are
// skipped — not published, so no picture yet (personal issue 25).
//
//   node scripts/check-featured-image.js --base origin/master   # PR: posts changed since the merge-base
//   node scripts/check-featured-image.js --range BEFORE..AFTER   # push: posts changed by the pushed commits
//   node scripts/check-featured-image.js FILE...                 # exactly these index.md files (tests)
// Option: --root DIR (git root, default cwd). Exit 1 on any problem.

const fs = require('node:fs');
const path = require('node:path');
const { parseSelection, publishedPosts } = require('./lib/posts');

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'];
const SOURCES = ['featured.mmd', 'featured.svg', 'featured.source.md'];

function present(dir, name) {
  const file = path.join(dir, name);
  return fs.existsSync(file) && fs.statSync(file).size > 0;
}

// The problem with the post folder `dir`, or null.
function featuredProblem(dir) {
  const image = IMAGE_EXT.map((e) => `featured.${e}`).find((n) => present(dir, n));
  if (!image) return `featured image without source: no featured.${IMAGE_EXT.join('/')} in the post folder`;
  if (!SOURCES.some((n) => present(dir, n))) {
    return `featured image without source: ${image} has no ${SOURCES.join(', ')} next to it`;
  }
  return null;
}

function main() {
  const opts = parseSelection(process.argv.slice(2));
  const { posts: files, drafts } = publishedPosts(opts);
  for (const f of drafts) console.log(`${path.dirname(f)}/: draft, skipped`);
  let bad = 0;
  for (const f of files) {
    const p = featuredProblem(path.dirname(path.resolve(opts.root, f)));
    if (p) {
      bad++;
      console.log(`${path.dirname(f)}/: ${p}`);
    }
  }
  if (bad) {
    console.log(`❌ featured image: ${bad} of ${files.length} post(s) lack a featured image with its source`);
    process.exit(1);
  }
  console.log(`✔ featured image: ${files.length} post(s) checked, each has featured.* and its source`);
}

if (require.main === module) main();

module.exports = { featuredProblem };
