"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection
} from "../modules/data.mjs";
import User from "./user.mjs";

export default class Member extends User {

    // Browse, Read, Edit, Add

    #postsCount = null;

    static _total = 0;

    static get total() {
        return Visitor._total.toString();
    }

    constructor(object) {
        if (!!object && object instanceof Object && !!Object.keys(object).length) {
            Member._total++;
            super(object);
            this.#postsCount = 0;
            // Additional properties can be added here
        } else {
            throw Error(`Sorry, couldn't create ${this.constructor.name}.`);
        }
    }

    get postCount() {
        return this.#postsCount;
    }

    set postCount(value) {
        if (typeof value !== "number" || !parseInt(value)) throw new TypeError("Post count is invalid");
        this.#postsCount = value;
    }

    toString() {
        const membership = { postsCount: this.postsCount };
        return ({
            ...super.toString(),
            ...membership
        });
    }
};