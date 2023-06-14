"use strict";

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import csrf from "csurf";
import { User } from "../models/register.mjs";

dotenv.config({ path: "./.env" });

// Authentication and authorization
// Validate and authenticate tokens
// Generate CSRF (Cross-Site Request Forgery) tokens

let tempTokens = [];

const deleteToken = (request, response, next) => {
    const { refreshToken } = request.body;
    if (refreshToken === null) return response.sendStatus(401);
    if (!tempTokens.includes(refreshToken)) return response.status(403).json({ error: "Forbidden. You need to sign in." });

    jwt.verify(refreshToken, process.env.refresh_token_secret, (error, user) => {
        if (error) return response.status(403).json({ error: "Forbidden. You need to sign in." });
        const exists = tempTokens.indexOf(refreshToken);
        if (exists === -1) return response.status(400).json({ error: "Unable to find token" });
        tempTokens.splice(exists,  1);
        console.log("Successfully removed refresh token");
        next();
    });
};

const authCookie = async (request, response, next) => {
    const accessToken = request.cookies.accessToken;
    try {
        jwt.verify(accessToken, process.env.access_token_secret, (error, user) => {
            if (error) {
                console.log(`The token has no permission to access ${request.hostname}`);
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

const signup = async (request, response, next) => {
    const { username, email, password, roles, permissions } = request.body;
    if (!username || !email || !password) return response.status(400).json({ error: "Missing required parameters" });
    try {
        // Find the user by their username or email
        const existingUser = await User.find(username, email);
        if (existingUser) return response.status(403).json({ error: "Apologies for the inconvenience. The username and/or email you provided already exists in our records. Please consider using alternative details for registration, or if you already have a Kutbi account, kindly log in to access your existing account." });
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = new User({
            username: username,
            email: email,
            salt: salt,
            passwordHash: passwordHash,
            roles: roles,
            permissions: permissions
        });
        await user.save();
        request.user = user.limited();
        next();
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Server error" });
    }
};

const authenticate = async (request, response, next) => {
    const { username, email, password } = request.body;
    if (!(username && password) || !(email && password)) return response.status(400).json({ error: "Missing required parameters" });

    try {
        // Find the user by their username or email
        const user = await User.find(username, email);

        if (!user) return response.status(404).json({ error: "User not found" });

        // Compare the entered password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) return response.status(401).json({ error: "Invalid password" });
        request.user = user;
        next();
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Server error" });
    }
};

const authenticateToken = (request, response, next) => {
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

const generateAccessToken = (request, response, next) => {
    const accessToken = jwt.sign(request.user, process.env.access_token_secret, { expiresIn: "1h" });
    request.user.accessToken = accessToken;
    response.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: true,
        maxAge: 3600000, // One hour in milliseconds
        signed: false
    });
    response.set("Authorization", `Bearer ${accessToken}`);
    // response.set("Cache-Control", ``);
    // response.set("Content-Security-Policy", ``);
    next();
};

const generateRefreshToken = (request, response, next) => {
    const refreshToken = jwt.sign(request.user, process.env.refresh_token_secret);
    request.user.refreshToken = refreshToken;
    tempTokens.push(refreshToken);
    response.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: true,
        maxAge: 2629800000, // One month in milliseconds
        signed: false
    });
    next();
};

export { authCookie, authenticate, authenticateToken, deleteToken, signup, generateAccessToken, generateRefreshToken };