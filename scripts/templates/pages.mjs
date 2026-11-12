import { html, esc, u, abs, img, priceLabel, icon, rosette, ctx, waProduct, waCustom, waGeneral, largeSrc } from './lib.mjs';
import { layout, breadcrumbs, breadcrumbLd } from './layout.mjs';
import { sectionHead, productTile, editorialGrid, orderBand, orderSteps, orderStepsLight, socialStrip, ornamentRule, ctaPanel } from './components.mjs';

const HOME = { name: 'الرئيسية', path: '/' };
const CAKES = { name: 'الكيك والتورتات', path: '/cakes/' };

/* ── Structured data ───────────────────────────────────────── */
export function businessLd() {
  const { site } = ctx();
  const address = { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.region, addressCountry: site.country };
  if (site.address?.confirmed && site.address.street) address.streetAddress = site.address.street;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': abs('/#business'),
    name: site.name,
    alternateName: [site.nameEn, site.brandLine],
    description: site.tagline,
    url: abs('/'),
    telephone: site.phone,
    image: [abs('/assets/og/default.jpg')],
    sameAs: site.social.map((s) => s.url),
    address,
    areaServed: { '@type': 'City', name: site.cityEn, alternateName: site.city },
    contactPoint: { '@type': 'ContactPoint', telephone: site.phone, contactType: 'customer service', availableLanguage: ['ar'] },
    knowsAbout: ['كيك', 'تورتات', 'تورتات أعياد الميلاد', 'كيك المناسبات والأعراس', 'كيك الأطفال', 'كيك حسب الطلب'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'الكيك والتورتات',
      url: abs('/cakes/'),
      itemListElement: ctx().categories.map((c) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: c.name, description: c.description, url: abs(`/cakes/${c.slug}/`), areaServed: { '@type': 'City', name: site.cityEn } } })),
    },
  };
  if (site.logo) ld.logo = abs(site.logo);
  if (site.address?.confirmed && site.address.mapUrl) ld.hasMap = site.address.mapUrl;
  if (Array.isArray(site.hours) && site.hours.length) ld.openingHoursSpecification = site.hours;
  return ld;
}
const websiteLd = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'), name: ctx().site.name, alternateName: ctx().site.nameEn, url: abs('/'), inLanguage: 'ar', publisher: { '@id': abs('/#business') } });

function productLd(p) {
  // Only for products with confirmed data and a real price — never invent offers.
  if (!p.confirmed || !['fixed', 'from'].includes(p.price?.type)) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.summary,
    image: p.images.map((im) => abs(`/assets/og/${im.file}.jpg`)),
    brand: { '@type': 'Brand', name: ctx().site.name },
    offers: {
      '@type': 'Offer',
      url: abs(`/designs/${p.slug}/`),
      priceCurrency: p.price.currency || 'YER',
      price: p.price.amount,
      ...(p.price.type === 'from' ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: p.price.amount, priceCurrency: p.price.currency || 'YER' } } : {}),
      seller: { '@id': abs('/#business') },
    },
  };
}

const collectionLd = (path, name, description, items) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name, description, url: abs(path), inLanguage: 'ar',
  isPartOf: { '@id': abs('/#website') },
  about: { '@id': abs('/#business') },
  mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/designs/${p.slug}/`), name: p.name })) },
});

const heroPreload = (name, sizes) => {
  const m = ctx().images[name];
  const set = m.widths.map((w) => `${u(`/assets/img/${name}-${w}.avif`)} ${w}w`).join(', ');
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${set}" imagesizes="${sizes}" fetchpriority="high">`;
};

