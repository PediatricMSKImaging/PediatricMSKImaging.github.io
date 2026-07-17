# Pediatric MSK Lab Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, editable Pediatric Musculoskeletal Imaging Lab website from the existing Jekyll lab template.

**Architecture:** Copy the Greene Lab Jekyll template into the working website directory, then customize content, navigation, data files, member profiles, and visual styling. Keep repeated content in Markdown/YAML so Dr. Whittier can edit research projects, members, publications, news, and images without changing layout code.

**Tech Stack:** Jekyll, Liquid, Markdown, YAML, Sass, Ruby Bundler, template includes from the existing lab website template.

## Global Constraints

- Use the existing Jekyll template rather than rebuilding the site from scratch.
- Make the site public-facing, visually bright, and credible for research audiences.
- Optimize content for prospective graduate students, postdocs, summer students, collaborators, researchers, and family/public readers on the Participate page.
- Keep repeated content data-driven where possible.
- Use replaceable image files in `images/` so final lab images can be inserted later.
- Do not remove the committed design spec at `docs/superpowers/specs/2026-07-07-pediatric-msk-lab-website-design.md`.
- Do not commit generated build output, local brainstorm files, or temporary server files.

---

## File Structure

- Copy from template root into website root: Jekyll config, layouts, includes, plugins, styles, scripts, data folders, content folders, images, Gemfile, lockfile, workflows, and support files.
- Preserve: `docs/superpowers/specs/2026-07-07-pediatric-msk-lab-website-design.md`, `docs/superpowers/plans/2026-07-07-pediatric-msk-lab-website-implementation.md`, and `.gitignore`.
- Modify `_config.yaml`: lab title, description, contact links, social/profile links, default header/footer image.
- Modify `index.md`: custom homepage hero and homepage sections.
- Create `about/index.md`, `join/index.md`, `participate/index.md`, `publications/index.md`, `news/index.md`.
- Modify `research/index.md`, `team/index.md`, `contact/index.md`.
- Modify `_data/projects.yaml`: four research projects with pillar, methods, recruitment, funding, image, and tags.
- Modify `_data/citations.yaml`: seeded highlighted publication entries.
- Modify `_members/*.md`: PI profile, current member samples, past member samples.
- Modify `_posts/*.md`: seed news posts.
- Create `_data/home.yaml`: homepage highlight cards and hero copy.
- Create or replace `images/logo.svg`, `images/hero-placeholder.svg`, `images/project-*.svg`, `images/member-placeholder.svg`, and `images/publication-placeholder.svg`.
- Modify `_styles/-theme.scss`, `_styles/header.scss`, and add `_styles/lab-home.scss`; import new styles from `_styles/all.scss`.
- Add `docs/editing-guide.md`: short guide for future content edits.

---

### Task 1: Copy Template Into Workspace

**Files:**
- Create/Modify: all template files copied from `/Users/daniellewhittier/Repositories/Lab_Repositories/PediatricMSKLab/`
- Preserve: `.gitignore`
- Preserve: `docs/superpowers/specs/2026-07-07-pediatric-msk-lab-website-design.md`
- Preserve: `docs/superpowers/plans/2026-07-07-pediatric-msk-lab-website-implementation.md`

**Interfaces:**
- Consumes: source template directory.
- Produces: runnable Jekyll template in `/Users/daniellewhittier/Documents/Pediatric MSK Lab Website`.

- [ ] **Step 1: Snapshot existing workspace**

Run:

```bash
git status --short
find . -maxdepth 3 -type f | sort
```

Expected: committed design files plus the new unstaged plan file.

- [ ] **Step 2: Copy template files without overwriting docs**

Run:

```bash
rsync -a --exclude '.git/' --exclude '.DS_Store' --exclude '.superpowers/' /Users/daniellewhittier/Repositories/Lab_Repositories/PediatricMSKLab/ /Users/daniellewhittier/Documents/Pediatric\ MSK\ Lab\ Website/
```

