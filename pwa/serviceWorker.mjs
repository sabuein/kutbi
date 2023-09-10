"use strict";

// serviceWorker.mjs

// https://www.w3.org/TR/service-workers/

const cacheVersion = 1;
const cacheName = `kutbi-${cacheVersion}`;
const scope = "/pwa/";
const patterns = {
    scripts: "\.(js|mjs)$",
    stylesheets: "\.css$",
    images: "\.(jpg|jpeg|png|gif|bmp|svg|webp|ico)$",
    fonts: "\.(woff|woff2|ttf|otf|eot)$",
    json: "\.json$"
};

const cacheAssets = [
    `${scope}`,
    `${scope}authors.html`,
    `${scope}change-password.html`,
    `${scope}cookies.html`,
    `${scope}dashboard.html`,
    `${scope}faq.html`,
    `${scope}features.html`,
    `${scope}index.html`,
    `${scope}kutbi.webmanifest`,
    `${scope}login.html`,
    `${scope}mobile.html`,
    `${scope}purpose.html`,
    `${scope}recover.html`,
    `${scope}register.html`,
    `${scope}serviceWorker.mjs`,
    `${scope}sharedWorker.mjs`,
    `${scope}sitemap.xml`,
    `${scope}wishlist.html`,
    `${scope}worker.mjs`,
    `${scope}assets/css/layout.css`,
    `${scope}assets/fonts/CircularXXWeb-Book.woff2`,
    `${scope}assets/js/app.mjs`,
    `${scope}assets/js/modules/apis.mjs`,
    `${scope}assets/js/modules/auth.mjs`,
    `${scope}assets/js/modules/data.mjs`,
    `${scope}assets/js/modules/helpers.mjs`,
    `${scope}assets/js/modules/interface.mjs`,
    `${scope}assets/js/modules/monitor.mjs`,
    `${scope}assets/js/modules/objects.mjs`,
    `${scope}assets/js/modules/requests.mjs`,
    `${scope}assets/images/add.png`,
    `${scope}assets/images/apple-touch-icon.png`,
    `${scope}assets/images/favicon-16x16.png`,
    `${scope}assets/images/favicon-32x32.png`,
    `${scope}assets/images/favicon.ico`,
    `${scope}assets/images/screenshot1.png`,
    `${scope}assets/images/screenshot2.jpg`,
    `${scope}assets/images/android/android-launchericon-144-144.png`,
    `${scope}assets/images/svg/books.svg`
];

self.addEventListener("install", async (event) => {
    try {
        // Setting up caches, offline assets, populating an IndexedDB, etc.
        event.waitUntil(
            caches.open(cacheName)
                .then(cache => cache.addAll(cacheAssets))
                .then(self.skipWaiting())
        );
    } catch (error) {
        if (error.name === "QuotaExceededError") await deleteOldCaches(cacheName);
        console.error(error);
    }
});

self.addEventListener("activate", async (event) => {
    // Clean up resources used in previous versions of the service worker
    await deleteOldCaches(cacheName);
    // Clients loaded in the same scope do not need to be reloaded before their fetches will go through this service worker
    self.clients.claim();
});

self.addEventListener("message", (event) => {
    try {
        if (event.origin !== self.origin) throw Error("@ServiceWorker:~$ The message origin is not the same.");;
        // event is an ExtendableMessageEvent object
        const properties = {
            data: event.data,
            origin: event.origin,
            lastEventId: event.lastEventId,
            source: event.source,
            ports: event.ports
        };
        console.log(`@ServiceWorker:~$ The client sent me a message...`);
        console.log(event.data);
        event.source.postMessage("Message received, thank you, client!");
    } catch (error) {
        console.error(error);
    }
});