/* ── Home ───────────────────────────────────────────────────── */
export function home() {
  const { site, products, categories, gallery } = ctx();
  const featured = products.filter((p) => p.featured).slice(0, 3);
  const heroSizes = '(min-width: 1024px) 40vw, 82vw';
  const catCover = (c) => products.find((p) => p.categories.includes(c.slug));

  const body = html`
<section class="relative overflow-hidden pt-28 md:pt-32" aria-labelledby="h1">
  <div class="wrap grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
    <div class="lg:col-span-6 xl:col-span-6">
      <p class="eyebrow hero-rise" style="--i:0">${esc(site.name)} · ${esc(site.city)}</p>
      <h1 id="h1" class="hero-rise mt-5 text-[2.6rem] leading-[1.2] sm:text-6xl lg:text-[4.4rem]" style="--i:1">
        كيك وتورتات<br>لجميع المناسبات<br><span class="text-caramel">في ${esc(site.city)}</span>
      </h1>
      <p class="hero-rise mt-6 max-w-lg text-lg text-cocoa-soft sm:text-xl" style="--i:2">من أعياد الميلاد إلى الخطوبة والأعراس، نصمّم كل تورتة حسب مناسبتكم وذوقكم. تصفحوا أعمالنا واطلبوا تصميمكم مباشرة عبر واتساب.</p>
      <div class="hero-rise mt-9 flex flex-wrap gap-3" style="--i:3">
        <a href="${u('/cakes/')}" class="btn btn-primary">تصفحوا الكيك والتورتات ${icon.arrow}</a>
        <a href="${waGeneral()}" target="_blank" rel="noopener" class="btn btn-ghost">${icon.wa}<span>اطلبوا عبر واتساب</span></a>
      </div>
    </div>
    <div class="relative lg:col-span-6 xl:col-span-6">
      <div class="relative mx-auto w-[82%] max-w-md lg:me-0 lg:ms-auto">
        <div class="hero-unveil arch aspect-[4/5] bg-cream-deep">
          ${img('caramel-teddy-bear-cake', { alt: 'تورتة بطبقتين أبيض وكراميل يعلوها مجسم دبدوب — من أعمال كيك أم أحمد', sizes: heroSizes, cls: 'h-full w-full object-cover', priority: true })}
        </div>
        <div class="hero-rise absolute -bottom-8 -start-10 w-[44%] sm:-start-16" style="--i:5">
          <div class="aspect-square overflow-hidden rounded-full bg-cream-deep ring-[6px] ring-cream">
            ${img('brown-blossom-monogram-cake', { alt: 'تورتة بيضاء بحرف بارز وزهور بنية من أعمالنا', sizes: '(min-width: 1024px) 18vw, 36vw', cls: 'h-full w-full object-cover', max: 640 })}
          </div>
        </div>
        <div class="hero-rise absolute -end-3 top-10 hidden sm:block" style="--i:6">${rosette('size-12 text-caramel')}</div>
      </div>
    </div>
  </div>
  <div class="wrap mt-24"><div class="scallop"></div></div>
</section>

<section class="wrap mt-20" aria-labelledby="featured">
  <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
    ${sectionHead({ num: '01', eyebrow: 'أعمال مختارة', title: 'تفاصيل تُصنع <span class="text-caramel">لمناسبتكم</span>', id: 'featured', lead: 'نماذج حقيقية من أعمالنا؛ يمكنكم طلب تصميم مشابه أو تعديله ليناسبكم.' })}
    <a href="${u('/cakes/')}" class="reveal link-u inline-flex items-center gap-2 self-start font-medium md:self-end">كل الأعمال ${icon.arrow}</a>
  </div>
  <div class="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-12">
    <div class="md:col-span-6">${productTile(featured[0], { variant: 'arch', sizes: '(min-width: 768px) 46vw, 90vw', i: 0 })}</div>
    <div class="grid gap-14 md:col-span-6 md:grid-cols-2 md:pt-40">
      ${featured.slice(1).map((p, i) => `<div class="${i === 1 ? 'md:mt-24' : ''}">${productTile(p, { variant: 'tall', sizes: '(min-width: 768px) 23vw, 90vw', i: i + 1 })}</div>`)}
    </div>
  </div>
</section>

<section class="wrap mt-32" aria-labelledby="cats">
  ${sectionHead({ num: '02', eyebrow: 'التصنيفات', title: 'ابدؤوا من المناسبة', id: 'cats' })}
  <ul class="mt-12 border-t border-cocoa/15">
    ${categories.map((c, i) => {
      const cover = catCover(c);
      return html`<li class="reveal border-b border-cocoa/15" style="--i:${i}">
        <a href="${u(`/cakes/${c.slug}/`)}" class="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-7 sm:gap-8 md:py-9">
          <span class="latin w-8 text-xl text-caramel-ink" lang="en" aria-hidden="true">0${i + 1}</span>
          <span class="min-w-0">
            <span class="block font-display text-2xl font-semibold transition-transform duration-500 group-hover:-translate-x-2 sm:text-4xl">${esc(c.name)}</span>
            <span class="mt-1 block text-cocoa-soft">${esc(c.short)}</span>
          </span>
          <span class="flex items-center gap-5">
            ${cover ? html`<span class="hidden h-20 w-16 overflow-hidden rounded-t-full rounded-b-lg opacity-0 transition-all duration-500 group-hover:opacity-100 md:block">${img(cover.images[0].file, { alt: '', sizes: '64px', cls: 'h-full w-full object-cover', max: 400 })}</span>` : ''}
            <span aria-hidden="true" class="grid size-11 place-items-center rounded-full border border-cocoa/15 transition-all duration-500 group-hover:bg-cocoa group-hover:text-cream">${icon.arrow}</span>
          </span>
        </a>
      </li>`;
    })}
  </ul>
</section>

<section class="wrap mt-28" aria-labelledby="local">
  <div class="reveal grid gap-8 rounded-[2rem] bg-paper p-8 ring-1 ring-cocoa/10 md:grid-cols-12 md:p-12">
    <div class="md:col-span-4">${rosette('size-9 text-caramel')}<h2 id="local" class="mt-4 text-3xl">كيك وتورتات حسب الطلب في ${esc(site.city)}</h2></div>
    <div class="prose-ar text-lg text-cocoa-soft md:col-span-8">
      <p>نستقبل في ${esc(site.city)} طلبات الكيك والتورتات لمختلف المناسبات: <a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/cakes/birthday/')}">تورتات أعياد الميلاد</a> للكبار والصغار، و<a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/cakes/occasions/')}">كيك المناسبات</a> للخطوبة والأعراس وحفلات الاستقبال، و<a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/cakes/kids/')}">تصاميم الأطفال</a> بالمجسمات والألوان المرحة، إضافة إلى <a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/cakes/custom/')}">التصاميم المخصصة</a> التي ننفذها حسب فكرتكم أو صورة مرجعية.</p>
      <p>شاهدوا نماذج حقيقية في <a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/gallery/')}">معرض الأعمال</a>، واطّلعوا على <a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/faq/')}">الأسئلة الشائعة</a> عن الطلب والأسعار، ثم راسلونا عبر واتساب على <a class="inline-block whitespace-nowrap text-cocoa underline decoration-caramel/50 underline-offset-4 hover:decoration-cocoa" href="tel:${site.phone}" dir="ltr">${site.phoneDisplay}</a>.</p>
    </div>
  </div>
</section>

${orderBand()}

${socialStrip(gallery.filter((g) => g.home).slice(0, 5))}

${ctaPanel()}
`;
  return layout({
    path: '/',
    title: `${site.name} | كيك وتورتات لجميع المناسبات في ${site.city}`,
    description: `${site.name} (${site.nameEn}) في ${site.city}: تورتات أعياد ميلاد، كيك مناسبات وأعراس، تصاميم أطفال وتصاميم مخصصة حسب الطلب. اطلبوا مباشرة عبر واتساب.`,
    ogAlt: 'تورتة الدبدوب بالكراميل من أعمال كيك أم أحمد',
    body,
    preload: [heroPreload('caramel-teddy-bear-cake', heroSizes)],
    jsonld: [businessLd(), websiteLd()],
  });
}

