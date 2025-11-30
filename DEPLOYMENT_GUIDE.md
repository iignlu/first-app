# 🚀 دليل نشر تطبيق "آية اليوم" على المتاجر

مبروك على إكمال التطبيق! إليك الخطوات التفصيلية لنشر التطبيق على Google Play Store و Apple App Store باستخدام **EAS (Expo Application Services)**.

## 1. المتطلبات الأساسية
قبل البدء، تأكد من أن لديك:
- حساب في [Expo.dev](https://expo.dev/signup).
- حساب مطور في **Google Play Console** (يكلف 25$ مرة واحدة).
- حساب مطور في **Apple Developer Program** (يكلف 99$ سنوياً).

## 2. إعداد EAS Build
EAS هي خدمة من Expo لبناء التطبيق في السحابة.

1. **تثبيت أداة EAS CLI**:
   افتح التيرمينال ونفذ الأمر التالي:
   ```bash
   npm install -g eas-cli
   ```

2. **تسجيل الدخول**:
   ```bash
   eas login
   ```

3. **إعداد المشروع**:
   ```bash
   eas build:configure
   ```
   - اختر `All` (Android & iOS) عندما يسألك.
   - سيقوم هذا بإنشاء ملف `eas.json`.

## 3. بناء نسخة Android (Google Play)

1. **إنشاء ملف AAB (Android App Bundle)**:
   ```bash
   eas build --platform android
   ```
   - سيطلب منك EAS إنشاء "Keystore". وافق على الخيارات الافتراضية ليقوم Expo بإدارتها لك.
   - عند الانتهاء، سيعطيك رابطاً لتحميل ملف `.aab`.

2. **الرفع إلى Google Play**:
   - اذهب إلى [Google Play Console](https://play.google.com/console).
   - أنشئ تطبيقاً جديداً.
   - ارفع ملف `.aab` في قسم "Production" أو "Testing".

## 4. بناء نسخة iOS (App Store)

1. **إنشاء ملف IPA**:
   ```bash
   eas build --platform ios
   ```
   - سيطلب منك تسجيل الدخول بحساب Apple Developer.
   - سيقوم EAS بإنشاء الشهادات (Certificates) وملفات التعريف (Provisioning Profiles) تلقائياً.

2. **الرفع إلى App Store Connect**:
   - يمكنك استخدام أداة `eas submit` لرفع التطبيق مباشرة:
   ```bash
   eas submit -p ios
   ```
   - أو تحميل ملف `.ipa` ورفعه باستخدام تطبيق "Transporter" على الماك.

## 5. نصائح هامة قبل النشر 🌟
- **الأيقونة والشاشة الافتتاحية**: تأكد من أن الصور في مجلد `assets` عالية الدقة.
- **رقم الإصدار**: عند تحديث التطبيق مستقبلاً، لا تنس تغيير `version` في ملف `app.json` (مثلاً من `1.0.0` إلى `1.0.1`) ورقم `versionCode` (للأندرويد) و `buildNumber` (للآيفون).
- **اختبار التطبيق**: قبل الرفع النهائي، جرب نسخة "Production" على هاتفك للتأكد من أن كل شيء يعمل (خاصة الإشعارات والموقع).

## أوامر مفيدة
- `eas build --platform android --profile preview`: لإنشاء نسخة تجريبية (APK) يمكنك تثبيتها على هاتفك مباشرة للتجربة.
- `eas update`: لإرسال تحديثات سريعة للكود (JS/TS) دون الحاجة لرفع إصدار جديد للمتجر (يعمل فقط للتغييرات البسيطة).

بالتوفيق في نشر تطبيقك! 🎉
