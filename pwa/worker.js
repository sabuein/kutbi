"use strict";

self.onmessage = (event) => {
    const [a, b] = event.data;
    self.postMessage(a + b);
};