/* ── Catalog ────────────────────────────────────────────────── */
export function catalog() {
  const { site, products, categories } = ctx();
  const body = html`
<section class="wrap pt-32 md:pt-40" aria-labelledby="h1">
  ${breadcrumbs([HOME, CAKES])}
  <div class="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
    <div class="md:col-span-7">
      <p class="eyebrow">الكتالوج</p>
      <h1 id="h1" class="mt-3 text-4xl sm:text-5xl md:text-6xl">الكيك والتورتات</h1>
    </div>
    <p class="text-lg text-cocoa-soft md:col-span-5">أعمال حقيقية من كيك أم أحمد، مرتبة حسب المناسبة. كل تصميم يمكن طلبه كما هو أو تعديله في الألوان والكتابة والحجم.</p>
  </div>
  <nav aria-label="انتقال إلى تصنيف" class="mt-10 flex flex-wrap gap-2">
    ${categories.map((c) => `<a href="#${c.slug}" class="btn btn-ghost !min-h-10 !px-4 !py-2 !text-sm">${esc(c.name)}</a>`)}
  </nav>
</section>
${categories.map((c, ci) => {
  const items = products.filter((p) => p.categories.includes(c.slug)).slice(0, 3);
  const flip = ci % 2 === 1;
  return html`
<section id="${c.slug}" class="wrap mt-24 scroll-mt-28" aria-labelledby="c-${c.slug}">
  <div class="mb-10 flex flex-col gap-4 border-t border-cocoa/15 pt-8 md:flex-row md:items-end md:justify-between">
    <div class="reveal">
      <p class="latin text-lg text-caramel-ink" lang="en" aria-hidden="true">0${ci + 1}</p>
      <h2 id="c-${c.slug}" class="text-3xl sm:text-4xl">${esc(c.name)}</h2>
      <p class="mt-2 max-w-xl text-cocoa-soft">${esc(c.description)}</p>
    </div>
    <a href="${u(`/cakes/${c.slug}/`)}" class="reveal link-u inline-flex shrink-0 items-center gap-2 font-medium">صفحة ${esc(c.name)} ${icon.arrow}</a>
  </div>
  <div class="grid gap-10 md:grid-cols-12">
    ${items.map((p, i) => {
      const first = i === 0;
      const col = first ? `md:col-span-6 ${flip ? 'md:order-last' : ''}` : 'md:col-span-3';
      return `<div class="${col} ${!first && i === 2 ? 'md:mt-20' : ''}">${productTile(p, { variant: first ? 'arch' : 'tall', sizes: first ? '(min-width: 768px) 46vw, 90vw' : '(min-width: 768px) 23vw, 90vw', i, priority: ci === 0 && first })}</div>`;
    })}
  </div>
</section>`;
})}
${ctaPanel({ title: 'لم تجدوا التصميم المناسب؟', text: 'أرسلوا لنا فكرتكم أو صورة مرجعية، ونناقش معكم تصميمًا خاصًا لمناسبتكم.' })}
`;
  return layout({
    path: '/cakes/',
    title: `كيك وتورتات في ${site.city} – كل التصاميم | ${site.name}`,
    description: `تصفحوا أعمال ${site.name} في ${site.city}: كيك المناسبات والأعراس، تورتات أعياد الميلاد، تصاميم الأطفال، والتصاميم المخصصة حسب الطلب.`,
    body,
    jsonld: [breadcrumbLd([HOME, CAKES]), collectionLd('/cakes/', 'الكيك والتورتات', `كل تصاميم ${site.name} في ${site.city}`, products)],
  });
}