Expected: Jekyll template files appear in the workspace. The `docs/` directory remains present.

- [ ] **Step 3: Restore `.gitignore` protection if template copy changes it**

Ensure `.gitignore` contains:

```gitignore
.superpowers/
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
.DS_Store
```

- [ ] **Step 4: Verify template skeleton**

Run:

```bash
test -f _config.yaml
test -f index.md
test -f _includes/header.html
test -f _styles/all.scss
test -f Gemfile
```

Expected: all commands exit with status `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add .
git commit -m "Import lab website template"
```

Expected: commit succeeds with copied template files and current plan.

---

### Task 2: Configure Lab Identity And Navigation

**Files:**
- Modify: `_config.yaml`
- Modify: `about/index.md`
- Modify: `research/index.md`
- Modify: `team/index.md`
- Create: `join/index.md`
- Create: `participate/index.md`
- Create: `publications/index.md`
- Create: `news/index.md`
- Modify: `contact/index.md`
- Modify: `blog/index.md` or remove navigation metadata from it

**Interfaces:**
- Consumes: Jekyll page front matter with `nav.order` and `nav.tooltip`.
- Produces: top navigation in this order: About, Research, Team, Join Us, Participate, Publications, News, Contact.

- [ ] **Step 1: Write a failing navigation check**

Run before edits:

```bash
ruby -e 'require "yaml"; pages=Dir["*/index.md"].map{|f| [f, File.read(f)]}; required={"about/index.md"=>"About","research/index.md"=>"Research","team/index.md"=>"Team","join/index.md"=>"Join Us","participate/index.md"=>"Participate","publications/index.md"=>"Publications","news/index.md"=>"News","contact/index.md"=>"Contact"}; missing=required.reject{|file,title| File.exist?(file) && File.read(file).include?("title: #{title}")}; abort("missing pages: #{missing.keys.join(", ")}") unless missing.empty?'
```

Expected: FAIL listing missing pages because `join`, `participate`, `publications`, and `news` do not exist yet.

- [ ] **Step 2: Update `_config.yaml`**

Set:

```yaml
title: Pediatric Musculoskeletal Imaging Lab
subtitle: University of Calgary
description: We use advanced and multimodal imaging to understand how growing bones develop, adapt, and stay healthy.
header: images/hero-placeholder.svg
footer: images/hero-placeholder.svg
proofer: false
logo-text: true
links:
  email: danielle.whittier@ucalgary.ca
  google-scholar: https://scholar.google.com/
  pubmed: https://pubmed.ncbi.nlm.nih.gov/
  linkedin: https://www.linkedin.com/
```

- [ ] **Step 3: Set page front matter**

Use this front matter order:

```yaml
---
title: About
nav:
  order: 1
  tooltip: About the lab
---
```

Apply matching titles/orders:

```text
Research: 2
Team: 3
Join Us: 4
Participate: 5
Publications: 6
News: 7
Contact: 8
```

- [ ] **Step 4: Remove old Blog navigation**

If `blog/index.md` remains, change its front matter to:

```yaml
---
title: Blog
---
```

- [ ] **Step 5: Run navigation check**

Run:

```bash
ruby -e 'required={"about/index.md"=>"About","research/index.md"=>"Research","team/index.md"=>"Team","join/index.md"=>"Join Us","participate/index.md"=>"Participate","publications/index.md"=>"Publications","news/index.md"=>"News","contact/index.md"=>"Contact"}; missing=required.reject{|file,title| File.exist?(file) && File.read(file).include?("title: #{title}")}; abort("missing pages: #{missing.keys.join(", ")}") unless missing.empty?; puts "navigation pages ok"'
```

Expected: `navigation pages ok`.

- [ ] **Step 6: Commit**

Run:

```bash
git add _config.yaml about research team join participate publications news contact blog
git commit -m "Configure lab identity and navigation"
```

