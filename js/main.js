  // Header scroll style
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Mobile nav toggle
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  burger.addEventListener('click', () => nav.classList.toggle('open'));
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => nav.classList.remove('open')));

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.service-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Animated stat counters
  const counters = document.querySelectorAll('.num');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.count;
        let cur = 0;
        const step = Math.max(1, target / 30);
        const t = setInterval(() => {
          cur += step; if (cur >= target) { cur = target; clearInterval(t); }
          el.textContent = Math.round(cur);
        }, 30);
        cio.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cio.observe(c));

  // Copy email
  const copyBtn = document.getElementById('copyEmail');
  const copyMsg = document.getElementById('copyMsg');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('jeingenieriaydiseno@gmail.com').then(() => {
      copyMsg.classList.add('show');
      setTimeout(() => copyMsg.classList.remove('show'), 1800);
    });
  });

  // Contact form -> mailto
  document.getElementById('contactForm').addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('fName').value;
    const company = document.getElementById('fCompany').value;
    const msg = document.getElementById('fMsg').value;
    const body = encodeURIComponent(`Nombre: ${name}\nEmpresa: ${company}\n\n${msg}`);
    window.location.href = `mailto:jeingenieriaydiseno@gmail.com?subject=Contacto desde la web JE Ingeniería & Diseño&body=${body}`;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
