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
    request.details = {
        endpoint: `${request.protocol}://${request.hostname}${request.originalUrl}`,
        ip: request.header("x-forwarded-for") || request.socket.remoteAddress,
        time: new Date().toString(),
        referer: request.get("referrer") || "none"
    };
    console.log(request.details);
    next();
};

const idLogger = (request, response, next, id) => {
    console.log(`ID: ${id}`);
    next();
};

const timestamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export { mainLogger, idLogger, timestamp };