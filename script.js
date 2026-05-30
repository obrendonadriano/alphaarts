const TIMER_COOKIE = "alphaArtsTimerEndsAt";
const VISITOR_COOKIE = "alphaArtsVisitorId";
const TIMER_DURATION_MS = 5 * 60 * 1000;
const ATTRIBUTION_COOKIE_MS = 90 * 24 * 60 * 60 * 1000;
const META_CAPI_ENDPOINT = "/api/meta-capi";
const META_PIXEL_ID = "796614969974062";

function setupDottedSurfaces() {
  const canvases = document.querySelectorAll("[data-dotted-surface]");
  if (!canvases.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  canvases.forEach((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let animationId = 0;
    const pointer = {
      x: -9999,
      y: -9999,
      active: false
    };
    const points = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      points.length = 0;
      const gap = width < 768 ? 32 : 42;
      const rows = Math.ceil(height / gap) + 8;
      const cols = Math.ceil(width / gap) + 36;
      const startX = -width * .75;
      const startY = -gap * 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          points.push({
            x: startX + x * gap,
            y: startY + y * gap,
            ix: x,
            iy: y
          });
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      points.forEach((point) => {
        const wave =
          Math.sin((point.ix + frame) * .34) * 18 +
          Math.sin((point.iy + frame) * .52) * 16;
        const renderX = point.x + (point.y - height * .36) * .34;
        const renderY = point.y + wave;
        const dx = renderX - pointer.x;
        const dy = renderY - pointer.y;
        const distance = Math.hypot(dx, dy);
        const influence = pointer.active ? Math.max(0, 1 - distance / 210) : 0;
        const angle = Math.atan2(dy, dx);
        const push = influence * influence * 72;
        const depth = point.y / Math.max(height, 1);
        const alpha = Math.max(0, .88 - depth * .48);
        const radius = width < 768 ? 1.8 : 2.4;

        ctx.beginPath();
        ctx.fillStyle = `rgba(176, 38, 255, ${Math.min(.95, alpha + influence * .35)})`;
        ctx.shadowColor = "rgba(176, 38, 255, .9)";
        ctx.shadowBlur = 14 + influence * 12;
        ctx.arc(
          renderX + Math.cos(angle) * push,
          renderY + Math.sin(angle) * push,
          radius + influence * 1.8,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      if (!reduceMotion) {
        frame += .045;
        animationId = requestAnimationFrame(draw);
      }
    }

    resize();
    draw();

    function handlePointerMove(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mouseleave", handlePointerLeave);

    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(animationId);
    }, { once: true });
  });
}

setupDottedSurfaces();

function setupScrollBuildEffects() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const revealItems = [];
  const addReveal = (selector, direction = "from-bottom", delayStep = 70) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      revealItems.push({ element, direction, delay: index * delayStep });
    });
  };

  addReveal(".workload h2, .workload > p, .workload-note", "from-bottom", 80);
  addReveal(".compare-card", "from-left", 95);
  addReveal(".intro h2, .intro p, .intro h3", "from-bottom", 70);
  addReveal(".collection-card:nth-child(odd)", "from-left", 45);
  addReveal(".collection-card:nth-child(even)", "from-right", 45);
  addReveal(".benefits h3", "from-bottom", 0);
  addReveal(".benefit-card:nth-of-type(odd)", "from-left", 90);
  addReveal(".benefit-card:nth-of-type(even)", "from-right", 90);
  addReveal(".toolkit-copy", "from-left", 0);
  addReveal(".toolkit > img", "from-right", 0);
  addReveal(".desire-callout h2, .desire-callout .primary-btn", "from-bottom", 90);
  addReveal(".community h2", "from-bottom", 0);
  addReveal(".community-grid article:nth-child(odd)", "from-left", 80);
  addReveal(".community-grid article:nth-child(even)", "from-right", 80);
  addReveal(".video-card", "from-zoom", 0);
  addReveal(".access h2, .access p, .receive h2, .receive p", "from-bottom", 70);
  addReveal(".receive-carousel-card", "from-bottom", 45);
  addReveal(".guarantee", "from-left", 0);
  addReveal(".price-card.basic-card", "from-left", 0);
  addReveal(".price-card.premium-card", "from-right", 0);
  addReveal(".comparison h3", "from-bottom", 0);
  addReveal(".designer-side", "from-left", 0);
  addReveal(".alphaarts-side", "from-right", 0);
  addReveal(".investment h2, .investment p", "from-bottom", 70);
  addReveal(".shopee-grid img", "from-bottom", 80);
  addReveal(".final-guarantee img", "from-left", 0);
  addReveal(".final-guarantee > div", "from-right", 0);
  addReveal(".faq h2", "from-bottom", 0);
  addReveal(".faq details", "from-bottom", 65);
  addReveal(".footer-brand", "from-left", 0);
  addReveal(".footer-sections > div", "from-right", 80);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: .16,
    rootMargin: "0px 0px -10% 0px"
  });

  const seen = new Set();
  revealItems.forEach(({ element, direction, delay }) => {
    if (seen.has(element)) return;
    seen.add(element);

    element.classList.add("scroll-reveal", direction);
    element.style.setProperty("--reveal-delay", `${Math.min(delay, 420)}ms`);
    observer.observe(element);
  });
}

