---
title: News
nav:
  order: 7
  tooltip: Lab updates and announcements
---

<div class="subpage-hero subpage-hero--news">

<h1>News</h1>

<p>News, updates, trainee opportunities, and community announcements appear below.</p>

</div>

{% include section.html %}

{% include list.html data="posts" component="post-excerpt" filter="tags && tags.include?('news')" %}
