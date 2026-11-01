# Personal Academic Portfolio — Agent Instructions

Hugo static site with the Wowchemy Academic theme, deployed on Netlify. Default branch is `master` (not `main`).

## Layout

- `config/_default/` — Hugo config (`config.yaml`, `params.yaml`, `menus.yaml`)
- `content/` — Markdown content: `home/` (widget sections), `post/`, `project/`, `publication/`, `event/`, `authors/`
- `assets/media/`, `static/uploads/` — images and files
- `data/themes/hedata-epu.toml`, `data/fonts/hedata-epu.toml`, `assets/scss/custom.scss` (its marked block) — **generated** from `design/tokens.json` by `scripts/generate-theme.js`; never edit them, change the tokens
- `design/tokens.json` — a copy of the hedata-epu design tokens (plugin `hedata-epu` in agent-control; version and update steps in `design/README.md`)
- `layouts/` — Hugo template overrides; not in the repo yet, created when the first override is needed
- `exampleSite/` — Wowchemy reference content, don't edit
- `scripts/` — the CI checks and the theme generator (node, no dependencies) and their tests under `scripts/test/`

## Commands

```bash
hugo server          # dev server with live reload (-D for drafts)
hugo                 # production build → public/
hugo new post/my-title/index.md   # new content (also project/, publication/)
./update_wowchemy.sh # update theme (hugo mod get -u && hugo mod tidy)
node scripts/check-front-matter.js                            # every content/post/*/index.md has title, date, summary, draft; date parses; no tbd placeholder; Mermaid needs diagram: true
node scripts/check-forbidden-words.js --base origin/master    # forbidden words in the files under content/ this branch adds or changes
node scripts/check-links.js --base origin/master              # every URL in the posts this branch adds or changes answers 2xx anonymously, GitHub links only to public repos
node scripts/check-diagram-or-picture.js --base origin/master # each of those posts shows a Mermaid block or a picture (drafts skipped)
node scripts/check-featured-image.js --base origin/master     # each of those posts has featured.* and its source next to it (drafts skipped)
node scripts/generate-theme.js design/tokens.json             # theme, fonts and the custom.scss block from the tokens (after replacing design/tokens.json)
node scripts/generate-theme.js --check design/tokens.json     # CI: the generated files are what the tokens give
node --test "scripts/test/*.test.js"                          # unit tests of the checks (offline: links are served by a local server)
```

Netlify auto-deploys from git; build settings in `netlify.toml`.

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `master` and does only what Netlify does not. Two checks run on the whole tree, four run only on what the pull request adds or changes (`--base origin/master`, three-dot diff; on a push to `master`, the pushed range) — older posts are not their business until a pull request touches them:

- **Front matter**, every `content/post/*/index.md`: `title`, `date`, `summary`, `draft` present, `date` a YAML timestamp, and none of `title`, `subtitle`, `summary` the placeholder `tbd` (any case). When any post has a `` ```mermaid `` block, `config/_default/params.yaml` must say `diagram: true` (Wowchemy renders Mermaid only then); otherwise the job fails with that hint.
- **Forbidden words**, on the changed files under `content/` (whole-word, case-insensitive). The public list is `scripts/forbidden-words.txt` (the project name, e-mail addresses, private hostnames, IP addresses; a hit prints file, line and word). The private list — household, family and client names — is the repository secret `POST_FORBIDDEN_WORDS`, one entry per line, same syntax, optional; a hit prints file and line only, never the word, and an entry that is not a valid regular expression fails the job naming only its position in the list.
- **Public links only**, on the changed posts: every `http(s)` URL is fetched anonymously (plain `curl`, no token, redirects followed, 15 s timeout); anything but 2xx fails with file, line and URL. A link into `github.com/hedata/<repo>` must also name a repo listed in `scripts/public-repos.txt` (one name per line, currently `personal`) — so a private repo fails whatever GitHub answers. Add a repo there only once it is public.
- **At least one diagram or picture**, on the changed posts: the body has a `` ```mermaid `` block, a markdown image (`![…](…)`), an `<img>` or a figure / image / gallery / diagram shortcode — else "post has no diagram or picture". Posts with `draft: true` are skipped here and in the featured-image check (not published, so no picture yet); the other checks still run on them.
- **Theme files are generated**, whole tree: `data/themes/hedata-epu.toml`, `data/fonts/hedata-epu.toml` and the marked block of `assets/scss/custom.scss` must be exactly what `scripts/generate-theme.js` makes of `design/tokens.json` — a hand edit fails naming the file. Changing the look = replace `design/tokens.json` from the plugin (note the version in `design/README.md`), re-run the generator, commit all of it.
- **Featured image with its source**, on the changed posts' folders: `featured.png/jpg/jpeg/webp/svg/gif` (Wowchemy's preview picture) plus what it was made from, checked in next to it — `featured.mmd` (Mermaid text), `featured.svg` (its own source) or a non-empty `featured.source.md` naming the design project and brief, or the template and its parameters — else "featured image without source" (EPU ADR-003: diagrams are text, every picture has its source).

The build itself is Netlify's: merge to `master` → deploy, pull request → deploy preview (`netlify.toml`).

## After merge

The project manager runs these on the agent workstation after every merge to `master` (never the maintainer; a PR lists them under "After merge (manager)"):

1. `git -C /workspaces/personal pull --ff-only`. Nothing else: Netlify deploys `master` by itself.

## Conventions

- YAML front matter on all content; homepage sections in `content/home/` use `widget:`/`weight:`/`active:` keys
- kebab-case for content directories; 2-space YAML indentation
- Images: WebP preferred, always provide alt text; profile photo at `content/authors/admin/avatar.jpg`
- Custom CSS goes in `assets/scss/custom.scss` **below** the generated block (the block is the tokens as CSS custom properties — `--color-accent`, `--font-heading`, `--space-4`, `--radius-md`, `--chart-1` … — use them, never a literal colour)
- Never edit generated files; change the tokens (`design/README.md`) and re-run `node scripts/generate-theme.js design/tokens.json`