"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection,
    Human
} from "./register.mjs";

export default class Subscriber extends Human {

    #uuid = null;
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
    #url = null;
    #createdAt = null;
    #updatedAt = null;
    #deletedAt = null;
    #lastSeen = null;
    #accessibility = null;
    #status = null;
    
    static total = 0;

    constructor(data) {
        Subscriber.total++;
        super();
        this.#uuid = data.uuid || null,
        this.#username = data.username || null;
        this.#email = data.email || null;
        this.#salt = data.salt || null;
        this.#passwordHash = data.passwordHash || null;
        this.#permissions = data.permissions || [];
        this.#roles = data.roles || [],
        this.#accessToken = data.accessToken || null;
        this.#refreshToken = data.refreshToken || null;
        this.#photoUrl = data.photoUrl || null;
        this.#coverImage = data.coverImage || null;
        this.#accessibility = null;
        this.#status = null;
        // Additional properties can be added here
        this.#url = null;
        this.#createdAt = null;
        this.#lastSeen = null;
    }

    static get total() {
        return Subscriber.total.toString();
    }

    static async find(username = "", email = "") {
        const connection = await getConnectionFromPool();

        try {
            const query = `
            SELECT u.uuid, u.username, u.email, s.salt, s.passwordHash, r.roles, p.permissions
            FROM Users u
            LEFT JOIN UserPasswords s ON u.id = s.userId
            LEFT JOIN UserRoles r ON u.id = r.userId
            LEFT JOIN UserPermissions p ON u.id = p.userId
            WHERE u.username = ? OR u.email = ?
            `;

            const result = await executeQuery(connection, query, [username, email]);

            if (result.length === 0) return null;

            const userData = result[0], userRoles = [], userPermissions = [];
            
            for (const row of result) {
                if (row.roles && userRoles[0] !== row.roles) userRoles.push(row.roles);
                if (row.permissions) userPermissions.push(row.permissions);
            }
            
            return new User({
                uuid: userData.uuid,
                username: userData.username,
                email: userData.email,
                salt: userData.salt,
                passwordHash: userData.passwordHash,
                roles: userRoles,
                permissions: userPermissions
            });
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
            return null;
        } finally {
            releaseConnection(connection);
        }
    }

    async create() {
        const connection = await getConnectionFromPool();

        try {
            // Check if the user already exists
            const existingUserQuery = `SELECT uuid FROM Users WHERE username = ? OR email = ?`;
            const existingUserResult = await executeQuery(connection, existingUserQuery, [this.#username, this.#email]);

            if (existingUserResult.length > 0) {
                console.log(`User already exists`);
                return null;
            }

            // Insert the user into the Users table, then retrieve the inserted id
            const userQuery = `INSERT INTO Users (username, email) VALUES (?, ?)`;
            const userResult = await executeQuery(connection, userQuery, [
                this.#username,
                this.#email
            ]);
            const id = userResult.insertId;

            // Insert the user credentials into the UserPasswords table
            const passQuery = `INSERT INTO UserPasswords (userId, salt, passwordHash) VALUES (?, ?, ?)`;
            await executeQuery(connection, passQuery, [
                id,
                this.#salt,
                this.#passwordHash,
            ]);

            // Insert the user roles into the UserRoles table
            this.#roles.forEach(async role => {
                const rolesQuery = `INSERT INTO UserRoles (userId, roles) VALUES (?, ?)`;
                await executeQuery(connection, rolesQuery, [id, role]);
            });

            // Insert the user permissions into the UserPermissions table
            this.#permissions.forEach(async permission => {
                const permQuery = `INSERT INTO UserPermissions (userId, permissions) VALUES (?, ?)`;
                await executeQuery(connection, permQuery, [id, permission]);
            });

            // Rretrieving uuid
            const uuidQuery = `SELECT uuid FROM Users WHERE id = ?`;
            const uuidResult = await executeQuery(connection, uuidQuery, [id]);
            this.#uuid = uuidResult[0].uuid;
            console.log(`User created successfully with UUID: ${this.#uuid}\r\n`);
            return this.#uuid;
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
        } finally {
            releaseConnection(connection);
        }
    }

    async activate() {
        console.log({"todo": "Subscriber activate();" });
    }

    async suspend() {
        console.log({"todo": "Subscriber suspend();" });
    }

    async subscribe() {
        console.log({"todo": "Subscriber subscribe();" });
    }

    async unsubscribe() {
        console.log({"todo": "Subscriber unsubscribe();" });
    }

    async block() {
        console.log({"todo": "Subscriber block();" });
    }

    get uuid() {
        return this.#uuid;
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

    async update() {
        console.log({"todo": "Subscriber update();" });
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
        console.log({"todo": "Subscriber destroy();" });
    }

    async delete() {
        console.log({"todo": "Subscriber delete();" });
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
            uuid: this.#uuid,
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
            uuid: this.#uuid,
            username: this.#username,
            email: this.#email,
            permissions: this.#permissions,
            roles: this.#roles,
            accessToken: this.#accessToken,
            refreshToken: this.#refreshToken,
            photoUrl: this.#photoUrl,
            coverImage: this.#coverImage,
            url: this.#url,
            createdAt: this.#createdAt,
            updatedAt: this.#updatedAt,
            lastSeen: this.#lastSeen,
            accessibility: this.#accessibility,
            status: this.#status
        };

        return ({
            ...super.toString(),
            ...subscription,
            ...this.#getNonNullAttributes
        });
    }
};