"use strict";

// serviceWorker.mjs

// https://www.w3.org/TR/service-workers/

// static import
import { justSayingHi } from "./assets/js/modules/helpers.mjs";

const workerScope = "/pwa/";
const cacheVersion = 1;
const cacheName = `kutbi-${cacheVersion}`;
const cacheAssets = [
    `${workerScope}`,
    `${workerScope}authors.html`,
    `${workerScope}change-password.html`,
    `${workerScope}cookies.html`,
    `${workerScope}dashboard.html`,
    `${workerScope}faq.html`,
    `${workerScope}features.html`,
    `${workerScope}index.html`,
    `${workerScope}kutbi.webmanifest`,
    `${workerScope}login.html`,
    `${workerScope}mobile.html`,
    `${workerScope}purpose.html`,
    `${workerScope}recover.html`,
    `${workerScope}register.html`,
    `${workerScope}serviceWorker.mjs`,
    `${workerScope}sharedWorker.mjs`,
    `${workerScope}sitemap.xml`,
    `${workerScope}wishlist.html`,
    `${workerScope}worker.mjs`,
    `${workerScope}assets/css/layout.css`,
    `${workerScope}assets/fonts/CircularXXWeb-Book.woff2`,
    `${workerScope}assets/js/app.mjs`,
    `${workerScope}assets/js/modules/apis.mjs`,
    `${workerScope}assets/js/modules/auth.mjs`,
    `${workerScope}assets/js/modules/data.mjs`,
    `${workerScope}assets/js/modules/helpers.mjs`,
    `${workerScope}assets/js/modules/interface.mjs`,
    `${workerScope}assets/js/modules/monitor.mjs`,
    `${workerScope}assets/js/modules/objects.mjs`,
    `${workerScope}assets/js/modules/requests.mjs`,
    `${workerScope}assets/images/add.png`,
    `${workerScope}assets/images/apple-touch-icon.png`,
    `${workerScope}assets/images/favicon-16x16.png`,
    `${workerScope}assets/images/favicon-32x32.png`,
    `${workerScope}assets/images/favicon.ico`,
    `${workerScope}assets/images/screenshot1.png`,
    `${workerScope}assets/images/screenshot2.jpg`,
    `${workerScope}assets/images/android/android-launchericon-144-144.png`,
    `${workerScope}assets/images/svg/books.svg`,
    `${workerScope}assets/data/books.json`
];

self.addEventListener("install", (event) => {
    try {
        // Setting up caches, offline assets, populating an IndexedDB, etc.
        event.waitUntil(addResourcesToCache());
        self.skipWaiting();
    } catch (error) {
        console.error(error);
    }
}, false);

self.addEventListener("activate", (event) => {
    // Clean up resources used in previous versions of the service worker
    deleteOldCaches(cacheName);
    // Clients loaded in the same scope do not need to be reloaded before their fetches will go through this service worker
    self.clients.claim();
    console.log(`@ServiceWorker:~$ ${justSayingHi()} Scope: ${workerScope}. Cache: ${cacheName}`);
}, false);

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
}, false);

self.addEventListener("sync", (event) => {
    try {
        const properties = {
            tag: event.tag,
            lastChance: event.lastChance
        };

        if (event.tag == "important-thing") {
            event.waitUntil(
                doImportantThing().catch(error => {
                    if (event.lastChance) self.registration.showNotification("Important thing failed!");
                    throw error;
                })
            );
        }
    } catch (error) {
        console.error(error);
    }
}, false);

self.addEventListener("fetch", (event) => {
    try {
        // The string must be one of the audio, audioworklet, embed, frame, iframe,
        // object, paintworklet, report, track, video, or xslt strings,
        // or the empty string, which is the default value.
        const url = new URL(event.request.url),
            patterns = {
                scripts: new RegExp("\\.(js|mjs)$"),
                stylesheets: new RegExp("\\.css$"),
                images: new RegExp("\\.(jpg|jpeg|png|gif|bmp|svg|webp|ico)$"),
                fonts: new RegExp("\\.(woff|woff2|ttf|otf|eot)$"),
                json: new RegExp("\\.json$")
            },
            networkTypes = [
                "style",
                "stylesheet",
                "script",
                "websocket"
            ], cacheTypes = [
                "font",
                "document",
                "manifest",
                "image",
                "png",
                "jpeg",
                "svg+xml",
                "x-icon",
                "worker",
                "sharedworker",
            ];
        if (networkTypes.includes(event.request.destination) ||
            patterns.scripts.test(url.pathname) ||
            patterns.fonts.test(url.pathname)) event.respondWith(cacheThenNetwork(event.request));
        else if (cacheTypes.includes(event.request.destination)) event.respondWith(cacheOnly(event.request));
        else if (event.request.destination === "fetch" || event.request.destination === "") cacheOnly(event.request);
    } catch (error) {
        console.error(error);
    }
}, false);

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
}, false);

self.addEventListener("error", (event) => {
    // The error event has three fields: message, filename, and lineno.
    event.preventDefault();
    console.error(event.message);
}, false);

const doImportantThing = async () => {
    throw Error("Nothing is important!");
};

const addResourceToCache = async (request) => {
    try {
        const fetchedResponse = await fetch(request);
        if (!!fetchedResponse && !!fetchedResponse.ok) {
            const responseClone = fetchedResponse.clone();
            const cache = await caches.open(cacheName);
            await cache.put(request, responseClone);
            return fetchedResponse;
        } else return Response.error();
    } catch (error) {
        if (error.name === "QuotaExceededError") deleteOldCaches(cacheName);
        console.error(error);
    }
}

const addResourcesToCache = async () => {
    try {
        const cache = await caches.open(cacheName);
        await cache.addAll(cacheAssets);
    } catch (error) {
        if (error.name === "QuotaExceededError") deleteOldCaches(cacheName);
        console.error(error);
    }
};

const doInit = async () => {
    console.log("doInit();");
};

const doShutdown = async () => {
    console.log("doShutdown();");
};

// Cache falling back to network
const cacheThenNetwork = async (request) => {
    try {
        const cachedResponse = await caches.match(request, { cacheName: cacheName });
        if (!!cachedResponse && !!cachedResponse.ok) return cachedResponse;
        else await addResourceToCache(request);
        return await cacheOnly(request);
    } catch (error) {
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