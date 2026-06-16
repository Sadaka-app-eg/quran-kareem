const CACHE_NAME = 'quran-pwa-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. تثبيت وحفظ الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// 2. تفعيل وحذف الذاكرة المؤقتة القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. اعتراض الطلبات (استراتيجية: الشبكة أولاً، ثم الذاكرة المؤقتة)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // حفظ استجابات API في الذاكرة المؤقتة للعمل أوفلاين لاحقاً
        if (event.request.url.includes('api.quran.com')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // إذا فشل الإنترنت، ارجع للذاكرة المؤقتة
        return caches.match(event.request);
      })
  );
});      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        // حفظ استجابات API الجديدة في الـ Cache للعمل لاحقاً بدون إنترنت
        if (event.request.url.includes('api.quran.com')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // في حالة عدم وجود إنترنت وعدم وجود البيانات في الكاش
        return new Response('لا يوجد اتصال بالإنترنت، والبيانات غير محفوظة مسبقاً.', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
