# إدارة البيانات - Fox ERP

## نظرة عامة

يخزن نظام Fox ERP البيانات في مكانين:
1. **قاعدة البيانات (PostgreSQL)**: البيانات الرئيسية (منتجات، عملاء، معاملات، إلخ)
2. **localStorage (المتصفح)**: بيانات مؤقتة للعمل بدون اتصال

## ⚠️ ملاحظات هامة

- البيانات التجريبية **لا يتم تحميلها تلقائياً** عند تشغيل `start.bat`
- لحذف البيانات بالكامل، يجب حذفها من **المكانين معاً**
- أمر `load_initial_data` يتحقق من وجود بيانات ولن يضيف بيانات مكررة

## تحميل البيانات التجريبية

### الخطوة 1: تحميل البيانات إلى قاعدة البيانات

```bash
cd fox_pos_project
python manage.py load_initial_data
```

### ما يتم تحميله:

- ✅ 10 منتجات تجريبية (كرانيش، إضاءة، بانوهات، إلخ)
- ✅ 3 عملاء (عميل نقدي + عملاء آجل)
- ✅ 3 موردين
- ✅ مستخدمين (admin / cashier)
- ✅ وردية تجريبية مع معاملات
- ✅ عروض أسعار تجريبية
- ✅ إعدادات النظام الافتراضية

### الخطوة 2: تحديث المتصفح

بعد تحميل البيانات، قم بتحديث صفحة المتصفح (F5) لرؤية البيانات الجديدة.

## حذف جميع البيانات

### الخطوة 1: حذف البيانات من قاعدة البيانات

```bash
cd fox_pos_project
python manage.py clear_all_data
```

### ما يتم حذفه:

- ❌ جميع المعاملات (مبيعات، مشتريات، مصروفات)
- ❌ جميع عروض الأسعار
- ❌ جميع الورديات
- ❌ سجل الأنشطة
- ❌ جميع المنتجات
- ❌ جميع العملاء
- ❌ جميع الموردين

### ما يتم الاحتفاظ به:

- ✅ المستخدمين (admin / cashier)
- ✅ إعدادات النظام
- ✅ شعار الشركة (Logo)

### الخطوة 2: مسح localStorage من المتصفح

**الطريقة 1: استخدام صفحة مخصصة**

1. افتح المتصفح على: `http://localhost:5173/clear-storage.html`
2. اضغط على زر "مسح جميع البيانات"
3. سيتم إعادة توجيهك تلقائياً للصفحة الرئيسية

**الطريقة 2: استخدام Console المتصفح**

1. افتح Developer Tools (اضغط F12)
2. اذهب إلى تبويب Console
3. اكتب الأمر التالي واضغط Enter:

```javascript
localStorage.clear()
```

4. حدث الصفحة (F5)

**الطريقة 3: من إعدادات المتصفح**

1. افتح Developer Tools (F12)
2. اذهب إلى تبويب Application
3. في القائمة الجانبية، اختر Storage > Local Storage
4. اضغط بزر الماوس الأيمن على `http://localhost:5173`
5. اختر "Clear"

## سيناريوهات شائعة

### السيناريو 1: البدء من الصفر (بدون بيانات)

```bash
# 1. حذف البيانات من قاعدة البيانات
cd fox_pos_project
python manage.py clear_all_data

# 2. مسح localStorage من المتصفح
# افتح: http://localhost:5173/clear-storage.html

# 3. تسجيل الدخول والبدء
# استخدم: admin / admin
```

### السيناريو 2: إعادة تحميل البيانات التجريبية

```bash
# 1. حذف البيانات القديمة
cd fox_pos_project
python manage.py clear_all_data

# 2. تحميل بيانات جديدة
python manage.py load_initial_data

# 3. مسح localStorage من المتصفح
# افتح: http://localhost:5173/clear-storage.html

# 4. حدث الصفحة (F5)
```

### السيناريو 3: البيانات رجعت بعد الحذف

**السبب**: السكريبت `start.bat` كان يحمل البيانات تلقائياً (تم إصلاحه)

**الحل**:
1. تأكد من استخدام أحدث نسخة من `start.bat`
2. احذف البيانات مرة أخرى:
```bash
cd fox_pos_project
python manage.py clear_all_data
```
3. امسح localStorage من المتصفح

## استكشاف الأخطاء

### المشكلة: "Data already exists. Skipping initial data load"

**السبب**: توجد بيانات في قاعدة البيانات بالفعل

**الحل**: احذف البيانات أولاً:
```bash
python manage.py clear_all_data
python manage.py load_initial_data
```

### المشكلة: البيانات موجودة في Backend لكن غير ظاهرة في Frontend

**السبب**: مشكلة في localStorage أو Cache

**الحل**:
1. امسح localStorage: `http://localhost:5173/clear-storage.html`
2. امسح Cache المتصفح (Ctrl+Shift+Delete)
3. حدث الصفحة بقوة (Ctrl+F5)

### المشكلة: خطأ عند حذف البيانات (Foreign Key Constraint)

**السبب**: ترتيب الحذف غير صحيح

**الحل**: تم إصلاح الأمر `clear_all_data` ليحذف بالترتيب الصحيح:
1. المعاملات
2. عروض الأسعار
3. الورديات
4. سجل الأنشطة
5. المنتجات
6. العملاء
7. الموردين

## الأوامر السريعة

```bash
# حذف البيانات
cd fox_pos_project && python manage.py clear_all_data

# تحميل البيانات
cd fox_pos_project && python manage.py load_initial_data

# حذف وإعادة تحميل
cd fox_pos_project && python manage.py clear_all_data && python manage.py load_initial_data
```

## ملاحظات للمطورين

### تعديل البيانات التجريبية

لتعديل البيانات التجريبية، قم بتحرير الملف:
```
fox_pos_project/apps/api/management/commands/load_initial_data.py
```

### إضافة فحص جديد

لإضافة فحص على نموذج جديد قبل التحميل:

```python
if Product.objects.exists() or Customer.objects.exists() or YourModel.objects.exists():
    self.stdout.write(self.style.WARNING('Data already exists. Skipping initial data load.'))
    return
```

### تخطي الفحص (للتطوير فقط)

لتخطي فحص وجود البيانات (غير موصى به):

```python
# احذف أو علق على هذا الجزء:
# if Product.objects.exists() or Customer.objects.exists() or Supplier.objects.exists():
#     return
```

---

**آخر تحديث**: ديسمبر 2024  
**الإصدار**: 1.0.0
