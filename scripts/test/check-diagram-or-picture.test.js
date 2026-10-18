'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { tempRepo } = require('./temp-repo');

const SCRIPT = path.join(__dirname, '..', 'check-diagram-or-picture.js');
const FIX = path.join(__dirname, 'fixtures', 'posts');
const { hasDiagramOrPicture } = require(SCRIPT);

function run(...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout + r.stderr };
}

test('a Mermaid fence, a markdown image, an <img> or a figure shortcode counts; prose does not', () => {
  const fm = '---\ntitle: t\n---\n';
  for (const ok of [
    '```mermaid\nflowchart LR\n  a --> b\n```',
    '~~~mermaid\ngraph TD\n~~~',
    '  ```mermaid {class="x"}\n```',
    '![a box](box.png)',
    '<img src="box.png" alt="a box">',
    '{{< figure src="box.png" >}}',
    '{{% gallery %}}',
  ]) {
    assert.equal(hasDiagramOrPicture(fm + ok), true, ok);
  }
  for (const bad of [
    'the word mermaid in prose',
    '```bash\nmermaid render x\n```',
    'a plain [link](x) is not a picture',
    'image: featured.png in the front matter only',
  ]) {
    assert.equal(hasDiagramOrPicture(fm + bad), false, bad);
  }
  assert.equal(hasDiagramOrPicture('---\ntitle: t\nimage:\n  filename: featured.png\n---\nwords'), false, 'front matter does not count');
});

test('the visual-ok fixture passes, the no-visual fixture fails with "post has no diagram or picture"', () => {
  let r = run(path.join(FIX, 'visual-ok', 'index.md'));
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /✔ diagram or picture: 1 post\(s\) checked/);

  r = run(path.join(FIX, 'no-visual', 'index.md'));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /no-visual\/index\.md: post has no diagram or picture/);
  assert.match(r.out, /❌ diagram or picture: 1 of 1 post\(s\) have none/);
});

test('--base checks the posts the branch touched, not the old one on master', () => {
  const repo = tempRepo('diagram-or-picture', path.join(FIX, 'no-visual'));
  repo.put('content/post/drawn/index.md', path.join(FIX, 'visual-ok', 'index.md'));
  repo.commit('a drawn post');
  let r = run('--root', repo.root, '--base', 'master');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /1 post\(s\) checked/);

  repo.put('content/post/words/index.md', path.join(FIX, 'no-visual', 'index.md'));
  repo.commit('a post of words');
  r = run('--root', repo.root, '--base', 'master');
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^content\/post\/words\/index\.md: post has no diagram or picture/m);
  assert.doesNotMatch(r.out, /old-post/);

  const [before, after] = [repo.git('rev-parse', 'HEAD~1'), repo.git('rev-parse', 'HEAD')];
  r = run('--root', repo.root, '--range', `${before}..${after}`);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /1 of 1 post\(s\) have none/);
});

test('nothing under content/post changed → green', () => {
  const repo = tempRepo('diagram-or-picture', path.join(FIX, 'no-visual'));
  repo.write('README.md', 'not a post\n');
  repo.commit('readme');
  const r = run('--root', repo.root, '--base', 'master');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /0 post\(s\) checked/);
});
