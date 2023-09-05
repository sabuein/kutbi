console.log("Service worker is here!");

const worker = new Worker("worker.js");
worker.onmessage = (e) => console.log(e.data);
worker.postMessage([5, 3]);