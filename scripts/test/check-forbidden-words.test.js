'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'check-forbidden-words.js');
const FIX = path.join(__dirname, 'fixtures', 'posts');

function run(args, env = {}) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, POST_FORBIDDEN_WORDS: undefined, ...env },
  });
  return { status: r.status, out: r.stdout + r.stderr };
}

test('a clean post passes with the private list unset', () => {
  const r = run([path.join(FIX, 'valid', 'index.md')]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /private list unset/);
  assert.match(r.out, /✔ forbidden words: no hits in 1 file/);
});

test('a post that says "ben" fails and names file, line and word', () => {
  const file = path.join(FIX, 'mentions-ben', 'index.md');
  const r = run([file]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, new RegExp(`${file}:9: forbidden word "Ben"`));
  assert.match(r.out, new RegExp(`${file}:9: forbidden word "hedata/ben"`));
  assert.match(r.out, new RegExp(`${file}:10: forbidden word "ben-agent"`));
  assert.match(r.out, new RegExp(`${file}:10: forbidden word "ben_agent"`));
  assert.doesNotMatch(r.out, /index\.md:8:/, 'Benjamin and hyphen are not whole-word hits');
});

test('e-mail addresses, private hostnames and IPs are hits; a version number is not', () => {
  const r = run([path.join(FIX, 'email-host', 'index.md')]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /index\.md:8: forbidden word "someone@example\.org"/);
  assert.match(r.out, /index\.md:8: forbidden word "nas\.internal"/);
  assert.match(r.out, /index\.md:9: forbidden word "10\.0\.0\.1"/);
  assert.doesNotMatch(r.out, /0\.81\.0/);
});

test('a private-list hit names file and line but never the word', () => {
  const file = path.join(FIX, 'private-hit', 'index.md');
  const r = run([file], { POST_FORBIDDEN_WORDS: '# names\nzorbleflux\n\nquuxwump\n' });
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /private list 2 entries/);
  assert.match(r.out, new RegExp(`${file}:8: forbidden word \\(private list\\)`));
  assert.doesNotMatch(r.out, /zorbleflux|quuxwump/i);
});

test('an empty private list is the same as none', () => {
  const r = run([path.join(FIX, 'private-hit', 'index.md')], { POST_FORBIDDEN_WORDS: '' });
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /private list 0 entries/);
});

// A throw-away repository: master holds an old post that says "ben" (like the
// two 2024 posts); a branch adds new posts. Only the branch's files are checked.
function tempRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'forbidden-words-'));
  const git = (...a) =>
    execFileSync('git', ['-C', root, ...a], {
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t',
      },
    }).trim();
  const put = (rel, from) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.copyFileSync(from, path.join(root, rel));
  };
  git('init', '-q', '-b', 'master');
  put('content/post/old-mention/index.md', path.join(FIX, 'mentions-ben', 'index.md'));
  git('add', '.');
  git('commit', '-q', '-m', 'old post');
  git('checkout', '-q', '-b', 'topic');
  return { root, git, put };
}

test('--base checks only files the branch added or changed; the old post is not flagged', () => {
  const { root, git, put } = tempRepo();
  put('content/post/new-clean/index.md', path.join(FIX, 'valid', 'index.md'));
  git('add', '.');
  git('commit', '-q', '-m', 'clean post');
  let r = run(['--root', root, '--base', 'master']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /1 file\(s\) to check/);

  put('content/post/new-mention/index.md', path.join(FIX, 'mentions-ben', 'index.md'));
  git('add', '.');
  git('commit', '-q', '-m', 'post that names the project');
  r = run(['--root', root, '--base', 'master']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /content\/post\/new-mention\/index\.md:9: forbidden word "Ben"/);
  assert.doesNotMatch(r.out, /old-mention/);

  const [before, after] = [git('rev-parse', 'HEAD~1'), git('rev-parse', 'HEAD')];
  r = run(['--root', root, '--range', `${before}..${after}`]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /1 file\(s\) to check/);
  assert.match(r.out, /new-mention\/index\.md:9/);

  r = run(['--root', root, '--range', `${'0'.repeat(40)}..${git('rev-parse', 'HEAD~1')}`]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /new-clean|1 file\(s\) to check/);
});

test('nothing under content/ changed → green', () => {
  const { root, git } = tempRepo();
  fs.writeFileSync(path.join(root, 'README.md'), 'ben is a word, but this is not under content/\n');
  git('add', '.');
  git('commit', '-q', '-m', 'readme');
  const r = run(['--root', root, '--base', 'master']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /0 file\(s\) to check/);
});
