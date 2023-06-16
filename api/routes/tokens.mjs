"use strict";

import express from "express";
import cookieParser from "cookie-parser";
import csrf from "csurf";

const tokens = express.Router();

const parseCookie = cookieParser();
const checkCSRF = csrf({ cookie: true });

// Generate CSRF (Cross-Site Request Forgery) tokens
tokens
    .route("/csrf")
    .get(parseCookie, checkCSRF, (request, response) => {
        const token = request.csrfToken();
        console.log(`New CSRF token has been created.`);
        /*
        response.clearCookie("_csrf");
        response.cookie("_csrf", token, {
            httpOnly: false,
            secure: true,
            maxAge: 3600000, // One hour in milliseconds
            signed: false
        });
        */
        return response.status(201).json({ csrfToken: token });
    });

export { tokens };