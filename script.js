const TIMER_COOKIE = "alphaArtsTimerEndsAt";
const TIMER_DURATION_MS = 5 * 60 * 1000;

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
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setCookie(name, value) {
  const expires = new Date(Date.now() + TIMER_DURATION_MS).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
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

document.querySelectorAll(".thumb-row").forEach((row, rowIndex) => {
  const images = [...row.querySelectorAll("img")];
  if (images.length === 0) return;

  const track = document.createElement("div");
  track.className = "carousel-track";
  track.style.setProperty("--duration", `${28 + (rowIndex % 5) * 3}s`);
  track.style.setProperty("--items", images.length);

  [...images, ...images].forEach((image) => {
    const clone = image.cloneNode(true);
    track.appendChild(clone);
  });

  row.replaceChildren(track);
});

document.querySelectorAll(".compare-card").forEach((card) => {
  const setSplit = (clientX) => {
    const rect = card.getBoundingClientRect();
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    const percent = Math.min(92, Math.max(8, rawPercent));
    card.style.setProperty("--split", `${percent}%`);
  };

  const stopDrag = () => {
    card.classList.remove("is-dragging");
    if (activePointerId !== null && card.hasPointerCapture?.(activePointerId)) {
      card.releasePointerCapture(activePointerId);
    }
    activePointerId = null;
  };

  let activePointerId = null;

  card.addEventListener("pointerdown", (event) => {
    activePointerId = event.pointerId;
    card.classList.add("is-dragging");
    card.setPointerCapture?.(event.pointerId);
    setSplit(event.clientX);
  });

  card.addEventListener("pointermove", (event) => {
    if (activePointerId !== event.pointerId) return;
    setSplit(event.clientX);
  });

  card.addEventListener("pointerup", stopDrag);
  card.addEventListener("pointercancel", stopDrag);
  card.addEventListener("lostpointercapture", stopDrag);
});
