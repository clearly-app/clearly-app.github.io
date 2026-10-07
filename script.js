const fileInput = document.getElementById("file");
const drop = document.getElementById("drop");
const editor = document.getElementById("editor");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = null;

const MAX_SIDE = matchMedia("(hover:none) and (pointer:coarse)").matches ? 1400 : Infinity;

fileInput.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  drop.classList.add("hidden");
  editor.classList.remove("hidden");
  setImage(URL.createObjectURL(f));
});

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
}

function setImage(src, scaled) {
  const n = new Image();
  n.onload = () => {
    const big = Math.max(n.width, n.height);
    // صغّر الصورة لو أكبر من الحد المسموح
    if (!scaled && big > MAX_SIDE) {
      const k = MAX_SIDE / big;
      const c = document.createElement("canvas");
      c.width = Math.round(n.width * k);
      c.height = Math.round(n.height * k);
      c.getContext("2d").drawImage(n, 0, 0, c.width, c.height);
      c.toBlob((b) => setImage(URL.createObjectURL(b), true), "image/png");
      return;
    }
    img = n;
    canvas.width = n.width;
    canvas.height = n.height;
    redraw();
    if (window.onImage) onImage();
  };
  n.src = src;
}

function cleanCanvas() {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  c.getContext("2d").drawImage(img, 0, 0);
  return c;
}