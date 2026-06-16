const CACHE_NAME = 'quran-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. تثبيت عامل الخدمة وحفظ الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. تفعيل عامل الخدمة وحذف الـ Cache القديم إذا وجد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. اعتراض الطلبات: إذا كان هناك إنترنت اذهب للشبكة، وإذا لم يوجد اذهب للـ Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجدنا الطلب في الـ Cache نعيده، وإلا نذهب للإنترنت
      if (response) {
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