self.addEventListener("sync", (event) => {
    try {
        const properties = {
            tag: event.tag,
            lastChance: event.lastChance
        };

        if (event.tag == "important-thing") {
            event.waitUntil(
                doImportantThing().catch(error => {
                    if (event.lastChance) {
                        self.registration.showNotification("Important thing failed");
                    }
                    throw error;
                })
            );
        }
    } catch (error) {
        console.error(error);
    }
});

self.addEventListener("fetch", (event) => {
    try {
        const url = new URL(event.request.url);
        /*
                if (patterns.scripts.test(url.pathname)) event.respondWith(cacheOnly(event.request));
                else if (patterns.stylesheets.test(url.pathname)) event.respondWith(cacheThenNetwork(event.request));
                else if (patterns.images.test(url.pathname)) event.respondWith(cacheThenNetwork(event.request));
                else if (patterns.fonts.test(url.pathname)) event.respondWith(cacheOnly(event.request));
                else if (patterns.json.test(url.pathname)) event.respondWith(cacheThenNetwork(event.request));
                else if (url.pathname.includes("secret")) event.respondWith(Response.error());
                else event.respondWith(Response.json({ message: "All's good!" }));*/

        // The string must be one of the audio, audioworklet, document, embed, font, frame, iframe, image, manifest, object, paintworklet, report, script, sharedworker, style, track, video, worker or xslt strings, or the empty string, which is the default value.
        if (
            event.request.destination === "script" ||
            event.request.destination === "style"
        ) {
            event.respondWith(cacheThenNetwork(event.request));
        } else event.respondWith(cacheThenNetwork(event.request));
    } catch (error) {
        console.error(error);
    }
});

self.addEventListener("push", (event) => {
    // Returns a reference to a PushMessageData object
    try {
        const message = event.data.json();
        switch (message.type) {
            case "init":
                doInit();
                break;
            case "shutdown":
                doShutdown();
                break;
        }
    } catch (error) {
        console.error(error);
    } finally {
        console.log(event.data.text());
    }
}, false);

self.addEventListener("notificationclick", (event) => {
    console.log("On notification click: ", event.notification.tag);
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
        clients
            .matchAll({
                type: "window",
            })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === "/" && "focus" in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow("/");
            }),
    );
});

self.addEventListener("error", (event) => {
    // The error event has three fields: message, filename, and lineno.
    event.preventDefault();
    console.error(event.message);
});

const doInit = () => {
    console.log("doInit();");
};

const doShutdown = () => {
    console.log("doShutdown();");
};

// Cache falling back to network
const cacheThenNetwork = async (request) => {
    try {
        const cachedResponse = await caches.match(request, { cacheName: cacheName });
        if (!!cachedResponse && !!cachedResponse.ok) return cachedResponse;
        else {
            const fetchedResponse = await fetch(request);
            if (!!fetchedResponse) {
                const responseClone = fetchedResponse.clone();
                const cache = await caches.open(cacheName);
                cache.put(request, responseClone);
                return await cacheOnly(request);
            } else return Response.error();
        }
    } catch (error) {
        if (error.name === "QuotaExceededError") await deleteOldCaches(cacheName);
        console.error(error);
        // () => caches.match(`${scope}assets/images/error.jpg`);
    }
};

// Cache only
const cacheOnly = async (request) => {
    try {
        const cachedResponse = await caches.match(request, { cacheName: cacheName });
        if (!!cachedResponse && !!cachedResponse.ok) return cachedResponse;
        else return Response.error();
    } catch (error) {
        if (error.name === "QuotaExceededError") await deleteOldCaches(cacheName);
        console.error(error);
        // () => caches.match(`${scope}assets/images/error.jpg`);
    }
};

const deleteOldCaches = async (currentCache) => {
    const keys = await caches.keys();
    for (const key of keys) {
        const isOurCache = key.startsWith(cacheName.split("-"));
        if (currentCache === key || !isOurCache) {
            continue;
        }
        caches.delete(key);
    }
};

const fetchImage = async (image, url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        image.src = objectURL;
    } catch (error) {
        console.error(error);
    }
};