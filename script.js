document.querySelector("[data-minutes]").textContent = "00";
document.querySelector("[data-seconds]").textContent = "00";

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
