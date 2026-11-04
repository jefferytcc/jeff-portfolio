// Case study pages: screenshot tabs (e.g. Desktop / Phone) and before/after sliders

// ----------------------------
// Tabs
// ----------------------------

document.querySelectorAll('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll("[data-tab]")];

  const select = (tab) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden =
        !selected;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => select(tab));
    // Left / right arrows move between the tabs that are showing
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const visible = tabs.filter((t) => !t.hidden);
      const step = e.key === "ArrowRight" ? 1 : -1;
      const i = visible.indexOf(tab);
      const next = visible[(i + step + visible.length) % visible.length];
      select(next);
      next.focus();
    });
  });

  select(tabs.find((t) => t.getAttribute("aria-selected") === "true"));
});

// ----------------------------
// Before / after slider
// ----------------------------
document.querySelectorAll("[data-compare]").forEach((box) => {
  const before = box.querySelector("[data-compare-before]");
  const line = box.querySelector("[data-compare-line]");
  const handle = box.querySelector("[data-compare-handle]");
  const buttons = [...box.parentElement.querySelectorAll("[data-compare-to]")];
  const moving = [before, line, handle];
  let percent = 50;

  // percent = how much of the "before" image shows, from the left
  const set = (value, animate = false) => {
    percent = Math.min(Math.max(value, 0), 100);
    moving.forEach((el) => {
      el.style.transition = animate ? "all 400ms ease-out" : "none";
    });
    before.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    line.style.left = `${percent}%`;
    handle.style.left = `${percent}%`;

    handle.setAttribute("aria-valuenow", String(Math.round(percent)));
    handle.setAttribute(
      "aria-valuetext",
      percent === 100
        ? "Showing before"
        : percent === 0
          ? "Showing after"
          : `${Math.round(percent)}% before`,
    );
    buttons.forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String(Number(b.dataset.compareTo) === percent),
      ),
    );
  };

  const setFromPointer = (e) => {
    const rect = box.getBoundingClientRect();
    set(((e.clientX - rect.left) / rect.width) * 100);
  };

  // Drag anywhere on the image. Vertical swipes still scroll the page on phones.
  let dragging = false;
  box.addEventListener("pointerdown", (e) => {
    dragging = true;
    box.setPointerCapture(e.pointerId);
    setFromPointer(e);
  });
  box.addEventListener("pointermove", (e) => dragging && setFromPointer(e));
  ["pointerup", "pointercancel"].forEach((type) =>
    box.addEventListener(type, () => (dragging = false)),
  );

  // Keyboard on the handle
  handle.addEventListener("keydown", (e) => {
    const steps = { ArrowLeft: -5, ArrowRight: 5, PageDown: -20, PageUp: 20 };
    if (e.key in steps) set(percent + steps[e.key]);
    else if (e.key === "Home") set(0);
    else if (e.key === "End") set(100);
    else return;
    e.preventDefault();
  });

  buttons.forEach((b) =>
    b.addEventListener("click", () => set(Number(b.dataset.compareTo), true)),
  );

  set(percent);
});

// Show the before/after section only once the "before" screenshot exists.
// On localhost, show a placeholder instead so it's clear where the image goes.
const beforeAfter = document.getElementById("before-after");
const beforeImg = beforeAfter?.querySelector("[data-before-img]");

if (beforeImg) {
  const show = () => (beforeAfter.hidden = false);
  const missing = () => {
    if (location.hostname !== "localhost") return;
    const note = document.createElement("div");
    note.className =
      "absolute inset-0 flex items-center bg-cloud-light p-4 sm:p-10 text-ink";
    note.innerHTML = `<p class="max-w-[42%] text-xs sm:text-base break-words"><strong class="block text-ink-dark">"Before" screenshot goes here</strong>Save it as <code>${beforeImg.getAttribute("src").slice(1)}</code>. Only you see this note, on localhost.</p>`;
    beforeImg.replaceWith(note);
    show();
  };

  if (beforeImg.complete) beforeImg.naturalWidth ? show() : missing();
  else {
    beforeImg.addEventListener("load", show);
    beforeImg.addEventListener("error", missing);
  }
}

// ----------------------------
// Heavy embeds (e.g. Figma) load only when the visitor asks
// ----------------------------
document.querySelectorAll("[data-embed]").forEach((box) => {
  box.querySelector("button").addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = box.dataset.src;
    frame.title = box.dataset.title;
    frame.allowFullscreen = true;
    frame.className = "w-full h-full";
    box.replaceChildren(frame);
  });
});
