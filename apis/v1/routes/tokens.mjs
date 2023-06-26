"use strict";

import express from "express";
import cookieParser from "cookie-parser";
// import csrf from "csurf";
import { clearAuthCookies, requireRefreshToken } from "../modules/auth.mjs";

const tokens = express.Router();

const parseCookie = cookieParser();
// const checkCSRF = csrf({ cookie: true });

tokens
    .route("/")
    .post(clearAuthCookies, async (req, res) => {
        return res.json(req.user.toString());
    });

// Generate CSRF (Cross-Site Request Forgery) tokens
tokens
    .route("/csrf")
    .get(parseCookie, (request, response) => {
        const token = request;
        console.log(`@kutbi:~/todo$ Prevent CSRF attacks.`);
        /*
        response.clearCookie("_csrf");
        response.cookie("_csrf", token, {
            httpOnly: false,
            secure: true,
            maxAge: 3600000, // One hour in milliseconds
            signed: false
        });
        */
        return response.status(201).json({ status: 201, message: "@kutbi:~/todo$ Prevent CSRF attacks." });
    });

// A route to refresh the access token:
tokens
    .route("/refresh")
    .post(requireRefreshToken, (request, response) => {
    // Assuming the refresh token is valid, generate a new access token
    const user = { id: 123, username: "example" };
    const newAccessToken = jwt.sign(user, secretKey, { expiresIn: accessTokenExpiry });
  
    // Set the new access token as a cookie
    response.cookie("accessToken", newAccessToken, { httpOnly: true });
    response.sendStatus(200);
  });

export { tokens };