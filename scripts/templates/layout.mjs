import { html, esc, u, abs, ctx, icon, waGeneral } from './lib.mjs';

const NAV = [
  { href: '/cakes/', label: 'الكيك والتورتات' },
  { href: '/gallery/', label: 'معرض الأعمال' },
  { href: '/about/', label: 'من نحن' },
  { href: '/faq/', label: 'الأسئلة الشائعة' },
  { href: '/contact/', label: 'التواصل' },
];

const wordmark = (size = 'text-2xl') => html`
  <span class="flex flex-col leading-none">
    <span class="font-display ${size} font-semibold tracking-tight text-cocoa">أم أحمد</span>
    <span class="latin mt-1 text-[0.78rem] text-caramel-ink" lang="en" dir="ltr">Cake Om Ahmed</span>
  </span>`;

function header(path) {
  const isActive = (href) => (href === '/' ? path === '/' : path.startsWith(href));
  return html`
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[70] focus:rounded-full focus:bg-cocoa focus:px-5 focus:py-3 focus:text-cream">تخطَّ إلى المحتوى</a>
<header class="site-header fixed inset-x-0 top-0 z-50">
  <div class="wrap flex h-[4.5rem] items-center justify-between gap-6">
    <a href="${u('/')}" class="relative z-[60] -my-2 py-2" rel="home">${wordmark()}<span class="sr-only"> — الصفحة الرئيسية</span></a>
    <nav aria-label="القائمة الرئيسية" class="hidden lg:block">
      <ul class="flex items-center gap-8 text-[0.95rem]">
        ${NAV.map((n) => html`<li><a href="${u(n.href)}" class="link-u py-2 ${isActive(n.href) ? 'text-cocoa font-medium' : 'text-cocoa-soft hover:text-cocoa'}"${isActive(n.href) ? ' aria-current="page"' : ''}>${n.label}</a></li>`)}
      </ul>
    </nav>
    <div class="flex items-center gap-2">
      <a href="${waGeneral()}" class="btn btn-wa hidden !min-h-11 !px-5 !text-sm sm:inline-flex" target="_blank" rel="noopener">${icon.wa}<span>اطلبوا عبر واتساب</span></a>
      <button type="button" data-menu-toggle aria-controls="menu-panel" aria-expanded="false" aria-label="فتح القائمة" class="relative z-[60] grid size-11 place-items-center rounded-full text-cocoa hover:bg-cocoa/5 lg:hidden">
        <span class="sr-only">القائمة</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" class="icon-open size-6" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8h16M8 16h12"/></svg><svg aria-hidden="true" viewBox="0 0 24 24" class="icon-close size-6" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
</header>
<div id="menu-panel" class="menu-panel fixed inset-0 z-[45] flex flex-col bg-cream lg:hidden">
  <div class="scallop mt-[4.5rem]"></div>
  <nav aria-label="قائمة الجوال" class="wrap flex flex-1 flex-col justify-between pb-10 pt-8">
    <ul class="space-y-1">
      <li style="--i:0"><a href="${u('/')}" class="block py-3 font-display text-3xl">الرئيسية</a></li>
      ${NAV.map((n, i) => html`<li style="--i:${i + 1}"><a href="${u(n.href)}" class="block py-3 font-display text-3xl"${isActive(n.href) ? ' aria-current="page"' : ''}>${n.label}</a></li>`)}
    </ul>
    <ul><li style="--i:7"><a href="${waGeneral()}" class="btn btn-wa w-full" target="_blank" rel="noopener">${icon.wa}<span>اطلبوا عبر واتساب</span></a></li></ul>
  </nav>
</div>`;
}

