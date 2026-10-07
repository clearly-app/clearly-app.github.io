const $ = (id) => document.getElementById(id);
const HIST = [];
let ORIG = null;
const rawSet = window.setImage;

// history for Undo + remember the first image
window.setImage = function (src) {
  if (img) { HIST.push(img.src); if (HIST.length > 12) HIST.shift(); }
  if (!ORIG) ORIG = src;
  rawSet(src);
};
$("undo").onclick = () => { const s = HIST.pop(); if (s) rawSet(s); };

// ---------- filters + adjust ----------
const SL = ["brightness", "contrast", "saturate", "sepia", "hue", "blur"];
const fs = (v, k = 1) => `brightness(${v[0]}%) contrast(${v[1]}%) saturate(${v[2]}%) sepia(${v[3]}%) hue-rotate(${v[4]}deg) blur(${v[5] * k}px)`;
const vals = () => SL.map((i) => +$(i).value);
const setVals = (v) => { v.forEach((x, i) => ($(SL[i]).value = x)); canvas.style.filter = fs(vals()); };
const resetAdj = () => {
  setVals([100, 100, 100, 0, 0, 0]);
  canvas.style.filter = "";
  document.querySelectorAll(".pre").forEach((p) => p.classList.remove("on"));
};
SL.forEach((i) => ($(i).oninput = () => (canvas.style.filter = fs(vals()))));

const PRE = {
  Original: [100, 100, 100, 0, 0, 0], Vivid: [105, 115, 130, 0, 0, 0], Mono: [100, 115, 0, 0, 0, 0],
  Noir: [88, 140, 0, 0, 0, 0], Warm: [102, 105, 115, 28, 0, 0], Cool: [100, 105, 108, 0, -15, 0],
  Fade: [108, 88, 85, 0, 0, 0], Drama: [92, 132, 110, 0, 0, 0], Vintage: [104, 92, 80, 40, -8, 0],
  Cinema: [96, 122, 92, 12, 12, 0],
};
const P = $("presets");
P.innerHTML = Object.keys(PRE).map((n) => `<button class="pre" data-n="${n}"><canvas width="56" height="56"></canvas>${n}</button>`).join("");
window.onImage = () => {
  $("rw").value = img.width;
  const s = Math.min(img.width, img.height);
  P.querySelectorAll(".pre").forEach((b) => {
    const x = b.firstChild.getContext("2d");
    x.filter = fs(PRE[b.dataset.n], 0);
    x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 56, 56);
  });
};
P.onclick = (e) => {
  const b = e.target.closest(".pre");
  if (!b) return;
  document.querySelectorAll(".pre").forEach((p) => p.classList.toggle("on", p === b));
  setVals(PRE[b.dataset.n]);
};
$("resetAdj").onclick = resetAdj;
$("apply").onclick = () => {
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const x = c.getContext("2d");
  x.filter = fs(vals(), img.width / canvas.getBoundingClientRect().width);
  x.drawImage(img, 0, 0);
  resetAdj();
  setImage(c.toDataURL("image/png"));
};

// ---------- effects ----------
const mod = (fn) => { const c = cleanCanvas(); fn(c, c.getContext("2d")); setImage(c.toDataURL("image/png")); };
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
$("sharp").onclick = () => mod((c, x) => {
  const W = c.width, H = c.height;
  const b = document.createElement("canvas");
  b.width = W; b.height = H;
  const bx = b.getContext("2d");
  bx.filter = "blur(1.5px)";
  bx.drawImage(c, 0, 0);
  const a = x.getImageData(0, 0, W, H), d = bx.getImageData(0, 0, W, H);
  for (let i = 0; i < a.data.length; i += 4)
    for (let k = 0; k < 3; k++) a.data[i + k] = clamp(a.data[i + k] + 0.8 * (a.data[i + k] - d.data[i + k]));
  x.putImageData(a, 0, 0);
});
$("vig").onclick = () => mod((c, x) => {
  const g = x.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.3, c.width / 2, c.height / 2, Math.hypot(c.width, c.height) / 2);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,.7)");
  x.fillStyle = g;
  x.fillRect(0, 0, c.width, c.height);
});
$("grain").onclick = () => mod((c, x) => {
  const a = x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < a.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 42;
    for (let k = 0; k < 3; k++) a.data[i + k] = clamp(a.data[i + k] + n);
  }
  x.putImageData(a, 0, 0);
});
$("auto").onclick = () => mod((c, x) => {
  const a = x.getImageData(0, 0, c.width, c.height), h = new Uint32Array(256);
  for (let i = 0; i < a.data.length; i += 4) h[(a.data[i] * 0.3 + a.data[i + 1] * 0.59 + a.data[i + 2] * 0.11) | 0]++;
  const tot = a.data.length / 4;
  let lo = 0, hi = 255, s = 0;
  while (lo < 255 && (s += h[lo]) < tot * 0.005) lo++;
  s = 0;
  while (hi > 0 && (s += h[hi]) < tot * 0.005) hi--;
  const k = 255 / Math.max(1, hi - lo);
  for (let i = 0; i < a.data.length; i += 4)
    for (let j = 0; j < 3; j++) a.data[i + j] = clamp((a.data[i + j] - lo) * k);
  x.putImageData(a, 0, 0);
});

