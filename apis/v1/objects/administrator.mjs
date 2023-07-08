"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection
} from "../modules/data.mjs";
import Member from "./member.mjs";

export default class Administrator extends Member {

    #editsCount = null;
    #deletionCount = null;

    static _total = 0;

    static get total() {
        return Administrator._total.toString();
    }

    constructor(object) {
        if (!!object && object instanceof Object && !!Object.keys(object).length) {
            Administrator._total++;
            super(object);
            this.#editsCount = 0;
            this.#deletionCount = 0;
            // Additional properties can be added here
        } else {
            throw Error(`Sorry, couldn't create ${this.constructor.name}.`);
        }
    }

    get editsCount() {
        return this.#editsCount;
    }

    set editsCount(value) {
        if (typeof value !== "number" || !parseInt(value)) throw new TypeError("Edits count is invalid");
        this.#editsCount = value;
    }

    get deletionCount() {
        return this.#deletionCount;
    }

    set deletionCount(value) {
        if (typeof value !== "number" || !parseInt(value)) throw new TypeError("Deletion count is invalid");
        this.#deletionCount = value;
    }

    toString() {
        const adminship = {
            editsCount: this.editsCount,
            deletionCount: this.deletionCount
        };
        return ({
            ...super.toString(),
            ...adminship
        });
    }
};