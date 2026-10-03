var VER = "infoj-v2";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", function (e) {
e.waitUntil(
caches.open(VER).then(function (c) { return c.addAll(SHELL); })
.then(function () { return self.skipWaiting(); })
);
});
self.addEventListener("activate", function (e) {
e.waitUntil(
caches.keys().then(function (keys) {
return Promise.all(keys.map(function (k) {
return k === VER ? null : caches.delete(k);
}));
}).then(function () { return self.clients.claim(); })
);
});
self.addEventListener("fetch", function (e) {
var req = e.request;
if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
if (req.url.indexOf("/data/") >= 0) {
e.respondWith(
fetch(req).then(function (res) {
var copy = res.clone();
caches.open(VER).then(function (c) { c.put(req, copy); });
return res;
}).catch(function () {
return caches.match(req, { ignoreSearch: true })
.then(function (hit) { return hit || Response.error(); });
})
);
return;
}
e.respondWith(
caches.match(req).then(function (hit) {
var net = fetch(req).then(function (res) {
if (res && res.status === 200) {
var copy = res.clone();
caches.open(VER).then(function (c) { c.put(req, copy); });
}
return res;
}).catch(function () { return hit; });
return hit || net;
})
);
});