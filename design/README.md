# Design tokens — a copy, not the source

`tokens.json` is a verbatim copy of the hedata EPU design tokens: the `design`
skill of the `hedata-epu` plugin in `hedata/agent-control`,
`plugins/hedata-epu/skills/design/tokens.json` — plugin version 0.2.2, tokens
version 0.1.0 (the `version` field inside the file), agent-control commit
`0aff7c1` of 2026-10-19 ([EPU ADR-001: consumers derive, never fork](https://github.com/hedata/vault-projects/blob/main/20-Projects/epu/decisions/ADR-001-design-source-and-publishing.md)).

The copy is what `scripts/generate-theme.js` reads and what CI re-runs it
against, so the generated files (`data/themes/hedata-epu.toml`,
`data/fonts/hedata-epu.toml`, the marked block of `assets/scss/custom.scss`)
can be checked without the plugin. To take a new token version: replace the
copy, update the version and commit above, run
`node scripts/generate-theme.js design/tokens.json`, commit all of it.
