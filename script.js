/* ===== helpers ===== */
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toast(message) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = "[SYSTEM] " + message;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 500); }, 3000);
}

/* ===== floating stars ===== */
const starsBox = $("stars");
function createStar() {
  if (!starsBox) return;
  const s = document.createElement("span");
  const dur = Math.random() * 8 + 7, delay = Math.random() * 2;
  s.className = "star";
  s.textContent = Math.random() > 0.5 ? "✦" : "✧";
  s.style.left = Math.random() * 100 + "%";
  s.style.fontSize = Math.random() * 12 + 8 + "px";
  s.style.animationDuration = dur + "s";
  s.style.animationDelay = delay + "s";
  starsBox.appendChild(s);
  setTimeout(() => s.remove(), (dur + delay) * 1000);
}
for (let i = 0; i < 20; i++) createStar();
setInterval(createStar, 700);

/* ===== boot sequence (Star Stream connecting) ===== */
const boot = $("boot"), bootText = $("bootText");
let bootSkipped = false;
function endBoot() {
  bootSkipped = true;
  boot.classList.add("gone");
  setTimeout(() => boot.remove(), 800);
  startViewers();
}
async function runBoot() {
  const lines = [
    "Connecting to the Star Stream...",
    "Verifying incarnation... OK",
    "Loading the story of this world...",
    "",
    "A hidden scenario has arrived.",
  ];
  for (const line of lines) {
    for (const ch of line) {
      if (bootSkipped) return;
      bootText.textContent += ch;
      await sleep(28);
    }
    bootText.textContent += "\n";
    await sleep(350);
  }
  await sleep(500);
  if (!bootSkipped) endBoot();
}
boot.addEventListener("click", endBoot);
boot.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") endBoot(); });
runBoot();

/* ===== viewers + coins ===== */
const viewersEl = $("viewers"), coinEl = $("coinCount");
let viewers = 0, coins = 0, viewerTimer;
function startViewers() {
  if (viewerTimer) return;
  viewers = 7;
  viewersEl.textContent = viewers;
  viewerTimer = setInterval(() => {
    viewers = Math.max(3, viewers + Math.floor(Math.random() * 5) - 1);
    viewersEl.textContent = viewers;
  }, 2200);
}
function addCoins(n) {
  const start = coins, end = coins + n, t0 = performance.now();
  coins = end;
  (function tick(now) {
    const p = Math.min((now - t0) / 800, 1);
    coinEl.textContent = Math.round(start + (end - start) * p).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ===== constellation messages ===== */
const feed = $("feed");
const messages = [
  { who: "Secretive Plotter", text: "Today is the day. Everything is going according to plan.", c: 0 },
  { who: "Abyssal Black Flame Dragon", text: "Is this the birthday everyone is talking about? Hmph. Not bad.", c: 100 },
  { who: "Prisoner of the Golden Headband", text: "Eat the cake. Eat ALL the cake.", c: 200 },
  { who: "Queen of the Darkest Spring", text: "A birthday? How lovely. I'll send flowers from the underworld.", c: 300 },
  { who: "Father of the Rich Night", text: "Even I allow one day of celebration. Do not waste it.", c: 200 },
  { who: "Demon-like Judge of Fire", text: "...Happy birthday. Don't read into it.", c: 0 },
  { who: "Descendant of the Stars", text: "has sponsored you with", c: 1000, big: true },
];
let feedStarted = false;
async function playFeed() {
  if (feedStarted) return;
  feedStarted = true;
  for (const m of messages) {
    const d = document.createElement("div");
    d.className = "msg" + (m.big ? " big" : "");
    const coinPart = m.c ? ` <span class="c">[+${m.c.toLocaleString()} coins]</span>` : "";
    d.innerHTML = m.big
      ? `The constellation <b>'${m.who}'</b> ${m.text}${coinPart}!`
      : `The constellation <b>'${m.who}'</b> says: "${m.text}"${coinPart}`;
    feed.appendChild(d);
    if (m.c) addCoins(m.c);
    await sleep(1500);
  }
}

/* ===== scroll reveal ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    const stats = e.target.querySelector(".stats");
    if (stats) stats.classList.add("on");
    if (e.target.classList.contains("feed-section")) playFeed();
    io.unobserve(e.target);
  });
}, { threshold: 0.2 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
document.querySelectorAll(".stats i").forEach((i) => i.style.setProperty("--w", i.dataset.v));

/* ===== accept scenario ===== */
const surprise = $("surpriseButton");
if (surprise) {
  surprise.addEventListener("click", () => {
    toast("Main Scenario #1 accepted. Good luck, incarnation.");
    setTimeout(() => $("letter")?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
  });
}

/* ===== photos: show placeholder if image is missing ===== */
document.querySelectorAll(".frame img").forEach((img) => {
  const mark = () => img.parentElement.classList.add("empty");
  img.addEventListener("error", mark);
  if (img.complete && img.naturalWidth === 0) mark();
});

/* ===== bonus gift ===== */
const wishButton = $("wishButton"), wishMessage = $("wishMessage");
const overlay = $("bonusGiftOverlay"), particlesBox = $("bonusParticles"), claimBtn = $("claimGiftButton");
let done = false;

function burst() {
  if (!particlesBox) return;
  particlesBox.replaceChildren();
  const sym = ["✦", "✧", "✨", "⋆", "♡"];
  for (let i = 0; i < 45; i++) {
    const p = document.createElement("span");
    const a = Math.random() * Math.PI * 2, d = 100 + Math.random() * 300;
    p.className = "bonus-particle";
    p.textContent = sym[Math.floor(Math.random() * sym.length)];
    p.style.setProperty("--mx", Math.cos(a) * d + "px");
    p.style.setProperty("--my", Math.sin(a) * d + "px");
    p.style.animationDelay = Math.random() * 0.3 + "s";
    p.style.fontSize = 14 + Math.random() * 18 + "px";
    particlesBox.appendChild(p);
  }
}

function completeScenario() {
  if (done) return;
  done = true;
  wishButton.textContent = "SCENARIO COMPLETED ✓";
  wishButton.disabled = true;
  wishMessage.textContent = "✦ Main Scenario #1 cleared. A hidden reward has been discovered! ✦";
  addCoins(5000);
  document.body.classList.add("lock");
  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add("active", "flash");
  burst();
  setTimeout(burst, 250);
  setTimeout(() => overlay.classList.remove("flash"), 1200);
  setTimeout(() => claimBtn.focus({ preventScroll: true }), 1400);
}
wishButton?.addEventListener("click", completeScenario);

claimBtn?.addEventListener("click", () => {
  document.querySelector(".reward-detail").textContent =
    "Your bonus gift is waiting for you! Come find me in real life to claim it. I can't wait to give it to you.";
  document.querySelector(".bonus-footer").textContent = "[ REWARD STATUS: WAITING TO BE CLAIMED IN PERSON ]";
  claimBtn.textContent = "Enjoy!!!";
  claimBtn.disabled = true;
  toast("Claim request registered. Please meet your sponsor in person!");
});
