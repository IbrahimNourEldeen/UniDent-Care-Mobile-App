# إصلاحات الشات بوت - Chatbot Fixes

## المشكلة الأساسية
كان هناك خطأ 400 عند رفع الصور في الشات بوت الذكي.

## التغييرات المطبقة

### 1. إصلاح معالجة الصور في `ai-chatbot.tsx`

#### قبل:
```typescript
const newImages = result.assets.map((asset) => ({
  uri: asset.uri,
  name: asset.fileName || `img_${Date.now()}.jpg`,
  type: "image/jpeg",
}));
```

#### بعد:
```typescript
const newImages = result.assets.map((asset, index) => {
  const uriParts = asset.uri.split('.');
  const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
  const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
  
  return {
    uri: asset.uri,
    name: asset.fileName || `dental_image_${Date.now()}_${index}.${fileExtension}`,
    type: mimeType,
  };
});
```

**الفوائد:**
- تحديد نوع الملف الصحيح (MIME type) بناءً على امتداد الملف
- أسماء ملفات فريدة لكل صورة
- دعم صيغ PNG و JPEG

### 2. تحسين دالة `handleCreateCase`

**التحسينات:**
- معالجة أفضل للأخطاء مع رسائل واضحة
- التحقق من وجود `caseId` قبل إنشاء التشخيصات
- دعم أسماء مختلفة لحقول التشخيص من AI
- رسائل نجاح/خطأ بالعربية والإنجليزية

```typescript
// معالجة أفضل لبيانات التشخيص
notes: diag.note || diag.description || diag.notes || "",
teethNumbers: diag.teethNumbers || diag.teeth_numbers || [],
```

### 3. إصلاح إرسال الصور في `caseService.ts`

#### قبل:
```typescript
if (data.Images && data.Images.length > 0) {
    data.Images.forEach((image) => {
        formData.append("Images", image as any);
    });
}
```

#### بعد:
```typescript
if (data.Images && data.Images.length > 0) {
    data.Images.forEach((image) => {
        const imageFile = {
            uri: image.uri,
            name: image.name || `image_${Date.now()}.jpg`,
            type: image.type || 'image/jpeg',
        };
        formData.append("Images", imageFile as any);
    });
}
```

**الفوائد:**
- التأكد من إرسال كائن صحيح مع `uri`, `name`, `type`
- توافق أفضل مع React Native FormData
- قيم افتراضية في حالة عدم وجود البيانات

### 4. تحسين واجهة المستخدم

**إضافات جديدة:**
- عرض الصور المرفقة قبل الإرسال
- زر حذف لكل صورة
- مؤشر تحميل عند إنشاء الحالة
- تعطيل الأزرار أثناء المعالجة
- رسائل خطأ أكثر وضوحاً

```typescript
{files.map((file, index) => (
  <View key={index} className="relative">
    <Image source={{ uri: file.uri }} className="w-16 h-16 rounded-lg" />
    <TouchableOpacity onPress={() => removeImage(index)}>
      <X size={14} color="white" />
    </TouchableOpacity>
  </View>
))}
```

### 5. تحسين معالجة استجابة AI

**التحسينات:**
- دعم صيغ مختلفة من استجابة AI
- التعامل مع حالة السيرفر المشغول
- رسائل أوضح للمستخدم
- دعم الصور الاختيارية

```typescript
responseString = data.reply || data.message || JSON.stringify(data);
const isServerBusy = responseString.includes("ضغط") || 
                     responseString.includes("السيرفر") || 
                     responseString.includes("busy");
```

## متطلبات API حسب Swagger

### POST `/api/v1/Cases/ai/create`

**Headers:**
```
Content-Type: multipart/form-data
X-AI-API-KEY: this_key_for_ai_created_by_omargamal
```

**Body (multipart/form-data):**
- `PatientId`: UUID (required)
- `Title`: string (required)
- `Description`: string (required)
- `CaseTypeId`: UUID (required)
- `IsPublic`: boolean (optional)
- `UniversityId`: UUID (optional)
- `Images`: array of files (optional)
- `CreatedById`: UUID (required)
- `CreatedByRole`: string (required)

### POST `/api/v1/Diagnoses/ai/create`

**Headers:**
```
X-AI-API-KEY: this_key_for_ai_created_by_omargamal
```

**Body (JSON):**
```json
{
  "patientCaseId": "uuid",
  "stage": 1,
  "caseTypeId": "uuid",
  "notes": "string",
  "createdById": "uuid",
  "role": "string",
  "teethNumbers": [1, 2, 3]
}
```

## اختبار التغييرات

### خطوات الاختبار:
1. افتح الشات بوت من شاشة المريض
2. أجب على أسئلة الشات بوت
3. عندما يطلب الصور، اختر صورة أو أكثر
4. تحقق من ظهور الصور المرفقة
5. اضغط على زر الإرسال
6. تحقق من إنشاء الحالة بنجاح

### حالات الاختبار:
- ✅ إرسال حالة بدون صور
- ✅ إرسال حالة مع صورة واحدة
- ✅ إرسال حالة مع صور متعددة
- ✅ حذف صورة قبل الإرسال
- ✅ معالجة الأخطاء
- ✅ إعادة المحاولة عند فشل الاتصال

## ملاحظات مهمة

1. **نوع الملفات**: يدعم النظام PNG و JPEG فقط
2. **حجم الصور**: يتم ضغط الصور بجودة 0.7 تلقائياً
3. **الصور اختيارية**: يمكن إنشاء حالة بدون صور
4. **API Key**: مطلوب لجميع طلبات AI

## الأخطاء الشائعة وحلولها

### خطأ 400 - Bad Request
**السبب:** بيانات غير صحيحة أو ناقصة
**الحل:** التحقق من جميع الحقول المطلوبة وصيغة الصور

### خطأ 401 - Unauthorized
**السبب:** مفتاح API مفقود أو خاطئ
**الحل:** التحقق من وجود `X-AI-API-KEY` في الـ headers

### خطأ 404 - Not Found
**السبب:** endpoint غير موجود
**الحل:** التحقق من URL الصحيح

## التحسينات المستقبلية المقترحة

1. إضافة معاينة للصور قبل الإرسال
2. دعم أنواع ملفات إضافية (PDF, HEIC)
3. ضغط الصور بشكل أفضل
4. رفع متعدد بالتوازي
5. إضافة progress bar للرفع
6. حفظ المسودات محلياً
7. إضافة تحليل AI للصور قبل الإرسال

## الخلاصة

تم إصلاح جميع المشاكل المتعلقة برفع الصور في الشات بوت. النظام الآن:
- ✅ يرسل الصور بالصيغة الصحيحة
- ✅ يعالج الأخطاء بشكل أفضل
- ✅ يوفر تجربة مستخدم محسنة
- ✅ متوافق مع API المطلوب
