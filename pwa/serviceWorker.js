// Service worker: A client side proxy written in JavaScript
// https://www.w3.org/TR/service-workers/

const cacheVersion = 1;
const cacheName = `kutbi-${cacheVersion}`;

const patterns = {
    scripts: "\.(js|mjs)$",
    stylesheets: "\.css$",
    images: "\.(jpg|jpeg|png|gif|bmp|svg|webp|ico)$",
    fonts: "\.(woff|woff2|ttf|otf|eot)$",
    json: "\.json$"
};

const cacheList = [
    "/pwa/",
    "/pwa/authors.html",
    "/pwa/change-password.html",
    "/pwa/cookies.html",
    "/pwa/faq.html",
    "/pwa/features.html",
    "/pwa/index.html",
    "/pwa/kutbi.webmanifest",
    "/pwa/login.html",
    "/pwa/mobile.html",
    "/pwa/purpose.html",
    "/pwa/recover.html",
    "/pwa/register.html",
    "/pwa/sitemap.xml",
    "/pwa/wishlist.html",
    "/pwa/assets/css/layout.css",
    "/pwa/assets/fonts/CircularXXWeb-Book.woff2",
    "/pwa/assets/js/app.js",
    "/pwa/assets/js/modules/apis.mjs",
    "/pwa/assets/js/modules/auth.mjs",
    "/pwa/assets/js/modules/data.mjs",
    "/pwa/assets/js/modules/helpers.mjs",
    "/pwa/assets/js/modules/interface.mjs",
    "/pwa/assets/js/modules/monitor.mjs",
    "/pwa/assets/js/modules/objects.mjs",
    "/pwa/assets/js/modules/requests.mjs",
    "/pwa/assets/images/add.png",
    "/pwa/assets/images/apple-touch-icon.png",
    "/pwa/assets/images/favicon-16x16.png",
    "/pwa/assets/images/favicon-32x32.png",
    "/pwa/assets/images/favicon.ico",
    "/pwa/assets/images/screenshot1.png",
    "/pwa/assets/images/screenshot2.jpg",
    "/pwa/assets/images/android/android-launchericon-144-144.png",
    "/pwa/assets/images/svg/books.svg"
];

self.addEventListener("install", (event) => {
    try {
        // Setting up caches, offline assets, populating an IndexedDB, etc.
        event.waitUntil(
            caches.open(cacheName)
                .then(cache => cache.addAll(cacheList))
                .then(self.skipWaiting())
        );
    } catch (error) {
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
        // event is an ExtendableMessageEvent object
        const properties = {
            data: event.data,
            origin: event.origin,
            lastEventId: event.lastEventId,
            source: event.source,
            ports: event.ports
        };
        console.log(`The client sent me a message: ${event.data}`);
        event.source.postMessage("Hi client");
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
        console.log(`Handling fetch event for ${url}`);
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
    }
}, false);

const doInit = () => {
    console.log("doInit();");
};

const doShutdown = () => {
    console.log("doShutdown()");
};

// Cache falling back to network
const cacheThenNetwork = async (request) => {
    try {
        const cachedResponse = await caches.match(request, { cacheName: cacheName });
        if (!!cachedResponse) {
            console.log("Found response in cache:", cachedResponse);
            return cachedResponse;
        } else {
            console.log("Falling back to network");
            console.log(request);
            const fetchedResponse = await fetch(request);
            if (!!fetchedResponse) {
                const responseClone = fetchedResponse.clone();
                await caches.open(cacheName).put(request, responseClone);
                return await cacheOnly(request) || await fetch(request);
            }
        }
    } catch (error) {
        console.error(error);
        // () => caches.match("/pwa/assets/images/error.jpg");
    }
};

// Cache only
const cacheOnly = async (request) => {
    try {
        const cachedResponse = await caches.match(request, { cacheName: cacheName });
        if (!!cachedResponse) {
            console.log("Found response in cache:", cachedResponse);
            return cachedResponse;
        } // else Response.error();
    } catch (error) {
        console.error(error);
        // () => caches.match("/pwa/assets/images/error.jpg");
    }
};

const deleteOldCaches = async (currentCache) => {
    const keys = await caches.keys();
    for (const key of keys) {
        const isOurCache = key.startsWith("kutbi-");
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