# Colour-Coded Collaboration Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show both PIs' full-history, publication-based collaboration networks on About the Lab, with red/gold affiliation markers and PI filters.

**Architecture:** A manual Python refresh produces a validated static JSON snapshot. A dependency-free SVG map and accessible institution list consume the same snapshot and filtering logic. Jekyll supplies the section markup and local asset paths; no visitor requests go to OpenAlex.

**Tech Stack:** Existing Jekyll/Liquid/SCSS, vanilla JavaScript/SVG, Python 3 standard library, locally bundled Natural Earth land GeoJSON.

**Spec:** `/Users/daniellewhittier/Documents/Pediatric MSK Lab Website/docs/superpowers/specs/2026-10-02-collaboration-map-design.md`

## Global Constraints

- All initial work remains in the local preview; no commit, push, or deployment is authorized.
- Add “Our Global Research Network” after Our Research Approach and before Funding; link from Publications.
- Include both PIs' full indexed histories, without a publication-year cutoff, including pre-lab work.
- Red = Whittier; gold = Twilt; split red/gold = both; selected markers use a contrasting outline.
- “Both” describes institution membership across histories, not necessarily joint authorship.
- Derive locations from non-PI co-authors' affiliations on the publication, not current affiliations.
- No per-visitor OpenAlex requests, exposed credentials, scheduled automation, permanent connection lines, or animation.
- Preserve existing pending edits, real photos, equipment panels, project pages, and the homepage bone model.
- This repository has no test suite: use temporary fixture checks in `/private/tmp`, not a new repository test framework.

## Review Focus

1. Separate PI papers at one institution must produce a Both marker, not a fabricated jointly authored publication.
2. DOI-equivalent records with different work IDs must merge affiliations and PI membership without double-counting.
3. Null/invalid coordinates and co-located institutions must remain accessible rather than silently disappearing.
4. A failed or incomplete API refresh must leave the previous published snapshot untouched and expose no credentials.
5. Changing PI/search filters must not leave stale details, inconsistent counts, or inaccessible mobile/keyboard controls.

## Files and Interfaces

All repository paths below are relative to `/Users/daniellewhittier/Documents/Pediatric MSK Lab Website`.

- `scripts/collaboration-identities.json`: verified PI IDs, ORCIDs, home affiliation IDs, and unresolved candidates with evidence notes; excluded from the built site with the existing `scripts` exclusion.
- `scripts/refresh_collaborations.py`: retrieval, canonicalization, institution enrichment, snapshot validation, atomic refresh CLI.
- `data/collaborations.json`: public static snapshot; `data/world-land.geojson`: local map polygons.
- `_includes/collaboration-map.html`: section markup, controls, loading/failure state, attribution, and fallback.
- `_scripts/collaboration-map.js`: pure view selection and projection functions plus isolated DOM initialization.
- `_styles/collaboration-map.scss`: front-mattered stylesheet discovered by the existing styles include.
- `about/index.md`, `publications/index.md`: section insertion and cross-link only.
- `docs/collaboration-map.md`: refresh instructions, provenance, counting rules, and limitations.

Snapshot schema version 1:

```text
schema_version: 1
generated_at: ISO UTC timestamp
pis: [{id: "whittier"|"twilt", name, author_ids, orcid}]
works: [{id, source_ids: string[], title, year: integer|null,
         doi: string|null, url, pi_ids: string[]}]
institutions: [{id, name, city: string|null, country: string|null,
                country_code: string|null, latitude: number|null,
                longitude: number|null, work_ids: string[]}]
coverage: {truncated_authorship_works: integer, works_without_collaborating_affiliations: integer}
```

Institution membership and per-PI counts derive from `work_ids` and each work's `pi_ids`; do not store divergent precomputed copies. Count mapped countries from valid mapped institutions only and disclose unknown countries/locations. Publication totals count the selected PI's unique indexed works, even works lacking a mapped collaboration.

### Task 1: Canonical Public Snapshot and Identity Audit

**Files:** Create the identity manifest, refresh script, snapshot, and refresh guide.

**Interfaces:**
- `canonicalize_works(records: list[dict], identities: dict) -> list[dict]`
- `build_snapshot(records: list[dict], institutions: dict[str, dict], identities: dict, generated_at: str) -> dict`
- `validate_snapshot(snapshot: dict) -> None` raises `ValueError` on invalid references/schema.
- `refresh_snapshot(output_path: pathlib.Path, identities: dict, api_key: str | None) -> dict`

