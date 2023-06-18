"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection,
    Subscriber
} from "./register.mjs";

export default class User extends Subscriber {

    #commentNotifications = null;
    #mentionNotifications = null;

    static total = 0;
    
    constructor(data) {
        User.total++;
        super(data);
        this.#commentNotifications = true;
        this.#mentionNotifications = true;
        // Additional properties can be added here
    }

    static get total() {
        return User.total.toString();
    }

    async publish() {
        console.log({"todo": "User publish();" });
    }

    toString() {
        const details = {
            commentNotifications: this.#commentNotifications,
            mentionNotifications: this.#mentionNotifications
        };
        return ({
            ...super.toString(),
            ...details
        });
    }
};