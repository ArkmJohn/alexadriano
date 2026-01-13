const body = document.body;
const galleryEl = document.querySelector("[data-gallery]");
const navToggle = document.querySelector(".nav-toggle");
const navToggleLabel = navToggle ? navToggle.querySelector(".nav-toggle__label") : null;
const navLinks = document.querySelectorAll(".site-nav a");
const siteNav = document.querySelector(".site-nav");
const yearTarget = document.querySelector("[data-year]");
const activeTitleTarget = document.querySelector("[data-active-title]");
const lightbox = document.querySelector("[data-lightbox]");
const gsapInstance = typeof window !== "undefined" ? window.gsap : null;
const canAnimateCards = Boolean(gsapInstance);
let refreshCarouselLayout = null;

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

// Respect reduced motion preferences and update on change.
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

// Mobile navigation toggle and escape handling.
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

// Lightbox for showcase and collection galleries.
if (lightbox) {
  const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
  const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
  const closeTargets = lightbox.querySelectorAll("[data-lightbox-close]");
  const prevButton = lightbox.querySelector("[data-lightbox-prev]");
  const nextButton = lightbox.querySelector("[data-lightbox-next]");
  const lightboxTriggers = document.querySelectorAll(".showcase-grid img, .collection-gallery img");
  let lastFocusedElement = null;
  let currentGroup = [];
  let currentIndex = 0;

  // Group images by their nearest gallery container.
  const getGroupImages = (imageEl) => {
    const container = imageEl.closest(".showcase-grid, .collection-gallery");
    if (!container) {
      return [imageEl];
    }
    return Array.from(container.querySelectorAll("img"));
  };

  // Disable nav when a gallery has a single image.
  const updateLightboxNavState = () => {
    const multiple = currentGroup.length > 1;
    if (prevButton) {
      prevButton.disabled = !multiple;
    }
    if (nextButton) {
      nextButton.disabled = !multiple;
    }
  };

  // Sync lightbox image and caption with the selected thumbnail.
  const updateLightboxImage = (imageEl) => {
    if (!lightboxImage) return;
    lightboxImage.src = imageEl.src;
    lightboxImage.alt = imageEl.alt || "Portfolio image";
    if (lightboxCaption) {
      lightboxCaption.textContent = imageEl.alt || "";
    }
  };

  // Open the lightbox and store focus for restoration.
  const openLightbox = (imageEl) => {
    lastFocusedElement = document.activeElement;
    currentGroup = getGroupImages(imageEl);
    currentIndex = Math.max(0, currentGroup.indexOf(imageEl));
    updateLightboxImage(imageEl);
    lightbox.dataset.open = "true";
    lightbox.setAttribute("aria-hidden", "false");
    body.dataset.lightboxOpen = "true";
    updateLightboxNavState();
    const closeButton = lightbox.querySelector(".lightbox__close");
    if (closeButton) {
      closeButton.focus();
    }
  };

  // Loop through images in the current group.
  const goToLightboxIndex = (nextIndex) => {
    if (!currentGroup.length) return;
    const total = currentGroup.length;
    currentIndex = ((nextIndex % total) + total) % total;
    updateLightboxImage(currentGroup[currentIndex]);
    updateLightboxNavState();
  };

  // Close and reset the lightbox state.
  const closeLightbox = () => {
    delete lightbox.dataset.open;
    lightbox.setAttribute("aria-hidden", "true");
    delete body.dataset.lightboxOpen;
    if (lightboxImage) {
      lightboxImage.src = "";
    }
    currentGroup = [];
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  lightboxTriggers.forEach((imageEl) => {
    imageEl.addEventListener("click", () => openLightbox(imageEl));
    imageEl.setAttribute("tabindex", "0");
    imageEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(imageEl);
      }
    });
  });

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      goToLightboxIndex(currentIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goToLightboxIndex(currentIndex + 1);
    });
  }

  closeTargets.forEach((target) => {
    target.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.dataset.open === "true") {
      closeLightbox();
    }
    if (lightbox.dataset.open === "true" && event.key === "ArrowRight") {
      event.preventDefault();
      goToLightboxIndex(currentIndex + 1);
    }
    if (lightbox.dataset.open === "true" && event.key === "ArrowLeft") {
      event.preventDefault();
      goToLightboxIndex(currentIndex - 1);
    }
  });
}

if (galleryEl) {
  const cards = Array.from(galleryEl.querySelectorAll(".js-card"));
  const prevBtn = galleryEl.querySelector("[data-prev]");
  const nextBtn = galleryEl.querySelector("[data-next]");
  const totalCards = cards.length;
  // Visual states for the carousel stack.
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

  // Apply the calculated transform/opacity to a card.
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

  const wrapIndex = (value) => {
    return ((value % totalCards) + totalCards) % totalCards;
  };

  // Map indexes to the shortest offset around the carousel.
  const getOffset = (index) => {
    let diff = index - currentIndex;
    const half = totalCards / 2;
    if (diff > half) {
      diff -= totalCards;
    } else if (diff < -half) {
      diff += totalCards;
    }
    return diff;
  };

  let isAnimating = false;
  let wheelLock = false;
  let touchStartX = null;
  let touchStartY = null;
  const swipeThreshold = 45;

  const updateCards = ({ focusActive = false, immediate = false } = {}) => {
    window.requestAnimationFrame(() => {
      cards.forEach((card, index) => {
        const offset = getOffset(index);
        const clampedOffset = Math.max(-3, Math.min(3, offset));
        card.dataset.position = String(clampedOffset);
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
    const nextIndex = wrapIndex(currentIndex + direction);
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

  // Reveal cards once they enter the viewport.
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
    const offset = getOffset(index);
    card.dataset.position = String(Math.max(-3, Math.min(3, offset)));
    card.setAttribute(
      "aria-label",
      `${card.dataset.title ?? "Collection"} - ${index + 1} of ${cards.length}`
    );
    card.setAttribute("role", "group");
    const cardLink = card.querySelector(".card__link");
    if (cardLink) {
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cardLink.click();
        }
      });
    }
    if (index !== currentIndex) {
      card.tabIndex = -1;
      card.setAttribute("aria-hidden", "true");
    } else {
      card.tabIndex = 0;
      card.setAttribute("aria-hidden", "false");
    }
    observer.observe(card);
    applyCardState(card, offset, true);
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
