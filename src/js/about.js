// About page: copy email, show more, and the "On this page" nav

const EMAIL = "jefferytan.design@gmail.com";

// ----------------------------
// Copy email
// ----------------------------
document.querySelectorAll("[data-copy-email]").forEach((btn) => {
  const label = btn.querySelector("[data-label]");
  const original = label.textContent;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      label.textContent = "Copied!";
    } catch {
      // Clipboard blocked: fall back to the mail app
      window.location.href = `mailto:${EMAIL}`;
      return;
    }
    setTimeout(() => (label.textContent = original), 2000);
  });
});

// ----------------------------
// Show more / less
// ----------------------------
document.querySelectorAll("[data-accordion]").forEach((btn) => {
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  const label = btn.querySelector("[data-label]");
  const closedText = label.textContent;

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    label.textContent = open ? "Show less" : closedText;
  });
});

// ----------------------------
// "On this page" nav: highlight the section in view
// ----------------------------
const sectionNav = document.getElementById("section-nav");

if (sectionNav) {
  const links = [...sectionNav.querySelectorAll("a")];
  const linkFor = new Map(links.map((a) => [a.hash.slice(1), a]));
  const activeClasses = ["bg-brand", "text-white", "hover:bg-brand"];

  const setActive = (id) => {
    links.forEach((a) => {
      const active = a === linkFor.get(id);
      a.classList.toggle("text-ink", !active);
      activeClasses.forEach((c) => a.classList.toggle(c, active));
      if (active) {
        a.setAttribute("aria-current", "true");
        // Keep the active link visible when the nav scrolls sideways on mobile
        const list = a.closest("ul");
        list.scrollTo({
          left: a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2,
          behavior: "smooth",
        });
      } else {
        a.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => setActive(entry.target.dataset.section));
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );

  document
    .querySelectorAll("[data-section]")
    .forEach((section) => observer.observe(section));
}