- [ ] Write `/private/tmp/check_collaboration_snapshot.py` using stdlib `unittest` and import-by-path. Assert DOI case/URL normalization, work-ID duplicates, and transitive DOI/work-ID merges preserve all PI membership and co-author affiliations. Assert two different PI papers at one institution yield two unique works and both PI memberships; a shared paper counts once.
- [ ] Add fixtures excluding all verified PI authorships and home affiliations (UCalgary `I168635309`, ACH `I2802127220`, ACHRI `I4389425471`, and institutions with those ancestors in their lineage). Verify multiple co-authors from one institution add one work association. Test null, nonnumeric, out-of-range, and zero-valued coordinates; missing locations stay in the institution array with null coordinates.
- [ ] Run the temporary checker and confirm failure before implementation.
- [ ] Implement the four interfaces using stdlib only. Normalize IDs to OpenAlex short IDs; union duplicate records before aggregation, with a deterministic canonical work ID and DOI link where available. Reject nonfinite JSON values and dangling references. Serialize only scholarly metadata needed by the page, never raw API responses/keys.
- [ ] Seed verified identities: Whittier `A5009049545` / `0000-0003-3602-551X`; Twilt `A5049436690`, `A5123178017` / `0000-0003-1954-2822`. Inspect candidate records `A5152471916`, `A5137355467`, `A5034800731` against publisher/co-author evidence; include only verified unique publications and record exclusions/unresolved identities. Do not use the unrelated legacy `_data/orcid.yaml` value.
- [ ] Implement cursor paging per included author with `per_page=100`, `cursor=*`, `filter=authorships.author.id:<ID>`, and selected work fields `id,title,publication_year,doi,type,authorships`. Advance until `next_cursor` is null; reject repeated cursors or changing/inconsistent result counts rather than publishing a partial result. Retrieve referenced institutions with their geographic metadata and lineage, batching up to 100 IDs.
- [ ] Add mocked HTTP fixtures for two work pages, a failed institution request, malformed results, repeated cursors, and rate limiting. Use a 30-second request timeout, at most three retries for 429/5xx with bounded backoff, and optional `OPENALEX_API_KEY` from the environment as a bearer header. Never print request headers or keys. Write the snapshot with temporary-file plus atomic replace only after validation; verify a forced failure leaves existing output bytes unchanged.
- [ ] Run `/usr/local/bin/python3 /private/tmp/check_collaboration_snapshot.py`; require all checks passing. Fetch real data with `/usr/local/bin/python3 scripts/refresh_collaborations.py --output data/collaborations.json`, using sandbox escalation only if networking requires it. If budget/auth prevents a complete fetch, preserve the old snapshot and report the limitation instead of inventing data.
- [ ] Document exact refresh command, included/excluded identities, date/year range, deduplication, home-affiliation rules, unknown coordinates, and the OpenAlex 100-authorship limit. Manually inspect representative old/recent and shared works from each PI before accepting the initial snapshot.

### Task 2: One Filtering Model for Map, Counts, and Accessible List

**Files:** Create the map include, script, stylesheet, local land asset; update About and Publications.

**Interfaces:**
- `selectNetwork(snapshot, piId = "all", query = "") -> {works, institutions, totals, yearRange}`; totals contain publications, mappedInstitutions, countries, unmappedInstitutions, and unknownCountries.
- `projectCoordinate(longitude, latitude) -> {x, y}` uses an equirectangular `960 × 480` view box.
- `groupLocations(institutions) -> {key, latitude, longitude, institutionIds}[]` groups coordinates rounded to three decimals for display only.
- Browser script initializes only `[data-collaboration-network]`; pure helpers are exportable via CommonJS for temporary Node checks and do not require a browser DOM at import time.

