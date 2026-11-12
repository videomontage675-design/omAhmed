// Static site build: content JSON → HTML pages, images → AVIF/WebP/JPEG, Tailwind → CSS, esbuild → JS.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import * as esbuild from 'esbuild';
import { setContext, abs } from './templates/lib.mjs';
import * as P from './templates/pages.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, '.cache', 'img');
const r = (...p) => path.join(ROOT, ...p);
const readJSON = async (p) => JSON.parse(await fs.readFile(r(p), 'utf8'));
const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
const write = async (rel, data) => {
  const out = path.join(DIST, rel);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, data);
};
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

/* ── Content ── */
const site = await readJSON('content/site.json');
const categories = await readJSON('content/categories.json');
const products = await readJSON('content/products.json');
const faq = await readJSON('content/faq.json');
const galleryRaw = await readJSON('content/gallery.json');

// Validate content references early (fail the build rather than ship broken pages)
const catSlugs = new Set(categories.map((c) => c.slug));
for (const p of products) {
  for (const c of p.categories) if (!catSlugs.has(c)) throw new Error(`Product ${p.slug}: unknown category "${c}"`);
  if (!['fixed', 'from', 'on-request'].includes(p.price?.type)) throw new Error(`Product ${p.slug}: invalid price.type`);
  if (p.price.type !== 'on-request' && !(p.price.amount > 0)) throw new Error(`Product ${p.slug}: price.amount required`);
}

/* ── URL / base path ── */
const rawUrl = (site.url || process.env.SITE_URL || 'http://localhost:4173').replace(/\/+$/, '');
const parsed = new URL(rawUrl);
const origin = parsed.origin;
const basePath = parsed.pathname.replace(/\/+$/, '');
log('Site URL:', origin + basePath);

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

/* ── Images ── */
const SRC_IMG = r('src/images/works');
const WIDTHS = [400, 640, 960, 1280, 1600];
const images = {};
await fs.mkdir(CACHE, { recursive: true });
const files = (await fs.readdir(SRC_IMG)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
await Promise.all(files.map(async (f) => {
  const name = f.replace(/\.[^.]+$/, '');
  const input = path.join(SRC_IMG, f);
  const buf = await fs.readFile(input);
  const key = hash(buf);
  const meta = await sharp(buf).rotate().metadata();
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.length || widths.at(-1) < meta.width * 0.9) widths.push(Math.min(meta.width, 1600));
  images[name] = { width: meta.width, height: meta.height, widths: [...new Set(widths)] };
  const jobs = [];
  for (const w of images[name].widths) {
    for (const [ext, opts] of [['avif', { quality: 52, effort: 5 }], ['webp', { quality: 76, effort: 5 }], ['jpg', { quality: 78, mozjpeg: true }]]) {
      const outName = `${name}-${w}.${ext}`;
      const cached = path.join(CACHE, `${key}-${outName}`);
      jobs.push((async () => {
        if (!existsSync(cached)) {
          let s = sharp(buf).rotate().resize({ width: w, withoutEnlargement: true });
          s = ext === 'avif' ? s.avif(opts) : ext === 'webp' ? s.webp(opts) : s.jpeg(opts);
          await s.toFile(cached);
        }
        await fs.mkdir(path.join(DIST, 'assets/img'), { recursive: true });
        await fs.copyFile(cached, path.join(DIST, 'assets/img', outName));
      })());
    }
  }
  // Open Graph 1200×630
  jobs.push((async () => {
    const cached = path.join(CACHE, `${key}-og.jpg`);
    if (!existsSync(cached)) await sharp(buf).rotate().resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention }).jpeg({ quality: 80, mozjpeg: true }).toFile(cached);
    await fs.mkdir(path.join(DIST, 'assets/og'), { recursive: true });
    await fs.copyFile(cached, path.join(DIST, 'assets/og', `${name}.jpg`));
  })());
  await Promise.all(jobs);
}));
await fs.copyFile(path.join(DIST, 'assets/og/ivory-three-tier-ruffle-cake.jpg'), path.join(DIST, 'assets/og/default.jpg'));
for (const p of products) for (const im of p.images) if (!images[im.file]) throw new Error(`Missing image ${im.file} for ${p.slug}`);
log(`Images: ${Object.keys(images).length} sources processed`);

/* ── Fonts (self-hosted, Arabic + Latin subsets only) ── */
const FONTS = [
  ['el-messiri', '500'], ['el-messiri', '600'],
  ['ibm-plex-sans-arabic', '400'], ['ibm-plex-sans-arabic', '500'], ['ibm-plex-sans-arabic', '600'],
  ['cormorant-garamond', '500-italic'],
];
let fontCss = '';
for (const [pkg, variant] of FONTS) {
  const dir = r('node_modules/@fontsource', pkg);
  const css = await fs.readFile(path.join(dir, `${variant}.css`), 'utf8');
  const blocks = css.split('/*').filter((b) => /-(arabic|latin)-\d/.test(b.split('*/')[0]) && !/latin-ext/.test(b.split('*/')[0]));
  for (const b of blocks) {
    const file = b.match(/url\(\.\/files\/([^)]+\.woff2)\)/)[1];
    await fs.mkdir(path.join(DIST, 'assets/fonts'), { recursive: true });
    await fs.copyFile(path.join(dir, 'files', file), path.join(DIST, 'assets/fonts', file));
    const face = '/*' + b;
    fontCss += face.replace(/src:[^;]+;/, `src: url(../fonts/${file}) format('woff2');`);
  }
}
const fontPreloads = ['/assets/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2', '/assets/fonts/el-messiri-arabic-600-normal.woff2'];