---

### Task 3: Add Editable Research, People, Publication, And News Data

**Files:**
- Modify: `_data/projects.yaml`
- Modify: `_data/citations.yaml`
- Delete or replace: `_members/jane-smith.md`, `_members/john-doe.md`, `_members/sarah-johnson.md`
- Create: `_members/danielle-whittier.md`
- Create: `_members/current-member-sample.md`
- Create: `_members/past-member-sample.md`
- Replace: `_posts/*.md`

**Interfaces:**
- Produces project fields: `title`, `subtitle`, `pillar`, `group`, `image`, `description`, `methods`, `recruiting`, `funding`, `tags`.
- Produces member fields: `name`, `image`, `role`, `status`, `affiliation`, `links`.
- Produces citation entries usable by `{% include citation.html lookup="..." style="rich" %}`.

- [ ] **Step 1: Write failing data check**

Run before edits:

```bash
ruby -ryaml -e 'projects=YAML.load_file("_data/projects.yaml"); required=["Bone mechanoregulation during growth","In vivo assessment of pediatric fracture healing","The impact of childhood obesity on bone strength and growth","Advanced imaging to monitor juvenile idiopathic arthritis"]; missing=required.map{|t| t unless projects.any?{|p| p["title"]==t}}.compact; abort("missing projects: #{missing.join(", ")}") unless missing.empty?'
```

Expected: FAIL listing missing projects.

- [ ] **Step 2: Replace `_data/projects.yaml`**

Use four entries based on the approved descriptions. Include:

```yaml
- title: Bone mechanoregulation during growth
  subtitle: Preclinical bone mechanobiology
  pillar: Preclinical research
  group: featured
  image: images/project-mechanoregulation.svg
  description: This NSERC-funded project investigates how mechanical forces influence bone growth, from cellular-level changes to whole-bone development.
  methods:
    - Murine tibia loading
    - microCT imaging
    - Histology
    - Mechanical assessment
  recruiting: Graduate and undergraduate honours students
  funding: NSERC
  tags:
    - preclinical
    - biomechanics
    - bone-growth
```

```yaml
- title: In vivo assessment of pediatric fracture healing
  subtitle: Longitudinal imaging of bone repair during growth
  pillar: Clinical research
  group: featured
  image: images/project-fracture-healing.svg
  description: This SickKids ECR Operating Grant-funded project investigates how bone repairs itself during pubertal growth following fracture and why healing differs between individuals.
  methods:
    - HR-pQCT imaging
    - Longitudinal cohort follow-up
    - Bone strength assessment
    - Muscle and growth measures
  recruiting: Cohort study participants and trainees interested in pediatric imaging
  funding: SickKids ECR Operating Grant
  tags:
    - clinical
    - fracture-healing
    - hr-pqct

- title: The impact of childhood obesity on bone strength and growth
  subtitle: Imaging and modelling bone adaptation in children and adolescents
  pillar: Clinical research
  group: featured
  image: images/project-obesity-bone.svg
  description: This project uses advanced musculoskeletal imaging and computational modelling to study why children with obesity can have elevated fracture risk despite higher bone mineral density.
  methods:
    - HR-pQCT imaging
    - Computational modelling
    - Body composition measures
    - Biomechanical analysis
  recruiting: Trainees interested in imaging, computation, and pediatric bone health
  funding: Add funding source when ready
  tags:
    - clinical
    - computation
    - obesity

- title: Advanced imaging to monitor juvenile idiopathic arthritis
  subtitle: Earlier insight into joint damage and growing bone
  pillar: Clinical research
  group: featured
  image: images/project-jia-imaging.svg
  description: This project uses multimodal imaging to study bone microarchitecture and erosions in juvenile idiopathic arthritis, with the goal of improving diagnosis, monitoring, and treatment.
  methods:
    - High-resolution imaging
    - Clinical imaging comparison
    - Bone microarchitecture analysis
    - Longitudinal assessment
  recruiting: Collaborators and trainees interested in pediatric rheumatology imaging
  funding: Add funding source when ready
  tags:
    - clinical
    - arthritis
    - multimodal-imaging
```

