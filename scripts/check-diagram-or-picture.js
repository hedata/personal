#!/usr/bin/env node
'use strict';
// Diagram-or-picture gate for posts (personal issue 7, EPU ADR-003).
//
// Every post this pull request adds or changes must show at least one
// diagram or picture in its body: a ```mermaid block, a markdown image
// (`![alt](…)`), an `<img>` tag, or a figure / image / gallery / diagram
// shortcode. Otherwise: "post has no diagram or picture". Posts with
// `draft: true` are skipped — not published, so no picture yet (personal issue 25).
//
//   node scripts/check-diagram-or-picture.js --base origin/master   # PR: posts changed since the merge-base
//   node scripts/check-diagram-or-picture.js --range BEFORE..AFTER   # push: posts changed by the pushed commits
//   node scripts/check-diagram-or-picture.js FILE...                 # exactly these files (tests)
// Option: --root DIR (git root, default cwd). Exit 1 when a post has none.

const fs = require('node:fs');
const path = require('node:path');
const { parseSelection, publishedPosts, body, hasMermaid } = require('./lib/posts');

const IMAGE_RE = /!\[|<img\b|\{\{[<%]\s*(?:figure|image|gallery|diagram)\b/;

function hasDiagramOrPicture(text) {
  return hasMermaid(text) || IMAGE_RE.test(body(text));
}

function main() {
  const opts = parseSelection(process.argv.slice(2));
  const { posts: files, drafts } = publishedPosts(opts);
  for (const f of drafts) console.log(`${f}: draft, skipped`);
  const bad = files.filter((f) => !hasDiagramOrPicture(fs.readFileSync(path.resolve(opts.root, f), 'utf8')));
  for (const f of bad) {
    console.log(`${f}: post has no diagram or picture (no \`\`\`mermaid block, ![image](…), <img> or {{< figure >}} shortcode)`);
  }
  if (bad.length) {
    console.log(`❌ diagram or picture: ${bad.length} of ${files.length} post(s) have none`);
    process.exit(1);
  }
  console.log(`✔ diagram or picture: ${files.length} post(s) checked, each has at least one`);
}

if (require.main === module) main();

module.exports = { hasDiagramOrPicture };
