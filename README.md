[![Netlify Status](https://api.netlify.com/api/v1/badges/a8df876c-d4fe-4595-9f4b-087ab6367dfb/deploy-status)](https://app.netlify.com/sites/reboting/deploys)

# reboting.com

The source of [reboting.com](https://reboting.com/), the personal page of Erich Heil — consultant, building data products, and therefore always learning to get better at designing software architectures, the process of software development, data engineering and data science. The page is where he writes it down: short posts on running software — infrastructure, development environments, deployment — each one with a diagram or a picture.

## How it is built

- A static site: [Hugo](https://gohugo.io/) 0.81.0 extended with the [Wowchemy Academic](https://github.com/wowchemy/wowchemy-hugo-modules) theme pulled in as a Hugo module (`go.mod`).
- [Netlify](https://www.netlify.com/) builds `master` into the live site and every pull request into a deploy preview; the build command and the pinned Hugo version are in [`netlify.toml`](netlify.toml). The badge above is the `reboting` site's deploy status.
- The look is derived, not hand-written: [`design/tokens.json`](design/tokens.json) is a copy of the hedata-epu design tokens (colour, type, spacing), and [`scripts/generate-theme.js`](scripts/generate-theme.js) turns it into the Wowchemy theme and font files and a block of CSS custom properties. CI fails when the generated files and the tokens disagree; how to take a new token version is in [`design/README.md`](design/README.md).

## How posts get here

- An agent writes each post from a pitch the maintainer picked, on a branch, as a pull request.
- Every pull request passes five CI gates (`scripts/check-*.js`, run by [`.github/workflows/ci.yml`](.github/workflows/ci.yml)): the front matter is complete, no forbidden word (private names, addresses, hosts), every link answers anonymously and points only at public repositories, the post shows a diagram or a picture, and the featured image is checked in with its source.
- The maintainer reads the deploy preview and merges; Netlify publishes `master`.

## Working on it

Hugo 0.81.0 extended and Go (for the theme module) are the only tools; the checks are plain Node scripts without dependencies.

```bash
hugo server                                                   # dev server with live reload (-D for drafts)
node --test "scripts/test/*.test.js"                          # unit tests of the checks
node scripts/check-front-matter.js                            # one of the five gates; the others take --base origin/master
node scripts/generate-theme.js --check design/tokens.json     # the generated theme files match the tokens
```

Layout, every command, the CI gates in detail and the conventions: [`AGENTS.md`](AGENTS.md).

## Licence

[MIT](LICENSE.md), inherited from the [Wowchemy Academic starter](https://github.com/wowchemy/starter-academic) by George Cushen, which this repository began as.
