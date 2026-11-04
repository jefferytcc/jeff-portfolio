// User profile case study: the interactive recreation of the V1 design

const demo = document.getElementById("profile-demo");

if (demo) {
  // ----------------------------
  // View switches: payroll access and account status
  // ----------------------------
  const compensationTab = demo.querySelector("[data-needs-payroll]");
  const generalTab = demo.querySelector('[aria-controls="p-general"]');

  const applyView = () => {
    const canSeePayroll = demo.dataset.payroll === "yes";
    compensationTab.hidden = !canSeePayroll;
    if (!canSeePayroll) {
      document.getElementById("p-compensation").hidden = true;
      if (compensationTab.getAttribute("aria-selected") === "true") {
        generalTab.click();
      }
    }

    demo.querySelectorAll("[data-show-account]").forEach((el) => {
      el.hidden = el.dataset.showAccount !== demo.dataset.account;
    });
  };

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      demo.dataset[view] = btn.dataset.value;
      document
        .querySelectorAll(`[data-view="${view}"]`)
        .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      // A message from the previous view's action no longer applies
      document.getElementById("action-status").textContent = "";
      applyView();
    });
  });

  applyView();

  // ----------------------------
  // Copy email and phone
  // ----------------------------
  demo.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("[data-label]");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = "Copied!";
      } catch {
        label.textContent = "Can't copy";
      }
      setTimeout(() => (label.textContent = "Copy"), 1500);
    });
  });

  // ----------------------------
  // Actions menu
  // ----------------------------
  const actionsButton = document.getElementById("actions-button");
  const actionsMenu = document.getElementById("actions-menu");
  const actionStatus = document.getElementById("action-status");

  const setMenu = (open) => {
    actionsMenu.hidden = !open;
    actionsButton.setAttribute("aria-expanded", String(open));
  };

  actionsButton.addEventListener("click", () => setMenu(actionsMenu.hidden));
  document.addEventListener("click", (e) => {
    if (!actionsButton.contains(e.target) && !actionsMenu.contains(e.target)) {
      setMenu(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !actionsMenu.hidden) {
      setMenu(false);
      actionsButton.focus();
    }
  });
  actionsMenu.querySelectorAll("[data-action]").forEach((item) => {
    item.addEventListener("click", () => {
      actionStatus.textContent = `Demo: ${item.dataset.action}`;
      setMenu(false);
    });
  });

  // ----------------------------
  // Pop-ups: activity log, notes, edit
  // ----------------------------
  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () =>
      document.getElementById(btn.dataset.open).showModal(),
    );
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog
      .querySelectorAll("[data-close]")
      .forEach((btn) => btn.addEventListener("click", () => dialog.close()));
    // Clicking the dark backdrop closes it too
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  });

  const noteForm = document.getElementById("note-form");
  const noteList = document.getElementById("note-list");
  noteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = noteForm.querySelector("textarea");
    const item = document.createElement("li");
    item.className = "rounded-lg bg-[#f6f8fa] p-3";
    const body = document.createElement("p");
    body.className = "text-ink-dark";
    body.textContent = text.value.trim();
    const meta = document.createElement("p");
    meta.className = "text-ink-light";
    meta.textContent = "You · just now";
    item.append(body, meta);
    noteList.prepend(item);
    text.value = "";
  });

  // ----------------------------
  // Off days calendar (November 2026, weeks start on Monday)
  // ----------------------------
  const calendar = document.getElementById("offday-calendar");
  const offDays = [13, 27];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const first = new Date(2026, 10, 1);
  const blanks = (first.getDay() + 6) % 7;

  days.forEach((d) => {
    const head = document.createElement("div");
    head.className = "py-1 font-medium text-ink-light";
    head.textContent = d;
    calendar.append(head);
  });
  for (let i = 0; i < blanks; i++)
    calendar.append(document.createElement("div"));
  for (let day = 1; day <= 30; day++) {
    const weekday = (blanks + day - 1) % 7;
    const cell = document.createElement("div");
    const isRest = weekday >= 5;
    const isOff = offDays.includes(day);
    cell.className = `rounded-md py-2 ${
      isOff
        ? "bg-[#fdf0e1] text-[#b36200] font-semibold"
        : isRest
          ? "bg-[#e3f5f8] text-[#0b7d91]"
          : "text-ink-dark"
    }`;
    cell.textContent = day;
    if (isOff) cell.title = "Off day";
    else if (isRest) cell.title = "Rest day";
    calendar.append(cell);
  }
}
