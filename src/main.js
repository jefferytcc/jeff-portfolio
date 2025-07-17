import "./style.css";

const signature = document.getElementById("signature");

if (signature) {
  setTimeout(() => {
    signature.classList.remove("opacity-0", "translate-y-2");
    signature.classList.add("opacity-100", "translate-y-0");
  }, 500);
}

const nav = document.getElementById("nav-links");
const links = nav.querySelectorAll("a");

// Step 1: Fade in the nav
setTimeout(() => {
  nav.classList.remove("opacity-0", "translate-y-4");
  nav.classList.add("opacity-100", "translate-y-0");

  // Step 2: After nav appears, fade in each link
  links.forEach((link, i) => {
    setTimeout(() => {
      link.classList.remove("opacity-0", "translate-y-4");
      link.classList.add("opacity-100", "translate-y-0");
    }, i * 300); // stagger delay: 0ms, 300ms, 600ms
  });
}, 1200); // delay the nav bar first

window.addEventListener("DOMContentLoaded", () => {
  const profileImg = document.getElementById("profile-image");

  setTimeout(() => {
    profileImg.classList.remove("opacity-0", "translate-x-4");
    profileImg.classList.add("opacity-100", "translate-x-0");
  }, 1000); // 200ms delay feels natural
});

window.addEventListener("DOMContentLoaded", () => {
  const heading = document.querySelector("#title h4");
  const paragraph = document.querySelector("#title p");

  setTimeout(() => {
    heading.classList.remove("opacity-0", "translate-y-0");
    heading.classList.add("opacity-100", "translate-y-4");
  }, 1000);

  setTimeout(() => {
    paragraph.classList.remove("opacity-0", "translate-y-0");
    paragraph.classList.add("opacity-100", "translate-y-4");
  }, 1200);
});

const burger = document.getElementById("burger");
const mobileNav = document.getElementById("mobile-nav");
const mobileLinks = document.querySelectorAll("#mobile-nav a");

const line1 = burger.querySelector(".line1");
const line2 = burger.querySelector(".line2");
const line3 = burger.querySelector(".line3");

let isOpen = false;

burger.addEventListener("click", () => {
  isOpen = !isOpen;

  if (isOpen) {
    // Show mobile nav
    mobileNav.classList.remove("hidden");

    // Animate nav links
    mobileLinks.forEach((link, i) => {
      setTimeout(() => {
        link.classList.remove("opacity-0");
        link.classList.add("opacity-100");
      }, i * 200);
    });

    // Animate burger to "X"
    line1.classList.remove("bg-black");
    line1.classList.add("rotate-45", "translate-y-[6px]", "bg-white");

    line2.classList.add("opacity-0");

    line3.classList.remove("bg-black");
    line3.classList.add("-rotate-45", "-translate-y-[6px]", "bg-white");
  } else {
    // Hide mobile nav
    mobileNav.classList.add("hidden");

    mobileLinks.forEach((link) => {
      link.classList.remove("opacity-100");
      link.classList.add("opacity-0");
    });

    // Revert to burger icon
    line1.classList.remove("rotate-45", "translate-y-[6px]", "bg-white");
    line1.classList.add("bg-black");

    line2.classList.remove("opacity-0");

    line3.classList.remove("-rotate-45", "-translate-y-[6px]", "bg-white");
    line3.classList.add("bg-black");
  }
});