- [ ] **Step 3: Replace member files**

Create `_members/danielle-whittier.md`:

```markdown
---
name: Danielle Whittier
image: images/member-placeholder.svg
role: pi
status: current
affiliation: University of Calgary
links:
  email: danielle.whittier@ucalgary.ca
  profile: https://profiles.ucalgary.ca/danielle-whittier
---

Dr. Danielle Whittier leads the Pediatric Musculoskeletal Imaging Lab at the University of Calgary. Her research connects clinical imaging and preclinical bone mechanobiology to understand how growing bones develop, adapt, and recover.
```

Create current and past sample files with `status: current` and `status: past`.

- [ ] **Step 4: Seed citation entries**

Replace generated template citations with three hand-editable highlighted entries:

```yaml
- id: highlighted:pediatric-bone-imaging
  title: Highlighted work in pediatric bone imaging
  authors:
    - Danielle Whittier
    - Lab collaborators
  publisher: Add journal or venue
  date: '2026-01-01'
  link: https://profiles.ucalgary.ca/danielle-whittier
- id: highlighted:bone-mechanobiology
  title: Highlighted work in bone mechanobiology
  authors:
    - Danielle Whittier
    - Lab collaborators
  publisher: Add journal or venue
  date: '2026-01-01'
  link: https://profiles.ucalgary.ca/danielle-whittier
- id: highlighted:advanced-msk-imaging
  title: Highlighted work in advanced musculoskeletal imaging
  authors:
    - Danielle Whittier
    - Lab collaborators
  publisher: Add journal or venue
  date: '2026-01-01'
  link: https://profiles.ucalgary.ca/danielle-whittier
```

- [ ] **Step 5: Replace news posts**

Create three posts:

```text
_posts/2026-07-07-welcome-to-the-lab.md
_posts/2026-07-07-research-opportunities.md
_posts/2026-07-07-participate-in-research.md
```

Each post should have front matter with `title`, `date`, `tags`, and one short paragraph.

- [ ] **Step 6: Run data check**

Run:

```bash
ruby -ryaml -e 'projects=YAML.load_file("_data/projects.yaml"); required=["Bone mechanoregulation during growth","In vivo assessment of pediatric fracture healing","The impact of childhood obesity on bone strength and growth","Advanced imaging to monitor juvenile idiopathic arthritis"]; missing=required.map{|t| t unless projects.any?{|p| p["title"]==t}}.compact; abort("missing projects: #{missing.join(", ")}") unless missing.empty?; members=Dir["_members/*.md"].map{|f| File.read(f)}; abort("missing PI") unless members.any?{|m| m.include?("name: Danielle Whittier") && m.include?("role: pi")}; abort("missing current member sample") unless members.any?{|m| m.include?("status: current")}; abort("missing past member sample") unless members.any?{|m| m.include?("status: past")}; puts "data ok"'
```

Expected: `data ok`.

- [ ] **Step 7: Commit**

Run:

```bash
git add _data _members _posts
git commit -m "Seed editable lab content data"
```

---

### Task 4: Build Page Content

**Files:**
- Modify: `about/index.md`
- Modify: `research/index.md`
- Modify: `team/index.md`
- Modify: `join/index.md`
- Modify: `participate/index.md`
- Modify: `publications/index.md`
- Modify: `news/index.md`
- Modify: `contact/index.md`

**Interfaces:**
- Consumes `_data/projects.yaml`, `_data/citations.yaml`, `_members/*.md`, `_posts/*.md`.
- Produces complete public pages that render through existing template includes.

- [ ] **Step 1: Write failing content check**

Run before edits:

