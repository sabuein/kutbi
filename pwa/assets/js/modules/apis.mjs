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

const geoPosition = () => {
    return ({ watch: watchPosition(), current: currentPosition() });
};

/*
const encodeObjectToString = (object) => btoa(JSON.stringify(object));
const decodeStringToObject = (string) => JSON.parse(atob(string));
*/

// Stores data with no expiration date
const local = (operation, key = null, string = null) => {
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

// Data is lost when the browser tab is closed
const session = (operation, key, string) => {
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


const registerServiceWorker = async () => {
    try {
        if (!"serviceWorker" in window.navigator) throw Error("@kutbi:~$ Service workers are not supported.");
        if (!window.navigator.serviceWorker.controller) {
            await window.navigator.serviceWorker.register("/pwa/serviceWorker.js", { scope: "./" });
            const worker = await window.navigator.serviceWorker.ready;
            console.log(`@kutbi:~$ Service worker registration succeeded and it has been ${worker.active.state}.`);
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



export { local, session, geoPosition, registerServiceWorker, unregisterServiceWorker };