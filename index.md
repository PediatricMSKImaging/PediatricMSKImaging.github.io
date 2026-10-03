---
description: Understanding how bones grow, adapt, and stay healthy using advanced imaging at the University of Calgary's Pediatric MSK Imaging Lab.
---

<!-- <size>full</size> -->

<div class="lab-hero lab-hero--model">
  <div class="lab-hero__copy">
    <h1 class="lab-hero__headline">
      {% for line in site.data.home.hero.headline %}
        <span class="{% if line.accent %}lab-hero__headline-accent{% endif %}{% if line.playful %} lab-hero__headline-playful{% endif %}">{{ line.text }}</span>
      {% endfor %}
    </h1>
    <p>{{ site.data.home.hero.lede }}</p>
    <div class="lab-hero__actions">
      {%
        include button.html
        link=site.data.home.hero.primary_button.link
        text=site.data.home.hero.primary_button.text
        icon="science-icons/bone-search.svg"
        tooltip="Explore our research"
        flip=true
      %}
      {%
        include button.html
        link=site.data.home.hero.secondary_button.link
        text=site.data.home.hero.secondary_button.text
        icon="science-icons/family.svg"
        style="secondary"
      %}
    </div>
    <p class="lab-hero__trainee-link">Interested in research training? <a href="{{ '/join/' | relative_url }}" aria-label="JOIN OUR LAB">Join our lab</a></p>
  </div>
  {% include bone-viewer.html %}
</div>

<div class="lab-highlights" aria-label="Homepage highlights">
  {% for highlight in site.data.home.highlights %}
    <a class="lab-highlight" href="{{ highlight.link | relative_url }}">
      <div class="lab-highlight__icon">
        {% include icon.html icon=highlight.icon %}
      </div>
      <h2>{{ highlight.title }}</h2>
      <p>{{ highlight.text }}</p>
    </a>
  {% endfor %}
</div>
