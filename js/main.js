/* Green Roots — small progressive enhancements */
(function () {
  "use strict";

  /* --- Sticky header state ------------------------------------------------ */
  var header = document.querySelector(".site-header");
  if (header && !header.classList.contains("site-header--solid")) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile nav --------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* --- Sticky ticket bar -------------------------------------------------- */
  var bar = document.getElementById("ticket-bar");
  var foot = document.querySelector(".site-footer");
  if (bar) {
    bar.hidden = false;
    var showBar = function () {
      var pastHero = window.scrollY > window.innerHeight * 0.85;
      var atFooter = foot && foot.getBoundingClientRect().top < window.innerHeight;
      bar.classList.toggle("is-visible", pastHero && !atFooter);
    };
    showBar();
    window.addEventListener("scroll", showBar, { passive: true });
    window.addEventListener("resize", showBar);
  }

  /* --- Drag-to-scroll on the program rail --------------------------------- */
  document.querySelectorAll(".rail").forEach(function (rail) {
    var down = false;
    var startX = 0;
    var startLeft = 0;
    var moved = 0;

    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return; // native touch scrolling is better
      down = true;
      moved = 0;
      startX = e.clientX;
      startLeft = rail.scrollLeft;
      rail.setPointerCapture(e.pointerId);
    });

    rail.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      rail.scrollLeft = startLeft - dx;
    });

    ["pointerup", "pointercancel"].forEach(function (evt) {
      rail.addEventListener(evt, function () {
        down = false;
      });
    });

    // Swallow the click that ends a drag so cards don't fire links.
    rail.addEventListener(
      "click",
      function (e) {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );

    // Vertical wheel becomes horizontal travel while the pointer is over it.
    rail.addEventListener(
      "wheel",
      function (e) {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        var max = rail.scrollWidth - rail.clientWidth;
        var next = rail.scrollLeft + e.deltaY;
        if (next <= 0 || next >= max) return; // let the page scroll at the ends
        e.preventDefault();
        rail.scrollLeft = next;
      },
      { passive: false }
    );
  });

  /* --- Scroll reveal ------------------------------------------------------ */
  var targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = entry.target.dataset.revealDelay || 0;
        entry.target.style.transitionDelay = delay + "ms";
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
