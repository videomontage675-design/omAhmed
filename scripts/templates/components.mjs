import { html, esc, u, img, priceLabel, icon, rosette, ctx, waCustom, waGeneral, largeSrc } from './lib.mjs';

export const sectionHead = ({ num, eyebrow, title, lead = '', id = '', align = '' }) => html`
  <div class="reveal ${align} max-w-2xl">
    <p class="eyebrow">${num ? `<span class="latin text-base not-italic" lang="en">${num}</span>` : ''}${esc(eyebrow)}</p>
    <h2 ${id ? `id="${id}"` : ''} class="mt-3 text-3xl sm:text-4xl md:text-[2.75rem]">${title}</h2>
    ${lead ? `<p class="mt-4 text-lg text-cocoa-soft">${lead}</p>` : ''}
  </div>`;

/** Editorial product tile. variant: 'arch' | 'tall' | 'square' | 'wide' */
export function productTile(p, { variant = 'tall', sizes = '(min-width: 1024px) 33vw, 90vw', i = 0, headingLevel = 3 } = {}) {
  const price = priceLabel(p.price);
  const frame = {
    arch: 'arch aspect-[4/5]',
    tall: 'rounded-[1.25rem] aspect-[3/4]',
    square: 'rounded-[1.25rem] aspect-square',
    wide: 'rounded-[1.25rem] aspect-[4/3]',
  }[variant];
  const H = `h${headingLevel}`;
  return html`
  <article class="reveal group relative" style="--i:${i}">
    <a href="${u(`/designs/${p.slug}/`)}" class="zoom block" aria-labelledby="t-${p.slug}-${i}">
      <div class="${frame} overflow-hidden bg-cream-deep">
        ${img(p.images[0].file, { alt: p.images[0].alt, sizes, cls: 'h-full w-full object-cover' })}
      </div>
      <div class="mt-4 flex items-start justify-between gap-4">
        <div>
          <${H} id="t-${p.slug}-${i}" class="font-display text-xl leading-snug transition-colors group-hover:text-caramel-ink">${esc(p.name)}</${H}>
          <p class="price-tag mt-1">${price.short}</p>
        </div>
        <span aria-hidden="true" class="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-cocoa/15 text-cocoa transition-all duration-500 group-hover:-translate-x-1 group-hover:border-cocoa group-hover:bg-cocoa group-hover:text-cream">${icon.arrow}</span>
      </div>
    </a>
  </article>`;
}

/** Varied editorial grid — breaks the "identical cards" pattern with a repeating rhythm. */
export function editorialGrid(products, { headingLevel = 3 } = {}) {
  const pattern = [
    { col: 'md:col-span-7', variant: 'arch', extra: '', sizes: '(min-width: 768px) 55vw, 90vw' },
    { col: 'md:col-span-5', variant: 'tall', extra: 'md:mt-32', sizes: '(min-width: 768px) 40vw, 90vw' },
    { col: 'md:col-span-5', variant: 'square', extra: '', sizes: '(min-width: 768px) 40vw, 90vw' },
    { col: 'md:col-span-6 md:col-start-7', variant: 'tall', extra: 'md:-mt-24', sizes: '(min-width: 768px) 48vw, 90vw' },
  ];
  return html`<div class="grid gap-x-10 gap-y-14 md:grid-cols-12">
    ${products.map((p, i) => {
      const s = pattern[i % pattern.length];
      return `<div class="${s.col} ${s.extra}">${productTile(p, { variant: s.variant, sizes: s.sizes, i: i % 3, headingLevel })}</div>`;
    })}
  </div>`;
}

export function orderSteps({ dark = true } = {}) {
  const steps = [
    { t: 'اختاروا تصميمًا أو فكرة', d: 'من أعمالنا المعروضة، أو فكرة وصورة مرجعية خاصة بكم.' },
    { t: 'راسلونا عبر واتساب', d: 'زر الطلب يفتح رسالة جاهزة باسم التصميم ورابطه؛ أضيفوا المناسبة والتاريخ والحجم.' },
    { t: 'نتفق على التفاصيل', d: 'نناقش معكم الحجم والتزيين والكتابة، ونؤكد السعر وموعد الاستلام.' },
  ];
  return html`<ol class="grid gap-10 md:grid-cols-3 md:gap-8">
    ${steps.map((s, i) => html`<li class="reveal relative" style="--i:${i}">
      <span class="latin block text-6xl leading-none ${dark ? 'text-caramel-light' : 'text-caramel-ink'}" lang="en" aria-hidden="true">0${i + 1}</span>
      <h3 class="mt-4 text-xl ${dark ? 'text-cream' : ''}">${s.t}</h3>
      <p class="mt-2 ${dark ? 'text-cream/75' : 'text-cocoa-soft'}">${s.d}</p>
    </li>`)}
  </ol>`;
}

