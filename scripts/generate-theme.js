#!/usr/bin/env node
'use strict';
// Theme generator: the Wowchemy theme, font set and the token part of
// custom.scss from the hedata-epu design tokens (personal issue 11, EPU
// ADR-001 — consumers derive, never fork). No dependencies, node >= 18.
//
//   node scripts/generate-theme.js design/tokens.json           # write the files
//   node scripts/generate-theme.js --check design/tokens.json   # CI: exit 1 if a file on disk differs
//   node scripts/generate-theme.js --root DIR TOKENS            # site root (default: cwd)
//
// Writes, each starting with a comment naming the tokens file and its version:
//   data/themes/hedata-epu.toml   colours — the keys Wowchemy's
//                                 layouts/partials/functions/parse_theme.html reads
//                                 (wowchemy-hugo-modules at the commit go.mod pins,
//                                 1475a49114f4; format as its data/themes/minimal.toml)
//   data/fonts/hedata-epu.toml    type — as data/fonts/minimal.toml there. Wowchemy's
//                                 main.scss wraps each family in quotes and adds the
//                                 generic family itself ("Roboto", sans-serif), so the
//                                 TOML carries the first family of the token stack, bare
//   assets/scss/custom.scss       everything the TOML has no key for, as CSS custom
//                                 properties named after the tokens (--color-*, --font-*,
//                                 --space-*, --radius-*, --chart-*) on :root and body.dark —
//                                 only the block between the BEGIN/END markers; what is
//                                 outside stays
//
// Never edit the generated files; change the tokens, re-run, commit.

const fs = require('node:fs');
const path = require('node:path');

const OUT = {
  theme: path.join('data', 'themes', 'hedata-epu.toml'),
  fonts: path.join('data', 'fonts', 'hedata-epu.toml'),
  scss: path.join('assets', 'scss', 'custom.scss'),
};
const SCRIPT = 'scripts/generate-theme.js';
const BEGIN = '// --- hedata-epu tokens: generated block, begin ---';
const END = '// --- hedata-epu tokens: generated block, end ---';

// Theme TOML key → token path (dotted), per Wowchemy's parse_theme.html.
// The light keys follow the design skill's references/hugo-wowchemy.md; the
// dark keys are the ones parse_theme.html reads under [dark] for which the
// tokens hold the value Wowchemy expects. Not set, so Wowchemy's defaults
// apply: dark menu_text_active (no token) and dark menu_text — Wowchemy
// composes it as rgba(menu_text, .85) and the token color.dark.nav_text is
// already that composite flattened on the navbar (white at .85), so passing
// it would darken the nav links twice.
const THEME_LIGHT = [
  ['primary', 'color.light.accent'],
  ['menu_primary', 'color.light.nav_bg'],
  ['menu_text', 'color.light.nav_text'],
  ['menu_text_active', 'color.light.accent_alt'],
  ['menu_title', 'color.light.nav_title'],
  ['background', 'color.light.bg'],
  ['home_section_odd', 'color.light.bg'],
  ['home_section_even', 'color.light.bg_alt'],
];
const THEME_DARK = [
  ['link', 'color.dark.accent'],
  ['link_hover', 'color.dark.accent_hover'],
  ['background', 'color.dark.bg'],
  ['home_section_odd', 'color.dark.bg_alt'],
  ['home_section_even', 'color.dark.bg'],
  ['menu_primary', 'color.dark.nav_bg'],
  ['menu_title', 'color.dark.nav_title'],
];
const FONTS = [
  ['google_fonts', 'type.family.google_fonts', false],
  ['heading_font', 'type.family.heading', true],
  ['body_font', 'type.family.body', true],
  ['nav_font', 'type.family.nav', true],
  ['mono_font', 'type.family.mono', true],
];
const COLOR_KEYS = [
  'bg', 'bg_alt', 'card', 'text', 'heading', 'muted', 'border',
  'accent', 'accent_hover', 'accent_alt', 'nav_bg', 'nav_text', 'nav_title', 'code',
];

function parseArgs(argv) {
  const opts = { root: process.cwd(), check: false, tokens: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opts.root = path.resolve(argv[++i]);
    else if (a === '--check') opts.check = true;
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else if (opts.tokens) throw new Error(`one tokens file only, got ${opts.tokens} and ${a}`);
    else opts.tokens = path.resolve(a);
  }
  if (!opts.tokens) throw new Error('usage: generate-theme.js [--check] [--root DIR] TOKENS.json');
  return opts;
}

