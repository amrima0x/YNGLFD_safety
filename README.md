# تشغيل موقع تسجيل حملة السلامة 2026

الموقع شغّال الحين في **وضع التجربة** (افتح index.html وجرّبه على جهازك). عشان يصير حقيقي ويوصلك تسجيل الناس، سوّ الخطوات التالية مرة وحدة (١٥ دقيقة تقريباً).

> مهم: سوّ **مشروع Firebase جديد** ولا تستخدم مشروع البطولة، لأن قواعد البطولة مفتوحة للكل (public read/write) وراح تكشف بيانات المسجلين.

## ١) Firebase
1. ادخل console.firebase.google.com ← **Add project** ← سمّه مثلاً `YNGLFD Safety Campaign` (تقدر تقفل Google Analytics).
2. **Build ← Realtime Database ← Create database** ← اختر Singapore ← **Start in locked mode**.
3. **Build ← Authentication ← Get started ← Email/Password ← Enable**.
4. في Authentication ← تبويب **Users ← Add user** ← حط إيميلك وباسوورد قوي ← بعد الإضافة **انسخ الـ User UID**.
5. Authentication ← **Settings ← Authorized domains ← Add domain** ← أضف `amrima0x.github.io`.

## ٢) قواعد الحماية (أهم خطوة)
1. Realtime Database ← تبويب **Rules**.
2. امسح الموجود والصق محتوى ملف `database.rules.json` كامل.
3. استبدل `PASTE_ADMIN_UID_HERE` (موجودة **مرتين** بالسطور الأولى) بالـ UID اللي نسخته ← **Publish**.

القواعد هذي هي اللي تضمن:
- ما أحد يقرأ بيانات المسجلين غيرك.
- الحد ١٠٠ لكل يوم مقفول من السيرفر نفسه (حتى لو أحد لعب بالصفحة).
- الرقم الوظيفي ما يتسجل مرتين (ولا في اليومين).
- التسجيل لكل يوم يقفل تلقائياً الساعة ١ الظهر في نفس اليوم.

## ٣) ربط الموقع بـ Firebase
1. Project settings (⚙️) ← **Your apps ← Web (</>)** ← سجّل التطبيق.
2. انسخ القيم من `firebaseConfig` إلى ملف `config.js`: `apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`.
   (لو `databaseURL` ما ظهر، خذه من أعلى صفحة Realtime Database — يبدأ بـ `https://` وينتهي بـ `firebasedatabase.app`).

## ٤) الشعار
حط شعار أرامكو الرسمي داخل مجلد `assets` باسم **`logo.png`** (يفضّل نسخة بيضاء/شفافة لأن الخلفية داكنة). لو ما حطيته الصفحة تشتغل عادي بدونه.

## ٥) النشر على GitHub Pages (موقع منفصل عن البطولة)
1. في GitHub ← **New repository** ← اسم مثل `YNGLFD_safety` ← Public.
2. **Add file ← Upload files** ← ارفع: `index.html`, `admin.html`, `config.js`, `store.js`, ومجلد `assets` فيه `logo.png`.
3. **Settings ← Pages ← Branch: main / root ← Save**.
4. بعد دقيقة يصير الرابط:
   - صفحة التسجيل: `https://amrima0x.github.io/YNGLFD_safety/`
   - لوحتك: `https://amrima0x.github.io/YNGLFD_safety/admin.html`

## ٦) لوحة الأدمن
ادخل admin.html بإيميلك وباسووردك وتلقى:
- عدد المسجلين لكل يوم + زر **إيقاف/فتح التسجيل** لأي يوم.
- توزيع المسجلين حسب الشركة.
- **QR Code** جاهز للتحميل PNG (حطه في الإيميل أو البوستر) + نسخ الرابط.
- جدول بحث وفلترة حسب اليوم والشركة + حذف تسجيل (يرجع المقعد).
- **Export Excel**: ملف فيه ٤ شيتات — كل التسجيلات، ١٧ نوفمبر، ١٨ نوفمبر، وملخص حسب الشركة.

## تعديلات سريعة
- تغيير الحد (١٠٠): غيّره في `config.js` **و** في `database.rules.json` (`<= 100`).
- قبل الإطلاق: افتح admin.html وتأكد إن العدد صفر بعد ما تجرّب تسجيل وتحذفه.
