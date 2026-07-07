# Personal Academic Portfolio — Agent Instructions

Hugo static site with the Wowchemy Academic theme, deployed on Netlify. Default branch is `master` (not `main`).

## Layout

- `config/_default/` — Hugo config (`config.yaml`, `params.yaml`, `menus.yaml`)
- `content/` — Markdown content: `home/` (widget sections), `post/`, `project/`, `publication/`, `event/`, `authors/`
- `assets/media/`, `static/uploads/` — images and files
- `data/themes/`, `data/fonts/` — custom colors and fonts
- `layouts/` — Hugo template overrides
- `exampleSite/` — Wowchemy reference content, don't edit

## Commands

```bash
hugo server          # dev server with live reload (-D for drafts)
hugo                 # production build → public/
hugo new post/my-title/index.md   # new content (also project/, publication/)
./update_wowchemy.sh # update theme (hugo mod get -u && hugo mod tidy)
```

Netlify auto-deploys from git; build settings in `netlify.toml`.

## Conventions

- YAML front matter on all content; homepage sections in `content/home/` use `widget:`/`weight:`/`active:` keys
- kebab-case for content directories; 2-space YAML indentation
- Images: WebP preferred, always provide alt text; profile photo at `content/authors/admin/avatar.jpg`
- Custom CSS goes in `assets/scss/custom.scss`