/* ── Category ───────────────────────────────────────────────── */
export function category(c) {
  const { site, products, categories } = ctx();
  const items = products.filter((p) => p.categories.includes(c.slug));
  const crumbs = [HOME, CAKES, { name: c.name, path: `/cakes/${c.slug}/` }];
  const others = categories.filter((x) => x.slug !== c.slug);
  const body = html`
<section class="wrap pt-32 md:pt-40" aria-labelledby="h1">
  ${breadcrumbs(crumbs)}
  <div class="mt-8 grid gap-8 md:grid-cols-12">
    <div class="md:col-span-6">
      <p class="eyebrow">${esc(c.short)}</p>
      <h1 id="h1" class="mt-3 text-4xl sm:text-5xl md:text-6xl">${esc(c.title)}</h1>
    </div>
    <div class="prose-ar text-lg text-cocoa-soft md:col-span-6 md:pt-10">${c.intro.map((p) => `<p>${esc(p)}</p>`)}</div>
  </div>
</section>
${c.steps ? html`<section class="wrap mt-16" aria-labelledby="steps"><h2 id="steps" class="sr-only">خطوات التصميم الخاص</h2>
  <ol class="grid gap-6 rounded-[1.5rem] bg-paper p-8 ring-1 ring-cocoa/10 md:grid-cols-3 md:p-10">
    ${c.steps.map((s, i) => html`<li class="reveal" style="--i:${i}"><span class="latin text-4xl text-caramel-ink" lang="en" aria-hidden="true">0${i + 1}</span><h3 class="mt-2 text-xl">${esc(s.title)}</h3><p class="mt-1 text-cocoa-soft">${esc(s.text)}</p></li>`)}
  </ol>
  <a href="${waCustom()}" target="_blank" rel="noopener" class="btn btn-wa mt-8">${icon.wa}<span>أرسلوا فكرتكم عبر واتساب</span></a>
</section>` : ''}
<section class="wrap mt-20" aria-labelledby="works">
  <h2 id="works" class="mb-10 text-2xl sm:text-3xl">${c.slug === 'custom' ? 'أمثلة من تصاميم خاصة نفذناها' : `من أعمالنا في ${esc(c.name)}`}</h2>
  ${editorialGrid(items, { priorityFirst: !c.steps })}
</section>
${c.guide ? html`<section class="wrap mt-24" aria-labelledby="guide">
  <div class="grid gap-8 border-t border-cocoa/15 pt-10 md:grid-cols-12">
    <div class="md:col-span-5"><p class="eyebrow">قبل الطلب</p><h2 id="guide" class="mt-3 text-2xl sm:text-3xl">ماذا تخبروننا عند طلب ${esc(c.name)}؟</h2><p class="mt-3 text-cocoa-soft">هذه التفاصيل تساعدنا على اقتراح التصميم والحجم المناسبين وتحديد السعر بسرعة.</p></div>
    <ul class="grid gap-3 md:col-span-7">
      ${c.guide.map((g, i) => html`<li class="reveal flex items-start gap-3 rounded-2xl bg-paper p-4 ring-1 ring-cocoa/10" style="--i:${i}">${rosette('mt-1 size-5 shrink-0 text-caramel')}<span>${esc(g)}</span></li>`)}
    </ul>
  </div>
</section>` : ''}
<section class="wrap mt-28" aria-labelledby="more">
  ${ornamentRule()}
  <h2 id="more" class="mt-10 text-center text-2xl">تصنيفات أخرى</h2>
  <ul class="mt-8 grid gap-4 sm:grid-cols-3">
    ${others.map((o) => html`<li><a href="${u(`/cakes/${o.slug}/`)}" class="group flex h-full flex-col rounded-[1.25rem] bg-paper p-6 ring-1 ring-cocoa/10 transition hover:ring-cocoa/40"><span class="font-display text-xl">${esc(o.name)}</span><span class="mt-1 text-sm text-cocoa-soft">${esc(o.short)}</span><span class="mt-4 inline-flex items-center gap-2 text-sm text-caramel-ink">عرض الأعمال ${icon.arrow}</span></a></li>`)}
  </ul>
</section>
${ctaPanel()}
`;
  return layout({
    path: `/cakes/${c.slug}/`,
    title: c.seoTitle,
    description: c.description,
    ogImage: items[0]?.images[0].file,
    body,
    preload: !c.steps && items[0] ? [heroPreload(items[0].images[0].file, '(min-width: 768px) 55vw, 90vw')] : [],
    jsonld: [breadcrumbLd(crumbs), collectionLd(`/cakes/${c.slug}/`, c.title, c.description, items)],
  });
}

