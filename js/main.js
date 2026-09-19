/* Green Roots: mobile nav, back to top, shop cart, motion */
(function () {
  "use strict";

  window.grMotion = true; // tells the <head> failsafe that JS is running

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Mobile nav --------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* --- Back to top -------------------------------------------------------- */
  document.querySelectorAll(".to-top").forEach(function (button) {
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var logo = document.querySelector(".logo");
      if (logo) logo.focus({ preventScroll: true });
    });
  });

  /* Restart a one-shot CSS animation even if it is mid-play. */
  function replay(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth; // force reflow so the animation starts again
    el.classList.add(className);
  }

  /* --- Cart count --------------------------------------------------------- */
  // Front end only: counts what was added and remembers it per browser.
  var KEY = "greenroots-cart";
  var count = document.querySelector(".cart__count");
  var cart = document.querySelector(".cart");
  var status = document.getElementById("cart-status");

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      /* storage blocked: the count still updates for this page view */
    }
  }

  var items = read();

  function render(added) {
    if (!count) return;
    count.textContent = items.length;
    count.dataset.count = items.length;
    if (status && added) {
      status.textContent =
        added + " added. Cart has " + items.length + " item" + (items.length === 1 ? "" : "s") + ".";
    }
  }

  render();

  document.querySelectorAll(".add").forEach(function (button) {
    button.addEventListener("click", function () {
      items.push(button.dataset.item);
      write(items);
      render(button.dataset.item);
      // squash the plus, then the cart hops and the badge pops (follow-through)
      replay(button, "is-popped");
      replay(cart, "is-bump");
      replay(count, "is-pop");
    });
  });

  /* --- Reveal on scroll --------------------------------------------------- */
  // Keep this list in step with section 13 of css/style.css.
  var REVEAL = [
    ".hero__card",
    ".body-copy > *",
    ".transparency__head > :not(.bot)",
    ".alloc",
    ".voice",
    ".gallery > img",
    ".section__head",
    ".sponsor-tier",
    ".closing .shell > *",
    ".quote > *",
    ".band__text",
    ".band__title",
    ".band--leaves .shell > *",
    ".link",
    ".host",
    ".products > .product",
    ".contact__card",
    ".contact__media",
    ".split__media"
  ].join(",");

  var STAGGER = 90;      // ms between siblings arriving together
  var BLOOM_LEAD = 180;  // prints wait for the text beside them
  var BLOOM_STAGGER = 140;

  var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL + ", .bot, .site-footer__sun"));

  if (root.classList.contains("motion-failsafe")) {
    // JS arrived after the failsafe already showed everything; don't replay
  } else if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        // everything entering in the same frame arrives in reading order
        var arriving = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .map(function (entry) { return entry.target; })
          .sort(function (a, b) {
            return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          });

        var text = 0;
        var prints = 0;
        arriving.forEach(function (el) {
          var delay = el.classList.contains("bot")
            ? BLOOM_LEAD + text * STAGGER * 0.5 + prints++ * BLOOM_STAGGER
            : text++ * STAGGER;
          el.style.setProperty("--d", Math.round(delay) + "ms");
          el.classList.add("is-in");
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- Parallax on the botanical prints ----------------------------------- */
  // Layers at different depths drift at different rates. translate only.
  if (!reduceMotion) {
    var DEPTH = {
      "bot--hero-cherries": 0.14,
      "bot--hero-lemon": 0.09,
      "bot--hero-peach": 0.05
    };
    var prints = Array.prototype.slice.call(document.querySelectorAll(".bot")).map(function (el) {
      var depth = 0.07;
      Object.keys(DEPTH).forEach(function (cls) {
        if (el.classList.contains(cls)) depth = DEPTH[cls];
      });
      return { el: el, depth: depth };
    });

    var ticking = false;

    function drift() {
      ticking = false;
      var mid = window.innerHeight / 2;
      prints.forEach(function (p) {
        var rect = p.el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        var offset = rect.top + rect.height / 2 - mid;
        var y = Math.max(-48, Math.min(48, -offset * p.depth));
        p.el.style.translate = "0 " + y.toFixed(1) + "px";
      });
    }

    function requestDrift() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(drift);
      }
    }

    if (prints.length) {
      drift();
      window.addEventListener("scroll", requestDrift, { passive: true });
      window.addEventListener("resize", requestDrift);
    }
  }
})();
