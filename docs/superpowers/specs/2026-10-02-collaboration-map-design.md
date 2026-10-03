# Global Research Network — Design

## Purpose and Scope

Show the geographic reach of Danielle Whittier and Marinka Twilt's publication-based collaborations across their full publication histories. Include work from before the Pediatric Musculoskeletal Imaging Lab was established. Do not describe this as a map of current formal partnerships.

This introduces a new data-driven component and a small data-refresh workflow to the existing Jekyll site. Implementation follows review of this design and its implementation plan. All initial work remains in the local preview; no commit, push, or deployment is authorized.

## Placement and Appearance

- Add “Our Global Research Network” to About the Lab, after Our Research Approach and before Funding.
- Link to that section from Publications.
- Use a flat world map with muted land and a warm cream background. Match the site's existing rounded panels and typography.
- Colour institutions red for Whittier collaborations, gold for Twilt collaborations, and split red/gold for institutions connected to both. Use a contrasting outline for selected markers rather than repurposing the PI colours.
- Do not add permanent connection lines or animation; keep the display clean.
- Show totals for indexed publications, mapped collaborating institutions, and countries represented by those institutions.

## Interaction and Accessibility

- Clicking or tapping a marker reveals the institution, city/country, unique shared-publication count, and associated publication titles with DOI or OpenAlex links.
- Include a labelled legend and All / Whittier / Twilt filters. Update map markers, institution list, details, year range, and summary counts together when the PI filter changes. Search narrows institutions, not the PI's overall publication total.
- A “Both” institution means that each PI has published with it, possibly on separate papers; it does not imply a jointly authored paper. Group publication links by PI and identify jointly authored works without counting them twice in overall totals.
- In an individual PI view, use that PI's colour and only their associated publications. In All, use an institution's full-history PI membership to determine its colour.
- Combine institutions at the same map location into a selectable group rather than hiding overlapping markers.
- A combined location marker can represent both PIs through different institutions. Its label and detail panel must distinguish location-level membership from an individual institution's membership.
- Provide a searchable institution list with the same information, operable by keyboard and usable without the map.
- Do not rely on colour alone: include PI names in accessible marker labels and visible institution badges, with a dark marker outline for contrast.
- On narrow screens, stack the map and detail/list panels. Avoid horizontal page overflow and ensure marker interaction does not require hovering.

## Source and Identity Verification

Retrieve public OpenAlex works and institutions, using verified author identities rather than a University of Calgary-wide search.

Verified principal records as of October 2, 2026:

- Danielle E. Whittier: A5009049545; ORCID 0000-0003-3602-551X.
- Marinka Twilt: A5049436690; ORCID 0000-0003-1954-2822.
- Marinka also has a same-ORCID record, A5123178017; include its unique works.

Name-only profiles also exist. Inspect their publication metadata and co-authors before including them; a matching name alone is insufficient. Retain a documented list of included identities and any unresolved candidate records.

## Counting and Geography

- No publication-year cutoff. Use the full history available in the verified records, with the observed year range displayed.
- Deduplicate by OpenAlex work ID and, where present, normalized DOI. Count a publication only once when both PIs contributed.
- Derive collaboration locations from non-PI co-authors' affiliations on each publication, not their current affiliations or the PIs' own historical employment.
- Count each institution once per unique publication, even when multiple co-authors list it.
- Treat the lab's University of Calgary and Alberta Children's Hospital affiliations as home affiliations rather than external collaborating institutions.
- Use institution coordinates supplied by OpenAlex; do not invent locations. Retain institutions with missing coordinates in the list and disclose how many could not be mapped.
- Include source attribution, refresh date, and a note that indexing, identity matching, missing affiliations, and large-author-list truncation can limit coverage.

## Data Delivery

Fetch and validate data during a manual refresh, then serve a local, static JSON snapshot with the website. Do not call OpenAlex on every visitor's page load or expose API credentials in browser code. Preserve the last valid snapshot if a refresh fails. No recurring automation is created.

Use a locally bundled, appropriately attributed world-map asset. The published snapshot contains only public scholarly metadata needed for counts and publication links.

## Verification

Verify identity selection, pagination, DOI/work deduplication, exclusion of PI-only and home-affiliation links, per-institution and per-PI counts, coordinate validation, and missing-location disclosure. Include a fixture where each PI collaborated with the same institution on separate papers: it must show “Both” without inventing a joint paper. Check the Jekyll build and rendered desktop/mobile views, including PI filters, keyboard/list interaction, overlapping locations, and empty results. Existing project pages, equipment panels, and real photos remain unchanged.
