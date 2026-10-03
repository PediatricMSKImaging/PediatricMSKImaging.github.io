# Release Hardening Implementation Plan

> **For agentic workers:** Use systematic debugging and test-driven development; verify each task before final review.

**Goal:** Resolve the approved release-audit findings without changing site content or publishing prematurely.

**Architecture:** Preserve heading and section IDs, contain heading-link icons within their headings, and version local stylesheet URLs. Restrict privileged workflows to trusted repository code. Compress the existing bone geometry and colour attributes without mesh simplification and supply a lightweight rendered poster.

**Tech Stack:** Jekyll, Liquid, SCSS, JavaScript, GitHub Actions, glTF.

**Spec:** User-approved audit findings in this chat: broken collaboration targets, mobile horizontal overflow, CSS cache invalidation, unsafe privileged pull-request execution, and heavy homepage model loading.

## Global Constraints
- Work in the existing local preview checkout, preserving all pending redesign/content changes.
- Do not commit, push, or deploy in this task.
- Keep page wording, SED percentile, colour map, and bone orientation unchanged.
- Do not add a test framework to this repository; use temporary regression checks.
- Never expose secrets or run contributed fork code with privileged credentials.
- Preserve scheduled/manual citation updates and trusted preview builds where possible.

## Tasks

### Task 1: Preserve anchors and contain icons
**Files:** `_scripts/anchors.js`, `_styles/anchor.scss`.
- [x] Reproduce lost network/ARIA heading targets and narrow-screen overflow.
- [x] Write and run failing temporary anchor-ID regression checks.
- [x] Remove destructive heading-ID relocation and contain icons within headings.
- [x] Verify collaboration shortcuts, ARIA labels, existing anchor offsets, and widths 320/390 pixels.

### Task 2: Version stylesheets
**Files:** `_includes/styles.html`.
- [x] Assert first-party CSS URLs have a build version; observe failure.
- [x] Add the same build-version scheme already used for scripts.
- [x] Verify built Sass/static-CSS URLs and their file paths.

### Task 3: Secure workflow execution
**Files:** `.github/workflows/on-pull-request.yaml`, `.github/workflows/update-citations.yaml`, `.github/workflows/build-preview.yaml` as needed.
- [x] Validate the unsafe privileged fork execution path before fixing.
- [x] Gate privileged PR jobs to trusted same-repository branches and add defense-in-depth checkout/job restrictions.
- [x] Preserve scheduled/manual updates and preview cleanup semantics.
- [x] Validate trusted, fork, closed-PR, scheduled and manual cases; no live workflow run.

### Task 4: Optimize model loading
**Files:** `models/bone-sed.glb`, `models/bone-structure.glb`, `_includes/bone-viewer.html`, poster asset and conversion documentation as needed.
- [x] Back up originals outside the repository and inspect mesh attributes.
- [x] Use a supported glTF compression path without decimation; retain scientific colour information.
- [x] Add a lightweight rendered poster while keeping interactive loading/controls.
- [x] Verify reduced sizes, mesh/colour preservation, browser decode, rotation, both modes, and graceful loading.

### Task 5: Integrated verification and review
- [x] Run production Jekyll build, internal asset/anchor audit, map regressions, and diff whitespace checks.
- [x] Verify runtime navigation/mobile layouts and save a final screenshot.
- [x] Obtain a read-only review of the exact hardening changes.
- [x] Report results and any remaining limitations without publishing.

## Review Focus
- Scripts must not overwrite explicit IDs or invalidate `aria-labelledby`.
- Mobile fixes must not merely hide document overflow or create orphan heading icons.
- Preview security must cover both citation and site-building code, including fork PR events.
- CSS versions must respect Jekyll base URLs and avoid breaking third-party stylesheets.
- Compressed models must render with the same SED colours and maintain fine bone geometry.

## Progress
- Plan recorded; audit reproductions are available from the preceding turn.
- Working in place honours the user's established local-preview workflow; no new branch/worktree or commits are requested.
- Tasks 1–5 verified. All six primary pages fit 320/390-pixel viewports; both collaboration navigation paths land below the sticky header. All 58 local CSS URLs are versioned.
- Production audit covers 42 pages with no missing local files/fragments, duplicate IDs, or missing image alt text. Map regression checks and 12 offline workflow checks pass; live Actions execution is not tested.
- Lossless models shrink from 18.79 to 12.52 MB (SED) and 17.39 to 11.74 MB (structure), with every decoded buffer byte-exact. Both render and rotate locally. Poster is 34,960 bytes; loading/error announcements pass fixture checks.
- Review caught the decoder/license being ignored by Git. Narrow `.gitignore` exceptions now allow only those two vendor files, verified without staging; no remaining scoped blockers. Preview base-URL build and whitespace checks pass.
- Fork PR previews/cleanup intentionally skip privileged execution; same-repository code remains trusted. Full tradeoffs are in `docs/security-workflows.md`. Nothing committed, pushed, or deployed.
