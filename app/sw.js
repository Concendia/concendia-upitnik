// Concendia prijave: push obaveštenja i keš osnovnih fajlova
const CACHE = "bp-app-v2";
const HOME = self.registration.scope; // radi i na github.io i na sopstvenom domenu
const fix = u => { const m = String(u || "").match(/#t([a-z0-9]{10,})/); return HOME + (m ? "#t" + m[1] : ""); };
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
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.url || "bp", data: { url: fix(d.url) }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = fix(e.notification.data && e.notification.data.url);
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if (c.url.startsWith(HOME)) { c.navigate(url).catch(()=>{}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
