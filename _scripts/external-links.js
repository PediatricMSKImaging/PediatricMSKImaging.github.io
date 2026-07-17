window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach((link) => {
    const url = new URL(link.href, window.location.href);

    if (url.origin === window.location.origin) return;

    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
});
