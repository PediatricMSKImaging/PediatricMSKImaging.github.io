---
title: Research
nav:
  order: 2
  tooltip: Research themes and projects
---

<div class="subpage-hero subpage-hero--research">

<h1>Research</h1>

<p>Our work connects clinical imaging and preclinical bone mechanobiology to understand how growing bones develop, adapt, and recover.</p>

</div>

{% include section.html %}

## Research Pillars

<div class="link-grid">
  <a href="{{ 'research/clinical' | relative_url }}">
    <strong>Clinical Research</strong>
    <span>Pediatric cohorts, fracture healing, obesity, and JIA imaging.</span>
  </a>
  <a href="{{ 'research/preclinical' | relative_url }}">
    <strong>Preclinical Research</strong>
    <span>Experimental models of bone mechanobiology during growth.</span>
  </a>
  <a href="{{ 'research/imaging-infrastructure' | relative_url }}">
    <strong>Imaging & Infrastructure</strong>
    <span>Imaging platforms, analysis workflows, and computational tools.</span>
  </a>
</div>

## Projects

{% include list.html component="card" data="projects" filter="group == 'featured'" %}
