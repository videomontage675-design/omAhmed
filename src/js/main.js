// Cake Om Ahmed — progressive enhancement only. The site works fully without JS.
const doc = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header state on scroll */
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Mobile menu */
const toggle = document.querySelector('[data-menu-toggle]');
const panel = document.getElementById('menu-panel');
if (toggle && panel) {
  const setOpen = (open) => {
    doc.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    panel.inert = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) panel.querySelector('a')?.focus();
  };
  panel.inert = true;
  toggle.addEventListener('click', () => setOpen(!doc.classList.contains('menu-open')));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && doc.classList.contains('menu-open')) { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && setOpen(false));
}

/* Reveal on scroll — elements become visible as they enter the viewport */
const revealEls = document.querySelectorAll('.reveal, .reveal-img');
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* Lightbox — links with [data-lightbox] open the large image in a <dialog> */
const items = [...document.querySelectorAll('[data-lightbox]')];
if (items.length && 'HTMLDialogElement' in window) {
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'عرض الصورة');
  dlg.innerHTML = `
    <div class="flex h-full w-full flex-col items-center justify-center gap-4 p-4 sm:p-10" data-lb-bg>
      <figure class="flex max-h-full min-h-0 flex-col items-center gap-3">
        <img class="max-h-[78dvh] w-auto max-w-full rounded-2xl object-contain shadow-2xl" alt="" decoding="async">
        <figcaption class="max-w-xl text-center text-sm text-cream/85"></figcaption>
      </figure>
      <div class="flex items-center gap-3" dir="ltr">
        <button type="button" data-lb-next class="btn btn-ghost !border-cream/30 !text-cream" aria-label="الصورة التالية">←</button>
        <span data-lb-count class="min-w-16 text-center text-sm text-cream/70"></span>
        <button type="button" data-lb-prev class="btn btn-ghost !border-cream/30 !text-cream" aria-label="الصورة السابقة">→</button>
        <button type="button" data-lb-close class="btn btn-ghost !border-cream/30 !text-cream" aria-label="إغلاق">✕</button>
      </div>
    </div>`;
  document.body.append(dlg);
  const img = dlg.querySelector('img');
  const cap = dlg.querySelector('figcaption');
  const count = dlg.querySelector('[data-lb-count]');
  let idx = 0;
  let lastFocus = null;

  const show = (i) => {
    idx = (i + items.length) % items.length;
    const a = items[idx];
    img.style.opacity = '0';
    img.onload = () => { img.style.opacity = '1'; };
    img.src = a.getAttribute('href');
    img.alt = a.dataset.alt || '';
    cap.textContent = a.dataset.caption || '';
    count.textContent = `${idx + 1} / ${items.length}`;
  };
  const close = () => { dlg.close(); };
  dlg.addEventListener('close', () => { img.removeAttribute('src'); lastFocus?.focus(); });

  items.forEach((a, i) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    lastFocus = a;
    show(i);
    dlg.showModal();
    dlg.querySelector('[data-lb-close]').focus();
  }));
  dlg.querySelector('[data-lb-close]').addEventListener('click', close);
  // RTL: "next" moves visually leftwards
  dlg.querySelector('[data-lb-next]').addEventListener('click', () => show(idx + 1));
  dlg.querySelector('[data-lb-prev]').addEventListener('click', () => show(idx - 1));
  dlg.addEventListener('click', (e) => { if (e.target.hasAttribute('data-lb-bg')) close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(idx + 1);
    if (e.key === 'ArrowRight') show(idx - 1);
  });
  let sx = null;
  dlg.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(dx < 0 ? idx - 1 : idx + 1);
    sx = null;
  });
}

/* Never leave content hidden when printing */
window.addEventListener('beforeprint', () => revealEls.forEach((el) => el.classList.add('is-in')));
