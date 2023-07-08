"use strict";

import {
    decode,
    tokenize,
    hashPassword,
    comparePasswords,
    verifyToken,
    getCookie,
    isEmptyObject,
    pad
} from "./helpers.mjs";
import { User, Subscriber, Client } from "./classes.mjs";

// Authentication and authorization
// Validate and authenticate tokens
const refreshTokens = [];

const login = async (request, response, next) => {
    try {
        const { username, email, password } = decode(request.app.locals.payload);
        if (!username || !email || !password) throw Error(`400. ${username}. ${email}. Missing required parameters. ${+ Date.now()}`);

        const existingAccount = await User._find(username, email);
        if (!existingAccount) throw Error(`403. ${username}. ${email}. We could not locate your account. ${+ Date.now()}`);
        if (!await comparePasswords(password, existingAccount.passwordHash)) throw Error(`401. ${username}. ${email}. Invalid password. ${+ Date.now()}`);

        const account = await User._populate(existingAccount.guid);
        if (!!account) {
            refreshTokens.push(await tokenize(account));
            request.app.locals.account = await account.records();
            return next();
        }
    } catch (error) {
        const i = request.app.locals.index;
        const [ status, username, email, message, time] = error.message.split(". ");
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        console.error(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/signin/login$ ${message}.`);
        return response.status(Number(status)).json({
            status: status,
            username: username,
            email: email,
            message: message,
            time: time
        });
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
        const { username, email, password, roles, permissions } = decode(request.app.locals.payload);
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

        refreshTokens.push(await tokenize(account));
        request.app.locals.account = await account.records();
        // console.log("request.app.locals.account from register();");
        // console.log(request.app.locals.account);
        next();
    } catch (error) {
        console.error(error);
        return clearAuthCookies(request, response, next);
    }
};

// A middleware function to check if the client is logged in or have active tokens
const requireAuth = async (request, response, next) => {
    const i = request.app.locals.index;
    try {
        const { accessToken = null, refreshToken = null } = request.app.locals.account;
        if (!accessToken && !refreshToken) {
            response.clearCookie("accessToken");
            response.clearCookie("refreshToken");
            throw Error(`${request.hostname}:${request.socket.remotePort} has been denied access to ${request.headers.host}${request.originalUrl}. Please proceed with either logging in or registering.`);
        }

        if (!(!!accessToken && typeof accessToken === "string") && !refreshToken) {
            console.log(`${+ Date.now()}-${pad(i, 5)}: We need to generate a new cookie...`);
            response.clearCookie("accessToken");
            throw Error(`The cookie necessary for accessing this resource is not present. Kindly refresh your browser to utilize the updated cookie.`);
        }

        if (!accessToken && !(!!refreshToken && typeof refreshToken === "string")) {
            response.clearCookie("refreshToken");
            throw Error(`The cookie necessary to obtain access is not present. Please proceed with either logging in or registering.`);
        }

        next();
    } catch (error) {
        console.error(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/requireAuth$ ${error.message.split(". ")[0]}.`);
        return response.status(401).json({ status: 401, message: error.message, time: + Date.now() });
    }
};

