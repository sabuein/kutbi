"use strict";

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/register.mjs";

dotenv.config({ path: "./.env" });

// Authentication and authorization

const login = async (request, response, next) => {
    try {
        const { username, email, password } = request.body;
        if (!username || !email || !password) {
            const value = { username: username, email: email, error: "Missing required parameters" };
            console.log(value, "\r\n");
            return response.status(400).json(value);
        }
        // Find the user by their username or email
        const existingAccount = await User.find(username, email);
        if (!existingAccount) {
            const value = { username: username, email: email, error: "A Kutbi account for these details does not exist" };
            console.log(value, "\r\n");
            return response.status(403).json({ error: "We couldn't find your Kutbi account" });
        }
        if (await bcrypt.compare(password, existingAccount.passwordHash) !== true) {
            const value = { username: username, email: email, error: "Invalid password" };
            console.log(value, "\r\n");
            return response.status(401).json(value);
        }
        const account = await User.populate(existingAccount.guid);
        account.accessToken = generateAccessToken(account.records);
        account.refreshToken = generateRefreshToken(account.records);
        tempTokens.push(account.refreshToken);
        request.account = account.toString();
        next();
    } catch (error) {
        console.error(error);
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        response.status(500).json({ error: "Server error" });
    }
};

const recover = async (request, response, next) => {
    const { phoneNumber, recoveryEmail, fullName } = request.body;
    if ((!phoneNumber || !recoveryEmail) && !fullName) return response.status(400).json({ error: "Missing required parameters" });
    try {
        // Review a list of usernames that match your account
        const matchingUsernames = []
        next();
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Server error" });
    } finally {
        console.log("TODO: recover();")
    }
};

const register = async (request, response, next) => {
    const { username, email, password, roles, permissions } = request.body;
    if (!username || !email || !password) return response.status(400).json({ error: "Missing required parameters" });
    try {
        // Find the account by their username or email
        const existingAccount = await User.find(username, email);
        if (existingAccount) {
            console.log(`Details: An account that already exists tried to signup!\r\n`);
            return response.status(403).json({ error: "Apologies for the inconvenience. The username and/or email you provided already exists in our records. Please consider using alternative details for registration, or if you already have a Kutbi account, kindly log in to access your existing account." });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const account = new User({
            username: username,
            email: email,
            salt: salt,
            passwordHash: passwordHash,
            roles: roles,
            permissions: permissions,
            newRecord: true
        });
        account.accessToken = generateAccessToken(account.records);
        account.refreshToken = generateRefreshToken(account.records);
        tempTokens.push(account.refreshToken);
        await account.save();
        request.account = account.toString();
        next();
    } catch (error) {
        console.error(error);
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        response.status(500).json({ error: "Server error" });
    }
};

// Validate and authenticate tokens

let tempTokens = [];

const validateAuthHeader = (request, response, next) => {
    const header = request.headers.authorization;
    const token = header && header.split(" ")[1];

    // Check if the request contains a valid authentication token
    if (!header || token === null) {
        console.log(`User ${request.body.username} denied access to ${request.hostname}`);
        return response.status(401).json({ error: "Unauthorized access" });
    }

    try {
        jwt.verify(token, process.env.access_token_secret, (error, user) => {
            if (error) {
                console.log(`The token has no permission to access ${request.hostname}`);
                return response.status(403).json({ error: "No permission to access" });
            }
            request.user = user;
            next();
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Server error" });
    }
};

const validateAuthCookie = async (request, response, next) => {
    const accessToken = request.cookies.accessToken;
    if (accessToken === "undefined") return response.status(400).json({ error: "Unable to find token" });
    try {
        jwt.verify(accessToken, process.env.access_token_secret, (error, user) => {
            if (error) {
                console.log(`The provided token has no permission to access ${request.hostname}`);
                return response.status(403).json({ error: "No permission to access" });
            }
            request.user = user;
            next();
        });
    } catch (error) {
        console.error(error);
        response.clearCookie("accessToken");
        response.status(500).json({ error: "Server error" });
    }
    /*
    const sauce = { uuid: uuid, username: username, email: email };
    request.user.accessToken = generateAccessToken(sauce);
    tempTokens.push(generateRefreshToken(sauce));
    request.user.refreshToken = generateRefreshToken(sauce);
    next();
    */
};

const clearAuthTokens = (request, response, next) => {
    const { refreshToken } = request.body;
    if (refreshToken === null) return response.sendStatus(401);
    if (!tempTokens.includes(refreshToken)) return response.status(403).json({ error: "Forbidden. You need to sign in." });

    jwt.verify(refreshToken, process.env.refresh_token_secret, (error, user) => {
        if (error) return response.status(403).json({ error: "Forbidden. You need to sign in." });
        const exists = tempTokens.indexOf(refreshToken);
        if (exists === -1) return response.status(400).json({ error: "Unable to find token" });
        tempTokens.splice(exists,  1);
        console.log("Details: Successfully removed authentication tokens.");
        next();
    });
};

const clearAuthCookies = async (request, response, next) => {
    try {
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        next();
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Server error" });
    } finally {
        console.log("clearCookies();")
    }
};

const stats = {
    setupAuthCounter: 0,
};

const setupAuth = async (request, response, next) => {
    try {
        const account = request.account;
        setHeaders(response, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        setCookies(response, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        next();
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Server error" });
    } finally {
        stats.setupAuthCounter++;
        console.log(`setupAuth: ${stats.setupAuthCounter}\r\n`);
    }
};

const generateAccessToken = (accountRecords) => jwt.sign({ accountRecords }, process.env.access_token_secret, { expiresIn: 3600000 });

const generateRefreshToken = (accountRecords) => jwt.sign({ accountRecords }, process.env.refresh_token_secret);

const setCookies = (response, account) => {
    response.cookie("accessToken", account.accessToken, {
        httpOnly: false,
        secure: true,
        maxAge: 3600000, // One hour in milliseconds
        signed: false
    });

    response.cookie("refreshToken", account.refreshToken, {
        httpOnly: false,
        secure: true,
        maxAge: 2629800000, // One month in milliseconds
        signed: false
    });
};

const setHeaders = (response, account) => {
    response.set("Authorization", `Bearer ${account.accessToken}`);
    // response.set("Cache-Control", ``);
    // response.set("Content-Security-Policy", ``);
};

export { login, recover, register, setupAuth, validateAuthHeader, validateAuthCookie, clearAuthTokens, clearAuthCookies };