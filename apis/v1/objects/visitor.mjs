"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection
} from "../modules/data.mjs";

export default class Visitor {

    static _total = 0;

    static get total() {
        return this.constructor._total;
    }

    #subscriptionType = null;
    #firstName = null;
    #lastName = null;
    #fullName = null;
    #dob = null;
    #gender = null;
    #occupation = null;
    #location = null;
    #interests = [];
    
    constructor(object) {
        Visitor._total++;
        const {
            firstName,
            lastName,
            fullName,
            dob,
            gender,
            occupation,
            location,
            interests
        } = object;
        this.#subscriptionType = this.constructor.name.toLowerCase();
        if (!!firstName && typeof firstName === "string") this.#firstName = firstName;
        if (!!lastName && typeof lastName === "string") this.#lastName = lastName;
        if (!!fullName && typeof fullName === "string") this.#fullName = fullName;
        if (!!dob) this.#dob;
        if (!!gender && typeof gender === "string") this.#gender = gender;
        if (!!occupation) this.#occupation = occupation;
        if (!!location) this.#location = location;
        if (!!interests && interests instanceof Array) this.#interests = interests;
    }

    static get total() {
        return Visitor._total.toString();
    }

    get type() {
        return this.#subscriptionType;
    }

    set type(value) {
        if (this.constructor.name.toLowerCase() !== value) throw new TypeError("Account type is invalid");
        this.#subscriptionType = value;
    }

    get firstName() {
        return this.#firstName;
    }

    set firstName(value) {
        /*if (value.length < 0 || value.length > 100) throw new RangeError("First name length is invalid");
        if (typeof value !== "string") throw new TypeError("First name type is invalid");*/
        this.#firstName = value;
    }

    get lastName() {
        return this.#lastName;
    }

    set lastName(value) {
        /*if (value.length < 0 || value.length > 100) throw new RangeError("Last name is invalid");*/
        this.#lastName = value;
    }

    get fullName() {
        return this.#fullName;
    }

    set fullName(value) {
        this.#fullName = value;
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
        return this.#location;
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

    raw() { return ({ type: this.type }); }

    records() { return this.toString(); }

    toString() {
        const visitorship = {
            type: this.type,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName,
            dob: this.dob,
            gender: this.gender,
            occupation: this.occupation,
            location: this.location,
            interests: this.interests
        };
        return ({
            ...visitorship
        });
    }
};