const readCookies = async (request, response, next) => {
    const i = request.app.locals.index;
    try {
        const account = request.app.locals.account;
        const cookies = request.headers.cookie;
        if (!cookies || (typeof cookies !== "string")) {
            request.app.locals.account = {};
            console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/readCookies$ The request is missing the necessary cookies to access private endpoints.`);
            return next();
        }

        let accessTokenIsValid = false, refreshTokenIsValid = false;
        const accessCookie = await getCookie("accessToken", cookies) || null;
        const refreshCookie = await getCookie("refreshToken", cookies) || null;

        if (!!accessCookie) {
            Object.defineProperty(account, "accessToken", {
                value: accessCookie,
                writable: true
            });
            accessTokenIsValid = await validToken({ type: "access", access: account.accessToken }, account);
        }

        if (!!refreshCookie) {
            Object.defineProperty(account, "refreshToken", {
                value: refreshCookie,
                writable: true
            });
            refreshTokenIsValid = await validToken({ type: "refresh", refresh: account.refreshToken }, account);
        }

        // console.log(JSON.stringify({
        //     access: accessTokenIsValid,
        //     refresh: refreshTokenIsValid
        // }, null, 2), "\r\n");

        if (!accessTokenIsValid && !refreshTokenIsValid) {
            request.app.locals.cookies = {};
            throw Error(`The provided cookies can not be used to access ${request.hostname}. Please `);
        } else if (!accessTokenIsValid && !!refreshTokenIsValid) {
            const exists = refreshTokens.indexOf(account.refreshToken);
            if (!!exists && exists !== -1) refreshTokens.splice(exists, 1);
            refreshTokens.push(await tokenize(account));
            setCookies(response, { accessToken: account.accessToken, refreshToken: account.refreshToken });
            request.app.locals.cookies.accessToken = account.accessToken;
            request.app.locals.cookies.refreshToken = account.refreshToken;
            console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/readCookies$ New access tokens have been generated...`);
            return next();
        }

        if (!!accessTokenIsValid) {
            configureObject(request.app.locals.cookies, "accessToken", account.accessToken);
            configureObject(request.app.locals.cookies, "refreshToken", account.refreshToken);
            next();
        } else {
            throw Error("Something is wrong!");
        }
    } catch (error) {
        console.error(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/readCookies$: ${error.message.split(". ")[0]}.`);
        return response.status(401).json({ status: 401, message: error.message, time: + Date.now() });
    } finally {
        request.app.locals.stats.authValidation++;
    }
};

const configureObject = (object, property, value) => {
    try {
        Object.defineProperty(object, property, {
            value: value,
            writable: true
        });
    } catch (error) {
        console.error(error);
    }
};

const validToken = async (token, account = null) => {
    try {
        let encoded, decoded;
        // const obj = (obj) => { obj.guid = null, obj.username = null, obj.email = null };
        if (token.type === "access" && !!token.access) encoded = token.access;
        if (token.type === "refresh" && !!token.refresh) encoded = token.refresh;
        if (!!encoded) decoded = await verifyToken(token);

        const { accountRecords = null, iat = null, exp = null } = decoded;

        if (!!decoded && !!accountRecords && !!account) {
            account.guid = accountRecords.guid;
            account.username = accountRecords.username;
            account.email = accountRecords.email;
            return true;
        } else (!decoded || isEmptyObject(decoded.accountRecords) || !accountRecords.guid || !accountRecords.username || !accountRecords.email) ? false : true;
    } catch (error) {
        console.error(error);
        // clearAuthCookies(request, response, next);
    }
};

const clearAuth = () => { };

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

        const decoded = verifyToken("access", token);
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
        if (!refreshTokens.includes(token)) return response.status(403).json({ status: 403, message: "Forbidden. You need to sign in." });

        const decoded = verifyToken("refresh", token);
        if (!decoded) {
            console.log(`${i}: The token has no permission to access ${request.hostname}`);
            return response.status(403).json({ status: 403, message: "No permission to access." });
        } else {
            const exists = refreshTokens.indexOf(token);
            if (!exists || exists === -1) return response.status(400).json({ status: 400, message: "Unable to find token." });
            refreshTokens.splice(exists, 1);
            console.log(`${i}: Details: Successfully removed authentication tokens.`);
            next();
        }
    } catch (error) {
        console.error(error);
    } finally {
        request.app.locals.stats.clearTokens++;
    }
};

const resetAuth = async (request, response, next) => {
    try {
        return clearAuthCookies(request, response, next);
    } catch (error) {
        console.error(error);
    } finally {
        request.app.locals.stats.resetAuth++;
    }
};

const clearAuthCookies = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");
        console.log(`${i}: Access and refresh tokens have been cleared from the browser.`);
        return clearAuthTokens(request, response, next);
    } catch (error) {
        console.error(error);
    } finally {
        request.app.locals.stats.clearCookies++;
    }
};

const setupAuth = (request, response, next) => {
    try {
        // Set the access and refresh tokens as an HTTP headers, as well as cookies
        const account = request.app.locals.account;
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
        throw Error("For some reason or another, we were unable to establish cookie setup on the client machine");
    }
};

const setHeaders = (response, account) => {
    response.setHeader("Authorization", `Bearer ${account.accessToken}`);
    response.setHeader("Cache-Control", `Max-Age=3600, must-revalidate`); // 3600 seconds = 1 hour
    response.setHeader("Content-Security-Policy", `default-src "self"`);
    // response.setHeader("Set-Cookie", `accessToken=${account.accessToken}; Max-Age=3600; Path=/; Expires=Wed, 05 Jul 2023 02:16:04 GMT; Secure`);
    // response.setHeader("Set-Cookie", `accessToken=${account.accessToken}, refreshToken=${account.refreshToken}; Max-Age=3600; Path=/; Expires=Wed, 05 Jul 2023 02:16:04 GMT; Secure`);
};

export {
    login,
    recover,
    register,
    requireAuth,
    clearAuth,
    setupAuth,
    validateAuthHeader,
    resetAuth,
    readCookies
};