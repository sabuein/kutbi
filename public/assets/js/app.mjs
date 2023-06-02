"use strict";

import { id, qs } from "helpers";
import { getAllAuthors } from "data";
import { updateImageDisplay, updateAuthorDisplay } from "interface";

if ("serviceWorker" in navigator) {
    // declaring scope manually
    navigator.serviceWorker.register("/public/serviceWorker.js", { scope: "./" }).then(
        (registration) => {
            console.log("Service worker registration succeeded:", registration);
        },
        (error) => {
            console.error(`Service worker registration failed: ${error}`);
        }
    );
} else {
    console.error("Service workers are not supported.");
}

const xo = await getAllAuthors();
console.log(JSON.stringify(xo, null, 3));

// Update the author avatar preview
const avatar = id("author-avatar"), preview = id("avatar-preview");
if (avatar) avatar.addEventListener("change", () => updateImageDisplay(avatar, preview));

const authorDialog = id("addUpdateAuthorDialog"), dialogBtn = id("addUpdateAuthorButton");
if (authorDialog && dialogBtn) dialogBtn.addEventListener("click", () => authorDialog.showModal());

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