// Concendia prijave: push obaveštenja i keš osnovnih fajlova
const CACHE = "bp-app-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "../bg-sm.jpg", "../brand/logo-svetli.svg", "../fonts/questrial-latin.woff2", "../fonts/questrial-latin-ext.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // baza i CDN idu direktno
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "Nova prijava", body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Nova prijava", {
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.url || "bp", data: { url: d.url || "/concendia-upitnik/app/" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/concendia-upitnik/app/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if (c.url.includes("/concendia-upitnik/app/")) { c.navigate(url).catch(()=>{}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
