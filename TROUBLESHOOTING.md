# 🔧 دليل حل المشاكل - البيانات مش بتتحفظ

## الخطوات الأساسية للفحص

### 1️⃣ تأكد إن الـ Backend شغال

```bash
cd fox_pos_project
python manage.py runserver
```

**يجب أن ترى:**
```
Starting development server at http://127.0.0.1:8000/
```

**اختبر من المتصفح:**
- افتح: `http://localhost:8000/api/products/`
- يجب أن ترى صفحة Django REST Framework

---

### 2️⃣ تأكد إن الـ Frontend شغال

```bash
cd fox-group-erp
npm run dev
```

**يجب أن ترى:**
```
Local:   http://localhost:5173/
```

---

### 3️⃣ افحص Console في المتصفح

1. افتح الموقع: `http://localhost:5173`
2. اضغط `F12` لفتح Developer Tools
3. اذهب لتبويب **Console**

**ابحث عن:**
- ❌ أخطاء حمراء (Errors)
- ⚠️ تحذيرات صفراء (Warnings)
- 🔴 Network errors (401, 403, 404, 500)

---

### 4️⃣ افحص Network Requests

1. في Developer Tools، اذهب لتبويب **Network**
2. حاول تضيف منتج جديد
3. شوف الـ requests اللي بتتبعت

**يجب أن ترى:**
```
POST http://localhost:8000/api/products/
Status: 201 Created
```

**إذا رأيت:**
- `401 Unauthorized` → مش مسجل دخول
- `403 Forbidden` → مفيش صلاحيات
- `404 Not Found` → الـ URL غلط
- `500 Server Error` → مشكلة في الـ Backend

---

## المشاكل الشائعة والحلول

### ❌ المشكلة: 401 Unauthorized

**السبب:** مش مسجل دخول أو الـ token منتهي

**الحل:**
1. سجل خروج
2. امسح localStorage:
   ```javascript
   localStorage.clear();
   ```
3. سجل دخول مرة أخرى

---

### ❌ المشكلة: CORS Error

**السبب:** الـ Backend مش بيسمح بـ requests من Frontend

**الحل:**
تأكد إن `fox_pos_project/fox_pos/settings.py` فيه:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

---

### ❌ المشكلة: Network Error / Connection Refused

**السبب:** الـ Backend مش شغال

**الحل:**
```bash
cd fox_pos_project
python manage.py runserver
```

---

### ❌ المشكلة: البيانات بتظهر لكن مش بتتحفظ

**السبب:** localStorage لسه فيه بيانات قديمة

**الحل:**
1. افتح: `http://localhost:5173/clear-storage.html`
2. اضغط "مسح جميع البيانات"
3. أو من Console:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

---

### ❌ المشكلة: البيانات بتتحفظ لكن مش بتظهر

**السبب:** الصفحة مش بتحمل من API

**الحل:**
1. افتح Console (F12)
2. شوف لو فيه أخطاء في `fetchProducts()` أو `fetchCustomers()`
3. تأكد إن الـ API بيرجع بيانات:
   ```
   GET http://localhost:8000/api/products/
   ```

---

## اختبار يدوي للـ API

### من المتصفح:

1. **تسجيل دخول:**
   - افتح: `http://localhost:8000/admin`
   - Username: `admin`
   - Password: `admin123`

2. **اختبر Products API:**
   - افتح: `http://localhost:8000/api/products/`
   - يجب أن ترى قائمة فارغة `[]`

3. **أضف منتج من Django Admin:**
   - اذهب لـ Products
   - اضغط "Add Product"
   - املأ البيانات واحفظ

4. **تحقق من الـ API:**
   - افتح: `http://localhost:8000/api/products/`
   - يجب أن ترى المنتج الجديد

---

## فحص قاعدة البيانات

```bash
cd fox_pos_project
python manage.py shell
```

```python
from apps.products.models import Product
from apps.customers.models import Customer
from apps.suppliers.models import Supplier

# عدد المنتجات
print(f"Products: {Product.objects.count()}")

# عدد العملاء
print(f"Customers: {Customer.objects.count()}")

# عدد الموردين
print(f"Suppliers: {Supplier.objects.count()}")

# عرض جميع المنتجات
for p in Product.objects.all():
    print(f"- {p.product_name}: {p.current_stock}")
```

---

## إعادة تشغيل كاملة

إذا كل شيء فشل، جرب:

```bash
# 1. أوقف كل شيء
# اضغط Ctrl+C في كل terminal

# 2. امسح قاعدة البيانات
cd fox_pos_project
python manage.py clear_all_data

# 3. امسح localStorage
# افتح http://localhost:5173/clear-storage.html

# 4. شغل Backend
python manage.py runserver

# 5. في terminal جديد، شغل Frontend
cd fox-group-erp
npm run dev

# 6. سجل دخول وجرب تضيف منتج
```

---

## معلومات للدعم الفني

إذا المشكلة لسه موجودة، ابعت:

1. **Screenshot من Console (F12)**
2. **Screenshot من Network tab**
3. **نص الخطأ بالكامل**
4. **الخطوات اللي عملتها**

---

## أوامر مفيدة

```bash
# فحص الـ Backend
cd fox_pos_project
python manage.py check

# عرض الـ URLs
python manage.py show_urls

# إنشاء superuser جديد
python manage.py createsuperuser

# مسح البيانات
python manage.py clear_all_data

# عرض الـ migrations
python manage.py showmigrations

# تطبيق الـ migrations
python manage.py migrate
```

---

**آخر تحديث:** ديسمبر 2024
