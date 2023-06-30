"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection
} from "../modules/data.mjs";
import Subscriber from "./subscriber.mjs";

export default class User extends Subscriber {

    static _total = 0;

    static get total() {
        return User._total.toString();;
    }

    #activity = [];
    #commentNotifications = null;
    #mentionNotifications = null;

    constructor(object) {
        super(object);
        User._total++;
        const { activity, commentNotifications, mentionNotifications } = object;
        if (!!activity && activity instanceof Array && activity.length > 0) this.#activity = activity;
        if (!!commentNotifications && typeof commentNotifications !== "boolean") this.#commentNotifications = commentNotifications;
        if (!!mentionNotifications && typeof mentionNotifications !== "boolean") this.#mentionNotifications = mentionNotifications;
        this.addActivity(`The ${this.type} has been instantiated successfully.`);
    }
    
    static _findQuery() {
        return `
        SELECT u.subscriptionType "type", u.uuid "guid", u.username, u.email, s.salt, s.passwordHash
        FROM Users u
        LEFT JOIN UserPasswords s ON u.id = s.userId
        WHERE u.username = ? OR u.email = ?
        `;
    }
  
    static _populateQuery() {
        return `
        SELECT u.subscriptionType "type", u.uuid "guid", u.username, u.firstName, u.lastName, u.fullName, u.bio, u.dob, u.lang, u.tel, u.country, u.email, u.github, u.twitter, u.facebook, u.instagram, u.youtube, u.website, u.photoUrl, u.coverImage, u.personalUrl, u.createdAt, u.updatedAt, u.lastSeen, u.accessibility, u.activeStatus, u.newRecord, u.commentNotifications, u.mentionNotifications, r.roles, p.permissions
        FROM Users u
        LEFT JOIN UserPasswords s ON u.id = s.userId
        LEFT JOIN UserRoles r ON u.id = r.userId
        LEFT JOIN UserPermissions p ON u.id = p.userId
        WHERE u.uuid = ?
        `;
    }

    _accountQuery() { return `INSERT INTO Users (username, subscriptionType, email) VALUES (?, ?, ?)`; }
    _passQuery() { return `INSERT INTO UserPasswords (userId, salt, passwordHash) VALUES (?, ?, ?)`; }
    _rolesQuery() { return `INSERT INTO UserRoles (userId, roles) VALUES (?, ?)`; }
    _permQuery() { return `INSERT INTO UserPermissions (userId, permissions) VALUES (?, ?)`; }
    _guidQuery() { return `SELECT uuid "guid" FROM Users WHERE id = ?`; }
    _existingQuery() { return `SELECT uuid "guid" FROM Users WHERE username = ? OR email = ?`; }
    
    async publish() {
        console.log({ "todo": "User publish();" });
    }

    async addActivity(newActivity) {
        this.#activity.push(newActivity);
    }

    get activity() {
        return this.#activity;
    }

    set activity(value) {
        if (!!value && value instanceof Array && value.length > 0) this.#activity = value;
    }

    get commentNotifications() {
        return this.#commentNotifications;
    }

    set commentNotifications(value) {
        this.#commentNotifications = value;
    }

    get mentionNotifications() {
        return this.#mentionNotifications;
    }

    set mentionNotifications(value) {
        this.#mentionNotifications = value;
    }

    toString() {
        const usership = {
            commentNotifications: this.commentNotifications,
            mentionNotifications: this.mentionNotifications
        };
        return ({
            ...super.toString(),
            ...usership
        });
    }
};