setupScrollBuildEffects();

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
  if (event.target instanceof HTMLImageElement) {
    event.preventDefault();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const blockedShortcut =
    (event.ctrlKey && ["c", "s", "u", "p"].includes(key)) ||
    (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
    event.key === "F12";

  if (blockedShortcut) {
    event.preventDefault();
  }
});

function getCookie(name) {
  const raw = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];

  return raw ? decodeURIComponent(raw) : undefined;
}

function setCookie(name, value, durationMs = TIMER_DURATION_MS) {
  const expires = new Date(Date.now() + durationMs).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getTimerEnd() {
  const saved = Number(getCookie(TIMER_COOKIE));

  if (Number.isFinite(saved) && saved > Date.now()) {
    return saved;
  }

  const next = Date.now() + TIMER_DURATION_MS;
  setCookie(TIMER_COOKIE, String(next));
  return next;
}

const timerEnd = getTimerEnd();
const minutesEl = document.querySelector("[data-minutes]");
const secondsEl = document.querySelector("[data-seconds]");
const couponPopup = document.querySelector("[data-coupon-popup]");
const couponClose = document.querySelector("[data-coupon-close]");
let couponShown = false;

function openCouponPopup() {
  if (!couponPopup || couponShown) return;

  couponShown = true;
  couponPopup.classList.add("is-open");
  couponPopup.setAttribute("aria-hidden", "false");
}

function closeCouponPopup() {
  if (!couponPopup) return;

  couponPopup.classList.remove("is-open");
  couponPopup.setAttribute("aria-hidden", "true");
}

couponClose?.addEventListener("click", closeCouponPopup);

couponPopup?.addEventListener("click", (event) => {
  if (event.target === couponPopup) {
    closeCouponPopup();
  }
});

function updateTimer() {
  const remaining = Math.max(0, timerEnd - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");

  if (remaining <= 0) {
    openCouponPopup();
  }
}

updateTimer();
setInterval(updateTimer, 1000);

function createMetaRandomId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateVisitorId() {
  const saved = getCookie(VISITOR_COOKIE);
  if (saved) return saved;

  const next = createMetaRandomId();
  setCookie(VISITOR_COOKIE, next, ATTRIBUTION_COOKIE_MS);
  return next;
}

function getOrCreateFbp() {
  const saved = getCookie("_fbp");
  if (saved) return saved;

  const next = `fb.1.${Date.now()}.${Math.floor(Math.random() * 10000000000)}`;
  setCookie("_fbp", next, ATTRIBUTION_COOKIE_MS);
  return next;
}

function getOrCreateFbc() {
  const current = getCookie("_fbc");
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");

  if (fbclid) {
    const next = `fb.1.${Date.now()}.${fbclid}`;
    setCookie("_fbc", next, ATTRIBUTION_COOKIE_MS);
    return next;
  }

  return current;
}

function sendMetaCapiPageView() {
  if (!window.alphaMetaEventId) return;

  const payload = {
    eventId: window.alphaMetaEventId,
    eventName: "PageView",
    eventSourceUrl: window.location.href,
    fbp: getOrCreateFbp(),
    fbc: getOrCreateFbc(),
    externalId: getOrCreateVisitorId(),
    pageTitle: document.title
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(META_CAPI_ENDPOINT, new Blob([body], { type: "application/json" }));
    return;
  }

  fetch(META_CAPI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}

window.setTimeout(sendMetaCapiPageView, 2000);

function fireMetaPixelImageFallback() {
  const hasPixelHit = performance
    .getEntriesByType("resource")
    .some((entry) => entry.name.includes("facebook.com/tr") && entry.name.includes(`id=${META_PIXEL_ID}`));

  if (hasPixelHit) return;

  const img = new Image(1, 1);
  const params = new URLSearchParams({
    id: META_PIXEL_ID,
    ev: "PageView",
    dl: window.location.href,
    rl: document.referrer || "",
    if: "false",
    ts: String(Date.now())
  });

  if (window.alphaMetaEventId) {
    params.set("eid", window.alphaMetaEventId);
  }

  img.style.display = "none";
  img.src = `https://www.facebook.com/tr/?${params.toString()}`;
  document.body.appendChild(img);
}

window.addEventListener("load", () => {
  window.setTimeout(fireMetaPixelImageFallback, 1800);
});

const ES_PRICE_GROUPS = {
  eur: {
    countries: ["ES"],
    prices: {
      "basic-old": "€24,90",
      "basic-current": "€12,80",
      "premium-old": "€39,90",
      "premium-current": "€19,90"
    },
    checkout: {
      basic: "https://pay.cakto.com.br/fpw8qdf_907563",
      premium: "https://pay.cakto.com.br/qbfdnq8_907563"
    }
  },
  usd: {
    countries: ["MX", "CO", "CL", "PE"],
    prices: {
      "basic-old": "US$24,90",
      "basic-current": "US$9,60",
      "premium-old": "US$39,90",
      "premium-current": "US$14,80"
    },
    checkout: {
      basic: "https://pay.cakto.com.br/fpw8qdf_907563",
      premium: "https://pay.cakto.com.br/qbfdnq8_907563"
    }
  }
};

function applySpanishPricing(country = "") {
  if (!document.documentElement.lang.toLowerCase().startsWith("es")) return;

  const normalizedCountry = country.toUpperCase();
  const groupKey = ES_PRICE_GROUPS.eur.countries.includes(normalizedCountry) ? "eur" : "usd";
  const group = ES_PRICE_GROUPS[groupKey];

  document.documentElement.dataset.currency = groupKey;

  document.querySelectorAll("[data-price]").forEach((element) => {
    const price = group.prices[element.dataset.price];
    if (price) {
      element.textContent = price;
    }
  });

  document.querySelectorAll("[data-checkout]").forEach((link) => {
    const href = group.checkout[link.dataset.checkout];
    if (href) {
      link.href = href;
    }
  });
}

async function setupSpanishPricing() {
  if (!document.documentElement.lang.toLowerCase().startsWith("es")) return;

  const params = new URLSearchParams(window.location.search);
  const forcedCountry = params.get("country");
  const forcedCurrency = params.get("currency");

  if (forcedCurrency?.toLowerCase() === "eur") {
    applySpanishPricing("ES");
    return;
  }

  if (forcedCurrency?.toLowerCase() === "usd") {
    applySpanishPricing("US");
    return;
  }

  if (forcedCountry) {
    applySpanishPricing(forcedCountry);
    return;
  }

  try {
    const response = await fetch("/api/geo", { cache: "no-store" });
    const data = await response.json();
    applySpanishPricing(data.country);
  } catch (error) {
    applySpanishPricing();
  }
}

setupSpanishPricing();

function setupPlanScrollButtons() {
  const desktopTarget = document.querySelector("#planos");
  const mobileTarget = document.querySelector("#plano-premium");
  if (!desktopTarget || !mobileTarget) return;

  document.querySelectorAll(".primary-btn, .buy-fixed, .coupon-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const target = window.matchMedia("(max-width: 767px)").matches ? mobileTarget : desktopTarget;
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        left: 0,
        behavior: "auto"
      });
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      history.replaceState(null, "", `#${target.id}`);
      closeCouponPopup();
    });
  });
}

