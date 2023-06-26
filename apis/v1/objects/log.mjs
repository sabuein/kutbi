"use strict";

export default class Log {

    static #total = 0;

    #index;
    #method;
    #endpoint;
    #ip;
    #time;
    #referrer;
    
    constructor (request) {
        this.#index = ++Log.#total;
        this.#method = request.method;
        this.#endpoint = `${request.protocol}://${request.hostname}${request.originalUrl}`;
        this.#ip = request.socket.remoteAddress || request.header("x-forwarded-for");
        this.#time = new Date().toString();
        this.#referrer = request.get("referrer") || "none";
    }

    get index() {
        return this.#index;
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