function footer() {
  const { site, categories } = ctx();
  return html`
<footer class="relative mt-24 bg-cocoa text-cream" style="--scallop-color: var(--color-cocoa)">
  <div class="scallop-fill absolute inset-x-0 -top-[15px]" aria-hidden="true"></div>
  <div class="wrap grid gap-12 pb-28 pt-16 sm:pb-16 md:grid-cols-12">
    <div class="md:col-span-5">
      <p class="font-display text-3xl font-semibold">أم أحمد</p>
      <p class="latin mt-1 text-caramel-light" lang="en" dir="ltr">Cake Om Ahmed</p>
      <p class="mt-5 max-w-sm text-cream/80">${esc(site.tagline)} نصمّم الكيك والتورتات حسب الطلب في ${esc(site.city)}.</p>
      <div class="mt-6 flex gap-2">
        ${site.social.map((s) => html`<a href="${s.url}" target="_blank" rel="noopener me" class="grid size-11 place-items-center rounded-full border border-cream/20 transition-colors hover:border-cream hover:bg-cream hover:text-cocoa" aria-label="${s.label} — ${esc(s.handle)}">${icon[s.id]}</a>`)}
      </div>
    </div>
    <nav aria-label="روابط الموقع" class="grid grid-cols-2 gap-8 md:col-span-4">
      <div>
        <p class="mb-3 text-sm text-caramel-light">التصنيفات</p>
        <ul class="space-y-2 text-cream/85">
          ${categories.map((c) => html`<li><a class="link-u" href="${u(`/cakes/${c.slug}/`)}">${c.name}</a></li>`)}
        </ul>
      </div>
      <div>
        <p class="mb-3 text-sm text-caramel-light">الموقع</p>
        <ul class="space-y-2 text-cream/85">
          ${NAV.map((n) => html`<li><a class="link-u" href="${u(n.href)}">${n.label}</a></li>`)}
        </ul>
      </div>
    </nav>
    <div class="md:col-span-3">
      <p class="mb-3 text-sm text-caramel-light">للطلب والاستفسار</p>
      <a href="tel:${site.phone}" class="block text-xl font-medium" dir="ltr">${site.phoneDisplay}</a>
      <p class="mt-1 text-cream/70">واتساب واتصال · ${esc(site.city)}</p>
      <a href="${waGeneral()}" target="_blank" rel="noopener" class="btn mt-5 bg-cream text-cocoa hover:bg-white">${icon.wa}<span>راسلونا عبر واتساب</span></a>
    </div>
  </div>
  <div class="border-t border-cream/10">
    <div class="wrap flex flex-col gap-2 py-6 text-sm text-cream/60 sm:flex-row sm:justify-between">
      <p>© ${new Date().getFullYear()} ${esc(site.brandLine)}</p>
      <p>جميع الصور من أعمالنا الأصلية.</p>
    </div>
  </div>
</footer>
<a href="${waGeneral()}" target="_blank" rel="noopener" class="btn btn-wa fixed bottom-4 left-4 right-4 z-40 shadow-lg shadow-cocoa/20 sm:hidden">${icon.wa}<span>اطلبوا عبر واتساب</span></a>`;
}

/**
 * page: { path, title, description, body, ogImage, ogType, jsonld[], noindex, preload[] }
 */
export function layout(page) {
  const C = ctx();
  const canonical = abs(page.path);
  const og = page.ogImage ? abs(`/assets/og/${page.ogImage}.jpg`) : abs('/assets/og/default.jpg');
  const jsonld = (page.jsonld || []).filter(Boolean);
  return html`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">\n<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#f7f2ea">
${C.site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(C.site.googleSiteVerification)}">` : ''}
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:locale" content="ar_YE">
<meta property="og:site_name" content="${esc(C.site.name)}">
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.description)}">
${page.noindex ? '' : `<meta property="og:url" content="${canonical}">`}
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogAlt || C.site.name)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${u('/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${u('/apple-touch-icon.png')}">
<link rel="manifest" href="${u('/site.webmanifest')}">
${C.fontPreloads.map((f) => `<link rel="preload" href="${u(f)}" as="font" type="font/woff2" crossorigin>`)}
${(page.preload || []).join('\n')}
<link rel="stylesheet" href="${u(C.assets.css)}">
<script>document.documentElement.classList.add('js')</script>
<script src="${u(C.assets.js)}" defer></script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)}
</head>
<body class="min-h-dvh antialiased">
${header(page.path)}
<main id="main" tabindex="-1" class="outline-none">
${page.body}
</main>
${footer()}
</body>
</html>
`;
}

/** Visible breadcrumbs (matching BreadcrumbList JSON-LD). items: [{name, path}] */
export function breadcrumbs(items) {
  return html`<nav aria-label="مسار التنقل" class="text-sm text-cocoa-soft">
    <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
      ${items.map((it, i) => html`<li class="flex items-center gap-2">${i > 0 ? '<span aria-hidden="true" class="text-caramel-light">/</span>' : ''}${i < items.length - 1 ? `<a class="link-u hover:text-cocoa" href="${u(it.path)}">${esc(it.name)}</a>` : `<span aria-current="page" class="text-cocoa">${esc(it.name)}</span>`}</li>`)}
    </ol>
  </nav>`;
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}
