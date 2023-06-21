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
        // Additional properties can be added here
    }

    static get total() {
        return User.total.toString();
    }
    
    static findQuery() {
        return `
        SELECT u.uuid "guid", u.username, u.email, s.salt, s.passwordHash
        FROM Users u
        LEFT JOIN UserPasswords s ON u.id = s.userId
        WHERE u.username = ? OR u.email = ?
        `;
    }

    static populateQuery() {
        return `
        SELECT u.*, u.uuid "guid", u.subscriptionType "type", r.roles, p.permissions
        FROM Users u
        LEFT JOIN UserPasswords s ON u.id = s.userId
        LEFT JOIN UserRoles r ON u.id = r.userId
        LEFT JOIN UserPermissions p ON u.id = p.userId
        WHERE u.uuid = ?
        `;
    }

    _accountQuery() { return `INSERT INTO Users (username, subscriptionType, email) VALUES (?, ?, ?)`; }
    passQuery() { return `INSERT INTO UserPasswords (userId, salt, passwordHash) VALUES (?, ?, ?)`; }
    rolesQuery() { return `INSERT INTO UserRoles (userId, roles) VALUES (?, ?)`; }
    permQuery() { return `INSERT INTO UserPermissions (userId, permissions) VALUES (?, ?)`; }
    guidQuery() { return `SELECT uuid "guid" FROM Users WHERE id = ?`; }
    existingQuery() { return `SELECT uuid "guid" FROM Users WHERE username = ? OR email = ?`; }
    
    async publish() {
        console.log({ "todo": "User publish();" });
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