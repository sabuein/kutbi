"use strict";

// worker.mjs

// Module scripts don't support importScripts().
// importScripts(); /* imports nothing */

self.addEventListener("message", (event) => {
    /*
    console.log("@worker:~$ A message received from main script...");
    console.log("@worker:~$ Identifying the message...");
    console.log("@worker:~$ Now posting a message back to main script...");
    */
    if (event.data === "terminate") return;
    const [a, b] = event.data;
    self.postMessage(`@worker:~$ The answer is ${a + b}, right? :-)`);
});

self.addEventListener("error", (event) => {
    // The error event has three fields: message, filename, and lineno.
    event.preventDefault();
    console.error(event.message);
});