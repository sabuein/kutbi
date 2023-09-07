"use strict";

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


const registerServiceWorker = async (scriptURL, options = null) => {
    try {
        if (!"serviceWorker" in window.navigator) throw Error("@kutbi:~$ Service workers are not supported.");
        if (!window.navigator.serviceWorker.controller) {
            // Only use scope when you need a scope that is narrower than the default { scope: "./" }
            if (!!options) await window.navigator.serviceWorker.register(scriptURL, options);
            else await window.navigator.serviceWorker.register(scriptURL, { type: "module" });
            const worker = await window.navigator.serviceWorker.ready;
            console.log(`@kutbi:~$ Service worker registration succeeded: ${worker.active.state}.`);
        }
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

const postMessageSW = (message) => {
    try {
        window.navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage(message);
          });
    } catch (error) {
        console.error(error);
    }
};

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

export { local, session, geoPosition, registerServiceWorker, unregisterServiceWorker, postMessageSW };