/* ── Product ────────────────────────────────────────────────── */
export function product(p) {
  const { site, products, categories } = ctx();
  const primaryCat = categories.find((c) => c.slug === p.categories[0]);
  const crumbs = [HOME, CAKES, { name: primaryCat.name, path: `/cakes/${primaryCat.slug}/` }, { name: p.name, path: `/designs/${p.slug}/` }];
  const price = priceLabel(p.price);
  const related = products.filter((x) => x.slug !== p.slug && x.categories.some((c) => p.categories.includes(c))).slice(0, 3);
  const mainSizes = '(min-width: 1024px) 50vw, 92vw';
  const body = html`
<article class="wrap pt-28 md:pt-36" aria-labelledby="h1">
  ${breadcrumbs(crumbs)}
  <div class="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
    <div class="lg:col-span-6">
      <div class="lg:sticky lg:top-28">
        <a id="main-img" href="${largeSrc(p.images[0].file)}" data-lightbox data-alt="${esc(p.images[0].alt)}" class="zoom hero-unveil arch block aspect-[4/5] bg-cream-deep">
          ${img(p.images[0].file, { alt: p.images[0].alt, sizes: mainSizes, cls: 'h-full w-full object-cover', priority: true })}
        </a>
        ${p.images.length > 1 ? html`<div class="mt-4 flex gap-3">
          ${p.images.slice(1).map((im) => html`<a href="${largeSrc(im.file)}" data-lightbox data-alt="${esc(im.alt)}" class="zoom block w-24 overflow-hidden rounded-xl bg-cream-deep ring-1 ring-cocoa/10 sm:w-28"><span class="block aspect-[3/4]">${img(im.file, { alt: im.alt, sizes: '112px', cls: 'h-full w-full object-cover', max: 400 })}</span><span class="sr-only">صورة إضافية — تكبير</span></a>`)}
        </div>` : ''}
      </div>
    </div>
    <div class="lg:col-span-6 lg:pt-6">
      <ul class="flex flex-wrap gap-2 text-sm">
        ${p.categories.map((cs) => { const c = categories.find((x) => x.slug === cs); return `<li><a href="${u(`/cakes/${c.slug}/`)}" class="inline-block rounded-full bg-paper px-3 py-1 ring-1 ring-cocoa/10 hover:ring-cocoa/40">${esc(c.name)}</a></li>`; })}
      </ul>
      <h1 id="h1" class="hero-rise mt-5 text-4xl sm:text-5xl" style="--i:1">${esc(p.name)}</h1>
      <div class="hero-rise mt-6 rounded-[1.25rem] bg-paper p-5 ring-1 ring-cocoa/10" style="--i:2">
        <p class="font-display text-2xl text-caramel-ink">${price.long}</p>
        ${price.note ? `<p class="mt-1 text-sm text-cocoa-soft">${price.note}</p>` : ''}
      </div>
      <div class="prose-ar hero-rise mt-8 text-lg text-cocoa-soft" style="--i:3">${p.description.map((d) => `<p>${esc(d)}</p>`)}</div>
      ${p.details?.length ? html`<div class="mt-8"><h2 class="text-xl">تفاصيل التصميم</h2><ul class="mt-3 space-y-2 text-cocoa-soft">${p.details.map((d) => `<li class="flex items-start gap-2">${rosette('mt-1.5 size-4 shrink-0 text-caramel')}<span>${esc(d)}</span></li>`)}</ul></div>` : ''}
      ${p.occasions?.length ? html`<p class="mt-6 text-cocoa-soft"><span class="font-medium text-cocoa">يناسب:</span> ${p.occasions.map(esc).join('، ')}</p>` : ''}
      ${p.options?.length ? html`<div class="mt-8"><h2 class="text-xl">الخيارات المتاحة</h2><ul class="mt-3 divide-y divide-cocoa/10 border-y border-cocoa/10">${p.options.map((o) => `<li class="flex justify-between gap-4 py-3"><span>${esc(o.label)}</span>${o.price ? `<span class="text-caramel-ink">${esc(o.price)}</span>` : ''}</li>`)}</ul></div>` : ''}
      <div class="hero-rise mt-10 flex flex-wrap gap-3" style="--i:4">
        <a href="${waProduct(p)}" target="_blank" rel="noopener" class="btn btn-wa flex-1 sm:flex-none">${icon.wa}<span>اطلبوا هذا التصميم عبر واتساب</span></a>
        <a href="tel:${site.phone}" class="btn btn-ghost">${icon.phone}<span>اتصال</span></a>
      </div>
      <div class="mt-10 border-t border-cocoa/15 pt-8">
        <h2 class="text-lg">ماذا تذكرون في رسالة الطلب؟</h2>
        <ul class="mt-4 grid grid-cols-2 gap-3 text-cocoa-soft">
          ${['نوع المناسبة', 'التاريخ المطلوب', 'الحجم أو عدد الأشخاص', 'الكتابة أو الحروف', 'تعديلات الألوان', 'صورة مرجعية إن وُجدت'].map((t) => `<li class="flex items-center gap-2">${rosette('size-4 shrink-0 text-caramel')}${t}</li>`)}
        </ul>
      </div>
    </div>
  </div>
</article>
${related.length ? html`<section class="wrap mt-28" aria-labelledby="rel">
  ${ornamentRule()}
  <h2 id="rel" class="mt-10 text-2xl sm:text-3xl">تصاميم قريبة</h2>
  <div class="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
    ${related.map((r, i) => `<div class="${i === 1 ? 'lg:mt-16' : ''}">${productTile(r, { variant: i === 1 ? 'arch' : 'tall', sizes: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw', i })}</div>`)}
  </div>
</section>` : ''}
`;
  return layout({
    path: `/designs/${p.slug}/`,
    title: `${p.name} | ${site.name} – ${site.city}`,
    description: `${p.summary} ${price.short} — اطلبوها من ${site.name} في ${site.city} عبر واتساب.`,
    ogImage: p.images[0].file,
    ogAlt: p.images[0].alt,
    ogType: 'product',
    body,
    preload: [heroPreload(p.images[0].file, mainSizes)],
    jsonld: [breadcrumbLd(crumbs), productLd(p)],
  });
}