```bash
ruby -e 'checks={"about/index.md"=>"bench to bedside and back again","join/index.md"=>"CV/resume","participate/index.md"=>"patient partner","team/index.md"=>"Past Members","publications/index.md"=>"Highlighted Works"}; missing=checks.reject{|file,text| File.exist?(file) && File.read(file).include?(text)}; abort("missing copy: #{missing.map{|k,v| "#{k}:#{v}"}.join(", ")}") unless missing.empty?'
```

Expected: FAIL listing missing copy.

- [ ] **Step 2: Write `about/index.md`**

Include:

```markdown
# About the Lab

The Pediatric Musculoskeletal Imaging Lab studies pediatric bone health through a bench to bedside and back again approach.
```

Add this clinical section:

```markdown
## Clinical Imaging Research

Our clinical research develops multimodal imaging methods to study bone growth and development in pediatric populations affected by chronic and complex diseases.
```

Add this preclinical section:

```markdown
## Preclinical Bone Mechanobiology

Our preclinical research uses experimental models to study bone mechanobiology during growth, with a focus on how disease and external factors influence normal bone behavior.
```

Add this impact section:

```markdown
## Why Pediatric Bone Health

Childhood and adolescence are critical windows for building lifelong skeletal health. By studying bone as it grows, adapts, and recovers, our lab aims to improve how pediatric bone disease and injury are understood, monitored, and treated.
```

- [ ] **Step 3: Write `research/index.md`**

Include:

```liquid
# Research

Our work connects clinical imaging and preclinical bone mechanobiology to understand how growing bones develop, adapt, and recover.

{% include section.html %}

## Research Pillars

## Projects

{% include list.html component="card" data="projects" filter="group == 'featured'" %}
```

- [ ] **Step 4: Write `team/index.md`**

Use collection filters:

```liquid
## Principal Investigator

{% include list.html data="members" component="portrait" filter="role == 'pi'" %}

## Current Members

{% include list.html data="members" component="portrait" filter="status == 'current' and role != 'pi'" %}

## Past Members

{% include list.html data="members" component="portrait" filter="status == 'past'" %}
```

- [ ] **Step 5: Write `join/index.md`**

Include copy inviting graduate students, postdocs, and summer students. Include exact application guidance:

```markdown
When you email, please include your CV/resume, unofficial transcript, a short description of your research interests, and whether you are most interested in computational, imaging, clinical, or experimental work.
```

- [ ] **Step 6: Write `participate/index.md`**

Include plain-language sections:

```markdown
## Participate in a Study
## Become a Patient Partner
## What to Expect
## Contact Us
```

- [ ] **Step 7: Write `publications/index.md`**

Use:

```liquid
## Highlighted Works

{% include citation.html lookup="Highlighted work in pediatric bone imaging" style="rich" %}
{% include citation.html lookup="Highlighted work in bone mechanobiology" style="rich" %}
{% include citation.html lookup="Highlighted work in advanced musculoskeletal imaging" style="rich" %}

## Publication Profiles
```

- [ ] **Step 8: Write `news/index.md` and `contact/index.md`**

Use existing `post-excerpt` list for news and practical contact sections for collaborators, trainees, and families.

- [ ] **Step 9: Run content check**

Run:

```bash
ruby -e 'checks={"about/index.md"=>"bench to bedside and back again","join/index.md"=>"CV/resume","participate/index.md"=>"patient partner","team/index.md"=>"Past Members","publications/index.md"=>"Highlighted Works"}; missing=checks.reject{|file,text| File.exist?(file) && File.read(file).include?(text)}; abort("missing copy: #{missing.map{|k,v| "#{k}:#{v}"}.join(", ")}") unless missing.empty?; puts "content ok"'
```

Expected: `content ok`.

- [ ] **Step 10: Commit**

Run:

```bash
git add about research team join participate publications news contact
git commit -m "Add lab website page content"
```

---

