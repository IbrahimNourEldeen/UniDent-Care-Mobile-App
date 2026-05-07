# مرجع API الشات بوت 📚

## نظرة عامة

يستخدم الشات بوت ثلاثة APIs رئيسية:
1. **AI Chat API** - للمحادثة مع الذكاء الاصطناعي
2. **Cases API** - لإنشاء الحالات
3. **Diagnoses API** - لإنشاء التشخيصات

---

## 1. AI Chat API 🤖

### Endpoint
```
POST https://omarhany-chat-ai-dental.hf.space/chat
```

### Request Body
```json
{
  "history": [
    {
      "role": "USER",
      "content": "أهلاً، أريد استشارة طبية بخصوص أسناني"
    },
    {
      "role": "MODEL",
      "content": "أهلاً بك! كيف يمكنني مساعدتك؟"
    }
  ]
}
```

### Response Examples

#### استجابة نصية بسيطة
```json
{
  "reply": "من فضلك صف الأعراض التي تعاني منها"
}
```

أو

```json
"من فضلك صف الأعراض التي تعاني منها"
```

#### استجابة مع تشخيص
```json
{
  "reply": "بناءً على الأعراض، قد تكون لديك...",
  "diagnosis": [
    {
      "note": "تسوس في الضرس العلوي",
      "description": "يحتاج لحشو",
      "teethNumbers": [16, 17],
      "teeth_numbers": [16, 17]
    }
  ]
}
```

#### استجابة إنهاء المحادثة
```json
{
  "reply": "تم التشخيص بنجاح",
  "diagnosis_status": "completed",
  "show_side_panel": true,
  "diagnosis": [...]
}
```

#### استجابة خطأ السيرفر
```json
{
  "reply": "عذراً، السيرفر مشغول حالياً. يرجى المحاولة مرة أخرى"
}
```

---

## 2. Cases API 📋

### Create Case (AI)

#### Endpoint
```
POST /api/v1/Cases/ai/create
```

#### Headers
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
X-AI-API-KEY: this_key_for_ai_created_by_omargamal
```

#### Request Body (FormData)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| PatientId | UUID | ✅ | معرف المريض |
| Title | string | ✅ | عنوان الحالة |
| Description | string | ✅ | وصف الحالة |
| CaseTypeId | UUID | ✅ | نوع الحالة |
| CreatedById | UUID | ✅ | معرف المنشئ |
| CreatedByRole | string | ✅ | دور المنشئ (Patient) |
| IsPublic | boolean | ❌ | هل الحالة عامة؟ |
| UniversityId | UUID | ❌ | معرف الجامعة |
| Images | File[] | ❌ | صور الحالة |

#### صيغة الصور في FormData
```javascript
{
  uri: "file:///path/to/image.jpg",
  name: "dental_image_1234567890.jpg",
  type: "image/jpeg"  // or "image/png"
}
```

#### Response Success (201)
```json
{
  "success": true,
  "message": "Case created successfully",
  "data": "uuid-of-new-case",
  "statusCode": 201
}
```

#### Response Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "type": "ValidationError",
    "errors": [
      "PatientId is required",
      "Invalid image format"
    ]
  },
  "statusCode": 400
}
```

---

## 3. Diagnoses API 🩺

### Create Diagnosis (AI)

#### Endpoint
```
POST /api/v1/Diagnoses/ai/create
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
X-AI-API-KEY: this_key_for_ai_created_by_omargamal
```

#### Request Body (JSON)
```json
{
  "patientCaseId": "uuid",
  "stage": 1,
  "caseTypeId": "uuid",
  "notes": "تسوس في الضرس العلوي",
  "createdById": "uuid",
  "role": "Patient",
  "teethNumbers": [16, 17]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| patientCaseId | UUID | ✅ | معرف الحالة |
| stage | number | ✅ | مرحلة التشخيص (1=Initial) |
| caseTypeId | UUID | ✅ | نوع الحالة |
| notes | string | ❌ | ملاحظات التشخيص |
| createdById | UUID | ❌ | معرف المنشئ |
| role | string | ❌ | دور المنشئ |
| teethNumbers | number[] | ❌ | أرقام الأسنان المتأثرة |

#### Response Success (201)
```json
{
  "success": true,
  "message": "Diagnosis created successfully",
  "data": {
    "id": "uuid",
    "patientCaseId": "uuid",
    "stage": 1,
    "caseTypeName": "Cavity",
    "notes": "تسوس في الضرس العلوي",
    "teethNumbers": [16, 17]
  },
  "statusCode": 201
}
```

---

## 4. Case Types API 📑

### Get Case Types

#### Endpoint
```
GET /api/v1/CaseTypes?page=1&pageSize=40&search=
```

#### Headers
```
Authorization: Bearer {token}
```

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "publicId": "uuid",
        "name": "General Dental",
        "description": "General dental cases"
      },
      {
        "publicId": "uuid",
        "name": "Cavity",
        "description": "Tooth decay cases"
      }
    ],
    "totalCount": 10,
    "currentPage": 1,
    "totalPages": 1
  }
}
```

