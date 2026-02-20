/* ═══════════════════════════════════════════════════════
   BMC1 AI Consulting — script.js
══════════════════════════════════════════════════════════ */

'use strict';

/* ── State ──────────────────────────────────────────── */
let currentLang = 'en';
let calCurrentDate = new Date();
let selectedDate = null;
let selectedTime = null;

/* ══════════════════════════════════════════════════════
   1. LANGUAGE SWITCHER
══════════════════════════════════════════════════════════ */
function applyLanguage(lang) {
  currentLang = lang;
  const isDE = lang === 'de';

  document.documentElement.lang = isDE ? 'de' : 'en';

  // Swap all data-en / data-de elements
  document.querySelectorAll('[data-en]').forEach(el => {
    const key = isDE ? el.dataset.de : el.dataset.en;
    if (key !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = key;
      } else if (el.tagName === 'OPTION') {
        el.textContent = key;
      } else {
        el.textContent = key;
      }
    }
  });

  // Update calendar weekdays
  renderCalendar();

  // Update nav toggle labels
  document.getElementById('langLabel').textContent = isDE ? 'DE' : 'EN';
  document.getElementById('langAlt').textContent   = isDE ? 'EN' : 'DE';
}

document.getElementById('langToggle').addEventListener('click', () => {
  applyLanguage(currentLang === 'en' ? 'de' : 'en');
});

/* ══════════════════════════════════════════════════════
   2. NAVBAR SCROLL
══════════════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ══════════════════════════════════════════════════════
   3. HAMBURGER MENU
══════════════════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close on nav click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

/* ══════════════════════════════════════════════════════
   4. HERO PARTICLE CANVAS
══════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H, raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.2);
      this.alpha = Math.random() * 0.6 + 0.1;
      this.life  = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const fade = Math.min(this.life / 60, (this.maxLife - this.life) / 60, 1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(26, 108, 196, ${this.alpha * fade})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    const threshold = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold) {
          const alpha = (1 - dist / threshold) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(26, 108, 196, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor(W * H / 12000), 80);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Gradient overlay
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
    grad.addColorStop(0, 'rgba(26, 108, 196, 0.06)');
    grad.addColorStop(1, 'rgba(240, 246, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    init();
    animate();
  }, { passive: true });

  init();
  animate();
})();

/* ══════════════════════════════════════════════════════
   5. SCROLL FADE-IN (IntersectionObserver)
══════════════════════════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ══════════════════════════════════════════════════════
   6. FAQ ACCORDION
══════════════════════════════════════════════════════════ */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    // Toggle current
    if (!isOpen) item.classList.add('open');
  });
});

/* ══════════════════════════════════════════════════════
   7. CALENDAR
══════════════════════════════════════════════════════════ */
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];

function renderCalendar() {
  const grid  = document.getElementById('calGrid');
  const title = document.getElementById('calTitle');
  const now   = new Date();
  const year  = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();

  const months = currentLang === 'de' ? MONTHS_DE : MONTHS_EN;
  title.textContent = `${months[month]} ${year}`;

  // First day of month (0=Sun)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  grid.innerHTML = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = d;

    const cellDate = new Date(year, month, d);
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (cellDate < todayDate) {
      cell.classList.add('cal-past');
    } else {
      if (cellDate.getTime() === todayDate.getTime()) {
        cell.classList.add('cal-today');
      }
      if (
        selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === d
      ) {
        cell.classList.add('cal-selected');
      }
      cell.addEventListener('click', () => selectDate(new Date(year, month, d)));
    }
    grid.appendChild(cell);
  }
}

function selectDate(date) {
  selectedDate = date;
  selectedTime = null;
  renderCalendar();
  renderTimeSlots(date);
  document.getElementById('bookingForm').style.display = 'none';
  document.getElementById('bookingConfirmed').style.display = 'none';
}

