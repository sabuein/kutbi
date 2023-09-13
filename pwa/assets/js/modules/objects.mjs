"use strict";

import { local, session } from "./apis.mjs";
import { decode, encode } from "./helpers.mjs";

const loadAccount = async () => {
    const current = {};
    try {
        const retrieved = local("read", "account");
        if (!!retrieved) {
            current.loggen = JSON.parse(local("read", "loggen"));
            current.account = JSON.parse(retrieved);
            if (!!current.loggen && !!current.account) {
                local("update", "loggen", (++current.loggen).toString());
                current.loggen = local("read", "loggen");
                current.account = (new Account(JSON.parse(decode(current.account.account)))).toString();
            } else { throw Error("@kutbi:~/accounts$ We could not retrieve any account from the browser. You need to log in."); }

            const tokens = local("read", "tokens");
            if (!tokens) throw Error("@kutbi:~/accounts$ We could not retrieve any tokens from the browser. You need to log in.");
            else current.tokens = JSON.parse(tokens);

            console.log("@kutbi:~$ Your Kutbi account and login details have been retrieved successfully from the browser.");
            return current;
        }
    } catch (error) {
        console.error(error);
        return null;
        // window.location.replace("./login.html");
    } finally {
        console.log(`@kutbi:~$ Function loadAccount() ended.`);
    }
};

class Account {

    static _total = 0;

    static get total() {
        return this._total.toString();
    }

    loggen;
    type;
    firstName;
    lastName;
    fullName;
    dob;
    gender;
    occupation;
    location;
    interests;
    guid;
    username;
    email;
    permissions;
    roles;
    accessToken;
    refreshToken;
    photoUrl;
    coverImage;
    personalUrl;
    createdAt;
    updatedAt;
    lastSeen;
    accessibility;
    activeStatus;
    commentNotifications;
    mentionNotifications;

    constructor(object) {
        if (!!object && object instanceof Object && !!Object.keys(object).length) {
            Account._total++;
            for (const attribute in object) this[attribute] = object[attribute];
            this.setlocal();
            /*
            this.type = obj.type;
            this.firstName = obj.firstName;
            this.lastName = obj.lastName;
            this.fullName = obj.fullName;
            this.dob = obj.dob;
            this.gender = obj.gender;
            this.occupation = obj.occupation;
            this.location = obj.location;
            this.interests = obj.interests;
            this.guid = obj.guid;
            this.username = obj.username;
            this.email = obj.email;
            this.permissions = obj.permissions;
            this.roles = obj.roles;
            this.accessToken = obj.accessToken;
            this.refreshToken = obj.refreshToken;
            this.photoUrl = obj.photoUrl;
            this.coverImage = obj.coverImage;
            this.personalUrl = obj.personalUrl;
            this.createdAt = obj.createdAt;
            this.updatedAt = obj.updatedAt;
            this.lastSeen = obj.lastName;
            this.accessibility = obj.accessibility;
            this.activeStatus = obj.activeStatus;
            this.commentNotifications = obj.commentNotifications;
            this.mentionNotifications = obj.mentionNotifications;
            */
        } else {
            throw Error(`Sorry, couldn't create ${this.constructor.name}.`);
        }
    }

    setlocal() {
        this.loggen = true;
        return local("update", "tokens", JSON.stringify({
            access: this.accessToken,
            refresh: this.refreshToken,
        }));
    }

    raw() {
        return ({
            type: this.type,
            guid: this.guid,
            username: this.username,
            email: this.email
        });
    }

    toString() {
        return ({
            type: this.type,
            guid: this.guid,
            username: this.username,
            email: this.email
        });
    }

    get loggen() {
        return this.loggen;
    }

    set loggen(value) {
        this.loggen = value;
    }

    get type() {
        return this.type;
    }

    set type(value) {
        this.type = value;
    }

    get firstName() {
        return this.firstName;
    }

    set firstName(value) {
        this.firstName = value;
    }

    get lastName() {
        return this.lastName;
    }

    set lastName(value) {
        this.lastName = value;
    }

    get fullName() {
        return this.fullName;
    }

    set fullName(value) {
        this.fullName = value;
    }

    get dob() {
        return this.dob;
    }

    set dob(value) {
        this.dob = value;
    }

    get gender() {
        return this.gender;
    }

    set gender(value) {
        this.gender = value;
    }

    get occupation() {
        return this.occupation;
    }

    set occupation(value) {
        this.occupation = value;
    }

    get location() {
        return this.location;
    }

    set location(value) {
        this.location = value;
    }

    get interests() {
        return this.interests || [];
    }

    set interests(value) {
        this.interests = value;
    }

    get guid() {
        return this.guid;
    }

    set guid(value) {
        this.guid = value;
    }

    get username() {
        return this.username;
    }

    set username(value) {
        this.username = value;
    }

    get email() {
        return this.email;
    }

    set email(value) {
        this.email = value;
    }

    get permissions() {
        return this.permissions || [];
    }

    set permissions(value) {
        this.permissions = value;
    }

    get roles() {
        return this.roles || [];
    }

    set roles(value) {
        this.roles = value;
    }

    get accessToken() {
        return this.accessToken;
    }

    set accessToken(value) {
        this.accessToken = value;
    }

    get refreshToken() {
        return this.refreshToken;
    }

    set refreshToken(value) {
        this.refreshToken = value;
    }

    get photoUrl() {
        return this.photoUrl;
    }

    set photoUrl(value) {
        this.photoUrl = value;
    }

    get coverImage() {
        return this.coverImage;
    }

    set coverImage(value) {
        this.coverImage = value;
    }

    get personalUrl() {
        return this.personalUrl;
    }

    set personalUrl(value) {
        this.personalUrl = value;
    }

    get createdAt() {
        return this.createdAt;
    }

    set createdAt(value) {
        this.createdAt = value;
    }

    get updatedAt() {
        return this.updatedAt;
    }

    set updatedAt(value) {
        this.updatedAt = value;
    }

    get lastSeen() {
        return this.lastSeen;
    }

    set lastSeen(value) {
        this.lastSeen = value;
    }

    get accessibility() {
        return this.accessibility;
    }

    set accessibility(value) {
        this.accessibility = value;
    }

    get activeStatus() {
        return this.activeStatus;
    }

    set activeStatus(value) {
        this.activeStatus = value;
    }

    get commentNotifications() {
        return this.commentNotifications;
    }

    set commentNotifications(value) {
        this.commentNotifications = value;
    }

    get mentionNotifications() {
        return this.mentionNotifications;
    }

    set mentionNotifications(value) {
        this.mentionNotifications = value;
    }
}

export {
    Account,
    loadAccount,
};