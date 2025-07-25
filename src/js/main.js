import "../style.css";
import Lenis from "@studio-freight/lenis";

// ----------------------------
// Animate signature (optional)
// ----------------------------
const signature = document.getElementById("signature");
if (signature) {
  setTimeout(() => {
    signature.classList.remove("opacity-0", "translate-y-2");
    signature.classList.add("opacity-100", "translate-y-0");
  }, 500);
}

// ----------------------------
// Animate nav fade-in
// ----------------------------
const nav = document.getElementById("nav-links");
if (nav) {
  const links = nav.querySelectorAll("a");

  setTimeout(() => {
    nav.classList.remove("opacity-0", "translate-y-4");
    nav.classList.add("opacity-100", "translate-y-0");

    links.forEach((link, i) => {
      setTimeout(() => {
        link.classList.remove("opacity-0", "translate-y-4");
        link.classList.add("opacity-100", "translate-y-0");
      }, i * 300);
    });
  }, 1200);
}

// ----------------------------
// Animate profile image
// ----------------------------
window.addEventListener("DOMContentLoaded", () => {
  const profileImg = document.getElementById("profile-image");
  if (profileImg) {
    setTimeout(() => {
      profileImg.classList.remove("opacity-0", "translate-x-4");
      profileImg.classList.add("opacity-100", "translate-x-0");
    }, 1000);
  }
});

// ----------------------------
// Animate hero title & paragraph
// ----------------------------
window.addEventListener("DOMContentLoaded", () => {
  const heading = document.querySelector("#title h4");
  const paragraph = document.querySelector("#title p");

  if (heading) {
    setTimeout(() => {
      heading.classList.remove("opacity-0", "translate-y-0");
      heading.classList.add("opacity-100", "translate-y-4");
    }, 1000);
  }

  if (paragraph) {
    setTimeout(() => {
      paragraph.classList.remove("opacity-0", "translate-y-0");
      paragraph.classList.add("opacity-100", "translate-y-4");
    }, 1200);
  }
});

// ----------------------------
// Mobile nav burger logic
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

    if (isOpen) {
      // Show mobile nav
      mobileNav.classList.remove("hidden");

      // Disable scroll
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");

      // Stop Lenis scroll if present
      if (window.lenis) window.lenis.stop();

      // Animate nav links in
      mobileLinks.forEach((link, i) => {
        setTimeout(() => {
          link.classList.remove("opacity-0");
          link.classList.add("opacity-100");
        }, i * 200);
      });

      // Burger icon to X
      line1.classList.add("rotate-45", "translate-y-[6px]");
      line2.classList.add("opacity-0");
      line3.classList.add("-rotate-45", "-translate-y-[6px]");
    } else {
      // Hide mobile nav
      mobileNav.classList.add("hidden");

      // Enable scroll
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");

      // Resume Lenis scroll if present
      if (window.lenis) window.lenis.start();

      // Animate nav links out
      mobileLinks.forEach((link) => {
        link.classList.remove("opacity-100");
        link.classList.add("opacity-0");
      });

      // Reset burger icon
      line1.classList.remove("rotate-45", "translate-y-[6px]");
      line2.classList.remove("opacity-0");
      line3.classList.remove("-rotate-45", "-translate-y-[6px]");
    }
  });
}

// ----------------------------
// Desktop burger show on scroll
// ----------------------------
function toggleBurgerVisibility() {
  const wrapper = document.getElementById("burger-wrapper");
  if (!wrapper) return;

  const isDesktop = window.innerWidth >= 768;
  const scrolled = window.scrollY > 624;

  if (isDesktop) {
    if (scrolled) {
      wrapper.classList.remove("opacity-0", "top-[-100px]", "absolute");
      wrapper.classList.add("opacity-100", "fixed", "top-0", "left-0", "z-50");
    } else {
      wrapper.classList.add("opacity-0", "top-[-100px]");
      wrapper.classList.remove("opacity-100");
      setTimeout(() => {
        wrapper.classList.remove("fixed", "top-0", "left-0", "z-50");
        wrapper.classList.add("absolute");
      }, 300);
    }
  } else {
    wrapper.classList.remove("opacity-0");
    wrapper.classList.add("opacity-100", "fixed", "top-0", "left-0", "z-50");
  }
}

