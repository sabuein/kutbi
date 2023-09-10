"use strict";

import { id, qs } from "helpers";

/*
HTML5 APIs
- HTML Geolocation API  https://www.w3schools.com/html/html5_geolocation.asp
- HTML Drag and Drop API    https://www.w3schools.com/html/html5_draganddrop.asp
- HTML Web Storage API  https://www.w3schools.com/html/html5_webstorage.asp
- HTML Web Workers API  https://www.w3schools.com/html/html5_webworkers.asp
- HTML SSE API  https://www.w3schools.com/html/html5_serversentevents.asp
*/

const showPosition = (position) => ({ "latitude": position.coords.latitude, "longitude": position.coords.longitude });

const watchPosition = () => {
    try {
        if (window.navigator.geolocation) return window.navigator.geolocation.watchPosition(showPosition);
    } catch (error) {
        console.error(showGeoError(error));
        throw Error("Geolocation is not supported by this browser");
    }
};

const currentPosition = () => {
    try {
        if (window.navigator.geolocation) return window.navigator.geolocation.getCurrentPosition(showPosition);
    } catch (error) {
        console.error(showGeoError(error));
        throw Error("Geolocation is not supported by this browser");
    }
};

const showGeoError = (error) => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return ({ error: "User denied the request for Geolocation" });
        case error.POSITION_UNAVAILABLE:
            return ({ error: "Location information is unavailable" });
        case error.TIMEOUT:
            return ({ error: "The request to get user location timed out" });
        case error.UNKNOWN_ERROR:
            return ({ error: "An unknown error occurred" });
    }
};

const geoPosition = () => ({ watch: watchPosition(), current: currentPosition() });

/*
const encodeObjectToString = (object) => btoa(JSON.stringify(object));
const decodeStringToObject = (string) => JSON.parse(atob(string));
*/

const local = (operation, key = null, string = null) => {
    // Stores data with no expiration date
    try {
        if (!window.localStorage && typeof (Storage) !== "undefined") throw Error("Web Storage is not supported by this browser.");
        let returnValue = null;
        switch (operation) {
            // Create, Read, Update, Delete, and Reset 
            case "create":
                if (window.localStorage.getItem(key)) local("delete", key);
                // console.log(`@kutbi:~$ A record titled "${key}" has been saved to the local storage.`);
                return window.localStorage.setItem(key, string);
            case "read":
                if (!window.localStorage.getItem(key)) return console.log(`@kutbi:~$ There is no record titled "${key}" in the local storage.`);
                // console.log(`@kutbi:~$ A record titled "${key}" has been read from the local storage.`);
                return window.localStorage.getItem(key);
            case "update":
                // console.log(`@kutbi:~$ A record titled "${key}" has been updated in the local storage.`);
                return window.localStorage.setItem(key, string);
            case "delete":
                if (local("read", key)) {
                    // console.log(`@kutbi:~$ A record titled "${key}" has been deleted from the local storage.`);
                    return window.localStorage.removeItem(key);
                }
                break;
            case "reset":
                // console.log(`@kutbi:~$ Your local storage has been resetted successfully.`);
                return window.localStorage.clear();
        }
    } catch (error) {
        console.error(error);
        throw Error(`@kutbi:~/functions$ local() has a problem.`);
    }
};

const session = (operation, key, string) => {
    // Data is lost when the browser tab is closed
    try {
        if (!window.sessionStorage) return null;
        switch (operation) {
            // Create, Read, Update, Delete, and Reset 
            case "create":
                window.sessionStorage.setItem(key, string);
                break;
            case "read":
                return window.sessionStorage.getItem(key);
            case "update":
                window.sessionStorage.setItem(key, string);
                break;
            case "delete":
                window.sessionStorage.removeItem(key);
                break;
            case "reset":
                window.sessionStorage.clear();
                break;
            default:
                console.log("The client session storage has been updated")
                break;
        }
    } catch (error) {
        console.error(error);
        throw Error("storage::session() has a problem");
    }
};

// IndexedDB

const openConnection = (operation) => {
    try {
        if (!window.indexedDB) return null;
        const connection = window.indexedDB.open(databaseName, version);
        let options = { keyPath: "id" }, storeName = "posts";
        db.createObjectStore(storeName, options);
        const transaction = db.transaction(["posts"], "readwrite");
        const store = transaction.objectStore(storeName);
        switch (operation) {
            // Create, Read, Update, Delete, and Reset
            case "create":
                store.add({ id: 1, title: "My First Post" });
                break;
            case "read":
                const getRequest = store.get(1);
                getRequest.onsuccess = function (event) {
                    const post = event.target.result;
                    return post;
                };
                break;
            case "update":
                const updateRequest = store.put({ id: 1, title: "Updated Post" });
                break;
            case "delete":
                const deleteRequest = store.delete(1);
                break;
            case "reset":
                console.log("TODO: reset.indexeddb");
                break;
            default:
                console.log("The client indexedDB has been updated")
                break;
        }
    } catch (error) {
        console.error(error);
        throw Error("storage::session() has a problem");
    }
};