/* ── CSS (Tailwind v4) ── */
const tmpCss = r('.cache/tw-out.css');
execFileSync(path.join(ROOT, 'node_modules/.bin/tailwindcss'), ['-i', r('src/styles/main.css'), '-o', tmpCss, '--minify'], { stdio: 'inherit', cwd: ROOT });
const cssBuf = Buffer.from(fontCss.replace(/\s*\n\s*/g, '') + (await fs.readFile(tmpCss, 'utf8')));
const cssName = `/assets/css/main.${hash(cssBuf)}.css`;
await write(cssName, cssBuf);

/* ── JS (esbuild) ── */
const js = await esbuild.build({ entryPoints: [r('src/js/main.js')], bundle: true, minify: true, format: 'iife', target: ['es2019'], write: false });
const jsBuf = Buffer.from(js.outputFiles[0].contents);
const jsName = `/assets/js/main.${hash(jsBuf)}.js`;
await write(jsName, jsBuf);
log(`CSS ${(cssBuf.length / 1024).toFixed(1)}KB, JS ${(jsBuf.length / 1024).toFixed(1)}KB`);

/* ── Pages ── */
const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
const gallery = galleryRaw.map((g) => {
  const p = bySlug[g.product];
  const im = p?.images.find((x) => x.file === g.file);
  return { ...g, alt: g.alt || im?.alt || '', caption: g.caption || p?.name || '' };
});
setContext({ site, categories, products, faq, gallery, images, origin, basePath, fontPreloads, assets: { css: cssName, js: jsName } });

const min = (s) => s.replace(/\n\s+/g, '\n').replace(/\n{2,}/g, '\n');
const pages = [];
const page = async (route, htmlStr, sitemapInfo) => {
  const rel = route.endsWith('.html') ? route : path.join(route, 'index.html');
  await write(rel, min(htmlStr));
  if (sitemapInfo) pages.push({ route, ...sitemapInfo });
};

await page('/', P.home(), { priority: '1.0', images: ['ivory-three-tier-ruffle-cake'] });
await page('/cakes/', P.catalog(), { priority: '0.9' });
for (const c of categories) {
  const imgs = products.filter((p) => p.categories.includes(c.slug)).map((p) => p.images[0].file);
  await page(`/cakes/${c.slug}/`, P.category(c), { priority: '0.8', images: imgs });
}
for (const p of products) {
  await page(`/designs/${p.slug}/`, P.product(p), p.indexable === false ? null : { priority: '0.7', images: p.images.map((i) => i.file) });
}
await page('/gallery/', P.galleryPage(), { priority: '0.6' });
await page('/about/', P.about(), { priority: '0.5' });
await page('/contact/', P.contact(), { priority: '0.6' });
await page('/faq/', P.faq(), { priority: '0.5' });
await page('/404.html', P.notFound(), null);
log(`Pages: ${pages.length + 1}`);

/* ── sitemap.xml / robots.txt / manifest / icons ── */
const today = new Date().toISOString().slice(0, 10);
const imgUrl = (n) => abs(`/assets/img/${n}-${images[n].widths.at(-1)}.jpg`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map((p) => `  <url>
    <loc>${abs(p.route)}</loc>
    <lastmod>${today}</lastmod>
${(p.images || []).map((n) => `    <image:image><image:loc>${imgUrl(n)}</image:loc></image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>
`;
await write('sitemap.xml', sitemap.replace(/\n\n/g, '\n'));
await write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
await write('site.webmanifest', JSON.stringify({
  name: site.name, short_name: 'أم أحمد', lang: 'ar', dir: 'rtl', start_url: `${basePath}/`, display: 'standalone',
  background_color: '#f7f2ea', theme_color: '#f7f2ea',
  icons: [{ src: `${basePath}/icon-192.png`, sizes: '192x192', type: 'image/png' }, { src: `${basePath}/icon-512.png`, sizes: '512x512', type: 'image/png' }],
}));
const faviconSvg = await fs.readFile(r('src/images/favicon.svg'));
await write('favicon.svg', faviconSvg);
for (const [n, s] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await write(n, await sharp(faviconSvg, { density: 400 }).resize(s, s).png().toBuffer());
}
await write('.nojekyll', '');
if (site.customDomain) await write('CNAME', site.customDomain + '\n');
log('Done →', path.relative(ROOT, DIST));