document.addEventListener("DOMContentLoaded", toggleBurgerVisibility);
window.addEventListener("scroll", toggleBurgerVisibility);
window.addEventListener("resize", toggleBurgerVisibility);

// ----------------------------
// Smooth scroll using Lenis
// ----------------------------
window.lenis = new Lenis({
  duration: 1.0,
  easing: (t) => 1 - Math.pow(1 - t, 4),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target) {
      lenis.scrollTo(target, {
        duration: 2.0,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    }
  });
});

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
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: this.name.value,
      email: this.email.value,
      phone: this.phone.value,
      message: this.message.value,
    };

    try {
      const res = await fetch(
        "https://contact-form-server-el4v.onrender.com/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      alert(result.message || "Message sent!");
      this.reset();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const includes = document.querySelectorAll("[data-include]");
  let loadedCount = 0;

  includes.forEach(async (el) => {
    const file = el.getAttribute("data-include");
    const res = await fetch(file);
    const html = await res.text();
    el.innerHTML = html;

    loadedCount++;
    if (loadedCount === includes.length) {
      initTopNavBurger(); // only run AFTER burger-nav is injected
    }
  });
});

function initTopNavBurger() {
  const burger = document.getElementById("burger-nav");
  const nav = document.getElementById("top-nav");
  const line1 = burger.querySelector(".line1");
  const line2 = burger.querySelector(".line2");
  const line3 = burger.querySelector(".line3");

  if (!burger || !nav) return;

  let isOpen = false;

  burger.addEventListener("click", () => {
    isOpen = !isOpen;

    if (isOpen) {
      // Show nav with fade+slide-in
      nav.classList.remove("hidden");
      requestAnimationFrame(() => {
        nav.classList.remove("opacity-0", "translate-y-[-100%]");
        nav.classList.add("opacity-100", "translate-y-0");
      });

      // Prevent scrolling
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
      if (window.lenis) window.lenis.stop();

      // Fade in each link
      const links = nav.querySelectorAll("a");
      links.forEach((link, i) => {
        setTimeout(() => {
          link.classList.remove("opacity-0");
          link.classList.add("opacity-100");
        }, i * 150);
      });

      // Animate burger to "X"
      line1.classList.add("rotate-45", "translate-y-[6px]");
      line2.classList.add("opacity-0");
      line3.classList.add("-rotate-45", "-translate-y-[6px]");
    } else {
      // Animate links out
      const links = nav.querySelectorAll("a");
      links.forEach((link) => {
        link.classList.remove("opacity-100");
        link.classList.add("opacity-0");
      });

      // Slide-out and fade
      nav.classList.remove("opacity-100", "translate-y-0");
      nav.classList.add("opacity-0", "translate-y-[-100%]");

      // Hide after transition ends
      setTimeout(() => {
        nav.classList.add("hidden");
      }, 500); // match transition duration

      // Re-enable scroll
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
      if (window.lenis) window.lenis.start();

      // Revert burger icon
      line1.classList.remove("rotate-45", "translate-y-[6px]");
      line2.classList.remove("opacity-0");
      line3.classList.remove("-rotate-45", "-translate-y-[6px]");
    }
  });
}

const readmore = document.getElementById("read-more");
const readless = document.getElementById("read-less");
const extraText = document.getElementById("extra-text");

readmore.addEventListener("click", () => {
  extraText.classList.remove("hidden");
  readmore.classList.add("hidden");
  readless.classList.remove("hidden");
});

readless.addEventListener("click", () => {
  extraText.classList.add("hidden");
  readmore.classList.remove("hidden");
  readless.classList.add("hidden");
});
