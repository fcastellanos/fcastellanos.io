# fcastellanos.io

Fernando Castellanos' blog, built with [Jekyll](https://jekyllrb.com) and deployed by Netlify on every push to `master` (build settings in `netlify.toml`). Pull requests get a Netlify deploy preview.

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
