// Plays Lottie animations ([data-lottie="/path.json"]) once they scroll into
// view. The player only loads when needed, pauses off-screen, and shows a still
// frame for people who prefer reduced motion.
//
// Options on the same element:
//   data-lottie-segment="0,20"  loop only these frames (the lively part)
//   data-lottie-speed="0.75"    playback speed
//   data-lottie-once            play once, then hold the last frame

const figures = document.querySelectorAll("[data-lottie]");

if (figures.length) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const players = new Map();

  const start = async (el) => {
    const { default: lottie } =
      await import("lottie-web/build/player/lottie_light");
    const once = el.hasAttribute("data-lottie-once");
    const segment = el.dataset.lottieSegment?.split(",").map(Number);

    const anim = lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop: !once && !reduceMotion,
      autoplay: false,
      path: el.dataset.lottie,
    });
    anim.setSpeed(Number(el.dataset.lottieSpeed) || 1);

    anim.addEventListener("DOMLoaded", () => {
      if (reduceMotion) {
        anim.goToAndStop(segment ? segment[1] : anim.totalFrames - 1, true);
      } else if (segment) {
        anim.playSegments(segment, true);
      } else {
        anim.play();
      }
    });
    players.set(el, { anim, once });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        const player = players.get(target);
        if (isIntersecting && !player) start(target);
        // Looping animations rest while off-screen; one-shot ones just finish
        else if (player && !player.once && !reduceMotion) {
          isIntersecting ? player.anim.play() : player.anim.pause();
        }
      });
    },
    { rootMargin: "200px" },
  );

  figures.forEach((el) => observer.observe(el));
}
