"use strict";

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Subscriber, Visitor } from "../models/classes.mjs";

dotenv.config({ path: "./.env" });

// Authentication and authorization
// Validate and authenticate tokens
const login = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const { username, email, password } = decodeStringToObject(response.locals.account);
        if (!username || !email || !password) {
            const record = { status: 400, username: username, email: email, message: "Missing required parameters." };
            console.log(`${i}: @kutbi:~/signin/login$ Missing required parameters.\r\n`, record);
            return response.status(400).json(record);
        }

        const existingAccount = await User._find(username, email);
        if (!existingAccount) {
            const record = { status: 403, username: username, email: email, message: "We could not locate your Kutbi account." };
            console.log(`${i}: @kutbi:~/signin/login$ Login into a non-existent account.\r\n`, record);
            return response.status(403).json(record);
        }

        if (await bcrypt.compare(password, existingAccount.passwordHash) !== true) {
            const record = { status: 401, username: username, email: email, message: "Invalid password." };
            console.log(`${i}: @kutbi:~/signin/login$ Someone tried to login into an account with an invalid password.`, record);
            return response.status(401).json(record);
        }

        const account = await User._populate(existingAccount.guid);
        request.app.locals.refreshTokens.push(await tokenize(account));
        response.locals.account = account.records();
        next();
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    }
};

const recover = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const { phoneNumber, recoveryEmail, fullName } = decodeStringToObject(response.locals.account);
        if ((!phoneNumber || !recoveryEmail) && !fullName) {
            const record = { status: 400, username: username, email: email, message: "Missing required parameters." };
            console.log(`${i}: @kutbi:~/signin/recover$ Missing required parameters.\r\n`, record);
            return response.status(400).json(record);
        }
        // Review a list of usernames that match your account
        const matchingUsernames = [];
        next();
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    }
};

const register = async (request, response, next) => {
    

    try {
        const i = request.app.locals.index;
        const { username, email, password, roles, permissions } = decodeStringToObject(response.locals.account);
        if (!username || !email || !password) {
            const record = { status: 400, username: username, email: email, message: "Missing required parameters." };
            console.log(`${i}: @kutbi:~/signup/register$ Missing required parameters.`, record);
            return response.status(400).json(record);
        }

        const existingAccount = await User._find(username, email);
        if (existingAccount) {
            console.log(`${i}: ${existingAccount.guid}@kutbi:~/signup/register$ The provided details already exists for another ${existingAccount.type} account.`);
            return response.status(403).json({ status: 403, message: "Apologies for the inconvenience. The username and/or email you provided already exists in our records. Please consider using alternative details for registration, or if you already have a Kutbi account, kindly log in to access your existing account." });
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
        await account.save();

        request.app.locals.refreshTokens.push(await tokenize(account));
        response.locals.account = account.records();
        console.log("response.locals.account from register();");
        console.log(response.locals.account);
        console.log("account from login();");
        console.log(account);
        next();
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
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
        return clearAuthCookies(request, response, next);
    }
};

const validateAuthHeader = (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const header = request.headers.authorization;
        const token = header && header.split(" ")[1];
        
        // Check if the request contains a valid authentication token
        if (!header || token === null) {
            console.log(`${i}: User ${request.body.username} denied access to ${request.hostname}`);
            return response.status(401).json({ status: 401, message: "Unauthorized access." });
        }

        jwt.verify(token, process.env.access_token_secret, (error, user) => {
            if (error) {
                console.log(`${i}: The token has no permission to access ${request.hostname}`);
                return response.status(403).json({ status: 403, message: "No permission to access." });
            }
            request.user = user;
            next();
        });
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    } finally {
        request.app.locals.stats.authValidation++;
    }
};

const validateAuthCookie = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const accessToken = request.cookies.accessToken;
        if (accessToken === "undefined") return response.status(400).json({ status: 400, message: "Unable to find token." });
        jwt.verify(accessToken, process.env.access_token_secret, (error, user) => {
            if (error) {
                console.log(`${i}: The provided token has no permission to access ${request.hostname}`);
                return response.status(403).json({ status: 403, message: "No permission to access." });
            }
            request.user = user;
            next();
        });
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    } finally {
        request.app.locals.stats.authValidation++;
    }
};

const clearAuthTokens = (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const { refreshToken } = request.body;
        if (refreshToken === null) return response.sendStatus(401);
        if (!request.app.locals.refreshTokens.includes(refreshToken)) return response.status(403).json({ status: 403, message: "Forbidden. You need to sign in." });

        jwt.verify(refreshToken, process.env.refresh_token_secret, (error, user) => {
            if (error) return response.status(403).json({ status: 403, message: "Forbidden. You need to sign in." });
            const exists = request.app.locals.refreshTokens.indexOf(refreshToken);
            if (exists === -1) return response.status(400).json({ status: 400, message: "Unable to find token." });
            request.app.locals.refreshTokens.splice(exists,  1);
            console.log(`${i}: Details: Successfully removed authentication tokens.`);
            next();
        });
    } catch (error) {
        console.error(error);
    } finally {
        request.app.locals.stats.clearTokens++;
    }
};

const clearAuthCookies = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        console.log(`${i}: accessToken and refreshToken have been cleared.`);
        return clearAuthTokens(request, response, next);
    } catch (error) {
        console.error(error);
    } finally {
        request.app.locals.stats.clearCookies++;
    }
};

const setupAuth = async (request, response, next) => {
    try {
        const account = await response.locals.account;
        setHeaders(response, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        setCookies(response, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        next();
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    } finally {
        request.app.locals.stats.headers++;
        request.app.locals.stats.cookies++;
        request.app.locals.stats.authCounter++;
    }
};

const generateAccessToken = (accountRecords) => {
    try {
        return jwt.sign({ accountRecords }, process.env.access_token_secret, { expiresIn: 3600000 });
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    }
}

const generateRefreshToken = (accountRecords) => {
    try {
        return jwt.sign({ accountRecords }, process.env.refresh_token_secret);
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    }
}

const setCookies = (response, account) => {
    try {
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
    } catch (error) {
        console.error(error);
        throw Error("We couldn't setup cookies on the client machine for a reason or another!");
    }
};

const setHeaders = (response, account) => {
    response.set("Authorization", `Bearer ${account.accessToken}`);
    // response.set("Cache-Control", ``);
    // response.set("Content-Security-Policy", ``);
};

const encodeObjectToString = (object) => Buffer.from((object)).toString("base64");
const decodeStringToObject = (string) => JSON.parse(Buffer.from(JSON.stringify(string), "base64").toString());

export { login, recover, register, setupAuth, validateAuthHeader, validateAuthCookie, clearAuthTokens, clearAuthCookies };