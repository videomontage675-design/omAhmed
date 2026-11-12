# كيك أم أحمد — الموقع الرسمي

موقع ثابت (Static) بالعربية وRTL لعرض أعمال **Cake Om Ahmed – ام احمد كيك** في تعز، مع الطلب المباشر عبر واتساب.
لا يوجد Backend أو قاعدة بيانات أو لوحة تحكم؛ المحتوى كله في ملفات JSON داخل `content/`.

## التقنيات

| الجزء | الأداة |
|---|---|
| الصفحات | HTML5 يُولَّد من قوالب JavaScript (`scripts/templates/`) |
| التنسيق | Tailwind CSS v4 (`src/styles/main.css` — الألوان والخطوط في `@theme`) |
| السكربت | JavaScript عادي (`src/js/main.js`) يُضغط بـ esbuild — ~4KB |
| الصور | sharp: AVIF + WebP + JPEG بعدة مقاسات، وصور Open Graph بمقاس 1200×630 |
| الخطوط | El Messiri (العناوين)، IBM Plex Sans Arabic (النصوص)، Cormorant Garamond (لمسات لاتينية) — مستضافة ذاتيًا |
| النشر | GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`) |

## التشغيل محليًا

```bash
npm install
npm run build     # يُنتج مجلد الإنتاج dist/
npm run preview   # http://localhost:4173
```

## بنية المشروع

```
content/            ← المحتوى (عدّليه هنا فقط)
  site.json         بيانات النشاط والتواصل والحسابات
  categories.json   التصنيفات ونصوص صفحاتها
  products.json     التصاميم/المنتجات والأسعار
  gallery.json      ترتيب صور المعرض وما يظهر في الرئيسية
  faq.json          الأسئلة الشائعة