### Task 5: Build Homepage And Visual Layer

**Files:**
- Create: `_data/home.yaml`
- Modify: `index.md`
- Modify: `_styles/-theme.scss`
- Modify: `_styles/header.scss`
- Create: `_styles/lab-home.scss`
- Modify: `_styles/all.scss`
- Replace/Create: `images/logo.svg`, `images/hero-placeholder.svg`, `images/project-mechanoregulation.svg`, `images/project-fracture-healing.svg`, `images/project-obesity-bone.svg`, `images/project-jia-imaging.svg`, `images/member-placeholder.svg`, `images/publication-placeholder.svg`

**Interfaces:**
- Consumes home data fields: `hero.headline`, `hero.lede`, `hero.primary_button`, `hero.secondary_button`, `highlights`.
- Produces bright homepage inspired by the provided mockup.

- [ ] **Step 1: Write failing homepage check**

Run before edits:

```bash
ruby -e 'home=File.exist?("_data/home.yaml") ? File.read("_data/home.yaml") : ""; index=File.read("index.md"); required=["Imaging today. Stronger tomorrows.","Clinical Cohorts","Multimodal Imaging","Preclinical Research","Stronger Impact"]; missing=required.reject{|text| home.include?(text) || index.include?(text)}; abort("missing homepage elements: #{missing.join(", ")}") unless missing.empty?'
```

Expected: FAIL listing missing homepage elements.

- [ ] **Step 2: Create `_data/home.yaml`**

Use:

```yaml
hero:
  headline: Imaging today. Stronger tomorrows.
  lede: We use advanced and multimodal imaging to understand how growing bones develop, adapt, and stay healthy.
  primary_button:
    text: Our Research
    link: research
  secondary_button:
    text: Join Our Lab
    link: join
highlights:
  - title: Clinical Cohorts
    text: Following children and adolescents over time.
    icon: fa-solid fa-user-doctor
  - title: Multimodal Imaging
    text: Across scales, modalities, and models.
    icon: fa-solid fa-microscope
  - title: Preclinical Research
    text: Mechanobiology in action during growth.
    icon: fa-solid fa-dna
  - title: Stronger Impact
    text: Better bone health for life.
    icon: fa-solid fa-heart-pulse
```

- [ ] **Step 3: Replace `index.md`**

Build a Liquid homepage with:

```liquid
---
---

<section class="lab-hero">
  <div class="lab-hero__copy">
    <h1>{{ site.data.home.hero.headline }}</h1>
    <p>{{ site.data.home.hero.lede }}</p>
  </div>
</section>
```

Add buttons with the existing `button.html` include, a `lab-hero__visual` region containing `images/hero-placeholder.svg`, and this loop:

```liquid
<section class="lab-highlights">
  {% for highlight in site.data.home.highlights %}
    <article class="lab-highlight">
      {% include icon.html icon=highlight.icon %}
      <h2>{{ highlight.title }}</h2>
      <p>{{ highlight.text }}</p>
    </article>
  {% endfor %}
</section>
```

- [ ] **Step 4: Add SVG image assets**

Create simple SVG placeholders with bright blue, teal, coral, yellow, and white. Each SVG must include a `<title>` element describing what to replace it with.

- [ ] **Step 5: Add homepage styles**

Create `_styles/lab-home.scss` with classes:

```scss
.lab-hero {}
.lab-hero__copy {}
.lab-hero__visual {}
.lab-highlights {}
.lab-highlight {}
```

Set responsive rules so the hero stacks on small screens and does not overlap.

- [ ] **Step 6: Import styles**

Add to `_styles/all.scss`:

```scss
@import "lab-home";
```

- [ ] **Step 7: Run homepage check**

Run:

