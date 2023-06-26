"use strict";

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Log } from "./classes.mjs";

dotenv.config({ path: "./.env" });

const requests = [];

const mainLogger = (request, response, next) => {
    requests.push(new Log(request).print());
    // console.log((JSON.stringify(requests.slice(-1), null, 2)), "\r\n");
    request.app.locals.index++;
    next();
};

const idLogger = (request, response, next, id) => {
    console.log(`ID: ${id}`);
    next();
};

// Input Validation and Sanitization

const timestamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const encodeObjectToString = (object) => {
    try {
        return Buffer.from((object)).toString("base64");
    } catch (error) {
        console.error(error);
        throw Error("Failed to encodeObjectToString();");
    }
};

const decodeStringToObject = (string) => {
    try {
        return JSON.parse(Buffer.from(JSON.stringify(string), "base64").toString());
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
        return jwt.sign({ accountRecords }, process.env.access_token_secret, { expiresIn: 3600000 });
    } catch (error) {
        console.error(error);
        throw Error("Failed to generateAccessToken();");
    }
};

const generateRefreshToken = (accountRecords) => {
    try {
        return jwt.sign({ accountRecords }, process.env.refresh_token_secret);
    } catch (error) {
        console.error(error);
        throw Error("Failed to generateRefreshToken();");
    }
};

const pwgenerator = async (password) => {
    try {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        return ({ salt: passwordSalt, hash: passwordHash });
    } catch (error) {
        console.error(error);
        throw Error("Failed to pwgenerator();");
    }
};

const pwcompare = async (password, existingPassword) => {
    try {
        return await bcrypt.compare(password, existingPassword); 
    } catch (error) {
        console.error(error);
        throw Error("Failed to pwcompare();");
    }
};

const tkverify = (type, token) => {
    try {
        if (type === "access") return jwt.verify(token, process.env.access_token_secret);
        if (type === "refresh") return jwt.verify(token, process.env.refresh_token_secret);
    } catch (error) {
        console.error(error);
        throw Error("Failed to pwverify();");
    }
};

export {
    mainLogger,
    idLogger,
    timestamp,
    encodeObjectToString as encode,
    decodeStringToObject as decode,
    tokenize,
    pwgenerator,
    pwcompare,
    tkverify
};