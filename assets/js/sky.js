// ---------- Starfield with cursor constellations ----------
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let W, H;
const stars = [];
let mx = -9999, my = -9999, smx = -9999, smy = -9999;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

for (let i = 0; i < 170; i++) {
  stars.push({
    x: Math.random(), y: Math.random(),
    r: 0.4 + Math.random() * 1.6,
    depth: 0.3 + Math.random() * 0.9,
    tw: Math.random() * Math.PI * 2,
    tws: 0.006 + Math.random() * 0.018,
    gold: Math.random() < 0.14
  });
}

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

// Occasional shooting star
let meteor = null;
function maybeMeteor() {
  if (!meteor && Math.random() < 0.004) {
    meteor = {
      x: Math.random() * W * 0.8 + W * 0.1,
      y: Math.random() * H * 0.3,
      vx: 6 + Math.random() * 5,
      vy: 2.5 + Math.random() * 2,
      life: 1
    };
  }
}

const orb = document.getElementById('orb');
const orbHalo = document.getElementById('orbHalo');

function draw() {
  ctx.clearRect(0, 0, W, H);
  smx += (mx - smx) * 0.05;
  smy += (my - smy) * 0.05;

  const pts = [];
  for (const s of stars) {
    s.tw += s.tws;
    const a = (0.55 + 0.45 * Math.sin(s.tw)) * 0.9;
    const px = s.x * W - ((smx / W) - 0.5) * 34 * s.depth;
    const py = s.y * H - ((smy / H) - 0.5) * 34 * s.depth;
    ctx.beginPath();
    ctx.arc(px, py, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.gold ? `rgba(239,217,160,${a})` : `rgba(214,208,232,${a})`;
    ctx.fill();
    pts.push({ px, py });
  }

  // Constellation lines near cursor
  const R = 130;
  const near = pts.filter(p => {
    const dx = p.px - smx, dy = p.py - smy;
    return dx * dx + dy * dy < R * R;
  });
  for (let i = 0; i < near.length; i++) {
    for (let j = i + 1; j < near.length; j++) {
      const dx = near[i].px - near[j].px, dy = near[i].py - near[j].py;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) {
        ctx.beginPath();
        ctx.moveTo(near[i].px, near[i].py);
        ctx.lineTo(near[j].px, near[j].py);
        ctx.strokeStyle = `rgba(201,169,89,${0.32 * (1 - d / 110)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  }

  // Meteor
  maybeMeteor();
  if (meteor) {
    meteor.x += meteor.vx;
    meteor.y += meteor.vy;
    meteor.life -= 0.02;
    const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 9, meteor.y - meteor.vy * 9);
    grad.addColorStop(0, `rgba(239,217,160,${meteor.life})`);
    grad.addColorStop(1, 'rgba(239,217,160,0)');
    ctx.beginPath();
    ctx.moveTo(meteor.x, meteor.y);
    ctx.lineTo(meteor.x - meteor.vx * 9, meteor.y - meteor.vy * 9);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    if (meteor.life <= 0 || meteor.x > W || meteor.y > H) meteor = null;
  }

  // Orb leans gently toward cursor (home page only)
  if (orb) {
    const rect = orb.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dx = (smx - cx) / W, dy = (smy - cy) / H;
    const shift = `translate(${dx * 16}px, ${dy * 16}px)`;
    orb.style.transform = shift;
    if (orbHalo) orbHalo.style.transform = shift;
  }

  requestAnimationFrame(draw);
}
draw();

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const constellationNav = document.querySelector('.constellation-nav');
if (navToggle && constellationNav) {
  navToggle.addEventListener('click', () => {
    constellationNav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  // Close when tapping outside the menu
  document.addEventListener('click', e => {
    if (constellationNav.classList.contains('open') &&
        !constellationNav.contains(e.target) && !navToggle.contains(e.target)) {
      constellationNav.classList.remove('open');
      navToggle.classList.remove('open');
    }
  });
}

// ---------- Recent Transmissions (home page) ----------
// Fills the three homepage cards from assets/data/recent.json, which a GitHub
// Action refreshes daily from the YouTube RSS feed. On any failure, the
// hand-written fallback cards in the HTML remain untouched.
if (document.getElementById('recentGrid')) {
  fetch('assets/data/recent.json')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(vids => {
      const grid = document.getElementById('recentGrid');
      if (!grid || !Array.isArray(vids) || !vids.length) return;
      grid.innerHTML = '';
      vids.slice(0, 3).forEach(v => {
        const a = document.createElement('a');
        a.className = 'relic';
        a.href = v.url;
        a.target = '_blank';
        a.rel = 'noopener';
        const img = document.createElement('img');
        img.className = 'thumb';
        img.src = v.thumb;
        img.alt = '';
        img.loading = 'lazy';
        const h = document.createElement('h4');
        h.textContent = v.title;
        a.appendChild(img);
        a.appendChild(h);
        grid.appendChild(a);
      });
    })
    .catch(() => {});
}

// ---------- Lightbox (art pages) ----------
const lb = document.getElementById('lightbox');
if (lb) {
  const lbImg = lb.querySelector('img');
  document.querySelectorAll('.artwork img, .story-illus img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.classList.add('open');
    });
  });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
}
