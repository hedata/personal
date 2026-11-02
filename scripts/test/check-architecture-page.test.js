'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'check-architecture-page.js');
const REPO = path.join(__dirname, '..', '..');
const PAGE = path.join(REPO, 'docs', 'architecture.md');
const { SECTIONS, THEME_LINE, sections, shapeProblems } = require(SCRIPT);

function run(...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout + r.stderr };
}

// A throw-away repo root holding only docs/ with the given pages.
function tempDocs(pages) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'arch-page-'));
  for (const [rel, text] of Object.entries(pages)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  }
  return root;
}

const text = () => fs.readFileSync(PAGE, 'utf8');
const withoutHeading = (t, name) => t.replace(`## ${name}\n`, `### ${name}\n`);
const stripMermaid = (t, name) => {
  const body = sections(t)[name];
  return t.replace(body, body.replace(/^```mermaid\n[\s\S]*?^```/gm, ''));
};

test("the repo's page has arc42's shape and the check passes on the tree", () => {
  assert.deepEqual(shapeProblems(text()), []);
  const r = run('--root', REPO);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /✔ architecture page/);
});

// The check is not one that cannot fail: each part removed is caught.
const MUTATIONS = [
  ['the last heading demoted', (t) => withoutHeading(t, SECTIONS[11]), '## headings'],
  ['the first heading demoted', (t) => withoutHeading(t, SECTIONS[0]), '## headings'],
  ['a heading renamed', (t) => t.replace(`## ${SECTIONS[3]}`, '## 4. Strategy'), '## headings'],
  ['two headings swapped', (t) => t.replace(`## ${SECTIONS[5]}`, '## @@').replace(`## ${SECTIONS[6]}`, `## ${SECTIONS[5]}`).replace('## @@', `## ${SECTIONS[6]}`), '## headings'],
  ['no stage line', (t) => t.replace('\nStage: production\n', '\n'), 'stage line'],
  ['an unknown stage', (t) => t.replace('\nStage: production\n', '\nStage: beta\n'), 'stage line'],
  ['no Mermaid in section 3', (t) => stripMermaid(t, SECTIONS[2]), '3. Context and Scope'],
  ['no Mermaid in section 5', (t) => stripMermaid(t, SECTIONS[4]), '5. Building Block View'],
  ['a block without the theme line', (t) => t.replace(THEME_LINE, '%%{init: {}}%%', 1), 'theme line'],
];
for (const [name, mutate, expected] of MUTATIONS) {
  test(`the check fails: ${name}`, () => {
    const problems = shapeProblems(mutate(text()));
    assert.ok(problems.some((p) => p.includes(expected)), JSON.stringify(problems));
  });
}

test('a missing page fails', () => {
  const r = run('--root', tempDocs({ 'README.md': 'x' }));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /docs\/architecture\.md: missing/);
});

test('a relative link to a missing file fails, on any page under docs/', () => {
  const root = tempDocs({
    'docs/architecture.md': text().replace(/\]\(\.\.\/[^)]+\)/g, '](#)'),
    'docs/features/one.md': '[up](../architecture.md) [missing](../missing.md) [web](https://example.org/x) [anchor](#a)\n',
  });
  fs.appendFileSync(path.join(root, 'docs', 'architecture.md'), '[gone](../nowhere.md) [ok](features/one.md#top)\n');
  const r = run('--root', root);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /docs\/architecture\.md: \.\.\/nowhere\.md: relative link/);
  assert.match(r.out, /docs\/features\/one\.md: \.\.\/missing\.md: relative link/);
  assert.doesNotMatch(r.out, /features\/one\.md#top|example\.org|\(#a\)|architecture\.md: \.\.\/architecture/);
  assert.match(r.out, /❌ architecture page: 2 problem\(s\)/);
});