const registerWorker = async (scriptURL, options = null) => {
    try {
        if (!window.Worker) throw Error("@kutbi:~$ Workers are not supported!");
        // Create a dedicated worker
        let myWorker;
        if (!!options) myWorker = new Worker(scriptURL, options);
        else myWorker = new Worker(scriptURL, { type: "module" });

        console.log("@kutbi:~$ Worker registration succeeded!");
        console.log("@kutbi:~$ A test message posted to worker: Add 5 to 3...");

        myWorker.postMessage([5, 3]);

        myWorker.addEventListener("message", (event) => {
            console.log("@kutbi:~$ Message received from worker...");
            console.log(event.data);
        });
        // Terminate the dedicated worker
        myWorker.postMessage("terminate");
        const killWorkerThread = () => myWorker.terminate();
    } catch (error) {
        console.error(error);
    }
};

const registerServiceWorker = async (scriptURL, options = null) => {
    try {
        if (!"serviceWorker" in window.navigator) throw Error("@kutbi:~$ Service workers are not supported!");
        if (!window.navigator.serviceWorker.controller) {
            // Create a service worker
            let registration;
            if (!!options) registration = await window.navigator.serviceWorker.register(scriptURL, options);
            else registration = await window.navigator.serviceWorker.register(scriptURL, {
                // Only use scope when you need a scope that is narrower than the default { scope: "./" }
                scope: "/pwa/",
                type: "module"
            });

            if (registration.installing) console.log("@kutbi:~$ Service worker installing...");
            else if (registration.waiting) console.log("@kutbi:~$ Service worker installed...");
            else if (registration.active) console.log("@kutbi:~$ Service worker active...");

            const worker = await window.navigator.serviceWorker.ready;
            if (!!worker) {
                console.log(`@kutbi:~$ Service worker registration succeeded: ${worker.active.state}...`);
                postMessageSW("@kutbi:~$ Welcome aboard, service worker!");
                worker.addEventListener("message", (event) => {
                    console.log("@kutbi:~$ Message received from serviceWorker...");
                    console.log(event.data);
                });
                const optionsX = { tag: "user_alerts" };
                worker.getNotifications(optionsX).then((notifications) => {
                    // do something with your notifications
                    console.log(notifications);
                });
            }
        }
        return window.navigator.serviceWorker.controller;
    } catch (error) {
        console.error(error);
        console.log(`@kutbi:~$ Service worker registration failed.`);
    }
};

const unregisterServiceWorker = async () => {
    try {
        if (!"serviceWorker" in window.navigator) throw Error("@kutbi:~$ Service workers are not supported.");
        const registrations = await window.navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) registration.unregister();
        console.log(`@kutbi:~$ Service worker unregistration succeeded.`);
    } catch (error) {
        console.error(error);
        console.log(`@kutbi:~$ Service worker unregistration failed.`);
    }
};

const registerSharedWorker = async (scriptURL, options = null) => {
    try {
        if (!window.SharedWorker) throw Error("@kutbi:~$ Shared workers are not supported.");
        // Create a shared worker
        let mySharedWorker;
        if (!!options) mySharedWorker = new SharedWorker(scriptURL, options);
        else mySharedWorker = new SharedWorker(scriptURL, { type: "module" });

        if (!!mySharedWorker) {
            mySharedWorker.port.start();
            console.log("@kutbi:~$ Shared worker registration succeeded and port started!");
            mySharedWorker.port.postMessage([5, 3]);
            console.log("@kutbi:~$ A test message posted to shared worker: Add 5 to 3...");
            mySharedWorker.port.addEventListener("message", (event) => {
                console.log("@kutbi:~$ Message received from shared worker...");
                console.log(event.data);
            });
        }
        // Terminate the shared worker
        mySharedWorker.port.postMessage("terminate");
        const killWorkerThread = () => mySharedWorker.terminate();
    } catch (error) {
        console.error(error);
    }
};

const postMessageSW = (message) => {
    try {
        window.navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage(message);
        });
    } catch (error) {
        console.error(error);
    }
};

const urlBase64ToUint8Array = (base64String) => {
    try {
        const padding = "=".repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
        return outputArray;
    } catch (error) {
        console.error(error);
    }
}

