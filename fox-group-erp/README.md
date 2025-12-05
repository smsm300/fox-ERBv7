# Fox Group ERP - Frontend

واجهة المستخدم لنظام Fox Group ERP المبني بـ React و TypeScript.

## التقنيات المستخدمة

- **React 18** - مكتبة بناء واجهات المستخدم
- **TypeScript** - لغة برمجة مع دعم الأنواع
- **Vite** - أداة بناء سريعة
- **Tailwind CSS** - إطار عمل CSS
- **Lucide React** - مكتبة الأيقونات
- **Axios** - مكتبة HTTP client

## المميزات

### 🎨 واجهة مستخدم حديثة
- تصميم عصري بألوان Fox Group
- دعم كامل للغة العربية (RTL)
- واجهة سريعة الاستجابة
- رسوم متحركة سلسة

### 🔐 نظام المصادقة
- تسجيل دخول آمن بـ JWT
- إدارة الجلسات
- صلاحيات متعددة المستويات

### 📱 دعم وضع عدم الاتصال
- العمل بدون إنترنت
- تخزين البيانات محلياً
- مزامنة تلقائية عند الاتصال

### 🛒 نقطة البيع (POS)
- واجهة سريعة للمبيعات
- دعم الباركود
- إدارة الورديات
- طرق دفع متعددة

### 📊 التقارير
- تقارير المبيعات
- تقارير المخزون
- تقارير الخزينة
- تقارير الأرباح والخسائر

## المتطلبات

- Node.js 18 أو أحدث
- npm أو yarn

## التثبيت

```bash
# تثبيت المتطلبات
npm install

# أو باستخدام yarn
yarn install
```

## الإعداد

1. انسخ ملف البيئة:
```bash
cp .env.example .env.local
```

2. حدث متغيرات البيئة في `.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

## التشغيل

### وضع التطوير

```bash
npm run dev
```

التطبيق سيعمل على: `http://localhost:5173`

### البناء للإنتاج

```bash
npm run build
```

الملفات المبنية ستكون في مجلد `dist/`

### معاينة البناء

```bash
npm run preview
```

## هيكل المشروع

```
fox-group-erp/
├── components/          # المكونات المشتركة
│   ├── Layout.tsx      # تخطيط الصفحة الرئيسي
│   ├── Modal.tsx       # مكون النافذة المنبثقة
│   ├── LoadingSpinner.tsx  # مؤشر التحميل
│   ├── LoadingButton.tsx   # زر مع حالة تحميل
│   ├── customers/      # مكونات العملاء
│   ├── inventory/      # مكونات المخزون
│   ├── purchases/      # مكونات المشتريات
│   ├── sales/          # مكونات المبيعات
│   ├── treasury/       # مكونات الخزينة
│   └── reports/        # مكونات التقارير
├── pages/              # صفحات التطبيق
│   ├── Login.tsx       # صفحة تسجيل الدخول
│   ├── Dashboard.tsx   # لوحة التحكم
│   ├── Sales.tsx       # نقطة البيع
│   ├── Purchases.tsx   # المشتريات
│   ├── Inventory.tsx   # المخزون
│   ├── Customers.tsx   # العملاء
│   ├── Suppliers.tsx   # الموردين
│   ├── Treasury.tsx    # الخزينة
│   ├── Quotations.tsx  # عروض الأسعار
│   ├── Reports.tsx     # التقارير
│   ├── Users.tsx       # المستخدمين
│   └── Settings.tsx    # الإعدادات
├── services/           # خدمات API
│   ├── api.ts         # إعداد Axios
│   ├── endpoints.ts   # نقاط النهاية
│   ├── errorHandler.ts # معالجة الأخطاء
│   └── offline.ts     # خدمة وضع عدم الاتصال
├── hooks/             # React Hooks مخصصة
│   ├── useAppState.ts # إدارة حالة التطبيق
│   ├── useLoading.ts  # إدارة حالات التحميل
│   └── useReportsData.ts # بيانات التقارير
├── types.ts           # تعريفات TypeScript
├── constants.ts       # الثوابت
├── App.tsx           # المكون الرئيسي
└── index.tsx         # نقطة الدخول

```

## المكونات الرئيسية

### Layout
مكون التخطيط الرئيسي الذي يحتوي على:
- القائمة الجانبية
- شريط العنوان
- مؤشر حالة الشبكة
- التنبيهات
- معلومات المستخدم

### API Client
- إعداد Axios مع JWT
- معالجة الأخطاء التلقائية
- دعم وضع عدم الاتصال
- تخزين البيانات مؤقتاً

### Offline Service
- كشف حالة الشبكة
- قائمة انتظار المعاملات
- مزامنة تلقائية
- تخزين البيانات محلياً

## الاستخدام

### تسجيل الدخول

```typescript
import { authAPI } from './services/endpoints';

const handleLogin = async (username: string, password: string) => {
  const response = await authAPI.login(username, password);
  localStorage.setItem('token', response.data.access);
  localStorage.setItem('user', JSON.stringify(response.data.user));
};
```

### استدعاء API

```typescript
import { productsAPI } from './services/endpoints';

// جلب المنتجات
const products = await productsAPI.list();

// إضافة منتج
const newProduct = await productsAPI.create({
  name: 'منتج جديد',
  sku: 'PROD001',
  // ...
});
```

### استخدام وضع عدم الاتصال

```typescript
import { offlineService } from './services/offline';

// التحقق من حالة الشبكة
const isOnline = offlineService.getNetworkStatus();

// إضافة معاملة للقائمة
if (!isOnline) {
  offlineService.addToQueue('sale', saleData);
}

// الاستماع لتغييرات الشبكة
offlineService.addNetworkListener((online) => {
  console.log('Network status:', online);
});
```

## التخصيص

### الألوان

يمكن تخصيص الألوان في `tailwind.config.js`:

```javascript
colors: {
  fox: {
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    // ...
  }
}
```

### الشعار

يمكن تغيير الشعار من صفحة الإعدادات أو بتحديث `logoUrl` في الإعدادات.

## الاختبار

```bash
# تشغيل الاختبارات (قريباً)
npm run test

# فحص الأكواد
npm run lint
```

## النشر

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/fox-erp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName example.com
    DocumentRoot /var/www/fox-erp/dist

    <Directory /var/www/fox-erp/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api
</VirtualHost>
```

## استكشاف الأخطاء

### خطأ في الاتصال بالـ API

تأكد من:
1. تشغيل Backend على `http://localhost:8000`
2. تحديث `VITE_API_URL` في `.env.local`
3. تفعيل CORS في Backend

### مشاكل في وضع عدم الاتصال

تأكد من:
1. تفعيل localStorage في المتصفح
2. عدم استخدام وضع التصفح الخاص
3. وجود مساحة كافية في localStorage

## المساهمة

نرحب بالمساهمات! يرجى:
1. عمل Fork للمشروع
2. إنشاء فرع للميزة الجديدة
3. عمل Commit للتغييرات
4. عمل Push للفرع
5. فتح Pull Request

## الترخيص

هذا المشروع مملوك لـ Fox Group ومطور بواسطة CairoCode.

---

**Fox Group ERP Frontend v1.0.0**  
© 2025 Fox Group. All rights reserved.  
Developed by CairoCode
