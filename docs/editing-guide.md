# Editing Guide

## Homepage
Edit `_data/home.yaml` for the homepage data and `index.md` for the hero copy and layout. Replace images in `images/`.

## Research projects
Edit `_data/projects.yaml`.

## Team members
Add or edit files in `_members/`.

## News posts
Add Markdown files to `_posts/` using `YYYY-MM-DD-title.md`.

## Publications
Edit `_data/citations.yaml` for the current highlighted placeholders. Automatic citation updates are disabled on push so these curated highlights are not overwritten unexpectedly. If you later want automated publication updates, update `_data/sources.yaml` with real lab publication sources and run `.github/workflows/update-citations.yaml` manually.

## Images
Replace SVG placeholders in `images/` with final image files and update the corresponding YAML path if the filename changes.
