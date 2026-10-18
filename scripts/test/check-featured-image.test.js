'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { tempRepo } = require('./temp-repo');

const SCRIPT = path.join(__dirname, '..', 'check-featured-image.js');
const FIX = path.join(__dirname, 'fixtures', 'posts');
const { featuredProblem } = require(SCRIPT);

function run(...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout + r.stderr };
}

test('featured.svg + featured.mmd passes; featured.png alone and no featured.* fail with "featured image without source"', () => {
  assert.equal(featuredProblem(path.join(FIX, 'visual-ok')), null);
  assert.equal(
    featuredProblem(path.join(FIX, 'featured-no-source')),
    'featured image without source: featured.png has no featured.mmd, featured.svg, featured.source.md next to it',
  );
  assert.equal(
    featuredProblem(path.join(FIX, 'no-visual')),
    'featured image without source: no featured.png/jpg/jpeg/webp/svg/gif in the post folder',
  );
});

test('each accepted source counts; an empty source file does not', () => {
  const repo = tempRepo('featured-image', path.join(FIX, 'valid'));
  const dir = path.join(repo.root, 'content/post/p');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'featured.webp'), 'not really webp, the gate checks presence');
  assert.match(featuredProblem(dir), /featured\.webp has no featured\.mmd/);
  fs.writeFileSync(path.join(dir, 'featured.source.md'), '');
  assert.match(featuredProblem(dir), /without source/, 'an empty source is no source');
  fs.writeFileSync(path.join(dir, 'featured.source.md'), 'Made in the design project "glorp loop", brief: four boxes in a ring.\n');
  assert.equal(featuredProblem(dir), null);
  fs.unlinkSync(path.join(dir, 'featured.source.md'));
  fs.writeFileSync(path.join(dir, 'featured.mmd'), 'flowchart LR\n  a --> b\n');
  assert.equal(featuredProblem(dir), null);
  fs.unlinkSync(path.join(dir, 'featured.webp'));
  fs.unlinkSync(path.join(dir, 'featured.mmd'));
  assert.match(featuredProblem(dir), /no featured\./);
  fs.writeFileSync(path.join(dir, 'featured.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  assert.equal(featuredProblem(dir), null, 'featured.svg is both the picture and its source');
});

test('CLI: the fixture folders, named by their index.md', () => {
  let r = run(path.join(FIX, 'visual-ok', 'index.md'));
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /✔ featured image: 1 post\(s\) checked, each has featured\.\* and its source/);

  r = run(path.join(FIX, 'featured-no-source', 'index.md'), path.join(FIX, 'no-visual', 'index.md'));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /featured-no-source\/: featured image without source: featured\.png has no/);
  assert.match(r.out, /no-visual\/: featured image without source: no featured\./);
  assert.match(r.out, /❌ featured image: 2 of 2 post\(s\) lack a featured image with its source/);
});

test('--base checks the post folders the branch touched (any file in them), not the old post on master', () => {
  const repo = tempRepo('featured-image', path.join(FIX, 'featured-no-source'));
  repo.put('content/post/drawn', path.join(FIX, 'visual-ok'));
  repo.commit('a post with featured.svg and featured.mmd');
  let r = run('--root', repo.root, '--base', 'master');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /1 post\(s\) checked/);

  repo.put('content/post/picture-only', path.join(FIX, 'featured-no-source'));
  repo.commit('a post with a picture and no source');
  r = run('--root', repo.root, '--base', 'master');
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^content\/post\/picture-only\/: featured image without source/m);
  assert.doesNotMatch(r.out, /old-post/);

  // Touching only the picture of an old post brings that post under the gate.
  fs.writeFileSync(path.join(repo.root, 'content/post/old-post/featured.png'), 'new bytes');
  repo.commit('new picture for the old post');
  r = run('--root', repo.root, '--base', 'master');
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^content\/post\/old-post\/: featured image without source/m);
});
