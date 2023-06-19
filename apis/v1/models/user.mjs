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
        this.#commentNotifications = true;
        this.#mentionNotifications = true;
        // Additional properties can be added here
    }

    static get total() {
        return User.total.toString();
    }

    static async find(username = "", email = "") {
        const connection = await getConnectionFromPool();

        try {
            const query = `
            SELECT u.uuid, u.username, u.email, s.salt, s.passwordHash
            FROM Users u
            LEFT JOIN UserPasswords s ON u.id = s.userId
            WHERE u.username = ? OR u.email = ?
            `;
            const result = await executeQuery(connection, query, [username, email]);
            if (result.length === 0) return null;
            return ({ uuid: result[0].uuid, passwordHash: result[0].passwordHash });
        } catch (e) {
            console.error(`${e.name}: ${e.message}`);
            return null;
        } finally {
            releaseConnection(connection);
        }
    }

    static async populate(uuid) {
        const connection = await getConnectionFromPool();

        try {
            const query = `
            SELECT u.uuid,
            u.username,
            u.email,
            r.roles,
            p.permissions
            FROM Users u
            LEFT JOIN UserPasswords s ON u.id = s.userId
            LEFT JOIN UserRoles r ON u.id = r.userId
            LEFT JOIN UserPermissions p ON u.id = p.userId
            WHERE u.uuid = ?
            `;

            const result = await executeQuery(connection, query, [uuid]);

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
                roles: userRoles,
                permissions: userPermissions
            });
        } catch (error) {
            console.error(error);
            throw new Error("Couldn't populate user");
        } finally {
            releaseConnection(connection);
        }
    }

    async publish() {
        console.log({"todo": "User publish();" });
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