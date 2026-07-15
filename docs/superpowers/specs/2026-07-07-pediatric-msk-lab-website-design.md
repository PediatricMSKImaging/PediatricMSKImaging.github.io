# Pediatric Musculoskeletal Imaging Lab Website Design

## Goal

Create a local, editable version of the Pediatric Musculoskeletal Imaging Lab website using the existing Jekyll lab website template as the foundation. The site should be public-facing, visually bright, and credible for research audiences, with primary emphasis on recruiting excellent trainees and demonstrating the lab's work to collaborators and researchers.

## Audience

The primary audiences are prospective graduate students, postdocs, summer students, research collaborators, and academic/clinical researchers. The site should also be understandable to families and members of the public, especially on the Participate page.

## Visual Direction

The first version will use a bright pediatric bone health identity inspired by the provided mockup: blue-forward branding, cheerful accent colors, a strong first-screen hero, and replaceable image areas for pediatric/research/imaging visuals. The site should feel warm and trainee-friendly while still showing sophisticated imaging, computational, clinical, and preclinical research.

The homepage hero will include:

- Lab name and a compact visual identity area.
- Headline based on "Imaging today. Stronger tomorrows."
- Short description of advanced multimodal imaging for growing bones.
- Calls to action for `Our Research` and `Join Our Lab`.
- Replaceable hero image area with placeholder overlays for imaging visuals.

## Site Structure

The navigation will be:

- About
- Research
- Team
- Join Us
- Participate
- Publications
- News
- Contact

The homepage will summarize the lab through four signals:

- Clinical cohorts
- Multimodal imaging
- Preclinical research
- Stronger pediatric bone health impact

## Page Content

### About

Introduce the Pediatric Musculoskeletal Imaging Lab and its "bench to bedside and back again" approach. Present the lab as having two connected pillars:

- Clinical research: developing multimodal imaging methods to study bone growth and development in pediatric populations affected by chronic and complex diseases.
- Preclinical research: using experimental models to study bone mechanobiology during bone growth, including how disease and external factors influence normal bone behavior.

### Research

Organize research around the two pillars and seed four editable projects:

- Bone mechanoregulation during growth.
- In vivo assessment of pediatric fracture healing.
- The impact of childhood obesity on bone strength and growth.
- Advanced imaging to monitor juvenile idiopathic arthritis.

Each project should support a short summary, longer description, methods/keywords, recruitment status, funding note where available, and a replaceable image.

### Team

Include Dr. Danielle Whittier as PI, plus placeholder entries for current members and past members. The structure should make it easy to add individual lab members later by editing Markdown files in `_members`.

### Join Us

Create an evergreen recruitment page for general inquiries from graduate students, postdocs, and summer students. It should invite STEM trainees, especially engineering, computer science, biological sciences, biomedical sciences, and biomechanics backgrounds. It should ask interested trainees to email a CV/resume and unofficial transcript. It should include a clearly marked area for future specific job postings.

### Participate

Create a family/public-facing page for cohort study participation and patient partner engagement. The language should be plain and welcoming. It should distinguish study participation from trainee recruitment and explain that patient partners and community members can help shape research questions, study design, interpretation, and communication.

### Publications

Seed highlighted works and retain links to Google Scholar and PubMed. The first version will use template-compatible citation entries so highlighted works can render in the existing publication components, with clear separation between highlighted works and all publications.

### News

Include placeholder news posts so the page is structurally ready for lab updates, recruitment announcements, publications, awards, and study participation notices.

### Contact

Use UCalgary contact information and affiliations from Dr. Whittier's profile, including email and office phone. The page should include practical contact paths for collaborators, prospective trainees, and families interested in participation.

## Adaptability Requirements

Repeated content should remain data-driven where possible:

- Research/project cards in `_data/projects.yaml`.
- Team members as individual Markdown files in `_members`.
- News items as Markdown posts in `_posts`.
- Publication highlights in template-compatible citation data.
- Replaceable image placeholders in `images/`.
- Site title, description, links, and navigation metadata in config/front matter.

The first local version should include complete placeholder content and image placeholders so the site can be reviewed visually before final lab images and detailed text are available.

## Technical Approach

Use the existing Jekyll template rather than rebuilding the site from scratch. Copy the template into the working website directory, then customize content, navigation, theme variables/styles, data files, and selected includes/layouts as needed.

Keep changes focused on:

- Branding and visual styling.
- Homepage layout inspired by the provided example.
- New and revised pages.
- Editable project, member, publication, and news content.
- Documentation for future edits.

## Validation

After implementation, build or serve the Jekyll site locally if dependencies allow. Verify that the main navigation pages render and that the editable content lives in the expected Markdown/YAML locations.

## Open Decisions

The first implementation will use placeholder imagery. Final imagery, detailed project copy, exact highlighted publications, final team roster, and any active recruitment postings can be edited later without changing the overall structure.
