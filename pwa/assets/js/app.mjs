"use strict";

import { id, qs } from "helpers";
import { getAllAuthors } from "data";
import { parseGetSubmit, handleFormSubmit } from "requests";
import { updateImageDisplay, updateAuthorDisplay } from "interface";

// const submission = "http://127.0.0.1:5500/public/subscribe.html?email=Sarah.McFarlane%40vubiquity.co.uk&confirmEmail=sabuein%40gmail.com&preferences=authors&preferences=books&preferences=publishers&preferences=reviews&preferences=all&frequency=monthly&format=text&solution=99999#main-content";

document.addEventListener("DOMContentLoaded", () => {
    const subscribeForm = id("subscribeForm"), loginForm = id("loginForm");
    if (subscribeForm) parseGetSubmit(subscribeForm);
    if (loginForm) handleFormSubmit(loginForm);

    // http://localhost:3558/tokens/csrf
    // http://localhost:3558/users/signup
});

if ("serviceWorker" in navigator) {
    // declaring scope manually
    navigator.serviceWorker.register("/pwa/serviceWorker.js", { scope: "./" }).then(
        (registration) => {
            console.log("Service worker registration succeeded:", registration);
            //doMagic();
        },
        (error) => {
            console.error(`Service worker registration failed: ${error}`);
        }
    );
} else {
    console.error("Service workers are not supported.");
}

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