setupPlanScrollButtons();

document.querySelectorAll(".thumb-row").forEach((row, rowIndex) => {
  const images = [...row.querySelectorAll("img")];
  if (images.length === 0) return;

  const track = document.createElement("div");
  track.className = "carousel-track";
  const duration = 28 + (rowIndex % 5) * 3;
  track.style.setProperty("--duration", `${duration}s`);
  track.style.setProperty("--items", images.length);

  [...images, ...images].forEach((image) => {
    const clone = image.cloneNode(true);
    track.appendChild(clone);
  });

  row.replaceChildren(track);
  setupDraggableThumbRow(row, track, duration);
});

function setupDraggableThumbRow(row, track, durationSeconds) {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const state = {
    activePointerId: null,
    dragStartX: 0,
    startOffset: 0,
    offset: 0,
    lastTime: null,
    loopWidth: 0
  };

  row.classList.add("is-js-carousel");

  const getLoopWidth = () => {
    state.loopWidth = track.scrollWidth / 2;
    return state.loopWidth;
  };

  const normalizeOffset = (value) => {
    const width = getLoopWidth();
    if (!width) return 0;
    return ((value % width) + width) % width;
  };

  const render = () => {
    track.style.transform = `translate3d(${-state.offset}px, 0, 0)`;
  };

  const tick = (time) => {
    if (state.lastTime === null) {
      state.lastTime = time;
    }

    const elapsed = time - state.lastTime;
    state.lastTime = time;

    if (!reducedMotion && state.activePointerId === null) {
      const width = getLoopWidth();
      if (width) {
        state.offset = normalizeOffset(state.offset + (width / (durationSeconds * 1000)) * elapsed);
        render();
      }
    }

    window.requestAnimationFrame(tick);
  };

  row.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    state.activePointerId = event.pointerId;
    state.dragStartX = event.clientX;
    state.startOffset = state.offset;
    row.classList.add("is-dragging");
    row.setPointerCapture?.(event.pointerId);
  });

  row.addEventListener("pointermove", (event) => {
    if (state.activePointerId !== event.pointerId) return;

    const deltaX = event.clientX - state.dragStartX;
    state.offset = normalizeOffset(state.startOffset - deltaX);
    render();
    event.preventDefault();
  });

  const stopDrag = (event) => {
    if (state.activePointerId !== event.pointerId) return;

    row.classList.remove("is-dragging");
    if (row.hasPointerCapture?.(event.pointerId)) {
      row.releasePointerCapture(event.pointerId);
    }
    state.activePointerId = null;
  };

  row.addEventListener("pointerup", stopDrag);
  row.addEventListener("pointercancel", stopDrag);

  window.requestAnimationFrame(tick);
}

