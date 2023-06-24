"use strict";

const Logger = class Logger {

    static #total = 0;

    #index;
    #method;
    #endpoint;
    #ip;
    #time;
    #referrer;
    
    constructor (request) {
        this.#index = ++Logger.#total;
        this.#method = request.method;
        this.#endpoint = `${request.protocol}://${request.hostname}${request.originalUrl}`;
        this.#ip = request.socket.remoteAddress || request.header("x-forwarded-for");
        this.#time = new Date().toString();
        this.#referrer = request.get("referrer") || "none";
    }

    print() {
        return {
            index: this.#index,
            method: this.#method,
            endpoint: this.#endpoint,
            ip: this.#ip,
            time: this.#time,
            referrer: this.#referrer
        };
    }

    toString() {
        return `index: ${this.#index},\r\nmethod: ${this.#method},\r\nendpoint: ${this.#endpoint},\r\nip: ${this.#ip},\r\ntime: ${this.#time},\r\nreferrer: ${this.#referrer}\r\n`;
    }
};

const requests = [];

const mainLogger = (request, response, next) => {
    requests.push(new Logger(request).print());
    console.log((JSON.stringify(requests.slice(-1), null, 2)), "\r\n");
    next();
};

const idLogger = (request, response, next, id) => {
    console.log(`ID: ${id}`);
    next();
};

const timestamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export { mainLogger, idLogger, timestamp };