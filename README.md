# fcastellanos.io

Fernando Castellanos' blog, built with [Jekyll](https://jekyllrb.com) and deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `master`.

## Writing a post

Add a Markdown file to `_posts/` named `YYYY-MM-DD-slug.md`:

```markdown
---
title: "My Post Title"
date: 2026-10-23 09:00:00 -0700
tags: [ruby, rails]
---

Post body here.
```

Work-in-progress posts go in `_drafts/` (no date in the filename) and are not published. Images go in `assets/img/`.

## Running locally

```sh
bundle install
bundle exec jekyll serve --drafts
```

Then open http://localhost:4000.

## One-time GitHub setup

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Settings → Pages → Custom domain: `fcastellanos.io`, and point DNS at GitHub Pages
   (apex `A` records 185.199.108.153, .109.153, .110.153, .111.153; `www` `CNAME` to `fcastellanos.github.io`).
