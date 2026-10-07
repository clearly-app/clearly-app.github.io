const fileInput = document.getElementById("file");
const drop = document.getElementById("drop");
const editor = document.getElementById("editor");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = null;

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

function setImage(src) {
  const n = new Image();
  n.onload = () => {
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