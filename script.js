/* =============================================
   EMBER & OAK KITCHEN — script.js
   ============================================= */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefRed = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────
   1. SCROLL REVEAL
───────────────────────────────────────────── */
if (!prefRed) {
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('up');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  $$('.sr').forEach(el => revealIO.observe(el));
} else {
  $$('.sr').forEach(el => el.classList.add('up'));
}

/* ─────────────────────────────────────────────
   2. STICKY HEADER
───────────────────────────────────────────── */
const hdr = $('#hdr');
if (hdr) {
  window.addEventListener('scroll', () => {
    hdr.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   3. SMOOTH SCROLL
───────────────────────────────────────────── */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const target = $(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80 + 38; // header + topbar
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: prefRed ? 'auto' : 'smooth' });
  });
});

/* ─────────────────────────────────────────────
   4. MOBILE NAV
───────────────────────────────────────────── */
const hamburger = $('#hamburger');
const mobileNav = $('#mobile-nav');
let navOpen = false;

function openNav() {
  navOpen = true;
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  navOpen = false;
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}
if (hamburger) {
  hamburger.addEventListener('click', () => navOpen ? closeNav() : openNav());
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => { if (navOpen) closeNav(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navOpen) closeNav(); });
}

/* ─────────────────────────────────────────────
   5. STAT COUNTERS
───────────────────────────────────────────── */
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function animateCounter(el, target, suffix, duration) {
  if (!el || prefRed) {
    if (el) el.innerHTML = target + '<span class="accent">' + suffix + '</span>';
    return;
  }
  const start = performance.now();
  const isFloat = String(target).includes('.');
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const val = easeOut(p) * target;
    el.innerHTML = (isFloat ? val.toFixed(1) : Math.round(val)) + '<span class="accent">' + suffix + '</span>';
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

let countersDone = false;
const statsSection = $('#stats');
if (statsSection) {
  const statsIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !countersDone) {
        countersDone = true;
        statsIO.disconnect();
        animateCounter($('#sn-yrs'), 6, '+', 1200);
        animateCounter($('#sn-farms'), 20, '+', 1500);
      }
    });
  }, { threshold: 0.3 });
  statsIO.observe(statsSection);
}

/* ─────────────────────────────────────────────
   6. MENU TABS
───────────────────────────────────────────── */
const menuTabs = $$('.menu-tab');
menuTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Deactivate all
    menuTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    $$('.menu-panel').forEach(p => {
      p.classList.remove('active');
      p.hidden = true;
    });
    // Activate clicked
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = $(tab.getAttribute('aria-controls'));
    if (panel) {
      panel.classList.add('active');
      panel.hidden = false;
      // Re-trigger scroll reveal for newly shown items
      if (!prefRed) {
        $$('.sr:not(.up)', panel).forEach(el => {
          el.classList.add('up');
        });
      }
    }
  });
});

/* ─────────────────────────────────────────────
   7. GALLERY LIGHTBOX
───────────────────────────────────────────── */
const lightbox = $('#lightbox');
const lbImg = $('#lb-img');
const lbCaption = $('#lb-caption');
const lbClose = $('#lb-close');
const lbPrev = $('#lb-prev');
const lbNext = $('#lb-next');
const galleryItems = $$('.gallery-item[data-src]');
let currentIndex = 0;

function openLightbox(index) {
  const item = galleryItems[index];
  if (!item) return;
  currentIndex = index;
  lbImg.src = item.dataset.src;
  lbImg.alt = item.querySelector('img').alt;
  lbCaption.textContent = item.dataset.caption || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  if (galleryItems[currentIndex]) galleryItems[currentIndex].focus();
}
function showImage(index) {
  openLightbox((index + galleryItems.length) % galleryItems.length);
}

galleryItems.forEach((item, i) => {
  item.setAttribute('role', 'button');
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
  });
});

if (lbClose) lbClose.addEventListener('click', closeLightbox);
if (lbPrev) lbPrev.addEventListener('click', () => showImage(currentIndex - 1));
if (lbNext) lbNext.addEventListener('click', () => showImage(currentIndex + 1));
if (lightbox) {
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
}
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});

/* Touch swipe for lightbox */
let lbTouchX = null;
if (lightbox) {
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    if (lbTouchX === null) return;
    const dx = e.changedTouches[0].clientX - lbTouchX;
    if (Math.abs(dx) > 50) showImage(currentIndex + (dx < 0 ? 1 : -1));
    lbTouchX = null;
  });
}

/* ─────────────────────────────────────────────
   8. TESTIMONIALS CAROUSEL
───────────────────────────────────────────── */
const track = $('#carousel-track');
const dotsContainer = $('#carousel-dots');
const prevBtn = $('#prev-btn');
const nextBtn = $('#next-btn');
const cards = track ? $$('.testimonial-card', track) : [];

if (track && cards.length) {
  let currentSlide = 0;
  let slidesPerView = getSlidesPerView();
  const totalSlides = Math.ceil(cards.length / slidesPerView);
  let autoInterval = null;

  function getSlidesPerView() {
    if (window.innerWidth >= 1080) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const total = Math.ceil(cards.length / getSlidesPerView());
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.setAttribute('aria-selected', String(i === currentSlide));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    $$('.carousel-dot', dotsContainer).forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', String(i === currentSlide));
    });
  }

  function goTo(index) {
    const total = Math.ceil(cards.length / getSlidesPerView());
    currentSlide = (index + total) % total;
    const cardWidth = cards[0].offsetWidth + 20;
    track.style.transform = 'translateX(-' + (currentSlide * getSlidesPerView() * cardWidth) + 'px)';
    updateDots();
  }

  function startAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => goTo(currentSlide + 1), 5000);
  }
  function stopAuto() { clearInterval(autoInterval); }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(currentSlide - 1); stopAuto(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(currentSlide + 1); stopAuto(); startAuto(); });

  let touchStartX = null;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(currentSlide + (dx < 0 ? 1 : -1)); stopAuto(); startAuto(); }
    touchStartX = null;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { goTo(0); buildDots(); }, 250);
  });

  buildDots();
  if (!prefRed) startAuto();
}

/* ─────────────────────────────────────────────
   9. MOBILE STICKY BAR
───────────────────────────────────────────── */
const mobBar = $('#mob-bar');
if (mobBar) {
  let shown = false;
  const show = () => { if (!shown) { shown = true; mobBar.classList.add('visible'); } };
  window.addEventListener('scroll', show, { passive: true, once: true });
  setTimeout(show, 600);
}

/* ─────────────────────────────────────────────
   10. FORM HANDLERS
───────────────────────────────────────────── */
const reservationForm = $('#reservation-form');
const resSubmitBtn = $('#res-submit-btn');
if (reservationForm && resSubmitBtn) {
  reservationForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.createTextNode('\u2705 Reserved! We\u2019ll confirm within 2 hours.');
    resSubmitBtn.replaceChildren(text);
    resSubmitBtn.style.background = '#10B981';
    resSubmitBtn.style.borderColor = '#10B981';
    resSubmitBtn.style.boxShadow = '0 8px 24px rgba(16,185,129,.38)';
    resSubmitBtn.style.pointerEvents = 'none';
  });
}
