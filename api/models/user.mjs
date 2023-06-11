"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection,
} from "../modules/data.mjs";

import { Subscriber } from "./subscriber.mjs";

const User = class User extends Subscriber {

    #uuid = null;
    #username = null;
    #email = null;
    #salt = null;
    #passwordHash = null;
    #permissions = [];
    #roles = [];
    #accessToken = null;
    #refreshToken = null;
    #url = null;
    #commentNotifications = true;
    #mentionNotifications = true;
    #lastSeen = null;
    #profileImage = null;
    #coverImage = null;

    static total = 0;

    static get total() {
        return User.total.toString();
    }
    
    constructor(data) {
        super();
        User.total++;
        this.#uuid = data.uuid || null,
        this.#username = data.username || null;
        this.#email = data.email || null;
        this.#salt = data.salt || null;
        this.#passwordHash = data.passwordHash || null;
        this.#permissions = data.permissions || [];
        this.#roles = data.roles || [],
        this.#accessToken = data.accessToken || null;
        this.#refreshToken = data.refreshToken || null;
        // Additional properties can be added here
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

    async save() {
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
            console.log(`User created successfully with UUID: ${this.#uuid}`);
            return this.#uuid;
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
        } finally {
            releaseConnection(connection);
        }
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

    toString() {
        const details = {
            uuid: this.#uuid,
            username: this.#username,
            email: this.#email,
            permissions: this.#permissions,
            roles: this.#roles,
            accessToken: this.#accessToken,
            refreshToken: this.#refreshToken,
            url: this.#url,
            commentNotifications: this.#commentNotifications,
            mentionNotifications: this.#mentionNotifications,
            lastSeen: this.#lastSeen,
            profileImage: this.#profileImage,
            coverImage: this.#coverImage
        };
        return ({
            ...super.toString(),
            ...details
        });
    }
};

export { User };