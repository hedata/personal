# Personal Academic Portfolio

This is a Hugo static site using the Wowchemy Academic theme for building an academic portfolio website.

## Tech Stack

- **Hugo** - Static site generator (Go-based)
- **Wowchemy Academic** - Academic portfolio theme
- **Go Modules** - Theme dependency management
- **Netlify** - Deployment platform

## Project Structure

```
/workspaces/personal/
├── config/                 # Site configuration
│   └── _default/
│       ├── config.yaml     # Main Hugo config
│       ├── languages.yaml  # Language settings
│       ├── menus.yaml      # Navigation menus
│       └── params.yaml     # Theme parameters
├── content/                # Site content (Markdown)
│   ├── home/              # Homepage sections
│   │   ├── about.md       # Bio/about section
│   │   ├── experience.md  # Work experience
│   │   ├── accomplishments.md
│   │   ├── contact.md
│   │   ├── featured.md
│   │   └── posts.md
│   ├── authors/           # Author profiles
│   ├── post/              # Blog posts
│   ├── project/           # Portfolio projects
│   ├── publication/       # Academic publications
│   ├── event/             # Events/talks
│   └── slides/            # Presentation slides
├── assets/                # Static assets
│   └── media/             # Images and icons
├── static/                # Static files (copied as-is)
│   └── uploads/           # User uploads
├── data/                  # Data files
│   ├── fonts/             # Custom fonts
│   └── themes/            # Custom theme colors
├── layouts/               # Custom Hugo templates (overrides)
└── exampleSite/           # Wowchemy example content (reference)
```

## Development Commands

```bash
# Start development server with live reload
hugo server

# Build site for production
hugo build

# Start with drafts visible
hugo server -D

# Build with specific base URL
hugo --baseURL "https://example.com"
```

## Key Configuration Files

### `config/_default/config.yaml`
Main Hugo configuration - site title, base URL, language settings.

### `config/_default/params.yaml`
Theme parameters - appearance, features, SEO settings, social links.

### `config/_default/menus.yaml`
Navigation menu structure.

## Content Authoring

### Creating New Content

```bash
# New blog post
hugo new post/my-post-title/index.md

# New project
hugo new project/project-name/index.md

# New publication
hugo new publication/paper-title/index.md
```

### Front Matter Structure

All content files use YAML front matter:

```yaml
---
title: "Page Title"
date: 2024-01-01
draft: false
featured: false
tags: ["tag1", "tag2"]
categories: ["category"]
image:
  caption: "Image caption"
  focal_point: "Center"
---
```

### Homepage Sections

Homepage sections in `content/home/` use widget front matter:

```yaml
---
widget: about  # Widget type
headless: true
weight: 20     # Order on page
active: true   # Show/hide section
---
```

## Styling

### Custom Theme Colors
Edit `data/themes/` YAML files to customize colors.

### Custom Fonts
Configure in `data/fonts/` YAML files.

### Custom CSS
Add to `assets/scss/custom.scss` (create if needed).

## Deployment

### Netlify Configuration (`netlify.toml`)
- Auto-deploys from Git
- Build command: `hugo`
- Publish directory: `public/`

### Environment Variables
- `HUGO_VERSION` - Specifies Hugo version for build

## Common Tasks

### Update Wowchemy Theme
```bash
./update_wowchemy.sh
# Or manually:
hugo mod get -u
hugo mod tidy
```

### Add Profile Photo
Place in `content/authors/admin/avatar.jpg`

### Add Publication PDF
Place PDF in `static/uploads/` and reference in publication front matter.

## Code Style

- **Markdown**: Standard CommonMark with Hugo shortcodes
- **YAML**: 2-space indentation
- **File naming**: Use kebab-case for content directories
- **Images**: Use WebP when possible, provide alt text

## Default Branch

This repo uses `master` as the default branch (not `main`).
