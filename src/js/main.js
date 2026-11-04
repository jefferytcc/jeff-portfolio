import Lenis from "@studio-freight/lenis";

// This file loads as a module script, so the page HTML is already parsed
// when it runs — no need to wait for DOMContentLoaded.

const CONTACT_ENDPOINT =
  "https://contact-form-server-el4v.onrender.com/contact";
const CONTACT_EMAIL = "jefferytan.design@gmail.com";

// Swap animation classes after a delay
function revealAfter(el, delay, from, to) {
  if (!el) return;
  setTimeout(() => {
    el.classList.remove(...from);
    el.classList.add(...to);
  }, delay);
}

// ----------------------------
// Home page intro animations
// ----------------------------
revealAfter(
  document.getElementById("signature"),
  500,
  ["opacity-0", "translate-y-2"],
  ["opacity-100", "translate-y-0"],
);

const nav = document.getElementById("nav-links");
if (nav) {
  const from = ["opacity-0", "translate-y-4"];
  const to = ["opacity-100", "translate-y-0"];

  revealAfter(nav, 1200, from, to);
  nav.querySelectorAll("a").forEach((link, i) => {
    revealAfter(link, 1200 + i * 300, from, to);
  });
}

revealAfter(
  document.getElementById("profile-image"),
  1000,
  ["opacity-0", "translate-x-4"],
  ["opacity-100", "translate-x-0"],
);

revealAfter(
  document.querySelector("#title h4"),
  1000,
  ["opacity-0", "translate-y-0"],
  ["opacity-100", "translate-y-4"],
);
revealAfter(
  document.querySelector("#title p"),
  1200,
  ["opacity-0", "translate-y-0"],
  ["opacity-100", "translate-y-4"],
);

// ----------------------------
// Smooth scroll using Lenis
// ----------------------------
const lenis = new Lenis({
  duration: 1.0,
  easing: (t) => 1 - Math.pow(1 - t, 4),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  const targetId = anchor.getAttribute("href");
  if (targetId === "#") return;

  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    lenis.scrollTo(target, {
      duration: 2.0,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  });
});

// ----------------------------
// Mobile nav burger
// ----------------------------
const burger = document.getElementById("burger");
const mobileNav = document.getElementById("mobile-nav");

if (burger && mobileNav) {
  const line1 = burger.querySelector(".line1");
  const line2 = burger.querySelector(".line2");
  const line3 = burger.querySelector(".line3");
  const mobileLinks = mobileNav.querySelectorAll("a");

  let isOpen = false;

  burger.addEventListener("click", () => {
    isOpen = !isOpen;

    mobileNav.classList.toggle("hidden", !isOpen);
    document.body.classList.toggle("overflow-hidden", isOpen);
    document.documentElement.classList.toggle("overflow-hidden", isOpen);
    isOpen ? lenis.stop() : lenis.start();

    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    // Burger icon <-> X
    line1.classList.toggle("rotate-45", isOpen);
    line1.classList.toggle("translate-y-[6px]", isOpen);
    line2.classList.toggle("opacity-0", isOpen);
    line3.classList.toggle("-rotate-45", isOpen);
    line3.classList.toggle("-translate-y-[6px]", isOpen);

    // Stagger links in; hide them instantly on close
    mobileLinks.forEach((link, i) => {
      if (isOpen) {
        revealAfter(link, i * 200, ["opacity-0"], ["opacity-100"]);
      } else {
        link.classList.remove("opacity-100");
        link.classList.add("opacity-0");
      }
    });
  });
}

// ----------------------------
// Home page: show burger bar on scroll (desktop), always on mobile
// ----------------------------
const burgerWrapper = document.getElementById("burger-wrapper");

function toggleBurgerVisibility() {
  const isDesktop = window.innerWidth >= 768;
  const scrolled = window.scrollY > 624;

  if (isDesktop) {
    if (scrolled) {
      burgerWrapper.classList.remove("opacity-0", "top-[-100px]", "absolute");
      burgerWrapper.classList.add(
        "opacity-100",
        "fixed",
        "top-0",
        "left-0",
        "z-50",
      );
    } else {
      burgerWrapper.classList.add("opacity-0", "top-[-100px]");
      burgerWrapper.classList.remove("opacity-100");
      setTimeout(() => {
        burgerWrapper.classList.remove("fixed", "top-0", "left-0", "z-50");
        burgerWrapper.classList.add("absolute");
      }, 300);
    }
  } else {
    burgerWrapper.classList.remove("opacity-0");
    burgerWrapper.classList.add(
      "opacity-100",
      "fixed",
      "top-0",
      "left-0",
      "z-50",
    );
  }
}

if (burgerWrapper) {
  toggleBurgerVisibility();
  window.addEventListener("scroll", toggleBurgerVisibility);
  window.addEventListener("resize", toggleBurgerVisibility);
}

// ----------------------------
// Footer: auto update year
// ----------------------------
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// ----------------------------
// Contact form submission
// ----------------------------
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const status = document.getElementById("contact-status");
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  const showStatus = (message, colorClass) => {
    status.textContent = message;
    status.className = `text-sm text-right ${colorClass}`;
  };

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      phone: contactForm.phone.value,
      message: contactForm.message.value,
    };

    submitBtn.disabled = true;
    showStatus("Sending…", "text-ink-light");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Contact form failed: ${res.status}`);

      contactForm.reset();
      showStatus(
        "Thanks! Your message has been sent. I'll get back to you soon.",
        "text-green-700",
      );
    } catch (err) {
      console.error(err);
      showStatus(
        `Sorry, your message couldn't be sent. Please email me at ${CONTACT_EMAIL}.`,
        "text-red-700",
      );
    } finally {
      submitBtn.disabled = false;
    }
  });
}
