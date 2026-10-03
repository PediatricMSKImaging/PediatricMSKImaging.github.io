# Publication-Based Collaboration Map

The About page shows the full publication histories indexed under the verified OpenAlex profiles for Danielle Whittier and Marinka Twilt. It is a historical co-authorship network, not a directory of current formal partnerships.

## Refresh

From the website repository, run:

```bash
/usr/local/bin/python3 scripts/refresh_collaborations.py --output data/collaborations.json
```

The refresh uses Python's standard library. Basic OpenAlex access works without credentials. If needed, supply your own free key through the `OPENALEX_API_KEY` environment variable; do not put it in source files, URLs, or browser code. The script sends it only as an OpenAlex bearer header.

All work pages and institution metadata must be retrieved and validated before the snapshot is atomically replaced. A failed refresh leaves the previous snapshot intact. The website serves only local static JSON and map geometry; there is no automatic schedule or browser-side OpenAlex query.

## Identities and Coverage

Verified records:

| PI | OpenAlex author IDs | ORCID |
| --- | --- | --- |
| Danielle Whittier | A5009049545 | 0000-0003-3602-551X |
| Marinka Twilt | A5049436690; A5123178017 | 0000-0003-1954-2822 |

The Twilt secondary record has the same ORCID. Unique works from both verified records are retained. `scripts/collaboration-identities.json` documents evidence and unresolved candidates; it is not served as a website asset.

Name-only records are not automatically included:

- A5152471916: a 2026 artificial-turf sensor article names Danielle Whittier alongside Jake Ruschkowski, William Brent Edwards, and John Wannop. Plausible, but without an ORCID or independent identity confirmation it remains unresolved.
- A5137355467: a 2026 Central Nervous System Vasculitis chapter with Simone Appenzeller, plus a Contributors record, names Marinka Twilt. It lacks ORCID/institution identity metadata and remains unresolved pending publisher or author confirmation.
- A5034800731: two Japanese machine-translated JIA records lack DOIs and appear to duplicate original English articles. Excluded pending source resolution to avoid inflated counts.

The initial snapshot retrieved October 3, 2026 UTC contains:

| View | Indexed works | Mapped institutions | Known mapped countries | Indexed years |
| --- | ---: | ---: | ---: | --- |
| All | 316 | 494 | 36 | 2003–2026 |
| Whittier | 56 | 87 | 15 | 2018–2026 |
| Twilt | 260 | 439 | 35 | 2003–2026 |

All 494 institutions have usable coordinates; six lack country information. Eleven works reach OpenAlex's 100-authorship cap, so their affiliations may be incomplete. Sixty-three indexed works do not yield an external collaborating affiliation. These are still part of the publication total. OpenAlex includes several scholarly work types, not just journal articles; “indexed publications” does not imply an independently curated bibliography.

## Counting and Colour Rules

- Merge records sharing an OpenAlex work ID or normalized DOI, including transitive duplicates; preserve all PI memberships and contributing co-author affiliations.
- Exclude verified PI authorships when deriving collaborating institutions. A PI's own earlier employer is not a collaboration unless another co-author lists that institution.
- Exclude University of Calgary (I168635309), Alberta Children's Hospital (I2802127220), Alberta Children's Hospital Research Institute (I4389425471), and institutions with one of these ancestors in their OpenAlex lineage.
- Count each institution once per unique work. Institution membership derives from those works, not current employment.
- Red marks Whittier; gold marks Twilt; split red/gold marks an institution or grouped location connected to both. Separate papers can establish Both membership without a jointly authored work.
- Co-located institutions are grouped by coordinates rounded to three decimals for display only. The unrounded coordinates remain in the snapshot. Group details let visitors choose the individual institution.
- PI filters update publication totals, institutions, country counts, details, and year range together. Text search narrows the institution network, not the overall selected PI's publication total.
- Map controls zoom from 1× to 32×; drag to pan after zooming, or use Reset map to return to the world view. Markers retain their visual size as locations spread apart. Filters and search preserve the current map view. Normal wheel scrolling still scrolls the page. With the map focused, plus/minus zoom, arrow keys pan, and Home resets; keyboard-focused off-screen markers are brought into view.
- Invalid/missing coordinates do not produce markers, but the institution remains in the list. Country counts include only mapped institutions with known country codes.

## Map Provenance

Land geometry uses Natural Earth 110m land, public-domain data from the authors' vector repository:

- [Versioned source](https://github.com/nvkelso/natural-earth-vector/blob/693f11422f4e08d2da4566b854dda53eb7c39fb3/geojson/ne_110m_land.geojson)
- Revision: `693f11422f4e08d2da4566b854dda53eb7c39fb3`
- SHA-256: `9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9`
- Local file: `data/world-land.geojson`
- [Public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/)

Markers and land share a simple equirectangular projection. No external tiles, map service, or visitor tracking is required.

## Validation

During development, temporary stdlib Python and Node fixture checks cover DOI/work deduplication, PI membership, home/PI exclusion, complete pagination, failed-refresh preservation, coordinate validation, filtering, counts, and grouped locations. Build the site with the repository's existing Jekyll environment and check the About section at desktop and mobile widths, including keyboard selection, empty search results, and a failed local asset load.

Sources: [OpenAlex authorships](https://help.openalex.org/data/authorships/), [institution geography](https://help.openalex.org/data/institutions/), [authentication](https://help.openalex.org/api/authentication/), and [cursor paging](https://help.openalex.org/api/paging/).
