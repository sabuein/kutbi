"use strict";

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Log } from "./classes.mjs";

dotenv.config({ path: "./.env" });

const requests = [];

const mainLogger = (request, response, next) => {
    const log = new Log(request);
    requests.push(log.print());
    // console.log((JSON.stringify(requests.slice(-1), null, 2)), "\r\n");
    request.app.locals.index++;
    request.app.locals.log = log;
    next();
};

const idLogger = (request, response, next, id) => {
    console.log(`ID: ${id}`);
    next();
};

const encodeObjectToString = (object) => {
    try {
        // return Buffer.from((object)).toString("base64");
        return Buffer.from(JSON.stringify(object)).toString("base64");
    } catch (error) {
        console.error(error);
        throw Error("Failed to encodeObjectToString();");
    }
};

const decodeStringToObject = (string) => {
    try {
        // return JSON.parse(Buffer.from(JSON.stringify(string), "base64").toString());
        return JSON.parse(Buffer.from(string, "base64").toString());
    } catch (error) {
        console.error(error);
        throw Error("Failed to decodeStringToObject();");
    }
};

const tokenize = async (account) => {
    try {
        const raw = {
            guid: account.guid,
            username: account.username,
            email: account.email
        };
        Object.assign(account, {
            accessToken: generateAccessToken(raw),
            refreshToken: generateRefreshToken(raw),
        });
        return account.refreshToken;
    } catch (error) {
        console.error(error);
        throw Error("Failed to tokenize();");
    }
};

const generateAccessToken = (accountRecords) => {
    try {
        const accessTokenExpiry = "30m"; // Access token expires in 30 minutes
        return jwt.sign({ accountRecords }, process.env.access_token_secret, { expiresIn: accessTokenExpiry });
    } catch (error) {
        console.error(error);
        throw Error("Failed to generateAccessToken();");
    }
};

const generateRefreshToken = (accountRecords) => {
    try {
        const refreshTokenExpiry = "7d"; // Refresh token expires in 7 days
        return jwt.sign({ accountRecords }, process.env.refresh_token_secret, { expiresIn: refreshTokenExpiry });
    } catch (error) {
        console.error(error);
        throw Error("Failed to generateRefreshToken();");
    }
};

const hashPassword = async (password) => {
    try {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, passwordSalt);
        return ({ salt: passwordSalt, hash: passwordHash });
    } catch (error) {
        console.error(error);
        throw Error("Failed to pwgenerator();");
    }
};

const comparePasswords = async (password, existingPassword) => {
    try {
        return await bcrypt.compare(password, existingPassword); 
    } catch (error) {
        console.error(error);
        throw Error("Failed to pwcompare();");
    }
};

const verifyToken = (type, token) => {
    try {
        if (type === "access") return jwt.verify(token, process.env.access_token_secret);
        if (type === "refresh") return jwt.verify(token, process.env.refresh_token_secret);
    } catch (error) {
        console.error(error);
        throw Error("Failed to tkverify();");
    }
};

const getCookie = async (cookieName, requestCookies) => {
    try {
        const name = cookieName + "=";
        const decodedCookies = decodeURIComponent(await requestCookies);
        const cookies = decodedCookies.split(";");
        for(let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === " ") {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    } catch (error) {
        console.error(error);
    }
};

const setCookieExpiry = (days) => {
    try {
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        return `cookieName=cookieValue;${expires};path=/`;
    } catch (error) {
        console.error(error);
    }
};

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

export {
    mainLogger,
    idLogger,
    encodeObjectToString as encode,
    decodeStringToObject as decode,
    tokenize,
    hashPassword,
    comparePasswords,
    verifyToken,
    getCookie,
    isEmptyObject
};