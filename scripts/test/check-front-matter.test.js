'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'check-front-matter.js');
const FIX = path.join(__dirname, 'fixtures', 'posts');
const { dateProblem } = require(SCRIPT);

function run(...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout + r.stderr };
}

test('a valid post passes', () => {
  const r = run(path.join(FIX, 'valid', 'index.md'));
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /✔ front matter: 1 posts checked/);
});

test('a post without summary fails and is named', () => {
  const r = run(path.join(FIX, 'missing-summary', 'index.md'));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /missing-summary\/index\.md: missing summary/);
});

test('a post whose date does not parse fails', () => {
  const r = run(path.join(FIX, 'bad-date', 'index.md'));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /bad-date\/index\.md: date "next tuesday" is not a YAML timestamp/);
});

test('dates are accepted the way Hugo reads them (YAML timestamp)', () => {
  for (const ok of ['2022-03-18', '2022-03-18T00:09:04.225Z', '2024-01-1T00:09:04.225Z', '2022-03-18T10:00:00+02:00']) {
    assert.equal(dateProblem(ok), null, ok);
  }
  for (const bad of ['2024-13-01', '2024-02-30', '18.03.2022', 'yesterday', '2022-03-18T25:00:00Z']) {
    assert.notEqual(dateProblem(bad), null, bad);
  }
});