/* ── Gallery ────────────────────────────────────────────────── */
export function galleryPage() {
  const { site, gallery } = ctx();
  const crumbs = [HOME, { name: 'معرض الأعمال', path: '/gallery/' }];
  const body = html`
<section class="wrap pt-32 md:pt-40" aria-labelledby="h1">
  ${breadcrumbs(crumbs)}
  <div class="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
    <div class="md:col-span-7"><p class="eyebrow">صور أصلية من أعمالنا</p><h1 id="h1" class="mt-3 text-4xl sm:text-5xl md:text-6xl">معرض الأعمال</h1></div>
    <p class="text-lg text-cocoa-soft md:col-span-5">صور حقيقية من كيك وتورتات نفذناها في ${esc(site.city)}. اضغطوا على أي صورة لعرضها بحجم أكبر، أو انتقلوا إلى صفحة التصميم لطلبه.</p>
  </div>
  <nav aria-label="تصنيفات الأعمال" class="mt-8 flex flex-wrap gap-2">${ctx().categories.map((c) => `<a href="${u(`/cakes/${c.slug}/`)}" class="btn btn-ghost !min-h-10 !px-4 !py-2 !text-sm">${esc(c.name)}</a>`)}</nav>
</section>
<section class="wrap mt-14" aria-label="الصور">
  <ul class="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>li]:mb-6 [&>li]:break-inside-avoid">
    ${gallery.map((g, i) => html`<li class="reveal" style="--i:${i % 3}">
      <figure>
        <a href="${largeSrc(g.file)}" data-lightbox data-alt="${esc(g.alt)}" data-caption="${esc(g.caption || '')}" class="zoom block overflow-hidden ${i % 4 === 0 ? 'arch' : 'rounded-[1.25rem]'} bg-cream-deep">
          ${img(g.file, { alt: g.alt, sizes: '(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw', cls: 'w-full h-auto', priority: i === 0 })}
          <span class="sr-only">تكبير الصورة</span>
        </a>
        <figcaption class="mt-3 flex items-center justify-between gap-3 text-sm">
          <span class="text-cocoa-soft">${esc(g.caption || '')}</span>
          ${g.product ? `<a href="${u(`/designs/${g.product}/`)}" class="link-u shrink-0 text-caramel-ink">تفاصيل التصميم</a>` : ''}
        </figcaption>
      </figure>
    </li>`)}
  </ul>
</section>
${ctaPanel({ title: 'أعجبكم تصميم؟', text: 'أرسلوا لنا اسم التصميم أو صورته عبر واتساب، ونتفق معكم على التفاصيل.' })}
`;
  return layout({
    path: '/gallery/',
    title: `معرض أعمال ${site.name} | تصاميم كيك وتورتات في ${site.city}`,
    description: `صور أصلية من أعمال ${site.name}: تورتات بطبقات، كيك مناسبات، وتصاميم أطفال بمجسمات. شاهدوا التفاصيل واطلبوا تصميمكم عبر واتساب.`,
    ogImage: 'chocolate-hearts-tiered-cake',
    body,
    jsonld: [breadcrumbLd(crumbs), {
      '@context': 'https://schema.org', '@type': 'ImageGallery', name: `معرض أعمال ${site.name}`, url: abs('/gallery/'), inLanguage: 'ar',
      about: { '@id': abs('/#business') },
      image: gallery.map((g) => ({ '@type': 'ImageObject', contentUrl: abs(`/assets/img/${g.file}-${ctx().images[g.file].widths.at(-1)}.jpg`), caption: g.caption || g.alt, description: g.alt, creditText: site.name, creator: { '@type': 'Organization', name: site.name }, copyrightNotice: `© ${site.name}` })),
    }],
  });
}

/* ── About ──────────────────────────────────────────────────── */
export function about() {
  const { site } = ctx();
  const crumbs = [HOME, { name: 'من نحن', path: '/about/' }];
  const body = html`
<section class="wrap pt-32 md:pt-40" aria-labelledby="h1">
  ${breadcrumbs(crumbs)}
  <div class="mt-10 grid gap-14 lg:grid-cols-12 lg:items-center">
    <div class="lg:col-span-6">
      <p class="eyebrow">من نحن</p>
      <h1 id="h1" class="mt-3 text-4xl sm:text-5xl md:text-6xl">كيك أم أحمد<br><span class="text-caramel">لكل مناسبة</span></h1>
      <div class="prose-ar mt-8 text-lg text-cocoa-soft">
        <p>كيك أم أحمد مشروع متخصص في إعداد وتصميم الكيك والتورتات بمختلف أنواعها وأشكالها في ${esc(site.city)}: من تورتات أعياد الميلاد، إلى كيك المناسبات والخطوبة والأعراس، والتصاميم المخصصة حسب رغبة كل عميل.</p>
        <p>نهتم بالتفاصيل الصغيرة التي تصنع الفرق: تدرّج الألوان، والزهور، والمجسمات، والكتابة التي تحمل اسم صاحب المناسبة. ولأن لكل مناسبة طابعها، نناقش كل طلب مع صاحبه قبل التنفيذ.</p>
        <p>نستقبل الطلبات والاستفسارات عبر واتساب، وننشر أعمالنا الجديدة على حساباتنا في إنستغرام وتيك توك وفيسبوك.</p>
      </div>
      <div class="mt-9 flex flex-wrap gap-3">
        <a href="${u('/gallery/')}" class="btn btn-primary">شاهدوا أعمالنا ${icon.arrow}</a>
        <a href="${waGeneral()}" target="_blank" rel="noopener" class="btn btn-ghost">${icon.wa}<span>تواصلوا معنا</span></a>
      </div>
    </div>
    <div class="relative grid grid-cols-2 gap-5 lg:col-span-6">
      <div class="reveal-img arch aspect-[3/4] bg-cream-deep">${img('chocolate-hearts-tiered-cake', { alt: 'تورتة القلوب بالشوكولاتة والورد من أعمالنا', sizes: '(min-width: 1024px) 24vw, 45vw', cls: 'h-full w-full object-cover' })}</div>
      <div class="reveal-img arch mt-20 aspect-[3/4] bg-cream-deep">${img('brown-blossom-monogram-cake', { alt: 'تورتة بيضاء بحرف بارز وزهور بنية من أعمالنا', sizes: '(min-width: 1024px) 24vw, 45vw', cls: 'h-full w-full object-cover' })}</div>
    </div>
  </div>
</section>
<section class="wrap mt-28" aria-labelledby="what">
  ${ornamentRule()}
  <h2 id="what" class="mt-12 text-center text-3xl">ما نقدمه</h2>
  <ul class="mt-12 grid gap-10 md:grid-cols-3">
    ${[
      ['تصميم حسب المناسبة', 'أعياد الميلاد، الخطوبة، الأعراس، الاستقبال، واحتفالات العائلة.'],
      ['تصاميم مخصصة', 'نعمل على فكرتكم أو صورتكم المرجعية، ونعدّل الألوان والحروف والمجسمات.'],
      ['تواصل مباشر', 'كل طلب يُناقش عبر واتساب، من التفاصيل إلى السعر وموعد الاستلام.'],
    ].map(([t, d], i) => html`<li class="reveal text-center" style="--i:${i}">${rosette('mx-auto size-8 text-caramel')}<h3 class="mt-4 text-xl">${t}</h3><p class="mx-auto mt-2 max-w-xs text-cocoa-soft">${d}</p></li>`)}
  </ul>
</section>
${ctaPanel()}
`;
  return layout({
    path: '/about/',
    title: `من نحن | ${site.name} – كيك وتورتات في ${site.city}`,
    description: `تعرفوا على ${site.name}: مشروع متخصص في إعداد وتصميم الكيك والتورتات لجميع المناسبات في ${site.city}، مع تصاميم مخصصة حسب الطلب.`,
    ogImage: 'brown-blossom-monogram-cake',
    body,
    jsonld: [breadcrumbLd(crumbs)],
  });
}

