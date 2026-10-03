---
title: Research
description: Explore our clinical and preclinical bone research projects, imaging equipment, mechanical testing, and collaboration resources.
nav:
  order: 2
  tooltip: Research themes and projects
shortcuts:
  - label: Clinical Projects
    anchor: clinical-projects
  - label: Preclinical Projects
    anchor: preclinical-projects
  - label: Imaging & Resources
    anchor: imaging-resources
equipment_shortcuts:
  - label: Clinical Equipment
    anchor: clinical-equipment
  - label: Preclinical Equipment
    anchor: preclinical-equipment
  - label: Other Resources
    anchor: other-resources
---

<div class="subpage-hero subpage-hero--research">

<h1>Research</h1>

<p>Our work connects clinical imaging and preclinical bone mechanobiology to understand how growing bones develop, adapt, and recover.</p>

</div>

{% include section.html %}

{% include section-shortcuts.html %}

<div class="research-group" id="clinical-projects">
<h2><span class="playful-heading">{% include science-icon.html name="bone-search" %}Clinical Projects</span></h2>
<div class="research-project-grid">
{% include list.html component="project-card" data="projects" filter="tags && tags.include?('clinical')" %}
</div>
<p class="research-context">We combine longitudinal pediatric cohorts, multimodal imaging, and computational analysis to understand bone growth, joint health, and recovery in children and adolescents.</p>
</div>

<div class="research-group" id="preclinical-projects">
<h2><span class="playful-heading">{% include science-icon.html name="microscope" style="gold" %}Preclinical Projects</span></h2>
<div class="research-project-grid">
{% include list.html component="project-card" data="projects" filter="tags && tags.include?('preclinical')" %}
</div>
<p class="research-context">Using experimental models, high-resolution microCT, controlled loading, and image-based biomechanics, we study how growing bones sense and respond to their mechanical environment.</p>
</div>

<div class="research-group" id="imaging-resources">
<h2><span class="playful-heading">{% include science-icon.html name="scan-layers" %}Imaging &amp; Resources</span></h2>
<p class="research-context">Our clinical and preclinical imaging platforms, mechanical testing systems, and 3D printing resources support research from tissue-level structure to whole-bone health.</p>
{% include section-shortcuts.html links=page.equipment_shortcuts label="Equipment categories" nested=true %}
{% include research-equipment.html %}
</div>

<p class="page-return-link"><a href="#top">Back to Research overview ↑</a></p>
