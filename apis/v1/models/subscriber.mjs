"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection,
    Human
} from "./register.mjs";

export default class Subscriber extends Human {

    #guid = null;
    #username = null;
    #email = null;
    #salt = null;
    #passwordHash = null;
    #permissions = [];
    #roles = [];
    #accessToken = null;
    #refreshToken = null;
    #photoUrl = null;
    #coverImage = null;
    #personalUrl = null;
    #createdAt = null;
    #updatedAt = null;
    #deletedAt = null;
    #lastSeen = null;
    #accessibility = null;
    #activeStatus = null;
    #newRecord = null;

    static total = 0;

    constructor(data) {
        Subscriber.total++;
        super();
        this.#guid = data.guid || null,
        this.#username = data.username || null;
        this.#email = data.email || null;
        this.#salt = data.salt || null;
        this.#passwordHash = data.passwordHash || null;
        this.#permissions = data.permissions || [];
        this.#roles = data.roles || [],
        this.#accessToken = data.accessToken || null;
        this.#refreshToken = data.refreshToken || null;
        this.#photoUrl = data.photoUrl || null;
        this.#personalUrl = data.personalUrl || null;
        this.#newRecord = data.newRecord || null;
    }

    static get total() {
        return Subscriber.total.toString();
    }
        
    static findQuery() {
        return `
        SELECT sub.suid "guid", sub.username, sub.email, s.salt, s.passwordHash
        FROM Subscribers sub
        LEFT JOIN SubscribersPasswords s ON sub.id = s.subId
        WHERE sub.username = ? OR sub.email = ?
        `;
    }

    static async find(username = "", email = "") {
        const connection = await getConnectionFromPool();

        try {
            const result = await executeQuery(connection, this.findQuery(), [username, email]);
            if (result.length === 0) return null;
            return ({ guid: result[0].guid, passwordHash: result[0].passwordHash });
        } catch (error) {
            console.error(error);
            throw Error(`Details: We couldn't find your Kutbi account`);
        } finally {
            releaseConnection(connection);
        }
    }

    static populateQuery() {
        return `
        SELECT sub.*, sub.suid "guid" r.roles, p.permissions
        FROM Subscribers sub
        LEFT JOIN SubscribersPasswords s ON sub.id = s.subId
        LEFT JOIN SubscribersRoles r ON sub.id = r.subId
        LEFT JOIN SubscribersPermissions p ON sub.id = p.subId
        WHERE sub.suid = ?
        `;
    }

    static async populate(guid) {
        const connection = await getConnectionFromPool();

        try {
            const result = await executeQuery(connection, this.populateQuery(), [guid]);
            if (result.length === 0) return null;
            const data = result[0], roles = [], permissions = [];
            for (const row of result) {
                if (row.roles && roles[0] !== row.roles) roles.push(row.roles);
                if (row.permissions) permissions.push(row.permissions);
            }
            data.roles = roles;
            data.permissions = permissions;
            return new this(data);
        } catch (error) {
            console.error(error);
            throw new Error(`Details: We couldn't populate a Kutbi account with guid = ${guid}).\r\n`);
        } finally {
            releaseConnection(connection);
        }
    }

    _accountQuery() { return `INSERT INTO Subscribers (username, email) VALUES (?, ?)`; }
    passQuery() { return `INSERT INTO SubscriberPasswords (userId, salt, passwordHash) VALUES (?, ?, ?)`; }
    rolesQuery() { return `INSERT INTO SubscriberRoles (userId, roles) VALUES (?, ?)`; }
    permQuery() { return `INSERT INTO SubscriberPermissions (userId, permissions) VALUES (?, ?)`; }
    guidQuery() { return `SELECT suid "guid" FROM Subscribers WHERE id = ?`; }
    existingQuery() { return `SELECT uuid "guid" FROM Subscribers WHERE username = ? OR email = ?`; }

