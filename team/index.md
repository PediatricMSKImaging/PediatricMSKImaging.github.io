---
title: Team
description: Meet principal investigators Danielle Whittier and Marinka Twilt, current lab members, and alumni of the Pediatric MSK Imaging Lab.
nav:
  order: 3
  tooltip: Lab members and alumni
shortcuts:
  - label: Principal Investigators
    anchor: principal-investigators
  - label: Current Members
    anchor: current-members
  - label: Past Members
    anchor: past-members
---

<div class="team-intro-band">

<h1>Team</h1>

<p>Meet the people behind the lab, including the principal investigators, current members, and alumni.</p>

</div>

{% include section.html %}

{% include section-shortcuts.html %}

<div class="team-page">

<h2 id="principal-investigators">Principal Investigators</h2>

<div class="team-section team-section--pi">
{% include list.html data="members" component="portrait" filter="role == 'pi'" style="team-featured" %}
</div>

<h2 id="current-members">Current Members</h2>

<div class="team-grid team-grid--current">
{% include list.html data="members" component="portrait" filter="status == 'current' and role == 'research-coordinator'" style="team-card" %}
{% include list.html data="members" component="portrait" filter="status == 'current' and role == 'pediatric-mrt'" style="team-card" %}
{% include list.html data="members" component="portrait" filter="status == 'current' and role == 'postdoc'" style="team-card" %}
{% include list.html data="members" component="portrait" filter="status == 'current' and role == 'phd'" style="team-card" %}
{% include list.html data="members" component="portrait" filter="status == 'current' and role == 'masters'" style="team-card" %}
{% include list.html data="members" component="portrait" filter="status == 'current' and role == 'undergrad'" style="team-card" %}
</div>

<h2 id="past-members">Past Members</h2>

<div class="team-grid team-grid--past">
{% include list.html data="members" component="portrait" filter="status == 'past' and role == 'postdoc'" style="team-alumni" %}
{% include list.html data="members" component="portrait" filter="status == 'past' and (role == 'phd' or role == 'masters')" style="team-alumni" %}
{% include list.html data="members" component="portrait" filter="status == 'past' and role == 'undergrad'" style="team-alumni" %}
</div>

<div class="team-photo-callout">
  <div>
    <strong>Lab Photos</strong>
    <span>Team moments, lab life, and event snapshots.</span>
  </div>
  {% include button.html text="View Lab Photos" link="/team/lab-photos/" %}
</div>

</div>
