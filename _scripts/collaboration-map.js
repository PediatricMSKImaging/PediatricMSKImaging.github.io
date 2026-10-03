(() => {
  const projectCoordinate = (longitude, latitude) => {
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)
      || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return null;
    return { x: (longitude + 180) * 960 / 360, y: (90 - latitude) * 480 / 180 };
  };

  const selectNetwork = (snapshot, piId = "all", query = "") => {
    const selectedPi = snapshot.pis.some((pi) => pi.id === piId) ? piId : "all";
    const works = snapshot.works.filter((work) => selectedPi === "all" || work.pi_ids.includes(selectedPi));
    const workMap = new Map(works.map((work) => [work.id, work]));
    const search = query.trim().toLocaleLowerCase();
    const institutions = snapshot.institutions.map((institution) => {
      const workIds = institution.work_ids.filter((workId) => workMap.has(workId));
      const piIds = snapshot.pis.map((pi) => pi.id)
        .filter((piId) => workIds.some((workId) => workMap.get(workId).pi_ids.includes(piId)));
      return { ...institution, work_ids: workIds,
        pi_ids: selectedPi === "all" ? piIds : [selectedPi] };
    }).filter((institution) => institution.work_ids.length > 0
      && [institution.name, institution.city, institution.country].filter(Boolean)
        .join(" ").toLocaleLowerCase().includes(search))
      .sort((first, second) => first.name.localeCompare(second.name));
    const mapped = institutions.filter((institution) => projectCoordinate(institution.longitude, institution.latitude));
    const years = works.map((work) => work.year).filter(Number.isInteger);
    return {
      works, institutions,
      totals: { publications: works.length, mappedInstitutions: mapped.length,
        countries: new Set(mapped.map((institution) => institution.country_code).filter(Boolean)).size,
        unmappedInstitutions: institutions.length - mapped.length,
        unknownCountries: mapped.filter((institution) => !institution.country_code).length },
      yearRange: years.length ? [Math.min(...years), Math.max(...years)] : null,
    };
  };

  const groupLocations = (institutions) => {
    const groups = new Map();
    institutions.forEach((institution) => {
      if (!projectCoordinate(institution.longitude, institution.latitude)) return;
      const key = institution.latitude.toFixed(3) + "," + institution.longitude.toFixed(3);
      if (!groups.has(key)) groups.set(key, { key, latitude: institution.latitude,
        longitude: institution.longitude, institutionIds: [] });
      groups.get(key).institutionIds.push(institution.id);
    });
    return [...groups.values()];
  };

  const mapViewport = (zoom = 1, centerX = 480, centerY = 240) => {
    const scale = Math.max(1, Math.min(32, zoom));
    const width = 960 / scale;
    const height = 480 / scale;
    const horizontal = Math.max(width / 2, Math.min(960 - width / 2, centerX));
    const vertical = Math.max(height / 2, Math.min(480 - height / 2, centerY));
    return { zoom: scale, centerX: horizontal, centerY: vertical,
      x: horizontal - width / 2, y: vertical - height / 2, width, height };
  };
  const zoomViewport = (viewport, factor) => mapViewport(viewport.zoom * factor, viewport.centerX, viewport.centerY);
  const panViewport = (viewport, horizontal, vertical) => mapViewport(viewport.zoom,
    viewport.centerX + horizontal, viewport.centerY + vertical);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { selectNetwork, projectCoordinate, groupLocations, mapViewport, zoomViewport, panViewport };
  }
  if (typeof document === "undefined") return;

  const initialize = async () => {
    const region = document.querySelector("[data-collaboration-network]");
    if (!region) return;
    const status = region.querySelector("[data-network-status]");
    const content = region.querySelector("[data-network-content]");
    const fallback = region.querySelector("[data-network-fallback]");
    try {
      const load = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Local map data could not load");
        return response.json();
      };
      const [snapshot, land] = await Promise.all([load(region.dataset.snapshot), load(region.dataset.land)]);
      if (snapshot.schema_version !== 1 || !Array.isArray(snapshot.works)
        || !Array.isArray(snapshot.institutions) || !Array.isArray(snapshot.pis)
        || !Array.isArray(land.features)) throw new Error("Invalid map data");
      const svgNamespace = "http://www.w3.org/2000/svg";
      const svg = region.querySelector("[data-network-map]");
      const landLayer = svg.querySelector("[data-network-land]");
      const markerLayer = svg.querySelector("[data-network-markers]");
      const list = region.querySelector("[data-network-list]");
      const details = region.querySelector("[data-network-details]");
      const search = region.querySelector("[data-network-search]");
      const explorerDisclosure = region.querySelector("[data-network-explorer]");
      const filterButtons = region.querySelectorAll("[data-network-pi]");
      const zoomIn = region.querySelector("[data-network-zoom-in]");
      const zoomOut = region.querySelector("[data-network-zoom-out]");
      const resetMap = region.querySelector("[data-network-reset]");
      let viewport = mapViewport();
      let drag = null;
      let suppressClick = false;
      let selectedPi = "all";
      let selectedInstitution = null;
      let selectedGroup = null;
      let network;
      const piLabels = { whittier: "Whittier", twilt: "Twilt" };
      const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
      };
      const svgElement = (tag, attributes) => {
        const node = document.createElementNS(svgNamespace, tag);
        Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
        return node;
      };
      const placeName = (institution) => [institution.city, institution.country].filter(Boolean).join(", ")
        || "Location not available";
      const membership = (piIds) => piIds.length === 2 ? "both" : piIds[0];
      const badge = (institution) => element("span", "collaboration-network__badge collaboration-network__badge--"
        + membership(institution.pi_ids), institution.pi_ids.map((piId) => piLabels[piId]).join(" + "));
      const safePublicationUrl = (value) => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" && ["doi.org", "openalex.org"].includes(url.hostname)
            && !url.username && !url.password ? url.href : null;
        } catch { return null; }
      };
      land.features.forEach((feature) => {
        const geometry = feature.geometry;
        const polygons = geometry.type === "Polygon" ? [geometry.coordinates]
          : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
        const paths = polygons.map((polygon) => polygon.map((ring) => ring.map((coordinate, index) => {
          const point = projectCoordinate(coordinate[0], coordinate[1]);
          if (!point) throw new Error("Invalid land coordinates");
          return (index === 0 ? "M" : "L") + point.x.toFixed(2) + " " + point.y.toFixed(2);
        }).join(" ") + " Z").join(" ")).join(" ");
        if (paths) landLayer.append(svgElement("path", { d: paths, "fill-rule": "evenodd" }));
      });

      const updateViewport = () => {
        svg.setAttribute("viewBox", [viewport.x, viewport.y, viewport.width, viewport.height].join(" "));
        svg.classList.toggle("is-zoomed", viewport.zoom > 1);
        markerLayer.querySelectorAll("[data-marker-glyph]").forEach((glyph) => {
          glyph.setAttribute("transform", `scale(${1 / viewport.zoom})`);
        });
        zoomIn.disabled = viewport.zoom >= 32;
        zoomOut.disabled = viewport.zoom <= 1;
        resetMap.disabled = viewport.zoom <= 1;
        region.querySelector("[data-network-zoom-level]").textContent = viewport.zoom + "×";
      };
      const changeZoom = (factor) => {
        viewport = zoomViewport(viewport, factor);
        updateViewport();
      };
      zoomIn.addEventListener("click", () => changeZoom(2));
      zoomOut.addEventListener("click", () => changeZoom(.5));
      resetMap.addEventListener("click", () => { viewport = mapViewport(); updateViewport(); });
      svg.addEventListener("pointerdown", (event) => {
        suppressClick = false;
        if (viewport.zoom <= 1 || event.button !== 0 || !event.isPrimary) return;
        drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY,
          viewport, moved: false };
      });
      svg.addEventListener("pointermove", (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        const horizontal = event.clientX - drag.clientX;
        const vertical = event.clientY - drag.clientY;
        if (!drag.moved && Math.hypot(horizontal, vertical) < 5) return;
        drag.moved = true;
        suppressClick = true;
        svg.setPointerCapture(event.pointerId);
        svg.classList.add("is-dragging");
        const bounds = svg.getBoundingClientRect();
        viewport = panViewport(drag.viewport, -horizontal * drag.viewport.width / bounds.width,
          -vertical * drag.viewport.height / bounds.height);
        updateViewport();
      });
      const finishDrag = (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        drag = null;
        svg.classList.remove("is-dragging");
        if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
      };
      svg.addEventListener("pointerup", finishDrag);
      svg.addEventListener("pointercancel", finishDrag);
      svg.addEventListener("lostpointercapture", (event) => {
        if (event.target === svg) finishDrag(event);
      });
      svg.addEventListener("pointerleave", (event) => {
        if (drag && !drag.moved) finishDrag(event);
      });
      svg.addEventListener("click", (event) => {
        if (!suppressClick) return;
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      }, true);
      svg.addEventListener("keydown", (event) => {
        if (event.target !== svg) return;
        if (["+", "="].includes(event.key)) changeZoom(2);
        else if (event.key === "-") changeZoom(.5);
        else if (event.key === "Home") { viewport = mapViewport(); updateViewport(); }
        else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) && viewport.zoom > 1) {
          viewport = panViewport(viewport,
            event.key === "ArrowLeft" ? -viewport.width / 5 : event.key === "ArrowRight" ? viewport.width / 5 : 0,
            event.key === "ArrowUp" ? -viewport.height / 5 : event.key === "ArrowDown" ? viewport.height / 5 : 0);
          updateViewport();
        } else return;
        event.preventDefault();
      });

      const renderDetails = () => {
        details.replaceChildren();
        const institution = network.institutions.find((item) => item.id === selectedInstitution);
        if (!institution) {
          details.append(element("h3", "", "Explore a collaboration"),
            element("p", "", "Select a marker or an institution to see the publications connecting us."));
          return;
        }
        if (selectedGroup && selectedGroup.institutionIds.length > 1) {
          const label = element("label", "collaboration-network__group-label", "Institutions at this location");
          const select = element("select", "collaboration-network__group-select");
          select.setAttribute("aria-label", "Institutions at this location");
          selectedGroup.institutionIds.forEach((institutionId) => {
            const item = network.institutions.find((item) => item.id === institutionId);
            const option = element("option", "", item.name);
            option.value = item.id;
            select.append(option);
          });
          select.value = institution.id;
          select.addEventListener("change", () => {
            selectedInstitution = select.value;
            updateSelection();
            renderDetails();
            details.querySelector(".collaboration-network__group-select").focus();
          });
          label.append(select);
          details.append(label);
        }
        details.append(element("h3", "", institution.name), badge(institution),
          element("p", "collaboration-network__place", placeName(institution)),
          element("p", "collaboration-network__shared-count", institution.work_ids.length
            + (institution.work_ids.length === 1 ? " linked publication" : " linked publications")));
        const workIds = new Set(institution.work_ids);
        const linkedWorks = network.works.filter((work) => workIds.has(work.id))
          .sort((first, second) => (second.year || 0) - (first.year || 0) || first.title.localeCompare(second.title));
        snapshot.pis.filter((pi) => selectedPi === "all" || selectedPi === pi.id).forEach((pi) => {
          const publications = linkedWorks.filter((work) => work.pi_ids.includes(pi.id));
          if (!publications.length) return;
          details.append(element("h4", "collaboration-network__pi-heading", pi.name + " · " + publications.length));
          const publicationList = element("ul", "collaboration-network__publications");
          publications.forEach((work) => {
            const item = element("li");
            const url = safePublicationUrl(work.url);
            const title = element(url ? "a" : "span", "", work.title);
            if (url) { title.href = url; title.target = "_blank"; title.rel = "noopener noreferrer"; }
            item.append(title, element("span", "collaboration-network__year", (work.year || "Year not indexed")
              + (work.pi_ids.length === 2 ? " · Co-authored by both PIs" : "")));
            publicationList.append(item);
          });
          details.append(publicationList);
        });
      };

      const updateSelection = () => {
        list.querySelectorAll("button").forEach((button) => {
          button.setAttribute("aria-pressed", String(button.dataset.institution === selectedInstitution));
        });
        markerLayer.querySelectorAll("[data-location]").forEach((marker) => {
          const selected = selectedGroup && marker.dataset.location === selectedGroup.key;
          marker.classList.toggle("is-selected", Boolean(selected));
          marker.setAttribute("aria-pressed", String(Boolean(selected)));
        });
      };

      const selectInstitution = (institutionId, group) => {
        if (explorerDisclosure) explorerDisclosure.open = true;
        selectedInstitution = institutionId;
        selectedGroup = group;
        updateSelection();
        renderDetails();
        status.textContent = "Selected " + network.institutions.find((item) => item.id === institutionId).name
          + ". Publication details follow the institution list.";
      };

      const render = () => {
        network = selectNetwork(snapshot, selectedPi, search.value);
        if (!network.institutions.some((institution) => institution.id === selectedInstitution)) {
          selectedInstitution = null;
          selectedGroup = null;
        }
        const groups = groupLocations(network.institutions);
        selectedGroup = groups.find((group) => group.institutionIds.includes(selectedInstitution)) || null;
        filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.networkPi === selectedPi)));
        region.querySelector("[data-total-publications]").textContent = network.totals.publications;
        region.querySelector("[data-total-institutions]").textContent = network.totals.mappedInstitutions;
        region.querySelector("[data-total-countries]").textContent = network.totals.countries;
        const yearRange = network.yearRange ? network.yearRange.join("–") : "Years not indexed";
        region.querySelector("[data-network-years]").textContent = yearRange;
        const selectedName = selectedPi === "all" ? "Both PIs" : piLabels[selectedPi];
        region.querySelector("[data-network-scope]").textContent = selectedName + " · Full publication history";
        const disclosure = [network.totals.unmappedInstitutions + " institutions without mapped coordinates."];
        if (network.totals.unknownCountries) disclosure.push(network.totals.unknownCountries + " mapped institutions without country information.");
        region.querySelector("[data-network-unmapped]").textContent = disclosure.join(" ");
        status.textContent = network.institutions.length + " institutions shown for " + selectedName
          + (search.value.trim() ? " matching your search." : ".");
        list.replaceChildren();
        markerLayer.replaceChildren();
        const institutionMap = new Map(network.institutions.map((institution) => [institution.id, institution]));
        network.institutions.forEach((institution) => {
          const item = element("li");
          const button = element("button", "collaboration-network__institution");
          button.type = "button";
          button.dataset.institution = institution.id;
          button.append(element("strong", "", institution.name),
            element("span", "collaboration-network__place", placeName(institution)), badge(institution));
          button.addEventListener("click", () => selectInstitution(institution.id,
            groups.find((group) => group.institutionIds.includes(institution.id)) || null));
          item.append(button);
          list.append(item);
        });
        if (!network.institutions.length) list.append(element("li", "collaboration-network__empty", "No matching institutions. Try another search or PI filter."));
        const priority = (group) => {
          const piIds = new Set(group.institutionIds.flatMap((id) => institutionMap.get(id).pi_ids));
          return piIds.size === 2 ? 2 : piIds.has("whittier") ? 1 : 0;
        };
        groups.sort((first, second) => priority(first) - priority(second)).forEach((group) => {
          const items = group.institutionIds.map((id) => institutionMap.get(id));
          const piIds = snapshot.pis.map((pi) => pi.id).filter((piId) => items.some((item) => item.pi_ids.includes(piId)));
          const point = projectCoordinate(group.longitude, group.latitude);
          const marker = svgElement("g", { transform: `translate(${point.x},${point.y})`,
            class: "collaboration-network__marker", role: "button", tabindex: "0",
            "data-location": group.key, "aria-controls": "network-institution-details",
            "aria-label": placeName(items[0]) + " · " + items.length + " institutions · "
              + piIds.map((piId) => piLabels[piId]).join(" and ") });
          const title = svgElement("title", {});
          title.textContent = items.map((item) => item.name).join("; ");
          const glyph = svgElement("g", { "data-marker-glyph": "" });
          glyph.append(svgElement("circle", { r: 9, class: "collaboration-network__marker-hit" }),
            svgElement("circle", { r: 4.2, fill: piIds.length === 2 ? "url(#network-both-fill)"
              : piIds[0] === "whittier" ? "#d71920" : "#f6b51b", class: "collaboration-network__marker-dot" }));
          marker.append(title, glyph);
          marker.addEventListener("focus", () => {
            if (point.x < viewport.x || point.x > viewport.x + viewport.width
              || point.y < viewport.y || point.y > viewport.y + viewport.height) {
              viewport = mapViewport(viewport.zoom, point.x, point.y);
              updateViewport();
            }
          });
          marker.addEventListener("click", () => selectInstitution(group.institutionIds[0], group));
          marker.addEventListener("keydown", (event) => {
            if (["Enter", " "].includes(event.key)) {
              event.preventDefault();
              selectInstitution(group.institutionIds[0], group);
            }
          });
          markerLayer.append(marker);
        });
        updateSelection();
        renderDetails();
        updateViewport();
      };
      filterButtons.forEach((button) => button.addEventListener("click", () => {
        selectedPi = button.dataset.networkPi;
        render();
      }));
      search.addEventListener("input", () => {
        if (explorerDisclosure && search.value.trim()) explorerDisclosure.open = true;
        render();
      });
      const date = new Date(snapshot.generated_at);
      region.querySelector("[data-network-date]").textContent = Number.isNaN(date.getTime())
        ? "Refresh date unavailable" : date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
      region.querySelector("[data-network-truncation]").textContent = snapshot.coverage.truncated_authorship_works;
      render();
      content.hidden = false;
      region.dataset.loaded = "true";
    } catch {
      status.textContent = "The collaboration map could not load. Please refresh to try again, or explore the publication profiles below.";
      fallback.hidden = false;
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
