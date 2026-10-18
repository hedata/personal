# Personal Academic Portfolio — Agent Instructions

Hugo static site with the Wowchemy Academic theme, deployed on Netlify. Default branch is `master` (not `main`).

## Layout

- `config/_default/` — Hugo config (`config.yaml`, `params.yaml`, `menus.yaml`)
- `content/` — Markdown content: `home/` (widget sections), `post/`, `project/`, `publication/`, `event/`, `authors/`
- `assets/media/`, `static/uploads/` — images and files
- `data/themes/`, `data/fonts/` — custom colors and fonts
- `layouts/` — Hugo template overrides
- `exampleSite/` — Wowchemy reference content, don't edit
- `scripts/` — the CI checks (node, no dependencies) and their tests under `scripts/test/`

## Commands

```bash
hugo server          # dev server with live reload (-D for drafts)
hugo                 # production build → public/
hugo new post/my-title/index.md   # new content (also project/, publication/)
./update_wowchemy.sh # update theme (hugo mod get -u && hugo mod tidy)
node scripts/check-front-matter.js                          # every content/post/*/index.md has title, date, summary, draft; date parses
node scripts/check-forbidden-words.js --base origin/master  # forbidden words in the files under content/ this branch adds or changes
node --test "scripts/test/*.test.js"                        # unit tests of the two checks
```

Netlify auto-deploys from git; build settings in `netlify.toml`.

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `master` and does only what Netlify does not: the front-matter check on every post, and the forbidden-words gate on the files under `content/` the pull request adds or changes (whole-word, case-insensitive). The public list is `scripts/forbidden-words.txt` (the project name, e-mail addresses, private hostnames, IP addresses; a hit prints file, line and word). The private list — household, family and client names — is the repository secret `POST_FORBIDDEN_WORDS`, one entry per line, same syntax, optional; a hit prints file and line only, never the word, and an entry that is not a valid regular expression fails the job naming only its position in the list. The build itself is Netlify's: merge to `master` → deploy, pull request → deploy preview (`netlify.toml`).

## Conventions

- YAML front matter on all content; homepage sections in `content/home/` use `widget:`/`weight:`/`active:` keys
- kebab-case for content directories; 2-space YAML indentation
- Images: WebP preferred, always provide alt text; profile photo at `content/authors/admin/avatar.jpg`
- Custom CSS goes in `assets/scss/custom.scss`