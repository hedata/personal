'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { tempRepo } = require('./temp-repo');

const SCRIPT = path.join(__dirname, '..', 'check-links.js');
const FIX = path.join(__dirname, 'fixtures', 'posts');
const { findUrls, githubRepo, checkFile, parseList } = require(SCRIPT);

// Asynchronous on purpose: the local server below lives in this process and
// could not answer curl while a spawnSync blocked the event loop.
function run(...args) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [SCRIPT, ...args]);
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('close', (status) => resolve({ status, out }));
  });
}

// A fetch double: the status is read off the URL's path; nothing goes out.
function fakeFetch(url) {
  if (/zorble-private/.test(url)) return Promise.resolve({ code: '404' });
  if (/\/gone\b/.test(url)) return Promise.resolve({ code: '404' });
  if (/\/down\b/.test(url)) return Promise.resolve({ code: '000', error: 'curl: (7) Failed to connect' });
  return Promise.resolve({ code: '200' });
}
const ctx = () => ({ publicRepos: ['personal'], fetch: fakeFetch, cache: new Map() });

test('every http(s) URL is found with its line; sentence and markdown punctuation is not part of it', () => {
  const text = [
    'see https://example.org/a, then (https://example.org/b).',
    'a [link](https://example.org/c) and [one with parens](https://example.org/w_(x)) here',
    'plain text, no link',
    '<https://example.org/d> and `https://example.org/e`',
  ].join('\n');
  assert.deepEqual(findUrls(text), [
    { line: 1, url: 'https://example.org/a' },
    { line: 1, url: 'https://example.org/b' },
    { line: 2, url: 'https://example.org/c' },
    { line: 2, url: 'https://example.org/w_(x)' },
    { line: 4, url: 'https://example.org/d' },
    { line: 4, url: 'https://example.org/e' },
  ]);
});

test('a GitHub URL into hedata/<repo> names the repo; anything else does not', () => {
  assert.equal(githubRepo('https://github.com/hedata/personal/pull/2'), 'personal');
  assert.equal(githubRepo('https://GitHub.com/HEDATA/Zorble-Private'), 'Zorble-Private');
  assert.equal(githubRepo('https://raw.githubusercontent.com/hedata/zorble-private/main/x.md'), 'zorble-private');
  assert.equal(githubRepo('https://github.com/hedata'), null);
  assert.equal(githubRepo('https://github.com/someone-else/personal'), null);
  assert.equal(githubRepo('https://example.org/hedata/personal'), null);
});

test('the committed allowlist holds personal and nothing private', () => {
  const list = parseList(fs.readFileSync(path.join(__dirname, '..', 'public-repos.txt'), 'utf8'));
  assert.deepEqual(list, ['personal']);
});

test('a link into a repo not on the allowlist fails even when the fetch answers 200', async () => {
  const hits = await checkFile('p.md', 'x https://github.com/hedata/zorble-private/pull/1 y', {
    ...ctx(),
    fetch: () => Promise.resolve({ code: '200' }),
  });
  assert.deepEqual(hits, [
    { file: 'p.md', line: 1, url: 'https://github.com/hedata/zorble-private/pull/1', reason: 'hedata/zorble-private is not in scripts/public-repos.txt' },
  ]);
});

test('the links-private fixture: the public and the allowed links pass, the private ones fail with both reasons', async () => {
  const file = path.join(FIX, 'links-private', 'index.md');
  const hits = await checkFile(file, fs.readFileSync(file, 'utf8'), ctx());
  assert.deepEqual(hits, [
    { file, line: 17, url: 'https://github.com/hedata/zorble-private/issues/3', reason: 'hedata/zorble-private is not in scripts/public-repos.txt; HTTP 404' },
    { file, line: 18, url: 'https://raw.githubusercontent.com/hedata/zorble-private/main/README.md', reason: 'hedata/zorble-private is not in scripts/public-repos.txt; HTTP 404' },
  ]);
});

test('the same URL is fetched once however often it appears; hits come in document order', async () => {
  let calls = 0;
  const c = { ...ctx(), fetch: (u) => (calls++, fakeFetch(u)) };
  const hits = await checkFile('p.md', 'https://example.org/gone\nhttps://example.org/gone\nhttps://example.org/down', c);
  assert.equal(calls, 2);
  assert.deepEqual(hits.map((h) => [h.line, h.reason]), [
    [1, 'HTTP 404'],
    [2, 'HTTP 404'],
    [3, 'unreachable (curl: (7) Failed to connect)'],
  ]);
});

// A local server stands in for the public web: real curl, real redirects,
// real connection errors — but nothing leaves the machine.
function localServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/ok') return res.writeHead(200).end('fine');
    if (req.url === '/moved') return res.writeHead(302, { Location: '/ok' }).end();
    res.writeHead(404).end('nope');
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

test('CLI: a post whose links all answer 2xx (after redirects) passes', async () => {
  const { server, base } = await localServer();
  try {
    const repo = tempRepo('check-links', path.join(FIX, 'valid'));
    repo.write('content/post/p/index.md', `---\ntitle: t\n---\n[a](${base}/ok) and [b](${base}/moved)\n`);
    repo.commit('post');
    const r = await run('--root', repo.root, '--base', 'master');
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /1 public repo\(s\) listed, 1 post\(s\) to check/);
    assert.match(r.out, /✔ public links: 2 link\(s\) in 1 post\(s\) all answer 2xx anonymously/);
  } finally {
    server.close();
  }
});

test('CLI: a 404 and a connection refused fail with file, line and URL; the old post on master is not checked', async () => {
  const { server, base } = await localServer();
  const closed = await localServer();
  await new Promise((resolve) => closed.server.close(resolve));
  try {
    const repo = tempRepo('check-links', path.join(FIX, 'valid'));
    repo.write(
      'content/post/old-post/index.md',
      fs.readFileSync(path.join(FIX, 'valid', 'index.md'), 'utf8') + `\nold link ${base}/gone\n`,
    );
    repo.git('checkout', '-q', 'master');
    repo.commit('old post links somewhere dead');
    repo.git('checkout', '-q', 'topic');
    repo.write('content/post/p/index.md', `---\ntitle: t\n---\nfine: ${base}/ok\n\ndead: ${base}/gone and ${closed.base}/ok\n`);
    repo.commit('post');
    const r = await run('--root', repo.root, '--base', 'master');
    assert.equal(r.status, 1, r.out);
    const lines = r.out.split('\n');
    assert.equal(lines[1], `content/post/p/index.md:6: ${base}/gone → HTTP 404`, r.out);
    assert.match(lines[2], new RegExp(`^content/post/p/index\\.md:6: ${closed.base}/ok → unreachable \\(curl: \\(7\\) `), r.out);
    assert.match(r.out, /❌ public links: 2 of 3 link\(s\) not public in 1 file\(s\)/);
    assert.doesNotMatch(r.out, /old-post/);
  } finally {
    server.close();
  }
});

test('CLI: FILE... mode checks exactly those files', async () => {
  const { server, base } = await localServer();
  try {
    const repo = tempRepo('check-links', path.join(FIX, 'valid'));
    repo.write('a.md', `${base}/ok`);
    repo.write('b.md', `${base}/gone`);
    const r = await run('--root', repo.root, 'a.md', 'b.md');
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /^b\.md:1: .*\/gone → HTTP 404$/m);
    assert.doesNotMatch(r.out, /^a\.md/m);
  } finally {
    server.close();
  }
});