export function orderBand() {
  return html`
  <section aria-labelledby="how" class="relative mt-28 bg-cocoa text-cream" style="--scallop-color: var(--color-cocoa)">
    <div class="scallop-fill absolute inset-x-0 -top-[15px]" aria-hidden="true"></div>
    <div class="wrap py-20 md:py-28">
      <div class="grid gap-12 md:grid-cols-12 md:items-end">
        <div class="reveal md:col-span-6">
          <p class="eyebrow !text-caramel-light">طريقة الطلب</p>
          <h2 id="how" class="mt-3 text-3xl sm:text-4xl md:text-5xl">من الفكرة إلى طاولة مناسبتكم، <span class="text-caramel-light">بثلاث خطوات</span></h2>
        </div>
        <div class="reveal flex flex-wrap gap-3 md:col-span-6 md:justify-end" style="--i:1">
          <a href="${waCustom()}" target="_blank" rel="noopener" class="btn bg-cream text-cocoa hover:bg-white">${icon.wa}<span>اطلبوا تصميمًا خاصًا</span></a>
          <a href="${u('/cakes/')}" class="btn btn-ghost !border-cream/30 !text-cream hover:!border-cream">تصفحوا الأعمال</a>
        </div>
      </div>
      <div class="mt-16">${orderSteps()}</div>
    </div>
    <div class="scallop-fill rotate-180" aria-hidden="true" style="--scallop-color: var(--color-cream)"></div>
  </section>`;
}

export function socialStrip(items) {
  const { site } = ctx();
  const offsets = ['', 'md:mt-16', 'md:mt-6', 'md:mt-24', 'md:mt-2'];
  return html`
  <section aria-labelledby="latest" class="wrap mt-28">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      ${sectionHead({ eyebrow: 'من حساباتنا', title: 'تابعوا أحدث أعمالنا', id: 'latest', lead: 'ننشر أعمالنا الجديدة أولًا بأول على حساباتنا في إنستغرام وتيك توك وفيسبوك.' })}
      <ul class="reveal flex flex-wrap gap-2" style="--i:1">
        ${site.social.map((s) => html`<li><a href="${s.url}" target="_blank" rel="noopener me" class="btn btn-ghost !min-h-11 !px-4 !text-sm">${icon[s.id]}<span>${s.label}</span></a></li>`)}
      </ul>
    </div>
    <div class="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:px-0">
      ${items.map((g, i) => html`<a href="${largeSrc(g.file)}" data-lightbox data-alt="${esc(g.alt)}" data-caption="${esc(g.caption || '')}" class="reveal zoom block w-[62vw] shrink-0 snap-start sm:w-[40vw] md:w-auto ${offsets[i % offsets.length]}" style="--i:${i}">
        <div class="${i % 2 ? 'rounded-[1.25rem]' : 'arch-sm'} aspect-[3/4] overflow-hidden bg-cream-deep">${img(g.file, { alt: g.alt, sizes: '(min-width: 768px) 20vw, 60vw', cls: 'h-full w-full object-cover', max: 800 })}</div>
        <span class="sr-only">تكبير الصورة</span>
      </a>`)}
    </div>
  </section>`;
}

export const ornamentRule = () => html`<div class="flex items-center gap-4" aria-hidden="true"><span class="h-px flex-1 bg-cocoa/15"></span>${rosette('size-7 text-caramel')}<span class="h-px flex-1 bg-cocoa/15"></span></div>`;

export function ctaPanel({ title = 'لديكم مناسبة قادمة؟', text = 'أخبرونا بالمناسبة والتاريخ والتصميم الذي في بالكم، ونتابع معكم التفاصيل عبر واتساب.' } = {}) {
  const { site } = ctx();
  return html`
  <section class="wrap mt-28" aria-labelledby="cta">
    <div class="reveal relative overflow-hidden rounded-[2rem] bg-paper px-6 py-14 text-center ring-1 ring-cocoa/10 sm:px-12">
      <div class="absolute inset-x-0 top-0 scallop" aria-hidden="true"></div>
      ${rosette('mx-auto size-9 text-caramel')}
      <h2 id="cta" class="mt-4 text-3xl sm:text-4xl">${title}</h2>
      <p class="mx-auto mt-4 max-w-xl text-lg text-cocoa-soft">${text}</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a href="${waGeneral()}" target="_blank" rel="noopener" class="btn btn-wa">${icon.wa}<span>راسلونا عبر واتساب</span></a>
        <a href="tel:${site.phone}" class="btn btn-ghost">${icon.phone}<span dir="ltr">${site.phoneDisplay}</span></a>
      </div>
    </div>
  </section>`;
}