src/images/works/   الصور الأصلية (اسم الملف = معرّف الصورة)
src/styles/         Tailwind + نظام التصميم
src/js/             التفاعلات (القائمة، الظهور التدريجي، عارض الصور)
scripts/            أداة البناء والقوالب وخادم المعاينة
dist/               مجلد الإنتاج (يُنشأ تلقائيًا، غير مرفوع إلى Git)
```

## تحديث المحتوى

**إضافة تصميم جديد**
1. ضعي الصورة في `src/images/works/` باسم إنجليزي واضح، مثل `pink-roses-birthday-cake.jpg` (يفضل 1600px عرضًا أو أكثر).
2. أضيفي عنصرًا في `content/products.json`:
   ```json
   {
     "slug": "pink-roses-birthday-cake",
     "name": "اسم التصميم",
     "categories": ["birthday"],
     "featured": false,
     "summary": "وصف قصير يظهر في نتائج البحث",
     "description": ["فقرة أولى", "فقرة ثانية"],
     "images": [{ "file": "pink-roses-birthday-cake", "alt": "وصف دقيق لما في الصورة" }],
     "price": { "type": "on-request" },
     "options": [],
     "confirmed": true,
     "indexable": true
   }
   ```
3. (اختياري) أضيفيه إلى `content/gallery.json`.
4. ارفعي التعديل إلى `main` — يُبنى الموقع ويُنشر تلقائيًا.

**أنواع الأسعار** (`price.type`):
- `"fixed"` مع `"amount": 15000` → يظهر «15٬000 ر.ي»
- `"from"` مع `"amount": 10000` → يظهر «يبدأ من …» مع ملاحظة أن السعر النهائي حسب الخيارات
- `"on-request"` → «السعر حسب الطلب» مع توجيه إلى واتساب

**الخيارات** (`options`): مثل `[{ "label": "حجم 20 سم", "price": "12٬000 ر.ي" }]` — تظهر في صفحة التصميم.

**البيانات المنظمة للمنتج (Product)** تُضاف فقط عندما يكون `confirmed: true` والسعر `fixed` أو `from`.

**الأسئلة الشائعة**: الأسئلة ذات `"confirmed": false` لا تظهر. اكتبي الإجابة وغيّريها إلى `true` بعد تأكيد السياسة.

## الدومين والنشر

1. في GitHub: **Settings → Pages → Source: GitHub Actions**.
2. كل دفع إلى `main` يبني وينشر. عناوين Canonical وOpen Graph وSitemap تُبنى من عنوان GitHub Pages تلقائيًا.
3. عند شراء دومين: ضعيه في `content/site.json` → `"url": "https://example.com"` و`"customDomain": "example.com"`، ثم اربطيه من إعدادات Pages.

## النشر على Vercel

المشروع جاهز لـ Vercel عبر `vercel.json` (أمر البناء `npm run build` ومجلد الإنتاج `dist`):
1. من [vercel.com/new](https://vercel.com/new) اختاري **Import** للمستودع `videomontage675-design/omAhmed`.
2. اتركي الإعدادات كما هي (Framework: Other) ثم **Deploy**.
3. كل دفع إلى `main` يُنشر تلقائيًا، وكل فرع آخر يحصل على رابط معاينة.

روابط Canonical وSitemap تُبنى تلقائيًا من دومين Vercel الأساسي. عند ربط دومين خاص ضعيه في `content/site.json` → `"url"`.

**تنبيه SEO:** لا تُبقي الموقع منشورًا على GitHub Pages وVercel معًا دون دومين موحّد في `site.json`، حتى لا تظهر نسختان مكررتان في البحث. بعد اعتماد Vercel يمكن تعطيل GitHub Pages.

## ⚠️ قبل الإطلاق — معلومات تنتظر التأكيد

لم يُنشر أي شيء غير مؤكد. هذه البيانات **محجوبة** حتى تأكيدها:

- [ ] **العنوان**: يوجد تعارض («شارع جمال» / «المسبح، النادي السياحي، جوار كوافير المستقبل»). محفوظ في `site.json` مع `"confirmed": false`؛ لذلك لا يظهر في الموقع ولا في Schema. بعد الحسم: صححيه، ضعي `confirmed: true`، وأضيفي `mapUrl`.
- [ ] هل يستقبل النشاط العملاء في الموقع؟ (`acceptsVisitors`)
- [ ] التوصيل: المناطق والرسوم والشروط (`delivery.text`) + سؤال FAQ.
- [ ] أوقات العمل ومدة التجهيز المطلوبة.
- [ ] العربون/الحجز المسبق/الإلغاء.
- [ ] **أسماء التصاميم** الحالية وصفية من الصور (`nameConfirmed: false`) — يُرجى اعتمادها أو استبدالها.
- [ ] الأسعار الفعلية والأحجام والخيارات.
- [ ] قائمة التصنيفات النهائية.
- [ ] الشعار الرسمي إن وُجد (`logo`).
- [ ] صور بدقة أعلى: بعض الصور الحالية بعرض ~577px فقط، لذا لا تُستخدم في Hero (`ivory-three-tier-ruffle-cake`، `red-roses-pearl-cake`).
- [ ] صورة التورتة بالفراولة والشموع من ملف المشروع **لم تُستخدم**؛ في خلفيتها زجاجة قد لا تناسب الجمهور المحلي. يمكن إضافتها بعد مراجعتها أو بعد قصّها.

## بعد الإطلاق

- Google Search Console: تحقق من الملكية وإرسال `/sitemap.xml`.
- Google Business Profile بالعنوان المؤكد فقط (أو كنشاط خدمي بنطاق جغرافي إن لم يستقبل العملاء).
- إضافة رابط الموقع في وصف حسابات Instagram وTikTok وFacebook.
- PageSpeed Insights وRich Results Test.

لا يمكن ضمان ترتيب معيّن في نتائج البحث؛ الموقع يوفر الأساس التقني والمحتوائي الصحيح للمنافسة.
