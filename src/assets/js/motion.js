(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 600px)");
  const header = document.querySelector(".site-header");
  let observer,
    frame = 0,
    hero,
    story,
    stage,
    rally,
    ball;
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  function tick() {
    frame = 0;
    header?.classList.toggle("is-scrolled", window.scrollY > 20);
    if (reduce.matches) return;
    if (rally && ball) {
      const rect = rally.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const p = clamp((innerHeight - rect.top) / (innerHeight + rect.height));
        const phase = p * 2,
          leg = phase < 1 ? phase : phase - 1;
        const ease = leg * leg * (3 - 2 * leg);
        const offset = phase < 1 ? ease : 1 - ease;
        const size = ball.clientWidth,
          travel = Math.max(0, rect.width - size - 24);
        const x = 12 + offset * travel,
          y = -Math.sin(leg * Math.PI) * 10;
        ball.style.transform = `translate3d(${x}px,${y}px,0) rotate(${x * 0.35}deg)`;
        ball.style.opacity = String(Math.min(p / 0.08, (1 - p) / 0.08, 1) * 0.8);
      } else ball.style.opacity = "0";
    }
    if (hero && !compact.matches) {
      const box = hero.getBoundingClientRect();
      if (box.bottom > 0 && box.top < innerHeight) {
        hero.style.setProperty("--hero-shift", `${clamp(-box.top, 0, 700) * 0.085}px`);
        hero.style.setProperty("--title-shift", `${clamp(-box.top, 0, 700) * -0.035}px`);
      }
    }
    if (story && !compact.matches) {
      const box = story.getBoundingClientRect();
      if (box.bottom > 0 && box.top < innerHeight) {
        const top = header?.offsetHeight || 88;
        const p = clamp((top - box.top) / Math.max(1, box.height - stage.offsetHeight));
        story.style.setProperty("--story-scale", String(1.13 - p * 0.13));
        story.style.setProperty("--story-copy-shift", `${-p * 35}px`);
        story.style.setProperty("--story-opacity", String(1 - clamp((p - 0.8) / 0.2) * 0.25));
        story.style.setProperty("--story-progress", String(p));
      }
    }
  }
  function requestTick() {
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function refresh() {
    observer?.disconnect();
    const main = document.getElementById("main");
    main.classList.remove("route-enter");
    document.querySelectorAll(".motion-ready").forEach((el) => {
      if (!el.closest(".cinematic-home")) el.classList.remove("motion-ready", "is-visible");
    });
    if (!reduce.matches && "IntersectionObserver" in window) {
      if (!document.startViewTransition) {
        void main.offsetWidth;
        main.classList.add("route-enter");
      }
      const nodes = [
        ...document.querySelectorAll(
          ".page-top, .page-body > *, .feature-item, .add-on-card, .amenity-grid > div, .content-card, .pricing-actions article, .faq-list details, .policy-item, .gallery-grid figure, .people-grid figure, .visit-row, .footer-column, .footer-word",
        ),
      ].filter((el) => !el.closest(".cinematic-home") && !el.closest(".site-header"));
      const below = nodes.filter((el) => el.getBoundingClientRect().top >= innerHeight);
      const hidden = new Set(below);
      const targets = below.filter((el) => {
        let parent = el.parentElement;
        while (parent) {
          if (hidden.has(parent)) return false;
          parent = parent.parentElement;
        }
        return true;
      });
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px 12% 0px", threshold: 0.01 },
      );
      targets.forEach((el, i) => {
        el.style.setProperty("--reveal-delay", `${(i % 3) * 70}ms`);
        el.classList.add("motion-ready");
        observer.observe(el);
      });
    }
    document.documentElement.style.setProperty(
      "--header-height",
      `${header?.offsetHeight || 88}px`,
    );
    hero = main.querySelector(".hero");
    story = main.querySelector(".court-story");
    stage = main.querySelector(".court-story-stage");
    rally = main.querySelector(".rally-ribbon");
    ball = rally?.querySelector(".rally-ball");
    requestTick();
  }
  window.refreshMotion = refresh;
  addEventListener("scroll", requestTick, { passive: true });
  addEventListener(
    "resize",
    () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header?.offsetHeight || 88}px`,
      );
      requestTick();
    },
    { passive: true },
  );
  reduce.addEventListener("change", refresh);
  compact.addEventListener("change", refresh);
  refresh();
})();
