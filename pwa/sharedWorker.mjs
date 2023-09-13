"use strict";

// sharedWorker.mjs

// Module scripts don't support importScripts().
// importScripts(); /* imports nothing */

self.addEventListener("connect", (event) => {
    const port = event.ports[0];

    port.addEventListener("message", (event) => {
        /*
        port.postMessage("@sharedWorker:~$ A message received from main script...");
        port.postMessage("@sharedWorker:~$ Identifying the message...");
        port.postMessage("@sharedWorker:~$ Now posting a message back to main script...");
        */
        if (event.data === "terminate") return;
        const [a, b] = event.data;
        port.postMessage(`@sharedWorker:~$ The answer is ${(a + b)}, right? :-)`);
    });

    // Notify the main thread that the worker is ready
    port.start();
});

self.addEventListener("error", (event) => {
    // The error event has three fields: message, filename, and lineno.
    event.preventDefault();
    console.error(event.message);
});