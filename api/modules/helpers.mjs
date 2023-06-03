"use strict";

const createSecretKey = () => {
    // require("crypto").randomBytes(64).toString("hex");
    let output = "";
    for (let i = 0; i < 128; ++i) {
        output += (Math.floor(Math.random() * 16)).toString(16);
    }
    return output;
};

const mainLogger = (request, response, next) => {
    request.requestTime = new Date().toString();
    console.log(`Endpoint: ${request.url}`);
    console.log(`Referer: ${request.get("Referrer")}`);
    console.log(`Time: ${request.requestTime}`);
    // const completeUrl = req.protocol + "://" + req.hostname + req.originalUrl;
    // console.log(`Complete URL: ${completeUrl}`);
    next();
};

const idLogger = (request, response, next, id) => {
    console.log(`ID: ${id}`);
    next();
};

const timestamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export { mainLogger, idLogger, timestamp };