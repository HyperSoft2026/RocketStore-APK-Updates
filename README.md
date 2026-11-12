# RocketStore Central APK Updates Manager 🚀

النظام المركزي الموحد لإدارة وسجل تحديثات تطبيقات وألعاب متجر **RocketStore**.

- **المستودع المركزي:** `HyperSoft2026/RocketStore-APK-Updates`
- **متجر RocketStore:** [https://rocketstore5.blogspot.com/](https://rocketstore5.blogspot.com/)
- **الفرع الحالي:** `main`
- **المرحلة الحالية:** المرحلة الأولى (تأسيس البنية المركزية والسجل الموحد)

---

## 📌 رؤية وفلسفة البنية المركزية

1. **مصدر الحقيقة الموحد (Single Source of Truth):**
   يحتوي المستودع المركزي على ملف `apps-registry.json` الذي يسجل جميع تطبيقات وألعاب RocketStore ويربط كل منتج بمستودعه الأصلي ورابط مشاركته الثابتة على Blogger.

2. **رفع ملفات APK في المستودعات الأصلية:**
   يتم رفع واستضافة ملفات الـ APK في مستودعات التطبيقات الأصلية عبر **GitHub Releases**، ولا يتم رفع ملفات ثنائية كبيرة داخل هذا المستودع المركزي.

3. **ثبات روابط Blogger:**
   يبقى رابط مشاركة Blogger لجميع المنتجات ثابتاً لا يتغير عند إطلاق تحديث جديد، بينما يتغير رقم الإصدار ورابط التحميل وسجل التغييرات تلقائياً في السجل المركزي.

4. **الأمان وسلامة البيانات:**
   - لا توجد أي مفاتيح أسرار أو Access Tokens مدمجة في كود المتجر أو الملفات العامة.
   - التحقق الصارم من بنية JSON قبل حفظ التغييرات.
   - تجنب الكتابة فوق البيانات الصحيحة أو مسح المنتجات عند فشل التحديث.
   - استثناء إصدارات المسودات (Draft) والنسخ التجريبية (Pre-release).

---

## 🗂 البنية الهيكلية للملفات

```text
├── apps-registry.json              # قاعدة البيانات المركزية لجميع المنتجات
├── package.json                    # إعدادات الاعتمادات والأوامر
├── README.md                       # وثيقة دليل النظام والتشغيل
├── .github/
│   └── workflows/
│       └── sync-updates.yml        # سير العمل التلقائي لإجراء المزامنة والتحقق
├── scripts/
│   ├── validate-registry.ts        # نص التحقق من صحة ملف السجل عبر CLI
│   └── sync-updates.ts             # محرك مزامنة الإصدارات مع GitHub Releases API
└── src/
    ├── types/
    │   └── registry.ts             # التعريفات والأنواع البرمجية (TypeScript Interfaces)
    ├── utils/
    │   ├── validator.ts            # دالة فحص وتدقيق بنية السجل
    │   └── githubSync.ts           # محرك المزامنة واستعلام GitHub Releases API
    └── App.tsx                     # لوحة التحكم التفاعلية لمتجر RocketStore
```

---

## 📑 بنية ملف `apps-registry.json` (Schema)

يحتوي ملف `apps-registry.json` على مصفوفة JSON تضم جميع المنتجات. كل منتج يدعم الحقول التالية:

| الحقل | النوع | الوصف | مثال |
|---|---|---|---|
| `id` | `string` | معرف فريد للمنتج | `"com.hypersoft.rocketstore"` |
| `name` | `string` | الاسم الرئيسي للمنتج | `"RocketStore App"` |
| `name_ar` | `string` | الاسم باللغة العربية | `"متجر روكيت ستور"` |
| `name_en` | `string` | الاسم باللغة الإنجليزية | `"RocketStore App"` |
| `type` | `"app" \| "game"` | تصنيف المنتج | `"app"` |
| `description` | `string` | وصف مختصر للمنتج | `"تطبيق متجر RocketStore الرسمي"` |
| `repository` | `string` | مسار المستودع الأصلي على GitHub | `"HyperSoft2026/RocketStore-App"` |
| `release_tag` | `string` | وسم الإصدار الحالي على GitHub | `"v1.2.0"` |
| `version` | `string` | رقم الإصدار النظيف | `"1.2.0"` |
| `apk_asset` | `string` | اسم ملف الـ APK داخل Release Assets | `"RocketStore-v1.2.0.apk"` |
| `download_url` | `string` | رابط التحميل المباشر للـ APK | `"https://github.com/.../releases/download/v1.2.0/app.apk"` |
| `blogger_url` | `string` | رابط مشاركة Blogger الثابتة | `"https://rocketstore5.blogspot.com/2026/11/rocketstore.html"` |
| `release_date` | `string` | تاريخ آخر تحديث بتنسيق ISO | `"2026-11-12T10:00:00Z"` |
| `changelog` | `string` | سجل التغييرات والملاحظات | `"تحسينات الأداء وإصلاح الأخطاء"` |
| `status` | `"active" \| "inactive" \| "archived"` | حالة المنتج | `"active"` |

---

## 🛠 التشغيل المحلي وأوامر الفحص

### 1. فحص وتدقيق السجل المركزي:
```bash
npm run validate:registry
```
يقوم هذا الأمر بقراءة `apps-registry.json` والتأكد من خلوه من الأخطاء وعدم تكرار الـ IDs ومطابقة جميع الحقول المعتمدة.

### 2. تشغيل مزامنة التحديثات:
```bash
npm run sync:updates
```
يقوم بقراءة المنتجات النشطة (`status: "active"`) واستعلام GitHub Releases API للمستودعات المسجلة، ثم تحديث الوسوم والروابط وتاريخ الإصدار وسجل التغييرات بأمان.

---

## 🔄 كيفية إضافة تطبيق أو لعبة جديدة إلى النظام

1. قم بفتح لوحة التحكم عبر التطبيق أو تعديل `apps-registry.json` مباشرة.
2. أضف عنصراً جديداً بالنواة التالية:
   ```json
   {
     "id": "com.hypersoft.mygame",
     "name": "My New Game",
     "name_ar": "لعبتي الجديدة",
     "name_en": "My New Game",
     "type": "game",
     "description": "وصف اللعبة...",
     "repository": "HyperSoft2026/My-New-Game",
     "release_tag": "v1.0.0",
     "version": "1.0.0",
     "apk_asset": "MyGame-v1.0.0.apk",
     "download_url": "https://github.com/HyperSoft2026/My-New-Game/releases/download/v1.0.0/MyGame-v1.0.0.apk",
     "blogger_url": "https://rocketstore5.blogspot.com/2026/11/my-new-game.html",
     "release_date": "2026-11-12T00:00:00Z",
     "changelog": "الإصدار الأول الأولية",
     "status": "active"
   }
   ```
3. قم بتشغيل أمر التحقق `npm run validate:registry` قبل حفظ ورفع Commit.

---

## 🚦 خريطة المراحل (Roadmap)

### ✅ المرحلة الأولى (المحققة حالياً):
- بناء السجل المركزي `apps-registry.json`.
- إعداد محرك الفحص والتدقيق البرمجي `validate-registry.ts`.
- إعداد محرك المزامنة الحية عبر GitHub Releases API `sync-updates.ts`.
- إعداد سير العمل التلقائي على GitHub Actions `.github/workflows/sync-updates.yml`.
- تطوير لوحة التحكم التفاعلية للربط والتدقيق والمعاينة الحية.

### ⏳ المرحلة الثانية (تنتظر الموافقة):
- ربط المدونة (Blogger API / Integration) واستدعاء السجل المركزي ديناميكياً لعرض أحدث رابط إصدار ورابط تحميل مستقر دون إعادة تغيير روابط الصفحات.