// ---------- crop / resize ----------
document.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => {
  const [a, d] = b.dataset.r.split(":").map(Number), r = a / d;
  let w = img.width, h = img.height;
  if (w / h > r) w = Math.round(h * r); else h = Math.round(w / r);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").drawImage(img, (img.width - w) / 2, (img.height - h) / 2, w, h, 0, 0, w, h);
  setImage(c.toDataURL("image/png"));
}));
$("resize").onclick = () => {
  const w = +$("rw").value;
  if (w < 16 || w > 8000) return;
  const c = document.createElement("canvas");
  c.width = w; c.height = Math.round((img.height * w) / img.width);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  setImage(c.toDataURL("image/png"));
};

// ---------- rotate / flip ----------
function tf(fn) { const c = document.createElement("canvas"); fn(c, c.getContext("2d")); setImage(c.toDataURL("image/png")); }
$("rotl").onclick = () => tf((c, x) => { c.width = img.height; c.height = img.width; x.translate(0, c.height); x.rotate(-Math.PI / 2); x.drawImage(img, 0, 0); });
$("rotr").onclick = () => tf((c, x) => { c.width = img.height; c.height = img.width; x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(img, 0, 0); });
$("flipx").onclick = () => tf((c, x) => { c.width = img.width; c.height = img.height; x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(img, 0, 0); });
$("flipy").onclick = () => tf((c, x) => { c.width = img.width; c.height = img.height; x.translate(0, c.height); x.scale(1, -1); x.drawImage(img, 0, 0); });

// ---------- text ----------
$("addtxt").onclick = () => {
  if (!$("txt").value.trim()) return;
  mod((c, x) => {
    const size = Math.round((c.height * $("tsize").value) / 100);
    x.font = `800 ${size}px Inter, Arial, sans-serif`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = $("tcolor").value;
    x.shadowColor = "rgba(0,0,0,.55)";
    x.shadowBlur = size / 6;
    x.fillText($("txt").value, c.width / 2, { top: 0.12, middle: 0.5, bottom: 0.88 }[$("tpos").value] * c.height);
  });
};

// ---------- compare / export / gallery ----------
const cmp = $("compare");
cmp.onpointerdown = () => {
  if (!ORIG) return;
  const o = new Image();
  o.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(o, 0, 0, canvas.width, canvas.height); };
  o.src = ORIG;
};
cmp.onpointerup = cmp.onpointerleave = () => redraw();

$("download").onclick = () => {
  const f = $("fmt").value;
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const x = c.getContext("2d");
  if (f !== "png") { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); }
  x.drawImage(img, 0, 0);
  const a = document.createElement("a");
  a.href = c.toDataURL("image/" + f, 0.92);
  a.download = "clearly." + (f === "jpeg" ? "jpg" : f);
  a.click();
};
$("newp").onclick = () => location.reload();

$("save").onclick = () => {
  const s = Math.min(1, 640 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  const W = JSON.parse(localStorage.getItem("clearly.works") || "[]");
  W.unshift({ name: "Work " + (W.length + 1), src: c.toDataURL("image/jpeg", 0.8) });
  try {
    localStorage.setItem("clearly.works", JSON.stringify(W.slice(0, 12)));
    $("save").textContent = "Saved!";
  } catch (e) {
    alert("Storage is full. Delete some works in the Gallery.");
  }
  setTimeout(() => ($("save").textContent = "Save to gallery"), 1500);
};

addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "z") { e.preventDefault(); $("undo").click(); }
});