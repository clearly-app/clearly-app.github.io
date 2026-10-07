const pages = [["index.html","Home"],["studio.html","Studio"],["gallery.html","Gallery"],["features.html","Features"],["customize.html","Customize"],["about.html","About"]];
const here = location.pathname.split("/").pop() || "index.html";
const crown = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 7l5 4 5-7 5 7 5-4-2 12H4z"/></svg>';
const KEY = "clearly.theme";
const isTouch = matchMedia("(hover:none) and (pointer:coarse)").matches;

document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="theme.css">');

function applyTheme() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const r = document.documentElement;
  let m = s.mode || "dark";
  if (m === "auto") m = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  r.dataset.theme = m;
  ["gold", "gold2", "royal", "royal2", "bg", "text"].forEach((k) =>
    s[k] ? r.style.setProperty("--" + k, s[k]) : r.style.removeProperty("--" + k));
  r.style.setProperty("--blur", (s.blur ?? 24) + "px");
  r.style.setProperty("--radius", (s.radius ?? 26) + "px");
  r.style.setProperty("--btnr", (s.btnr ?? 999) + "px");
  r.style.setProperty("--hfont", {
    serif: '"Playfair Display",Georgia,serif',
    sans: 'Inter,system-ui,sans-serif',
    mono: 'Consolas,"Courier New",monospace',
  }[s.font || "serif"]);
  r.dataset.orbs = s.orbs === false ? "off" : "on";
  r.dataset.glow = s.glow === false ? "off" : "on";
  r.dataset.motion = s.motion === false ? "off" : "on";
}
applyTheme();

document.body.insertAdjacentHTML("afterbegin",
  `<div class="bg"><i class="orb o1"></i><i class="orb o2"></i><i class="orb o3"></i></div>
   <div class="cursor-glow"></div>
   <header class="glass nav">
     <a class="logo" href="index.html">${crown}Clearly</a>
     <nav>${pages.map(([h, t]) => `<a href="${h}" class="${h === here ? "on" : ""}">${t}</a>`).join("")}</nav>
     <div class="navr"><button class="btn mini" id="tt" aria-label="Toggle theme"></button><a class="btn gold mini" href="studio.html">Open Studio</a></div>
   </header>`);
document.body.insertAdjacentHTML("beforeend", "<footer>Clearly · Royal Photo Studio</footer>");

const tt = document.getElementById("tt");
const label = () => (tt.textContent = document.documentElement.dataset.theme === "light" ? "Dark" : "Light");
label();
tt.onclick = () => {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  s.mode = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem(KEY, JSON.stringify(s));
  applyTheme();
  label();
};

// تتبع الماوس: على اللابتوب/PC فقط
if (!isTouch) {
  const glow = document.querySelector(".cursor-glow");
  addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
  });

  document.querySelectorAll(".glass").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
      if (el.classList.contains("card")) {
        el.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 12 + "deg");
        el.style.setProperty("--rx", -((e.clientY - r.top) / r.height - 0.5) * 12 + "deg");
      }
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}

const dz = document.getElementById("drop");
if (dz) {
  const fi = document.getElementById("file");
  ["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
  dz.addEventListener("drop", (e) => {
    if (e.dataTransfer.files[0]) { fi.files = e.dataTransfer.files; fi.dispatchEvent(new Event("change")); }
  });
}

// ---- real liquid glass (Chromium على اللابتوب/PC فقط) ----
if (!isTouch && (window.chrome || /Chrome|Edg/.test(navigator.userAgent))) {
  document.documentElement.classList.add("lg");
  const map = "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' preserveAspectRatio='none'><defs><linearGradient id='x' x1='0' x2='1'><stop offset='0' stop-color='#000'/><stop offset='.15' stop-color='#808080'/><stop offset='.85' stop-color='#808080'/><stop offset='1' stop-color='#f00'/></linearGradient><linearGradient id='y' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='.15' stop-color='#808080'/><stop offset='.85' stop-color='#808080'/><stop offset='1' stop-color='#0f0'/></linearGradient></defs><rect width='100' height='100' fill='#000'/><rect width='100' height='100' fill='url(#x)'/><rect width='100' height='100' fill='url(#y)' style='mix-blend-mode:screen'/></svg>";
  document.body.insertAdjacentHTML("afterbegin",
    `<svg width="0" height="0" style="position:absolute"><filter id="lg" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="data:image/svg+xml,${encodeURIComponent(map)}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="m"/><feDisplacementMap in="SourceGraphic" in2="m" scale="48" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`);
}