// A token is `{ "value": …, "_from": … }` or a bare value; both read the same.
function unwrap(x) {
  return x && typeof x === 'object' && !Array.isArray(x) && 'value' in x ? x.value : x;
}

// The value at a dotted path; a missing one is an error naming the path.
function get(tokens, dotted) {
  let cur = tokens;
  for (const key of dotted.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(key in cur)) {
      throw new Error(`tokens have no ${dotted}`);
    }
    cur = cur[key];
  }
  const v = unwrap(cur);
  if (v === undefined || v === null || v === '') throw new Error(`tokens have no ${dotted}`);
  return v;
}

// "'Roboto Mono', monospace" → Roboto Mono: the first family of a stack, unquoted.
function firstFamily(stack) {
  return String(stack).split(',')[0].trim().replace(/^(["'])(.*)\1$/, '$2');
}

function tomlString(v) {
  return JSON.stringify(String(v));
}

// How the file names its source: the tokens path (repo-relative when inside
// the root), the tokens' name and version.
function headerLines(opts, tokens) {
  const rel = path.relative(opts.root, opts.tokens);
  const shown = rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? rel.split(path.sep).join('/') : opts.tokens;
  const name = get(tokens, 'name');
  const version = get(tokens, 'version');
  return [
    `Generated by ${SCRIPT} from ${shown} — ${name} design tokens, version ${version}.`,
    `Never edit by hand: change the tokens and re-run \`node ${SCRIPT} ${shown}\`.`,
  ];
}

function themeToml(tokens, header) {
  const lines = header.map((l) => `# ${l}`);
  lines.push('', '# Theme metadata', `name = ${tomlString(get(tokens, 'name'))}`, '', '# Is theme light or dark?', 'light = true', '');
  for (const [key, from] of THEME_LIGHT) lines.push(`# ${from}`, `${key} = ${tomlString(get(tokens, from))}`);
  lines.push('', '[dark]');
  for (const [key, from] of THEME_DARK) lines.push(`  # ${from}`, `  ${key} = ${tomlString(get(tokens, from))}`);
  return lines.join('\n') + '\n';
}

function fontsToml(tokens, header) {
  const lines = header.map((l) => `# ${l}`);
  lines.push(
    '# Wowchemy quotes each family and appends the generic family itself (main.scss,',
    '# _base.scss), so every *_font is the first family of the token stack, bare.',
    '',
    '# Font style metadata',
    `name = ${tomlString(get(tokens, 'name'))}`,
    '',
  );
  for (const [key, from, family] of FONTS) {
    const v = get(tokens, from);
    lines.push(`# ${from}`, `${key} = ${tomlString(family ? firstFamily(v) : v)}`);
  }
  return lines.join('\n') + '\n';
}

function cssVars(entries) {
  return entries.map(([name, value]) => `  --${name}: ${value};`);
}

function colorVars(tokens, mode) {
  return cssVars(COLOR_KEYS.map((k) => [`color-${k.replace(/_/g, '-')}`, get(tokens, `color.${mode}.${k}`)]));
}

function chartVars(tokens, mode) {
  const cat = get(tokens, `chart.categorical.${mode}`);
  if (!Array.isArray(cat)) throw new Error(`tokens have no chart.categorical.${mode} list`);
  return cssVars(cat.map((c, i) => [`chart-${i + 1}`, c]));
}

function scssBlock(tokens, header) {
  const fam = get(tokens, 'type.family');
  const lines = [BEGIN, ...header.map((l) => `// ${l}`), ''];
  lines.push(':root {');
  lines.push('  // color.light');
  lines.push(...colorVars(tokens, 'light'));
  lines.push('  // type');
  lines.push(
    ...cssVars([
      ['font-heading', get(fam, 'heading')],
      ['font-body', get(fam, 'body')],
      ['font-nav', get(fam, 'nav')],
      ['font-mono', get(fam, 'mono')],
      ['font-fallback-sans', get(fam, 'fallback_sans')],
      ['font-weight-regular', get(tokens, 'type.weight.regular')],
      ['font-weight-bold', get(tokens, 'type.weight.bold')],
      ['font-weight-heading', get(tokens, 'type.weight.heading')],
      ['font-root-size', get(tokens, 'type.root_size')],
      ['line-height-body', get(tokens, 'type.line_height.body')],
      ['line-height-heading', get(tokens, 'type.line_height.heading')],
    ]),
  );
  const scale = get(tokens, 'type.scale');
  lines.push(...cssVars(Object.keys(scale).filter((k) => !k.startsWith('_')).map((k) => [`font-size-${k}`, scale[k]])));
  lines.push('  // space');
  const space = get(tokens, 'space.scale');
  lines.push(...cssVars([['space-unit', get(tokens, 'space.unit')]]));
  lines.push(...cssVars(Object.keys(space).filter((k) => !k.startsWith('_')).map((k) => [`space-${k}`, space[k]])));
  lines.push(
    ...cssVars([
      ['space-section', get(tokens, 'space.section')],
      ['space-heading-top', get(tokens, 'space.heading.top')],
      ['space-heading-bottom', get(tokens, 'space.heading.bottom')],
      ['space-paragraph', get(tokens, 'space.paragraph')],
      ['space-button', get(tokens, 'space.button')],
      ['space-card-gap', get(tokens, 'space.card_gap')],
    ]),
  );
  lines.push('  // radius');
  const radius = get(tokens, 'radius');
  lines.push(...cssVars(Object.keys(radius).filter((k) => !k.startsWith('_')).map((k) => [`radius-${k}`, radius[k]])));
  lines.push('  // chart.categorical.light, chart.status');
  lines.push(...chartVars(tokens, 'light'));
  const status = get(tokens, 'chart.status');
  lines.push(...cssVars(Object.keys(status).map((k) => [`chart-status-${k}`, status[k]])));
  lines.push('}', '');
  lines.push('body.dark {');
  lines.push('  // color.dark');
  lines.push(...colorVars(tokens, 'dark'));
  lines.push('  // chart.categorical.dark');
  lines.push(...chartVars(tokens, 'dark'));
  lines.push('}', END);
  return lines.join('\n') + '\n';
}

// custom.scss with the generated block in place: replaces the block between
// the markers, else puts it in front of what the file already holds.
function withBlock(existing, block) {
  if (existing === null) return block;
  const b = existing.indexOf(BEGIN);
  const e = existing.indexOf(END);
  if (b !== -1 && e !== -1 && e > b) {
    return existing.slice(0, b) + block + existing.slice(e + END.length).replace(/^\n/, '');
  }
  if (b !== -1 || e !== -1) throw new Error(`${OUT.scss}: one generated-block marker without the other`);
  return block + (existing.startsWith('\n') || existing === '' ? '' : '\n') + existing;
}

function readOrNull(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

// What the three files should hold for these tokens, keyed by repo-relative path.
function expectedFiles(opts) {
  const tokens = JSON.parse(fs.readFileSync(opts.tokens, 'utf8'));
  const header = headerLines(opts, tokens);
  return {
    label: `${get(tokens, 'name')} ${get(tokens, 'version')}`,
    files: {
      [OUT.theme]: themeToml(tokens, header),
      [OUT.fonts]: fontsToml(tokens, header),
      [OUT.scss]: withBlock(readOrNull(path.join(opts.root, OUT.scss)), scssBlock(tokens, header)),
    },
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { label, files } = expectedFiles(opts);
  const names = Object.keys(files).join(', ');
  if (opts.check) {
    const stale = Object.keys(files).filter((rel) => readOrNull(path.join(opts.root, rel)) !== files[rel]);
    if (stale.length) {
      for (const rel of stale) console.log(`${rel}: differs from what ${label} tokens generate (or is missing)`);
      console.log(`❌ theme: ${stale.length} generated file(s) out of date — run \`node ${SCRIPT} <tokens>\` and commit, never edit them by hand`);
      process.exit(1);
    }
    console.log(`✔ theme: ${names} match the ${label} tokens`);
    return;
  }
  for (const rel of Object.keys(files)) {
    const file = path.join(opts.root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, files[rel]);
  }
  console.log(`✔ theme: wrote ${names} from the ${label} tokens`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.log(`❌ theme: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { firstFamily, withBlock, themeToml, fontsToml, scssBlock, expectedFiles, BEGIN, END, OUT };
