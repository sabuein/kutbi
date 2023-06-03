"use strict";

const mainLogger = (request, response, next) => {
    console.log(`Request: ${request.url}`);
    console.log(`Referer: ${request.get("Referrer")}`);
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