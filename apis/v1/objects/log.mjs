"use strict";

const timestamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export default class Log {

    static #total = 0;

    #index;
    #method;
    #endpoint;
    #ip;
    #time;
    #referrer;
    
    constructor (object) {
        if (!!object && object instanceof Object && !!Object.keys(object).length) {
            this.#index = ++Log.#total;
            const { method, protocol, hostname, originalUrl, socket, header, referrer } = object;
            this.#method = method;
            this.#endpoint = `${protocol}://${hostname}${originalUrl}`;
            this.#ip = socket.remoteAddress || header("x-forwarded-for");
            // this.#time = new Date().toString();
            this.#time = timestamp();
            this.#referrer = (!!referrer) ? referrer : "/";
        } else {
            throw Error(`Sorry, couldn't create ${this.constructor.name}.`);
        }
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