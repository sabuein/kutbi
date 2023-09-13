"use strict";

import { id, qs, downloadObject } from "helpers";
import { getAllAuthors, enterAuthorsMatrix } from "data";
import { handleGetForm, handleFormsWithBody, fetchJSON } from "requests";
import {
    updateImageDisplay,
    updateAuthorDisplay,
    loadFonts,
    updateProgress,
} from "interface";
import { Account, loadAccount } from "objects";
import {
    registerWorker,
    registerServiceWorker,
    unregisterServiceWorker,
    registerSharedWorker,
    setPushSubscription
} from "apis";

const thisApp = {
    worker: "/pwa/worker.mjs",
    sharedWorker: "/pwa/sharedWorker.mjs",
    serviceWorker: "/pwa/serviceWorker.mjs",
};

const addMetaToHead = (name, content) => {
    const meta = document.createElement("meta");
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
};

window.addEventListener("load", async () => {
    /*
      addMetaToHead("description", "A way to organise books");
      addMetaToHead("keywords", "HTML, CSS, JavaScript");
      addMetaToHead("author", "Salaheddin AbuEin");
      */

    const worker = await registerWorker(thisApp.worker),
        serviceWorker = await registerServiceWorker(thisApp.serviceWorker),
        sharedWorker = await registerSharedWorker(thisApp.sharedWorker);

    if (!!serviceWorker) {
        console.log("@kutbi:~$ A service worker: a client side proxy written in JavaScript, at your service, my lord!");
        window.navigator.serviceWorker.controller.postMessage("@kutbi:~$ command#1!");
        serviceWorker.postMessage("@kutbi:~$ command#2!");
        window.navigator.serviceWorker.controller.postMessage("@kutbi:~$ command#3!");
        serviceWorker.postMessage("@kutbi:~$ command#4!");
    }

    window.addEventListener("push", (event) => {
        console.log(event.data);
        // From here we can write the data to IndexedDB, send it to any open
        // windows, display a notification, etc.
    });

    loadFonts();
});

document.addEventListener("DOMContentLoaded", async () => {
    const user = await loadAccount();
    try {
        if (user === "Anonymous") throw Error("@kutbi:~$ Hello, Anonymous. You need to sign in.");
        if (!!user && !!user.account) console.log(`@kutbi:~$ Welcome back, ${user.account.username}.`);
    } catch (error) {
        console.error(error);
    } finally {
        if (!!user && user.loggen === "1") console.log(JSON.stringify(user, null, 2));
        else if (!!user) console.log(`Browsing activity since last login: ${user.loggen}.`);
    }

    if (!window.localStorage.getItem("hello")) {
        window.localStorage.setItem("hello", "world!");
        console.log("@kutbi:~$ True: New local has been created.");
    } else console.log(`@kutbi:~$ False: Same old local. Hello, ${window.localStorage.getItem("hello")}`);

    if (!window.sessionStorage.getItem("hello")) {
        window.sessionStorage.setItem("hello", "world!");
        console.log("@kutbi:~$ True: New session has been created.");
    } else console.log(`@kutbi:~$ False: Same old session. Hello, ${window.sessionStorage.getItem("hello")}`);

    const resetStorage = id("resetStorage");
    if (!!resetStorage) {
        try {
            resetStorage.addEventListener("click", (event) => {
                // Some constraints
                if (!event.isTrusted) throw Error(`The form submission is not trusted.`);
                event.preventDefault();
                event.stopImmediatePropagation();
                window.localStorage.clear();
                window.sessionStorage.clear();
                unregisterServiceWorker();
                window.document.cookie = `accessToken=;expires=${new Date(0).toUTCString()};path=/;`;
                window.document.cookie = `refreshToken=;expires=${new Date(0).toUTCString()}; path=/;`;
                console.log("Site data cleared.");
                return window.location.reload(true); // Passed true to force a reload bypassing the cache
            });
        } catch (error) {
            console.error(error);
        }
    }

    const registerForm = id("registerForm"), loginForm = id("loginForm");
    if (!!registerForm) registerForm.addEventListener("submit", await handleFormsWithBody, false);
    if (!!loginForm) loginForm.addEventListener("submit", await handleFormsWithBody, false);

    const updateMe = id("updateBtn"), showHere = id("updateTxt");
    // if (updateMe) updateMe.addEventListener("click", updateButton(e, showHere), false);

    // http://localhost:3558/tokens/csrf
    // http://localhost:3558/users/signup

    /*let x = new position();
      console.log(x.watch());
      console.log(x.current());*/

    // const xo = await getAllAuthors();
    // console.log(JSON.stringify(xo, null, 3));

    // Update the author avatar preview
    const avatar = id("author-avatar"), preview = id("avatar-preview");
    if (!!avatar) avatar.addEventListener("change", (e) => updateImageDisplay(e.target, preview), false);

    const authorDialog = id("addUpdateAuthorDialog"), dialogBtn = id("addUpdateAuthorButton");
    if (!!authorDialog && !!dialogBtn) dialogBtn.addEventListener("click", (e) => authorDialog.showModal(), false);

    const authorMatrix = id("addAuthorMatixButton");
    if (!!authorMatrix) authorMatrix.addEventListener("click", (e) => enterAuthorsMatrix(), false);

    const authors = id("displayAuthors");
    if (!!authors) updateAuthorDisplay(authors);

    const progressBar = qs(".reading-bar");
    if (!!progressBar) requestAnimationFrame(updateProgress);

    const myMenu = qs('ul[role="menu"]'), myButton = qs("button#menuToggle");
    if (!!myMenu && !!myButton) {
        myMenu.addEventListener("click", (event) => {
            if (!event) window.event.cancelBubble = true;
            else event.stopPropagation(); // also, check event.stopImmediatePropagation();

            if (myMenu.classList.contains("toggled")) {
                myMenu.classList.remove("toggled");
                myButton.style.rotate = "none";
            }
        });
    }

    if (window.location.pathname.includes("dashboard.html")) {
        const subscribeButton = qs("button#subscribe");
        setPushSubscription();

        id("downloadThisContent").addEventListener("click", (e) => {
            downloadObject(id("content-area").value, "my-new-file.txt", "text/plain");
        });

        const data = await fetchJSON("/pwa/assets/data/books.json", { method: "get" });
        console.log(JSON.stringify(data, null, 2));
    }
});
