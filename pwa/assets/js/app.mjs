"use strict";

import { id, qs } from "helpers";
import { getAllAuthors } from "data";
import { handleGetForm, handleFormsWithBody } from "requests";
import { updateImageDisplay, updateAuthorDisplay } from "interface";
import { Account, loadAccount } from "objects";
import { registerServiceWorker, unregisterServiceWorker } from "apis";

// import { position } from "apis";

// const submission = "http://127.0.0.1:5500/public/subscribe.html?email=Sarah.McFarlane%40vubiquity.co.uk&confirmEmail=sabuein%40gmail.com&preferences=authors&preferences=books&preferences=publishers&preferences=reviews&preferences=all&frequency=monthly&format=text&solution=99999#main-content";

document.addEventListener("DOMContentLoaded", async () => {
    registerServiceWorker()
    const user = await loadAccount();
    try {
        if (user === "Anonymous") throw Error("@kutbi:~$ Hello, Anonymous. You need to sign in.");
        if (user && user.account) console.log(`@kutbi:~$ Welcome back, ${user.account.username}.`);
    } catch (error) {
        console.error(error);
    } finally {
        if (user && user.loggen === "1") console.log(JSON.stringify(user, null, 2));
        else if (user) console.log(JSON.stringify({ "Browsing activity since last login": user.loggen }, null, 2));
    }

    if (!window.localStorage.getItem("hello")) {
        window.localStorage.setItem("hello", "world!");
        console.log("True: New local has been created.");
    } else {
        console.log(`False: Same old local. Hello, ${window.localStorage.getItem("hello")}`);
    }

    if (!window.sessionStorage.getItem("hello")) {
        window.sessionStorage.setItem("hello", "world!");
        console.log("True: New session has been created.");
    } else {
        console.log(`False: Same old session. Hello, ${window.sessionStorage.getItem("hello")}`);
    }
    
    const resetStorage = id("resetStorage");
    if (resetStorage) {
        try {
            resetStorage.addEventListener("click", (event) => {
                // Some constraints
                if (!event.isTrusted) throw Error(`The form submission is not trusted.`);
                event.preventDefault();
                event.stopImmediatePropagation();
                window.localStorage.clear();
                window.sessionStorage.clear();
                console.log("Site data cleared.");
                unregisterServiceWorker();
                return window.location.reload();
            });
        } catch (error) {
            console.error(error);
        }
    }

    const registerForm = id("registerForm"), loginForm = id("loginForm");
    if (registerForm) registerForm.addEventListener("submit", await handleFormsWithBody, false);
    if (loginForm) loginForm.addEventListener("submit", await handleFormsWithBody, false);

    const updateMe = id("updateBtn");
    const showHere = id("updateTxt");
    // if (updateMe) updateMe.addEventListener("click", updateButton(e, showHere), false);

    // http://localhost:3558/tokens/csrf
    // http://localhost:3558/users/signup

    /*let x = new position();
    console.log(x.watch());
    console.log(x.current());*/
});

// const xo = await getAllAuthors();
// console.log(JSON.stringify(xo, null, 3));

// Update the author avatar preview
const avatar = id("author-avatar"), preview = id("avatar-preview");
if (avatar) avatar.addEventListener("change", (e) => updateImageDisplay(e.target, preview), false);

const authorDialog = id("addUpdateAuthorDialog"), dialogBtn = id("addUpdateAuthorButton");
if (authorDialog && dialogBtn) dialogBtn.addEventListener("click", (e) => authorDialog.showModal(), false);

const authors = id("displayAuthors");
if (authors) updateAuthorDisplay(authors);

const progressBar = qs(".reading-bar");
if (progressBar) requestAnimationFrame(updateProgress);

function updateProgress() {
    try {
        const totalHeight = document.body.clientHeight;
        const windowHeight = document.documentElement.clientHeight;
        const position = window.scrollY;
        const progress = position / (totalHeight - windowHeight) * 100;
        progressBar.setAttribute("value", progress);
        requestAnimationFrame(updateProgress);
    } catch (error) {
        console.log(error);
    }
}

const myMenu = qs('ul[role="menu"]'),
    myButton = qs("button#menuToggle");

if (myMenu && myButton) {
    myMenu.addEventListener("click", (event) => {
        if (!event) {
            window.event.cancelBubble = true;
        } else {
            event.stopPropagation();
            // event.stopImmediatePropagation();
        }

        if (myMenu.classList.contains("toggled")) {
            myMenu.classList.remove("toggled");
            myButton.style.rotate = "none";
        }
    });
}