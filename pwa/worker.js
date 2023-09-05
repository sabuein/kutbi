onmessage = (e) => {
    const [a, b] = e.data;
    postMessage(a + b);
};