/* ── Contact ────────────────────────────────────────────────── */
export function contact() {
  const { site } = ctx();
  const crumbs = [HOME, { name: 'التواصل', path: '/contact/' }];
  const addr = site.address;
  const body = html`
<section class="wrap pt-32 md:pt-40" aria-labelledby="h1">
  ${breadcrumbs(crumbs)}
  <div class="mt-10 grid gap-14 lg:grid-cols-12">
    <div class="lg:col-span-7">
      <p class="eyebrow">للطلب والاستفسار</p>
      <h1 id="h1" class="mt-3 text-4xl sm:text-5xl md:text-6xl">تواصلوا معنا</h1>
      <p class="mt-6 max-w-xl text-lg text-cocoa-soft">واتساب هو أسرع طريقة للطلب. أرسلوا نوع المناسبة والتاريخ المطلوب والتصميم الذي في بالكم، أو صورة مرجعية، وسنتابع معكم.</p>
      <div class="mt-9 flex flex-wrap gap-3">
        <a href="${waGeneral()}" target="_blank" rel="noopener" class="btn btn-wa">${icon.wa}<span>راسلونا عبر واتساب</span></a>
        <a href="tel:${site.phone}" class="btn btn-ghost">${icon.phone}<span>اتصال مباشر</span></a>
      </div>
      <dl class="mt-14 divide-y divide-cocoa/10 border-y border-cocoa/10">
        <div class="grid gap-1 py-5 sm:grid-cols-3"><dt class="text-cocoa-soft">واتساب والهاتف</dt><dd class="sm:col-span-2"><a href="tel:${site.phone}" class="link-u text-xl font-medium" dir="ltr">${site.phoneDisplay}</a></dd></div>
        <div class="grid gap-1 py-5 sm:grid-cols-3"><dt class="text-cocoa-soft">المدينة</dt><dd class="sm:col-span-2">${esc(site.city)}، اليمن</dd></div>
        ${addr.confirmed ? html`<div class="grid gap-1 py-5 sm:grid-cols-3"><dt class="text-cocoa-soft">العنوان</dt><dd class="sm:col-span-2">${esc(addr.street)} – ${esc(site.region)}${addr.mapUrl ? `<br><a href="${esc(addr.mapUrl)}" target="_blank" rel="noopener" class="link-u mt-1 inline-flex items-center gap-1 text-caramel-ink">${icon.pin} عرض على الخريطة</a>` : ''}</dd></div>`
          : html`<div class="grid gap-1 py-5 sm:grid-cols-3"><dt class="text-cocoa-soft">مكان الاستلام</dt><dd class="sm:col-span-2">للاستفسار عن مكان الاستلام، راسلونا عبر واتساب.</dd></div>`}
        ${Array.isArray(site.hours) && site.hours.length ? html`<div class="grid gap-1 py-5 sm:grid-cols-3"><dt class="text-cocoa-soft">أوقات العمل</dt><dd class="sm:col-span-2">${site.hoursText ? esc(site.hoursText) : ''}</dd></div>` : ''}
        ${site.delivery?.text ? html`<div class="grid gap-1 py-5 sm:grid-cols-3"><dt class="text-cocoa-soft">التوصيل</dt><dd class="sm:col-span-2">${esc(site.delivery.text)}</dd></div>` : ''}
      </dl>
      <section class="mt-16" aria-labelledby="steps"><h2 id="steps" class="mb-8 text-2xl">كيف تطلبون؟</h2>${orderStepsLight()}</section>
      <p class="mt-10 text-cocoa-soft">قبل الطلب: تصفحوا <a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/cakes/')}">الكيك والتورتات</a> أو <a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/gallery/')}">معرض الأعمال</a>، واطّلعوا على <a class="text-cocoa underline decoration-caramel/50 underline-offset-4 transition-colors hover:decoration-cocoa" href="${u('/faq/')}">الأسئلة الشائعة</a>.</p>
    </div>
    <aside class="lg:col-span-5" aria-labelledby="follow">
      <div class="rounded-[2rem] bg-cocoa p-8 text-cream sm:p-10">
        <h2 id="follow" class="text-2xl">تابعوا أعمالنا</h2>
        <p class="mt-2 text-cream/75">ننشر أعمالنا الجديدة على حساباتنا الرسمية.</p>
        <ul class="mt-8 space-y-3">
          ${site.social.map((s) => html`<li><a href="${s.url}" target="_blank" rel="noopener me" class="group flex items-center justify-between gap-4 rounded-2xl border border-cream/15 p-4 transition hover:border-cream/60"><span class="flex items-center gap-3">${icon[s.id]}<span><span class="block font-medium">${s.label}</span><span class="block text-sm text-cream/65" dir="ltr">${esc(s.handle)}</span></span></span><span aria-hidden="true" class="transition-transform duration-500 group-hover:-translate-x-1">${icon.arrow}</span></a></li>`)}
        </ul>
      </div>
    </aside>
  </div>
</section>
`;
  return layout({
    path: '/contact/',
    title: `التواصل والطلب | ${site.name} – ${site.city}`,
    description: `اطلبوا الكيك والتورتات من ${site.name} في ${site.city} عبر واتساب أو اتصال على ${site.phoneDisplay}، وتابعوا أعمالنا على إنستغرام وتيك توك وفيسبوك.`,
    body,
    jsonld: [breadcrumbLd(crumbs), businessLd()],
  });
}

