"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection
} from "./register.mjs";

export default class Human {

    #firstName = null;
    #lastName = null;
    #dob = null;
    #gender = null;
    #occupation = null;
    #location = null;
    #interests = [];

    static total = 0;

    static get total() {
        return Human.total.toString();
    }

    constructor() {
        Human.total++;
        // Additional properties can be added here
    }

    get firstName() {
        return this.#firstName;
    }

    set firstName(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("First name length is invalid");
        if (typeof value !== "string") throw new TypeError("First name type is invalid");
        this.#firstName = value;
    }

    get lastName() {
        return this.#firstName;
    }

    set lastName(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("Last name is invalid");
        this.#lastName = value;
    }

    get name() {
        return(`${this.#firstName} ${this.#lastName}`);
    }

    get dob() {
        return this.#dob;
    }

    set dob(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("Date of birth is invalid");
        this.#dob = value;
    }

    get gender() {
        return this.#gender;
    }

    set gender(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("Gender is invalid");
        this.#gender = value;
    }

    get occupation() {
        return this.#occupation;
    }

    set occupation(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("Occupation is invalid");
        this.#occupation = value;
    }

    get location() {
        return this.#firstName;
    }

    set location(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("Location is invalid");
        this.#location = value;
    }

    get interests() {
        // return this.#interests.join(", ");
        return this.#interests;
    }

    set interests(values) {
        if (!Array.isArray(values)) throw new TypeError("Interests type is invalid")
        for (const value of values) if (this.#interests.indexOf(value) == -1) this.#interests.push(value);
    }

    toString() {
        const info = {
            firstName: this.#firstName,
            lastName: this.#lastName,
            name: (this.#firstName && this.#lastName) ? `${this.#firstName} ${this.#lastName}` : null,
            dob: this.#dob,
            gender: this.#gender,
            occupation: this.#occupation,
            location: this.#location,
            interests: this.#interests
        };
        return ({
            ...info
        });
    }
};