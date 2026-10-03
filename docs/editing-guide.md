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

## Heading banners
The `subpage-hero` and `team-intro-band` wrappers inherit the default trabecular-style background from `_styles/banner.scss`. No extra texture class is needed.

For a page-specific photo or design, add `subpage-hero--custom-banner` to the heading wrapper and define its custom background in the page's stylesheet. This disables the default texture without changing other pages. The JIA project page is an example.

## Page shortcuts and actions
Keep banners limited to the title, introduction, and optional imagery. Define a page's section shortcuts in front matter under `shortcuts`, with `label` and `anchor` for each entry, then place `{% include section-shortcuts.html %}` immediately after the first section break. Anchor values omit the leading `#` and must match a section ID. Short pages do not need shortcuts.

Nested section navigation uses the same include with `links=page.equipment_shortcuts`, `nested=true`, and an accessible `label`. Use the shared button include for actions, `class="button" data-style="download"` for PDF downloads, and ordinary links within sentences. Cross-page actions should not be styled as section shortcuts.
