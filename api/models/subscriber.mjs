"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection,
    Human
} from "./register.mjs";

export default class Subscriber extends Human {

    #createdAt = null;
    #updatedAt = null;
    #accessibility = null;
    #status = null;
    
    static total = 0;

    static get total() {
        return Subscriber.total.toString();
    }

    constructor() {
        super();
        Subscriber.total++;
        // Additional properties can be added here
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("createdAt length is invalid");
        if (typeof value !== "string") throw new TypeError("createdAt type is invalid");
        this.#createdAt = value;
    }
    
    toString() {
        const subscription = {
            createdAt: this.#createdAt,
            updatedAt: this.#updatedAt,
            accessibility: this.#accessibility,
            status: this.#status
        };
        return ({
            ...super.toString(),
            ...subscription
        });
    }
};