/* ── FAQ ────────────────────────────────────────────────────── */
export function faq() {
  const { site, faq } = ctx();
  const items = faq.filter((f) => f.confirmed && f.a);
  const crumbs = [HOME, { name: 'الأسئلة الشائعة', path: '/faq/' }];
  const body = html`
<section class="wrap pt-32 md:pt-40" aria-labelledby="h1">
  ${breadcrumbs(crumbs)}
  <div class="mt-10 grid gap-12 lg:grid-cols-12">
    <div class="lg:col-span-4">
      <p class="eyebrow">قبل أن تطلبوا</p>
      <h1 id="h1" class="mt-3 text-4xl sm:text-5xl">الأسئلة الشائعة</h1>
      <p class="mt-5 text-cocoa-soft">لم تجدوا إجابة سؤالكم؟ راسلونا عبر واتساب وسنجيبكم.</p>
      <a href="${waGeneral()}" target="_blank" rel="noopener" class="btn btn-wa mt-6">${icon.wa}<span>اسألونا عبر واتساب</span></a>
    </div>
    <div class="lg:col-span-8">
      <ul class="border-t border-cocoa/15">
        ${items.map((f, i) => html`<li class="reveal border-b border-cocoa/15" style="--i:${i}">
          <details class="group py-2" ${i === 0 ? 'open' : ''}>
            <summary class="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-xl marker:hidden sm:text-2xl [&::-webkit-details-marker]:hidden">
              <span>${esc(f.q)}</span>
              <span aria-hidden="true" class="grid size-9 shrink-0 place-items-center rounded-full border border-cocoa/20 text-lg transition-transform duration-500 group-open:rotate-45">+</span>
            </summary>
            <p class="max-w-2xl pb-6 text-lg text-cocoa-soft">${esc(f.a)}</p>
          </details>
        </li>`)}
      </ul>
    </div>
  </div>
</section>
${ctaPanel()}
`;
  return layout({
    path: '/faq/',
    title: `الأسئلة الشائعة عن الطلب والأسعار | ${site.name}`,
    description: `إجابات عن طريقة طلب الكيك والتورتات من ${site.name} في ${site.city}، والتصاميم المخصصة، وكيفية معرفة الأسعار.`,
    body,
    jsonld: [
      breadcrumbLd(crumbs),
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  });
}

/* ── 404 ────────────────────────────────────────────────────── */
export function notFound() {
  const { site } = ctx();
  const body = html`
<section class="wrap flex min-h-[70dvh] flex-col items-center justify-center pt-32 text-center" aria-labelledby="h1">
  ${rosette('size-14 text-caramel')}
  <p class="latin mt-6 text-7xl text-caramel-ink" lang="en">404</p>
  <h1 id="h1" class="mt-4 text-3xl sm:text-4xl">لم نجد هذه الصفحة</h1>
  <p class="mt-4 max-w-md text-lg text-cocoa-soft">ربما تغيّر الرابط أو حُذفت الصفحة. يمكنكم العودة إلى الرئيسية أو تصفح أعمالنا.</p>
  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <a href="${u('/')}" class="btn btn-primary">الصفحة الرئيسية</a>
    <a href="${u('/cakes/')}" class="btn btn-ghost">الكيك والتورتات</a>
  </div>
</section>`;
  return layout({ path: '/404.html', title: `الصفحة غير موجودة | ${site.name}`, description: 'الصفحة المطلوبة غير موجودة.', body, noindex: true });
}