const setPushSubscription = async () => {
    // Learn more https://web.dev/push-notifications-subscribing-a-user/
    try {
        if (!("PushManager" in window)) throw Error("@kutbi:~$ Push is not supported on this browser.");
        // Use serviceWorker.ready to ensure that you can subscribe for push
        const serviceWorkerRegistration = await navigator.serviceWorker.ready;

        const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array("BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U")
        };

        setPushSubscriptionButton(serviceWorkerRegistration, subscribeOptions);
        const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe(subscribeOptions);
        // The push subscription details needed by the application
        // server are now available, and can be sent to it using,
        // for example, an XMLHttpRequest.
        // console.log(pushSubscription.endpoint);
        // console.log(JSON.stringify(pushSubscription, null, 2));
        if (!!pushSubscription) return pushSubscription;
        else if (pushSubscription !== "granted") throw new Error("@kutbi:~$ Push did not granted permission.");;
    } catch (error) {
        console.error(error);
    }
};

const setPushSubscriptionButton = (serviceWorkerRegistration, subscribeOptions) => {
    try {
        const subscribeButton = id("subscribe");
        if (!!subscribeButton) {
            subscribeButton.addEventListener("click", async () => {
                const pushSubscriptionX = await serviceWorkerRegistration.pushManager.subscribe(subscribeOptions);
                if (!!pushSubscriptionX) {
                    // handle subscription
                    console.dir(pushSubscriptionX);
                    subscribeButton.style.dispaly = "none";
                    console.log(JSON.stringify(pushSubscriptionX, null, 2));
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
}

const setNotification = () => {
    try {
        // Notification API
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification("Hi there!", {
                    body: "Notification body",
                    icon: "https://tapajyoti-bose.vercel.app/img/logo.png",
                });
            }
        });

        Notification.requestPermission().then((result) => {
            if (result === "granted") {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification("Vibration Sample", {
                  body: "Buzz! Buzz!",
                  icon: "../images/touch/chrome-touch-icon-192x192.png",
                  vibrate: [200, 100, 200, 100, 200, 100, 200],
                  tag: "vibration-sample",
                });
              });
            }
          });
    } catch (error) {
        console.error(error);
    }
};

const setGeoLocation = () => {
    try {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === "granted") {
                // now you can use geolocation api
                navigator.geolocation.getCurrentPosition(({ coords }) => {
                    console.log(coords.latitude, coords.longitude);
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
};

const setSpeechSynthesis = () => {
    try {
        // Speech Synthesis
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance("Hello World");
        synth.speak(utterance);
    } catch (error) {
        console.error(error);
    }
};

const setSpeechRecognition = () => {
    try {
        if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
            // Speech Recognition is supported
        }
        // Speech Recognition
        const SpeechRecognition =
            window.SpeechRecognition ?? window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.start();
        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            console.log(speechToText);
        };
    } catch (error) {
        console.error(error);
    }
};

const setWebShare = () => {
    try {
        // Web Share API
        const shareHandler = async () => {
            navigator.share({
                title: "Tapajyoti Bose | Portfolio",
                text: "Check out my website",
                url: "https://tapajyoti-bose.vercel.app/",
            });
        };
    } catch (error) {
        console.error(error);
    }
};

const setScreenCapture = () => {
    try {
        // Screen Capture API
        /* HTML
        <video id="preview" autoplay>
        Your browser doesn't support HTML5.
      </video>
      <button id="start" class="btn">Start</button>
        */
        const previewElem = document.getElementById("preview");
        const startBtn = document.getElementById("start");

        const startRecording = async () => {
            previewElem.srcObject =
                await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true,
                });
        };

        startBtn.addEventListener("click", startRecording);
    } catch (error) {
        console.error(error);
    }
};

const setClipboard = () => {
    try {
        // Clipboard API
        async function copyHandler() {
            const text = "https://tapajyoti-bose.vercel.app/";
            navigator.clipboard.writeText(text);
        }
    } catch (error) {
        console.error(error);
    }
};

const setFullscreen = () => {
    try {
        // Fullscreen API
        const enterFullscreen = async () => {
            await document.documentElement.requestFullscreen();
        };

        const exitFullscreen = async () => {
            await document.exitFullscreen();
        };
    } catch (error) {
        console.error(error);
    }
};

const screenWakeLock = () => {
    try {
        // Screen Wake Lock API
        let wakeLock = null;

        const lockHandler = async () => {
            wakeLock = await navigator.wakeLock.request("screen");
        };

        const releaseHandler = async () => {
            await wakeLock.release();
            wakeLock = null;
        };
    } catch (error) {
        console.error(error);
    }
};

const screenOrientation = () => {
    // Screen Orientation API
    try {
        const lockHandler = async () => {
            await screen.orientation.lock("portrait");
        };

        const releaseHandler = () => {
            screen.orientation.unlock();
        };

        const getOrientation = () => {
            return screen.orientation.type;
        };
    } catch (error) {
        console.error(error);
    }
};

export {
    local,
    session,
    geoPosition,
    registerWorker,
    registerServiceWorker,
    unregisterServiceWorker,
    registerSharedWorker,
    setPushSubscription
};