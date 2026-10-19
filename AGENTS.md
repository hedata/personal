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
node scripts/check-front-matter.js                            # every content/post/*/index.md has title, date, summary, draft; date parses; Mermaid needs diagram: true
node scripts/check-forbidden-words.js --base origin/master    # forbidden words in the files under content/ this branch adds or changes
node scripts/check-links.js --base origin/master              # every URL in the posts this branch adds or changes answers 2xx anonymously, GitHub links only to public repos
node scripts/check-diagram-or-picture.js --base origin/master # each of those posts shows a Mermaid block or a picture
node scripts/check-featured-image.js --base origin/master     # each of those posts has featured.* and its source next to it
node --test "scripts/test/*.test.js"                          # unit tests of the checks (offline: links are served by a local server)
```

Netlify auto-deploys from git; build settings in `netlify.toml`.

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `master` and does only what Netlify does not. One check runs on the whole tree, four run only on what the pull request adds or changes (`--base origin/master`, three-dot diff; on a push to `master`, the pushed range) — older posts are not their business until a pull request touches them:

- **Front matter**, every `content/post/*/index.md`: `title`, `date`, `summary`, `draft` present, `date` a YAML timestamp. When any post has a `` ```mermaid `` block, `config/_default/params.yaml` must say `diagram: true` (Wowchemy renders Mermaid only then); otherwise the job fails with that hint.
- **Forbidden words**, on the changed files under `content/` (whole-word, case-insensitive). The public list is `scripts/forbidden-words.txt` (the project name, e-mail addresses, private hostnames, IP addresses; a hit prints file, line and word). The private list — household, family and client names — is the repository secret `POST_FORBIDDEN_WORDS`, one entry per line, same syntax, optional; a hit prints file and line only, never the word, and an entry that is not a valid regular expression fails the job naming only its position in the list.
- **Public links only**, on the changed posts: every `http(s)` URL is fetched anonymously (plain `curl`, no token, redirects followed, 15 s timeout); anything but 2xx fails with file, line and URL. A link into `github.com/hedata/<repo>` must also name a repo listed in `scripts/public-repos.txt` (one name per line, currently `personal`) — so a private repo fails whatever GitHub answers. Add a repo there only once it is public.
- **At least one diagram or picture**, on the changed posts: the body has a `` ```mermaid `` block, a markdown image (`![…](…)`), an `<img>` or a figure / image / gallery / diagram shortcode — else "post has no diagram or picture".
- **Featured image with its source**, on the changed posts' folders: `featured.png/jpg/jpeg/webp/svg/gif` (Wowchemy's preview picture) plus what it was made from, checked in next to it — `featured.mmd` (Mermaid text), `featured.svg` (its own source) or a non-empty `featured.source.md` naming the design project and brief, or the template and its parameters — else "featured image without source" (EPU ADR-003: diagrams are text, every picture has its source).

The build itself is Netlify's: merge to `master` → deploy, pull request → deploy preview (`netlify.toml`).

## Conventions

- YAML front matter on all content; homepage sections in `content/home/` use `widget:`/`weight:`/`active:` keys
- kebab-case for content directories; 2-space YAML indentation
- Images: WebP preferred, always provide alt text; profile photo at `content/authors/admin/avatar.jpg`
- Custom CSS goes in `assets/scss/custom.scss`