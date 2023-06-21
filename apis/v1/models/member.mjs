"use strict";

import { User } from "./classes.mjs";

export default class Member extends User {

    // Browse, Read, Edit, Add

    #postsCount = null;

    static _total = 0;

    static get total() {
        return Visitor._total.toString();
    }

    constructor(details) {
        Member._total++;
        super(details);
        this.#postsCount = 0;
        // Additional properties can be added here
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