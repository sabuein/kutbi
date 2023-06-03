"use strict";

import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: "./.env" });

let tempTokens = [];

const tokenize = (request, response, next) => {
    const token = request.body.token;
    if (token === null) return response.sendStatus(401);
    if (!tempTokens.includes(token)) return response.sendStatus(403);

    jwt.verify(token, process.env.refresh_token_secret, (error, user) => {
        if (error) return response.sendStatus(403);
        request.accessToken = generateAccessToken({ username: user.username });
        next();
    });
};

const deleteToken = (request, response, next) => {
    tempTokens = tempTokens.filter(token => token !== request.body.token);
    console.log("Token deleted");
    next();
};

const authorize = (request, response, next) => {
    const user = {
        username: request.body.username,
    };
    if (!user.username) return response.status(400).send("The 'username' parameter is missing");
    tempTokens.push(generateRefreshToken(user));
    request.accessToken = generateAccessToken(user);
    request.refreshToken = generateRefreshToken(user);
    next();
};

const authenticateToken = (request, response, next) => {
    const header = request.headers["authorization"];
    const token = header && header.split(" ")[1];
    // No token
    if (token === null) return response.sendStatus(401);
    jwt.verify(token, process.env.access_token_secret, (error, user) => {
        // Not valid
        if (error) return response.sendStatus(403);
        request.user = user;
        next();
    });
};

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.access_token_secret, { expiresIn: "15s" });
};

const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.refresh_token_secret);
};

export { authorize, authenticateToken, tokenize, deleteToken };