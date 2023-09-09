"use strict";

importScripts(); /* imports nothing */

self.addEventListener("message", (event) => {
    console.log("Message received from main script");
    const [a, b] = event.data;
    console.log("Posting message back to main script");
    self.postMessage(a + b);
});

self.addEventListener("error", (event) => {
    // The error event has three fields: message, filename, and lineno.
    event.preventDefault();
    console.error(event.message);
});