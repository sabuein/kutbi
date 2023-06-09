"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection
} from "../modules/data.mjs";
import Client from "./client.mjs";

export default class Subscriber extends Client {

    static _total = 0;

    static get total() {
        return Subscriber._total.toString();;
    }

    #newRecord = null;
    #guid = null;
    #username = null;
    #email = null;
    #salt = null;
    #passwordHash = null;
    #roles = [];
    #permissions = [];
    #accessToken = null;
    #refreshToken = null;
    #photoUrl = null;
    #coverImage = null;
    #github = null;
    #twitter = null;
    #facebook = null;
    #instagram = null;
    #youtube = null;
    #website = null;
    #personalUrl = null;
    #createdAt = null;
    #updatedAt = null;
    #deletedAt = null;
    #lastSeen = null;
    #accessibility = null;
    #activeStatus = null;

    constructor(object) {
        if (!!object && object instanceof Object && !!Object.keys(object).length) {
            super(object);
            Subscriber._total++;
            // const schema = {};
            // for (const [key, value] of Object.entries(object)) { if (!!value) schema[key] = object[key]; }
            const {
                guid,
                username,
                email,
                salt,
                passwordHash,
                roles,
                permissions,
                accessToken,
                refreshToken,
                photoUrl,
                coverImage,
                github,
                twitter,
                facebook,
                instagram,
                youtube,
                website,
                personalUrl,
                createdAt,
                updatedAt,
                deletedAt,
                lastSeen,
                accessibility,
                activeStatus,
                newRecord
            } = object;
            if (!!guid && typeof guid === "string" && guid.length === 32) this.#guid = guid;
            this.#username = username;
            this.#email = email;
            this.#salt = salt;
            this.#passwordHash = passwordHash;
            this.#newRecord = newRecord;
            if (!!roles && roles instanceof Array) this.#roles = roles;
            if (!!permissions && permissions instanceof Array) this.#permissions = permissions;
            this.#accessToken = accessToken;
            this.#refreshToken = refreshToken;
            this.#photoUrl = (!!photoUrl && typeof photoUrl === "string") ? photoUrl : "/assets/images/svg/books.svg";
            this.#coverImage = (!!coverImage && typeof coverImage === "string") ? coverImage : "/assets/images/svg/books.svg";
            this.#github = (!!github && typeof github === "string") ? github : "https://github.com/";
            this.#twitter = (!!twitter && typeof twitter === "string") ? twitter : "https://twitter.com/";
            this.#facebook = (!!facebook && typeof facebook === "string") ? facebook : "https://www.facebook.com/";
            this.#instagram = (!!instagram && typeof instagram === "string") ? instagram : "https://www.instagram.com/";
            this.#youtube = (!!youtube && typeof youtube === "string") ? youtube : "https://www.youtube.com/";
            this.#website = (!!website && typeof website === "string") ? website : "/";
            this.#personalUrl = (!!personalUrl) ? personalUrl : "#main-content";
            if (!!createdAt) this.#createdAt = createdAt;
            if (!!updatedAt) this.#updatedAt = updatedAt;
            if (!!deletedAt) this.#deletedAt = deletedAt;
            if (!!lastSeen) this.#lastSeen = lastSeen;
            if (!!accessibility) this.#accessibility = accessibility;
            if (!!activeStatus) this.#activeStatus = activeStatus;
        } else {
            throw Error(`Sorry, couldn't create ${this.constructor.name}.`);
        }
    }

    static _findQuery() {
        return `
        SELECT u.subscriptionType "type", sub.suid "guid", sub.username, sub.email, s.salt, s.passwordHash
        FROM Subscribers sub
        LEFT JOIN SubscribersPasswords s ON sub.id = s.subId
        WHERE sub.username = ? OR sub.email = ?
        `;
    }

