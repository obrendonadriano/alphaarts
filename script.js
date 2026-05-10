const TIMER_COOKIE = "alphaArtsTimerEndsAt";
const VISITOR_COOKIE = "alphaArtsVisitorId";
const TIMER_DURATION_MS = 5 * 60 * 1000;
const ATTRIBUTION_COOKIE_MS = 90 * 24 * 60 * 60 * 1000;
const META_CAPI_ENDPOINT = "/api/meta-capi";
const META_PIXEL_ID = "796614969974062";

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
      basic: "https://pay.cakto.com.br/fpw8qdf_868838",
      premium: "https://pay.cakto.com.br/qbfdnq8_868851"
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
      basic: "https://pay.cakto.com.br/fpw8qdf_868838",
      premium: "https://pay.cakto.com.br/qbfdnq8_868851"
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

  document.querySelectorAll(".primary-btn").forEach((button) => {
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