```bash
ruby -e 'home=File.read("_data/home.yaml"); index=File.read("index.md"); required=["Imaging today. Stronger tomorrows.","Clinical Cohorts","Multimodal Imaging","Preclinical Research","Stronger Impact"]; missing=required.reject{|text| home.include?(text) || index.include?(text)}; abort("missing homepage elements: #{missing.join(", ")}") unless missing.empty?; puts "homepage ok"'
```

Expected: `homepage ok`.

- [ ] **Step 8: Commit**

Run:

```bash
git add _data/home.yaml index.md _styles images
git commit -m "Create bright pediatric imaging homepage"
```

---

### Task 6: Add Future Editing Guide

**Files:**
- Create: `docs/editing-guide.md`
- Modify: `README.md`

**Interfaces:**
- Produces documentation that tells future editors where to change content and images.

- [ ] **Step 1: Write failing docs check**

Run:

```bash
ruby -e 'abort("missing editing guide") unless File.exist?("docs/editing-guide.md"); text=File.read("docs/editing-guide.md"); ["Research projects","Team members","News posts","Homepage","Images"].each{|section| abort("missing #{section}") unless text.include?(section)}'
```

Expected: FAIL because `docs/editing-guide.md` does not exist.

- [ ] **Step 2: Create `docs/editing-guide.md`**

Include sections:

```markdown
# Editing Guide

## Homepage
Edit `_data/home.yaml` and replace images in `images/`.

## Research projects
Edit `_data/projects.yaml`.

## Team members
Add or edit files in `_members/`.

## News posts
Add Markdown files to `_posts/` using `YYYY-MM-DD-title.md`.

## Publications
Edit `_data/citations.yaml`.

## Images
Replace SVG placeholders in `images/` with final image files and update the corresponding YAML path if the filename changes.
```

- [ ] **Step 3: Update `README.md`**

Set title and link to the editing guide:

```markdown
# Pediatric Musculoskeletal Imaging Lab Website

Local editable website for the Pediatric Musculoskeletal Imaging Lab.

See `docs/editing-guide.md` for common content updates.
```

- [ ] **Step 4: Run docs check**

Run:

```bash
ruby -e 'abort("missing editing guide") unless File.exist?("docs/editing-guide.md"); text=File.read("docs/editing-guide.md"); ["Research projects","Team members","News posts","Homepage","Images"].each{|section| abort("missing #{section}") unless text.include?(section)}; puts "docs ok"'
```

Expected: `docs ok`.

- [ ] **Step 5: Commit**

Run:

```bash
git add README.md docs/editing-guide.md
git commit -m "Document website editing workflow"
```

---

### Task 7: Build And Serve Locally

**Files:**
- Modify only if build failures reveal issues in prior tasks.

**Interfaces:**
- Consumes Gemfile and Jekyll site.
- Produces a local URL for review.

- [ ] **Step 1: Run Jekyll build**

Run:

```bash
bundle exec jekyll build
```

Expected: site builds into `_site` without Liquid errors.

- [ ] **Step 2: If bundle dependencies are unavailable, install locally**

Run only if Step 1 fails because gems are missing:

```bash
bundle install
bundle exec jekyll build
```

Expected: build succeeds. If network access is blocked, request escalation and rerun `bundle install`.

- [ ] **Step 3: Check built pages**

Run:

```bash
test -f _site/index.html
test -f _site/about/index.html
test -f _site/research/index.html
test -f _site/team/index.html
test -f _site/join/index.html
test -f _site/participate/index.html
test -f _site/publications/index.html
test -f _site/news/index.html
test -f _site/contact/index.html
```

Expected: all commands exit with status `0`.

- [ ] **Step 4: Start local server**

Run:

```bash
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Expected: server prints `Server address: http://127.0.0.1:4000/` or similar. Keep the process running for user review.

- [ ] **Step 5: Commit final build fixes**

If any source files changed during validation, run:

```bash
git add .
git commit -m "Validate local lab website build"
```

Expected: commit succeeds only if source files changed. Do not commit `_site/`, `.jekyll-cache/`, or generated metadata.