    async create() {
        const connection = await getConnectionFromPool();

        try {
            // Check if the an account already exists
            const existingResult = await executeQuery(connection, this.existingQuery(), [this.#username, this.#email]);

            if (existingResult.length > 0) {
                console.log(`${this.constructor.name} already exists.\r\n`);
                return null;
            }

            // Insert the account into the respective table, then retrieve the inserted id
            const accountResult = await executeQuery(connection, this._accountQuery(), [this.#username, this.type, this.#email]);
            const id = accountResult.insertId;

            // Insert the user credentials into the UserPasswords table
            await executeQuery(connection, this.passQuery(), [id, this.#salt, this.#passwordHash]);

            // Insert the user roles into the UserRoles table
            this.#roles.forEach(async role => await executeQuery(connection, this.rolesQuery(), [id, role]));

            // Insert the user permissions into the UserPermissions table
            this.#permissions.forEach(async permission => await executeQuery(connection, this.permQuery(), [id, permission]));

            // Rretrieving guid
            const guidResult = await executeQuery(connection, this.guidQuery(), [id]);
            this.#guid = guidResult[0].guid;

            console.log(this.toString(), "\r\n");
            console.log(`Details: A new Kutbi account of type ${this.type} (#${this.guid}) has successfully registered and logged in.\r\n`);
            
            return this.#guid;
        } catch (error) {
            console.error(error);
            throw Error(`Details: We couldn't create a Kutbi account of type ${this.type} (#${this.guid}).\r\n`);
        } finally {
            releaseConnection(connection);
        }
    }

    async update() {
        console.log({ "todo": "Subscriber update();" });
        try {

        } catch (error) {
            console.error(error);
            throw Error(`Details: We couldn't update your Kutbi account of type ${this.type} (#${this.guid}).\r\n`);
        }
    }

    async save() {
        return this.newRecord ? await this.create() : await this.update();
    }

    async activate() {
        console.log({ "todo": "Subscriber activate();" });
    }

    async suspend() {
        console.log({ "todo": "Subscriber suspend();" });
    }

    async subscribe() {
        console.log({ "todo": "Subscriber subscribe();" });
    }

    async unsubscribe() {
        console.log({ "todo": "Subscriber unsubscribe();" });
    }

    async block() {
        console.log({ "todo": "Subscriber block();" });
    }

    get newRecord() {
        return this.#newRecord;
    }

    set newRecord(value) {
        if (typeof value !== "boolean") throw new TypeError("newRecord type is invalid");
        this.#newRecord = value;
    }

    get guid() {
        return this.#guid;
    }

    get username() {
        return this.#username;
    }

    get email() {
        return this.#email;
    }

    set email(value) {
        if (value.length < 0 || value.length < 5) throw new RangeError("Email is invalid");
        this.#email = value;
    }

    get passwordHash() {
        return this.#passwordHash;
    }

    get permissions() {
        return this.#permissions;
    }

    get roles() {
        return this.#roles;
    }

    get accessToken() {
        return this.#accessToken;
    }

    set accessToken(value) {
        if (value.length < 0 || value.length < 5) throw new RangeError("Access token is invalid");
        this.#accessToken = value;
    }

    get refreshToken() {
        return this.#refreshToken;
    }

    set refreshToken(value) {
        if (value.length < 0 || value.length < 5) throw new RangeError("Refresh token is invalid");
        this.#refreshToken = value;
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("createdAt length is invalid");
        if (typeof value !== "string") throw new TypeError("createdAt type is invalid");
        this.#createdAt = value;
    }

    get updatedAt() {
        return this.#updatedAt;
    }

    set updatedAt(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("updatedAt length is invalid");
        if (typeof value !== "string") throw new TypeError("updatedAt type is invalid");
        this.#updatedAt = value;
    }

    async destroy() {
        console.log({ "todo": "Subscriber destroy();" });
    }

    async delete() {
        console.log({ "todo": "Subscriber delete();" });
    }

    get deletedAt() {
        return this.#deletedAt;
    }

    set deletedAt(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("deletedAt length is invalid");
        if (typeof value !== "string") throw new TypeError("deletedAt type is invalid");
        this.#deletedAt = value;
    }

    records() {
        return ({
            ...super.records(),
            guid: this.#guid,
            username: this.#username,
            email: this.#email
        });
    }

    #getNonNullAttributes() {
        const attributes = [];
        for (let attribute in this) {
            if (this.hasOwnProperty(attribute) && this[attribute] !== null) {
                attributes.push({ attribute: this[attribute] });
            }
        }
        return attributes;
    }

    toString() {
        const subscription = {
            guid: this.guid,
            username: this.username,
            email: this.email,
            permissions: this.permissions,
            roles: this.roles,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            photoUrl: this.photoUrl,
            coverImage: this.coverImage,
            personalUrl: this.personalUrl,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastSeen: this.lastSeen,
            accessibility: this.accessibility,
            activeStatus: this.activeStatus
        };

        return ({
            ...super.toString(),
            ...subscription,
            ...this.#getNonNullAttributes()
        });
    }
};