---
---

<!-- <size>full</size> -->

<div class="lab-hero">
  <div class="lab-hero__copy">
    <h1 class="lab-hero__headline">
      {% for line in site.data.home.hero.headline %}
        <span {% if line.accent %}class="lab-hero__headline-accent"{% endif %}>{{ line.text }}</span>
      {% endfor %}
    </h1>
    <p>{{ site.data.home.hero.lede }}</p>
    <div class="lab-hero__actions">
      {%
        include button.html
        link=site.data.home.hero.primary_button.link
        text=site.data.home.hero.primary_button.text
        icon="fa-solid fa-arrow-right"
        flip=true
      %}
      {%
        include button.html
        link=site.data.home.hero.secondary_button.link
        text=site.data.home.hero.secondary_button.text
        icon="fa-solid fa-people-group"
        style="secondary"
      %}
    </div>
  </div>
  <div class="lab-hero__visual">
    <svg class="lab-hero__clip-defs" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="lab-hero-rounded-hex" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.02 Q0.53,0.02 0.56,0.04 L0.91,0.24 Q0.94,0.26 0.94,0.3 V0.7 Q0.94,0.74 0.91,0.76 L0.56,0.96 Q0.53,0.98 0.5,0.98 Q0.47,0.98 0.44,0.96 L0.09,0.76 Q0.06,0.74 0.06,0.7 V0.3 Q0.06,0.26 0.09,0.24 L0.44,0.04 Q0.47,0.02 0.5,0.02 Z" />
        </clipPath>
      </defs>
    </svg>
    <img class="lab-hero__doodle lab-hero__doodle--rocket" src="{{ 'images/doodle-rocket.svg' | relative_url }}" alt="">
    <img class="lab-hero__doodle lab-hero__doodle--star" src="{{ 'images/doodle-star.svg' | relative_url }}" alt="">
    <img class="lab-hero__doodle lab-hero__doodle--sparkle" src="{{ 'images/doodle-sparkle.svg' | relative_url }}" alt="">
    <span class="lab-hero__shape lab-hero__shape--red" aria-hidden="true"></span>
    <span class="lab-hero__shape lab-hero__shape--gold" aria-hidden="true"></span>
    <span class="lab-hero__shape lab-hero__shape--outline" aria-hidden="true"></span>
    <div class="lab-hero__hexgrid" aria-label="Homepage research imagery">
      {% for circle in site.data.home.hero.circles limit:4 %}
        <figure class="lab-hero__hex lab-hero__hex--{{ circle.style }}">
          <img src="{{ circle.image | relative_url }}" alt="{{ circle.alt }}">
        </figure>
      {% endfor %}
    </div>
  </div>
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
