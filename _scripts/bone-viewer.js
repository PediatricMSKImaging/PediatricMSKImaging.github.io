(() => {
  const initialize = () => {
    const viewer = document.querySelector("#home-bone-model");
    if (!viewer) return;
    const explorer = viewer.closest(".bone-explorer");
    const controls = explorer.querySelectorAll("[data-bone-mode]");
    const legend = explorer.querySelector(".bone-explorer__legend");
    const status = explorer.querySelector(".bone-explorer__status");
    const loading = explorer.querySelector(".bone-explorer__loading");
    const pointers = new Map();
    let pitch = 52;
    let yaw = 25;
    let pinchDistance = 0;
    let initialRadius = 0;
    const rotate = (horizontal, vertical) => {
      yaw += horizontal * 0.5;
      pitch += vertical * 0.5;
      viewer.setAttribute("orientation", `180deg ${pitch}deg ${yaw}deg`);
    };
    const pointerDistance = () => {
      const [first, second] = [...pointers.values()];
      return Math.hypot(first.x - second.x, first.y - second.y);
    };
    viewer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.stopImmediatePropagation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      viewer.setPointerCapture(event.pointerId);
      if (pointers.size === 2) {
        pinchDistance = pointerDistance();
        initialRadius = viewer.getCameraOrbit().radius;
      }
    }, true);
    viewer.addEventListener("pointermove", (event) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) {
        rotate(event.clientX - previous.x, event.clientY - previous.y);
      } else if (pointers.size === 2 && pinchDistance > 0) {
        const distance = pointerDistance();
        if (distance > 0) {
          const radius = initialRadius * pinchDistance / distance;
          viewer.cameraOrbit = `0deg 90deg ${radius}m`;
        }
      }
    }, true);
    const releasePointer = (event) => {
      if (!pointers.has(event.pointerId)) return;
      event.stopImmediatePropagation();
      pointers.delete(event.pointerId);
      if (viewer.hasPointerCapture(event.pointerId)) viewer.releasePointerCapture(event.pointerId);
      pinchDistance = 0;
    };
    viewer.addEventListener("pointerup", releasePointer, true);
    viewer.addEventListener("pointercancel", releasePointer, true);
    viewer.addEventListener("lostpointercapture", releasePointer, true);
    viewer.addEventListener("keydown", (event) => {
      const directions = { ArrowLeft: [-20, 0], ArrowRight: [20, 0],
        ArrowUp: [0, -20], ArrowDown: [0, 20] };
      if (!directions[event.key]) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      rotate(...directions[event.key]);
    }, true);
    viewer.addEventListener("load", () => {
      loading.hidden = true;
      status.textContent = "";
      explorer.dataset.loaded = "true";
    });
    viewer.addEventListener("error", () => {
      loading.hidden = true;
      status.textContent = "The interactive model could not load. Please refresh to try again.";
    });
    controls.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.boneMode;
        if (button.getAttribute("aria-pressed") === "true") return;
        if (viewer.getCameraOrbit) {
          const orbit = viewer.getCameraOrbit();
          viewer.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
        }
        loading.hidden = false;
        explorer.dataset.loaded = "false";
        viewer.src = mode === "sed" ? viewer.dataset.sedSrc : viewer.dataset.structureSrc;
        viewer.alt = mode === "sed"
          ? "Interactive bone model showing strain energy density across the bone structure"
          : "Interactive bone model showing cortical and trabecular architecture";
        controls.forEach((control) => control.setAttribute("aria-pressed", String(control === button)));
        legend.hidden = mode !== "sed";
      });
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
