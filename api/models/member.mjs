"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection,
    User
} from "./register.mjs";

export default class Member extends User {

    // Browse, Read, Edit, Add

    #postsCount = null;

    static total = 0;

    static get total() {
        return Member.total.toString();
    }

    constructor() {
        super();
        this.#postsCount = 0;
        Member.total++;
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
        const count = { posts: this.#postsCount };
        return ({
            ...super.toString(),
            ...count
        });
    }
};