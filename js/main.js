const header = document.getElementById('siteHeader');
const hero = document.getElementById('inicio');
const burger = document.getElementById('burgerBtn');
const nav = document.getElementById('mainNav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navLinks.forEach(l => {
    const target = l.getAttribute('href') === '#nosotros' ? 'inicio' : l.getAttribute('href');
    l.classList.toggle('active', target === '#' + (current === 'nosotros' ? 'inicio' : current));
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.classList.toggle('on', open);
  burger.setAttribute('aria-expanded', String(open));
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
navLinks.forEach(l => l.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

hero.addEventListener('pointermove', e => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
  hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.service-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const cio = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.max(1, target / 30);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = Math.round(cur);
    }, 30);
    cio.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.num').forEach(c => cio.observe(c));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const videoIO = new IntersectionObserver(entries => {
  entries.forEach(e => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()));
}, { threshold: 0.1 });
document.querySelectorAll('video').forEach(v => {
  if (reduceMotion) {
    v.removeAttribute('autoplay');
    v.pause();
    if (!v.closest('.hero-video')) v.controls = true;
  } else {
    videoIO.observe(v);
  }
});

const copyBtn = document.getElementById('copyEmail');
const copyMsg = document.getElementById('copyMsg');
function copyEmail() {
  navigator.clipboard.writeText('jeingenieriaydiseno@gmail.com').then(() => {
    copyMsg.classList.add('show');
    setTimeout(() => copyMsg.classList.remove('show'), 1800);
  });
}
copyBtn.addEventListener('click', copyEmail);
copyBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyEmail(); } });

document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('fName').value;
  const company = document.getElementById('fCompany').value;
  const msg = document.getElementById('fMsg').value;
  const body = encodeURIComponent(`Nombre: ${name}\nEmpresa: ${company}\n\n${msg}`);
  window.location.href = `mailto:jeingenieriaydiseno@gmail.com?subject=Contacto desde la web JE Ingeniería & Diseño&body=${body}`;
});

document.getElementById('year').textContent = new Date().getFullYear();
