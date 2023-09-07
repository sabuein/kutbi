// Service worker: A client side proxy written in JavaScript
// https://www.w3.org/TR/service-workers/

const patterns = {
    scripts: "\.(js|mjs)$",
    stylesheets: "\.css$",
    images: "\.(jpg|jpeg|png|gif|bmp|svg|webp|ico)$",
    fonts: "\.(woff|woff2|ttf|otf|eot)$",
    json: "\.json$"
};

const precache = [
    "./",
    "./authors.html",
    "./change-password.html",
    "./cookies.html",
    "./faq.html",
    "./features.html",
    "./index.html",
    "./kutbi.webmanifest",
    "./login.html",
    "./mobile.html",
    "./purpose.html",
    "./recover.html",
    "./register.html",
    "./sitemap.xml",
    "./wishlist.html",
    "./worker.js",
    "./assets/",
    "./assets/css/",
    "./assets/css/layout.css",
    "./assets/fonts/",
    "./assets/images/",
    "./assets/js/",
    "./assets/js/app.mjs",
    "./assets/js/modules/apis.mjs",
    "./assets/js/modules/auth.mjs",
    "./assets/js/modules/data.mjs",
    "./assets/js/modules/helpers.mjs",
    "./assets/js/modules/interface.mjs",
    "./assets/js/modules/monitor.mjs",
    "./assets/js/modules/objects.mjs",
    "./assets/js/modules/requests.mjs"
];

self.addEventListener("install", (event) => {
    try {
        // Setting up caches, offline assets, populating an IndexedDB, etc.
        event.waitUntil(
            caches.open("v1")
                .then(cache => cache.addAll(precache))
                .then(self.skipWaiting())
        );

        const worker = new Worker("worker.js");
        console.log("A web worker is here!");
        worker.onmessage = (event) => console.log(event.data);
        worker.postMessage([5, 3]);
    } catch (error) {
        console.error(error);
    }
});


self.addEventListener("activate", (event) => {
    // Clean up resources used in previous versions of the service worker
    const cacheAllowlist = ["v1"];
    event.waitUntil(
        caches.forEach((cache, cacheName) => {
            if (!cacheAllowlist.includes(cache)) {
                return caches.delete(cacheName);
            }
        }).then(() => self.clients.claim())
        // Clients loaded in the same scope do not need to be reloaded before their fetches will go through this service worker
    );
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
        console.dir(properties);
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
        console.log(properties);

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
            if (url.pathname.includes(".mjs")) event.respondWith(cacheThenNetwork(event.request));
            else event.respondWith(cacheOnly(event.request));
        }
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

        console.dir(event);
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
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log("Found response in cache:", cachedResponse);
            return cachedResponse;
        }
        console.log("Falling back to network");
        return fetch(request);
    } catch (error) {
        console.error(error);
    }
};

// Cache only
const cacheOnly = async (request) => {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log("Found response in cache:", cachedResponse);
            return cachedResponse;
        } else {
            return Response.error();
        }
    } catch (error) {
        console.error(error);
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