document.querySelectorAll(".compare-card").forEach((card) => {
  const handle = card.querySelector(".compare-handle");
  const line = card.querySelector(".compare-line");
  let activePointerId = null;
  let pointerOffset = 0;

  const setSplit = (clientX) => {
    const rect = card.getBoundingClientRect();
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    const percent = Math.min(92, Math.max(8, rawPercent));
    card.style.setProperty("--split", `${percent}%`);
  };

  const startDrag = (event) => {
    activePointerId = event.pointerId;
    const rect = card.getBoundingClientRect();
    const currentSplit = parseFloat(getComputedStyle(card).getPropertyValue("--split")) || 50;
    pointerOffset = event.clientX - (rect.left + (rect.width * currentSplit) / 100);
    card.classList.add("is-dragging");
    card.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const stopDrag = () => {
    card.classList.remove("is-dragging");
    if (activePointerId !== null && card.hasPointerCapture?.(activePointerId)) {
      card.releasePointerCapture(activePointerId);
    }
    activePointerId = null;
    pointerOffset = 0;
  };

  handle?.addEventListener("pointerdown", startDrag);
  line?.addEventListener("pointerdown", startDrag);

  card.addEventListener("pointermove", (event) => {
    if (activePointerId !== event.pointerId) return;
    setSplit(event.clientX - pointerOffset);
    event.preventDefault();
  });

  card.addEventListener("pointerup", stopDrag);
  card.addEventListener("pointercancel", stopDrag);
  card.addEventListener("lostpointercapture", stopDrag);
});
