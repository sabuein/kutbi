"use strict";

import { encode, decode, tokenize, hashPassword, comparePasswords, verifyToken } from "./helpers.mjs";
import { User, Subscriber, Visitor } from "./classes.mjs";

// Authentication and authorization
// Validate and authenticate tokens
const login = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const { username, email, password } = decode(response.locals.account);
        if (!username || !email || !password) {
            const record = { status: 400, username: username, email: email, message: "Missing required parameters." };
            response.status(400).json(record);
            throw Error(`${i}: @kutbi:~/signin/login$ Missing required parameters.`, record);
        }

        const existingAccount = await User._find(username, email);
        if (!existingAccount) {
            const record = { status: 403, username: username, email: email, message: "We could not locate your account." };
            response.status(403).json(record);
            throw Error(`${i}: @kutbi:~/signin/login$ Login into a non-existent account.`, record);
        }

        if (await comparePasswords(password, existingAccount.passwordHash) !== true) {
            const record = { status: 401, username: username, email: email, message: "Invalid password." };
            response.status(401).json(record);
            throw Error(`${i}: @kutbi:~/signin/login$ Someone tried to login with an invalid password.`, record);
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
        const { phoneNumber, recoveryEmail, fullName } = decode(response.locals.account);
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

const reset = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const { phoneNumber, recoveryEmail, fullName } = decode(response.locals.account);
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

const verification = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const { phoneNumber, recoveryEmail, fullName } = decode(response.locals.account);
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
        const { username, email, password, roles, permissions } = decode(response.locals.account);
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

        const pass = await hashPassword(password);
        const account = new User({
            username: username,
            email: email,
            salt: pass.salt,
            passwordHash: pass.hash,
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

// A middleware function to check if the client is logged in or has an active access token:
const requireAuth = async (request, response, next) => {
    // Retrieve access token from a cookie named "accessToken"
    const accessToken = await request.cookies.accessToken;
    if (!accessToken) response.status(401).json({ status: 401, message: "Access token not found." });
    try {
        verifyToken("access", accessToken);
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ status: 401, message: "Invalid access token." });
    }
};

const clearAuth = () => {};

// A middleware function to check if the client has a valid refresh token:
const requireRefreshToken = async (request, response, next) => {
    // Retrieve refresh token from a cookie named "refreshToken"
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) response.status(401).json({ status: 401, message: "Refresh token not found." });
    try {
        verifyToken("refresh", refreshToken);
        next();
    } catch (error) {
        console.error(error);
        return response.status(401).json({ status: 401, message: "Invalid refresh token." });
    }
};

const validateAuthHeader = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const header = request.headers.authorization;
        const token = header && header.split(" ")[1];
        
        // Check if the request contains a valid access token
        if (!header || token === null) {
            console.log(`${i}: User ${request.body.username} denied access to ${request.hostname}`);
            return response.status(401).json({ status: 401, message: "Unauthorized access." });
        }

        const decoded = await verifyToken("access", token);
        if (!decoded) {
            console.log(`${i}: The token has no permission to access ${request.hostname}`);
            return response.status(403).json({ status: 403, message: "No permission to access." });
        } else {
            request.user = decoded;
            next();
        }
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    } finally {
        request.app.locals.stats.authValidation++;
    }
};

const validateAccessCookie = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const token = request.cookies.access;
        if (token === "undefined") return response.status(400).json({ status: 400, message: "Unable to find token." });

        const decoded = await verifyToken("access", token);
        if (!decoded) {
            console.log(`${i}: The token has no permission to access ${request.hostname}`);
            return response.status(403).json({ status: 403, message: "No permission to access." });
        } else {
            request.user = decoded;
            next();
        }
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    } finally {
        request.app.locals.stats.authValidation++;
    }
};

const clearAuthTokens = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        const { token } = request.body;
        if (token === null) return response.sendStatus(401);
        if (!request.app.locals.refreshTokens.includes(token)) return response.status(403).json({ status: 403, message: "Forbidden. You need to sign in." });

        const decoded = await verifyToken("refresh", token);
        if (!decoded) {
            console.log(`${i}: The token has no permission to access ${request.hostname}`);
            return response.status(403).json({ status: 403, message: "No permission to access." });
        } else {
            const exists = request.app.locals.refreshTokens.indexOf(token);
            if (exists === -1) return response.status(400).json({ status: 400, message: "Unable to find token." });
            request.app.locals.refreshTokens.splice(exists,  1);
            console.log(`${i}: Details: Successfully removed authentication tokens.`);
            next();
        }
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
        // Set the access and refresh tokens as an HTTP headers, as well as cookies
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

const setCookies = (response, account) => {
    try {
        const accessTokenExpiry = "30m"; // Access token expires in 30 minutes
        const refreshTokenExpiry = "7d"; // Refresh token expires in 7 days
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
        throw Error("We could not setup cookies on the client machine for a reason or another!");
    }
};

const setHeaders = (response, account) => {
    response.set("Authorization", `Bearer ${account.accessToken}`);
    // response.set("Cache-Control", ``);
    // response.set("Content-Security-Policy", ``);
};

export {
    login,
    recover,
    register,
    requireAuth,
    clearAuth,
    requireRefreshToken,
    setupAuth,
    validateAuthHeader,
    validateAccessCookie,
    clearAuthTokens,
    clearAuthCookies
};