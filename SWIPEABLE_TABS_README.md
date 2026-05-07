# ميزة السحب الأفقي للتنقل بين التابات (Swipeable Tabs)

## نظرة عامة
تم إضافة ميزة السحب الأفقي (Swipe Gesture) للتنقل بين التابات في التطبيق، مشابهة لتطبيقات Facebook و Instagram.

## التعديلات المنفذة

### 1. المكتبات المثبتة
```bash
npm install react-native-pager-view
npm install react-native-gesture-handler
npm install @react-navigation/material-top-tabs@^6.6.14 react-native-tab-view --legacy-peer-deps
```

### 2. الملفات الجديدة

#### `components/ui/SwipeableTabsContainer.tsx`
مكون رئيسي يضيف وظيفة السحب الأفقي للتنقل بين التابات باستخدام:
- `react-native-gesture-handler` للتعامل مع إيماءات السحب
- `react-native-reanimated` للرسوم المتحركة السلسة
- يدعم السحب لليمين واليسار للتنقل بين التابات
- يتكامل مع Expo Router للتنقل التلقائي

### 3. الملفات المعدلة

#### `app/_layout.tsx`
- إضافة `GestureHandlerRootView` لتفعيل دعم الإيماءات في كامل التطبيق

#### `app/(screens)/student/_layout.tsx`
- إضافة `SwipeableTabsContainer` لتفعيل السحب بين التابات
- تعريف مسارات التابات للتنقل السلس

#### `app/(screens)/doctor/_layout.tsx`
- نفس التعديلات المطبقة على student layout

#### `app/(screens)/patient/_layout.tsx`
- نفس التعديلات المطبقة على student layout

#### `app/(screens)/clinical-doctor/_layout.tsx`
- نفس التعديلات المطبقة على student layout

## كيفية الاستخدام

### للمستخدم النهائي:
1. **السحب لليسار**: الانتقال إلى التاب التالي
2. **السحب لليمين**: الانتقال إلى التاب السابق
3. **الضغط على التاب**: التنقل المباشر كالمعتاد

### للمطورين:
لإضافة ميزة السحب لأي tab layout جديد:

```tsx
import { SwipeableTabsContainer } from "@/components/ui/SwipeableTabsContainer";

export default function MyTabsLayout() {
  // تعريف مسارات التابات
  const tabPaths = [
    { name: "tab1", path: "/(screens)/my-section/tab1" },
    { name: "tab2", path: "/(screens)/my-section/tab2" },
    // ... المزيد من التابات
  ];

  return (
    <SwipeableTabsContainer tabs={tabPaths}>
      <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
        {/* تعريف التابات هنا */}
      </Tabs>
    </SwipeableTabsContainer>
  );
}
```

## الميزات

✅ **سحب سلس وسريع**: استجابة فورية لإيماءات المستخدم
✅ **رسوم متحركة ناعمة**: انتقالات سلسة بين التابات
✅ **دعم RTL**: يعمل بشكل صحيح مع اللغة العربية
✅ **متوافق مع Expo Router**: يتكامل بسلاسة مع نظام التنقل الحالي
✅ **حد أدنى للسحب**: يتطلب سحب 25% من عرض الشاشة لتفعيل التنقل
✅ **منع السحب في الحواف**: لا يمكن السحب إلى اليسار في آخر تاب أو إلى اليمين في أول تاب

## ملاحظات تقنية

- يستخدم `SWIPE_THRESHOLD` بقيمة 25% من عرض الشاشة لتحديد متى يتم تفعيل التنقل
- الرسوم المتحركة تستخدم `withSpring` لحركة طبيعية
- يتم التحقق من اتجاه السحب (أفقي vs عمودي) لتجنب التعارض مع السكرول العمودي
- التكامل الكامل مع `useRouter` و `usePathname` من Expo Router

## الاختبار

للتأكد من عمل الميزة:
1. افتح التطبيق وانتقل إلى أي قسم به تابات (Student, Doctor, Patient, Clinical Doctor)
2. جرب السحب الأفقي بإصبعك على الشاشة
3. تأكد من الانتقال السلس بين التابات
4. جرب أيضاً الضغط على التابات للتأكد من عمل الطريقة التقليدية

## المشاكل المحتملة وحلولها

### المشكلة: السحب لا يعمل
**الحل**: تأكد من أن `GestureHandlerRootView` موجود في `app/_layout.tsx`

### المشكلة: التنقل بطيء أو متقطع
**الحل**: تحقق من أن `react-native-reanimated` مثبت ومُعد بشكل صحيح في `babel.config.js`

### المشكلة: تعارض مع السكرول العمودي
**الحل**: المكون يتحقق تلقائياً من اتجاه السحب ويعطي الأولوية للسحب الأفقي فقط

## التحسينات المستقبلية المقترحة

- [ ] إضافة مؤشر بصري أثناء السحب
- [ ] إضافة haptic feedback عند التنقل
- [ ] إضافة إعدادات لتخصيص حساسية السحب
- [ ] دعم السحب بالماوس على الويب