- [ ] Write `/private/tmp/check_collaboration_view.cjs` with `node:assert/strict`. Pin All/Whittier/Twilt unique totals, independent Both membership, shared-paper deduplication, case-insensitive name/city/country search, invalid filter handling, missing coordinates, and co-located institutions. Verify search changes institution counts but not selected PI publication totals/year range. Confirm the checker fails before implementation.
- [ ] Implement the three pure functions and run the checker. Group membership is the union of visible institutions' PI work membership; institution badges always retain institution-specific membership.
- [ ] Bundle Natural Earth's official 110m land GeoJSON from its public-domain vector repository, record source revision and SHA-256 in the guide, and use no map tiles/CDN. Verify valid Polygon/MultiPolygon rings and render them with the same projection as markers. Credit “Made with Natural Earth.”
- [ ] Build the include with exact heading, explanatory full-history copy, All / Whittier / Twilt buttons using `aria-pressed`, labelled legend/search, summary counts, SVG map, institution buttons, and detail panel. Pass JSON/GeoJSON asset paths through `relative_url` using data attributes. Fetch local assets only when this section exists.
- [ ] Render names/titles using `textContent`, not HTML interpolation. Allow publication links only to HTTPS DOI/OpenAlex URLs. Render details grouped by PI, label joint works explicitly, and provide a select control for multiple institutions at a grouped location. On any filter/search change, clear invalid selection and synchronize all views. Use visible status text and `aria-live="polite"` for count/result changes.
- [ ] Style scoped `.collaboration-network` panels using existing typography and rounded corners. Red `#d71920`, gold `#f6b51b`, dark marker outline `#20262d`; use text PI badges and split marker fills rather than colour-only communication. Keep selected outline separate. Desktop map above list/details avoids squeezing the map; below 800px stack list/details, retain at least 44px touch targets, and prevent page overflow.
- [ ] Handle empty search results without hiding the overall publication count; retain no-coordinate institutions in the list and disclose unmapped totals. Provide loading, fetch failure, and `<noscript>` text with PI OpenAlex profile links. No automatic zoom/animation or permanent connecting lines.
- [ ] Insert the include after Our Research Approach and before Funding with anchor `global-research-network`; add a Publications link to `/about/#global-research-network` using `relative_url`. Existing global script/style discovery needs no new loader or dependency.
- [ ] Run the Node checker and a temporary built-HTML check asserting one map section, expected source attribution/filter controls, correct local assets, and the Publications anchor. Verify no external OpenAlex fetch exists in browser code.

### Task 3: Real-Data Validation and Preview Handoff

**Files:** Refine only the above component files and guide if validation uncovers defects.

**Interfaces:** Consume schema version 1 and Task 2 helpers without changing their contracts.

- [ ] Build with the existing environment:

```bash
GEM_HOME=/Users/daniellewhittier/miniforge3/envs/pediatric-msk-lab-site/share/rubygems \
GEM_PATH=/Users/daniellewhittier/miniforge3/envs/pediatric-msk-lab-site/share/rubygems \
/Users/daniellewhittier/miniforge3/envs/pediatric-msk-lab-site/bin/ruby \
/Users/daniellewhittier/miniforge3/envs/pediatric-msk-lab-site/share/rubygems/gems/bundler-2.5.6/exe/bundle \
exec jekyll build --destination /private/tmp/lab-style-preview
git diff --check
```

- [ ] Independently recompute snapshot counts and inspect one Whittier-only, Twilt-only, Both-with-separate-papers, and jointly authored example when present. If a category does not exist in real data, verify it with the fixture rather than fabricating a live example.
- [ ] On `http://127.0.0.1:4001/about/#global-research-network`, check desktop at 1280px and mobile at 390px: labels, map/list selection, both PI filters, search/empty results, grouped locations, missing-location disclosure, and working publication links. Use keyboard-only controls and screen-reader accessible state inspection. Test local JSON fetch failure with a temporary fixture page and verify the fallback.
- [ ] Confirm homepage bone viewer, Research panels, Team layout, real images, and navigation remain unchanged. Re-run both temporary checkers and `git diff --check` after fixes.
- [ ] Save desktop/mobile preview screenshots in `/private/tmp`, update guide with final snapshot counts and provenance, and present the preview for user review. Do not commit or push; deployment requires separate user approval.

## Source References

- OpenAlex authentication/limits: https://help.openalex.org/api/authentication/
- OpenAlex cursor paging: https://help.openalex.org/api/paging/
- OpenAlex authorships and institution geography: https://help.openalex.org/data/authorships/ and https://help.openalex.org/data/institutions/
- Natural Earth public-domain terms: https://www.naturalearthdata.com/about/terms-of-use/

## Execution Handoff

Recommended: native execution in this session, because the data/model/UI contracts are small and tightly connected. Review this plan and select native or subagent-driven execution before product implementation. If independent-review tools are unavailable, disclose that limitation and perform the fixture/browser checks directly. No new Git worktree is necessary: the user requested changes in the active local-preview workspace.
