const TIMER_COOKIE = "alphaArtsTimerEndsAt";
const TIMER_DURATION_MS = 5 * 60 * 1000;

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

function updateTimer() {
  const remaining = Math.max(0, timerEnd - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
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
