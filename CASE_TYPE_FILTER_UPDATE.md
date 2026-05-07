# تحديث فلتر Case Type في صفحة "حالاتي" للطالب

## التغييرات المنفذة

تم تحديث صفحة `app/(screens)/student/my-cases.tsx` لجلب أنواع الحالات (Case Types) ديناميكياً من API بدلاً من استخدام قيم ثابتة.

### ما تم تغييره:

#### 1. **إضافة Imports جديدة**
```typescript
import { useEffect, useState } from 'react';
import { getCaseTypes } from '@/features/cases/server/caseTypes.action';
import { CaseType } from '@/features/cases/types/caseTypes';
```

#### 2. **إضافة State لـ Case Types**
```typescript
const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
const [caseTypesLoading, setCaseTypesLoading] = useState(true);
```

#### 3. **جلب Case Types من API**
```typescript
useEffect(() => {
  const fetchCaseTypes = async () => {
    try {
      setCaseTypesLoading(true);
      const response = await getCaseTypes(1, 100);
      if (response.success && response.data?.items) {
        setCaseTypes(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch case types:', error);
    } finally {
      setCaseTypesLoading(false);
    }
  };

  fetchCaseTypes();
}, []);
```

#### 4. **بناء خيارات الفلتر ديناميكياً**
```typescript
const CASE_TYPE_OPTIONS = [
  { label: t('all_case_types'), value: '' },
  ...caseTypes.map((ct: CaseType) => ({ label: ct.name, value: ct.name }))
];
```

#### 5. **تحديث مؤشر التحميل**
```typescript
{(casesLoading || caseTypesLoading) && <ActivityIndicator size="small" color="#4f46e5" />}
```

#### 6. **إصلاح API endpoint في `caseTypes.action.ts`**
تم تحديث الملف لاستخدام `api` instance بدلاً من `axios` مباشرة:
```typescript
import api from "@/utils/api";

export async function getCaseTypes(page: number = 1, pageSize: number = 100, search?: string): Promise<CaseTypeResponse> {
    try {
        const response = await api.get('/CaseTypes', {
            params: { page, pageSize, search }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch case types");
    }
}
```

### المزايا:

✅ **ديناميكية**: يتم جلب أنواع الحالات من API مباشرة
✅ **مرونة**: إضافة أو تعديل أنواع الحالات من Backend دون تعديل Frontend
✅ **متوافق مع Swagger**: يستخدم endpoint `/api/v1/CaseTypes` المعرف في swagger.json
✅ **Frontend Filtering**: الفلترة تتم في Frontend بناءً على البيانات المجلوبة
✅ **Authentication**: يستخدم api instance الذي يحتوي على token تلقائياً
✅ **Error Handling**: في حالة فشل جلب البيانات، لن تتعطل الصفحة

### API Endpoint المستخدم:

```
GET /api/v1/CaseTypes
Query Parameters:
  - page: 1
  - pageSize: 100
  - search: (optional)

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "publicId": "uuid",
        "name": "Restorative",
        "description": "..."
      }
    ],
    "totalCount": 10,
    "currentPage": 1,
    "totalPages": 1
  }
}
```

### الملفات المعدلة:

- ✅ `app/(screens)/student/my-cases.tsx` - الصفحة الرئيسية
- ✅ `features/cases/server/caseTypes.action.ts` - إصلاح API endpoint

### الملفات المستخدمة (بدون تعديل):

- `features/cases/types/caseTypes.ts` - للـ Types
- `utils/api.ts` - للاتصال بـ API مع authentication
- `swagger.json` - مصدر تعريف API

---

## كيفية الاختبار:

1. افتح صفحة "حالاتي" للطالب
2. تحقق من ظهور أنواع الحالات في الفلتر
3. جرب الفلترة بناءً على نوع الحالة
4. تأكد من أن الفلترة تعمل بشكل صحيح

## ملاحظات:

- الفلترة تتم في Frontend بناءً على البيانات المجلوبة
- يتم جلب 100 case type كحد أقصى (يمكن تعديله حسب الحاجة)
- في حالة فشل جلب البيانات، سيظهر خطأ في console ولن يتوقف التطبيق
- يتم استخدام `api` instance الذي يحتوي على authentication token تلقائياً

## الإصلاحات:

### المشكلة الأولى: URL خاطئ
- **قبل**: `https://dental-hup1.runasp.net/api/CaseTypes` ❌
- **بعد**: استخدام `api.get('/CaseTypes')` مع baseURL: `https://dental-hup1.runasp.net/api/v1/` ✅

### المشكلة الثانية: عدم استخدام authentication
- **قبل**: استخدام `axios` مباشرة بدون token ❌
- **بعد**: استخدام `api` instance الذي يضيف token تلقائياً ✅

