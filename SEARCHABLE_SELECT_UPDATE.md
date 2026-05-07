# تحديث الفلتر إلى Searchable Select Dropdown

## التغييرات المنفذة

تم تحويل الفلتر من أزرار أفقية (Horizontal Pills) إلى Select Dropdown مع خاصية البحث.

### ما تم تغييره:

#### 1. **إضافة Component جديد: SearchableSelect**

```typescript
function SearchableSelect({ 
  options, 
  selected, 
  onSelect, 
  isDark, 
  placeholder 
}: { 
  options: { label: string; value: string }[], 
  selected: string, 
  onSelect: (v: string) => void, 
  isDark: boolean,
  placeholder: string 
})
```

**المميزات:**
- ✅ Modal منبثق عند الضغط على الزر
- ✅ حقل بحث (Search Input) للبحث في الخيارات
- ✅ قائمة قابلة للتمرير (ScrollView)
- ✅ تمييز الخيار المحدد بـ CheckCircle
- ✅ تصميم متجاوب مع Dark/Light Mode
- ✅ إغلاق تلقائي عند الاختيار
- ✅ زر Close لإغلاق Modal

#### 2. **إضافة Imports جديدة**

```typescript
import { Modal, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
```

#### 3. **استبدال FilterRow بـ SearchableSelect**

**قبل:**
```typescript
<FilterRow 
  options={CASE_TYPE_OPTIONS} 
  selected={caseType} 
  onSelect={setCaseType} 
  isDark={isDark} 
/>
```

**بعد:**
```typescript
<SearchableSelect 
  options={CASE_TYPE_OPTIONS} 
  selected={caseType} 
  onSelect={setCaseType} 
  isDark={isDark}
  placeholder={t('select_case_type')}
/>
```

#### 4. **تطبيق على كلا الفلترين**

- ✅ **Case Type Filter**: للبحث في أنواع الحالات
- ✅ **Request Status Filter**: للبحث في حالات الطلبات

### البنية الداخلية للـ Component:

```
SearchableSelect
├── Select Button (زر الاختيار)
│   ├── Selected Label أو Placeholder
│   └── ChevronRight Icon
│
└── Modal (عند الفتح)
    ├── Search Input (حقل البحث)
    │   ├── Search Icon
    │   └── TextInput
    │
    ├── Options List (قائمة الخيارات)
    │   └── ScrollView
    │       └── TouchableOpacity لكل خيار
    │           ├── Label
    │           └── CheckCircle (للمحدد)
    │
    └── Close Button (زر الإغلاق)
```

### المزايا:

✅ **تجربة مستخدم أفضل**: واجهة أنظف وأكثر احترافية
✅ **بحث سريع**: إمكانية البحث في الخيارات بدلاً من التمرير
✅ **توفير مساحة**: لا يأخذ مساحة أفقية كبيرة
✅ **قابل للتوسع**: يعمل بشكل جيد مع عدد كبير من الخيارات
✅ **متجاوب**: يعمل مع Dark/Light Mode
✅ **سهل الاستخدام**: واجهة مألوفة للمستخدمين

### الملفات المعدلة:

- ✅ `app/(screens)/student/my-cases.tsx`

### كيفية الاستخدام:

1. اضغط على زر الفلتر
2. سيظهر Modal مع حقل البحث
3. ابحث عن الخيار المطلوب
4. اضغط على الخيار للاختيار
5. سيُغلق Modal تلقائياً

### التصميم:

#### Light Mode:
- خلفية بيضاء
- حدود رمادية فاتحة
- نص داكن
- الخيار المحدد: خلفية indigo فاتحة

#### Dark Mode:
- خلفية slate-900
- حدود slate-800
- نص فاتح
- الخيار المحدد: خلفية indigo-900/30

### ملاحظات تقنية:

- استخدام `Modal` من React Native للـ overlay
- استخدام `TextInput` للبحث
- استخدام `Search` icon من lucide-react-native
- الفلترة تتم في Frontend (client-side)
- حالة البحث (searchQuery) محلية داخل الـ component
- يتم إعادة تعيين البحث عند الإغلاق

### الفرق بين القديم والجديد:

| الميزة | FilterRow (القديم) | SearchableSelect (الجديد) |
|--------|-------------------|---------------------------|
| التصميم | أزرار أفقية | Dropdown مع Modal |
| البحث | ❌ غير متوفر | ✅ متوفر |
| المساحة | يأخذ مساحة أفقية | يأخذ مساحة عمودية فقط |
| التمرير | أفقي | عمودي |
| عدد الخيارات | محدود بالشاشة | غير محدود |
| سهولة الاستخدام | جيد للخيارات القليلة | ممتاز للخيارات الكثيرة |
