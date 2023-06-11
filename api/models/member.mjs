"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection,
} from "../modules/data.mjs";

import { User } from "./user.mjs";

const Member = class extends User {

    // Browse, Read, Edit, Add

    #postsCount = null;

    static total = 0;

    static get total() {
        return Member.total.toString();
    }

    constructor() {
        super();
        Member.total++;
        // Additional properties can be added here
    }

    get postCount() {
        return this.#postCount;
    }

    set postCount(value) {
        if (typeof value !== "number" || !parseInt(value)) throw new TypeError("Post count is invalid");
        this.#postCount = value;
    }

    toString() {
        const count = { posts: this.#postsCount };
        return ({
            ...super.toString(),
            ...count
        });
    }
};

export { Member };