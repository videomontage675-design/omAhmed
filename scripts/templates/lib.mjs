// Shared helpers for HTML templates
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const html = (strings, ...vals) =>
  strings.reduce((out, str, i) => out + str + (i < vals.length ? [vals[i]].flat().filter((v) => v !== false && v != null).join('') : ''), '');

let CTX = null;
export const setContext = (ctx) => { CTX = ctx; };
export const ctx = () => CTX;

/** Root-relative URL respecting the deploy base path (e.g. GitHub project pages). */
export const u = (path = '/') => CTX.basePath + path;
/** Absolute URL for canonical, OG, sitemap. */
export const abs = (path = '/') => CTX.origin + CTX.basePath + path;

export const arNum = (n) => new Intl.NumberFormat('ar-EG').format(n);

/** Price label following the brief's pricing policy. */
export function priceLabel(price) {
  const cur = price?.currency === 'SAR' ? 'ر.س' : 'ر.ي';
  switch (price?.type) {
    case 'fixed': return { short: `${arNum(price.amount)} ${cur}`, long: `${arNum(price.amount)} ${cur}`, note: '' };
    case 'from': return { short: `يبدأ من ${arNum(price.amount)} ${cur}`, long: `يبدأ من ${arNum(price.amount)} ${cur}`, note: 'السعر النهائي يعتمد على الحجم والخيارات المختارة.' };
    default: return { short: 'السعر حسب الطلب', long: 'السعر حسب الطلب', note: 'يُحدَّد السعر حسب الحجم ومستوى التفاصيل. تواصلوا معنا عبر واتساب لمعرفة السعر.' };
  }
}

export function waLink(text) {
  return `https://wa.me/${CTX.site.whatsapp}?text=${encodeURIComponent(text)}`;
}
export function waProduct(p) {
  return waLink(
    `مرحبًا ${CTX.site.name} 🌸\nأرغب بالاستفسار عن: ${p.name}\n${abs(`/designs/${p.slug}/`)}\n\nالمناسبة: \nالتاريخ المطلوب: \nالحجم / عدد الأشخاص: `
  );
}
export const waGeneral = () => waLink(`مرحبًا ${CTX.site.name} 🌸\nأرغب بالاستفسار عن طلب كيك.\n\nالمناسبة: \nالتاريخ المطلوب: `);
export const waCustom = () => waLink(`مرحبًا ${CTX.site.name} 🌸\nأرغب بطلب تصميم خاص.\n\nالفكرة: \nالمناسبة: \nالتاريخ المطلوب: \n(سأرفق صورة مرجعية إن وُجدت)`);

/**
 * Responsive <picture> with AVIF → WebP → JPEG.
 * opts: alt, sizes, cls (img classes), pictureCls, priority (bool), aspect (CSS aspect-ratio for wrapper img)
 */
export function img(name, { alt = '', sizes = '100vw', cls = '', pictureCls = '', priority = false, max } = {}) {
  const m = CTX.images[name];
  if (!m) throw new Error(`Unknown image: ${name}`);
  const widths = max ? m.widths.filter((w) => w <= max) : m.widths;
  const set = (ext) => widths.map((w) => `${u(`/assets/img/${name}-${w}.${ext}`)} ${w}w`).join(', ');
  const fallbackW = widths.find((w) => w >= 800) ?? widths.at(-1);
  return html`<picture${pictureCls ? ` class="${pictureCls}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${u(`/assets/img/${name}-${fallbackW}.jpg`)}" srcset="${set('jpg')}" sizes="${sizes}" width="${m.width}" height="${m.height}" alt="${esc(alt)}" ${priority ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async" class="${cls}"></picture>`;
}

export const largeSrc = (name) => {
  const m = CTX.images[name];
  return u(`/assets/img/${name}-${m.widths.at(-1)}.webp`);
};

export const icon = {
  wa: `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5 shrink-0" fill="currentColor"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2.1 22l5.32-1.4a9.86 9.86 0 0 0 4.62 1.18h.01c5.44 0 9.87-4.43 9.87-9.87 0-2.64-1.03-5.12-2.87-7Zm-7.01 15.2h-.01a8.2 8.2 0 0 1-4.17-1.15l-.3-.18-3.16.83.84-3.08-.2-.32a8.17 8.17 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.53-3.68 8.21-8.16 8.23Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22a7.4 7.4 0 0 1-1.37-1.7c-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47a.9.9 0 0 0-.66.31c-.22.25-.86.85-.86 2.06 0 1.22.88 2.39 1 2.56.13.16 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>`,
  instagram: `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none"/></svg>`,
  tiktok: `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.6c0 6.9-7.6 9-10.6 4.1-1.9-3.2-.7-8.8 5.5-9v2.8c-.5.1-1 .2-1.4.4-1.4.5-2.2 1.4-2 3 .4 3.1 6.1 4 5.6-2V3h2.9Z"/></svg>`,
  facebook: `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.1v3h2.5V21h2.9Z"/></svg>`,
  arrow: `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5m6-6-6 6 6 6"/></svg>`,
  phone: `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>`,
  pin: `<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
};

/** Small rosette ornament — a piped-cream flower, used as a section marker. */
export const rosette = (cls = 'size-6 text-caramel') =>
  `<svg aria-hidden="true" viewBox="0 0 32 32" class="${cls}" fill="none" stroke="currentColor" stroke-width="1"><g transform="translate(16 16)">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse rx="3.4" ry="7" transform="rotate(${a}) translate(0 -7)"/>`).join('')}<circle r="2.6"/></g></svg>`;
