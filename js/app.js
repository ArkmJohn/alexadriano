const body = document.body;
const galleryEl = document.querySelector("[data-gallery]");
const navToggle = document.querySelector(".nav-toggle");
const navToggleLabel = navToggle ? navToggle.querySelector(".nav-toggle__label") : null;
const navLinks = document.querySelectorAll(".site-nav a");
const siteNav = document.querySelector(".site-nav");
const yearTarget = document.querySelector("[data-year]");
const activeTitleTarget = document.querySelector("[data-active-title]");
const gsapInstance = typeof window !== "undefined" ? window.gsap : null;
const canAnimateCards = Boolean(gsapInstance);
let refreshCarouselLayout = null;

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (prefersReducedMotion.matches) {
  body.dataset.reducedMotion = "true";
}
const motionListener = (event) => {
  body.dataset.reducedMotion = event.matches ? "true" : "false";
  if (typeof refreshCarouselLayout === "function") {
    refreshCarouselLayout();
  }
};
if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", motionListener);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(motionListener);
}

if (navToggle) {
  if (siteNav) {
    siteNav.setAttribute("aria-hidden", "true");
  }

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      navToggle.setAttribute("aria-expanded", "false");
      delete body.dataset.navOpen;
      if (siteNav) {
        siteNav.setAttribute("aria-hidden", "true");
      }
      if (navToggleLabel) {
        navToggleLabel.textContent = "MENU";
      }
    } else {
      navToggle.setAttribute("aria-expanded", "true");
      body.dataset.navOpen = "true";
      if (siteNav) {
        siteNav.setAttribute("aria-hidden", "false");
      }
      if (navToggleLabel) {
        navToggleLabel.textContent = "CLOSE";
      }
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      delete body.dataset.navOpen;
      if (siteNav) {
        siteNav.setAttribute("aria-hidden", "true");
      }
      if (navToggleLabel) {
        navToggleLabel.textContent = "MENU";
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.dataset.navOpen === "true") {
      navToggle.setAttribute("aria-expanded", "false");
      delete body.dataset.navOpen;
      if (siteNav) {
        siteNav.setAttribute("aria-hidden", "true");
      }
      if (navToggleLabel) {
        navToggleLabel.textContent = "MENU";
      }
      navToggle.focus();
    }
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

if (galleryEl) {
  const cards = Array.from(galleryEl.querySelectorAll(".js-card"));
  const prevBtn = galleryEl.querySelector("[data-prev]");
  const nextBtn = galleryEl.querySelector("[data-next]");
  const cardStateMap = {
    "-3": {
      translate: "-60vw",
      rotate: "0deg",
      scale: "0.52",
      opacity: 0,
      filter: "saturate(0.6) brightness(0.7)",
      z: 1,
    },
    "-2": {
      translate: "-34vw",
      rotate: "22deg",
      scale: "0.68",
      opacity: 0.45,
      filter: "saturate(0.68) brightness(0.82)",
      z: 2,
    },
    "-1": {
      translate: "-18vw",
      rotate: "16deg",
      scale: "0.84",
      opacity: 0.8,
      filter: "saturate(0.85) brightness(0.95)",
      z: 3,
    },
    "0": {
      translate: "0vw",
      rotate: "0deg",
      scale: "1",
      opacity: 1,
      filter: "saturate(1) brightness(1.05)",
      z: 5,
    },
    "1": {
      translate: "18vw",
      rotate: "-16deg",
      scale: "0.84",
      opacity: 0.8,
      filter: "saturate(0.85) brightness(0.95)",
      z: 3,
    },
    "2": {
      translate: "34vw",
      rotate: "-22deg",
      scale: "0.68",
      opacity: 0.45,
      filter: "saturate(0.68) brightness(0.82)",
      z: 2,
    },
    "3": {
      translate: "60vw",
      rotate: "0deg",
      scale: "0.52",
      opacity: 0,
      filter: "saturate(0.6) brightness(0.7)",
      z: 1,
    },
  };

  const getCardState = (offset) => {
    const bounded = Math.max(-3, Math.min(3, offset));
    const key = String(bounded);
    return cardStateMap[key] || cardStateMap["3"];
  };

  const applyCardState = (card, offset, immediate = false) => {
    const state = getCardState(offset);
    const duration =
      immediate || body.dataset.reducedMotion === "true" ? 0 : offset === 0 ? 0.6 : 0.55;

    card.style.pointerEvents = offset === 0 ? "auto" : "none";
    card.style.zIndex = String(state.z);

    if (canAnimateCards) {
      const animationConfig = {
        duration,
        ease: "power3.out",
        "--translate": state.translate,
        "--rotate": state.rotate,
        "--scale": state.scale,
        "--opacity": state.opacity,
        filter: state.filter,
        overwrite: true,
      };

      if (duration === 0) {
        gsapInstance.set(card, animationConfig);
      } else {
        gsapInstance.to(card, animationConfig);
      }
    } else {
      card.style.setProperty("--translate", state.translate);
      card.style.setProperty("--rotate", state.rotate);
      card.style.setProperty("--scale", state.scale);
      card.style.setProperty("--opacity", state.opacity);
      card.style.filter = state.filter;
    }
  };

  let currentIndex = Math.max(
    0,
    cards.findIndex((card) => card.classList.contains("is-active"))
  );
  if (currentIndex === -1) currentIndex = 0;

  let isAnimating = false;
  let wheelLock = false;
  let touchStartX = null;
  let touchStartY = null;
  const swipeThreshold = 45;

  const updateCards = ({ focusActive = false, immediate = false } = {}) => {
    window.requestAnimationFrame(() => {
      cards.forEach((card, index) => {
        const offset = index - currentIndex;
        card.dataset.position = String(offset);
        const isActive = offset === 0;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-hidden", String(!isActive));
        card.tabIndex = isActive ? 0 : -1;
        if (focusActive && isActive) {
          card.focus({ preventScroll: true });
        }
        applyCardState(card, offset, immediate);
      });
      if (activeTitleTarget) {
        const activeCard = cards[currentIndex];
        activeTitleTarget.textContent =
          activeCard && activeCard.dataset ? activeCard.dataset.title || "" : "";
      }
      isAnimating = false;
    });
  };

  const advance = (direction) => {
    if (isAnimating) return;
    const nextIndex = clamp(currentIndex + direction, 0, cards.length - 1);
    if (nextIndex === currentIndex) return;
    isAnimating = true;
    currentIndex = nextIndex;
    updateCards({ focusActive: true });
  };

  const handleButton = (direction) => {
    advance(direction);
  };

  const handleWheel = (event) => {
    if (body.dataset.reducedMotion === "true") return;
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(delta) < 20 || wheelLock) return;
    event.preventDefault();
    wheelLock = true;
    advance(delta > 0 ? 1 : -1);
    setTimeout(() => {
      wheelLock = false;
    }, 650);
  };

  const onTouchStart = (event) => {
    if (event.changedTouches.length === 0) return;
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  };

  const onTouchEnd = (event) => {
    if (touchStartX === null || touchStartY === null) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const absX = Math.abs(deltaX);
    if (absX > Math.abs(deltaY) && absX > swipeThreshold) {
      advance(deltaX < 0 ? 1 : -1);
    }
    touchStartX = null;
    touchStartY = null;
  };

  const handleKeydown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      advance(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      advance(-1);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, threshold: 0.35 }
  );

  cards.forEach((card, index) => {
    card.dataset.position = String(index - currentIndex);
    card.setAttribute(
      "aria-label",
      `${card.dataset.title ?? "Collection"} - ${index + 1} of ${cards.length}`
    );
    card.setAttribute("role", "group");
    if (index !== currentIndex) {
      card.tabIndex = -1;
      card.setAttribute("aria-hidden", "true");
    } else {
      card.tabIndex = 0;
      card.setAttribute("aria-hidden", "false");
    }
    observer.observe(card);
    applyCardState(card, index - currentIndex, true);
  });

  refreshCarouselLayout = () => updateCards({ immediate: true });

  updateCards({ immediate: true });

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => handleButton(-1));
    nextBtn.addEventListener("click", () => handleButton(1));
  }

  galleryEl.addEventListener("wheel", handleWheel, { passive: false });
  galleryEl.addEventListener("touchstart", onTouchStart, { passive: true });
  galleryEl.addEventListener("touchend", onTouchEnd);
  document.addEventListener("keydown", handleKeydown);
}