    static async _find(username = "", email = "") {
        const connection = await getConnectionFromPool();

        try {
            const result = await executeQuery(connection, this._findQuery(), [username, email]);
            if (result.length === 0) return null;
            return ({ guid: result[0].guid, passwordHash: result[0].passwordHash, type: result[0].type });
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

    static async _populate(guid) {
        const connection = await getConnectionFromPool();

        try {
            const result = await executeQuery(connection, this._populateQuery(), [guid]);
            if (result.length === 0) return null;
            const data = result[0], roles = [], permissions = [];
            for (const row of result) {
                if (row.roles && roles[0] !== row.roles) roles.push(row.roles);
                if (row.permissions) permissions.push(row.permissions);
            }
            data.roles = roles, data.permissions = permissions;
            return new this(data);
        } catch (error) {
            console.error(error);
            throw new Error(`Details: We couldn't populate a Kutbi account with guid = ${guid}).\r\n`);
        } finally {
            releaseConnection(connection);
        }
    }

    _accountQuery() { return `INSERT INTO Subscribers (username, email) VALUES (?, ?)`; }
    _passQuery() { return `INSERT INTO SubscriberPasswords (userId, salt, passwordHash) VALUES (?, ?, ?)`; }
    _rolesQuery() { return `INSERT INTO SubscriberRoles (userId, roles) VALUES (?, ?)`; }
    _permQuery() { return `INSERT INTO SubscriberPermissions (userId, permissions) VALUES (?, ?)`; }
    _guidQuery() { return `SELECT suid "guid" FROM Subscribers WHERE id = ?`; }
    _existingQuery() { return `SELECT uuid "guid" FROM Subscribers WHERE username = ? OR email = ?`; }

    async #create() {
        const connection = await getConnectionFromPool();

        try {
            // Check if the an account already exists
            const existingResult = await executeQuery(connection, this._existingQuery(), [this.#username, this.#email]);

            if (existingResult.length > 0) {
                console.log(`${this.constructor.name} already exists.\r\n`);
                return null;
            }

            // Insert the account into the respective table, then retrieve the inserted id
            const accountResult = await executeQuery(connection, this._accountQuery(), [this.#username, this.type, this.#email]);
            const id = accountResult.insertId;

            // Insert the user credentials into the UserPasswords table
            await executeQuery(connection, this._passQuery(), [id, this.#salt, this.#passwordHash]);

            // Insert the user roles into the UserRoles table
            if (!!this.#roles) this.#roles.forEach(async role => await executeQuery(connection, this._rolesQuery(), [id, role]));

            // Insert the user permissions into the UserPermissions table
            if (!!this.#permissions) this.#permissions.forEach(async permission => await executeQuery(connection, this._permQuery(), [id, permission]));

            // Rretrieving guid
            const guidResult = await executeQuery(connection, this._guidQuery(), [id]);
            this.#guid = guidResult[0].guid;

            this.constructor._total++;
            return this;
        } catch (error) {
            console.error(error);
            throw Error(`Details: We couldn't create a Kutbi account of type ${this.type} (#${this.guid}).\r\n`);
        } finally {
            releaseConnection(connection);
        }
    }

    async #update() {
        console.log({ "todo": "Subscriber update();" });
        try {

        } catch (error) {
            console.error(error);
            throw Error(`Details: We couldn't update your Kutbi account of type ${this.type} (#${this.guid}).\r\n`);
        }
    }

    async save() {
        return this.newRecord ? await this.#create() : await this.#update();
    }

    async activate() {
        console.log({ "todo": "Subscriber activate();" });
    }

    async disable() {
        console.log({ "todo": "Subscriber disable();" });
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

    async follow() {
        console.log({ "todo": "Subscriber follow();" });
    }

    async block() {
        console.log({ "todo": "Subscriber block();" });
    }

    async delete() {
        console.log({ "todo": "Subscriber delete();" });
    }

    async destroy() {
        console.log({ "todo": "Subscriber destroy();" });
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
        // if (value.length < 0 || value.length < 5) throw new RangeError("Access token is invalid");
        this.#accessToken = value;
    }

    get refreshToken() {
        return this.#refreshToken;
    }

    set refreshToken(value) {
        // if (value.length < 0 || value.length < 5) throw new RangeError("Refresh token is invalid");
        this.#refreshToken = value;
    }
    
    get photoUrl() {
        return this.#photoUrl;
    }

    set photoUrl(value) {
        this.#photoUrl = (!!value && typeof value === "string") ? value : "/assets/images/svg/books.svg";
    }

    get coverImage() {
        return this.#coverImage;
    }

    set coverImage(value) {
        this.#coverImage = (!!value && typeof value === "string") ? value : "/assets/images/svg/books.svg";
    }

    get github() {
        return this.#github;
    }

    set github(value) {
        this.#github = (!!value && typeof value === "string") ? value : "/assets/images/svg/books.svg";
    }

    get twitter() {
        return this.#twitter;
    }

    set twitter(value) {
        this.#twitter = (!!value && typeof value === "string") ? value : "/assets/images/svg/books.svg";
    }

    get facebook() {
        return this.#facebook;
    }

    set facebook(value) {
        this.#facebook = (!!value && typeof value === "string") ? value : "/assets/images/svg/books.svg";
    }

    get instagram() {
        return this.#instagram;
    }

    set instagram(value) {
        this.#instagram = (!!value && typeof value === "string") ? value : "/assets/images/svg/books.svg";
    }

    get youtube() {
        return this.#youtube;
    }

    set youtube(value) {
        this.#youtube = (!!value && typeof value === "string") ? value : "/assets/images/svg/books.svg";
    }

    get website() {
        return this.#website;
    }

    set website(value) {
        this.#website = (!!value && typeof value === "string") ? value : "#main-content";
    }

    get personalUrl() {
        return this.#personalUrl;
    }

    set personalUrl(value) {
        this.#personalUrl = (!!value && typeof value === "string") ? value : "/";
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        console.log("Hello from createdAt();");
        console.log(value);
        console.log(typeof value);
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

    get deletedAt() {
        return this.#deletedAt;
    }

    set deletedAt(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("deletedAt length is invalid");
        if (typeof value !== "string") throw new TypeError("deletedAt type is invalid");
        this.#deletedAt = value;
    }

    get lastSeen() {
        return this.#lastSeen;
    }

    set lastSeen(value) {
        if (value.length < 0 || value.length > 100) throw new RangeError("lastSeen length is invalid");
        if (typeof value !== "string") throw new TypeError("lastSeen type is invalid");
        this.#lastSeen = value;
    }
    
    get accessibility() {
        return this.#accessibility;
    }

    set accessibility(value) {
        this.#accessibility = (!!value) ? value : "/";
    }

    get activeStatus() {
        return this.#activeStatus;
    }

    set activeStatus(value) {
        this.#activeStatus = (!!value) ? value : "/";
    }

    raw() {
        return ({
            ...super.raw(),
            guid: this.guid,
            username: this.username,
            email: this.email
        });
    }

    toString() {
        const subscribership = {
            guid: this.guid,
            username: this.username,
            email: this.email,
            newRecord: this.newRecord,
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
            ...subscribership
        });
    }
};