---

## أكواد الحالة (Status Codes) 📊

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | نجح الطلب |
| 201 | Created | تم الإنشاء بنجاح |
| 400 | Bad Request | بيانات خاطئة - تحقق من الطلب |
| 401 | Unauthorized | غير مصرح - تحقق من Token |
| 403 | Forbidden | ممنوع - لا توجد صلاحيات |
| 404 | Not Found | غير موجود |
| 500 | Server Error | خطأ في السيرفر |

---

## أمثلة الاستخدام 💡

### مثال 1: محادثة كاملة

```typescript
// 1. بدء المحادثة
const initHistory = [
  { role: "USER", content: "أهلاً، أريد استشارة" }
];
const response1 = await chatWithAI(initHistory);

// 2. إضافة رد المستخدم
const history2 = [
  ...initHistory,
  { role: "MODEL", content: response1.reply },
  { role: "USER", content: "أعاني من ألم في الضرس" }
];
const response2 = await chatWithAI(history2);

// 3. استمرار حتى التشخيص
// ...

// 4. إنشاء الحالة
const caseRes = await createCaseAI({
  PatientId: patientId,
  Title: "حالة جديدة",
  Description: "ألم في الضرس",
  CaseTypeId: caseTypeId,
  Images: images,
  CreatedById: patientId,
  CreatedByRole: "Patient"
});

// 5. إنشاء التشخيص
const diagRes = await createDiagnosisAI({
  patientCaseId: caseRes.data.data,
  stage: 1,
  caseTypeId: caseTypeId,
  notes: "تسوس",
  teethNumbers: [16]
});
```

### مثال 2: رفع صور

```typescript
// اختيار الصور
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsMultipleSelection: true,
  quality: 0.7,
});

// تحضير الصور
const images = result.assets.map((asset, index) => {
  const ext = asset.uri.split('.').pop().toLowerCase();
  return {
    uri: asset.uri,
    name: `dental_${Date.now()}_${index}.${ext}`,
    type: ext === 'png' ? 'image/png' : 'image/jpeg',
  };
});

// إرسال مع الحالة
await createCaseAI({
  // ... بيانات أخرى
  Images: images
});
```

---

## معالجة الأخطاء 🔧

### خطأ 400 - بيانات خاطئة
```typescript
try {
  await createCaseAI(data);
} catch (err) {
  if (err.response?.status === 400) {
    const errors = err.response.data.error?.errors || [];
    Alert.alert("خطأ في البيانات", errors.join("\n"));
  }
}
```

### خطأ 401 - غير مصرح
```typescript
if (err.response?.status === 401) {
  // إعادة تسجيل الدخول
  router.push("/login");
}
```

### خطأ الشبكة
```typescript
if (err.message === "Network Error") {
  Alert.alert("خطأ", "تحقق من الاتصال بالإنترنت");
}
```

---

## نصائح الأداء ⚡

1. **ضغط الصور**: استخدم `quality: 0.7` في ImagePicker
2. **التخزين المؤقت**: احفظ `caseTypes` محلياً
3. **إعادة المحاولة**: استخدم exponential backoff
4. **Timeout**: حدد timeout للطلبات (30 ثانية)

---

## الأمان 🔒

1. **API Key**: لا تشارك `X-AI-API-KEY` أبداً
2. **Token**: احفظ JWT في SecureStore
3. **HTTPS**: استخدم HTTPS فقط
4. **Validation**: تحقق من البيانات قبل الإرسال

---

## الحدود والقيود ⚠️

| Item | Limit |
|------|-------|
| حجم الصورة | ~5MB لكل صورة |
| عدد الصور | غير محدد (يفضل <10) |
| طول الوصف | ~5000 حرف |
| طول المحادثة | ~50 رسالة |

---

## روابط مفيدة 🔗

- [Swagger Documentation](./swagger.json)
- [API Base URL](https://your-api-url.com)
- [AI Chat URL](https://omarhany-chat-ai-dental.hf.space)

---

**آخر تحديث:** 2024
**الإصدار:** 1.0
