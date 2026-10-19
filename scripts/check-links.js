#!/usr/bin/env node
'use strict';
// Public-links gate for posts (personal issue 7, EPU ADR-002).
//
// Every http(s) URL in a post this pull request adds or changes is fetched
// anonymously — plain curl, no token, redirects followed, 15 s timeout —
// and anything but a 2xx fails with file, line and URL. A GitHub URL into
// hedata/<repo> is also checked against the committed allowlist of public
// repositories, scripts/public-repos.txt (one name per line), so a private
// repo fails even where a cached 404 page would not.
//
//   node scripts/check-links.js --base origin/master   # PR: posts changed since the merge-base
//   node scripts/check-links.js --range BEFORE..AFTER   # push: posts changed by the pushed commits
//   node scripts/check-links.js FILE...                 # exactly these files (tests)
// Options: --root DIR (git root, default cwd), --list FILE (default scripts/public-repos.txt).
//
// Exit 1 on any URL that is not public.

const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { parseSelection, selectedPosts } = require('./lib/posts');

const OWNER = 'hedata'; // the GitHub account whose private repos must not be linked
const TIMEOUT_S = 15;
const CONCURRENCY = 4;
const URL_RE = /https?:\/\/[^\s<>"'`]+/g;
const GITHUB_RE = new RegExp(`^https?://(?:www\\.)?(?:github\\.com|raw\\.githubusercontent\\.com)/${OWNER}/([^/?#]+)`, 'i');

function parseList(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

// Trailing punctuation that belongs to the sentence or the markdown link, not
// the URL; a `)` is kept while the URL has an unmatched `(` (Wikipedia style).
function trimUrl(raw) {
  let url = raw;
  for (;;) {
    const before = url;
    url = url.replace(/[.,;:!?]+$/, '');
    while (url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length) {
      url = url.slice(0, -1);
    }
    if (url === before) return url;
  }
}

// Every http(s) URL with its 1-based line.
function findUrls(text) {
  const found = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(URL_RE)) {
      const url = trimUrl(m[0]);
      if (url) found.push({ line: i + 1, url });
    }
  });
  return found;
}

// The repo name when the URL points into github.com/<OWNER>/<repo>, else null.
function githubRepo(url) {
  const m = GITHUB_RE.exec(url);
  return m ? m[1].replace(/\.git$/, '') : null;
}

// Anonymous fetch with curl: -q ignores any ~/.curlrc, no credentials, no
// token. Resolves to { code } (3-digit HTTP status, '000' when nothing was
// received) plus `error` (curl's message) when curl itself failed.
async function fetchStatus(url) {
  const args = ['-q', '-sS', '-o', '/dev/null', '-w', '%{http_code}', '-L', '--max-time', String(TIMEOUT_S), '--', url];
  try {
    const { stdout } = await promisify(execFile)('curl', args, { encoding: 'utf8' });
    return { code: stdout.trim() };
  } catch (e) {
    return { code: (e.stdout || '').trim() || '000', error: (e.stderr || e.message).trim().split('\n')[0] };
  }
}

// Why a URL is not public, or null. `fetch` is fetchStatus or a test double;
// `cache` dedupes fetches of the same URL across files and lines.
async function problem(url, { publicRepos, fetch, cache }) {
  const reasons = [];
  const repo = githubRepo(url);
  if (repo !== null && !publicRepos.some((r) => r.toLowerCase() === repo.toLowerCase())) {
    reasons.push(`${OWNER}/${repo} is not in scripts/public-repos.txt`);
  }
  if (!cache.has(url)) cache.set(url, fetch(url));
  const { code, error } = await cache.get(url);
  if (!/^2\d\d$/.test(code)) reasons.push(error ? `unreachable (${error})` : `HTTP ${code}`);
  return reasons.length ? reasons.join('; ') : null;
}

// Returns [{file, line, url, reason}] for the URLs in `text` that are not public.
async function checkFile(file, text, ctx) {
  const urls = findUrls(text);
  const hits = [];
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const i = next++;
      const { line, url } = urls[i];
      const reason = await problem(url, ctx);
      if (reason) hits.push({ i, file, line, url, reason });
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
  return hits.sort((a, b) => a.i - b.i).map(({ i, ...h }) => h); // document order
}

async function main() {
  const opts = parseSelection(process.argv.slice(2), { '--list': 'list' });
  const list = path.resolve(opts.list || path.join(__dirname, 'public-repos.txt'));
  const publicRepos = parseList(fs.readFileSync(list, 'utf8'));
  const files = selectedPosts(opts);
  console.log(`public links: ${publicRepos.length} public repo(s) listed, ${files.length} post(s) to check`);

  const ctx = { publicRepos, fetch: fetchStatus, cache: new Map() };
  const hits = [];
  let urls = 0;
  for (const file of files) {
    const text = fs.readFileSync(path.resolve(opts.root, file), 'utf8');
    urls += findUrls(text).length;
    hits.push(...(await checkFile(file, text, ctx)));
  }
  for (const h of hits) console.log(`${h.file}:${h.line}: ${h.url} → ${h.reason}`);
  if (hits.length) {
    console.log(`❌ public links: ${hits.length} of ${urls} link(s) not public in ${new Set(hits.map((h) => h.file)).size} file(s)`);
    process.exit(1);
  }
  console.log(`✔ public links: ${urls} link(s) in ${files.length} post(s) all answer 2xx anonymously`);
}

if (require.main === module) {
  main().catch((e) => {
    console.log(`❌ public links: ${e.message}`);
    process.exit(2);
  });
}

module.exports = { findUrls, githubRepo, fetchStatus, problem, checkFile, parseList };