function renderTimeSlots(date) {
  const slotDate  = document.getElementById('slotDate');
  const timeslots = document.getElementById('timeslots');

  const months = currentLang === 'de' ? MONTHS_DE : MONTHS_EN;
  const dayNames_en = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayNames_de = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  const days = currentLang === 'de' ? dayNames_de : dayNames_en;

  slotDate.classList.add('has-date');
  slotDate.textContent = `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  // Simulate some unavailable slots
  const unavailable = [2, 5, 8];

  timeslots.innerHTML = '';
  TIMES.forEach((time, idx) => {
    const btn = document.createElement('button');
    btn.className = 'time-slot-btn';
    const avail = !unavailable.includes(idx);
    if (!avail) {
      btn.disabled = true;
      btn.style.opacity = '0.35';
      btn.style.cursor = 'not-allowed';
    }
    btn.innerHTML = `
      <span>${time}</span>
      <span class="slot-avail">${avail ? (currentLang === 'de' ? 'Verfügbar' : 'Available') : (currentLang === 'de' ? 'Belegt' : 'Booked')}</span>
    `;
    if (avail) {
      btn.addEventListener('click', () => selectTime(time, btn));
    }
    timeslots.appendChild(btn);
  });
}

function selectTime(time, btn) {
  selectedTime = time;
  document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('bookingForm').style.display = 'flex';
  document.getElementById('bookingConfirmed').style.display = 'none';
}

// Calendar navigation
document.getElementById('calPrev').addEventListener('click', () => {
  const now = new Date();
  const prev = new Date(calCurrentDate.getFullYear(), calCurrentDate.getMonth() - 1, 1);
  if (prev >= new Date(now.getFullYear(), now.getMonth(), 1)) {
    calCurrentDate = prev;
    renderCalendar();
  }
});
document.getElementById('calNext').addEventListener('click', () => {
  calCurrentDate = new Date(calCurrentDate.getFullYear(), calCurrentDate.getMonth() + 1, 1);
  renderCalendar();
});

// Booking confirm
document.getElementById('confirmBook').addEventListener('click', () => {
  const name  = document.getElementById('bookName').value.trim();
  const email = document.getElementById('bookEmail').value.trim();
  const phone = document.getElementById('bookPhone').value.trim();

  if (!name) {
    document.getElementById('bookName').focus();
    return;
  }
  if (!email && !phone) {
    document.getElementById('bookEmail').focus();
    return;
  }

  const btn = document.getElementById('confirmBook');
  btn.disabled = true;
  btn.querySelector('span').textContent = currentLang === 'de' ? 'Wird gesendet…' : 'Sending…';

  // FORMSPREE: Gleicher Code wie Kontaktformular
  const FORMSPREE_URL = 'https://formspree.io/f/DEIN_FORMSPREE_CODE';

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email || '—');
  formData.append('phone', phone || '—');
  formData.append('date', selectedDate ? selectedDate.toLocaleDateString('en-GB') : '—');
  formData.append('time', selectedTime || '—');
  formData.append('_subject', `Booking Request: ${name} — ${selectedDate ? selectedDate.toLocaleDateString('en-GB') : ''} ${selectedTime || ''}`);

  fetch(FORMSPREE_URL, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if (response.ok) {
      document.getElementById('bookingForm').style.display = 'none';
      document.getElementById('bookingConfirmed').style.display = 'flex';
    } else {
      alert(currentLang === 'de' ? 'Fehler beim Senden. Bitte versuche es erneut.' : 'Error sending booking. Please try again.');
      btn.disabled = false;
      btn.querySelector('span').textContent = currentLang === 'de' ? 'Buchung bestätigen' : 'Confirm Booking';
    }
  })
  .catch(() => {
    alert(currentLang === 'de' ? 'Netzwerkfehler. Bitte versuche es erneut.' : 'Network error. Please try again.');
    btn.disabled = false;
    btn.querySelector('span').textContent = currentLang === 'de' ? 'Buchung bestätigen' : 'Confirm Booking';
  });
});

// Init calendar
renderCalendar();

/* ══════════════════════════════════════════════════════
   8. CONTACT FORM
══════════════════════════════════════════════════════════ */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const message = document.getElementById('cMessage').value.trim();

  if (!name || !email || !message) {
    if (!name)    document.getElementById('cName').focus();
    else if (!email)   document.getElementById('cEmail').focus();
    else          document.getElementById('cMessage').focus();
    return;
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('cEmail').focus();
    return;
  }

  const btn = document.getElementById('contactSubmit');
  btn.disabled = true;
  btn.querySelector('span').textContent = currentLang === 'de' ? 'Wird gesendet…' : 'Sending…';

  // FORMSPREE
  const FORMSPREE_URL = 'https://formspree.io/f/xpqjjjkl';

  const formData = new FormData(document.getElementById('contactForm'));
  formData.append('_replyto', email);

  fetch(FORMSPREE_URL, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if (response.ok) {
      document.getElementById('formSuccess').style.display = 'block';
      document.getElementById('contactForm').reset();
      setTimeout(() => {
        document.getElementById('formSuccess').style.display = 'none';
      }, 5000);
    } else {
      alert(currentLang === 'de' ? 'Fehler beim Senden. Bitte versuche es erneut.' : 'Error sending message. Please try again.');
    }
  })
  .catch(() => {
    alert(currentLang === 'de' ? 'Netzwerkfehler. Bitte versuche es erneut.' : 'Network error. Please try again.');
  })
  .finally(() => {
    btn.disabled = false;
    btn.querySelector('span').textContent = currentLang === 'de' ? 'Nachricht senden' : 'Send Message';
  });
});

/* ══════════════════════════════════════════════════════
   9. SMOOTH ACTIVE NAV LINK HIGHLIGHT
══════════════════════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + entry.target.id) {
          a.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

/* ══════════════════════════════════════════════════════
   10. PRICING NUMBER COUNTER ANIMATION
══════════════════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString();
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const raw = el.textContent;
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 1) {
        const suffix = raw.replace(/[0-9.]/g, '');
        animateCounter({ textContent: '' }, num, 1200);
        // Custom for display
        let s = 0;
        const step = num / (1200 / 16);
        const tick = () => {
          s = Math.min(s + step, num);
          el.textContent = (Number.isInteger(num) ? Math.floor(s) : s.toFixed(1)) + suffix;
          if (s < num) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statObserver.observe(el));

/* ══════════════════════════════════════════════════════
   11. FORM FLOATING LABELS — fix for select
══════════════════════════════════════════════════════════ */
document.querySelectorAll('.form-select').forEach(sel => {
  const label = sel.nextElementSibling;
  function check() {
    if (sel.value) {
      sel.classList.add('has-value');
    } else {
      sel.classList.remove('has-value');
    }
  }
  sel.addEventListener('change', check);
  check();
});

/* ══════════════════════════════════════════════════════
   12. INIT
══════════════════════════════════════════════════════════ */
// Apply default language
applyLanguage('en');
